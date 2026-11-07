---
name: mobile-design
description: Visual voice for the AyahLoop mobile app (apps/mobile) — The Caregiver archetype: warm parchment in light mode, tranquil night indigo in dark mode, unclipped Uthmani Quranic script, effortless verse-loop transport controls, and calm step-by-step progression in English and Arabic RTL. Pair with animate-expo for motion and frontend-design/taste for layout judgment.
---

# Mobile design — AyahLoop

AyahLoop turns sacred verses into manageable steps for global students. The visual voice is **The Caregiver**: reassured calm, unhurried focus, classic script wisdom paired with modern clarity. Behaviour rules live in `AGENTS.md` and `apps/mobile/CONVENTIONS.md`; this skill governs the visual voice.

## Palette & atmosphere

- **Light scheme (Warm Manuscript):** `#FBF9F5` parchment ground, `#FFFFFF` cards, `#131629` deep ink, `#4338CA` AyahLoop indigo brand accent, `#1E7A4C` emerald for memorized mastery.
- **Dark scheme (Night Recitation):** `#0D0B1E` deep night ground, `#16142E` raised cards, `#818CF8` luminous indigo accent, `#4ADE80` soft emerald mastery.
- Never use raw hex values in screens; consume `@ayahloop/design-tokens` through the theme provider.

## Sacred text first

- Every learning screen centres on the **Ayah**: rendered in `Amiri Quran` (`font-quran`) in an RTL container with `lineHeight ≥ 2.0×` so Tashkeel and Waqf symbols breathe and never clip.
- Word-by-word chips and translations sit calmly below the ayah in `Instrument Sans` (EN) or `IBM Plex Sans Arabic` (AR).
- While a loop is playing, the active ayah or word highlights with a soft `brand-soft` wash and a smooth spring transition — never a jarring flash.

## One question per screen

| Screen | The question | Primary action |
|---|---|---|
| Home | *What is my next step today?* | Resume current step |
| Parts map | *Which part of the Surah/Juz' am I working on?* | Open active part |
| Step view (`listen` / `understand` / `loop` / `recite_from_memory`) | *Can I pronounce and recall these verses calmly?* | Complete step / Next step |
| Loop player | *How many more repetitions until this verse feels right?* | Play / Pause loop |
| Reviews | *Which memorized parts need a quick refresh today?* | Start review |
| Progress | *How steady is my habit and mastery?* | None — reflection |
