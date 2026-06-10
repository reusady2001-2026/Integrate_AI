from pipeline import scaffold


def test_scaffold_draft_creates_file_in_dest(tmp_path):
    out = scaffold.scaffold_draft("kpis", tmp_path)
    assert out == tmp_path / "kpis.md"
    assert out.exists()


def test_scaffold_draft_strips_leading_comment_block(tmp_path):
    out = scaffold.scaffold_draft("kpis", tmp_path)
    text = out.read_text(encoding="utf-8")
    assert "<!--" not in text  # the meta/instructions block is removed
    assert text.lstrip().startswith("#")  # body starts at the first heading


def test_scaffold_draft_keeps_body_content(tmp_path):
    out = scaffold.scaffold_draft("kpis", tmp_path)
    text = out.read_text(encoding="utf-8")
    assert "KPIs & Metrics" in text  # the H1 survived
    assert "«FILL»" in text  # fill tokens preserved for rendering


def test_scaffold_draft_unknown_artifact_raises(tmp_path):
    import pytest

    with pytest.raises(ValueError):
        scaffold.scaffold_draft("nope", tmp_path)
