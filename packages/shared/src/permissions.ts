import type { UserRole } from "./enums";

export const PERMISSIONS = {
  "learn.read": {
    description: "Browse surahs, juz', parts, word-by-word meanings, and reciters",
    locked: false,
  },
  "loop.run": {
    description: "Run the verse loop player, save loop presets, and adjust repeat/pause settings",
    locked: false,
  },
  "steps.progress": {
    description: "Start, advance, and complete step-by-step learning progressions",
    locked: false,
  },
  "reviews.run": {
    description: "Run spaced-repetition review sessions and record recall outcomes",
    locked: false,
  },
  "progress.read": {
    description: "View personal memorization streak, mastery map, and history",
    locked: false,
  },
  "curriculum.manage": {
    description: "Curate default part breakdowns, reciters, and audio timing maps",
    locked: true,
  },
  "users.manage": {
    description: "Manage user accounts and roles",
    locked: true,
  },
} as const;

export type Permission = keyof typeof PERMISSIONS;

export const PERMISSION_KEYS = Object.keys(PERMISSIONS) as Permission[];

export const LOCKED_PERMISSIONS: readonly Permission[] = PERMISSION_KEYS.filter(
  (k) => PERMISSIONS[k].locked,
);

export const DEFAULT_ROLE_PERMISSIONS: Readonly<
  Record<UserRole, readonly Permission[]>
> = {
  learner: [
    "learn.read",
    "loop.run",
    "steps.progress",
    "reviews.run",
    "progress.read",
  ],
  admin: [...PERMISSION_KEYS],
};

export function isLockedPermission(key: Permission): boolean {
  return PERMISSIONS[key].locked;
}

export function can(
  held: Iterable<string> | ReadonlySet<string> | readonly string[],
  permission: Permission,
): boolean {
  if (held instanceof Set) return held.has(permission);
  for (const item of held) {
    if (item === permission) return true;
  }
  return false;
}

export function canAny(
  held: Iterable<string> | ReadonlySet<string> | readonly string[],
  ...permissions: Permission[]
): boolean {
  return permissions.some((p) => can(held, p));
}
