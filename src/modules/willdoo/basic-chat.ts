import { SYSTEM_GUIDE } from "./context.js";
import type { QuickQuery } from "./quick.js";

/**
 * Chat of «Will Doo solo», without AI: it recognises what the user asks with
 * keywords, answers with a quick query (data from the database, with the user's
 * permissions) or with the usage guide, and never makes data up. Forecasts and
 * analysis need Claude: it says so and shows what there is.
 *
 * Texts in COPY so each project can translate them (the app's language).
 */
export const COPY = {
  answer: "Esto es lo que hay en el sistema:",
  partial: "No tengo exactamente eso, pero esto es lo más cercano que hay en el sistema:",
  guide: "Según la guía de uso:",
  analytics:
    "Sin la conexión con Claude no hago pronósticos, tendencias ni análisis. Te muestro los datos que hay hoy sobre eso; para analizarlos se necesita «Will Doo + Claude».",
  analyticsNoData:
    "Sin la conexión con Claude no hago pronósticos, tendencias ni análisis, y no encontré datos sobre eso. Para analizar se necesita «Will Doo + Claude». Esto sí puedo responderte:",
  noMatch: "No encontré datos sobre eso. Solo respondo con lo que hay en el sistema y con tus permisos. Puedo responderte esto:",
  empty: "Escribe una pregunta o elige una de la lista."
};

/** Words that ask for a forecast or analysis (accents removed, prefixes). */
const ANALYTICS = [
  "pronostic", "proyecc", "proyect", "predic", "prever", "estimac", "estima", "tendencia", "analiz", "analisis", "compar",
  "por que", "porque", "futuro", "proximo mes", "proximo ano", "crecimiento", "evolucion", "forecast", "predict", "trend",
  "analy", "compare", "why", "estimate", "projection", "growth", "next month", "next year"
];

/** «How do I…» questions: answered with the guide first. */
const HOW_TO = ["como", "donde", "que es", "para que", "puedo", "how", "where", "what is", "can i"];

const STOPWORDS = new Set(
  (
    "a al algo algun alguna algunos ante con de del el ella en entre era es esa ese eso esta estan estas este esto hay la las le les lo los me mi mis muy " +
    "no nos o para pero por que se si sin sobre son su sus te tengo tiene tienen tu tus un una uno unos y ya yo cual cuales cuanto cuantos cuantas quien quienes " +
    "the a an and are is of to in on for with what which who how many much do does did i my me we our there any it this that be have has show tell give please"
  ).split(" ")
);

/** Lowercase, no accents, no punctuation. */
export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Light stemming: plurals and feminine/masculine endings count as the same word. */
function stem(word: string): string {
  let out = word;
  if (out.length > 4 && out.endsWith("es")) out = out.slice(0, -2);
  else if (out.length > 3 && out.endsWith("s")) out = out.slice(0, -1);
  if (out.length > 4 && /[aoe]$/.test(out)) out = out.slice(0, -1);
  return out;
}

export function tokens(text: string): string[] {
  return normalize(text)
    .split(" ")
    .filter((word) => word && !STOPWORDS.has(word))
    .map(stem);
}

/**
 * How well a query matches the question: whole keyword phrases weigh more than
 * loose words. `covered` are the question's words its keywords matched.
 */
function match(words: ReadonlySet<string>, query: Pick<QuickQuery, "keywords" | "label" | "question">): { points: number; covered: Set<string> } {
  const covered = new Set<string>();
  let points = 0;
  for (const keyword of query.keywords) {
    const parts = tokens(keyword);
    if (!parts.length || !parts.every((part) => words.has(part))) continue;
    // A phrase reduced to one word by the stopwords ("cuántos usuarios" → "usuarios") is too generic.
    const generic = parts.length === 1 && normalize(keyword).includes(" ");
    points += generic ? 0.5 : parts.length > 1 ? 2 * parts.length : 2;
    for (const part of parts) covered.add(part);
  }
  // A little from the label and the question itself, so new queries match without keywords.
  const extra = new Set([...tokens(query.label), ...tokens(query.question)]);
  for (const word of words) if (extra.has(word)) points += 0.5;
  return { points, covered };
}

export function score(question: string, query: Pick<QuickQuery, "keywords" | "label" | "question">): number {
  return match(new Set(tokens(question)), query).points;
}

const includesAny = (text: string, needles: readonly string[]) => {
  const normal = ` ${normalize(text)} `;
  return needles.some((needle) => normal.includes(` ${needle}`));
};

/** Lines of the guide that best match the question (up to 3). */
export function guideLines(question: string, guide = SYSTEM_GUIDE): string[] {
  const words = new Set(tokens(question));
  return guide
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => ({ line, hits: tokens(line).filter((word) => words.has(word)).length }))
    .filter((entry) => entry.hits > 0)
    .sort((a, b) => b.hits - a.hits)
    .slice(0, 3)
    .map((entry) => entry.line);
}

