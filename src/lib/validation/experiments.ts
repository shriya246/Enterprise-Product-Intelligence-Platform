import { z } from "zod";

const keySchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9_]+$/, "Use lowercase letters, numbers, and underscores only");

export const createFlagSchema = z.object({
  name: z.string().trim().min(1).max(120),
  key: keySchema,
  rolloutPct: z.coerce.number().int().min(0).max(100).default(100),
});

export const toggleFlagSchema = z.object({
  flagId: z.string().uuid(),
  isEnabled: z.coerce.boolean(),
});

export const updateFlagRolloutSchema = z.object({
  flagId: z.string().uuid(),
  rolloutPct: z.coerce.number().int().min(0).max(100),
});

export const createExperimentSchema = z.object({
  name: z.string().trim().min(1).max(160),
  variantAName: z.string().trim().min(1).max(60).default("A"),
  variantBName: z.string().trim().min(1).max(60).default("B"),
});

export const updateExperimentCountsSchema = z.object({
  experimentId: z.string().uuid(),
  visitorsA: z.coerce.number().int().min(0),
  conversionsA: z.coerce.number().int().min(0),
  visitorsB: z.coerce.number().int().min(0),
  conversionsB: z.coerce.number().int().min(0),
});

export const evaluateFlagSchema = z.object({
  writeKey: z.string().uuid(),
  flagKey: keySchema,
  distinctId: z.string().trim().min(1).max(200),
});
