#!/bin/bash
#
# check-ports.sh
# Finds which ports are currently in use (with process info) and checks
# whether a given list/range of ports is free on this VPS.
#
# Usage:
#   ./check-ports.sh                # show all listening ports + check common ports
#   ./check-ports.sh 3000 8080 5432 # also check these specific ports
#   ./check-ports.sh --range 3000-3010   # check a port range
#
# Run with sudo for full process names/PIDs (regular user often can't
# see PID/process of ports owned by other users, e.g. root-run services):
#   sudo ./check-ports.sh

set -euo pipefail

# ---- Colors for readable output -------------------------------------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m' # reset

# ---- Pick whichever tool is available (ss preferred, netstat fallback) ----
if command -v ss >/dev/null 2>&1; then
  LISTENER_CMD="ss -tulnp"
elif command -v netstat >/dev/null 2>&1; then
  LISTENER_CMD="netstat -tulnp"
else
  echo -e "${RED}Neither 'ss' nor 'netstat' found. Install with: sudo apt install iproute2${NC}"
  exit 1
fi

echo -e "${BOLD}=== Ports currently in use ===${NC}"
echo -e "${YELLOW}(Run this script with sudo to see process names/PIDs for all services)${NC}"
echo

# Print header
printf "%-6s %-22s %-8s %-s\n" "PROTO" "LOCAL ADDRESS:PORT" "PID" "PROCESS"
printf "%-6s %-22s %-8s %-s\n" "-----" "-------------------" "---" "-------"

# Parse ss/netstat output into a clean table
$LISTENER_CMD 2>/dev/null | awk 'NR>1 {print}' | while read -r line; do
  proto=$(echo "$line" | awk '{print $1}')
  local_addr=$(echo "$line" | awk '{print $5}')
  # ss puts process info in the last column as users:(("name",pid=1234,fd=5))
  proc_info=$(echo "$line" | grep -oP 'users:\(\("[^"]+",pid=\d+' || true)
  if [ -n "$proc_info" ]; then
    pname=$(echo "$proc_info" | grep -oP '"\K[^"]+')
    pid=$(echo "$proc_info" | grep -oP 'pid=\K\d+')
  else
    pname="-"
    pid="-"
  fi
  # Skip lines that aren't actual listen entries
  if [[ "$proto" == "tcp" || "$proto" == "udp" || "$proto" == "tcp6" || "$proto" == "udp6" ]]; then
    printf "%-6s %-22s %-8s %-s\n" "$proto" "$local_addr" "$pid" "$pname"
  fi
done | sort -u

echo
echo -e "${BOLD}=== Checking specific ports ===${NC}"
echo

# Collect all currently-used ports into a set for quick lookup
USED_PORTS=$($LISTENER_CMD 2>/dev/null | awk 'NR>1 {print $5}' | grep -oP ':\K[0-9]+$' | sort -un)

check_port() {
  local port=$1
  if echo "$USED_PORTS" | grep -qx "$port"; then
    echo -e "Port ${BOLD}$port${NC} -> ${RED}IN USE${NC}"
  else
    echo -e "Port ${BOLD}$port${NC} -> ${GREEN}AVAILABLE${NC}"
  fi
}

# ---- Decide what to check based on arguments -------------------------------
if [ "$#" -eq 0 ]; then
  # No args: check a default list of commonly used ports
  DEFAULT_PORTS=(21 22 25 53 80 443 3000 3306 5000 5432 6379 8000 8080 8443 9000 27017)
  echo -e "${YELLOW}No ports specified, checking common defaults:${NC}"
  for p in "${DEFAULT_PORTS[@]}"; do
    check_port "$p"
  done

elif [ "$1" == "--range" ] && [ -n "${2:-}" ]; then
  # Range mode: --range START-END
  IFS='-' read -r START END <<< "$2"
  echo -e "${YELLOW}Checking range $START-$END:${NC}"
  for ((p=START; p<=END; p++)); do
    check_port "$p"
  done

else
  # Specific ports passed as arguments
  echo -e "${YELLOW}Checking specified ports:${NC}"
  for p in "$@"; do
    check_port "$p"
  done
fi

echo
echo -e "${BOLD}Tip:${NC} run 'sudo ./check-ports.sh' for full process visibility on all ports."