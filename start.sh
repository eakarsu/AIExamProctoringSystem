#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "$0")" && pwd)"
if [[ ! -f "$project_root/.env" ]]; then
  echo "Missing .env. Copy .env.example and set real secrets." >&2
  exit 1
fi

if [[ ! -d "$project_root/backend/node_modules" ]]; then
  echo "Backend dependencies are absent. Run ./scripts/bootstrap.sh explicitly." >&2
  exit 1
fi

if [[ "${NODE_ENV:-}" == "test" ]]; then
  exec npm --prefix "$project_root/backend" start
fi

if [[ ! -d "$project_root/frontend/node_modules" ]]; then
  echo "Frontend dependencies are absent. Run ./scripts/bootstrap.sh explicitly." >&2
  exit 1
fi

backend_pid=""
frontend_pid=""
cleanup() {
  [[ -n "$backend_pid" ]] && kill "$backend_pid" 2>/dev/null || true
  [[ -n "$frontend_pid" ]] && kill "$frontend_pid" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

(cd "$project_root/backend" && npm start) &
backend_pid=$!
(cd "$project_root/frontend" && BROWSER=none PORT="${FRONTEND_PORT:-${CLIENT_PORT:-3000}}" npm start) &
frontend_pid=$!

echo "Started project-owned processes only: backend=$backend_pid frontend=$frontend_pid"
wait "$backend_pid" "$frontend_pid"
