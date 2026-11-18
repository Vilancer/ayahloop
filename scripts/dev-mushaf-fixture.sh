#!/usr/bin/env bash
# Build a LOCAL, git-ignored fixture for the dev Mushaf rendering test
# (apps/mobile/src/app/dev/mushaf-test.tsx): one page's layout lines, word
# glyph codes, Unicode words and that page's font. The files go to
# apps/web/.dev-fixtures/ (git-ignored, outside public/), and only the web DEV
# server serves them (apps/web/src/app/api/dev/fixtures); a production build
# answers 404.
#
#   scripts/dev-mushaf-fixture.sh <downloads-dir> <page 1-604>
#
# <downloads-dir> holds the QUL downloads (mushaf layout 10, quran script 61 and
# 312, font 249), each unpacked into its own extracted/ folder. Nothing is
# copied into tracked files: the text and fonts are upstream material whose
# bundling terms are not settled, and learner-facing content is added one
# reviewed group at a time, never through this script.
set -euo pipefail

SRC="${1:?usage: dev-mushaf-fixture.sh <downloads-dir> <page>}"
PAGE="${2:?usage: dev-mushaf-fixture.sh <downloads-dir> <page>}"
[[ "$PAGE" =~ ^[0-9]+$ ]] && (( PAGE >= 1 && PAGE <= 604 )) || { echo "page must be 1-604" >&2; exit 1; }

REPO="$(git -C "$(dirname "${BASH_SOURCE[0]}")" rev-parse --show-toplevel)"
OUT="$REPO/apps/web/.dev-fixtures/mushaf"
LAYOUT="$SRC/qul-mushaf-layout-10/extracted/qpc-v2-15-lines.db"
GLYPHS="$SRC/qul-quran-script-61/extracted/qpc-v2.db"
UNICODE="$SRC/qul-quran-script-312/extracted/qpc-hafs-word-by-word.db"
FONT="$SRC/qul-font-249/extracted/p$PAGE.ttf"
for f in "$LAYOUT" "$GLYPHS" "$UNICODE" "$FONT"; do [[ -f "$f" ]] || { echo "missing: $f" >&2; exit 1; }; done

mkdir -p "$OUT"
cp "$FONT" "$OUT/p$PAGE.ttf"
sqlite3 -readonly "$LAYOUT" >"$OUT/page-$PAGE.json" <<SQL
attach '$GLYPHS' as g;
attach '$UNICODE' as u;
select json_object(
  'page', $PAGE,
  'fontFile', 'p$PAGE.ttf',
  'lines', (
    select json_group_array(json(line)) from (
      select json_object(
        'line', p.line_number,
        'type', p.line_type,
        'centered', p.is_centered,
        'surah', p.surah_number,
        'words', (
          select json_group_array(json(word)) from (
            select json_object('id', gw.id, 'surah', gw.surah, 'ayah', gw.ayah, 'word', gw.word, 'glyph', gw.text, 'text', uw.text) as word
            from g.words gw join u.words uw on uw.id = gw.id
            where gw.id between cast(p.first_word_id as integer) and cast(p.last_word_id as integer)
              and p.first_word_id <> ''
            order by gw.id
          )
        )
      ) as line
      from pages p where p.page_number = $PAGE order by p.line_number
    )
  )
);
SQL
echo "wrote $OUT/page-$PAGE.json and $OUT/p$PAGE.ttf"
