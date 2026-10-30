/**
 * List prices of Anthropic in USD per million tokens. Used to keep the monthly
 * budget: it is the list price, not the invoice (discounts, credits or taxes
 * are not reflected). Cache writes are the 5-minute ones (1.25 × input).
 */
export interface ModelPrice {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
}

const PRICES: Record<string, ModelPrice> = {
  "claude-sonnet-5-5": { input: 2, output: 10, cacheRead: 0.2, cacheWrite: 2.5 },
  "claude-opus-5-5": { input: 4, output: 20, cacheRead: 0.2, cacheWrite: 5 },
  "claude-haiku-5-5": { input: 0.1, output: 0.5, cacheRead: 0.01, cacheWrite: 0.125 }
};

/** Unknown models are counted at the most expensive listed price (never under-count). */
const FALLBACK_PRICE = PRICES["claude-opus-5-5"]!;

export function priceOf(model: string): ModelPrice {
  return PRICES[model] ?? FALLBACK_PRICE;
}

export interface TokenUsage {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
}

/** Cost in millionths of USD: tokens × (USD per million tokens). */
export function costMicros(model: string, usage: TokenUsage): number {
  const price = priceOf(model);
  return Math.round(
    usage.input * price.input +
      usage.output * price.output +
      usage.cacheRead * price.cacheRead +
      usage.cacheWrite * price.cacheWrite
  );
}

export const microsToUsd = (micros: number) => Math.round(micros / 10_000) / 100;
