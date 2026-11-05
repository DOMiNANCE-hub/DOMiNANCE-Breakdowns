"""Self-tests for audit_quality.py: each known failure type must be detected.

Run: python -m unittest discover -s tests
"""
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import audit_quality as aq  # noqa: E402

CHECK = ('<p><strong>1. Why?</strong></p>\n'
         '<details><summary>Reveal explanation</summary><p>Because the pressure gradient reverses and closes the valve.</p></details>\n')
GOOD = ('<h2 id="one">One</h2>\n<div class="media-resource"><div class="media-stage"></div><p>Credit</p></div>\n'
        '<h2 id="understanding-check">Understanding Check</h2>\n' + CHECK +
        '<h2 id="chapter-essentials">Chapter Essentials</h2>\n<ol><li>Point</li></ol>\n')
SECTIONS = [{'id': 'one'}, {'id': 'understanding-check'}, {'id': 'chapter-essentials'}]


def errors_for(html, guards=None):
    return aq.audit_chapter('test', html, SECTIONS, guards)[0]


class AuditDetectsProblems(unittest.TestCase):
    def test_valid_chapter_passes(self):
        self.assertEqual(errors_for(GOOD), [])

    def test_stray_closing_div_detected(self):
        # The Heart Sounds defect: an extra </div> after a media panel closed the article container early.
        bad = GOOD.replace('<p>Credit</p></div>', '<p>Credit</p></div><p>Second credit</p></div>')
        self.assertTrue(any('unexpected </div>' in e for e in errors_for(bad)))

    def test_unclosed_element_detected(self):
        bad = GOOD.replace('<p>Credit</p></div>', '<p>Credit</p>')
        self.assertTrue(any('never closed' in e for e in errors_for(bad)))

    def test_answer_without_question_detected(self):
        bad = GOOD.replace('<p><strong>1. Why?</strong></p>\n', '')
        self.assertTrue(any('question/answer pairs' in e for e in errors_for(bad)))

    def test_empty_answer_detected(self):
        bad = GOOD.replace('<p>Because the pressure gradient reverses and closes the valve.</p>', '')
        self.assertTrue(any('empty answer' in e for e in errors_for(bad)))

    def test_developer_wording_detected(self):
        bad = GOOD.replace('<ol><li>Point</li></ol>', '<p>Slides 2-11 (verify specific slide alignment before release).</p>')
        self.assertTrue(any('developer-facing' in e for e in errors_for(bad)))

    def test_image_without_alt_detected(self):
        bad = GOOD.replace('<p>Credit</p>', '<p>Credit</p><img src="x.png">')
        self.assertTrue(any('alt text' in e for e in errors_for(bad)))

    def test_missing_essentials_detected(self):
        bad = GOOD.replace('Chapter Essentials', 'Summary')
        self.assertTrue(any('Chapter Essentials' in e for e in errors_for(bad)))

    def test_regression_guards(self):
        self.assertTrue(any('required text missing' in e for e in errors_for(GOOD, {'required': ['Reynolds number']})))
        self.assertTrue(any('forbidden text present' in e for e in errors_for(GOOD, {'forbidden': ['Why?']})))
        self.assertTrue(any('at least 2' in e for e in errors_for(GOOD, {'minimum_checks': 2})))

    def test_check_count_is_not_fixed(self):
        # Chapters may have any number of complete checks; only the per-chapter guard sets a floor.
        two = GOOD.replace(CHECK, CHECK + CHECK)
        self.assertEqual(errors_for(two, {'minimum_checks': 1}), [])


class RepositoryPasses(unittest.TestCase):
    def test_repository_has_no_structural_errors(self):
        errors, _, inventory = aq.run()
        self.assertEqual(errors, [])
        self.assertEqual(len(inventory), 27)


if __name__ == '__main__':
    unittest.main()
