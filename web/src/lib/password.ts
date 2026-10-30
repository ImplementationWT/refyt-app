import { z } from "zod";

// Mirrors the backend policy (src/auth/password-policy.ts) for early
// feedback; the backend remains the source of truth.
export const MIN_PASSWORD_LENGTH = 10;
const INITIAL_PASSWORD = "admin123";

export function passwordSchema(username: () => string) {
  return z
    .string()
    .min(1, { error: "Enter a password" })
    .refine((value) => value !== INITIAL_PASSWORD, { error: "The password cannot be the initial password" })
    .refine((value) => value.length >= MIN_PASSWORD_LENGTH, {
      error: `The password must have at least ${MIN_PASSWORD_LENGTH} characters`
    })
    .refine((value) => value.length <= 128, { error: "The password must have at most 128 characters" })
    .refine((value) => value.toLowerCase() !== username().toLowerCase(), {
      error: "The password cannot be the same as the username"
    });
}
