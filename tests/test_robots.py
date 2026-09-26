"""Tests for the root robots.txt file."""

import os
import re

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROBOTS_PATH = os.path.join(REPO_ROOT, "robots.txt")


def test_robots_txt_exists():
    assert os.path.isfile(ROBOTS_PATH), "robots.txt must exist at the repository root"


def test_robots_txt_allows_all_crawlers():
    with open(ROBOTS_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    assert re.search(r"^User-agent:\s*\*\s*$", content, flags=re.MULTILINE), (
        "robots.txt must contain 'User-agent: *'"
    )
    assert re.search(r"^Disallow:\s*$", content, flags=re.MULTILINE), (
        "robots.txt must contain an empty 'Disallow:' directive to allow all crawlers"
    )
