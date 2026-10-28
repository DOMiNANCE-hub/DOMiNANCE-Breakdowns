#!/usr/bin/env python3
"""Compile editable Markdown topic notes into offline-safe content.js."""
import csv, json, re
from pathlib import Path
import mistune

ROOT=Path(__file__).resolve().parent
with (ROOT/'docs/CVS_TOPIC_MAP.csv').open(encoding='utf-8') as f: rows=list(csv.DictReader(f))
md=mistune.create_markdown(escape=False, plugins=['table','strikethrough'])

def slug(s):
    return re.sub(r'[^a-z0-9]+','-',s.lower()).strip('-')

def make_sections(html):
    sections=[]
    def repl(m):
        text=re.sub(r'<[^>]+>','',m.group(1))
        anchor=slug(text)
        sections.append({'id':anchor,'title':text})
        return f'<h2 id="{anchor}">{m.group(1)}</h2>'
    return re.sub(r'<h2>(.*?)</h2>',repl,html,flags=re.S), sections

topics=[]
for row in rows:
    fp=ROOT/'content/topics'/f'{row["slug"]}.md'
    text=fp.read_text(encoding='utf-8')
    html=md(text)
    html,sections=make_sections(html)
    # Math is optional progressive enhancement; without it, display concise text formulas.
    topics.append({'slug':row['slug'],'title':row['title'],'group':row['group'],
      'source':row['source_primary'],'pages':row['source_pages'],
      'coverage':row['coverage_type'],'priority':row['priority'],
      'sections':sections,'html':html,'plain':re.sub(r'<[^>]+>',' ',html)[:20000]})
script='window.DOMINANCE_TOPICS = '+json.dumps(topics,ensure_ascii=False,separators=(',',':'))+';\n'
(ROOT/'content.js').write_text(script,encoding='utf-8')
print('Built',len(topics),'topics, total',round(len(script)/1024),'KiB')
