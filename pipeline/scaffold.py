"""Scaffold a working draft from a template."""
from __future__ import annotations

import re


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
