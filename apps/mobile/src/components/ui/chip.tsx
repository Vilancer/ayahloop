import { Pressable, type PressableProps } from "react-native";
import { AppText } from "./app-text";

export type ChipProps = Omit<PressableProps, "children"> & {
  label: string;
  selected?: boolean;
  className?: string;
};

/** Selectable pill. The visual is 40px tall; hitSlop brings the target to 48px. */
export function Chip({ label, selected = false, className, ...rest }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      hitSlop={4}
      className={[
        "h-control-sm items-center justify-center rounded-full px-3.5 active:opacity-80",
        selected ? "bg-primary" : "bg-secondary",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      <AppText size="sm" weight={selected ? "semibold" : "medium"} tone={selected ? "text-primary-foreground" : "text-foreground"}>
        {label}
      </AppText>
    </Pressable>
  );
}
