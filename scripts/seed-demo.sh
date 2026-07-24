#!/usr/bin/env bash
set -euo pipefail
project_root="$(cd "$(dirname "$0")/.." && pwd)"
if [[ "${NODE_ENV:-development}" == "production" ]]; then
  echo "Demo seeding is forbidden in production." >&2
  exit 1
fi
if [[ "${CONFIRM_DEMO_SEED:-}" != "yes" ]]; then
  echo "Set CONFIRM_DEMO_SEED=yes to run the existing demo seed explicitly." >&2
  exit 1
fi
database_url="${DATABASE_URL:-}"
if [[ -z "$database_url" && -f "$project_root/.env" ]]; then
  database_url="$(node --env-file="$project_root/.env" -e 'process.stdout.write(process.env.DATABASE_URL || "")')"
fi
if [[ -z "$database_url" ]]; then
  echo "DATABASE_URL is required." >&2
  exit 1
fi
psql "$database_url" -v ON_ERROR_STOP=1 -f "$project_root/seed.sql"
