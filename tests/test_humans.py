"""Tests for the root humans.txt file.

Validates that humans.txt exists at the repository root and contains the
exact required content on the expected lines.
"""

import os

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HUMANS_PATH = os.path.join(REPO_ROOT, "humans.txt")


def test_humans_txt_exists():
    """Verify that humans.txt is present as a regular file.

    The HUMANS.txt convention requires the file to live at the repository
    root so tools and contributors can discover the credit attribution
    file. This test fails if the file is missing, is not a regular file,
    or has been moved out of the repository root.
    """
    assert os.path.isfile(HUMANS_PATH), "humans.txt must exist at the repository root"


def test_humans_txt_content():
    """Verify the exact content of humans.txt.

    The file must contain exactly two lines (HUMANS.txt is intentionally
    minimal in this project):

    1. ``/* TEAM */`` -- the standard TEAM section header of the HUMANS.txt
       format.
    2. ``CrewWork test project`` -- the credit line naming the project.

    Reading the file as UTF-8 and checking the line list guarantees both
    the line count and the byte-exact content are stable, so accidental
    edits, reordering, or trailing blank lines are caught.
    """
    with open(HUMANS_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    lines = content.splitlines()

    assert len(lines) == 2, "humans.txt must contain exactly two lines"
    assert lines[0] == "/* TEAM */", "first line must be exactly '/* TEAM */'"
    assert lines[1] == "CrewWork test project", (
        "second line must be exactly 'CrewWork test project'"
    )
