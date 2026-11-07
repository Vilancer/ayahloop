#!/usr/bin/env bash
# Publish screenshots for a PR description WITHOUT committing them to the
# feature branch. The PNGs go to the dedicated orphan branch `pr-screenshots`
# under `<branch-name>/`.
set -euo pipefail

REPO="$(git -C "$(dirname "${BASH_SOURCE[0]}")" rev-parse --show-toplevel)"
TARGET_BRANCH="pr-screenshots"
REMOTE="${PR_SCREENSHOTS_REMOTE:-origin}"
FOLDER=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --branch) FOLDER="$2"; shift 2 ;;
    --) shift; break ;;
    -*) echo "unknown flag $1" >&2; exit 1 ;;
    *) break ;;
  esac
done
[[ $# -gt 0 ]] || { echo "usage: publish-screenshots.sh [--branch <name>] <file.png>..." >&2; exit 1; }
FOLDER="${FOLDER:-$(git -C "$REPO" rev-parse --abbrev-ref HEAD)}"
[[ "$FOLDER" != HEAD ]] || { echo "detached HEAD: pass --branch <name>" >&2; exit 1; }

FILES=()
for f in "$@"; do
  [[ -f "$f" ]] || { echo "no such file: $f" >&2; exit 1; }
  FILES+=("$(cd "$(dirname "$f")" && pwd)/$(basename "$f")")
done

REMOTE_URL="$(git -C "$REPO" remote get-url "$REMOTE")"
SLUG="$(sed -E 's#^(git@[^:]+:|https?://[^/]+/)##; s#\.git$##' <<<"$REMOTE_URL")"

WORK="$(mktemp -d "${TMPDIR:-/tmp}/pr-screenshots.XXXXXX")"
cleanup() {
  git -C "$REPO" worktree remove --force "$WORK/tree" >/dev/null 2>&1 || true
  rm -rf "$WORK"
}
trap cleanup EXIT

if git -C "$REPO" ls-remote --exit-code --heads "$REMOTE" "$TARGET_BRANCH" >/dev/null 2>&1; then
  git -C "$REPO" fetch -q "$REMOTE" "$TARGET_BRANCH"
  git -C "$REPO" worktree add -q --detach "$WORK/tree" FETCH_HEAD
else
  git -C "$REPO" worktree add -q --detach "$WORK/tree"
  git -C "$WORK/tree" checkout -q --orphan "$TARGET_BRANCH-new"
  git -C "$WORK/tree" rm -rq --cached . >/dev/null 2>&1 || true
  git -C "$WORK/tree" clean -fdxq
  printf '# PR screenshots\n\nImages referenced from pull request descriptions, one folder per branch.\n' >"$WORK/tree/README.md"
  git -C "$WORK/tree" add README.md
  git -C "$WORK/tree" -c commit.gpgsign=false commit -qm "Start the pr-screenshots branch"
fi

NO_DEPLOY="apps/web/vercel.json"
if [[ ! -f "$WORK/tree/$NO_DEPLOY" ]]; then
  mkdir -p "$WORK/tree/$(dirname "$NO_DEPLOY")"
  printf '{ "git": { "deploymentEnabled": false } }\n' >"$WORK/tree/$NO_DEPLOY"
  git -C "$WORK/tree" add -- "$NO_DEPLOY"
fi

mkdir -p "$WORK/tree/$FOLDER"
for f in "${FILES[@]}"; do cp "$f" "$WORK/tree/$FOLDER/"; done
git -C "$WORK/tree" add -- "$FOLDER"
if ! git -C "$WORK/tree" diff --cached --quiet; then
  git -C "$WORK/tree" -c commit.gpgsign=false commit -qm "Screenshots for $FOLDER"
  for attempt in 1 2 3 4 5; do
    if git -C "$WORK/tree" push -q "$REMOTE" "HEAD:refs/heads/$TARGET_BRANCH" 2>/dev/null; then
      break
    fi
    (( attempt == 5 )) && { echo "push failed after $attempt attempts" >&2; exit 1; }
    sleep $((attempt * 2))
    git -C "$WORK/tree" fetch -q "$REMOTE" "$TARGET_BRANCH"
    git -C "$WORK/tree" -c commit.gpgsign=false rebase -q FETCH_HEAD
  done
fi

for f in "${FILES[@]}"; do
  name="$(basename "$f")"
  path="$FOLDER/$name"
  encoded="$(python3 -c 'import sys, urllib.parse; print(urllib.parse.quote(sys.argv[1]))' "$path")"
  echo "![${name%.*}](https://github.com/$SLUG/blob/$TARGET_BRANCH/$encoded?raw=true)"
done
