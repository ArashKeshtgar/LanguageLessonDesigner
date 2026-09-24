# -*- coding: utf-8 -*-
"""
Regenerate the print PDF for one lesson (or all lessons) from its JSON file,
by feeding it into the original Python engine's unit.py renderer + headless
Chrome — the same pipeline used to produce every PDF under public/pdf/.

    python scripts/generate_pdf.py u201        # just one lesson
    python scripts/generate_pdf.py              # every lesson in src/data/units

The engine directory is not part of this repo (it lives in the separate
SmartLedgerAI-JobPrep project); point LESSON_ENGINE_DIR at it if it's not at
the default path below.
"""
import glob
import json
import os
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
PROJECT = os.path.dirname(HERE)
ENGINE = os.environ.get(
    "LESSON_ENGINE_DIR",
    r"C:\Users\akesh\Downloads\SmartLedgerAI-JobPrep\English\engine",
)
UNITS_DIR = os.path.join(ENGINE, "units")
sys.path[:0] = [ENGINE, UNITS_DIR]

import unit as unit_mod  # noqa: E402  (imports gen, build, syllabus as a side effect)

SRC_DIR = os.path.join(PROJECT, "src", "data", "units")
OUT_DIR = os.path.join(PROJECT, "public", "pdf")
# Probe files never live under public/ — Vite's dev server watches that folder
# and would fire a full page reload (and abort any in-flight fetch) on every
# intermediate write during the font-size ladder below.
TMP_DIR = os.path.join(tempfile.gettempdir(), "lesson-pdf-probe")


def build_one(path: str) -> int:
    name = os.path.splitext(os.path.basename(path))[0]
    if name.startswith("_"):
        return 0
    U = json.load(open(path, encoding="utf-8"))
    os.makedirs(TMP_DIR, exist_ok=True)
    probe = os.path.join(TMP_DIR, name + "_probe")
    chosen_fs = None
    for fs in unit_mod.LADDER:
        open(probe + ".html", "w", encoding="utf-8").write(unit_mod.page(U, fs, quiz=False, name=name))
        n = unit_mod.build.to_pdf(probe + ".html", probe + ".pdf")
        if 0 < n <= (U.get("want") or unit_mod.WANT):
            chosen_fs = fs
            break
    for f in (probe + ".html", probe + ".pdf"):
        if os.path.exists(f):
            os.remove(f)
    fs = chosen_fs or unit_mod.LADDER[-1]
    full_html = os.path.join(TMP_DIR, name + ".html")
    full_pdf = os.path.join(OUT_DIR, name + ".pdf")
    open(full_html, "w", encoding="utf-8").write(unit_mod.page(U, fs, name=name))
    pages = unit_mod.build.to_pdf(full_html, full_pdf)
    os.remove(full_html)
    print(f"{name} -> {pages} pages @ {fs}pt" + ("" if chosen_fs else "  (didn't fit target, used smallest font)"))
    return pages


def main() -> None:
    os.makedirs(OUT_DIR, exist_ok=True)
    if not unit_mod.build.CHROME:
        print("Chrome not found — set the CHROME env var to its executable path.", file=sys.stderr)
        sys.exit(1)

    if len(sys.argv) > 1:
        target = sys.argv[1]
        path = os.path.join(SRC_DIR, f"{target}.json")
        if not os.path.exists(path):
            print(f"no such lesson file: {path}", file=sys.stderr)
            sys.exit(1)
        if build_one(path) <= 0:
            sys.exit(1)
    else:
        for path in sorted(glob.glob(os.path.join(SRC_DIR, "u*.json"))):
            build_one(path)


if __name__ == "__main__":
    main()
