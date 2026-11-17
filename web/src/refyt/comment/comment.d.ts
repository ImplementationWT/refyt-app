// Tipos de comment.js (el botón Comment, en JavaScript como el resto de Refyt).

/** Where the user is when commenting (the kit's field names). */
export interface CommentWhere {
  app: string;
  pantalla: string;
  pantalla_id?: string;
  registro?: string;
  registro_nombre?: string;
  pestana?: string;
}

export interface CommentConfig {
  /** One queue of comments per user. */
  key: string;
  user: { nombre: string; rol?: string };
  send(data: never): Promise<"ok" | "pend" | { error: string }>;
}

export function startComment(config: CommentConfig): void;
export function stopComment(): void;
/** The Refyt engine says where the user is; null reads the screen. */
export function setCommentContext(fn: (() => CommentWhere | null) | null): void;
