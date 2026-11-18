import { ChevronLeft, ChevronRight } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { useLocale } from "@/providers/locale-provider";
import { useTheme } from "@/providers/theme-provider";
import { AppText } from "./app-text";

export type ListRowProps = {
  title: string;
  subtitle?: string;
  /** Short value shown before the disclosure arrow. */
  value?: string;
  /** Replaces the value/disclosure area (a switch, a badge, a stepper). */
  trailing?: ReactNode;
  onPress?: () => void;
  divider?: boolean;
};

export function ListRow({ title, subtitle, value, trailing, onPress, divider = true }: ListRowProps) {
  const { color } = useTheme();
  const { dir } = useLocale();
  const Disclosure = dir === "rtl" ? ChevronLeft : ChevronRight;
  const body = (
    <>
      <View className="flex-1 gap-0.5">
        <AppText size="base" weight="medium">
          {title}
        </AppText>
        {subtitle ? (
          <AppText size="sm" tone="text-muted-foreground">
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {trailing ?? (
        <View className="flex-row items-center gap-1.5">
          {value ? (
            <AppText size="sm" tone="text-muted-foreground">
              {value}
            </AppText>
          ) : null}
          {onPress ? <Disclosure size={16} color={color("muted-foreground")} /> : null}
        </View>
      )}
    </>
  );
  const className = [
    "min-h-14 flex-row items-center gap-3 py-2",
    divider ? "border-b border-border" : "",
  ]
    .filter(Boolean)
    .join(" ");
  if (!onPress) return <View className={className}>{body}</View>;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={title} onPress={onPress} className={`${className} active:opacity-70`}>
      {body}
    </Pressable>
  );
}
