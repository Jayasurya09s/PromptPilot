/**
 * OpenRouter API Client
 * 
 * Configures the OpenAI SDK to work with OpenRouter's API.
 * OpenRouter provides access to multiple LLM models through a unified interface.
 * 
 * @module openrouter
 */

import OpenAI from "openai";

/**
 * OpenRouter client instance.
 * Uses OpenAI SDK with custom baseURL to access OpenRouter's multi-model API.
 * Requires OPENROUTER_API_KEY environment variable.
 */
export const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: "https://openrouter.ai/api/v1",
});
