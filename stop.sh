#!/bin/bash
# stop.sh — Stop ds-profile services
# Usage: ./stop.sh [-vah] [-e ENV] [SERVICES...]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/scripts/script-support.sh"

# ─── Defaults ─────────────────────────────────────────────────────────────────

ENVIRONMENT="dev"
REMOVE_VOLUMES=false
REMOVE_ORPHANS=false

# ─── Help ─────────────────────────────────────────────────────────────────────

show_help() {
    cat << 'EOF'
Usage: ./stop.sh [OPTIONS] [SERVICES...]

Stop ds-profile services. Stops all services by default.

OPTIONS:
  -v            Remove named volumes (WARNING: destroys db + storage data)
  -a            Remove orphaned containers too
  -e ENV        Environment: dev (default), prod
  -h            Show this help

SERVICES (space or comma separated):
  all           All services (default)
  infra         Infrastructure: db, storage, parser
  api           Backend API
  ui            Frontend
  db            PostgreSQL only
  storage       MinIO only
  parser        Unstructured parser only
  frontend      Frontend only
  backend       Backend API only

EXAMPLES:
  ./stop.sh                       # Stop all services
  ./stop.sh api                   # Stop API only
  ./stop.sh infra                 # Stop db + storage + parser
  ./stop.sh -v                    # Stop all + remove volumes
  ./stop.sh -a                    # Stop all + remove orphans
  ./stop.sh -e prod               # Stop prod environment
  ./stop.sh db storage            # Stop db and storage only
EOF
}

# ─── Parse Options ────────────────────────────────────────────────────────────

while [[ $# -gt 0 ]]; do
    case "$1" in
        -v) REMOVE_VOLUMES=true; shift ;;
        -a) REMOVE_ORPHANS=true; shift ;;
        -e) ENVIRONMENT="$2"; shift 2 ;;
        -h|--help) show_help; exit 0 ;;
        -*) error "Unknown option: $1"; show_help; exit 1 ;;
        *) break ;;
    esac
done

case "$ENVIRONMENT" in
    dev|prod) ;;
    *) warn "Unknown environment '$ENVIRONMENT', defaulting to dev"; ENVIRONMENT="dev" ;;
esac

# ─── Service Alias → Compose Service Name ─────────────────────────────────────

map_service() {
    case "$1" in
        backend|api)    echo "api" ;;
        ui|frontend)    echo "frontend" ;;
        postgres|db)    echo "db" ;;
        minio|storage)  echo "storage" ;;
        parser)         echo "parser" ;;
        *)              echo "$1" ;;
    esac
}

expand_layer() {
    case "$1" in
        all)   echo "db storage parser api frontend" ;;
        infra) echo "db storage parser" ;;
        api)   echo "api" ;;
        ui)    echo "frontend" ;;
        *)     echo "$(map_service "$1")" ;;
    esac
}

# ─── Resolve Services ─────────────────────────────────────────────────────────

RAW_SERVICES="${*:-all}"
RAW_SERVICES=$(echo "$RAW_SERVICES" | tr ',' ' ')

SERVICES=""
for svc in $RAW_SERVICES; do
    SERVICES="$SERVICES $(expand_layer "$svc")"
done
SERVICES=$(echo "$SERVICES" | tr -s ' ' | sed 's/^ //')

UNIQUE_SERVICES=""
for svc in $SERVICES; do
    if [[ ! " $UNIQUE_SERVICES " =~ " $svc " ]]; then
        UNIQUE_SERVICES="$UNIQUE_SERVICES $svc"
    fi
done
SERVICES=$(echo "$UNIQUE_SERVICES" | sed 's/^ //')

STOP_ALL=false
[[ "$SERVICES" == "db storage parser api frontend" ]] && STOP_ALL=true

# ─── Compose File Selection ───────────────────────────────────────────────────

cd "$SCRIPT_DIR/infrastructure"
COMPOSE_FILES="-f docker-compose.yml"
[[ -f "docker-compose.${ENVIRONMENT}.yml" ]] && \
    COMPOSE_FILES="$COMPOSE_FILES -f docker-compose.${ENVIRONMENT}.yml"

DOCKER_COMPOSE=$(get_docker_compose_cmd)
DC="$DOCKER_COMPOSE $COMPOSE_FILES"

# ─── Main ─────────────────────────────────────────────────────────────────────

shout "ds-profile — Stop"
info "Environment:  $ENVIRONMENT"
info "Services:     $SERVICES"
[[ "$REMOVE_VOLUMES" == "true" ]] && warn "Volumes:      will be REMOVED"
[[ "$REMOVE_ORPHANS" == "true" ]] && info "Orphans:      will be removed"

line_break

if [[ "$REMOVE_VOLUMES" == "true" ]]; then
    warn "This will permanently destroy database and storage data!"
    echo ""
    printf "Confirm? [y/N]: "
    read -r confirm
    if [[ ! "$confirm" =~ ^[yY]$ ]]; then
        info "Aborted."
        exit 0
    fi
    line_break
fi

log_section "Stopping"

if [[ "$STOP_ALL" == "true" ]]; then
    DOWN_FLAGS="--remove-orphans"
    [[ "$REMOVE_VOLUMES" == "true" ]] && DOWN_FLAGS="$DOWN_FLAGS -v"
    $DC down $DOWN_FLAGS 2>/dev/null || true
else
    $DC stop $SERVICES 2>/dev/null || true
    if [[ "$REMOVE_ORPHANS" == "true" ]]; then
        $DC rm -f $SERVICES 2>/dev/null || true
    fi
fi

success "Done. Run './restart.sh' or 'make dev' to start again."
