import { latinDigits, localeDir, t } from "@ayahloop/i18n";
import { canTransitionStep, DEFAULT_ROLE_PERMISSIONS, formatAyahKey, phoneNav } from "@ayahloop/shared";

describe("shared contract and i18n on mobile", () => {
  it("formats ayah keys, checks step transitions, and normalizes Arabic-Indic digits", () => {
    expect(formatAyahKey(2, 255)).toBe("2:255");
    expect(canTransitionStep("available", "in_progress")).toBe(true);
    expect(canTransitionStep("locked", "completed")).toBe(false);
    expect(latinDigits("٢:٢٥٥")).toBe("2:255");
    expect(localeDir("ar")).toBe("rtl");
    expect(t("common.appName")).toBe("AyahLoop");
    const learnerNav = phoneNav(DEFAULT_ROLE_PERMISSIONS.learner);
    expect(learnerNav.tabs.length).toBe(4);
    expect(learnerNav.overflow.length).toBe(1);
  });
});
