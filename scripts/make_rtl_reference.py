#!/usr/bin/env python3
"""Build a pandoc reference .docx whose styles default to RTL Hebrew.

Usage: python3 scripts/make_rtl_reference.py <output.docx>
The output is passed to pandoc via --reference-doc to render the bilingual
Markdown templates as right-to-left Word documents.
"""
import subprocess
import sys
from docx import Document
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

HEBREW_FONT = "David"  # widely available Hebrew serif; falls back gracefully


def set_rtl(style):
    """Mark a paragraph style as RTL with a Hebrew CS font.

    Note: we do NOT set <w:jc>. In a bidi (RTL) paragraph, Word aligns to the
    start side (the right) by default, and treats jc="right" as the logical end
    (physical LEFT). Real Word-authored Hebrew docs right-align via bidi alone —
    we mirror that here and strip any inherited jc.
    """
    el = style.element
    pPr = el.find(qn("w:pPr"))
    if pPr is None:
        pPr = OxmlElement("w:pPr")
        el.append(pPr)
    if pPr.find(qn("w:bidi")) is None:
        pPr.append(OxmlElement("w:bidi"))
    jc = pPr.find(qn("w:jc"))
    if jc is not None:
        pPr.remove(jc)

    rPr = el.find(qn("w:rPr"))
    if rPr is None:
        rPr = OxmlElement("w:rPr")
        el.append(rPr)
    if rPr.find(qn("w:rtl")) is None:
        rPr.append(OxmlElement("w:rtl"))
    rFonts = rPr.find(qn("w:rFonts"))
    if rFonts is None:
        rFonts = OxmlElement("w:rFonts")
        rPr.append(rFonts)
    rFonts.set(qn("w:cs"), HEBREW_FONT)


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else "scripts/rtl-reference.docx"
    # Start from pandoc's default reference so every style pandoc uses exists.
    with open(out, "wb") as fh:
        subprocess.run(
            ["pandoc", "--print-default-data-file", "reference.docx"],
            stdout=fh, check=True,
        )
    doc = Document(out)
    for style in doc.styles:
        try:
            if style.type is not None and "PARAGRAPH" in str(style.type):
                set_rtl(style)
        except Exception:
            continue
    doc.save(out)
    print("wrote", out)


if __name__ == "__main__":
    main()
