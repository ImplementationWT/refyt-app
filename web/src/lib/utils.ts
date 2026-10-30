import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Color families of the design system (see .tone-* in index.css). */
export type Tone =
  | "brand"
  | "green"
  | "amber"
  | "red"
  | "violet"
  | "blue"
  | "teal"
  | "pink"
  | "orange"
  | "neutral";

const AVATAR_TONES: Tone[] = ["brand", "green", "violet", "blue", "teal", "pink", "orange", "amber"];

/** Stable tone for a person or entity, derived from a seed (id or name). */
export function toneFor(seed: string): Tone {
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return AVATAR_TONES[hash % AVATAR_TONES.length]!;
}

export function initials(name: string): string {
  const parts = name.trim().split(/[\s._-]+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0]![0]! + parts[1]![0]! : (parts[0] ?? "?").slice(0, 2);
  return letters.toUpperCase();
}


const dateTime = new Intl.DateTimeFormat("en-GB", { dateStyle: "short", timeStyle: "short" });

export function formatDateTime(value: string | null | undefined): string {
  return value ? dateTime.format(new Date(value)) : "—";
}


