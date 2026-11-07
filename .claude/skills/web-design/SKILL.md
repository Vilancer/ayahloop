---
name: web-design
description: Visual voice for the AyahLoop web companion and curriculum console (apps/web) — calm desk-side Quran memorization reader, loop studio with keyboard shortcuts, and part-by-part progress tracking in English and Arabic RTL.
---

# Web design — AyahLoop

The web app (`apps/web`) serves two roles under one roof: a calm, distraction-free companion for learners studying at a desk, and a clean curriculum console for admins curating reciters and part breakdowns.

## Visual principles

- **Tokens only (`@ayahloop/design-tokens/web-theme.css`):** warm parchment `#FBF9F5` in light mode, deep night `#0D0B1E` in dark mode, with the same `brand` indigo (`#4338CA` / `#818CF8`) and `status-*` mastery tokens as mobile.
- **Generous reading measure:** Quranic verses in `Amiri Quran` sit in a focused central column (`max-w-2xl`) with ample vertical rhythm; loop controls dock cleanly at the bottom or side without crowding the script.
- **Keyboard-first loop studio:** `Space` toggles play/pause, `L` cycles `loop_mode` (`single_ayah`, `ayah_range`, `cumulative_link`), `[` / `]` step between ayahs, and `R` restarts the current loop count.
- **Bilingual & RTL-native:** logical Tailwind utilities only (`ps-*`, `pe-*`, `ms-*`, `me-*`, `text-start`, `text-end`). Ayah keys (`2:255`), loop counters (`3 / 5`), and timers use `Geist Mono` with Latin digits in `<Ltr>` spans.
