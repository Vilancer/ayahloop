import { can, type Permission } from "./permissions";

export interface NavItem {
  readonly id: "home" | "parts" | "loop" | "reviews" | "progress" | "curriculum";
  readonly href: "/home" | "/parts" | "/loop" | "/reviews" | "/progress" | "/curriculum";
  readonly labelKey:
    | "nav.home"
    | "nav.parts"
    | "nav.loop"
    | "nav.reviews"
    | "nav.progress"
    | "nav.curriculum";
  readonly permission: Permission;
}

export const ALL_NAV_ITEMS: readonly NavItem[] = [
  { id: "home", href: "/home", labelKey: "nav.home", permission: "learn.read" },
  { id: "parts", href: "/parts", labelKey: "nav.parts", permission: "learn.read" },
  { id: "loop", href: "/loop", labelKey: "nav.loop", permission: "loop.run" },
  { id: "reviews", href: "/reviews", labelKey: "nav.reviews", permission: "reviews.run" },
  { id: "progress", href: "/progress", labelKey: "nav.progress", permission: "progress.read" },
  { id: "curriculum", href: "/curriculum", labelKey: "nav.curriculum", permission: "curriculum.manage" },
] as const;

export const MAX_TAB_SECTIONS = 4;

export function navItems(
  permissions: Iterable<string> | ReadonlySet<string> | readonly string[],
): NavItem[] {
  return ALL_NAV_ITEMS.filter((item) => can(permissions, item.permission));
}

export function phoneNav(
  permissions: Iterable<string> | ReadonlySet<string> | readonly string[],
): { tabs: NavItem[]; overflow: NavItem[] } {
  const allowed = navItems(permissions);
  if (allowed.length <= MAX_TAB_SECTIONS) {
    return { tabs: allowed, overflow: [] };
  }
  return {
    tabs: allowed.slice(0, MAX_TAB_SECTIONS),
    overflow: allowed.slice(MAX_TAB_SECTIONS),
  };
}

export function homeHref(
  permissions: Iterable<string> | ReadonlySet<string> | readonly string[],
): string {
  return navItems(permissions)[0]?.href ?? "/unauthorized";
}
