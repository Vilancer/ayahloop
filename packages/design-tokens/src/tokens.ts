/**
 * The canonical, framework-neutral design token document for AyahLoop.
 *
 * Archetype: The Caregiver — warm manuscript paper in light mode, tranquil
 * night indigo in dark mode, with unclipped Uthmani script metrics and WCAG AA
 * contrast across every semantic text/surface pair.
 */

export const SEMANTIC_COLOR_NAMES = [
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "border",
  "input",
  "ring",
  "nav",
  "nav-foreground",
  "nav-muted-foreground",
  "brand",
  "brand-foreground",
  "brand-soft",
  "brand-soft-foreground",
  "brand-on-nav",
  "status-new",
  "status-new-soft",
  "status-learning",
  "status-learning-soft",
  "status-looping",
  "status-looping-soft",
  "status-memorized",
  "status-memorized-soft",
  "status-needs-review",
  "status-needs-review-soft",
] as const;

export type SemanticColorName = (typeof SEMANTIC_COLOR_NAMES)[number];
export type ColorScheme = "light" | "dark";
export type Palette = Readonly<Record<SemanticColorName, string>>;

export const LIGHT: Palette = {
  background: "#fbf9f5",
  foreground: "#131629",
  card: "#ffffff",
  "card-foreground": "#131629",
  popover: "#ffffff",
  "popover-foreground": "#131629",
  primary: "#1e1b4b",
  "primary-foreground": "#fbf9f5",
  secondary: "#f2efe9",
  "secondary-foreground": "#131629",
  muted: "#f5f2ec",
  "muted-foreground": "#595d73",
  accent: "#eeebf8",
  "accent-foreground": "#1e1b4b",
  destructive: "#a32236",
  border: "#e4e0d8",
  input: "#c8c3b8",
  ring: "#4338ca",
  nav: "#0d0b1e",
  "nav-foreground": "#f4f3fa",
  "nav-muted-foreground": "#a3a1b8",
  brand: "#4338ca",
  "brand-foreground": "#ffffff",
  "brand-soft": "#eef2ff",
  "brand-soft-foreground": "#3730a3",
  "brand-on-nav": "#a5b4fc",
  "status-new": "#525870",
  "status-new-soft": "#eef0f6",
  "status-learning": "#1d4ed8",
  "status-learning-soft": "#e8f0fe",
  "status-looping": "#4338ca",
  "status-looping-soft": "#eef2ff",
  "status-memorized": "#1e7a4c",
  "status-memorized-soft": "#e3f5ec",
  "status-needs-review": "#9a4a06",
  "status-needs-review-soft": "#fef0e3",
};

export const DARK: Palette = {
  background: "#0d0b1e",
  foreground: "#f4f3fa",
  card: "#16142e",
  "card-foreground": "#f4f3fa",
  popover: "#16142e",
  "popover-foreground": "#f4f3fa",
  primary: "#f4f3fa",
  "primary-foreground": "#0d0b1e",
  secondary: "#211f40",
  "secondary-foreground": "#f4f3fa",
  muted: "#1b1936",
  "muted-foreground": "#a3a1b8",
  accent: "#25224a",
  "accent-foreground": "#f4f3fa",
  destructive: "#f87171",
  border: "#2a2752",
  input: "#3b376e",
  ring: "#818cf8",
  nav: "#131129",
  "nav-foreground": "#f4f3fa",
  "nav-muted-foreground": "#a3a1b8",
  brand: "#818cf8",
  "brand-foreground": "#0d0b1e",
  "brand-soft": "#23204a",
  "brand-soft-foreground": "#c7d2fe",
  "brand-on-nav": "#a5b4fc",
  "status-new": "#c0c4d6",
  "status-new-soft": "#222538",
  "status-learning": "#7dd3fc",
  "status-learning-soft": "#122b40",
  "status-looping": "#a5b4fc",
  "status-looping-soft": "#23204a",
  "status-memorized": "#4ade80",
  "status-memorized-soft": "#112a20",
  "status-needs-review": "#fbbf24",
  "status-needs-review-soft": "#33220d",
};

export const COLORS: Readonly<Record<ColorScheme, Palette>> = {
  light: LIGHT,
  dark: DARK,
};

