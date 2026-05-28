#!/usr/bin/env python3
"""CLI for the filing -> draft pipeline.

Mechanical steps only; the agent fills the draft per methodology/drafting-playbook.md.

  draft.py artifacts
  draft.py extract <file>
  draft.py new <artifact> --slug <slug> [--dest <dir>]
  draft.py render <draft.md> [-o <out.docx>]
"""
import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from pipeline import extract, render, scaffold  # noqa: E402

DEFAULT_WORK = scaffold.REPO_ROOT / "work"


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(prog="draft", description=__doc__)
    sub = parser.add_subparsers(dest="cmd", required=True)

    sub.add_parser("artifacts", help="list available artifact templates")

    p_extract = sub.add_parser("extract", help="print text extracted from a source file")
    p_extract.add_argument("file")

    p_new = sub.add_parser("new", help="scaffold a working draft from a template")
    p_new.add_argument("artifact")
    p_new.add_argument("--slug", required=True, help="working-set name (folder)")
    p_new.add_argument("--dest", default=str(DEFAULT_WORK), help="parent dir (default: work/)")

    p_render = sub.add_parser("render", help="render a draft markdown to RTL Word")
    p_render.add_argument("md")
    p_render.add_argument("-o", "--out", default=None)

    args = parser.parse_args(argv)

    if args.cmd == "artifacts":
        for name in scaffold.available_artifacts():
            print(name)
    elif args.cmd == "extract":
        print(extract.extract_text(args.file))
    elif args.cmd == "new":
        dest_dir = Path(args.dest) / scaffold.slugify(args.slug)
        out = scaffold.scaffold_draft(args.artifact, dest_dir)
        print(out)
    elif args.cmd == "render":
        print(render.render(args.md, args.out))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
