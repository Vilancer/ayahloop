import { darkVars, lightVars, palette } from "@ayahloop/design-tokens/nativewind";
import { useColorScheme, vars } from "nativewind";
import { createContext, useContext, useMemo, type ReactNode } from "react";
import { View } from "react-native";

export type ThemeScheme = "light" | "dark";
type PaletteVar = keyof typeof lightVars;
export type ThemeColorName = PaletteVar extends `--color-${infer Name}` ? Name : never;

type ThemeValue = {
  scheme: ThemeScheme;
  /** Resolved token colour for props that cannot take a class (icons, native controls). */
  color: (name: ThemeColorName) => string;
};

const ThemeContext = createContext<ThemeValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { colorScheme } = useColorScheme();
  const scheme: ThemeScheme = colorScheme === "dark" ? "dark" : "light";
  const value = useMemo<ThemeValue>(
    () => ({
      scheme,
      color: (name) => palette[scheme][`--color-${name}` as PaletteVar],
    }),
    [scheme],
  );
  return (
    <ThemeContext.Provider value={value}>
      <View className="flex-1 bg-background" style={vars(scheme === "dark" ? darkVars : lightVars)}>
        {children}
      </View>
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeValue {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme must be used inside ThemeProvider");
  return value;
}
