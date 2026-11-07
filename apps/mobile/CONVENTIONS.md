# Mobile conventions (`apps/mobile`)

Every mobile screen PR follows this file on top of `AGENTS.md` (hard rules 12–32) and `.claude/skills/mobile-design`.

## Files a screen PR owns

Each section owns its route stub in `src/app/` and its feature folder in `src/features/<section>/`. Touch shared files only when genuinely required so two screen PRs never collide.

| Section | Route file | Feature folder |
|---|---|---|
| Sign in / onboarding | `src/app/(auth)/sign-in.tsx` | `src/features/auth/` |
| Home (Today's step) | `src/app/(app)/(tabs)/home.tsx` | `src/features/home/` |
| Parts (Surah & Juz' map) | `src/app/(app)/(tabs)/parts.tsx`, `src/app/(app)/parts/[id].tsx` | `src/features/parts/` |
| Step progression | `src/app/(app)/parts/[id]/steps/[stepKind].tsx` | `src/features/steps/` |
| Loop player | `src/app/(app)/(tabs)/loop.tsx` | `src/features/loop/` |
| Reviews (Spaced repetition) | `src/app/(app)/(tabs)/reviews.tsx` | `src/features/reviews/` |
| Progress | `src/app/(app)/(tabs)/progress.tsx` | `src/features/progress/` |
| Curriculum (Admin) | `src/app/(app)/(tabs)/curriculum.tsx` | `src/features/curriculum/` |

Note when editing `packages/data-access` or `packages/i18n`: mobile consumes both as **injected** dependencies (`dependenciesMeta`), so run `pnpm install` after editing either package to resync mobile's copy.

Routes are named once in `src/lib/routes.ts` — never a path literal in a screen (hard rule 26).

## Navigation

- `(app)` is a `Stack` over `(tabs)`. Sections are tabs; part details (`parts/[id]`) and active step flows push OVER the tabs.
- Which sections exist comes from `navItems()` and `phoneNav()` in `@ayahloop/shared` (at most 4 bar tabs + More overflow). Never add or gate a tab by hand.
- Gate on permissions (`can(permissions, "loop.run")`), never on a role key.
- Keep iOS swipe-back and the Android back gesture ON for every stacked screen. An open `Sheet` / `Dialog` / `Select` consumes the first hardware back and closes (`useBackToClose`).

## Quranic script, RTL/LTR, and digits

- **Quranic verses (`Amiri Quran`):** always rendered in an explicit RTL container (`direction: "rtl"`) with `lineHeight ≥ 2.0×` so Tashkeel and Waqf marks never clip, regardless of whether the UI locale is English or Arabic.
- **UI direction authority:** `LocaleProvider` sets Yoga `direction` at the root from the selected app locale (`en` or `ar`), never `I18nManager`.
- **Logical layout only:** `ps`/`pe`, `ms`/`me`, `start`/`end`, `self-start`/`self-end`, plain `flex-row`. Never `row-reverse`, physical `left`/`right`, or `locale === "ar"` layout conditionals.
- **Digits:** ayah keys (`2:255`), loop counters (`3 / 5`), timers (`01:24`), and streak counts always pass through `latinDigits()` (`@ayahloop/i18n`) with `writingDirection: "ltr"`.

## Six states & refresh

- Every data screen owns loading (`Skeleton`), empty (`EmptyState`), error + retry (`ErrorState`), pull-to-refresh (`useHardRefresh()`), end-of-list, and partial hydration.
- Pull-to-refresh always uses `useHardRefresh()` so `/api/me` and all active queries refresh together.

## Device + screenshots (`scripts/mobile-device.sh`)

```bash
scripts/mobile-device.sh up --web-port 3300 --metro-port 8300
scripts/mobile-device.sh with-device bash -c '
  S=scripts/mobile-device.sh
  $S open
  $S screenshot home-en-light
'
scripts/publish-screenshots.sh .mobile-device/screenshots/*.png
scripts/mobile-device.sh down
```

## Checks before a PR

`pnpm verify:mobile` (`typecheck + lint + jest + expo export`), `pnpm typecheck`, `pnpm lint`, `pnpm verify:tokens`, `pnpm verify:i18n`, `pnpm verify:permissions`, and `pnpm verify:transitions`.
