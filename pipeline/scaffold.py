"""Scaffold a working draft from a template."""
from __future__ import annotations

import re
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
TEMPLATES_DIR = REPO_ROOT / "templates"


def available_artifacts() -> list[str]:
    """Artifact names = subdirectories of templates/ that contain a markdown template."""
    return sorted(
        d.name
        for d in TEMPLATES_DIR.iterdir()
        if d.is_dir() and any(d.glob("*.md"))
    )


def template_for(artifact: str) -> Path:
    """Resolve the markdown template for an artifact. Raises ValueError if unknown."""
    mds = sorted((TEMPLATES_DIR / artifact).glob("*.md")) if (TEMPLATES_DIR / artifact).is_dir() else []
    if not mds:
        raise ValueError(
            f"unknown artifact {artifact!r}; choose one of: {', '.join(available_artifacts())}"
        )
    return mds[0]


def scaffold_draft(artifact: str, dest_dir) -> Path:
    """Copy an artifact's template into dest_dir/<artifact>.md, stripping the
    leading HTML-comment meta block (agent/author instructions). Returns the path.
    """
    template = template_for(artifact)  # raises ValueError on unknown artifact
    text = template.read_text(encoding="utf-8")
    body = re.sub(r"\A<!--.*?-->\s*", "", text, count=1, flags=re.DOTALL)
    dest_dir = Path(dest_dir)
    dest_dir.mkdir(parents=True, exist_ok=True)
    out = dest_dir / f"{artifact}.md"
    out.write_text(body, encoding="utf-8")
    return out


def slugify(name: str) -> str:
    """Turn a name into a filesystem-safe ascii slug.

    Lowercases, turns runs of non-alphanumeric characters into single hyphens,
    and trims hyphens. Raises ValueError if nothing safe remains (e.g. a purely
    non-ascii name) — the caller should pass an explicit slug in that case.
    """
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    if not slug:
        raise ValueError(f"could not derive a slug from {name!r}; pass an explicit --slug")
    return slug
