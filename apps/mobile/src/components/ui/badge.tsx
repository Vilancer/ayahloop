import { FlaskConical, type LucideIcon } from "lucide-react-native";
import { View } from "react-native";
import { useLocale } from "@/providers/locale-provider";
import { useTheme, type ThemeColorName } from "@/providers/theme-provider";
import { AppText } from "./app-text";

export type BadgeTone = "brand" | "review" | "memorized" | "neutral";

const TONE: Record<BadgeTone, { bg: string; text: string; icon: ThemeColorName }> = {
  brand: { bg: "bg-brand-soft", text: "text-brand-soft-foreground", icon: "brand-soft-foreground" },
  review: { bg: "bg-status-needs-review-soft", text: "text-status-needs-review", icon: "status-needs-review" },
  memorized: { bg: "bg-status-memorized-soft", text: "text-status-memorized", icon: "status-memorized" },
  neutral: { bg: "bg-secondary", text: "text-muted-foreground", icon: "muted-foreground" },
};

export type BadgeProps = { label: string; tone?: BadgeTone; icon?: LucideIcon };

export function Badge({ label, tone = "neutral", icon: Icon }: BadgeProps) {
  const { color } = useTheme();
  const style = TONE[tone];
  return (
    <View className={`h-6 flex-row items-center gap-1 self-start rounded-full px-2 ${style.bg}`}>
      {Icon ? <Icon size={12} color={color(style.icon)} /> : null}
      <AppText size="xs" weight="semibold" tone={style.text}>
        {label}
      </AppText>
    </View>
  );
}

/** Marks optional automatic feedback as experimental wherever it appears. */
export function BetaBadge() {
  const { t } = useLocale();
  return <Badge label={t("beta.label")} tone="review" icon={FlaskConical} />;
}
