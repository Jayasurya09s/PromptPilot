/**
 * OpenRouter API Client
 * 
 * Configures the OpenAI SDK to work with OpenRouter's API.
 * OpenRouter provides access to multiple LLM models through a unified interface.
 * 
 * @module openrouter
 */

import OpenAI from "openai";

const clientCache = new Map<string, OpenAI>();

export function createOpenRouterClient(apiKey?: string): OpenAI {
  const key = apiKey ?? process.env.OPENROUTER_API_KEY;
  if (!key) {
    throw new Error("Missing OPENROUTER_API_KEY");
  }

  if (!clientCache.has(key)) {
    clientCache.set(
      key,
      new OpenAI({
        apiKey: key,
        baseURL: "https://openrouter.ai/api/v1",
      })
    );
  }

  return clientCache.get(key)!;
}

/**
 * OpenRouter client instance.
 * Uses OpenAI SDK with custom baseURL to access OpenRouter's multi-model API.
 * Requires OPENROUTER_API_KEY environment variable.
 */
export const openrouter = createOpenRouterClient();
