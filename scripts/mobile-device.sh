#!/usr/bin/env bash
# Drive the shared Android phone for the AyahLoop Expo mobile app — from ANY git
# worktree, with exclusive flock on /tmp/ayahloop-mobile-device.lock.
#
#   scripts/mobile-device.sh up [--web-port N] [--metro-port N] [--lan]
#   scripts/mobile-device.sh status
#   scripts/mobile-device.sh down
#   scripts/mobile-device.sh with-device <cmd...>
#   scripts/mobile-device.sh open
#   scripts/mobile-device.sh tap <selector>
#   scripts/mobile-device.sh type <selector> <text>
#   scripts/mobile-device.sh wait-for <selector> [timeout-s]
#   scripts/mobile-device.sh back | scroll-down | scroll-up
#   scripts/mobile-device.sh screenshot <name>
#   scripts/mobile-device.sh dump
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
        shift ;;
      *) die "unknown flag $1" ;;
    esac
  done
  printf 'WEB_PORT=%s\nMETRO_PORT=%s\n' "$WEB_PORT" "$METRO_PORT" >"$STATE/env"

  if [[ -f "$STATE/web.pid" ]] && kill -0 "$(cat "$STATE/web.pid")" 2>/dev/null; then
    log "web already running (pid $(cat "$STATE/web.pid"), port $WEB_PORT)"
  else
    port_busy "$WEB_PORT" && die "port $WEB_PORT is taken — pick another with --web-port"
    log "starting the web API on :$WEB_PORT…"
    (
      cd "$REPO/apps/web"
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
      EXPO_PUBLIC_API_URL="http://$host:$WEB_PORT" \
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
  "${ADB[@]}" reverse --remove "tcp:$METRO_PORT" 2>/dev/null || true
  "${ADB[@]}" reverse --remove "tcp:$WEB_PORT" 2>/dev/null || true
  log "stopped web + metro for $REPO"
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
  "${ADB[@]}" shell am force-stop "$EXPO_GO"
  "${ADB[@]}" shell am start -a android.intent.action.VIEW -d "exp://127.0.0.1:$METRO_PORT" "$EXPO_GO" >/dev/null
  log "opened exp://127.0.0.1:$METRO_PORT"
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
  [[ -n "$sub" ]] || { sed -n '2,18p' "${BASH_SOURCE[0]}"; exit 1; }
  shift
  case "$sub" in
    up) cmd_up "$@" ;;
    status) cmd_status ;;
    down) cmd_down ;;
    with-device) [[ $# -gt 0 ]] || die "with-device needs a command"; locked "$@" ;;
    open) locked cmd_open ;;
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
