/**
 * Client-side twin of the backend check (src/integrations/monday/links.ts):
 * only https links whose host is monday.com or a subdomain are rendered as
 * links. Anything else (javascript:, http, other or look-alike domains) is
 * shown as plain text.
 */
export function isSafeMondayUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 2048) return false;
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
