#!/usr/bin/env python3
"""Deterministic structural audit for the CVS chapters.

Checks markup integrity, Understanding Check completeness, section anchors,
figure accessibility/credits, student-facing wording and regression guards.
It is NOT a substitute for expert review of scientific accuracy.

Usage:
  python audit_quality.py                 # audit the repository; exit 1 on errors
  python audit_quality.py --report FILE   # also write a JSON inventory to FILE
"""
import argparse, csv, html as html_lib, json, re, sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent

# Elements that never take a closing tag (HTML void elements plus SVG shapes written as <tag/>).
VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source',
        'track', 'wbr'}

# Wording meant for authors/reviewers that must never reach students.
DEVELOPER_PHRASES = [
    'before release', 'verify specific slide', 'lecture deck', 'not a copy of lecture',
    'independently written sequence', 'todo', 'fixme', 'lorem ipsum', 'placeholder text',
]

CHECK_RE = re.compile(
    r'<p>(?P<question>(?:(?!</?p\b).)*?)</p>\s*'
    r'<details(?P<attrs>[^>]*)>\s*<summary[^>]*>(?P<summary>.*?)</summary>(?P<answer>.*?)</details>',
    re.S)
DETAILS_OPEN_RE = re.compile(r'<details(?![^>]*figure-attribution)(?:\s[^>]*)?>')


def strip_tags(html):
    return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', html)).strip()


class NestingChecker(HTMLParser):
    """Reports closing tags that do not match the innermost open element, and unclosed elements."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack, self.errors = [], []

    def handle_starttag(self, tag, attrs):
        if tag not in VOID:
            self.stack.append((tag, self.getpos()))

    def handle_startendtag(self, tag, attrs):
        pass  # self-closing (e.g. SVG <path/>) needs no closing tag

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        if self.stack and self.stack[-1][0] == tag:
            self.stack.pop()
            return
        line, col = self.getpos()
        expected = self.stack[-1][0] if self.stack else 'nothing'
        self.errors.append(f'unexpected </{tag}> at line {line}, col {col} (expected </{expected}>)')
        # Recover if the tag is open further down so one mistake is not reported many times.
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                for t, pos in self.stack[i + 1:]:
                    self.errors.append(f'<{t}> opened at line {pos[0]} was never closed')
                del self.stack[i:]
                break


def nesting_errors(html):
    checker = NestingChecker()
    checker.feed(html)
    checker.close()
    return checker.errors + [f'<{t}> opened at line {pos[0]} was never closed' for t, pos in checker.stack]


def load_bundle(path):
    data = path.read_text(encoding='utf-8')
    data = re.sub(r'^window\.DOMINANCE_TOPICS\s*=\s*', '', data)
    return json.loads(re.sub(r';\s*$', '', data))


def load_diagrams(path):
    """Extract the template-literal diagrams from figures.js as {slug: html}."""
    text = path.read_text(encoding='utf-8')
    return dict(re.findall(r"'([a-z0-9-]+)'\s*:\s*`(.*?)`", text, re.S))


def audit_chapter(slug, html, sections, guards=None):
    """Return (errors, warnings, stats) for one chapter's rendered HTML."""
    errors, warnings = [], []
    guards = guards or {}

    for problem in nesting_errors(html):
        errors.append(f'{slug}: markup {problem}')

    checks = list(CHECK_RE.finditer(html))
    panels = len(DETAILS_OPEN_RE.findall(html))
    if not checks:
        errors.append(f'{slug}: no Understanding Checks found')
    if panels != len(checks):
        errors.append(f'{slug}: {panels} answer panels but {len(checks)} complete question/answer pairs '
                      '(each check needs a question paragraph immediately followed by its answer)')
    for n, m in enumerate(checks, 1):
        if not strip_tags(m['question']):
            errors.append(f'{slug}: check {n} has an empty question')
        if not strip_tags(m['summary']):
            errors.append(f'{slug}: check {n} has an empty reveal label')
        words = len(strip_tags(m['answer']).split())
        if words == 0:
            errors.append(f'{slug}: check {n} has an empty answer')
        elif words < 8:
            warnings.append(f'{slug}: check {n} answer is very brief ({words} words); review for explanation quality')

    if 'Chapter Essentials' not in html:
        errors.append(f'{slug}: missing closing Chapter Essentials summary')

    if not sections:
        errors.append(f'{slug}: no sections')
    ids = [s['id'] for s in sections]
    if len(set(ids)) != len(ids):
        errors.append(f'{slug}: duplicated section IDs')
    for sid in ids:
        if f'id="{sid}"' not in html:
            errors.append(f'{slug}: section anchor #{sid} missing from HTML')

    for tag in re.findall(r'<img\b[^>]*>', html, re.I):
        alt = re.search(r'\balt="([^"]*)"', tag, re.I)
        if not alt or not alt.group(1).strip():
            errors.append(f'{slug}: image without meaningful alt text: {tag[:90]}')

    credits = html.count('class="figure-attribution"')
    if credits != html.count('<summary>Image credit</summary>'):
        errors.append(f'{slug}: figure credit panels and "Image credit" labels do not match')

    lowered = strip_tags(html).lower()
    for phrase in DEVELOPER_PHRASES:
        if phrase in lowered:
            errors.append(f'{slug}: developer-facing wording in student content: "{phrase}"')

    if len(checks) < guards.get('minimum_checks', 0):
        errors.append(f'{slug}: {len(checks)} Understanding Checks; regression guard expects at least '
                      f'{guards["minimum_checks"]} (update tests/content_guards.json if this is deliberate)')
    for phrase in guards.get('required', []):
        if phrase not in html:
            errors.append(f'{slug}: regression guard - required text missing: "{phrase}"')
    for phrase in guards.get('forbidden', []):
        if phrase in html:
            errors.append(f'{slug}: regression guard - forbidden text present: "{phrase}"')

    stats = {'checks': len(checks), 'figure_credits': credits,
             'figures': len(re.findall(r'<(?:img|svg)\b', html))}
    return errors, warnings, stats


