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
    # Right-alignment comes from bidi (RTL default = start = right). Do NOT set
    # jc="right": Word treats that as the logical end (physical LEFT) in a bidi
    # paragraph. Strip any inherited jc so nothing forces left/justify.
    pPr = p._p.get_or_add_pPr()
    ensure_bidi(pPr)
    jc = pPr.find(qn("w:jc"))
    if jc is not None:
        pPr.remove(jc)
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


def center_paragraph(p):
    """Center a paragraph (used for table header rows). Center is symmetric, so
    it is unaffected by the RTL jc start/end flip."""
    pPr = p._p.get_or_add_pPr()
    jc = pPr.find(qn("w:jc"))
    if jc is None:
        jc = OxmlElement("w:jc")
        # jc belongs after bidi; appending is fine since pPr here ends with rPr at most
        pPr.append(jc)
    jc.set(qn("w:val"), "center")


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
        # Center the header row (first row); body rows stay right-aligned.
        if tbl.rows:
            for cell in tbl.rows[0].cells:
                for p in cell.paragraphs:
                    center_paragraph(p)
    doc.save(path)
    print("rtl-postprocessed:", path)


if __name__ == "__main__":
    process(sys.argv[1])
