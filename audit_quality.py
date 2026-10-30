#!/usr/bin/env python3
"""Deterministic structural audit for all CVS chapters; not a substitute for expert fact checking."""
import csv, json, re
from pathlib import Path
ROOT=Path(__file__).resolve().parent
rows=list(csv.DictReader((ROOT/'CVS_TOPIC_MAP.csv').open(encoding='utf-8')))
assert len(rows)==27, f"Expected 27 chapters; got {len(rows)}"
data=(ROOT/'content.js').read_text(encoding='utf-8')
topics=json.loads(re.sub(r';\s*$','',re.sub(r'^window\.DOMINANCE_TOPICS\s*=\s*','',data)))
assert len(topics)==len(rows)
errors=[]; warnings=[]; inventory=[]
for row,topic in zip(rows,topics):
 slug=row['slug']; content=(ROOT/(slug+'.md')).read_text(encoding='utf-8'); html=topic['html']
 n=len(re.findall(r'<details(?![^>]*figure-attribution)[^>]*>',html))
 answers=[re.sub(r'<[^>]+>',' ',x).strip() for x in re.findall(r'<details(?![^>]*figure-attribution)[^>]*>\s*<summary[^>]*>.*?</summary>(.*?)</details>',html,re.S)]
 if topic['slug']!=slug: errors.append(f'{slug}: bundle order mismatch')
 if n!=12 or len(answers)!=12: errors.append(f'{slug}: {n} answer panels, {len(answers)} parsed answers')
 if any(len(a.split())<8 for a in answers): warnings.append(f'{slug}: brief factual answers require human quality review')
 if len(re.findall(r'<details(?:\s|>)',html))!=len(re.findall(r'</details>',html)): errors.append(f'{slug}: unbalanced detail elements')
 if not topic['sections']: errors.append(f'{slug}: no sections')
 if len({x['id'] for x in topic['sections']})!=len(topic['sections']): errors.append(f'{slug}: duplicated section IDs')
 if 'Chapter Essentials' not in html: errors.append(f'{slug}: missing essentials')
 if not row['source_primary'] or not row['source_pages']: errors.append(f'{slug}: missing lecturer provenance')
 for tag in re.findall(r'<img\b[^>]*>',html,re.I):
  if not re.search(r'\balt=',tag,re.I): errors.append(f'{slug}: image missing alt')
 inventory.append({'chapter':int(row['order']),'slug':slug,'words':len(re.findall(r'\b[\w-]+\b',content)),'answers':n,'figures':len(re.findall(r'<(?:img|svg)\b',html))})
(ROOT/'ACADEMIC_STRUCTURE_RESULTS.json').write_text(json.dumps({'totals':{'chapters':len(rows),'answers':sum(x['answers'] for x in inventory)},'chapters':inventory,'errors':errors,'editorial_warnings':warnings},indent=2)+'\n',encoding='utf-8')
for warning in warnings: print('REVIEW:',warning)
if errors: raise SystemExit('\n'.join(errors))
print('PASS 27 chapters; 324 explained checks; source metadata, anchors and media alt checks.')
