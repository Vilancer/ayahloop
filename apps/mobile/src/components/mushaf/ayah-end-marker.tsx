import { View } from "react-native";
import { Digits } from "@/components/ui/app-text";

/** Ayah-end sign with the ayah number in Latin digits. */
export function AyahEndMarker({ ayah, label }: { ayah: number; label: string }) {
  return (
    <View accessible accessibilityLabel={label} className="h-6 w-6 items-center justify-center rounded-full border border-input">
      <Digits size="2xs" tone="text-muted-foreground">
        {ayah}
      </Digits>
    </View>
  );
}
