# ayahloop — product repository

`CLAUDE.md` and `AGENTS.md` are paired. Keep them identical.

## Status

**Setup / foundation.** A pnpm + Turborepo monorepo (`pnpm@11.10.0`, Node ≥ 22): `apps/mobile` (Expo SDK 58, Expo Router, NativeWind v4), `apps/web` (Next.js 16 App Router, Tailwind v4: web app + REST API), `packages/{shared,data-access,i18n,design-tokens}`, `supabase/` (migrations, rollbacks, seed), and `scripts/` (verification suites + shared-phone tooling). The canonical spine is in the outer repo at `.planning/00-spine.md`.

## Commands

| Command | What |
|---|---|
| `pnpm install` | Install all workspace dependencies (`pnpm@11.10.0`, Node ≥ 22) |
| `pnpm db:start` / `pnpm db:stop` | Local Supabase on `566xx` (API `56621`, DB `56622`, Studio `56623`, Mailpit `56624`) |
| `pnpm db:reset` | Replay every migration + `supabase/seed.sql` |
| `pnpm db:types` | Regenerate `packages/shared/src/types/database.ts` (committed, never hand-edited) |
| `pnpm dev` | Run dev servers through Turborepo (web on `:3300`) |
| `pnpm lint` · `pnpm typecheck` · `pnpm build` | All workspaces through Turborepo |
| `pnpm tokens:generate` · `pnpm verify:tokens` | Generate design-token adapters and verify zero drift + WCAG AA contrast |
| `pnpm verify:transitions` · `pnpm verify:permissions` | Verify `@ayahloop/shared` state machine (`STEP_TRANSITIONS`) and permission registry (`PERMISSIONS`) |
| `pnpm verify:i18n` | Verify `en.json` and `ar.json` key parity, sorting, non-empty strings, and enum labels |
| `pnpm verify:data-access` | Verify the platform-neutral typed API client, bearer token refresh, and 403 permission refresh |
| `pnpm verify:migration-replay` | Replay migrations `up → down → up` on a fresh local database, then re-seed |
| `pnpm verify:mobile` | Mobile `typecheck + lint + jest + expo export` |
| `pnpm mobile:start` | Start Expo dev server on `:8300` |
| `pnpm mobile:device up` / `open` / `down` | Manage local stack + Expo Go on the shared phone (`scripts/mobile-device.sh`, lock `/tmp/ayahloop-mobile-device.lock`) |
| `pnpm mobile:screenshots <png…>` | Publish PR screenshots to the orphan `pr-screenshots` branch |

## Glossary — use these words exactly

From `.planning/00-spine.md`. Never use "chapter", "verse", "chunk", "lesson", "stage", "quiz", or "student" in code, schema, or API identifiers.

| Word | Meaning |
|---|---|
| `learner` | A person learning and memorizing the Quran in AyahLoop |
| `admin` | Platform curator managing reciters, audio timing, and default part breakdowns |
| `surah` | One of the 114 chapters of the Quran (`1..114`) |
| `ayah` | A verse inside a `surah` (`surah_number` + `ayah_number`, key `"2:255"`) |
| `juz` | One of the 30 parts of the Quran (`1..30`) |
| `part` | A manageable memorization unit (`part_kind`: `ayah_group`, `rub`, `hizb`, `surah`, `juz`) with a start and end `ayah` |
| `step` | One stage inside a `part`'s guided progression (`learning_step_kind`: `listen`, `understand`, `loop`, `recite_from_memory`, `review`; status `learning_step_status`) |
| `loop` | An audio repeat session over one `ayah` or an `ayah` range (`loop_mode`: `single_ayah`, `ayah_range`, `cumulative_link`) |
| `reciter` | A Quran qari whose audio recitation and ayah-level timestamps drive the loop player |
| `mastery` | Retention state of a `part` or `ayah` (`mastery_level`: `new`, `learning`, `looping`, `memorized`, `needs_review`) |
| `review` | A scheduled spaced-repetition session for `memorized` or `needs_review` parts |

## Architecture map

```
apps/mobile/             Expo SDK 58 + Expo Router + NativeWind v4 — iOS & Android app
apps/web/                Next.js 16 App Router + Tailwind v4 — web companion + REST API (/api/*)
packages/shared/         @ayahloop/shared — zod contracts, enums, STEP_TRANSITIONS, PERMISSIONS, nav
packages/design-tokens/  @ayahloop/design-tokens — pure token data → web-theme.css, tailwind-preset, nativewind-vars
packages/i18n/           @ayahloop/i18n — en.json + ar.json catalogs, localeDir(), latinDigits(), createT()
packages/data-access/    @ayahloop/data-access — typed API client + queryKeys shared by web and mobile
supabase/                config.toml (ports 566xx), migrations/, rollback/, seed.sql
scripts/                 verify-*.ts, verify-migration-replay.sh, mobile-device.sh, publish-screenshots.sh
```

