import { CircleAlert, type LucideIcon } from "lucide-react-native";
import { View } from "react-native";
import { useLocale } from "@/providers/locale-provider";
import { useTheme } from "@/providers/theme-provider";
import { AppText } from "./app-text";
import { Button } from "./button";

export function Skeleton({ className }: { className?: string }) {
  return <View accessibilityElementsHidden className={["rounded-md bg-secondary", className ?? "h-4 self-stretch"].join(" ")} />;
}

export type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  /** One action at most. */
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ icon: Icon, title, actionLabel, onAction }: EmptyStateProps) {
  const { color } = useTheme();
  return (
    <View className="items-center gap-3 px-6 py-8">
      {Icon ? (
        <View className="h-14 w-14 items-center justify-center rounded-full bg-secondary">
          <Icon size={24} color={color("muted-foreground")} />
        </View>
      ) : null}
      <AppText size="base" tone="text-muted-foreground" className="text-center">
        {title}
      </AppText>
      {actionLabel && onAction ? <Button label={actionLabel} variant="secondary" onPress={onAction} className="self-center" /> : null}
    </View>
  );
}

export type ErrorStateProps = { title?: string; onRetry: () => void };

export function ErrorState({ title, onRetry }: ErrorStateProps) {
  const { t } = useLocale();
  return <EmptyState icon={CircleAlert} title={title ?? t("state.error.title")} actionLabel={t("common.retry")} onAction={onRetry} />;
}
