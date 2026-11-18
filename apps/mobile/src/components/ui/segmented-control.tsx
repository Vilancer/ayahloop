import { Pressable, View } from "react-native";
import { AppText } from "./app-text";

export type SegmentedOption<T extends string> = { value: T; label: string };

export type SegmentedControlProps<T extends string> = {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string>({ options, value, onChange }: SegmentedControlProps<T>) {
  return (
    <View accessibilityRole="tablist" className="h-control flex-row gap-1 self-stretch rounded-lg bg-secondary p-1">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityLabel={option.label}
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            // The track's 4px padding is part of the 48px target.
            hitSlop={{ top: 4, bottom: 4 }}
            className={[
              "flex-1 items-center justify-center rounded-md",
              selected ? "border border-border bg-card" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <AppText size="sm" weight={selected ? "semibold" : "medium"} tone={selected ? "text-foreground" : "text-muted-foreground"}>
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
