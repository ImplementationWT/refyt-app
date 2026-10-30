import { z } from "zod";

// Mirrors the backend policy (src/auth/password-policy.ts) for early
// feedback; the backend remains the source of truth.
export const MIN_PASSWORD_LENGTH = 10;
const INITIAL_PASSWORD = "admin123";

export function passwordSchema(username: () => string) {
  return z
    .string()
    .min(1, { error: "Introduce una contraseña" })
    .refine((value) => value !== INITIAL_PASSWORD, { error: "La contraseña no puede ser la contraseña inicial" })
    .refine((value) => value.length >= MIN_PASSWORD_LENGTH, {
      error: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`
    })
    .refine((value) => value.length <= 128, { error: "La contraseña debe tener como máximo 128 caracteres" })
    .refine((value) => value.toLowerCase() !== username().toLowerCase(), {
      error: "La contraseña no puede ser igual al usuario"
    });
}
