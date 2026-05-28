"""Extract plain text from a source document (.txt / .pdf / .docx)."""
from __future__ import annotations

import re
import subprocess
import zipfile
from pathlib import Path

_ENTITIES = [("&amp;", "&"), ("&lt;", "<"), ("&gt;", ">"), ("&quot;", '"'), ("&apos;", "'")]


def extract_text(path) -> str:
    """Return the text content of a source file. Supports .txt, .pdf, .docx.

    Raises FileNotFoundError if missing, ValueError for unsupported types.
    """
    path = Path(path)
    if not path.exists():
        raise FileNotFoundError(path)
    suffix = path.suffix.lower()
    if suffix == ".txt":
        return path.read_text(encoding="utf-8", errors="ignore")
    if suffix == ".docx":
        return _extract_docx(path)
    if suffix == ".pdf":
        return _extract_pdf(path)
    raise ValueError(f"unsupported file type {suffix!r}; use .txt, .pdf, or .docx")


def _extract_docx(path: Path) -> str:
    xml = zipfile.ZipFile(path).read("word/document.xml").decode("utf-8", "ignore")
    xml = xml.replace("</w:p>", "\n")
    xml = re.sub(r"<w:tab[^>]*/>", "\t", xml)
    text = re.sub(r"<[^>]+>", "", xml)
    for a, b in _ENTITIES:
        text = text.replace(a, b)
    return "\n".join(line.rstrip() for line in text.split("\n") if line.strip())


def _extract_pdf(path: Path) -> str:
    result = subprocess.run(
        ["pdftotext", "-layout", str(path), "-"],
        capture_output=True, check=True,
    )
    return result.stdout.decode("utf-8", "ignore")
