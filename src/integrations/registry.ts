/**
 * Registry of external providers. Adding one = adding an entry here (plus its
 * client under src/integrations/<id>/ and a case in service.ts). Credentials
 * only come from environment variables; no endpoint accepts or returns them.
 */
export interface ProviderDefinition {
  id: string;
  label: string;
  /** Environment variables that must all be set for the provider to be configured. */
  requiredEnv: readonly string[];
  /** Feature flag exposed in /api/auth/me when configured and permitted. */
  feature: string;
  /** Permission needed to use the provider's data (feature visibility). */
  usePermission: string;
}

export const PROVIDERS: readonly ProviderDefinition[] = [
  {
    id: "monday",
    label: "Monday.com",
    requiredEnv: ["MONDAY_API_TOKEN"],
    feature: "monday",
    usePermission: "monday.read"
  },
  {
    // Will Doo + Claude: chat with the client's own Anthropic key (WILL_DOO_MODE=claude).
    id: "anthropic",
    label: "Will Doo (Claude)",
    requiredEnv: ["ANTHROPIC_API_KEY"],
    feature: "willdoo-ai",
    usePermission: "willdoo.use"
  }
];

export function findProvider(id: string): ProviderDefinition | undefined {
  return PROVIDERS.find((provider) => provider.id === id);
}

export interface IntegrationStatus {
  id: string;
  label: string;
  configured: boolean;
}

/** Configured = every required variable has a non-empty value. Never returns values. */
export function getIntegrationStatus(env: Readonly<Record<string, string | undefined>>): IntegrationStatus[] {
  return PROVIDERS.map((provider) => ({
    id: provider.id,
    label: provider.label,
    configured: provider.requiredEnv.every((name) => Boolean(env[name]?.trim()))
  }));
}
