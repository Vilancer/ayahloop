import type { ReactNode } from "react";
import { View } from "react-native";
import { AppText } from "./app-text";

export type TopBarProps = {
  title: string;
  subtitle?: string;
  /** Icon buttons at the trailing edge. */
  actions?: ReactNode;
};

export function TopBar({ title, subtitle, actions }: TopBarProps) {
  return (
    <View className="h-14 flex-row items-center justify-between">
      <View className="flex-1">
        <AppText size="lg" weight="semibold" numberOfLines={1} accessibilityRole="header">
          {title}
        </AppText>
        {subtitle ? (
          <AppText size="xs" tone="text-muted-foreground" numberOfLines={1}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {actions ? <View className="flex-row items-center">{actions}</View> : null}
    </View>
  );
}
