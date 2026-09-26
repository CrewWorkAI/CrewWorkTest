"""Tests for the root humans.txt file.

Validates that humans.txt exists at the repository root and contains the
exact required content on the expected lines.
"""

import os

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HUMANS_PATH = os.path.join(REPO_ROOT, "humans.txt")


def test_humans_txt_exists():
    assert os.path.isfile(HUMANS_PATH), "humans.txt must exist at the repository root"


def test_humans_txt_content():
    with open(HUMANS_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    lines = content.splitlines()

    assert len(lines) == 2, "humans.txt must contain exactly two lines"
    assert lines[0] == "/* TEAM */", "first line must be exactly '/* TEAM */'"
    assert lines[1] == "CrewWork test project", (
        "second line must be exactly 'CrewWork test project'"
    )
