/**
 * Security Module
 * 
 * Detects and prevents prompt injection attacks and unsafe user inputs.
 * Protects the AI system from malicious prompts that attempt to bypass restrictions.
 * 
 * @module security
 */

/**
 * Detects prompt injection attempts in user input.
 * 
 * Scans for patterns that might indicate attempts to:
 * - Override system instructions
 * - Inject HTML/CSS
 * - Create unauthorized components
 * - Manipulate the AI's behavior
 * 
 * @param intent - User's input text to analyze
 * @returns Error message if injection detected, null if safe
 * 
 * @example
 * ```typescript
 * const error = detectPromptInjection("ignore previous instructions");
 * if (error) {
 *   // Reject the request
 * }
 * ```
 */
export function detectPromptInjection(intent: string): string | null {
  // Patterns that indicate prompt injection or unsafe behavior
  const forbiddenPatterns = [
    /ignore previous/i,      // Attempting to override system prompt
    /override/i,             // Attempting to modify system behavior
    /system prompt/i,        // Referencing system instructions
    /act as/i,               // Role switching attacks
    /create div/i,           // Attempting to inject HTML
    /html/i,                 // HTML injection
    /span/i,                 // HTML injection
    /inline css/i,           // CSS injection
    /tailwind/i,             // Unauthorized styling
    /external library/i,     // Attempting to load external code
    /new component/i         // Attempting to create unauthorized components
  ];

  // Check each pattern against the input
  for (const pattern of forbiddenPatterns) {
    if (pattern.test(intent)) {
      return `Forbidden pattern detected: ${pattern}`;
    }
  }

  return null; // Input is safe
}
