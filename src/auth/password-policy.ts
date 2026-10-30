export const MIN_PASSWORD_LENGTH = 10;
// Bounds the cost of hashing attacker-supplied input.
export const MAX_PASSWORD_LENGTH = 128;
/** Development default for the seeded admin; always rejected as a new password. */
export const DEFAULT_ADMIN_PASSWORD = "admin123";

/** Returns a Spanish message describing the first violated rule, or null. */
export function passwordPolicyError(password: string, username: string): string | null {
  if (password === DEFAULT_ADMIN_PASSWORD) {
    return "The password cannot be the initial password";
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `The password must have at least ${MIN_PASSWORD_LENGTH} characters`;
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return `The password must have at most ${MAX_PASSWORD_LENGTH} characters`;
  }
  if (password.toLowerCase() === username.toLowerCase()) {
    return "The password cannot be the same as the username";
  }
  return null;
}
