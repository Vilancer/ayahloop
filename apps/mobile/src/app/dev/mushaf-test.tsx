import { nativeFontNames } from "@ayahloop/design-tokens/nativewind";
import * as Font from "expo-font";
import { Unmatched } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View, type LayoutChangeEvent } from "react-native";
import { z } from "zod";
import { splitMiddleLetter } from "@/components/mushaf";
import { AppText, ErrorState, Screen, Skeleton, TopBar } from "@/components/ui";
import { useLocale } from "@/providers/locale-provider";
import { useTheme } from "@/providers/theme-provider";

/**
 * Development-only rendering test: draws one real Mushaf page from a LOCAL,
 * git-ignored fixture (scripts/dev-mushaf-fixture.sh) to check two things on a
 * device: the printed line layout with the per-page glyph font, and whether a
 * single letter can take its own colour. Nothing here ships content. Outside a
 * development build the route behaves as if it did not exist.
 */
const PAGE = 3;
const BASE = process.env.EXPO_PUBLIC_API_URL ?? "http://127.0.0.1:3300";
/** Served only by the web dev server (apps/web/src/app/api/dev/fixtures). */
const FIXTURES = `${BASE}/api/dev/fixtures/mushaf`;
/** Glyph font size as a share of the line width, so a full printed line fits. */
const GLYPH_SIZE_RATIO = 0.058;

const FixtureSchema = z.object({
  page: z.number().int(),
  fontFile: z.string().regex(/^[\w.-]+\.ttf$/),
  lines: z.array(
    z.object({
      line: z.number(),
      type: z.string(),
      centered: z.number(),
      surah: z.union([z.number(), z.string(), z.null()]),
      words: z.array(
        z.object({ id: z.number(), surah: z.number(), ayah: z.number(), word: z.number(), glyph: z.string(), text: z.string() }),
      ),
    }),
  ),
});
type Fixture = z.infer<typeof FixtureSchema>;
type State = { status: "loading" } | { status: "error" } | { status: "ready"; fixture: Fixture; family: string };

export default function MushafTestRoute() {
  return __DEV__ ? <MushafTest /> : <Unmatched />;
}

function MushafTest() {
  const { t } = useLocale();
  const { color } = useTheme();
  const [state, setState] = useState<State>({ status: "loading" });
  const [width, setWidth] = useState(0);

  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let live = true;
    void (async () => {
      try {
        const response = await fetch(`${FIXTURES}/page-${PAGE}.json`);
        if (!response.ok) throw new Error(String(response.status));
        const fixture = FixtureSchema.parse(await response.json());
        const family = `qpc-v2-p${fixture.page}`;
        await Font.loadAsync({ [family]: { uri: `${FIXTURES}/${fixture.fontFile}` } });
        if (live) setState({ status: "ready", fixture, family });
      } catch {
        if (live) setState({ status: "error" });
      }
    })();
    return () => {
      live = false;
    };
  }, [attempt]);

  const retry = () => {
    setState({ status: "loading" });
    setAttempt((n) => n + 1);
  };

  const onLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);
  const mark = color("destructive");

  let body = (
    <View className="gap-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </View>
  );
  if (state.status === "error") body = <ErrorState title={t("dev.mushafTest.missing")} onRetry={retry} />;
  if (state.status === "ready") {
    const { fixture, family } = state;
    const glyphSize = Math.max(12, width * GLYPH_SIZE_RATIO);
    const firstWord = fixture.lines.flatMap((line) => line.words)[1];
    const letterTarget = fixture.lines
      .flatMap((line) => line.words)
      .find((word) => splitMiddleLetter(word.text) !== null);
    body = (
      <View className="gap-6">
        <View className="gap-2">
          <AppText size="sm" weight="semibold" tone="text-muted-foreground">
            {t("dev.mushafTest.glyphs")}
          </AppText>
          <View testID="mushaf-test-glyph-page" onLayout={onLayout} className="rounded-md border border-border bg-card px-2 py-3">
            {width > 0
              ? fixture.lines.map((line) => (
                  <View
                    key={line.line}
                    className={`flex-row items-center ${line.centered ? "justify-center gap-1" : "justify-between"}`}
                    style={{ direction: "rtl" }}
                  >
                    {line.words.map((word) => (
                      <Text
                        key={word.id}
                        testID={`mushaf-test-glyph-${word.id}`}
                        style={{
                          fontFamily: family,
                          fontSize: glyphSize,
                          lineHeight: glyphSize * 1.9,
                          color: word.id === firstWord?.id ? mark : color("foreground"),
                        }}
                      >
                        {word.glyph}
                      </Text>
                    ))}
                  </View>
                ))
              : null}
          </View>
          <AppText size="xs" tone="text-muted-foreground">
            {t("dev.mushafTest.glyphsNote")}
          </AppText>
        </View>

        <View className="gap-2">
          <AppText size="sm" weight="semibold" tone="text-muted-foreground">
            {t("dev.mushafTest.unicode")}
          </AppText>
          <View testID="mushaf-test-unicode-page" className="rounded-md border border-border bg-card px-2 py-3">
            {fixture.lines.map((line) => (
              <Text
                key={line.line}
                numberOfLines={1}
                adjustsFontSizeToFit
                style={{
                  fontFamily: nativeFontNames.arabic.quran.regular,
                  fontSize: 20,
                  lineHeight: 44,
                  textAlign: "center",
                  writingDirection: "rtl",
                  color: color("foreground"),
                }}
              >
                {line.words.map((word, index) => {
                  const span = word.id === letterTarget?.id ? splitMiddleLetter(word.text) : null;
                  const gap = index < line.words.length - 1 ? " " : "";
                  return span ? (
                    <Text key={word.id} testID="mushaf-test-letter-word">
                      {span.before}
                      <Text style={{ color: mark }}>{span.letter}</Text>
                      {span.after}
                      {gap}
                    </Text>
                  ) : (
                    <Text key={word.id}>{word.text + gap}</Text>
                  );
                })}
              </Text>
            ))}
          </View>
          <AppText size="xs" tone="text-muted-foreground">
            {t("dev.mushafTest.unicodeNote")}
          </AppText>
        </View>
      </View>
    );
  }

  return (
    <Screen scroll>
      <TopBar title={t("dev.mushafTest.title")} subtitle={t("dev.mushafTest.subtitle")} />
      {body}
    </Screen>
  );
}
