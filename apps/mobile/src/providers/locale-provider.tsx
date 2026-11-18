import { createT, localeDir, localeScript, type Locale, type TextDirection, type Translate } from "@ayahloop/i18n";
import { LocaleProvider as RouterLocaleProvider } from "expo-router";
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { View } from "react-native";

/** Arabic is the product focus, so the app starts in Arabic. */
export const APP_DEFAULT_LOCALE: Locale = "ar";

type LocaleValue = {
  locale: Locale;
  dir: TextDirection;
  script: "latin" | "arabic";
  t: Translate;
  setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleValue | null>(null);

export function LocaleProvider({
  children,
  initialLocale = APP_DEFAULT_LOCALE,
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const value = useMemo<LocaleValue>(
    () => ({
      locale,
      dir: localeDir(locale),
      script: localeScript(locale),
      t: createT(locale),
      setLocale,
    }),
    [locale],
  );
  return (
    <LocaleContext.Provider value={value}>
      {/* Yoga direction for layout, and Expo Router's direction context for navigation (headers, gestures). */}
      <RouterLocaleProvider direction={value.dir}>
        <View style={{ flex: 1, direction: value.dir }}>{children}</View>
      </RouterLocaleProvider>
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleValue {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("useLocale must be used inside LocaleProvider");
  return value;
}
