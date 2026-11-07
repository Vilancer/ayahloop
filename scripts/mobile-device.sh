#!/usr/bin/env bash
# Drive the shared Android phone for the AyahLoop Expo mobile app — from ANY git
# worktree, with two agents working at once. See apps/mobile/CONVENTIONS.md
# ("Device + screenshots") for the full workflow.
#
#   scripts/mobile-device.sh up [--web-port N] [--metro-port N] [--lan]
#                                                                 start supabase (if needed), web API, metro;
#                                                                 --lan: for a phone on the Wi-Fi (an iPhone in
#                                                                 Expo Go), advertise this machine's LAN address
#   scripts/mobile-device.sh status                               what this worktree has running
#   scripts/mobile-device.sh down                                 stop this worktree's web + metro
#   scripts/mobile-device.sh with-device <cmd...>                 run <cmd> holding the device lock
#   scripts/mobile-device.sh open                                 adb reverse + open this build in Expo Go
#   scripts/mobile-device.sh sign-in [email] [password]           sign in as a seeded user (default learner@ayahloop.dev)
#   scripts/mobile-device.sh sign-out                             sign out
#   scripts/mobile-device.sh tap <selector>                       tap a node: id:<testID> | text:<text> | desc:<label>
#   scripts/mobile-device.sh type <selector> <text>               focus a field and type into it
#   scripts/mobile-device.sh wait-for <selector> [timeout-s]      wait until a node is on screen
#   scripts/mobile-device.sh back | scroll-down | scroll-up       hardware back / swipe
#   scripts/mobile-device.sh screenshot <name>                    PNG into .mobile-device/screenshots/<name>.png
#   scripts/mobile-device.sh dump                                 print the on-screen nodes (id/text/desc)
#
# Ports are per worktree (saved in .mobile-device/env by `up`, reused by every
# other subcommand). Supabase is shared across worktrees: one local stack on the
# fixed 566xx ports serves every worktree, so never `pnpm db:reset` while another
# agent is using the phone.
#
# EVERY device interaction takes an exclusive flock on $AYAHLOOP_DEVICE_LOCK
# (default /tmp/ayahloop-mobile-device.lock). A single subcommand locks for
# its own duration; `with-device` holds it across a whole sequence (open →
# sign in → navigate → screenshots) so the other agent cannot swap the app in
# between. Nested subcommands see AYAHLOOP_DEVICE_LOCK_HELD=1 and do not
# re-lock.
set -euo pipefail

REPO="$(git -C "$(dirname "${BASH_SOURCE[0]}")" rev-parse --show-toplevel)"
STATE="$REPO/.mobile-device"
LOCK="${AYAHLOOP_DEVICE_LOCK:-/tmp/ayahloop-mobile-device.lock}"
LOCK_WAIT="${AYAHLOOP_DEVICE_LOCK_WAIT:-900}"
EXPO_GO="host.exp.exponent"
SUPABASE_API_PORT=56621
mkdir -p "$STATE/screenshots" "$STATE/logs"

die() { echo "mobile-device: $*" >&2; exit 1; }
log() { echo "mobile-device: $*" >&2; }

load_env() {
  WEB_PORT=3300
  METRO_PORT=8300
  # shellcheck disable=SC1091
  [[ -f "$STATE/env" ]] && source "$STATE/env"
  ADB=(adb)
  [[ -n "${ANDROID_SERIAL:-}" ]] && ADB=(adb -s "$ANDROID_SERIAL")
  return 0
}

locked() {
  if [[ "${AYAHLOOP_DEVICE_LOCK_HELD:-}" == 1 ]]; then
    "$@"
    return
  fi
  exec 9>"$LOCK"
  log "waiting for the device lock ($LOCK)…"
  flock -w "$LOCK_WAIT" 9 || die "could not get the device lock within ${LOCK_WAIT}s"
  AYAHLOOP_DEVICE_LOCK_HELD=1 "$@"
}

port_busy() { (exec 3<>"/dev/tcp/127.0.0.1/$1") 2>/dev/null; }

wait_http() {
  local url="$1" timeout="$2" start=$SECONDS code
  while :; do
    code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$url" || true)"
    [[ -n "$code" && "$code" != 000 ]] && return 0
    (( SECONDS - start > timeout )) && return 1
    sleep 2
  done
}

supabase_env() {
  # `supabase status -o env` prints the well-known LOCAL keys (not secrets).
  (cd "$REPO" && pnpm -s exec supabase status -o env 2>/dev/null) | sed -n 's/^\([A-Z_]*\)="\{0,1\}\([^"]*\)"\{0,1\}$/\1=\2/p'
}

