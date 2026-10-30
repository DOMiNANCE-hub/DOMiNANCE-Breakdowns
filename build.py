#!/usr/bin/env python3
"""Compile editable Markdown topic notes into offline-safe content.js."""
import csv, json, re, html as html_module
import xml.etree.ElementTree as ET
from pathlib import Path
import mistune

ROOT=Path(__file__).resolve().parent
with (ROOT/'CVS_TOPIC_MAP.csv').open(encoding='utf-8') as f: rows=list(csv.DictReader(f))
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


def readable_math(html):
    """Replace MathML with reliable, accessible plain-text equations on all devices."""
    def render(el):
        name=el.tag.rsplit('}',1)[-1]
        kids=list(el)
        if name=='mfrac' and len(kids)>=2:
            a,b=render(kids[0]),render(kids[1])
            return f'({a}) / ({b})'
        if name=='msup' and len(kids)>=2:
            return render(kids[0])+'^'+render(kids[1])
        if name=='msub' and len(kids)>=2:
            return render(kids[0])+'_'+render(kids[1])
        if name=='mover' and len(kids)>=2:
            return render(kids[0])+render(kids[1])
        if name=='msqrt':
            return '√('+''.join(render(k) for k in kids)+')'
        if name in ('mspace','mphantom'):
            return ' '
        if not kids:
            return ''.join(el.itertext()).strip()
        return ''.join(render(k) for k in kids)
    def replace(m):
        try:
            root=ET.fromstring(m.group(0))
            equation=render(root)
            # Add word spacing only around operators, then preserve inline mathematical grouping.
            equation=re.sub(r'\s+',' ',equation).strip()
            equation=re.sub(r'\s*([=≈×+−<>])\s*',r' \1 ',equation)
            equation=re.sub(r'\s+',' ',equation).strip()
            return '<span class="equation-formula" role="math" aria-label="'+html_module.escape(equation,quote=True)+'">'+html_module.escape(equation)+'</span>'
        except ET.ParseError:
            raise ValueError('Invalid MathML in chapter content: '+m.group(0)[:150])
    return re.sub(r'<math\b[^>]*>[\s\S]*?</math>',replace,html)

topics=[]
for row in rows:
    fp=ROOT/f'{row["slug"]}.md'
    text=fp.read_text(encoding='utf-8')
    html=readable_math(md(text))
    html,sections=make_sections(html)
    # Math is optional progressive enhancement; without it, display concise text formulas.
    topics.append({'slug':row['slug'],'title':row['title'],'group':row['group'],
      'source':row['source_primary'],'pages':row['source_pages'],
      'coverage':row['coverage_type'],'priority':row['priority'],
      'sections':sections,'html':html,'plain':re.sub(r'<[^>]+>',' ',html)[:20000]})
script='window.DOMINANCE_TOPICS = '+json.dumps(topics,ensure_ascii=False,separators=(',',':'))+';\n'
(ROOT/'content.js').write_text(script,encoding='utf-8')
print('Built',len(topics),'topics, total',round(len(script)/1024),'KiB')
