import { splitMiddleLetter } from "@/components/mushaf";

describe("splitMiddleLetter", () => {
  it("keeps the text unchanged and takes the letter with its marks", () => {
    // Neutral test string (not Quran text): three letters, the middle one carrying a mark.
    const word = "\u0628\u062A\u064E\u062B";
    const span = splitMiddleLetter(word);
    expect(span).toEqual({ before: "\u0628", letter: "\u062A\u064E", after: "\u062B" });
    expect(`${span?.before}${span?.letter}${span?.after}`).toBe(word);
  });

  it("returns null when no letter has a letter on both sides", () => {
    expect(splitMiddleLetter("\u0628\u062A")).toBeNull();
    expect(splitMiddleLetter("12")).toBeNull();
  });
});
