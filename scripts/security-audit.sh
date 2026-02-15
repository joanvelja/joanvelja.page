#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if command -v bun &>/dev/null; then
    output=$(bun audit 2>&1) || true
    if echo "$output" | grep -qi "vulnerabilit" && ! echo "$output" | grep -qi "no vulnerabilities"; then
        echo "SECURITY: bun audit found vulnerabilities:"
        echo "$output"
    fi
else
    if [ -f package-lock.json ]; then
        output=$(npm audit --omit=dev --audit-level=moderate 2>&1) || true
        if echo "$output" | grep -qi "vulnerabilit" && ! echo "$output" | grep -qi "0 vulnerabilities"; then
            echo "SECURITY: npm audit found vulnerabilities:"
            echo "$output"
        fi
    fi
fi
