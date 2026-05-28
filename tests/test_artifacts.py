import pytest

from pipeline import scaffold

EXPECTED = {
    "strategy-document",
    "strategy-deck",
    "job-description",
    "org-structure",
    "workflows",
    "kpis",
}


def test_available_artifacts_lists_the_six_templates():
    assert set(scaffold.available_artifacts()) == EXPECTED


def test_template_for_returns_an_existing_markdown_path():
    path = scaffold.template_for("strategy-document")
    assert path.exists()
    assert path.suffix == ".md"


def test_template_for_unknown_raises():
    with pytest.raises(ValueError):
        scaffold.template_for("does-not-exist")