cmd_up() {
  load_env
  local host=127.0.0.1
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --web-port) WEB_PORT="$2"; shift 2 ;;
      --metro-port) METRO_PORT="$2"; shift 2 ;;
      --lan)
        host="$(ip -4 route get 1.1.1.1 2>/dev/null | sed -n 's/.* src \([0-9.]*\).*/\1/p')"
        [[ -n "$host" ]] || die "could not find this machine's LAN address"
        log "LAN mode: the phone reaches this machine at $host (metro starts with --clear: the API address is baked into the bundle)"
        shift ;;
      *) die "unknown flag $1" ;;
    esac
  done
  printf 'WEB_PORT=%s\nMETRO_PORT=%s\n' "$WEB_PORT" "$METRO_PORT" >"$STATE/env"

  if ! curl -fs -o /dev/null --max-time 5 "http://127.0.0.1:$SUPABASE_API_PORT/auth/v1/health"; then
    log "starting local supabase (ports 566xx)…"
    (cd "$REPO" && pnpm db:start) >"$STATE/logs/supabase.log" 2>&1 || die "supabase failed to start — see $STATE/logs/supabase.log"
  fi
  local env_lines anon service
  env_lines="$(supabase_env)"
  anon="$(sed -n 's/^ANON_KEY=//p' <<<"$env_lines")"
  service="$(sed -n 's/^SERVICE_ROLE_KEY=//p' <<<"$env_lines")"
  [[ -n "$anon" && -n "$service" ]] || die "could not read the local supabase keys (supabase status)"

  if [[ -f "$STATE/web.pid" ]] && kill -0 "$(cat "$STATE/web.pid")" 2>/dev/null; then
    log "web already running (pid $(cat "$STATE/web.pid"), port $WEB_PORT)"
  else
    port_busy "$WEB_PORT" && die "port $WEB_PORT is taken — pick another with --web-port"
    log "starting the web API on :$WEB_PORT…"
    (
      cd "$REPO/apps/web"
      NEXT_PUBLIC_SUPABASE_URL="http://$host:$SUPABASE_API_PORT" \
      NEXT_PUBLIC_SUPABASE_ANON_KEY="$anon" \
      SUPABASE_SERVICE_ROLE_KEY="$service" \
      PUBLIC_BASE_URL="http://$host:$WEB_PORT" \
      setsid nohup npx next dev -p "$WEB_PORT" >"$STATE/logs/web.log" 2>&1 &
      echo $! >"$STATE/web.pid"
    )
  fi

  if [[ -f "$STATE/metro.pid" ]] && kill -0 "$(cat "$STATE/metro.pid")" 2>/dev/null; then
    log "metro already running (pid $(cat "$STATE/metro.pid"), port $METRO_PORT)"
  else
    port_busy "$METRO_PORT" && die "port $METRO_PORT is taken — pick another with --metro-port"
    log "starting metro on :$METRO_PORT…"
    (
      cd "$REPO/apps/mobile"
      # 127.0.0.1 on the PHONE is this machine through `adb reverse` (see
      # `open`), so neither the API nor the bundle needs a LAN address.
      EXPO_PUBLIC_API_URL="http://$host:$WEB_PORT" \
      EXPO_PUBLIC_SUPABASE_URL="http://$host:$SUPABASE_API_PORT" \
      EXPO_PUBLIC_SUPABASE_ANON_KEY="$anon" \
      REACT_NATIVE_PACKAGER_HOSTNAME="$host" \
      EXPO_NO_TELEMETRY=1 \
      setsid nohup npx expo start --port "$METRO_PORT" $([[ $host != 127.0.0.1 ]] && echo --clear) >"$STATE/logs/metro.log" 2>&1 &
      echo $! >"$STATE/metro.pid"
    )
  fi

  log "waiting for the web API…"
  wait_http "http://127.0.0.1:$WEB_PORT/api/health" 240 || die "the web API did not come up — see $STATE/logs/web.log"
  log "waiting for metro…"
  wait_http "http://127.0.0.1:$METRO_PORT/status" 180 || die "metro did not come up — see $STATE/logs/metro.log"
  log "warming the Android bundle (first build can take a minute)…"
  local bundle
  bundle="$(curl -fs --max-time 30 -H 'expo-platform: android' "http://127.0.0.1:$METRO_PORT" \
    | python3 -c 'import json, sys; print(json.load(sys.stdin)["launchAsset"]["url"])' 2>/dev/null || true)"
  if [[ -n "$bundle" ]]; then
    curl -fs -o /dev/null --max-time 900 "$bundle" || log "bundle warm-up failed — see $STATE/logs/metro.log"
  else
    log "could not read the manifest — see $STATE/logs/metro.log"
  fi
  cmd_status
}

