import { z } from "zod";
import { loopModeSchema } from "../enums";

export const API_ERROR_CODES = [
  "validation_failed",
  "unauthenticated",
  "forbidden",
  "not_found",
  "conflict",
  "invalid_transition",
  "rate_limited",
  "internal_error",
] as const;

export const apiErrorCodeSchema = z.enum(API_ERROR_CODES);
export type ApiErrorCode = z.infer<typeof apiErrorCodeSchema>;

export const apiErrorBodySchema = z.object({
  error: z.object({
    code: apiErrorCodeSchema,
    message: z.string().min(1),
    details: z.record(z.string(), z.unknown()).optional(),
  }),
});
export type ApiErrorBody = z.infer<typeof apiErrorBodySchema>;

export const paginationQuerySchema = z.object({
  cursor: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export const ayahKeySchema = z
  .string()
  .regex(/^([1-9]|[1-9]\d|10\d|11[0-4]):([1-9]\d*)$/, "Expected surah:ayah key (e.g. 2:255)");

export const ayahRangeSchema = z
  .object({
    surahNumber: z.number().int().min(1).max(114),
    startAyah: z.number().int().min(1).max(286),
    endAyah: z.number().int().min(1).max(286),
  })
  .refine((r) => r.endAyah >= r.startAyah, {
    message: "endAyah must be greater than or equal to startAyah",
    path: ["endAyah"],
  });
export type AyahRange = z.infer<typeof ayahRangeSchema>;

export const loopConfigSchema = z.object({
  mode: loopModeSchema,
  range: ayahRangeSchema,
  repeatCount: z.number().int().min(1).max(100).default(5),
  pauseSeconds: z.number().min(0).max(60).default(2),
  playbackRate: z.number().min(0.5).max(2).default(1),
});
export type LoopConfig = z.infer<typeof loopConfigSchema>;

export function formatAyahKey(surahNumber: number, ayahNumber: number): string {
  return `${surahNumber}:${ayahNumber}`;
}
