import { fireEvent, render, screen, within } from "@testing-library/react-native";
import * as Haptics from "expo-haptics";
import type { ReactNode } from "react";
import { StyleSheet } from "react-native";
import { buildPlaceholderPage, MushafPage } from "@/components/mushaf";
import { Button, Chip, Digits, SegmentedControl } from "@/components/ui";
import { AppProviders } from "@/providers/app-providers";
import { createT } from "@ayahloop/i18n";

jest.mock("react-native-safe-area-context", () => {
  const actual = jest.requireActual<Record<string, unknown>>("react-native-safe-area-context");
  return {
    ...actual,
    SafeAreaProvider: ({ children }: { children: ReactNode }) => children,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

const wrap = (node: ReactNode) => render(<AppProviders initialLocale="ar">{node}</AppProviders>);
const t = createT("ar");

describe("UI primitives", () => {
  it("Button calls onPress and blocks presses while disabled", async () => {
    const onPress = jest.fn();
    const { rerender } = await wrap(<Button label="ابدأ التدريب" onPress={onPress} />);
    await fireEvent.press(screen.getByRole("button", { name: "ابدأ التدريب" }));
    expect(onPress).toHaveBeenCalledTimes(1);
    // Haptics are kept for loop completion and step mastery, not every tap.
    expect(Haptics.selectionAsync).not.toHaveBeenCalled();
    await rerender(
      <AppProviders initialLocale="ar">
        <Button label="ابدأ التدريب" onPress={onPress} disabled />
      </AppProviders>,
    );
    await fireEvent.press(screen.getByRole("button", { name: "ابدأ التدريب" }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("Chip exposes its selected state", async () => {
    await wrap(<Chip label="المجموعة كاملة" selected />);
    expect(screen.getByRole("button", { name: "المجموعة كاملة" }).props.accessibilityState).toMatchObject({ selected: true });
  });

  it("SegmentedControl reports the chosen option", async () => {
    const onChange = jest.fn();
    await wrap(
      <SegmentedControl
        value="repeat"
        onChange={onChange}
        options={[
          { value: "continuous", label: "استماع متصل" },
          { value: "repeat", label: "استمع وردّد" },
        ]}
      />,
    );
    const tab = screen.getByRole("tab", { name: "استماع متصل" });
    // 40px option + the track's 4px padding on each side = the 48px touch target.
    expect(tab.props.hitSlop).toMatchObject({ top: 4, bottom: 4 });
    await fireEvent.press(tab);
    expect(onChange).toHaveBeenCalledWith("continuous");
  });

  it("Digits always renders Latin digits", async () => {
    await wrap(<Digits>{"٢ / ٣"}</Digits>);
    expect(screen.getByText("2 / 3")).toBeTruthy();
  });
});

describe("MushafPage", () => {
  const page = buildPlaceholderPage(t);
  const words = page.lines.flatMap((line) => line.tokens).filter((token) => token.kind === "word");
  const ayah2 = words.filter((word) => word.ayah === 2);
  const ayah1 = words.filter((word) => word.ayah === 1);

  it("renders the page text exactly as supplied, with ayah-end signs", async () => {
    await wrap(<MushafPage page={page} currentGroupId="a" />);
    expect(screen.getAllByText(t("placeholder.ayahWords")).length).toBe(words.filter((w) => w.text === t("placeholder.ayahWords")).length);
    expect(screen.getByLabelText(t("mushaf.ayahEnd", { n: 3 }))).toBeTruthy();
    expect(screen.getByTestId("mushaf-group-a").props.accessibilityState).toMatchObject({ selected: true });
  });

  it("covers only the hidden ayahs and keeps a revealed hint word visible", async () => {
    const hint = ayah2[0];
    if (!hint) throw new Error("fixture has no ayah 2 word");
    await wrap(<MushafPage page={page} currentGroupId="a" hiddenAyahs={[2]} revealedWordIds={[hint.id]} />);
    expect(screen.queryByTestId(`mushaf-cover-${hint.id}`)).toBeNull();
    for (const word of ayah2.slice(1)) expect(screen.getByTestId(`mushaf-cover-${word.id}`)).toBeTruthy();
    for (const word of ayah1) expect(screen.queryByTestId(`mushaf-cover-${word.id}`)).toBeNull();
  });

  it("keeps a covered word's own width so the line does not move", async () => {
    const covered = ayah2[1];
    if (!covered) throw new Error("fixture has no second ayah 2 word");
    await wrap(<MushafPage page={page} currentGroupId="a" hiddenAyahs={[2]} />);
    const text = within(screen.getByTestId(`mushaf-word-${covered.id}`)).getByText(covered.text);
    expect(StyleSheet.flatten(text.props.style)).toMatchObject({ opacity: 0 });
  });

  it("keeps each word its own accessibility element when words are tappable", async () => {
    await wrap(<MushafPage page={page} currentGroupId="a" onPressGroup={jest.fn()} onPressWord={jest.fn()} />);
    expect(screen.getByTestId("mushaf-group-b").props.accessible).toBe(false);
  });

  it("lets the learner open another group or a word without any condition", async () => {
    const onPressGroup = jest.fn();
    const onPressWord = jest.fn();
    const first = ayah1[0];
    if (!first) throw new Error("fixture has no ayah 1 word");
    await wrap(<MushafPage page={page} currentGroupId="a" dimOtherGroups onPressGroup={onPressGroup} onPressWord={onPressWord} />);
    await fireEvent.press(screen.getByTestId("mushaf-group-b"));
    expect(onPressGroup).toHaveBeenCalledWith("b");
    await fireEvent.press(screen.getByTestId(`mushaf-word-${first.id}`));
    expect(onPressWord).toHaveBeenCalledWith(first);
  });
});
