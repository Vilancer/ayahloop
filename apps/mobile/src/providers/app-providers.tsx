import type { Locale } from "@ayahloop/i18n";
import type { ReactNode } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LocaleProvider } from "./locale-provider";
import { ThemeProvider } from "./theme-provider";

export function AppProviders({ children, initialLocale }: { children: ReactNode; initialLocale?: Locale }) {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LocaleProvider initialLocale={initialLocale}>{children}</LocaleProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
