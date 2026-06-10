"""Render a draft markdown to a true-RTL Hebrew Word document.

Reuses the existing scripts (make_rtl_reference.py + rtl_postprocess.py) so the
RTL logic lives in one place.
"""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

from pipeline.scaffold import REPO_ROOT

SCRIPTS = REPO_ROOT / "scripts"
REFERENCE = SCRIPTS / "rtl-reference.docx"


def _ensure_reference() -> Path:
    if not REFERENCE.exists():
        subprocess.run(
            [sys.executable, str(SCRIPTS / "make_rtl_reference.py"), str(REFERENCE)],
            check=True,
        )
    return REFERENCE


def render(md_path, out_path=None) -> Path:
    """Render md_path to a .docx (RTL Hebrew). Returns the output path."""
    md_path = Path(md_path)
    out = Path(out_path) if out_path else md_path.with_suffix(".docx")
    ref = _ensure_reference()
    subprocess.run(
        ["pandoc", str(md_path), "-o", str(out), f"--reference-doc={ref}"],
        check=True,
    )
    subprocess.run(
        [sys.executable, str(SCRIPTS / "rtl_postprocess.py"), str(out)],
        check=True,
    )
    return out
