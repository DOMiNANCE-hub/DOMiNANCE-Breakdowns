#!/usr/bin/env python3
"""Static QA checks for the DOMiNANCE cardiovascular teaching site."""
import csv
import re
from pathlib import Path

root = Path(__file__).resolve().parent.parent
with (root / "CVS_TOPIC_MAP.csv").open(encoding="utf-8") as f:
    rows = list(csv.DictReader(f))
assert len(rows) == 27, f"Expected 27 mapped topics, got {len(rows)}"
assert len({r["slug"] for r in rows}) == len(rows), "Duplicate topic slug"
errors = []
reviewed = {"cardiac-muscle", "cardiac-conduction", "cardiac-cycle", "heart-sounds", "ecg"}
for row in rows:
    slug = row["slug"]
    file = root / f"{slug}.md"
    if not file.is_file():
        errors.append(f"{slug}: missing Markdown file")
        continue
    s = file.read_text(encoding="utf-8")
    if not s.startswith("# "):
        errors.append(f"{slug}: missing title")
    if s.count("<figure") != s.count("</figure>"):
        errors.append(f"{slug}: unmatched figure tags")
    if s.count("<details") != s.count("</details>"):
        errors.append(f"{slug}: unmatched details tags")
    for fig in re.findall(r"<figure\\b[\\s\\S]*?</figure>", s):
        for required in ('<img', 'alt="', '<figcaption>'):
            if required not in fig:
                errors.append(f"{slug}: figure missing {required}")
    if slug in reviewed:
        count = s.count("<summary>Reveal explanation</summary>")
        if count != 12:
            errors.append(f"{slug}: expected 12 understanding checks, got {count}")
if not (root / "content.js").is_file():
    errors.append("Missing compiled content.js")
if errors:
    raise SystemExit("\n".join(errors))
print(f"QA passed: {len(rows)} mapped topics; five reviewed chapters have 60 explanation checks.")
