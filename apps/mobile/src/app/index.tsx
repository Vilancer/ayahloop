import { router } from "expo-router";
import { View } from "react-native";
import { AppText, Button, Screen } from "@/components/ui";
import { routes } from "@/lib/routes";
import { useLocale } from "@/providers/locale-provider";

export default function Index() {
  const { t } = useLocale();
  return (
    <Screen>
      <View className="flex-1 items-center justify-center gap-2">
        <AppText size="2xl" weight="semibold">
          {t("common.appName")}
        </AppText>
        <AppText size="sm" tone="text-muted-foreground" className="text-center">
          {t("common.tagline")}
        </AppText>
        {__DEV__ ? (
          <Button
            label={t("dev.gallery.title")}
            variant="secondary"
            onPress={() => router.push(routes.devGallery)}
            className="mt-6 self-center"
          />
        ) : null}
      </View>
    </Screen>
  );
}
