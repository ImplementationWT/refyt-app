export const MIN_PASSWORD_LENGTH = 10;
// Bounds the cost of hashing attacker-supplied input.
export const MAX_PASSWORD_LENGTH = 128;
/** Development default for the seeded admin; always rejected as a new password. */
export const DEFAULT_ADMIN_PASSWORD = "admin123";

/** Returns a Spanish message describing the first violated rule, or null. */
export function passwordPolicyError(password: string, username: string): string | null {
  if (password === DEFAULT_ADMIN_PASSWORD) {
    return "La contraseña no puede ser la contraseña inicial";
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`;
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return `La contraseña debe tener como máximo ${MAX_PASSWORD_LENGTH} caracteres`;
  }
  if (password.toLowerCase() === username.toLowerCase()) {
    return "La contraseña no puede ser igual al usuario";
  }
  return null;
}
