export const REDACTED = "[REDACTED]";

// Any MongoDB connection string, with or without credentials.
const MONGO_URI_PATTERN = /mongodb(?:\+srv)?:\/\/[^\s"'`<>]+/gi;

// Secrets shorter than this are not redacted literally to avoid mangling
// unrelated text (they are still covered by the URI pattern).
const MIN_LITERAL_SECRET_LENGTH = 4;

export type Redactor = (text: string) => string;

/**
 * Extracts the password embedded in a MongoDB URI (if any) so it can be
 * redacted even when a driver error quotes it outside of the full URI.
 */
export function extractUriSecrets(uri: string): string[] {
  const match = /^mongodb(?:\+srv)?:\/\/[^:@/]*:([^@/]*)@/i.exec(uri);
  const password = match?.[1];

  if (!password) {
    return [];
  }

  const secrets = [password];

  try {
    const decoded = decodeURIComponent(password);
    if (decoded !== password) {
      secrets.push(decoded);
    }
  } catch {
    // Malformed percent-encoding: the raw value is already covered.
  }

  return secrets;
}

export function createRedactor(secrets: readonly string[] = []): Redactor {
  const literals = [...new Set(secrets)]
    .filter((secret) => secret.length >= MIN_LITERAL_SECRET_LENGTH)
    // Longest first so a secret containing another one is fully replaced.
    .sort((a, b) => b.length - a.length);

  return (text) => {
    let result = text.replace(MONGO_URI_PATTERN, `mongodb://${REDACTED}`);

    for (const literal of literals) {
      result = result.split(literal).join(REDACTED);
    }

    return result;
  };
}

/** Recursively redacts every string in plain objects and arrays. */
export function redactDeep(value: unknown, redact: Redactor, depth = 0): unknown {
  if (typeof value === "string") {
    return redact(value);
  }

  if (depth > 8 || value === null || typeof value !== "object") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactDeep(item, redact, depth + 1));
  }

  if (value instanceof Error) {
    // Errors are handled by the logger's `err` serializer.
    return value;
  }

  const proto = Object.getPrototypeOf(value);
  if (proto !== Object.prototype && proto !== null) {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [key, redactDeep(item, redact, depth + 1)])
  );
}
