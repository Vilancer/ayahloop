import type { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type ScreenProps = {
  children: ReactNode;
  /** Pinned below the content, above the bottom safe area (an action dock). */
  footer?: ReactNode;
  scroll?: boolean;
  /** Horizontal padding class; the default is the 16px screen padding. */
  paddingClassName?: string;
};

/** Applies safe areas once so screens never guess insets. */
export function Screen({ children, footer, scroll = false, paddingClassName = "px-4" }: ScreenProps) {
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {scroll ? (
        <ScrollView
          className="flex-1"
          contentContainerClassName={`${paddingClassName} gap-4 pb-6`}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
        >
          {children}
        </ScrollView>
      ) : (
        <View className={`flex-1 ${paddingClassName}`}>{children}</View>
      )}
      {footer ? (
        <View className="border-t border-border bg-card px-4 pt-3" style={{ paddingBottom: insets.bottom + 12 }}>
          {footer}
        </View>
      ) : (
        <View style={{ height: insets.bottom }} />
      )}
    </View>
  );
}
