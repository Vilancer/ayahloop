import { BookOpen, EyeOff, History, Inbox, Play } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Switch, View } from "react-native";
import { buildPlaceholderPage, MushafPage, PLACEHOLDER_RULE_ID } from "@/components/mushaf";
import {
  AppText,
  Badge,
  BetaBadge,
  Button,
  Chip,
  Digits,
  EmptyState,
  ErrorState,
  IconButton,
  ListRow,
  Screen,
  SegmentedControl,
  Sheet,
  Skeleton,
  TopBar,
} from "@/components/ui";
import { useLocale } from "@/providers/locale-provider";
import { useTheme } from "@/providers/theme-provider";

type PageMode = "read" | "practice" | "recall";
type ListenMode = "repeat" | "continuous";

/** Development-only catalogue of the primitives and the Mushaf page states. Placeholder content only. */
export default function Gallery() {
  const { t } = useLocale();
  const { color } = useTheme();
  const page = useMemo(() => buildPlaceholderPage(t), [t]);
  const [pageMode, setPageMode] = useState<PageMode>("read");
  const [listenMode, setListenMode] = useState<ListenMode>("repeat");
  const [wholeGroup, setWholeGroup] = useState(true);
  const [ruleColor, setRuleColor] = useState(true);
  const [groupId, setGroupId] = useState("a");
  const [sheetOpen, setSheetOpen] = useState(false);
  const firstWordOfAyah2 = page.lines.flatMap((line) => line.tokens).find((token) => token.kind === "word" && token.ayah === 2);

  return (
    <Screen
      scroll
      footer={
        <View className="flex-row gap-2.5">
          <Button label={t("learn.recall")} variant="secondary" height="primary" icon={EyeOff} onPress={() => setPageMode("recall")} />
          <Button label={t("learn.practice.start")} icon={Play} onPress={() => setPageMode("practice")} className="flex-1" />
        </View>
      }
    >
      <TopBar
        title={t("dev.gallery.title")}
        subtitle={t("dev.gallery.subtitle")}
        actions={<IconButton icon={History} accessibilityLabel={t("nav.reviews")} />}
      />

      <AppText size="sm" weight="semibold" tone="text-muted-foreground">
        {t("dev.gallery.mushaf")}
      </AppText>
      <SegmentedControl<PageMode>
        value={pageMode}
        onChange={setPageMode}
        options={[
          { value: "read", label: t("dev.gallery.mode.read") },
          { value: "practice", label: t("dev.gallery.mode.practice") },
          { value: "recall", label: t("dev.gallery.mode.recall") },
        ]}
      />
      <View className="flex-row items-center justify-between">
        <AppText size="sm" weight="semibold">
          {t("placeholder.topicHeading")}
        </AppText>
        <Button label={t("learn.meaning")} variant="text" icon={BookOpen} onPress={() => setSheetOpen(true)} />
      </View>
      <MushafPage
        page={page}
        currentGroupId={groupId}
        dimOtherGroups
        activeAyah={pageMode === "practice" ? 2 : undefined}
        hiddenAyahs={pageMode === "recall" ? [1, 2, 3] : []}
        revealedWordIds={firstWordOfAyah2 ? [firstWordOfAyah2.id] : []}
        ruleColors={ruleColor ? { [PLACEHOLDER_RULE_ID]: color("destructive") } : {}}
        onPressGroup={setGroupId}
        onPressWord={() => setSheetOpen(true)}
      />

      <AppText size="sm" weight="semibold" tone="text-muted-foreground">
        {t("dev.gallery.controls")}
      </AppText>
      <SegmentedControl<ListenMode>
        value={listenMode}
        onChange={setListenMode}
        options={[
          { value: "continuous", label: t("learn.listenContinuous") },
          { value: "repeat", label: t("learn.listenRepeat") },
        ]}
      />
      <View className="flex-row flex-wrap items-center gap-2">
        <Chip label={t("learn.wholeGroup")} selected={wholeGroup} onPress={() => setWholeGroup(true)} />
        <Chip label={t("learn.smallerRange")} selected={!wholeGroup} onPress={() => setWholeGroup(false)} />
        <BetaBadge />
        <Badge label={t("mastery.needs_review")} tone="review" />
        <Digits>2 / 3</Digits>
        <Digits>01:24</Digits>
      </View>
      <View>
        <ListRow
          title={t("dev.gallery.ruleColor")}
          trailing={
            <Switch
              value={ruleColor}
              onValueChange={setRuleColor}
              trackColor={{ true: color("brand"), false: color("input") }}
              thumbColor={color("card")}
            />
          }
        />
        <ListRow title={t("learn.meaning")} value={t("placeholder.surahName")} onPress={() => setSheetOpen(true)} divider={false} />
      </View>
      <Button label={t("learn.readyToContinue")} fullWidth />
      <Button label={t("learn.needMorePractice")} variant="secondary" height="primary" fullWidth />
      <Button label={t("learn.notNow")} variant="text" fullWidth />

      <AppText size="sm" weight="semibold" tone="text-muted-foreground">
        {t("dev.gallery.states")}
      </AppText>
      <View className="gap-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </View>
      <EmptyState icon={Inbox} title={t("state.empty.sample")} />
      <ErrorState onRetry={() => undefined} />

      <Sheet visible={sheetOpen} title={t("learn.meaning")} onClose={() => setSheetOpen(false)}>
        <AppText size="lg">{t("placeholder.tafsir")}</AppText>
        <Button label={t("common.close")} variant="secondary" fullWidth onPress={() => setSheetOpen(false)} />
      </Sheet>
    </Screen>
  );
}
