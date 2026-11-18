import "../global.css";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAppFonts } from "@/lib/fonts";
import { AppProviders } from "@/providers/app-providers";

export default function RootLayout() {
  const fontsLoaded = useAppFonts();
  if (!fontsLoaded) return null;
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProviders>
        <Stack screenOptions={{ headerShown: false }} />
      </AppProviders>
    </GestureHandlerRootView>
  );
}
