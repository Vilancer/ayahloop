import { X } from "lucide-react-native";
import { useEffect, useState, type ReactNode } from "react";
import { Keyboard, Modal, Platform, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocale } from "@/providers/locale-provider";
import { AppText } from "./app-text";
import { IconButton } from "./icon-button";

export type SheetProps = {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

/**
 * Bottom sheet for on-demand panels (meaning, Tajweed help, practice options).
 * The Android back gesture closes it first (Modal onRequestClose).
 */
/** Height of the on-screen keyboard, 0 while it is hidden. */
function useKeyboardHeight(): number {
  const [height, setHeight] = useState(0);
  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const show = Keyboard.addListener(showEvent, (event) => setHeight(event.endCoordinates.height));
    const hide = Keyboard.addListener(hideEvent, () => setHeight(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return height;
}

export function Sheet({ visible, title, onClose, children }: SheetProps) {
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  const { t, dir } = useLocale();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View className="flex-1 justify-end" style={{ direction: dir }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("common.close")}
          onPress={onClose}
          className="absolute inset-0 bg-foreground opacity-40"
        />
        <View className="max-h-[88%] rounded-t-2xl bg-card" style={{ paddingBottom: insets.bottom + 12 }}>
          <View className="items-center pt-2">
            <View className="h-1 w-9 rounded-full bg-input" />
          </View>
          <View className="flex-row items-center justify-between ps-5 pe-2">
            <AppText size="lg" weight="semibold" accessibilityRole="header">
              {title}
            </AppText>
            <IconButton icon={X} accessibilityLabel={t("common.close")} onPress={onClose} />
          </View>
          <ScrollView
            contentContainerClassName="gap-3 px-5 pb-2"
            // Room to scroll a focused field above the keyboard.
            contentContainerStyle={{ paddingBottom: 8 + keyboardHeight }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
