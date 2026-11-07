import { t } from "@ayahloop/i18n";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-background p-6">
      <Text className="text-2xl font-semibold text-foreground">{t("common.appName")}</Text>
      <Text className="mt-2 text-sm text-muted-foreground">{t("common.tagline")}</Text>
    </View>
  );
}
