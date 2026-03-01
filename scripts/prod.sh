#!/usr/bin/env bash
set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info()  { echo -e "${GREEN}[prod]${NC}  $*"; }
warn()  { echo -e "${YELLOW}[prod]${NC}  $*"; }
error() { echo -e "${RED}[prod]${NC}  $*" >&2; }

if ! command -v docker &>/dev/null; then
  error "Docker is not installed or not in PATH."
  exit 1
fi

if ! docker info &>/dev/null; then
  error "Docker daemon is not running. Please start Docker and try again."
  exit 1
fi

ENV_FILE=".env.production"

if [[ ! -f "$ENV_FILE" ]]; then
  error "$ENV_FILE not found."
  error "Create a production .env.production file with all required variables before deploying."
  exit 1
fi

if grep -q "NODE_ENV=development" "$ENV_FILE" 2>/dev/null; then
  error "NODE_ENV is set to 'development' in $ENV_FILE."
  error "Update it to 'production' before running this script."
  exit 1
fi

mkdir -p logs

ACTION="${1:-up}"   # up | down | restart | logs | status

case "$ACTION" in
  up)
    info "Building and starting production stack in detached mode..."
    docker compose -f docker-compose.prod.yml up --build -d
    echo ""
    info "Stack started. Container status:"
    docker compose -f docker-compose.prod.yml ps
    echo ""
    info "Tail logs with:  npm run prod:docker logs"
    info "Stop with:       npm run prod:docker down"
    ;;

  down)
    info "Stopping production stack..."
    docker compose -f docker-compose.prod.yml down
    info "Done."
    ;;

  restart)
    info "Restarting production stack..."
    docker compose -f docker-compose.prod.yml down
    docker compose -f docker-compose.prod.yml up --build -d
    info "Restarted."
    ;;

  logs)
    info "Following production logs (Ctrl+C to stop)..."
    docker compose -f docker-compose.prod.yml logs -f --tail=100
    ;;

  status)
    docker compose -f docker-compose.prod.yml ps
    ;;

  *)
    error "Unknown action: $ACTION"
    echo ""
    echo "Usage: $0 [up|down|restart|logs|status]"
    echo "  up       Build and start in detached mode (default)"
    echo "  down     Stop and remove containers"
    echo "  restart  Rebuild and restart"
    echo "  logs     Follow container logs"
    echo "  status   Show container status"
    exit 1
    ;;
esac
