export const queryKeys = {
  all: ["ayahloop"] as const,
  me: ["ayahloop", "me"] as const,
  surahs: () => ["ayahloop", "surahs"] as const,
  parts: (filters?: Readonly<Record<string, string | number | undefined>>) =>
    ["ayahloop", "parts", filters ?? {}] as const,
  part: (partId: string) => ["ayahloop", "part", partId] as const,
  steps: (partId: string) => ["ayahloop", "steps", partId] as const,
  reviewsDue: () => ["ayahloop", "reviews", "due"] as const,
  progress: () => ["ayahloop", "progress"] as const,
} as const;
