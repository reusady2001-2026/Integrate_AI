#!/usr/bin/env bash
# Render every Markdown template under templates/ to a distributable RTL .docx.
#
# Requirements: pandoc, python3 + python-docx.
# Output: dist/word/<template-name>.docx
#
# Usage: bash scripts/render-docx.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

REF="scripts/rtl-reference.docx"
OUT="dist/word"
mkdir -p "$OUT"

# Build the RTL reference doc once.
if [ ! -f "$REF" ]; then
  python3 scripts/make_rtl_reference.py "$REF"
fi

shopt -s nullglob
for md in templates/*/*.md; do
  name="$(basename "$(dirname "$md")")"
  dest="$OUT/${name}.docx"
  pandoc "$md" -o "$dest" --reference-doc="$REF"
  echo "rendered: $md -> $dest"
done

echo "Done. Word files in $OUT/"
