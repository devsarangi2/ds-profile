#!/bin/bash
# restart.sh — Restart ds-profile services
# Usage: ./restart.sh [-nsch] [-b SERVICE] [-e ENV] [SERVICES...]
#
# Builds by default (docker layer cache keeps it fast).
# Use -n to skip the build step entirely.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/scripts/script-support.sh"

# ─── Defaults ─────────────────────────────────────────────────────────────────

ENVIRONMENT="dev"
DO_BUILD=true        # build by default — layer cache keeps this fast
BUILD_TARGET=""
SKIP_RUNNING=false
CLEAN_RESTART=false

# ─── Help ─────────────────────────────────────────────────────────────────────

show_help() {
    cat << 'EOF'
Usage: ./restart.sh [OPTIONS] [SERVICES...]

Restart ds-profile services (stop → build → start). Builds by default.

OPTIONS:
  -n            No build — skip the build step (use cached images)
  -b [SERVICE]  Force build a single service before restart
  -s            Skip running — only start stopped services (no recreate)
  -c            Clean restart: stop → remove volumes → rebuild + start
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
  ./restart.sh                    # Rebuild + restart all
  ./restart.sh -n                 # Restart all without rebuilding
  ./restart.sh api                # Rebuild + restart API only
  ./restart.sh -n api             # Restart API without rebuilding
  ./restart.sh -b api             # Force rebuild API, restart all
  ./restart.sh infra              # Rebuild + restart db + storage + parser
  ./restart.sh -c                 # Clean restart (wipes volumes)
  ./restart.sh -e prod            # Restart in prod environment
  ./restart.sh db storage         # Rebuild + restart db and storage
EOF
}

# ─── Parse Options ────────────────────────────────────────────────────────────

while [[ $# -gt 0 ]]; do
    case "$1" in
        -n) DO_BUILD=false; shift ;;
        -b)
            DO_BUILD=true
            if [[ -n "$2" && ! "$2" =~ ^- ]]; then
                BUILD_TARGET="$2"; shift
            fi
            shift ;;
        -s) SKIP_RUNNING=true; shift ;;
        -c) CLEAN_RESTART=true; DO_BUILD=true; shift ;;
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

shout "ds-profile — Restart"
info "Environment:  $ENVIRONMENT"
info "Services:     $SERVICES"
info "Build:        ${DO_BUILD}${BUILD_TARGET:+ (target: $BUILD_TARGET)}"
[[ "$SKIP_RUNNING" == "true" ]] && info "Mode:         skip-running (no recreate)"
[[ "$CLEAN_RESTART" == "true" ]] && info "Mode:         clean restart (volumes will be removed)"

line_break

# Phase 1: Stop
if [[ "$SKIP_RUNNING" != "true" ]]; then
    log_section "Stopping services"
    if [[ "$STOP_ALL" == "true" ]]; then
        $DC down --remove-orphans 2>/dev/null || true
    else
        $DC stop $SERVICES 2>/dev/null || true
    fi
    success "Services stopped"
fi

# Phase 2: Clean volumes (only on -c)
if [[ "$CLEAN_RESTART" == "true" ]]; then
    log_section "Removing project volumes"
    $DC down -v --remove-orphans 2>/dev/null || true
    success "Volumes removed"
fi

# Phase 3: Build
if [[ "$DO_BUILD" == "true" ]]; then
    log_section "Building"
    if [[ -n "$BUILD_TARGET" ]]; then
        $DC build "$(map_service "$BUILD_TARGET")" || { error "Build failed"; exit 1; }
    elif [[ "$STOP_ALL" == "true" ]]; then
        $DC build || { error "Build failed"; exit 1; }
    else
        $DC build $SERVICES || { error "Build failed"; exit 1; }
    fi
    success "Build complete"
fi

# Phase 4: Start
log_section "Starting services"

UP_FLAGS="-d"
[[ "$SKIP_RUNNING" == "true" ]] && UP_FLAGS="$UP_FLAGS --no-recreate"

if [[ "$STOP_ALL" == "true" ]]; then
    $DC up $UP_FLAGS
else
    $DC up $UP_FLAGS $SERVICES
fi

success "Restart complete!"
line_break

info "Service endpoints:"
echo "  Frontend (dev):  http://localhost:${FRONTEND_DEV_PORT:-15173}"
echo "  Backend API:     http://localhost:${BACKEND_PORT:-18000}"
echo "  API Docs:        http://localhost:${BACKEND_PORT:-18000}/docs"
echo ""
echo "  Run './status.sh' to check health."
