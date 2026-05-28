#!/usr/bin/env python3
"""Force true RTL on a pandoc-generated .docx and expand fill-in tokens.

Run after pandoc. It:
  • replaces the «FILL» token with an underscore fill-in line,
  • removes the «SPACER» token (leaving an empty paragraph for writing space),
  • adds <w:bidi/> + right alignment to every paragraph (true RTL flow),
  • adds <w:bidiVisual/> to every table (column order starts from the right),
  • marks runs as <w:rtl/>.

Usage: python3 scripts/rtl_postprocess.py <file.docx>
"""
import sys
from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

FILL_LINE = "_" * 55

# pPr child order (subset) — bidi must precede these if they exist.
_AFTER_BIDI = (
    "w:adjustRightInd", "w:snapToGrid", "w:spacing", "w:ind",
    "w:contextualSpacing", "w:mirrorIndents", "w:suppressOverlap",
    "w:jc", "w:textDirection", "w:rPr", "w:sectPr",
)


def ensure_bidi(pPr):
    if pPr.find(qn("w:bidi")) is not None:
        return
    bidi = OxmlElement("w:bidi")
    anchor = None
    for tag in _AFTER_BIDI:
        anchor = pPr.find(qn(tag))
        if anchor is not None:
            break
    if anchor is not None:
        anchor.addprevious(bidi)
    else:
        pPr.append(bidi)


def rtl_paragraph(p):
    p.alignment = WD_ALIGN_PARAGRAPH.RIGHT          # correct <w:jc> placement
    ensure_bidi(p._p.get_or_add_pPr())
    for r in p._p.findall(qn("w:r")):
        rPr = r.find(qn("w:rPr"))
        if rPr is None:
            rPr = OxmlElement("w:rPr")
            r.insert(0, rPr)
        if rPr.find(qn("w:rtl")) is None:
            rPr.append(OxmlElement("w:rtl"))


def expand_tokens(p):
    if "«FILL»" not in p.text and "«SPACER»" not in p.text:
        return
    for run in p.runs:
        if "«FILL»" in run.text:
            run.text = run.text.replace("«FILL»", FILL_LINE)
        if "«SPACER»" in run.text:
            run.text = run.text.replace("«SPACER»", "")


def set_section_rtl(sectPr):
    """Set the section base direction to RTL (the document-level switch)."""
    if sectPr.find(qn("w:bidi")) is None:
        sectPr.append(OxmlElement("w:bidi"))


def process(path):
    doc = Document(path)
    for section in doc.sections:
        set_section_rtl(section._sectPr)
    for p in doc.paragraphs:
        expand_tokens(p)
        rtl_paragraph(p)
    for tbl in doc.tables:
        tblPr = tbl._tbl.tblPr
        if tblPr.find(qn("w:bidiVisual")) is None:
            tblPr.append(OxmlElement("w:bidiVisual"))
        for row in tbl.rows:
            for cell in row.cells:
                for p in cell.paragraphs:
                    expand_tokens(p)
                    rtl_paragraph(p)
    doc.save(path)
    print("rtl-postprocessed:", path)


if __name__ == "__main__":
    process(sys.argv[1])
