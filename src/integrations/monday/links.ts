/**
 * A board link is shown only if it is https and its host is monday.com or a
 * subdomain of it. Rejects javascript:, http:, other domains and look-alikes
 * such as monday.com.evil.com or evilmonday.com.
 */
export function isSafeMondayUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 2048) {
    return false;
  }
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  const host = url.hostname.toLowerCase();
  return (
    url.protocol === "https:" &&
    url.username === "" &&
    url.password === "" &&
    (url.port === "" || url.port === "443") &&
    (host === "monday.com" || host.endsWith(".monday.com"))
  );
}

/** Fallback when the API does not return a url: https://<slug>.monday.com/boards/<id>. */
export function buildBoardUrl(accountSlug: string | null | undefined, boardId: string): string | null {
  if (!accountSlug || !/^[a-z0-9][a-z0-9-]{0,62}$/i.test(accountSlug) || !/^\d{1,20}$/.test(boardId)) {
    return null;
  }
  return `https://${accountSlug.toLowerCase()}.monday.com/boards/${boardId}`;
}