The skills in `.claude/skills/` (`frontend-design`, `taste`, `mobile-design`, `web-design`, `apple-design`, and the animation skills) carry the **visual voice**: hierarchy, typography, colour, and motion. Everything a screen must *do* is a numbered hard rule below.

## Hard rules

### Data, permissions, state

1. **RLS on every table, from the first migration.** A table without an RLS policy is a bug. Policies gate on `private.has_permission('x.y')` and on the caller's user identity, never on a role name.
2. **Gate on a permission, never on a role key.** `has_permission('x.y')` in SQL, `requirePermission("x.y")` in API route handlers, `can("x.y")` in both UIs. Roles (`learner`, `admin`) are labels the registry maps from; a control hidden in the UI must also be a 403 refusal in the API. Only the server is authoritative.
3. **The permission model and state machine live in two places on purpose:** `@ayahloop/shared` (`PERMISSIONS`, `STEP_TRANSITIONS`) and the database (transition table + trigger + RPCs). Change both; `pnpm verify:transitions` and `pnpm verify:permissions` assert parity. A status column is never `UPDATE`d directly: every move goes through its transition service/RPC, which writes the status and the append-only event row in one transaction.
4. **Append-only event tables; corrections are new rows.** `step_events`, `loop_sessions`, and `review_events` have no UPDATE or DELETE path.
5. **The learner identity is never a request body field.** It comes from the authenticated session (`auth.uid()`); handlers read the session user and never accept a `userId` / `learnerId` in a body or query to decide whose progress is touched.
6. **A missing permission is never shown as an error or as absence.** A route the user cannot open redirects to `homeHref(permissions)` (`@ayahloop/shared`); a section needing a narrower key renders nothing; a count from it renders an em dash (`—`), never `0`. A 403 is never rendered raw: it becomes the localized `common.permissionsChanged` toast and triggers a re-read of `/api/me`.
7. **The client-side permission set is a cache; every refresh path re-reads it.** App foreground, pull-to-refresh (`useHardRefresh()`), and any 403 (`onForbidden` on `@ayahloop/data-access`) refetch `/api/me`.
8. **A migration exists only if it is in the repo**, timestamped, forward-only, with its rollback file in `supabase/rollback/`; `pnpm verify:migration-replay` runs `up → down → up` on a fresh database. Never change a table by hand or in the Supabase dashboard. A merged migration is never edited; a mistake is a new migration.
9. **Row types are generated and private; DTOs are hand-written and public.** `pnpm db:types` output (`packages/shared/src/types/database.ts`) is committed, never hand-edited, and read only by the data layer. The public contract is hand-written zod schemas in `packages/shared`, meeting rows only in a mapper.
10. **Every request body and query is parsed with a schema from `@ayahloop/shared`.** No hand-rolled validation in route handlers. Errors follow `apiErrorBodySchema`: `{ error: { code, message, details? } }`.
11. **One seed for dev, checks, and journeys**, deterministic UUIDs, fixed seed clock, idempotent under `pnpm db:reset`. Production never loads it.

### Quranic text, bilingual i18n, and RTL/LTR

12. **Quranic text is sacred and immutable.** Always render Quranic verses in Uthmani script (`Amiri Quran` font role `quran`) from verified seed/catalog rows, never machine-transformed, truncated mid-ayah, or stripped of Tashkeel (diacritics) and Waqf marks.
13. **Quranic script direction vs UI direction.** A Quranic verse block always renders with `direction: "rtl"` and generous line height (`≥ 2.0×`) so diacritics never clip, even when the app UI locale is English (`ltr`).
14. **UI direction follows the selected app locale (`LocaleProvider`), never `I18nManager`.** `apps/mobile/src/providers/locale-provider.tsx` applies Yoga `direction` once at the root and feeds Expo Router's direction context; switching between English (`en`) and Arabic (`ar`) is live with no reload. Never call `I18nManager.forceRTL()` or `allowRTL()`.
15. **`resolveTextAlign(align)` takes no direction argument.** React Native mirrors `textAlign` automatically under an RTL layout direction (`"left"` = start, `"right"` = end). Screens use `AppText` / `TextField`, logical utilities (`ps`/`pe`, `ms`/`me`, `start`/`end`, `self-start`/`self-end`), and plain `flex-row` — never `locale === "ar"`, `row-reverse`, physical `left`/`right` spacing, or `textAlign: "auto"`.
16. **Under RTL, only a directional glyph mirrors** (back chevron, disclosure, next/previous step arrow). Play/pause, loop repeat, checkmark, bookmark, speaker, and lock icons never mirror.
17. **Digits are always Latin (`0–9`).** Ayah references (`2:255`), loop counters (`3 / 5`), durations (`01:24`), and streak counts always pass through `latinDigits()` from `@ayahloop/i18n` and set `writingDirection: "ltr"` when rendered inside an RTL screen.
18. **Every user-visible UI string lives in `@ayahloop/i18n` (`messages/en.json` and `messages/ar.json`).** Keys are sorted and verified for 100% parity by `pnpm verify:i18n`. No inline English or Arabic literals in screens.

