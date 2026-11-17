import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useSession } from "../../auth/session";
import { api, ApiError } from "../../lib/api";
import { FEEDBACK_SETTINGS_KEY } from "../../lib/feedback";
import type { FeedbackSettings, FeedbackType } from "../../lib/types";
import { startComment, stopComment } from "./comment.js";

/** What the Comment panel collects (the kit's field names). */
interface CommentData {
  tipo: string;
  comentario: string;
  app: string;
  pantalla: string;
  registro_nombre: string;
  pestana: string;
  elemento: string;
  url: string;
}

const TYPE: Record<string, FeedbackType> = { Mejora: "idea", "Algo no funciona": "bug", Duda: "question" };

/** Saves a comment in Feedback: 'ok', 'pend' (no connection: it stays queued) or the error to show. */
async function send(d: CommentData): Promise<"ok" | "pend" | { error: string }> {
  const screen = [d.app, d.pantalla, d.registro_nombre, d.pestana]
    .filter((part, i, all) => part && all.indexOf(part) === i)
    .join(" · ")
    .slice(0, 200);
  try {
    await api("/api/feedback", {
      method: "POST",
      body: {
        type: TYPE[d.tipo] ?? "idea",
        message: d.comentario.slice(0, 4000),
        page: (d.url || "/").slice(0, 300),
        ...(screen ? { screen } : {}),
        ...(d.elemento ? { element: d.elemento.slice(0, 300) } : {})
      }
    });
    return "ok";
  } catch (error) {
    if (error instanceof ApiError && (error.status === 0 || error.status >= 500)) return "pend";
    if (error instanceof ApiError && error.code === "feedback_disabled") return { error: "Comments are switched off right now." };
    return { error: error instanceof Error ? error.message : "It could not be sent. Try again." };
  }
}

/**
 * The Comment button at the bottom right of every screen: what users report goes to Feedback.
 * Only with a session and while an administrator keeps the module on (Feedback screen).
 */
export function CommentButton() {
  const { session } = useSession();
  const user = session?.user;
  const settings = useQuery({
    queryKey: FEEDBACK_SETTINGS_KEY,
    queryFn: () => api<FeedbackSettings>("/api/feedback/settings"),
    enabled: Boolean(user),
    staleTime: 60_000
  });
  const enabled = Boolean(user && settings.data?.enabled);
  const userId = user?.id;
  const name = user?.displayName ?? "";
  const role = user?.roles.map((r) => r.name).join(", ") ?? "";

  useEffect(() => {
    if (!enabled || !userId) return;
    startComment({ key: userId, user: { nombre: name, rol: role }, send });
    return () => stopComment();
  }, [enabled, userId, name, role]);

  return null;
}