cmd_status() {
  load_env
  local web="stopped" metro="stopped"
  [[ -f "$STATE/web.pid" ]] && kill -0 "$(cat "$STATE/web.pid")" 2>/dev/null && web="pid $(cat "$STATE/web.pid")"
  [[ -f "$STATE/metro.pid" ]] && kill -0 "$(cat "$STATE/metro.pid")" 2>/dev/null && metro="pid $(cat "$STATE/metro.pid")"
  echo "worktree: $REPO"
  echo "web   :$WEB_PORT  $web   (log $STATE/logs/web.log)"
  echo "metro :$METRO_PORT  $metro   (log $STATE/logs/metro.log)"
  echo "expo  exp://127.0.0.1:$METRO_PORT"
  echo "lock  $LOCK"
}

stop_pid() {
  local file="$1"
  [[ -f "$file" ]] || return 0
  local pid; pid="$(cat "$file")"
  kill -- "-$pid" 2>/dev/null || kill "$pid" 2>/dev/null || true
  rm -f "$file"
}

cmd_down() {
  load_env
  stop_pid "$STATE/metro.pid"
  stop_pid "$STATE/web.pid"
  # Only this worktree's reverse mappings; the shared supabase one stays.
  "${ADB[@]}" reverse --remove "tcp:$METRO_PORT" 2>/dev/null || true
  "${ADB[@]}" reverse --remove "tcp:$WEB_PORT" 2>/dev/null || true
  log "stopped web + metro for $REPO (supabase left running — it is shared)"
}

ui_dump() {
  "${ADB[@]}" shell uiautomator dump --compressed /sdcard/ayahloop-ui.xml >/dev/null 2>&1 || true
  "${ADB[@]}" exec-out cat /sdcard/ayahloop-ui.xml
}

