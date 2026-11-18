/**
 * Display model for one Mushaf page. It carries text exactly as supplied by a
 * verified source; this component never edits, trims or re-orders it.
 */
export type MushafWord = {
  kind: "word";
  id: string;
  /** Ayah number inside the surah. */
  ayah: number;
  text: string;
  /** Tajweed rule shown on this word, when annotated. */
  ruleId?: string;
};

export type MushafAyahEnd = { kind: "ayahEnd"; id: string; ayah: number };

export type MushafToken = MushafWord | MushafAyahEnd;

export type MushafLine = {
  id: string;
  /** Meaning group this line belongs to. */
  groupId: string;
  /** In reading order (first token is read first). */
  tokens: readonly MushafToken[];
};

export type MushafPageModel = {
  surahName: string;
  juzLabel: string;
  pageLabel: string;
  /** Shown when the surah starts on this page. */
  surahBanner?: string;
  basmala?: string;
  lines: readonly MushafLine[];
  /** Group ids that continue on the next page. */
  continuingGroupIds?: readonly string[];
};
