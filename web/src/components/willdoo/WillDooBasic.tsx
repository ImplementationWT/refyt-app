import { useQuery } from "@tanstack/react-query";
import { ArrowUp, BookOpen, ExternalLink, Loader2, MessagesSquare, Plus, RefreshCw, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { Link, useLocation } from "react-router";
import { useSession } from "../../auth/session";
import { api, ApiError } from "../../lib/api";
import { cn, formatDateTime } from "../../lib/utils";
import { currentScreen } from "../../lib/willdoo";
import { IconButton } from "../ui/button";
import { isSafeWillDooLink, Markdown } from "./Markdown";
import { WillDooAvatar, WillDooLauncher, WillDooPanel } from "./parts";

interface Suggestion {
  id: string;
  label: string;
  question: string;
}

interface QuickSummary extends Suggestion {
  description: string;
  group: string;
  /** Screens where it is most relevant (route prefixes). */
  screens?: string[];
}

/** Same rule as the backend: "/" only matches the home page. */
const onScreen = (item: QuickSummary, path: string) =>
  (item.screens ?? []).some((prefix) => (prefix === "/" ? path === "/" : path === prefix || path.startsWith(`${prefix}/`)));

interface QuickItem {
  title: string;
  subtitle?: string | null;
  meta?: string | null;
  link?: string | null;
}

interface QuickResult extends Suggestion {
  summary: string;
  items: QuickItem[];
  link?: string | null;
  at: string;
}

/** What /api/willdoo/basic and /api/willdoo/quick/:id answer. */
interface BasicAnswer {
  kind?: "answer" | "analytics" | "guide" | "none";
  message?: string;
  result?: QuickResult;
  /** The other topics of the same question. */
  more?: QuickResult[];
  guide?: string[];
  suggestions: Suggestion[];
}

type Message = { role: "user"; text: string } | { role: "will"; answer: BasicAnswer } | { role: "error"; text: string };

const timeZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return undefined;
  }
};

/** Link to a route of the app or to monday.com; anything else is not a link. */
function SafeLink({ href, className, children }: { href: string | null | undefined; className?: string; children: ReactNode }) {
  if (!href || !isSafeWillDooLink(href)) return <span className={className}>{children}</span>;
  return href.startsWith("/") ? (
    <Link to={href} className={className}>
      {children}
    </Link>
  ) : (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
}

function ResultCard({ result, onRefresh }: { result: QuickResult; onRefresh: () => void }) {
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-bold">{result.summary}</p>
          <p className="text-xs text-faint">
            {result.label} · datos de {formatDateTime(result.at)}
          </p>
        </div>
        <IconButton size="sm" aria-label="Actualizar consulta" onClick={onRefresh}>
          <RefreshCw />
        </IconButton>
      </div>
      {result.items.length ? (
        <ul className="divide-y divide-line rounded-btn border border-line bg-surface">
          {result.items.map((item, index) => (
            <li key={index} className="px-3 py-2">
              <SafeLink href={item.link} className={cn("block", item.link && "group")}>
                <span className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0 truncate text-sm font-semibold group-hover:text-brand-700">{item.title}</span>
                  {item.meta && !item.subtitle ? <span className="shrink-0 text-sm font-bold tabular-nums">{item.meta}</span> : null}
                </span>
                {item.subtitle ? <span className="block truncate text-[13px] text-muted">{item.subtitle}</span> : null}
                {item.meta && item.subtitle ? <span className="block text-xs text-faint">{item.meta}</span> : null}
              </SafeLink>
            </li>
          ))}
        </ul>
      ) : null}
      {result.link ? (
        <SafeLink href={result.link} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline [&_svg]:size-4">
          Ver en la app <ExternalLink aria-hidden />
        </SafeLink>
      ) : null}
    </div>
  );
}

