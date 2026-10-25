"""Tests for the root humans.txt file.

Validates that humans.txt exists at the repository root and contains the
exact required content on the expected lines.
"""

import os

# Absolute path of the repository root, derived from this file's location.
REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# Absolute path to the humans.txt file that these tests validate.
HUMANS_PATH = os.path.join(REPO_ROOT, "humans.txt")


def test_humans_txt_exists():
    """Assert that humans.txt exists as a file at the repository root."""
    assert os.path.isfile(HUMANS_PATH), "humans.txt must exist at the repository root"


def test_humans_txt_content():
    """Assert that humans.txt contains exactly the required two-line content."""
    with open(HUMANS_PATH, "r", encoding="utf-8") as f:
        # Full text of humans.txt, read as UTF-8.
        content = f.read()

    # Individual lines of the file, for line-by-line content assertions.
    lines = content.splitlines()

    assert len(lines) == 2, "humans.txt must contain exactly two lines"
    assert lines[0] == "/* TEAM */", "first line must be exactly '/* TEAM */'"
    assert lines[1] == "CrewWork test project", (
        "second line must be exactly 'CrewWork test project'"
    )
