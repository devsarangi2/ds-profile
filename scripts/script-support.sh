#!/bin/bash
# script-support.sh — Shared utility functions for shell scripts
# Source this file: source "$SCRIPT_DIR/scripts/script-support.sh"
# Based on ea-companion pattern (latest version)

BOLD='\033[1m'
DIM='\033[2m'
ULINE='\033[4m'

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[0;30m'
BLACK='\033[0;37m'
NO_COLOR='\033[0m'
NORMAL='\033[0m'

CLEAR_LINE='\033[1G\033[K'

# --- Logging (printf-based for portability) ---

function info() {
    printf "${CYAN}[INFO] %s ${NO_COLOR}\n" "$1"
}

function warn() {
    printf "${YELLOW}[WARN] %s ${NO_COLOR}\n" "$1"
}

function error() {
    echo ""
    printf "${RED}[ERROR] %s ${NO_COLOR}\n" "$1"
    echo ""
}

function success() {
    printf "${GREEN}[SUCCESS] %s ${NO_COLOR}\n" "$1"
}

function stat() {
    printf "${MAGENTA}[STAT] %s ${NO_COLOR}\n" "$1"
}

function print() {
    info "$1"
}

# --- Formatting ---

function line_break() {
    echo ""
}

function log_section() {
    line_break
    printf "${CYAN}--- %s ---${NO_COLOR}\n" "$1"
}

function line() {
    echo "========================================================="
    if [[ $# -ge 1 ]]; then
        echo "$1"
        echo "========================================================="
    fi
}

function shout() {
    local message=$1
    line_break
    line
    printf "     ${BOLD}${ULINE}%s${NO_COLOR}\n" "$message"
    line
    line_break
}

# --- Port Management ---

# Legacy function - use check_port_available instead
function close_existing_ports() {
    info "Closing conflicting ports"
    local PORT_NUM=$1
    local port_in_use
    port_in_use=$(lsof -i :"${PORT_NUM}" | grep LISTEN | grep -v grep | wc -l | tr -d '[:space:]' || echo 0)
    if [ "$port_in_use" -ne "0" ]; then
        error "Port $1 is in use. Killing process..."
        lsof -i :"$1" | grep LISTEN | grep -v grep | awk '{print $2}' | xargs kill -9 2>/dev/null || true
        success "Closed port ${PORT_NUM}"
    fi
}

# Check if a port is available. If not, show process info and ask user what to do.
# Usage: check_port_available <port> <service_name> [--kill-if-docker]
# Returns: 0 if port is available (or was freed), 1 if user chose to abort
function check_port_available() {
    local port="$1"
    local service_name="$2"
    local auto_kill_docker="${3:-}"

    local pid=$(lsof -ti :"$port" -sTCP:LISTEN 2>/dev/null | head -1)

    if [[ -z "$pid" ]]; then
        return 0
    fi

    local process_info=$(ps -p "$pid" -o comm=,args= 2>/dev/null | head -1)
    local process_name=$(ps -p "$pid" -o comm= 2>/dev/null)

    local is_docker=false
    if [[ "$process_name" == *"docker"* ]] || [[ "$process_name" == "com.docker"* ]] || \
       [[ "$process_info" == *"colima"* ]] || [[ "$process_info" == *"lima"* ]]; then
        is_docker=true
    fi

    warn "Port $port is already in use by:"
    echo "  PID: $pid"
    echo "  Process: $process_info"

    if [[ "$is_docker" == "true" ]] && [[ "$auto_kill_docker" == "--kill-if-docker" ]]; then
        info "Docker process detected - will be handled by docker-compose"
        return 0
    fi

    echo ""
    echo "Options:"
    echo "  [k] Kill the process and continue"
    echo "  [a] Abort"
    echo ""
    printf "What would you like to do? [k/a]: "
    read choice

    case "$choice" in
        k|K)
            info "Killing process $pid..."
            kill -9 "$pid" 2>/dev/null || true
            sleep 1
            if lsof -ti :"$port" -sTCP:LISTEN >/dev/null 2>&1; then
                error "Failed to kill process on port $port"
                return 1
            fi
            success "Port $port is now available"
            return 0
            ;;
        *)
            info "Aborted by user"
            return 1
            ;;
    esac
}

# Check multiple ports at once
# Usage: check_ports_available <service_name> <port1> [port2] [port3] ...
# Returns: 0 if all ports available, 1 if any port blocked and user aborted
function check_ports_available() {
    local service_name="$1"
    shift
    local ports=("$@")

    for port in "${ports[@]}"; do
        if ! check_port_available "$port" "$service_name"; then
            return 1
        fi
    done
    return 0
}

# --- File/Directory Utilities ---

function checkOrCreateDir() {
    local dirPath=$1
    if [[ ! -d "${dirPath}" ]]; then
        info "Dir NOT found. Creating: ${dirPath}"
        mkdir -p "${dirPath}"
    fi
}

function wait_time() {
    if [[ $# -eq 1 ]]; then
        local seconds=$1
        info "Waiting for ${seconds} secs"
    else
        local seconds=0
    fi
    sleep "$seconds"
}

function forceDeleteFile() {
    local FILE_PATTERN=$1
    warn "Force delete files with pattern ${FILE_PATTERN}"
    find . -type f -name "${FILE_PATTERN}" -print -delete
}

function cleanEmptyFiles() {
    local FILE_PATTERN=$1
    warn "Deleting empty files with pattern \"${FILE_PATTERN}\""
    find . -type f -name "${FILE_PATTERN}" -empty -delete
}

function cleanAllEmptyFiles() {
    wait_time "${1:-0}"
    warn "Deleting empty .log or .bad files"
    cleanEmptyFiles "*.bad"
    cleanEmptyFiles "*.log"
}

function cleanFileWithoutKeyword() {
    local FILE_TYPE=$1
    local SEARCH_KEYWORD=$2
    info "Deleting ${FILE_TYPE} files without keyword \"${SEARCH_KEYWORD}\""
    find . -type f -name "${FILE_TYPE}" '!' -exec grep -q "${SEARCH_KEYWORD}" {} \; -delete
}

function cleanFileWithKeyword() {
    local FILE_TYPE=$1
    local SEARCH_KEYWORD=$2
    warn "Deleting ${FILE_TYPE} files with keyword \"${SEARCH_KEYWORD}\""
    find . -type f -name "${FILE_TYPE}" -exec grep -q "${SEARCH_KEYWORD}" {} \; -delete
}

# --- Docker Compose Detection ---

function get_docker_compose_cmd() {
    if docker compose version >/dev/null 2>&1; then
        echo "docker compose"
    elif command -v docker-compose >/dev/null 2>&1; then
        echo "docker-compose"
    else
        error "Neither 'docker compose' (V2) nor 'docker-compose' (V1) found"
        error "Please install Docker Compose: https://docs.docker.com/compose/install/"
        exit 1
    fi
}

# --- Architecture Detection ---

if [[ -z "${IS_ARM}" ]]; then
    IS_ARM=$(uname -p)
    export IS_ARM="${IS_ARM}"
fi
