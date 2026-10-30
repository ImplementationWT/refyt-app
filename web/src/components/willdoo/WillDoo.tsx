import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUp, History, Loader2, Plus, Square, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useLocation } from "react-router";
import { useSession } from "../../auth/session";
import { api, ApiError } from "../../lib/api";
import { cn, formatDateTime } from "../../lib/utils";
import {
  askWillDoo,
  currentScreen,
  type WillDooConversation,
  type WillDooConversationSummary,
  type WillDooTurn
} from "../../lib/willdoo";
import { IconButton } from "../ui/button";
import { Markdown } from "./Markdown";
import { WillDooAvatar as Avatar, WillDooLauncher, WillDooPanel } from "./parts";

const CONVERSATIONS_KEY = ["willdoo", "conversations"] as const;

/** Questions that make sense with the user's permissions (no tool → no suggestion). */
function suggestionsFor(can: (permission: string) => boolean): string[] {
  const all: Array<[string | null, string]> = [
    ["dashboard.read", "¿Cuántas personas entraron esta semana?"],
    ["users.read", "¿Qué usuarios están desactivados o bloqueados?"],
    ["audit.read", "¿Hubo ingresos fallidos hoy?"],
    ["notifications.read", "¿Tengo notificaciones sin leer?"],
    [null, "¿Cómo cambio mi contraseña?"]
  ];
  return all.filter(([permission]) => permission === null || can(permission)).map(([, text]) => text).slice(0, 4);
}


interface Live {
  text: string;
  tool: string | null;
}

/**
 * Will Doo + Claude: a floating button and a chat panel (full screen on
 * phones). It answers with the user's data, within their permissions, and
 * knows which screen is open. Only shown when the backend enables the feature.
 */
