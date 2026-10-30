import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from "node:crypto";

// Format: scrypt$<N>$<r>$<p>$<salt b64url>$<hash b64url>. Parameters are stored
// with each hash so they can be raised later without invalidating old hashes.
const PARAMS = { N: 2 ** 15, r: 8, p: 1 };
const KEY_LENGTH = 64;
const SALT_BYTES = 16;
// N=2^15, r=8 needs 32 MiB; Node's default limit is exactly 32 MiB.
const MAX_MEM = 64 * 1024 * 1024;

function derive(password: string, salt: Buffer, options: ScryptOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password.normalize("NFKC"), salt, KEY_LENGTH, { ...options, maxmem: MAX_MEM }, (error, key) =>
      error ? reject(error) : resolve(key)
    );
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const key = await derive(password, salt, PARAMS);
  return [
    "scrypt",
    PARAMS.N,
    PARAMS.r,
    PARAMS.p,
    salt.toString("base64url"),
    key.toString("base64url")
  ].join("$");
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") {
    return false;
  }
  const [, n, r, p, saltText, keyText] = parts as [string, string, string, string, string, string];
  const expected = Buffer.from(keyText, "base64url");
  const actual = await derive(password, Buffer.from(saltText, "base64url"), {
    N: Number(n),
    r: Number(r),
    p: Number(p)
  });
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

let dummyHash: Promise<string> | undefined;

/**
 * Spends the same time as a real verification. Used when the user does not
 * exist so response timing does not reveal valid usernames.
 */
export async function verifyAgainstDummy(password: string): Promise<false> {
  dummyHash ??= hashPassword(randomBytes(16).toString("hex"));
  await verifyPassword(password, await dummyHash);
  return false;
}