### Design system (web and mobile alike)

19. **Tokens, never literals.** Colours, radii, spacing, typography, ergonomics, and motion come from `@ayahloop/design-tokens`. Generated outputs (`web-theme.css`, `tailwind-preset.cjs`, `nativewind-vars.ts`) are committed; `pnpm verify:tokens` fails on drift or WCAG AA contrast failure. No hex literals or magic spacing in screens.
20. **Reuse the primitives before adding one.** Mobile composes from `apps/mobile/src/components/ui`; web composes from `apps/web/src/components/ui`. Extend a primitive with a prop rather than inventing one-off screen controls.
21. **Touch targets are at least 44×44 pt (`ergonomics.touchTargetMin = 48`).** Loop transport controls (play/pause, repeat stepper, ayah scrub, speed toggle) must be effortless to tap while reciting without looking closely at the screen.

### Mobile (`apps/mobile`)

22. **Every data screen owns all six states:** loading (`Skeleton`), empty (`EmptyState` with one line and one action), error + retry (`ErrorState`), pull-to-refresh (`useHardRefresh()`), end-of-list, and partial. Never a bare `ActivityIndicator`.
23. **Every screen clears the tab bar and safe areas through the primitives** (`useBottomReserve()`, `SafeAreaProvider` at the root, `Screen` applying insets), never a guessed bottom padding.
24. **Tapping empty space or scrolling dismisses the keyboard, and the focused field stays visible above the keyboard and above any pinned footer**, on Android and iOS alike. `Screen` uses `automaticallyAdjustKeyboardInsets`; `Sheet` pads its scroll content by keyboard height. Return-key chaining walks fields in order.
25. **A dropdown (`Combobox` / `Select`) inside a scrolling form renders its list through the menu layer**, never as a nested same-direction `ScrollView`.
26. **Name each mobile route once** in `apps/mobile/src/lib/routes.ts`. Never a raw path literal in `push` / `replace` / `navigate`.
27. **Avoid cyclic navigation.** Before adding a `push`, verify what the stack looks like after three laps (`push` goes into a detail, `replace` moves sideways between steps, `dismissTo` returns to an existing screen below, `router.back()` returns).
28. **Swipe-back and the Android back gesture stay on** for every stacked screen. An open sheet or dialog consumes the first hardware back and closes (`useBackToClose`).
29. **Which tabs exist comes from `navItems()` and `phoneNav()` in `@ayahloop/shared`**, gated by permission (at most 4 bar tabs + More overflow). Never add or gate a tab by hand.
30. **A memoized row with an inline callback is not memoized.** Pass one stable `onPress(id)` per list.
31. **Never read or write a ref during render.** Effects and event handlers only.
32. **Mobile screen work follows `apps/mobile/CONVENTIONS.md`.**

### Web (`apps/web`)

33. **Every page is gated server-side** with the same `can()` and `homeHref()` from `@ayahloop/shared` as mobile.
34. **Every list is paginated (cursor) and every search input is debounced.**
35. **No browser window on Malek's screen.** Inside T3 Code, use the current thread's browser; outside T3, run Playwright headless from a scratch directory outside both repos.

### Code, contracts, and git

36. **No `any`, ever — narrow `unknown` instead.** Parse with a zod schema or explicit type guard; no `as any`, `as unknown as T`, non-null `!` on unchecked values, or `eslint-disable` to silence type errors.
37. **Contracts are defined once in `packages/*` and imported everywhere.** No app imports another app. Generated files are never merged by hand: take `main`, regenerate, commit.
38. **One feature = one branch = one PR into `main`, never a stack.** Branch `<type>/<kebab>` cut from a fresh `origin/main`; conventional commits; squash merge. Merging is Malek's call.
39. **Every finished branch ends with journeys** a person can run on the phone and in the browser (`pr-testing-playbook.md` in the outer repo), saved to `.planning/journeys/<branch>.md` in the outer repo.
40. **The Caregiver feel:** calm, unhurried, iOS-grade craft on iOS, Android, and web. Spring-based motion from `@ayahloop/design-tokens` (respecting Reduce Motion), continuous squircle corners, soft tactile haptics on loop completion and step mastery, and zero visual clutter around the sacred text.
