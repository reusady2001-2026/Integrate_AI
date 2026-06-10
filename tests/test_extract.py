import shutil

import pytest

from pipeline import extract


def test_extract_txt(tmp_path):
    f = tmp_path / "src.txt"
    f.write_text("Hello plain שלום", encoding="utf-8")
    assert "Hello plain שלום" in extract.extract_text(f)


def test_extract_docx(tmp_path):
    docx = pytest.importorskip("docx")
    f = tmp_path / "src.docx"
    d = docx.Document()
    d.add_paragraph("Hello DOCX")
    d.add_paragraph("שלום עולם")
    d.save(f)
    text = extract.extract_text(f)
    assert "Hello DOCX" in text
    assert "שלום עולם" in text


def test_extract_unsupported_extension_raises(tmp_path):
    f = tmp_path / "src.rtf"
    f.write_text("x", encoding="utf-8")
    with pytest.raises(ValueError):
        extract.extract_text(f)


def test_extract_missing_file_raises(tmp_path):
    with pytest.raises(FileNotFoundError):
        extract.extract_text(tmp_path / "nope.txt")


@pytest.mark.skipif(shutil.which("pdftotext") is None, reason="poppler not installed")
def test_extract_pdf(tmp_path):
    # Minimal PDF with extractable text; poppler reconstructs the xref if needed.
    pdf = tmp_path / "src.pdf"
    pdf.write_bytes(_MINIMAL_PDF)
    assert "Hello PDF" in extract.extract_text(pdf)


_MINIMAL_PDF = (
    b"%PDF-1.4\n"
    b"1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
    b"2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n"
    b"3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 300 200]"
    b"/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj\n"
    b"4 0 obj<</Length 46>>stream\n"
    b"BT /F1 24 Tf 20 100 Td (Hello PDF) Tj ET\n"
    b"endstream endobj\n"
    b"5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\n"
    b"trailer<</Root 1 0 R>>\n"
    b"%%EOF\n"
)
