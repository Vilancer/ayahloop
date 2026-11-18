import type { LucideIcon } from "lucide-react-native";
import { ActivityIndicator, Pressable, type PressableProps } from "react-native";
import { useTheme, type ThemeColorName } from "@/providers/theme-provider";
import { AppText } from "./app-text";

export type ButtonVariant = "primary" | "secondary" | "text" | "destructive-text";

const CONTAINER: Record<ButtonVariant, string> = {
  primary: "bg-primary px-6",
  secondary: "border border-border bg-card px-4",
  text: "px-3",
  "destructive-text": "px-3",
};
const LABEL: Record<ButtonVariant, string> = {
  primary: "text-primary-foreground",
  secondary: "text-foreground",
  text: "text-brand-soft-foreground",
  "destructive-text": "text-destructive",
};
const ICON: Record<ButtonVariant, ThemeColorName> = {
  primary: "primary-foreground",
  secondary: "foreground",
  text: "brand-soft-foreground",
  "destructive-text": "destructive",
};

export type ButtonProps = Omit<PressableProps, "children"> & {
  label: string;
  variant?: ButtonVariant;
  /** "primary" is the 54px main action; "control" is the 48px default. */
  height?: "primary" | "control";
  icon?: LucideIcon;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
};

export function Button({
  label,
  variant = "primary",
  height = variant === "primary" ? "primary" : "control",
  icon: Icon,
  loading = false,
  fullWidth = false,
  disabled,
  onPress,
  className,
  ...rest
}: ButtonProps) {
  const { color } = useTheme();
  const inactive = disabled === true || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      className={[
        "flex-row items-center justify-center gap-2 rounded-lg active:opacity-80",
        height === "primary" ? "h-primary" : "h-control",
        CONTAINER[variant],
        fullWidth ? "self-stretch" : "self-start",
        inactive ? "opacity-50" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={color(ICON[variant])} />
      ) : Icon ? (
        <Icon size={18} color={color(ICON[variant])} />
      ) : null}
      <AppText size={height === "primary" ? "base" : "sm"} weight={variant === "primary" ? "semibold" : "medium"} tone={LABEL[variant]}>
        {label}
      </AppText>
    </Pressable>
  );
}
