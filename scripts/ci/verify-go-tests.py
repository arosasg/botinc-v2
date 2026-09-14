#!/usr/bin/env python3
"""Reject empty or skipped suites even when go test exits successfully."""
import json
import pathlib
import sys

path = pathlib.Path(sys.argv[1])
events = [json.loads(line) for line in path.read_text().splitlines() if line.strip()]
passed = {(e['Package'], e['Test']) for e in events if e.get('Action') == 'pass' and e.get('Test')}
failed = [e for e in events if e.get('Action') == 'fail']
skipped = [e for e in events if e.get('Action') == 'skip' and e.get('Test')]
started = {(e['Package'], e['Test']) for e in events if e.get('Action') == 'run' and e.get('Test')}
if not passed or failed or skipped or started != passed:
    sys.exit(f'Incomplete test execution: {len(passed)} passed, {len(failed)} failures, '
             f'{len(skipped)} skips, {len(started - passed)} unfinished')
print(f'Verified {len(passed)} named tests passed with no skips.')
