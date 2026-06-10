import shutil
import zipfile

import pytest

from pipeline import render, scaffold

pytestmark = pytest.mark.skipif(
    shutil.which("pandoc") is None, reason="pandoc not installed"
)


def test_render_produces_rtl_docx(tmp_path):
    pytest.importorskip("docx")
    md = scaffold.scaffold_draft("kpis", tmp_path)
    out = render.render(md)
    assert out.exists()
    assert out.suffix == ".docx"
    doc = zipfile.ZipFile(out).read("word/document.xml").decode("utf-8", "ignore")
    # true RTL: section base direction is bidi
    assert "<w:bidi" in doc.split("<w:sectPr")[-1]
    # fill tokens were expanded to underscore lines
    assert "«FILL»" not in doc


def test_render_respects_explicit_output_path(tmp_path):
    pytest.importorskip("docx")
    md = scaffold.scaffold_draft("kpis", tmp_path)
    out = tmp_path / "custom.docx"
    result = render.render(md, out)
    assert result == out
    assert out.exists()
