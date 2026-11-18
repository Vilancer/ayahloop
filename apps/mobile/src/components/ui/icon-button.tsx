import type { LucideIcon } from "lucide-react-native";
import { Pressable, type PressableProps } from "react-native";
import { useTheme, type ThemeColorName } from "@/providers/theme-provider";

export type IconButtonProps = Omit<PressableProps, "children"> & {
  icon: LucideIcon;
  /** Required: an icon-only control has no visible name. */
  accessibilityLabel: string;
  tone?: ThemeColorName;
  filled?: boolean;
  className?: string;
};

/** 48x48 touch target around a 22px icon. */
export function IconButton({ icon: Icon, tone = "foreground", filled = false, disabled, className, ...rest }: IconButtonProps) {
  const { color } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled === true }}
      disabled={disabled}
      className={[
        "h-control w-12 items-center justify-center rounded-full active:opacity-70",
        filled ? "bg-secondary" : "",
        disabled ? "opacity-50" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      <Icon size={22} color={color(tone)} />
    </Pressable>
  );
}
