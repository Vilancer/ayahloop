export const LOCALES = ["en", "ar"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export type TextDirection = "ltr" | "rtl";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export function localeDir(locale: Locale): TextDirection {
  return locale === "ar" ? "rtl" : "ltr";
}

export function localeScript(locale: Locale): "latin" | "arabic" {
  return locale === "ar" ? "arabic" : "latin";
}

export function intlTag(locale: Locale): string {
  return `${locale}-u-nu-latn`;
}
