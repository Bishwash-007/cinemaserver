#!/usr/bin/env bash
set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info()    { echo -e "${GREEN}[dev]${NC}  $*"; }
warn()    { echo -e "${YELLOW}[dev]${NC}  $*"; }
error()   { echo -e "${RED}[dev]${NC}  $*" >&2; }

if ! command -v docker &>/dev/null; then
  error "Docker is not installed or not in PATH."
  exit 1
fi

if ! docker info &>/dev/null; then
  error "Docker daemon is not running. Please start Docker and try again."
  exit 1
fi

ENV_FILE=".env.development"

if [[ ! -f "$ENV_FILE" ]]; then
  if [[ -f ".env" ]]; then
    warn "$ENV_FILE not found — copying .env → $ENV_FILE"
    cp .env "$ENV_FILE"
  else
    error "No .env or .env.development found. Create one before starting."
    exit 1
  fi
fi

mkdir -p logs .neon_local

info "Starting development stack (Neon Local + app)..."
info "Press Ctrl+C to stop."
echo ""

docker compose -f docker-compose.dev.yml up --build
