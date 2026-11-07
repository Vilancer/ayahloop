import { z } from "zod";

export const USER_ROLES = ["learner", "admin"] as const;
export const userRoleSchema = z.enum(USER_ROLES);
export type UserRole = z.infer<typeof userRoleSchema>;

export const PART_KINDS = ["ayah_group", "rub", "hizb", "surah", "juz"] as const;
export const partKindSchema = z.enum(PART_KINDS);
export type PartKind = z.infer<typeof partKindSchema>;

export const LEARNING_STEP_KINDS = [
  "listen",
  "understand",
  "loop",
  "recite_from_memory",
  "review",
] as const;
export const learningStepKindSchema = z.enum(LEARNING_STEP_KINDS);
export type LearningStepKind = z.infer<typeof learningStepKindSchema>;

export const LEARNING_STEP_STATUSES = [
  "locked",
  "available",
  "in_progress",
  "completed",
] as const;
export const learningStepStatusSchema = z.enum(LEARNING_STEP_STATUSES);
export type LearningStepStatus = z.infer<typeof learningStepStatusSchema>;

export const LOOP_MODES = ["single_ayah", "ayah_range", "cumulative_link"] as const;
export const loopModeSchema = z.enum(LOOP_MODES);
export type LoopMode = z.infer<typeof loopModeSchema>;

export const MASTERY_LEVELS = [
  "new",
  "learning",
  "looping",
  "memorized",
  "needs_review",
] as const;
export const masteryLevelSchema = z.enum(MASTERY_LEVELS);
export type MasteryLevel = z.infer<typeof masteryLevelSchema>;

export interface StepTransitionEdge {
  readonly from: LearningStepStatus;
  readonly to: LearningStepStatus;
  readonly permission: "steps.progress";
}

export const STEP_TRANSITION_EDGES: readonly StepTransitionEdge[] = [
  { from: "locked", to: "available", permission: "steps.progress" },
  { from: "available", to: "in_progress", permission: "steps.progress" },
  { from: "in_progress", to: "completed", permission: "steps.progress" },
  { from: "completed", to: "in_progress", permission: "steps.progress" },
] as const;

export const STEP_TRANSITIONS: Readonly<
  Record<LearningStepStatus, readonly LearningStepStatus[]>
> = {
  locked: ["available"],
  available: ["in_progress"],
  in_progress: ["completed"],
  completed: ["in_progress"],
};

export function canTransitionStep(
  from: LearningStepStatus,
  to: LearningStepStatus,
): boolean {
  return STEP_TRANSITIONS[from].includes(to);
}
