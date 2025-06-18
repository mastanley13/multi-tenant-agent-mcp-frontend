#!/usr/bin/env bash
set -euo pipefail

# Fail if any source file (ts, js) contains obvious credential prints
PATTERN='access_token\|refresh_token\|Bearer'

matches=$(grep -R --line-number --color=never -E "$PATTERN" backend client | grep -vE 'Bearer \[REDACTED\]' || true)

if [[ -n "$matches" ]]; then
  echo "❌ Potential secret prints found:"
  echo "$matches"
  exit 1
fi

echo "✅ No credential leaks detected" 