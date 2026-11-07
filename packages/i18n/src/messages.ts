import ar from "../messages/ar.json";
import en from "../messages/en.json";
import { latinDigits } from "./digits";
import { DEFAULT_LOCALE, type Locale } from "./locales";

export type MessageKey = keyof typeof en;
export type Messages = Readonly<Record<MessageKey, string>>;

const arMessages: Messages = ar;

export const MESSAGES: Readonly<Record<Locale, Messages>> = {
  en,
  ar: arMessages,
};

export function messagesFor(locale: Locale): Messages {
  return MESSAGES[locale];
}

export type MessageParams = Readonly<Record<string, string | number>>;
export type Translate = (key: MessageKey, params?: MessageParams) => string;

const PARAM_RE = /\{(\w+)\}/g;

export function createT(locale: Locale = DEFAULT_LOCALE): Translate {
  const catalog = messagesFor(locale);
  return (key, params) => {
    const template = catalog[key] ?? key;
    if (!params) return template;
    return template.replace(PARAM_RE, (match, name: string) => {
      const val = params[name];
      if (val === undefined) return match;
      return typeof val === "number" ? latinDigits(String(val)) : val;
    });
  };
}

export const t: Translate = createT(DEFAULT_LOCALE);
