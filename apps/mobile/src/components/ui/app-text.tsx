import { nativeFontNames, type NativeFontWeight } from "@ayahloop/design-tokens/nativewind";
import { latinDigits } from "@ayahloop/i18n";
import { Text, type TextProps } from "react-native";
import { useLocale } from "@/providers/locale-provider";

const SIZE_CLASS = {
  "2xs": "text-2xs",
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
} as const;

export type AppTextSize = keyof typeof SIZE_CLASS;

export type AppTextProps = TextProps & {
  size?: AppTextSize;
  weight?: NativeFontWeight;
  /** Colour class, e.g. "text-muted-foreground". */
  tone?: string;
};

/** UI text in the locale's sans family. Screens never set a font family themselves. */
export function AppText({ size = "base", weight = "regular", tone = "text-foreground", className, style, ...rest }: AppTextProps) {
  const { script } = useLocale();
  return (
    <Text
      className={[SIZE_CLASS[size], tone, className].filter(Boolean).join(" ")}
      style={[{ fontFamily: nativeFontNames[script].sans[weight] }, style]}
      {...rest}
    />
  );
}

const MONO_WEIGHT: Record<NativeFontWeight, string> = {
  regular: nativeFontNames.latin.mono.regular,
  medium: nativeFontNames.latin.mono.medium,
  semibold: nativeFontNames.latin.mono.semibold,
  bold: nativeFontNames.latin.mono.semibold,
};

export type DigitsProps = Omit<AppTextProps, "children"> & { children: string | number };

/** Counters, timers and ayah references: always Latin digits in a stable LTR run. */
export function Digits({ size = "sm", weight = "regular", tone = "text-foreground", className, style, children, ...rest }: DigitsProps) {
  return (
    <Text
      className={[SIZE_CLASS[size], tone, className].filter(Boolean).join(" ")}
      style={[{ fontFamily: MONO_WEIGHT[weight], writingDirection: "ltr" }, style]}
      {...rest}
    >
      {latinDigits(String(children))}
    </Text>
  );
}

export type QuranTextProps = TextProps & {
  /** Font size in px; line height is always 2x so marks never clip. */
  fontSize?: number;
  tone?: string;
};

/** Quranic script: Amiri Quran, RTL, generous line height. The text is rendered exactly as given. */
export function QuranText({ fontSize = 28, tone = "text-foreground", className, style, ...rest }: QuranTextProps) {
  return (
    <Text
      className={[tone, className].filter(Boolean).join(" ")}
      style={[
        { fontFamily: nativeFontNames.arabic.quran.regular, fontSize, lineHeight: fontSize * 2, writingDirection: "rtl" },
        style,
      ]}
      {...rest}
    />
  );
}