export const CONTRAST_PAIRS: readonly {
  fg: SemanticColorName;
  bg: SemanticColorName;
  min: 4.5 | 3;
}[] = [
  { fg: "foreground", bg: "background", min: 4.5 },
  { fg: "card-foreground", bg: "card", min: 4.5 },
  { fg: "popover-foreground", bg: "popover", min: 4.5 },
  { fg: "primary-foreground", bg: "primary", min: 4.5 },
  { fg: "secondary-foreground", bg: "secondary", min: 4.5 },
  { fg: "accent-foreground", bg: "accent", min: 4.5 },
  { fg: "muted-foreground", bg: "muted", min: 4.5 },
  { fg: "muted-foreground", bg: "background", min: 4.5 },
  { fg: "muted-foreground", bg: "card", min: 4.5 },
  { fg: "destructive", bg: "background", min: 4.5 },
  { fg: "destructive", bg: "card", min: 4.5 },
  { fg: "nav-foreground", bg: "nav", min: 4.5 },
  { fg: "nav-muted-foreground", bg: "nav", min: 4.5 },
  { fg: "brand-on-nav", bg: "nav", min: 4.5 },
  { fg: "brand-foreground", bg: "brand", min: 4.5 },
  { fg: "brand-soft-foreground", bg: "brand-soft", min: 4.5 },
  { fg: "brand-soft-foreground", bg: "background", min: 4.5 },
  { fg: "brand-soft-foreground", bg: "card", min: 4.5 },
  { fg: "status-new", bg: "status-new-soft", min: 4.5 },
  { fg: "status-learning", bg: "status-learning-soft", min: 4.5 },
  { fg: "status-looping", bg: "status-looping-soft", min: 4.5 },
  { fg: "status-memorized", bg: "status-memorized-soft", min: 4.5 },
  { fg: "status-needs-review", bg: "status-needs-review-soft", min: 4.5 },
];

export const FONT_FAMILIES = {
  latin: {
    sans: "Instrument Sans",
    heading: "Bricolage Grotesque",
    quran: "Amiri Quran",
    mono: "Geist Mono",
  },
  arabic: {
    sans: "IBM Plex Sans Arabic",
    heading: "IBM Plex Sans Arabic",
    quran: "Amiri Quran",
    mono: "Geist Mono",
  },
} as const;

export type FontRole = keyof typeof FONT_FAMILIES.latin;
export type FontScript = keyof typeof FONT_FAMILIES;

export const FONT_SIZES = {
  "2xs": { size: 11, lineHeight: 14 },
  xs: { size: 12, lineHeight: 16 },
  sm: { size: 14, lineHeight: 20 },
  base: { size: 16, lineHeight: 24 },
  lg: { size: 18, lineHeight: 28 },
  xl: { size: 20, lineHeight: 28 },
  "2xl": { size: 24, lineHeight: 32 },
  "3xl": { size: 30, lineHeight: 38 },
  quran: { size: 28, lineHeight: 56 },
  "quran-lg": { size: 34, lineHeight: 68 },
} as const;

export const FONT_WEIGHTS = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

export const SPACING = {
  "0": 0,
  "0.5": 2,
  "1": 4,
  "1.5": 6,
  "2": 8,
  "2.5": 10,
  "3": 12,
  "3.5": 14,
  "4": 16,
  "5": 20,
  "6": 24,
  "7": 28,
  "8": 32,
  "9": 36,
  "10": 40,
  "11": 44,
  "12": 48,
  "14": 56,
  "16": 64,
  "20": 80,
  "24": 96,
} as const;

export const RADIUS_BASE_PX = 14;
export const RADIUS_SCALE = {
  sm: 0.6,
  md: 0.8,
  lg: 1,
  xl: 1.4,
  "2xl": 1.8,
  "3xl": 2.2,
} as const;

export const ICON_SIZES = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
} as const;

export const ERGONOMICS = {
  touchTargetMin: 48,
  controlHeight: 48,
  controlHeightSm: 40,
  primaryActionHeight: 54,
  screenPaddingX: 16,
  listRowMinHeight: 72,
  tabBarHeight: 64,
  tabBarPillHeight: 56,
  tabBarPillGap: 12,
} as const;

export const MOTION = {
  pressScale: 0.97,
  pressOpacity: 0.86,
  durationFastMs: 160,
  durationNormalMs: 240,
  springs: {
    snappy: { damping: 24, stiffness: 320, mass: 0.9 },
    gentle: { damping: 26, stiffness: 220, mass: 1 },
    sheet: { damping: 30, stiffness: 280, mass: 1 },
  },
} as const;
