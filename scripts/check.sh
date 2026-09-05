#!/bin/bash

# Quality check: format, lint (with --fix), typecheck, test.
# Used by agent stop hooks and runnable directly by other agents.
# Exit 0 = success, exit 2 = blocking error (stderr shown to the agent).

cd "${PROJECT_DIR:-${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}}" || exit 0

CHECK_OUTPUT=$(npm run check 2>&1)
CHECK_EXIT=$?

if [ $CHECK_EXIT -ne 0 ]; then
    echo "Quality checks failed:" >&2
    echo "$CHECK_OUTPUT" >&2
    exit 2
fi

exit 0
