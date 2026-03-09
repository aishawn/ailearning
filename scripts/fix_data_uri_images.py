#!/usr/bin/env python3
"""Replace data:image/svg+xml placeholder images in markdown with a valid public image path."""

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "content" / "docs"

# Pattern: ![图片](<data:image/svg+xml,...>)
DATA_URI_PATTERN = re.compile(
    r"!\[图片\]\(<data:image/svg\+xml,[^>]+>\)"
)
REPLACEMENT = "![图片](/docs-images/docs/8926f583d33370c1001e607c04b641e0.png)"


def fix_file(path: Path) -> int:
    text = path.read_text(encoding="utf-8")
    new_text, n = DATA_URI_PATTERN.subn(REPLACEMENT, text)
    if n:
        path.write_text(new_text, encoding="utf-8")
    return n


def main():
    total = 0
    for md in DOCS.rglob("*.md"):
        count = fix_file(md)
        if count:
            print(f"Fixed {count} placeholder(s) in {md.relative_to(ROOT)}")
            total += count
    print(f"Done. Total replacements: {total}")


if __name__ == "__main__":
    main()