ui_find() {
  local selector="$1"
  ui_dump | python3 -c '
import re, sys, xml.etree.ElementTree as ET
selector = sys.argv[1]
kind, _, value = selector.partition(":")
if not value:
    kind, value = "text", selector
try:
    root = ET.fromstring(sys.stdin.read())
except ET.ParseError:
    sys.exit(0)
attr = {"id": "resource-id", "text": "text", "desc": "content-desc"}.get(kind)
if attr is None:
    sys.exit("unknown selector kind: " + kind)
for node in root.iter("node"):
    got = node.get(attr, "")
    if got == value or (kind == "id" and got.endswith(":id/" + value)):
        m = re.match(r"\[(\d+),(\d+)\]\[(\d+),(\d+)\]", node.get("bounds", ""))
        if m:
            x1, y1, x2, y2 = map(int, m.groups())
            if x2 > x1 and y2 > y1:
                print((x1 + x2) // 2, (y1 + y2) // 2)
                break
' "$selector"
}

ui_wait() {
  local selector="$1" timeout="${2:-60}" start=$SECONDS point
  while :; do
    point="$(ui_find "$selector")"
    [[ -n "$point" ]] && { echo "$point"; return 0; }
    (( SECONDS - start > timeout )) && return 1
    sleep 1.5
  done
}

device_tap() {
  local point
  point="$(ui_wait "$1" "${2:-20}")" || die "not on screen: $1"
  # shellcheck disable=SC2086
  "${ADB[@]}" shell input tap $point
}

device_type() {
  device_tap "$1"
  sleep 1.2
  local text="${2// /%s}"
  "${ADB[@]}" shell input text "$(printf '%q' "$text")"
}

cmd_open() {
  load_env
  [[ -n "$("${ADB[@]}" get-state 2>/dev/null)" ]] || die "no device (adb devices)"
  "${ADB[@]}" shell pm path "$EXPO_GO" >/dev/null 2>&1 || die "Expo Go ($EXPO_GO) is not installed on the device"
  for port in "$METRO_PORT" "$WEB_PORT" "$SUPABASE_API_PORT"; do
    "${ADB[@]}" reverse "tcp:$port" "tcp:$port" >/dev/null
  done
  "${ADB[@]}" shell input keyevent KEYCODE_WAKEUP
  "${ADB[@]}" shell wm dismiss-keyguard >/dev/null 2>&1 || true
  # A fresh process: never screenshot the other agent's build by accident.
  "${ADB[@]}" shell am force-stop "$EXPO_GO"
  "${ADB[@]}" shell am start -a android.intent.action.VIEW -d "exp://127.0.0.1:$METRO_PORT" "$EXPO_GO" >/dev/null
  log "opened exp://127.0.0.1:$METRO_PORT — waiting for the app…"
  local start=$SECONDS
  while (( SECONDS - start < 240 )); do
    for dismiss in "text:Continue" "text:Got it"; do
      local p; p="$(ui_find "$dismiss")"
      # shellcheck disable=SC2086
      [[ -n "$p" ]] && "${ADB[@]}" shell input tap $p && sleep 1
    done
    if [[ -n "$(ui_find id:sign-in-email)" || -n "$(ui_find id:app-header)" || -n "$(ui_find id:tab-bar)" || -n "$(ui_find text:AyahLoop)" ]]; then
      log "app is up"
      return 0
    fi
    sleep 2
  done
  die "the app did not appear within 240s — check $STATE/logs/metro.log and the phone"
}

cmd_sign_in() {
  load_env
  local email="${1:-learner@ayahloop.dev}" password="${2:-password123}"
  if [[ -z "$(ui_find id:sign-in-email)" ]]; then
    if [[ -n "$(ui_find id:header-sign-out)" ]]; then
      log "already signed in — signing out first"
      device_tap id:header-sign-out
    fi
    ui_wait id:sign-in-email 30 >/dev/null || die "sign-in screen not reachable"
  fi
  device_type id:sign-in-email "$email"
  device_type id:sign-in-password "$password"
  "${ADB[@]}" shell input keyevent KEYCODE_BACK
  sleep 0.5
  device_tap id:sign-in-submit
  ui_wait id:tab-bar 60 >/dev/null || die "sign-in did not land in the app"
  log "signed in as $email"
}

cmd_sign_out() {
  load_env
  device_tap id:header-sign-out
  ui_wait id:sign-in-email 30 >/dev/null || die "did not return to sign-in"
}

cmd_screenshot() {
  load_env
  local name="${1:?screenshot name}"
  local out="$STATE/screenshots/${name%.png}.png"
  sleep "${AYAHLOOP_SCREENSHOT_SETTLE:-1}"
  "${ADB[@]}" exec-out screencap -p >"$out"
  [[ -s "$out" ]] || die "empty screenshot"
  echo "$out"
}

cmd_dump() {
  load_env
  ui_dump | python3 -c '
import sys, xml.etree.ElementTree as ET
root = ET.fromstring(sys.stdin.read())
for n in root.iter("node"):
    rid, text, desc = n.get("resource-id", ""), n.get("text", ""), n.get("content-desc", "")
    if rid or text or desc:
        print(n.get("bounds"), "id=" + rid, "text=" + text, "desc=" + desc, sep="\t")
'
}

swipe() {
  local size w h
  size="$("${ADB[@]}" shell wm size | sed -n 's/.*: \([0-9]*\)x\([0-9]*\).*/\1 \2/p' | tail -1)"
  read -r w h <<<"$size"
  if [[ "$1" == down ]]; then
    "${ADB[@]}" shell input swipe $((w / 2)) $((h * 7 / 10)) $((w / 2)) $((h * 3 / 10)) 300
  else
    "${ADB[@]}" shell input swipe $((w / 2)) $((h * 3 / 10)) $((w / 2)) $((h * 7 / 10)) 300
  fi
}

main() {
  local sub="${1:-}"
  [[ -n "$sub" ]] || { sed -n '2,22p' "${BASH_SOURCE[0]}"; exit 1; }
  shift
  case "$sub" in
    up) cmd_up "$@" ;;
    status) cmd_status ;;
    down) cmd_down ;;
    with-device) [[ $# -gt 0 ]] || die "with-device needs a command"; locked "$@" ;;
    open) locked cmd_open ;;
    sign-in) locked cmd_sign_in "$@" ;;
    sign-out) locked cmd_sign_out ;;
    tap) load_env; locked device_tap "${1:?selector}" "${2:-20}" ;;
    type) load_env; locked device_type "${1:?selector}" "${2:?text}" ;;
    wait-for) load_env; locked ui_wait "${1:?selector}" "${2:-60}" >/dev/null ;;
    back) load_env; locked "${ADB[@]}" shell input keyevent KEYCODE_BACK ;;
    scroll-down) load_env; locked swipe down ;;
    scroll-up) load_env; locked swipe up ;;
    screenshot) locked cmd_screenshot "$@" ;;
    dump) locked cmd_dump ;;
    *) die "unknown subcommand: $sub" ;;
  esac
}

main "$@"
