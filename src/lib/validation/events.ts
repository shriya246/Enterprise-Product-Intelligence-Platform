import { z } from "zod";

export const trackEventSchema = z.object({
  writeKey: z.string().uuid("Invalid write key"),
  distinctId: z.string().trim().min(1).max(200),
  eventName: z.string().trim().min(1).max(120),
  properties: z.record(z.string(), z.unknown()).optional().default({}),
  occurredAt: z.string().datetime().optional(),
});

export type TrackEventInput = z.infer<typeof trackEventSchema>;
