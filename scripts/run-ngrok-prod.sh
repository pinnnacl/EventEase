#!/usr/bin/env bash
# Production Next.js (next build + next start) + ngrok HTTP tunnel.
# Usage:
#   npm run prod:ngrok
#   npm run prod:ngrok -- --skip-build     # if you already ran npm run build
#
# Stop `npm run dev` on the same PORT first. Set PORT=3001 to use another port.

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PORT="${PORT:-3000}"
SKIP_BUILD=0
for arg in "$@"; do
  if [[ "$arg" == "--skip-build" ]]; then
    SKIP_BUILD=1
  fi
done

if curl -sf "http://127.0.0.1:${PORT}/" >/dev/null 2>&1; then
  echo "Port ${PORT} already has a server (curl returned OK)."
  echo "Stop it first (e.g. the dev server) or run: PORT=3001 npm run prod:ngrok"
  exit 1
fi

if [[ "$SKIP_BUILD" -eq 0 ]]; then
  echo "==> next build (production)"
  npm run build
else
  echo "==> skipping build (--skip-build)"
fi

echo "==> next start on port ${PORT} (background)"
PORT="$PORT" npm run start &
NEXT_PID=$!

cleanup() {
  echo ""
  echo "==> stopping Next.js (pid ${NEXT_PID})"
  kill "$NEXT_PID" 2>/dev/null || true
  wait "$NEXT_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "==> waiting for http://127.0.0.1:${PORT}/"
for _ in $(seq 1 45); do
  if curl -sf "http://127.0.0.1:${PORT}/" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

if ! curl -sf "http://127.0.0.1:${PORT}/" >/dev/null 2>&1; then
  echo "Timed out waiting for Next.js. Check build output above."
  exit 1
fi

echo "==> ngrok http ${PORT} (Ctrl+C stops ngrok and Next.js)"
exec ngrok http "$PORT" --log=stdout