/**
 * `query` is the main answer and `more` the other topics of the same question.
 * A `partial` answer is the closest data there is; `alternatives` are the other
 * candidates, suggested first.
 */
export type BasicIntent =
  | { kind: "answer"; query: QuickQuery; more: QuickQuery[]; partial: boolean; alternatives: QuickQuery[]; message: string }
  | { kind: "analytics"; query: QuickQuery | null; more: QuickQuery[]; message: string }
  | { kind: "guide"; lines: string[]; message: string }
  | { kind: "none"; message: string };

/** Minimum score for a confident match, and the margin over the second best. */
const CONFIDENT = 2;
const MARGIN = 1;
/** Below this, a match is too weak even to show it as the closest data. */
const CLOSEST = 1;
/** Topics answered at most for one question. */
const MAX_TOPICS = 3;

/** Is the query meant for this screen? "/" only matches the home page. */
export function onScreen(query: Pick<QuickQuery, "screens">, path: string | undefined): boolean {
  if (!path) return false;
  return (query.screens ?? []).some((prefix) => (prefix === "/" ? path === "/" : path === prefix || path.startsWith(`${prefix}/`)));
}

/**
 * Decides how to answer a typed question with the queries the user may run.
 * The rule: if the database has data about it, answer with it; if it only
 * covers part of the question, answer that part. Never chooses a query that is
 * not in `available` (permissions already applied).
 */
export function understand(question: string, available: readonly QuickQuery[], guide = SYSTEM_GUIDE, screenPath?: string): BasicIntent {
  const words = new Set(tokens(question));
  if (!words.size) return { kind: "none", message: COPY.empty };
  const ranked = available
    .map((query) => {
      const { points, covered } = match(words, query);
      // The open screen breaks ties, but never creates a match on its own.
      return { query, covered, points: points > 0 && onScreen(query, screenPath) ? points + 1 : points };
    })
    .filter((entry) => entry.points > 0)
    .sort((a, b) => b.points - a.points);
  const best = ranked[0];
  const strong = best && best.points >= CONFIDENT;

  // Other topics of the same question («leads y facturas»): strong matches that cover words the previous ones didn't.
  const picks = strong ? [best] : [];
  const covered = new Set(best?.covered);
  for (const entry of strong ? ranked.slice(1) : []) {
    if (picks.length >= MAX_TOPICS || entry.points < CONFIDENT) break;
    if (![...entry.covered].some((word) => !covered.has(word))) continue;
    picks.push(entry);
    for (const word of entry.covered) covered.add(word);
  }
  const more = picks.slice(1).map((entry) => entry.query);
  // Sure: a clear winner, or the runner-up is another topic that is answered too.
  const second = ranked[1];
  const confident = strong && (!second || picks.includes(second) || best.points - second.points >= MARGIN);

  if (includesAny(question, ANALYTICS)) {
    // Related data only with a real match: one loose word is not enough.
    return strong
      ? { kind: "analytics", query: best.query, more, message: COPY.analytics }
      : { kind: "analytics", query: null, more: [], message: COPY.analyticsNoData };
  }
  const lines = guideLines(question, guide);
  if (includesAny(question, HOW_TO) && lines.length && !confident) return { kind: "guide", lines, message: COPY.guide };
  if (best && best.points >= CLOSEST) {
    // Not sure (a weak match, or a tie): the closest data, with the other candidates suggested first.
    const alternatives = confident
      ? []
      : ranked
          .filter((entry) => entry !== best && !picks.includes(entry) && entry.points >= CLOSEST && (!strong || best.points - entry.points < MARGIN))
          .slice(0, 2)
          .map((entry) => entry.query);
    const partial = !strong || alternatives.length > 0;
    return { kind: "answer", query: best.query, more, partial, alternatives, message: partial ? COPY.partial : COPY.answer };
  }
  if (lines.length) return { kind: "guide", lines, message: COPY.guide };
  return { kind: "none", message: COPY.noMatch };
}

/**
 * The 3 follow-ups after answering `current`: `first` (other candidates), its
 * own `next`, the open screen's queries, then the roadmap order. Always among
 * the queries the user may run, and never one in `skip` (already shown).
 */
export function followUps(
  current: QuickQuery | null,
  available: readonly QuickQuery[],
  count = 3,
  screenPath?: string,
  { first = [], skip = [] }: { first?: readonly QuickQuery[]; skip?: readonly QuickQuery[] } = {}
): QuickQuery[] {
  const byId = new Map(available.map((query) => [query.id, query]));
  const shown = new Set([current?.id, ...skip.map((query) => query.id)]);
  const picked: QuickQuery[] = [];
  const candidates = [
    ...first.map((query) => query.id),
    ...(current?.next ?? []),
    ...available.filter((query) => onScreen(query, screenPath)).map((query) => query.id),
    ...available.map((query) => query.id)
  ];
  for (const id of candidates) {
    if (picked.length >= count) break;
    const query = byId.get(id);
    if (query && !shown.has(query.id) && !picked.includes(query)) picked.push(query);
  }
  return picked;
}
