import Anthropic from "@anthropic-ai/sdk";
import type {
  BetaMessage,
  BetaMessageParam,
  BetaTextBlockParam,
  BetaTool,
  BetaToolChoice
} from "@anthropic-ai/sdk/resources/beta/messages/messages";

export interface ModelRequest {
  system: BetaTextBlockParam[];
  tools: BetaTool[];
  messages: BetaMessageParam[];
  /** "none" on the last allowed round: Claude must answer with what it has. */
  toolChoice?: BetaToolChoice;
}

/**
 * One call to Claude. The service owns the loop (tools, limits, audit); this
 * only streams the text and returns the complete message. Injectable for tests.
 */
export interface WillDooModel {
  readonly model: string;
  respond(request: ModelRequest, onText: (delta: string) => void, signal: AbortSignal): Promise<BetaMessage>;
}

/** Retries of a turn whose streamed tool input could not be parsed at all. */
const MAX_JSON_RETRIES = 2;

export function anthropicModel(client: Anthropic, model: string): WillDooModel {
  return {
    model,
    async respond(request, onText, signal) {
      for (let attempt = 0; ; attempt++) {
        const stream = client.beta.messages.stream(
          {
            model,
            max_tokens: 16_000,
            // Cheap and quick for a chat that consults data in several steps.
            output_config: { effort: "medium" },
            thinking: { type: "adaptive" },
            // Caches the conversation so far; the system prompt has its own breakpoint.
            cache_control: { type: "ephemeral" },
            // If a safety classifier declines, Anthropic retries on the model it recommends.
            betas: ["server-side-fallback-2026-07-01"],
            fallbacks: "default",
            system: request.system,
            tools: request.tools,
            ...(request.toolChoice ? { tool_choice: request.toolChoice } : {}),
            messages: request.messages
          },
          { signal }
        );
        stream.on("text", onText);
        try {
          return await stream.finalMessage();
        } catch (error) {
          // Only an unparseable streamed tool input is retried; API errors go up.
          if (error instanceof Anthropic.APIError || signal.aborted || attempt >= MAX_JSON_RETRIES) throw error;
        }
      }
    }
  };
}
