import { z } from "zod";

/**
 * Prop schemas for each component
 * Defines allowed props and their types for strict validation
 */

export const propSchemas = {
  Button: z.object({
    label: z.string(),
    variant: z.enum(["primary", "secondary"]).optional(),
  }),

  Card: z.object({
    title: z.string().optional(),
  }),

  Navbar: z.object({
    title: z.string().optional(),
  }),

  Chart: z.object({
    title: z.string().optional(),
  }),

  Modal: z.object({
    title: z.string().optional(),
  }),

  Input: z.object({
    placeholder: z.string().optional(),
  }),

  Table: z.object({
    headers: z.array(z.string()),
    rows: z.array(z.array(z.string())),
  }),

  Sidebar: z.object({}),
} as const;

export type ComponentName = keyof typeof propSchemas;

/**
 * Validate props for a specific component type
 */
export function validateProps(
  componentType: string,
  props: any
): { valid: boolean; error?: string } {
  const schema = propSchemas[componentType as ComponentName];

  if (!schema) {
    return { valid: false, error: `Unknown component: ${componentType}` };
  }

  try {
    schema.parse(props || {});
    return { valid: true };
  } catch (error: any) {
    return {
      valid: false,
      error: `Invalid props for ${componentType}: ${error.message}`,
    };
  }
}

/**
 * Get required props for a component (non-optional fields)
 */
export function getRequiredProps(componentType: ComponentName): string[] {
  const schema = propSchemas[componentType];
  const shape = schema.shape as any;

  return Object.keys(shape).filter((key) => !shape[key].isOptional());
}

/**
 * Get all allowed props for a component
 */
export function getAllowedProps(componentType: ComponentName): string[] {
  const schema = propSchemas[componentType];
  return Object.keys(schema.shape);
}
