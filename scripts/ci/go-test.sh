#!/usr/bin/env bash
set -euo pipefail
module=${1:?usage: go-test.sh server|runtime|cli|e2e}
case "$module" in server|runtime|cli|e2e) ;; *) echo "Unknown module: $module" >&2; exit 2 ;; esac
root=$(cd "$(dirname "$0")/../.." && pwd)
results="$root/.ci-results/$module"
mkdir -p "$results"
cd "$root/$module"
status=0
go test -race -count=1 -timeout=12m -json -coverprofile="$results/coverage.out" ./... > "$results/tests.jsonl" 2>&1 || status=$?
cat "$results/tests.jsonl"
# Preserve the tested command's exit code; a formatter must never hide failure.
if [ "$status" -ne 0 ]; then exit "$status"; fi
python3 "$root/scripts/ci/verify-go-tests.py" "$results/tests.jsonl"
