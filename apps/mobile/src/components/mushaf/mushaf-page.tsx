import { ArrowLeft, ArrowRight } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { AppText, QuranText } from "@/components/ui/app-text";
import { useLocale } from "@/providers/locale-provider";
import { useTheme } from "@/providers/theme-provider";
import { AyahEndMarker } from "./ayah-end-marker";
import type { MushafLine, MushafPageModel, MushafWord } from "./types";

const WORD_FONT_SIZE = 19;

export type MushafPageProps = {
  page: MushafPageModel;
  /** The group being learned: gets the quiet band and side marker. */
  currentGroupId?: string;
  /** Guided view: fade groups other than the current one. They stay tappable. */
  dimOtherGroups?: boolean;
  /** Ayah being played or repeated. */
  activeAyah?: number;
  /** Ayahs whose words are covered for recall. */
  hiddenAyahs?: readonly number[];
  /** Word ids revealed as a hint while their ayah is hidden. */
  revealedWordIds?: readonly string[];
  /** Ayahs where the learner asked for help. */
  flaggedAyahs?: readonly number[];
  /** Colour per Tajweed rule id. A rule missing from the map shows no colour. */
  ruleColors?: Readonly<Record<string, string>>;
  onPressWord?: (word: MushafWord) => void;
  onPressGroup?: (groupId: string) => void;
};

type GroupBlock = { groupId: string; lines: MushafLine[] };

function groupLines(lines: readonly MushafLine[]): GroupBlock[] {
  const blocks: GroupBlock[] = [];
  for (const line of lines) {
    const last = blocks[blocks.length - 1];
    if (last && last.groupId === line.groupId) last.lines.push(line);
    else blocks.push({ groupId: line.groupId, lines: [line] });
  }
  return blocks;
}

/**
 * The familiar Mushaf page: frame, header, surah banner, justified lines and
 * ayah-end signs. Learning states (band, highlight, cover, Tajweed colour) are
 * drawn on the page without changing its text or line breaks.
 */
export function MushafPage({
  page,
  currentGroupId,
  dimOtherGroups = false,
  activeAyah,
  hiddenAyahs = [],
  revealedWordIds = [],
  flaggedAyahs = [],
  ruleColors = {},
  onPressWord,
  onPressGroup,
}: MushafPageProps) {
  const { t, dir } = useLocale();
  const { color } = useTheme();
  const Continue = dir === "rtl" ? ArrowLeft : ArrowRight;
  const continues = (page.continuingGroupIds ?? []).length > 0;

  const renderWord = (word: MushafWord) => {
    const hidden = hiddenAyahs.includes(word.ayah) && !revealedWordIds.includes(word.id);
    const ruleColor = word.ruleId ? ruleColors[word.ruleId] : undefined;
    const wash =
      word.ayah === activeAyah ? "bg-brand-soft" : flaggedAyahs.includes(word.ayah) ? "bg-status-needs-review-soft" : "";
    return (
      <Pressable
        key={word.id}
        testID={`mushaf-word-${word.id}`}
        accessibilityRole={onPressWord ? "button" : "text"}
        accessibilityLabel={hidden ? t("mushaf.hiddenWords") : word.text}
        disabled={!onPressWord}
        onPress={() => onPressWord?.(word)}
        className={`rounded-sm px-0.5 ${wash}`}
      >
        {hidden ? (
          <View testID={`mushaf-cover-${word.id}`} className="my-2 h-6 w-16 rounded-sm bg-secondary" />
        ) : (
          <QuranText fontSize={WORD_FONT_SIZE} style={ruleColor ? { color: ruleColor } : undefined}>
            {word.text}
          </QuranText>
        )}
      </Pressable>
    );
  };

  return (
    <View className="self-stretch rounded-lg border border-input bg-card p-1">
      <View className="gap-0.5 rounded-md border border-border p-1.5">
        <View className="h-6 flex-row items-center justify-between px-2">
          <AppText size="2xs" tone="text-muted-foreground">
            {page.surahName}
          </AppText>
          <AppText size="2xs" tone="text-muted-foreground">
            {page.juzLabel}
          </AppText>
        </View>
        {page.surahBanner ? (
          <View className="h-10 items-center justify-center rounded-full border border-input bg-secondary">
            <QuranText fontSize={18} style={{ lineHeight: 36 }}>
              {page.surahBanner}
            </QuranText>
          </View>
        ) : null}
        {page.basmala ? (
          <View className="items-center">
            <QuranText fontSize={18}>{page.basmala}</QuranText>
          </View>
        ) : null}
        {groupLines(page.lines).map((block) => {
          const current = block.groupId === currentGroupId;
          const dim = dimOtherGroups && !current;
          return (
            <Pressable
              key={`${block.groupId}-${block.lines[0]?.id ?? ""}`}
              testID={`mushaf-group-${block.groupId}`}
              accessibilityState={{ selected: current }}
              disabled={!onPressGroup || current}
              onPress={() => onPressGroup?.(block.groupId)}
              className={[
                "rounded-sm px-1",
                current ? "border-s-4 border-brand bg-muted" : "",
                dim ? "opacity-40" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {block.lines.map((line) => (
                <View key={line.id} className="flex-row items-center justify-between" style={{ direction: "rtl" }}>
                  {line.tokens.map((token) =>
                    token.kind === "word" ? (
                      renderWord(token)
                    ) : (
                      <AyahEndMarker key={token.id} ayah={token.ayah} label={t("mushaf.ayahEnd", { n: token.ayah })} />
                    ),
                  )}
                </View>
              ))}
            </Pressable>
          );
        })}
        <View className="h-6 flex-row items-center justify-between px-2">
          <AppText size="2xs" tone="text-muted-foreground">
            {page.pageLabel}
          </AppText>
          {continues ? (
            <View className="flex-row items-center gap-1">
              <AppText size="2xs" tone="text-muted-foreground">
                {t("mushaf.continues")}
              </AppText>
              <Continue size={12} color={color("muted-foreground")} />
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}
