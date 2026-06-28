#!/bin/bash
# status.sh — ds-profile service health check
# Checks all Docker services and HTTP endpoints

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/scripts/script-support.sh"

# ─── Port Config ──────────────────────────────────────────────────────────────

FRONTEND_PORT="${FRONTEND_PORT:-13000}"
FRONTEND_DEV_PORT="${FRONTEND_DEV_PORT:-15173}"
BACKEND_PORT="${BACKEND_PORT:-18000}"
DB_PORT="${DB_PORT:-15432}"
STORAGE_PORT="${STORAGE_PORT:-19000}"
STORAGE_CONSOLE_PORT="${STORAGE_CONSOLE_PORT:-19001}"
PARSER_PORT="${PARSER_PORT:-18001}"

# ─── Service Endpoints ────────────────────────────────────────────────────────

shout "ds-profile — Service Status"

echo ""
info "Service Endpoints:"
echo ""
echo "  Frontend (dev):   http://localhost:${FRONTEND_DEV_PORT}"
echo "  Frontend (prod):  http://localhost:${FRONTEND_PORT}"
echo "  Backend API:      http://localhost:${BACKEND_PORT}"
echo "  API Docs:         http://localhost:${BACKEND_PORT}/docs"
echo "  PostgreSQL:       postgresql://dsprofile@localhost:${DB_PORT}/dsprofile"
echo "  MinIO API:        http://localhost:${STORAGE_PORT}"
echo "  MinIO Console:    http://localhost:${STORAGE_CONSOLE_PORT}"
echo "  Parser:           http://localhost:${PARSER_PORT}"
echo ""

# ─── Health Check Functions ───────────────────────────────────────────────────

HEALTHY=0
TOTAL=0

check_container() {
    local name="$1"
    local label="$2"
    TOTAL=$((TOTAL + 1))

    local status
    status=$(docker inspect --format='{{.State.Status}}' "$name" 2>/dev/null || echo "not_found")

    if [[ "$status" == "not_found" ]]; then
        printf "${DIM}  $label ($name): NOT FOUND${NO_COLOR}\n"
        return
    fi

    local health
    health=$(docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$name" 2>/dev/null || echo "none")

    case "$status" in
        running)
            if [[ "$health" == "healthy" ]]; then
                success "  $label ($name): HEALTHY"
                HEALTHY=$((HEALTHY + 1))
            elif [[ "$health" == "starting" ]]; then
                warn "  $label ($name): STARTING"
            elif [[ "$health" == "unhealthy" ]]; then
                error "  $label ($name): UNHEALTHY"
            else
                success "  $label ($name): RUNNING"
                HEALTHY=$((HEALTHY + 1))
            fi
            ;;
        exited|dead)
            warn "  $label ($name): STOPPED"
            ;;
        *)
            info "  $label ($name): $status"
            ;;
    esac
}

check_http() {
    local label="$1"
    local url="$2"
    TOTAL=$((TOTAL + 1))

    local http_code
    http_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 3 "$url" 2>/dev/null || echo "000")

    if [[ "$http_code" =~ ^[23] ]]; then
        success "  $label: HEALTHY (HTTP $http_code)"
        HEALTHY=$((HEALTHY + 1))
    elif [[ "$http_code" == "000" ]]; then
        printf "${DIM}  $label: DOWN (no response)${NO_COLOR}\n"
    else
        warn "  $label: DEGRADED (HTTP $http_code)"
    fi
}

# ─── Container Status ─────────────────────────────────────────────────────────

log_section "Container Health"
echo ""

check_container "dsp-db"       "PostgreSQL"
check_container "dsp-storage"  "MinIO"
check_container "dsp-parser"   "Parser"
check_container "dsp-api"      "Backend API"
check_container "dsp-frontend" "Frontend (prod)"

# Also check dev frontend if running
dev_running=$(docker inspect --format='{{.State.Status}}' "dsp-frontend-dev" 2>/dev/null || echo "not_found")
if [[ "$dev_running" == "running" ]]; then
    check_container "dsp-frontend-dev" "Frontend (dev)"
fi

# ─── HTTP Endpoint Checks ─────────────────────────────────────────────────────

log_section "HTTP Endpoints"
echo ""

check_http "Backend /health"        "http://localhost:${BACKEND_PORT}/health"
check_http "API Docs /docs"         "http://localhost:${BACKEND_PORT}/docs"
check_http "MinIO API"              "http://localhost:${STORAGE_PORT}/minio/health/live"
check_http "Parser /healthcheck"    "http://localhost:${PARSER_PORT}/healthcheck"

# Check frontend dev if port is responding
if curl -s --max-time 1 "http://localhost:${FRONTEND_DEV_PORT}" >/dev/null 2>&1; then
    check_http "Frontend dev server"  "http://localhost:${FRONTEND_DEV_PORT}"
fi

# ─── Summary ──────────────────────────────────────────────────────────────────

echo ""
line
if [[ "$HEALTHY" -eq "$TOTAL" ]] && [[ "$TOTAL" -gt 0 ]]; then
    success "All services healthy: $HEALTHY/$TOTAL"
    exit 0
elif [[ "$HEALTHY" -gt 0 ]]; then
    warn "Partial: $HEALTHY/$TOTAL services healthy"
    exit 1
else
    error "No services running ($HEALTHY/$TOTAL)"
    exit 1
fi
