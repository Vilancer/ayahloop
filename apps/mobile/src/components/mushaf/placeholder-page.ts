import type { Translate } from "@ayahloop/i18n";
import type { MushafLine, MushafPageModel, MushafToken } from "./types";

type Spec = readonly (readonly ["w" | "r" | "j" | "e", number])[];

const GROUP_A: readonly Spec[] = [
  [["w", 1], ["w", 1], ["w", 1]],
  [["r", 1], ["e", 1], ["w", 2], ["j", 2]],
  [["w", 2], ["r", 2], ["e", 2], ["w", 3]],
  [["w", 3], ["w", 3], ["r", 3], ["e", 3]],
];
const GROUP_B: readonly Spec[] = GROUP_A.map((line) => line.map(([kind, ayah]) => [kind === "j" ? "w" : kind, ayah + 3] as const));
const GROUP_C: readonly Spec[] = [
  [["w", 7], ["w", 7], ["w", 7]],
  [["r", 7], ["e", 7], ["w", 8], ["w", 8]],
];

export const PLACEHOLDER_RULE_ID = "placeholder-rule";

/**
 * A page of bracketed placeholders for building and testing the Mushaf layout.
 * It contains no Quran text: real pages come from reviewed content only.
 */
export function buildPlaceholderPage(t: Translate): MushafPageModel {
  const lines: MushafLine[] = [];
  const addGroup = (groupId: string, specs: readonly Spec[]) => {
    specs.forEach((spec, lineIndex) => {
      const id = `${groupId}-${lineIndex}`;
      const tokens: MushafToken[] = spec.map(([kind, ayah], tokenIndex) => {
        const tokenId = `${id}-${tokenIndex}`;
        if (kind === "e") return { kind: "ayahEnd", id: tokenId, ayah };
        return {
          kind: "word",
          id: tokenId,
          ayah,
          text: t(kind === "w" ? "placeholder.ayahWords" : kind === "r" ? "placeholder.ayahRest" : "placeholder.ruleSpot"),
          ...(kind === "j" ? { ruleId: PLACEHOLDER_RULE_ID } : {}),
        };
      });
      lines.push({ id, groupId, tokens });
    });
  };
  addGroup("a", GROUP_A);
  addGroup("b", GROUP_B);
  addGroup("c", GROUP_C);
  return {
    surahName: t("placeholder.surahName"),
    juzLabel: t("placeholder.juz"),
    pageLabel: t("placeholder.page"),
    surahBanner: t("mushaf.surah", { name: t("placeholder.surahName") }),
    basmala: t("placeholder.basmala"),
    lines,
    continuingGroupIds: ["c"],
  };
}
