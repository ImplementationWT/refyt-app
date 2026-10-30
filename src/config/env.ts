import { z } from "zod";
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "../auth/password-policy.js";

// Custom messages everywhere: Zod's defaults must never echo the received value.
const requiredString = () =>
  z
    .string({
      error: (issue) => (issue.input === undefined ? "is required" : "must be a string")
    })
    .trim()
    .min(1, { error: "is required" });

const positiveInt = (fallback: number, max: number) =>
  z.coerce
    .number({ error: "must be a number" })
    .int({ error: "must be an integer" })
    .min(1, { error: "must be greater than 0" })
    .max(max, { error: `must be at most ${max}` })
    .default(fallback);

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"], {
      error: "must be one of development, test, production"
    })
    .default("development"),
  PORT: z.coerce
    .number({ error: "must be a number" })
    .int({ error: "must be an integer" })
    .min(1, { error: "must be between 1 and 65535" })
    .max(65535, { error: "must be between 1 and 65535" })
    .default(3000),
  HOST: z.string().default("0.0.0.0"),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"], {
      error: "must be a valid log level"
    })
    .default("info"),

  MONGODB_URI: requiredString().refine(
    (value) => /^mongodb(?:\+srv)?:\/\/\S+$/i.test(value),
    { error: "must be a mongodb:// or mongodb+srv:// connection string" }
  ),
  MONGODB_DB: requiredString().refine(
    (value) => /^client_[a-z0-9_]+$/.test(value),
    { error: "must match ^client_[a-z0-9_]+$" }
  ),
  MONGODB_SERVER_SELECTION_TIMEOUT_MS: positiveInt(5_000, 120_000),
  MONGODB_CONNECT_TIMEOUT_MS: positiveInt(10_000, 120_000),
  MONGODB_MAX_POOL_SIZE: positiveInt(10, 100),
  // Connection attempts at startup (exponential backoff) before exiting.
  MONGODB_STARTUP_RETRIES: positiveInt(8, 50),

  SESSION_SECRET: requiredString().refine((value) => value.length >= 32, {
    error: "must be at least 32 characters"
  }),
  SESSION_TTL_HOURS: positiveInt(12, 24 * 30),
  SESSION_IDLE_MINUTES: positiveInt(30, 24 * 60),
  LOGIN_MAX_ATTEMPTS: positiveInt(5, 100),
  LOGIN_LOCK_MINUTES: positiveInt(15, 24 * 60),
  // Number of reverse-proxy hops to trust for client IP / protocol / host (nginx = 1).
  TRUST_PROXY_HOPS: z.coerce
    .number({ error: "must be a number" })
    .int({ error: "must be an integer" })
    .min(0, { error: "must be 0 or greater" })
    .max(10, { error: "must be at most 10" })
    .default(1),

  INITIAL_ADMIN_PASSWORD: z
    .string()
    .min(MIN_PASSWORD_LENGTH, { error: `must be at least ${MIN_PASSWORD_LENGTH} characters` })
    .max(MAX_PASSWORD_LENGTH, { error: `must be at most ${MAX_PASSWORD_LENGTH} characters` })
    .optional(),
  FORCE_ADMIN_PASSWORD_CHANGE: z
    .enum(["true", "false"], { error: "must be true or false" })
    .default("true")
    .transform((value) => value === "true"),
  APP_DISPLAY_NAME: z
    .string()
    .max(80, { error: "must be at most 80 characters" })
    .refine((value) => !/[\r\n]/.test(value), { error: "must be a single line" })
    .optional(),

  // External integrations (optional; the app works without them).
  MONDAY_API_TOKEN: z
    .string()
    .max(4096, { error: "must be at most 4096 characters" })
    .refine((value) => !/\s/.test(value), { error: "must not contain whitespace" })
    .optional(),
  MONDAY_MAX_BOARDS: positiveInt(500, 5000),

  // Will Doo, the co-pilot: off (hidden), basic (quick queries, no AI, the default)
  // or claude (chat with Claude; needs ANTHROPIC_API_KEY, otherwise it runs as basic).
  WILL_DOO_MODE: z.enum(["off", "basic", "claude"], { error: "must be one of off, basic, claude" }).default("basic"),
  ANTHROPIC_API_KEY: z
    .string()
    .max(4096, { error: "must be at most 4096 characters" })
    .refine((value) => !/\s/.test(value), { error: "must not contain whitespace" })
    .optional(),
  WILL_DOO_MODEL: z
    .string()
    .regex(/^claude-[a-z0-9-]{1,60}$/, { error: "must be a Claude model id (claude-…)" })
    .default("claude-sonnet-5-5"),
  // Monthly spend cap for the whole app, at Anthropic list price.
  WILL_DOO_MONTHLY_BUDGET_USD: positiveInt(50, 100_000),
  WILL_DOO_USER_DAILY_MESSAGES: positiveInt(100, 10_000),
  WILL_DOO_RETENTION_DAYS: positiveInt(90, 3650)
}).superRefine((config, ctx) => {
  if (config.NODE_ENV === "production" && !config.FORCE_ADMIN_PASSWORD_CHANGE) {
    ctx.addIssue({
      code: "custom",
      path: ["FORCE_ADMIN_PASSWORD_CHANGE"],
      message: "cannot be false when NODE_ENV=production"
    });
  }
});

export type Config = z.infer<typeof envSchema>;

/**
 * Raised when the environment is invalid. Its message only lists variable
 * names and rules, never the values that were received.
 */
export class ConfigError extends Error {
  readonly problems: readonly string[];

  constructor(problems: readonly string[]) {
    super(`Invalid environment configuration:\n  - ${problems.join("\n  - ")}`);
    this.name = "ConfigError";
    this.problems = problems;
  }
}

export function loadConfig(source: NodeJS.ProcessEnv = process.env): Config {
  // Blank values (e.g. `VAR=` in compose) count as unset.
  const cleaned = Object.fromEntries(
    Object.entries(source).filter(([, value]) => value !== undefined && value.trim() !== "")
  );
  const result = envSchema.safeParse(cleaned);

  if (!result.success) {
    const problems = result.error.issues.map(
      (issue) => `${issue.path.join(".") || "(root)"} ${issue.message}`
    );
    throw new ConfigError(problems);
  }

  return result.data;
}
