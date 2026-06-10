import subprocess
import sys

from pipeline.scaffold import REPO_ROOT

CLI = REPO_ROOT / "scripts" / "draft.py"


def _run(*args, **kw):
    return subprocess.run(
        [sys.executable, str(CLI), *args],
        capture_output=True, text=True, cwd=REPO_ROOT, **kw,
    )


def test_cli_artifacts_lists_templates():
    r = _run("artifacts")
    assert r.returncode == 0, r.stderr
    assert "kpis" in r.stdout
    assert "strategy-document" in r.stdout


def test_cli_new_scaffolds_into_dest(tmp_path):
    r = _run("new", "kpis", "--slug", "demo", "--dest", str(tmp_path))
    assert r.returncode == 0, r.stderr
    assert (tmp_path / "demo" / "kpis.md").exists()


def test_cli_extract_reads_txt(tmp_path):
    f = tmp_path / "s.txt"
    f.write_text("hello cli", encoding="utf-8")
    r = _run("extract", str(f))
    assert r.returncode == 0, r.stderr
    assert "hello cli" in r.stdout
