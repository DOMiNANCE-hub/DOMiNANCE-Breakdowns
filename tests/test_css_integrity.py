import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


class CssIntegrityTests(unittest.TestCase):
    """A broken comment once swallowed media and play-button styles site-wide without any error."""

    def test_comments_do_not_swallow_rules(self):
        css = (ROOT / 'styles.css').read_text(encoding='utf-8')
        comments = re.findall(r'/\*.*?\*/', css, re.S)
        for c in comments:
            self.assertNotIn('{', c, f'a comment contains CSS rules (unclosed comment?): {c[:80]!r}')
        stripped = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
        self.assertNotIn('/*', stripped, 'a comment is never closed')

    def test_braces_balance(self):
        css = re.sub(r'/\*.*?\*/', '', (ROOT / 'styles.css').read_text(encoding='utf-8'), flags=re.S)
        self.assertEqual(css.count('{'), css.count('}'))


if __name__ == '__main__':
    unittest.main()