function Chips({ title, items, disabled, onPick }: { title?: string; items: Suggestion[]; disabled: boolean; onPick: (item: Suggestion) => void }) {
  if (!items.length) return null;
  return (
    <div className="space-y-1.5 pl-9">
      {title ? <p className="text-xs font-semibold text-faint">{title}</p> : null}
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            disabled={disabled}
            onClick={() => onPick(item)}
            className="rounded-btn border border-line bg-surface px-3 py-1.5 text-left text-[13px] font-semibold text-brand-700 transition-colors hover:border-brand-200 hover:bg-brand-25 disabled:opacity-50"
          >
            {item.question}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * «Will Doo solo»: informative, without AI and at no cost. A roadmap of
 * questions grouped by topic, 3 follow-ups after each answer, and a chat that
 * answers only with the database (or the usage guide), within the user's
 * permissions. Forecasts and analysis need «Will Doo + Claude».
 */
export function WillDooBasic() {
  const { session } = useSession();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"chat" | "guide">("chat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const list = useQuery({
    queryKey: ["willdoo", "quick"],
    queryFn: () => api<{ items: QuickSummary[] }>("/api/willdoo/quick"),
    enabled: open
  });
  const guide = useQuery({
    queryKey: ["willdoo", "guide"],
    queryFn: () => api<{ guide: string }>("/api/willdoo/guide"),
    enabled: open && tab === "guide",
    staleTime: 10 * 60_000
  });

  useEffect(() => {
    const element = scrollRef.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [messages, busy]);

  if (!open) return <WillDooLauncher onOpen={() => setOpen(true)} />;

  async function exchange(userText: string, request: () => Promise<BasicAnswer>) {
    if (busy) return;
    setMessages((previous) => [...previous, { role: "user", text: userText }]);
    setBusy(true);
    try {
      const answer = await request();
      setMessages((previous) => [...previous, { role: "will", answer }]);
    } catch (error) {
      setMessages((previous) => [...previous, { role: "error", text: error instanceof ApiError ? error.message : "No se pudo responder. Inténtalo de nuevo." }]);
    } finally {
      setBusy(false);
    }
  }

  const runQuery = (item: Suggestion) =>
    void exchange(item.question, () =>
      api<QuickResult & { suggestions: Suggestion[] }>(`/api/willdoo/quick/${encodeURIComponent(item.id)}`, {
        method: "POST",
        body: { timeZone: timeZone(), screen: { path: currentScreen(location.pathname).path } }
      }).then(
        ({ suggestions, ...result }) => ({ kind: "answer", result, suggestions })
      )
    );

  const ask = (text: string) => {
    const question = text.trim();
    if (!question) return;
    setDraft("");
    void exchange(question, () =>
      api<BasicAnswer>("/api/willdoo/basic", { method: "POST", body: { text: question, timeZone: timeZone(), screen: { path: currentScreen(location.pathname).path } } })
    );
  };

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    ask(draft);
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      ask(draft);
    }
  }

  // Roadmap: the questions the user may ask, by topic, in order; the open screen's topics first.
  const items = list.data?.items ?? [];
  const ordered = [...items.filter((item) => onScreen(item, location.pathname)), ...items.filter((item) => !onScreen(item, location.pathname))];
  const groups = new Map<string, QuickSummary[]>();
  for (const item of ordered) groups.set(item.group, [...(groups.get(item.group) ?? []), item]);
  const lastWill = [...messages].reverse().find((message) => message.role === "will");
  const firstName = session?.user.displayName.split(" ")[0] ?? "";

  return (
    <WillDooPanel
      subtitle="Respuestas con tus datos · sin IA"
      actions={
        <>
          <IconButton size="sm" aria-label="Empezar de nuevo" onClick={() => setMessages([])} disabled={busy}>
            <Plus />
          </IconButton>
          <IconButton size="sm" aria-label="Cerrar Will Doo" onClick={() => setOpen(false)}>
            <X />
          </IconButton>
        </>
      }
    >
      <div role="tablist" aria-label="Will Doo" className="flex gap-1 border-b border-line px-3 pt-2">
        {(
          [
            ["chat", "Preguntas", MessagesSquare],
            ["guide", "Cómo se usa", BookOpen]
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn(
              "flex items-center gap-1.5 border-b-2 px-3 py-2 text-[13.5px] font-semibold transition-colors [&_svg]:size-4",
              tab === id ? "border-brand-600 text-brand-700" : "border-transparent text-muted hover:text-ink"
            )}
          >
            <Icon aria-hidden />
            {label}
          </button>
        ))}
      </div>

      {tab === "guide" ? (
        <div className="flex-1 overflow-y-auto px-4 py-4 text-[14.5px]">
          {guide.isPending ? (
            <p role="status" className="text-sm text-muted">
              Cargando…
            </p>
          ) : guide.data ? (
            <Markdown text={guide.data.guide} />
          ) : (
            <p role="alert" className="text-sm text-danger-700">
              No se pudo cargar la guía.
            </p>
          )}
        </div>
      ) : (
        <>
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4" aria-live="polite">
            <div className="flex gap-2.5">
              <WillDooAvatar className="size-7" />
              <p className="rounded-btn rounded-tl-[6px] bg-n-25 px-3.5 py-2.5 text-[14.5px]">
                Hola{firstName ? `, ${firstName}` : ""}. Soy Will Doo: elige una pregunta o escríbela, y te respondo con los datos del sistema que tú puedes ver.
              </p>
            </div>

            {messages.length === 0 ? (
              list.isPending ? (
                <p role="status" className="pl-9 text-sm text-muted">
                  Cargando…
                </p>
              ) : groups.size ? (
                [...groups].map(([group, items]) => <Chips key={group} title={group} items={items} disabled={busy} onPick={runQuery} />)
              ) : (
                <p className="pl-9 text-sm text-muted">{list.isError ? "No se pudieron cargar las preguntas." : "No hay preguntas disponibles con tus permisos."}</p>
              )
            ) : null}

            {messages.map((message, index) =>
              message.role === "user" ? (
                <p key={index} className="ml-auto w-fit max-w-[85%] rounded-btn rounded-tr-[6px] bg-brand-600 px-3.5 py-2 text-[14.5px] whitespace-pre-wrap text-on-brand">
                  {message.text}
                </p>
              ) : message.role === "error" ? (
                <p key={index} role="alert" className="rounded-btn border border-danger-100 bg-danger-25 px-3.5 py-2.5 text-sm text-danger-700">
                  {message.text}
                </p>
              ) : (
                <div key={index} className="space-y-2">
                  <div className="flex gap-2.5">
                    <WillDooAvatar className="size-7" />
                    <div className="min-w-0 flex-1 space-y-2 rounded-btn rounded-tl-[6px] bg-n-25 px-3.5 py-2.5 text-[14.5px]">
                      {message.answer.message ? <p>{message.answer.message}</p> : null}
                      {message.answer.guide?.length ? <Markdown text={message.answer.guide.join("\n")} /> : null}
                      {[message.answer.result, ...(message.answer.more ?? [])].map((result) =>
                        result ? <ResultCard key={result.id} result={result} onRefresh={() => runQuery(result)} /> : null
                      )}
                    </div>
                  </div>
                  {/* Follow-ups only under the latest answer. */}
                  {message === lastWill ? (
                    <Chips title="Sigue con" items={message.answer.suggestions} disabled={busy} onPick={runQuery} />
                  ) : null}
                </div>
              )
            )}

            {busy ? (
              <p role="status" className="flex items-center gap-2 pl-9 text-sm text-muted">
                <Loader2 className="size-4 animate-spin text-brand-500" aria-hidden /> Buscando en los datos…
              </p>
            ) : null}
          </div>

          <form onSubmit={onSubmit} className="border-t border-line p-3">
            <div className="flex items-end gap-2 rounded-field border-[1.5px] border-line-2 bg-surface px-3 py-2 focus-within:border-brand-400">
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={onKeyDown}
                rows={1}
                maxLength={500}
                placeholder="Escribe tu pregunta…"
                aria-label="Pregunta para Will Doo"
                className="max-h-32 min-h-6 flex-1 resize-none bg-transparent text-[14.5px] outline-none placeholder:text-faint"
              />
              <button
                type="submit"
                aria-label="Enviar pregunta"
                disabled={!draft.trim() || busy}
                className="grid size-8 shrink-0 place-items-center rounded-tile bg-brand-600 text-on-brand transition-colors hover:bg-brand-700 disabled:opacity-40 [&_svg]:size-4"
              >
                <ArrowUp />
              </button>
            </div>
            <p className="mt-1.5 text-center text-[11.5px] text-faint">Solo responde con los datos que existen; sin pronósticos ni análisis.</p>
          </form>
        </>
      )}
    </WillDooPanel>
  );
}
