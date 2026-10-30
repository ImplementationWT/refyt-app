import { useEffect } from "react";
import { ApiError } from "./api";

// Shapes of /api/willdoo (see docs/TEMPLATE_CONTRACT.md §7).

export interface WillDooTurn {
  role: "user" | "assistant";
  text: string;
  tools: string[];
  at: string;
}

export interface WillDooConversationSummary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface WillDooConversation extends WillDooConversationSummary {
  turns: WillDooTurn[];
}

export type WillDooEvent =
  | { type: "start"; conversationId: string }
  | { type: "text"; delta: string }
  | { type: "tool"; name: string; label: string }
  | { type: "done"; conversationId: string; turn: WillDooTurn }
  | { type: "error"; error: string; message: string };

export interface WillDooScreen {
  path: string;
  title?: string;
  recordId?: string;
}

export interface AskBody {
  conversationId?: string;
  text: string;
  screen?: WillDooScreen;
}

const timeZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return undefined;
  }
};

/**
 * Sends a question and reads the answer as it is written (one JSON event per
 * line). Errors before the stream starts (budget, limits, permissions) arrive
 * as an ApiError like any other request.
 */
export async function askWillDoo(body: AskBody, onEvent: (event: WillDooEvent) => void, signal?: AbortSignal): Promise<void> {
  let response: Response;
  try {
    response = await fetch("/api/willdoo/messages", {
      method: "POST",
      credentials: "same-origin",
      headers: { Accept: "application/x-ndjson", "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, timeZone: timeZone() }),
      ...(signal ? { signal } : {})
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new ApiError(0, "network_error", "Could not connect to the server");
  }

  if (!response.ok || !response.body) {
    const data = (await response.json().catch(() => null)) as { error?: string; message?: string } | null;
    throw new ApiError(response.status, data?.error ?? "error", data?.message ?? "Will Doo could not answer. Try again.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (value) buffer += decoder.decode(value, { stream: true });
    let newline = buffer.indexOf("\n");
    while (newline !== -1) {
      const line = buffer.slice(0, newline).trim();
      buffer = buffer.slice(newline + 1);
      if (line) onEvent(JSON.parse(line) as WillDooEvent);
      newline = buffer.indexOf("\n");
    }
    if (done) break;
  }
  if (buffer.trim()) onEvent(JSON.parse(buffer) as WillDooEvent);
}

// ---- screen context ----------------------------------------------------------
// Detail pages may say which record is open (e.g. a customer) so Will can explain it:
//   useWillDooRecord(customer.id)

let currentRecord: string | undefined;

export function setWillDooRecord(recordId: string | undefined) {
  currentRecord = recordId;
}

/** For detail pages: Will knows which record is open while the page is shown. */
export function useWillDooRecord(recordId: string | undefined) {
  useEffect(() => {
    setWillDooRecord(recordId);
    return () => setWillDooRecord(undefined);
  }, [recordId]);
}

/** Screen sent with each question: route, page title and open record. Data, never instructions. */
export function currentScreen(path: string): WillDooScreen {
  const heading = typeof document === "undefined" ? null : document.querySelector("main h1, h1")?.textContent?.trim();
  return {
    path: path.slice(0, 200),
    ...(heading ? { title: heading.slice(0, 120) } : {}),
    ...(currentRecord ? { recordId: currentRecord.slice(0, 64) } : {})
  };
}
