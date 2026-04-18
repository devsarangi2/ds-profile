#!/bin/bash
# status.sh — ds-profile service health check
# Checks running containers and HTTP endpoints

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/scripts/script-support.sh"

DEV_PORT="${DEV_PORT:-14321}"
PREVIEW_PORT="${PREVIEW_PORT:-14322}"

shout "ds-profile — Service Status"

echo ""
echo "  Service Endpoints:"
echo ""
echo "    Dev (local npm):    http://localhost:4321"
echo "    Dev (Docker):       http://localhost:${DEV_PORT}"
echo "    Preview (Nginx):    http://localhost:${PREVIEW_PORT}"
echo ""

# --- Helper: check HTTP endpoint ---
check_http() {
    local url="$1"
    local name="$2"
    if curl -sf --max-time 3 "$url" >/dev/null 2>&1; then
        success "$name  →  UP  ($url)"
        return 0
    else
        warn    "$name  →  DOWN  ($url)"
        return 1
    fi
}

# --- Helper: check Docker container ---
check_container() {
    local container="$1"
    local name="$2"
    local status
    status=$(docker inspect --format='{{.State.Status}}' "$container" 2>/dev/null || echo "not found")
    local health
    health=$(docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$container" 2>/dev/null || echo "none")

    case "$status" in
        running)
            if [[ "$health" == "healthy" ]]; then
                success "$name container  →  RUNNING / HEALTHY"
            elif [[ "$health" == "starting" ]]; then
                warn    "$name container  →  RUNNING / STARTING"
            elif [[ "$health" == "unhealthy" ]]; then
                error   "$name container  →  RUNNING / UNHEALTHY"
            else
                success "$name container  →  RUNNING"
            fi
            ;;
        exited|dead)
            warn "$name container  →  STOPPED ($status)"
            ;;
        "not found")
            stat "$name container  →  NOT FOUND"
            ;;
        *)
            info "$name container  →  $status"
            ;;
    esac
}

log_section "Containers"
check_container "dsp-site-dev" "Dev (Docker)"
check_container "dsp-site"     "Preview (Nginx)"

log_section "HTTP Endpoints"
HEALTHY=0
TOTAL=0

# Dev local
TOTAL=$((TOTAL + 1))
if check_http "http://localhost:4321" "Dev local (npm)"; then HEALTHY=$((HEALTHY + 1)); fi

# Dev Docker
TOTAL=$((TOTAL + 1))
if check_http "http://localhost:${DEV_PORT}" "Dev Docker"; then HEALTHY=$((HEALTHY + 1)); fi

# Preview Nginx
TOTAL=$((TOTAL + 1))
if check_http "http://localhost:${PREVIEW_PORT}" "Preview Nginx"; then HEALTHY=$((HEALTHY + 1)); fi

log_section "Summary"
echo "  $HEALTHY / $TOTAL endpoints reachable"
echo ""

if [[ "$HEALTHY" -eq 0 ]]; then
    warn "No services running. Use 'make dev' or 'make preview' to start."
fi

# Exit non-zero if any service that has a running container is unhealthy
DEV_RUNNING=$(docker inspect --format='{{.State.Status}}' "dsp-site-dev" 2>/dev/null || echo "not found")
PREVIEW_RUNNING=$(docker inspect --format='{{.State.Status}}' "dsp-site" 2>/dev/null || echo "not found")

if [[ "$DEV_RUNNING" == "running" ]] || [[ "$PREVIEW_RUNNING" == "running" ]]; then
    if [[ "$HEALTHY" -eq 0 ]]; then
        exit 1
    fi
fi

exit 0