export function WillDooChat() {
  const { session, can } = useSession();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"chat" | "history">("chat");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [turns, setTurns] = useState<WillDooTurn[]>([]);
  const [live, setLive] = useState<Live | null>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const history = useQuery({
    queryKey: CONVERSATIONS_KEY,
    queryFn: () => api<{ items: WillDooConversationSummary[] }>("/api/willdoo/conversations"),
    enabled: open && view === "history"
  });

  useEffect(() => {
    const list = scrollRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [turns, live]);
  useEffect(() => {
    if (open && view === "chat") inputRef.current?.focus();
  }, [open, view]);
  // Closing the panel stops an answer in progress (and its cost).
  useEffect(() => () => abortRef.current?.abort(), []);

  const busy = live !== null;
  const firstName = session?.user.displayName.split(" ")[0] ?? "";

  function newConversation() {
    abortRef.current?.abort();
    setConversationId(null);
    setTurns([]);
    setLive(null);
    setError(null);
    setView("chat");
  }

  async function openConversation(id: string) {
    setError(null);
    try {
      const conversation = await api<WillDooConversation>(`/api/willdoo/conversations/${id}`);
      setConversationId(conversation.id);
      setTurns(conversation.turns);
      setView("chat");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "No se pudo abrir la conversación.");
    }
  }

  async function removeConversation(id: string) {
    await api(`/api/willdoo/conversations/${id}`, { method: "DELETE" }).catch(() => undefined);
    if (id === conversationId) newConversation();
    await queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
  }

  async function send(text: string) {
    const question = text.trim();
    if (!question || busy) return;
    setDraft("");
    setError(null);
    setTurns((previous) => [...previous, { role: "user", text: question, tools: [], at: new Date().toISOString() }]);
    setLive({ text: "", tool: null });
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      await askWillDoo(
        { text: question, screen: currentScreen(location.pathname), ...(conversationId ? { conversationId } : {}) },
        (event) => {
          if (event.type === "start") setConversationId(event.conversationId);
          else if (event.type === "text") setLive((current) => ({ text: (current?.text ?? "") + event.delta, tool: null }));
          else if (event.type === "tool") setLive((current) => ({ text: current?.text ?? "", tool: event.label }));
          else if (event.type === "done") {
            setTurns((previous) => [...previous, event.turn]);
            setLive(null);
          } else if (event.type === "error") {
            setError(event.message);
            setLive(null);
          }
        },
        controller.signal
      );
    } catch (caught) {
      if (!controller.signal.aborted) {
        setError(caught instanceof ApiError ? caught.message : "Will Doo no pudo responder. Inténtalo de nuevo.");
      }
    } finally {
      setLive(null);
      abortRef.current = null;
      void queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void send(draft);
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void send(draft);
    }
  }

  if (!open) return <WillDooLauncher onOpen={() => setOpen(true)} />;

  return (
    <WillDooPanel
      subtitle="Tu co-pilot · consulta con tus permisos"
      actions={
        <>
        <IconButton size="sm" aria-label={view === "history" ? "Volver al chat" : "Conversaciones anteriores"} onClick={() => setView(view === "history" ? "chat" : "history")}>
          <History />
        </IconButton>
        <IconButton size="sm" aria-label="Nueva conversación" onClick={newConversation}>
          <Plus />
        </IconButton>
        <IconButton
          size="sm"
          aria-label="Cerrar Will Doo"
          onClick={() => {
            abortRef.current?.abort();
            setOpen(false);
          }}
        >
          <X />
        </IconButton>
        </>
      }
    >

      {view === "history" ? (
        <div className="flex-1 overflow-y-auto p-3">
          {history.isPending ? (
            <p role="status" className="p-3 text-sm text-muted">
              Cargando…
            </p>
          ) : history.data?.items.length ? (
            <ul className="space-y-1">
              {history.data.items.map((item) => (
                <li key={item.id} className="group flex items-center gap-1 rounded-btn hover:bg-n-25">
                  <button type="button" onClick={() => void openConversation(item.id)} className="min-w-0 flex-1 px-3 py-2 text-left">
                    <span className="block truncate text-sm font-semibold">{item.title}</span>
                    <span className="block text-xs text-muted">{formatDateTime(item.updatedAt)}</span>
                  </button>
                  <IconButton size="sm" aria-label={`Borrar «${item.title}»`} onClick={() => void removeConversation(item.id)}>
                    <Trash2 />
                  </IconButton>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-3 text-sm text-muted">Aún no tienes conversaciones. Se guardan 90 días.</p>
          )}
        </div>
      ) : (
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4" aria-live="polite">
          {turns.length === 0 && !busy ? (
            <div className="space-y-3">
              <div className="flex gap-2.5">
                <Avatar className="size-7" />
                <p className="rounded-btn rounded-tl-[6px] bg-n-25 px-3.5 py-2.5 text-[14.5px]">
                  Hola{firstName ? `, ${firstName}` : ""}. Soy Will Doo: pregúntame por los datos del sistema o cómo hacer algo. Solo veo lo
                  que tú puedes ver.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 pl-9">
                {suggestionsFor(can).map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => void send(suggestion)}
                    className="rounded-btn border border-line bg-surface px-3 py-1.5 text-left text-[13px] font-semibold text-brand-700 transition-colors hover:border-brand-200 hover:bg-brand-25"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {turns.map((turn, index) =>
            turn.role === "user" ? (
              <p key={index} className="ml-auto w-fit max-w-[85%] rounded-btn rounded-tr-[6px] bg-brand-600 px-3.5 py-2 text-[14.5px] whitespace-pre-wrap text-on-brand">
                {turn.text}
              </p>
            ) : (
              <div key={index} className="flex gap-2.5">
                <Avatar className="size-7" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="rounded-btn rounded-tl-[6px] bg-n-25 px-3.5 py-2.5 text-[14.5px]">
                    <Markdown text={turn.text || "…"} />
                  </div>
                  {turn.tools.length ? <p className="text-xs text-faint">Consultó: {turn.tools.map((tool) => tool.replace(/^Consultando\s+/i, "")).join(", ")}</p> : null}
                </div>
              </div>
            )
          )}

          {live ? (
            <div className="flex gap-2.5">
              <Avatar className="size-7" />
              <div className="min-w-0 flex-1 rounded-btn rounded-tl-[6px] bg-n-25 px-3.5 py-2.5 text-[14.5px]">
                {live.text ? <Markdown text={live.text} /> : null}
                <p role="status" className={cn("flex items-center gap-2 text-sm text-muted", live.text && "mt-2")}>
                  <Loader2 className="size-4 animate-spin text-brand-500" aria-hidden />
                  {live.tool ? `${live.tool}…` : live.text ? "Escribiendo…" : "Pensando…"}
                </p>
              </div>
            </div>
          ) : null}

          {error ? (
            <p role="alert" className="rounded-btn border border-danger-100 bg-danger-25 px-3.5 py-2.5 text-sm text-danger-700">
              {error}
            </p>
          ) : null}
        </div>
      )}

      {view === "chat" ? (
        <form onSubmit={onSubmit} className="border-t border-line p-3">
          <div className="flex items-end gap-2 rounded-field border-[1.5px] border-line-2 bg-surface px-3 py-2 focus-within:border-brand-400">
            <textarea
              ref={inputRef}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              maxLength={4000}
              placeholder="Pregúntale a Will…"
              aria-label="Pregunta para Will Doo"
              className="max-h-32 min-h-6 flex-1 resize-none bg-transparent text-[14.5px] outline-none placeholder:text-faint"
            />
            {busy ? (
              <IconButton size="sm" aria-label="Detener respuesta" onClick={() => abortRef.current?.abort()}>
                <Square />
              </IconButton>
            ) : (
              <button
                type="submit"
                aria-label="Enviar pregunta"
                disabled={!draft.trim()}
                className="grid size-8 shrink-0 place-items-center rounded-tile bg-brand-600 text-on-brand transition-colors hover:bg-brand-700 disabled:opacity-40 [&_svg]:size-4"
              >
                <ArrowUp />
              </button>
            )}
          </div>
          <p className="mt-1.5 text-center text-[11.5px] text-faint">Will solo consulta, no cambia nada. Puede equivocarse: revisa los enlaces.</p>
        </form>
      ) : null}
    </WillDooPanel>
  );
}
