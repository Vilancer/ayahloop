#!/usr/bin/env bash
# pnpm verify:migration-replay: every migration goes up, every rollback takes it back
# down, and the migrations go up again on a fresh local database.
set -euo pipefail
cd "$(dirname "$0")/.."

shopt -s nullglob
migrations=(supabase/migrations/*.sql)
if [[ ${#migrations[@]} -eq 0 ]]; then
  echo "verify:migration-replay: no migrations yet (setup phase) — OK"
  exit 0
fi

PSQL=(docker exec -i supabase_db_ayahloop psql -U postgres -d postgres -v ON_ERROR_STOP=1 -q -t -A)
count_public() { "${PSQL[@]}" -c "select count(*) from pg_tables where schemaname = 'public'"; }

echo "── up: fresh database, every migration, no seed"
pnpm -s exec supabase db reset --no-seed >/dev/null
up1="$(count_public)"
echo "   public tables: $up1"

echo "── down: every rollback, newest first"
mapfile -t downs < <(ls supabase/rollback/*.down.sql | sort -r)
for f in "${downs[@]}"; do
  base="$(basename "$f" .down.sql)"
  [[ -f "supabase/migrations/$base.sql" ]] || { echo "rollback without migration: $f" >&2; exit 1; }
  "${PSQL[@]}" -f - <"$f" >/dev/null
  echo "   ✓ $base"
done
for m in "${migrations[@]}"; do
  [[ -f "supabase/rollback/$(basename "$m" .sql).down.sql" ]] || { echo "migration without rollback: $m" >&2; exit 1; }
done
down="$(count_public)"
[[ "$down" -eq 0 ]] || { echo "rollbacks left $down public tables behind" >&2; exit 1; }

echo "── up again: every migration on the rolled-back database"
for m in "${migrations[@]}"; do
  "${PSQL[@]}" -f - <"$m" >/dev/null
  echo "   ✓ $(basename "$m")"
done
up2="$(count_public)"
[[ "$up2" -eq "$up1" ]] || { echo "second up has $up2 tables, first had $up1" >&2; exit 1; }

echo "── restore the seed"
pnpm -s db:reset >/dev/null
echo "verify:migration-replay: up → down → up OK ($up1 public tables)"