def run(root=ROOT):
    with (root / 'CVS_TOPIC_MAP.csv').open(encoding='utf-8') as f:
        rows = list(csv.DictReader(f))
    topics = load_bundle(root / 'content.js')
    guards = json.loads((root / 'tests' / 'content_guards.json').read_text(encoding='utf-8'))
    diagrams = load_diagrams(root / 'figures.js')
    errors, warnings, inventory = [], [], []

    if len(rows) != len(topics):
        errors.append(f'CVS_TOPIC_MAP.csv lists {len(rows)} chapters but content.js has {len(topics)}')
    if len(rows) != guards.get('expected_chapters', len(rows)):
        errors.append(f'expected {guards["expected_chapters"]} chapters, found {len(rows)}')

    for row, topic in zip(rows, topics):
        slug = row['slug']
        if topic['slug'] != slug:
            errors.append(f'{slug}: content.js order does not match CVS_TOPIC_MAP.csv ({topic["slug"]})')
        if not row['source_primary'] or not row['source_pages']:
            errors.append(f'{slug}: missing lecture source metadata')
        source = (root / f'{slug}.md').read_text(encoding='utf-8')
        words = lambda text: re.findall(r'\w+', html_lib.unescape(text).lower())
        if words(strip_tags(topic['html']))[-25:] != words(topic['plain'])[-25:]:
            errors.append(f'{slug}: search text does not include the end of the chapter')
        e, w, stats = audit_chapter(slug, topic['html'], topic['sections'], guards['chapters'].get(slug))
        errors += e
        warnings += w
        inventory.append({'chapter': int(row['order']), 'slug': slug,
                          'words': len(re.findall(r'\b[\w-]+\b', source)), **stats})

    for slug, html in diagrams.items():
        if slug not in {r['slug'] for r in rows}:
            errors.append(f'figures.js: diagram for unknown chapter "{slug}"')
        for problem in nesting_errors(html):
            errors.append(f'figures.js[{slug}]: markup {problem}')
        lowered = strip_tags(html).lower()
        for phrase in DEVELOPER_PHRASES:
            if phrase in lowered:
                errors.append(f'figures.js[{slug}]: developer-facing wording: "{phrase}"')

    total_credits = sum(x['figure_credits'] for x in inventory)
    if total_credits < guards.get('minimum_figure_credits', 0):
        errors.append(f'only {total_credits} figure credits; expected at least {guards["minimum_figure_credits"]}')

    return errors, warnings, inventory


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--report', type=Path, help='write a JSON inventory to this path')
    args = parser.parse_args(argv)
    errors, warnings, inventory = run()
    if args.report:
        args.report.write_text(json.dumps({'totals': {'chapters': len(inventory),
                                                      'checks': sum(x['checks'] for x in inventory)},
                                           'chapters': inventory, 'errors': errors,
                                           'editorial_warnings': warnings}, indent=2) + '\n', encoding='utf-8')
    for w in warnings:
        print('REVIEW:', w)
    if errors:
        print('\n'.join('ERROR: ' + e for e in errors))
        print(f'FAIL {len(errors)} structural error(s)')
        return 1
    print(f'PASS {len(inventory)} chapters; {sum(x["checks"] for x in inventory)} complete Understanding Checks; '
          f'markup nesting, anchors, alt text, figure credits, student-facing wording and regression guards.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
