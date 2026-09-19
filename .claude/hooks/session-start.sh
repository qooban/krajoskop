#!/usr/bin/env bash
#
# SessionStart hook for Claude Code on the web.
#
# Gets a fresh container to the point where `pnpm check` works, and reports
# which geospatial command-line tools are present. Under ADR 0002 the heavy
# raster work lives in GDAL, WhiteboxTools and GRASS rather than in a library,
# so whether they are installed decides which tests can run at all. Saying so
# at startup beats discovering it halfway through a task.
#
# Runs synchronously: the session waits. That is the right trade here, because
# the alternative is a race where the agent runs tests before node_modules
# exists and draws the wrong conclusion from the failure.

set -euo pipefail

# Local machines have their own setup; this is for the remote container only.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"

# packageManager in package.json pins the exact pnpm version; corepack honours
# it. Without this a container without pnpm fails on the next line.
if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm not found, enabling corepack"
  corepack enable >/dev/null 2>&1 || true
fi

# --frozen-lockfile matches CI, so a lockfile that has drifted is caught here
# rather than at the end of a session. It should not stop the session starting,
# though, so the fallback resolves instead of failing.
if ! pnpm install --frozen-lockfile; then
  echo "WARNING: the lockfile is out of date with package.json."
  echo "         Installing without --frozen-lockfile; commit the updated lockfile."
  pnpm install
fi

echo
echo "Geospatial tools:"
for tool in gdalinfo whitebox_tools grass; do
  if command -v "$tool" >/dev/null 2>&1; then
    echo "  present  $tool"
  else
    echo "  ABSENT   $tool"
  fi
done
echo
echo "Tests needing those tools are tagged and skipped by default; the"
echo "default run stays fast. See docs/harness.md."
echo
echo "Ready. 'pnpm check' runs format, lint, types and tests."
