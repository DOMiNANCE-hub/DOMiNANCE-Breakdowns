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

def search_text(html):
    """Full plain text of a chapter for in-page search (never truncated)."""
    text=html_module.unescape(re.sub(r'<[^>]+>',' ',html))
    text=re.sub(r'\s+',' ',text)
    # Tags become spaces; remove the artefact space this leaves before punctuation (e.g. "</em>;").
    return re.sub(r' ([,.;:!?)\]])',r'\1',text).strip()

topics=[]
for row in rows:
    fp=ROOT/f'{row["slug"]}.md'
    text=fp.read_text(encoding='utf-8')
    html=readable_math(md(text))
    html,sections=make_sections(html)
    topics.append({'slug':row['slug'],'title':row['title'],'group':row['group'],
      'source':row['source_primary'],'pages':row['source_pages'],
      'coverage':row['coverage_type'],'priority':row['priority'],
      'sections':sections,'html':html,'plain':search_text(html)})
# Phone-sized Wikimedia images: the original files can be several megabytes.
COMMONS='https://commons.wikimedia.org/wiki/Special:FilePath/'
def responsive_images(html):
    def fix(m):
        tag=m.group(0)
        src=re.search(r'src="'+re.escape(COMMONS)+r'([^"?]+)"',tag)
        if not src or 'srcset=' in tag: return tag
        u=COMMONS+src.group(1)
        tag=tag.replace(src.group(0),f'src="{u}?width=800" srcset="{u}?width=480 480w, {u}?width=800 800w, {u}?width=1200 1200w" sizes="(max-width: 700px) 92vw, 760px"')
        return tag
    return re.sub(r'<img\b[^>]*>',fix,html)
for t in topics: t['html']=responsive_images(t['html'])

# Full bundle: used by the structural audit and the browser test suite (not loaded by the site).
script='window.DOMINANCE_TOPICS = '+json.dumps(topics,ensure_ascii=False,separators=(',',':'))+';\n'
(ROOT/'content.js').write_text(script,encoding='utf-8')

# What the site loads: a small catalogue first, then one file per chapter on demand,
# and the full-text search index only when someone searches. Names carry a content hash
# so they can be cached for a year; the catalogue is loaded with ?v=<hash>.
import hashlib
def h(data): return hashlib.sha1(data.encode('utf-8') if isinstance(data,str) else data).hexdigest()[:10]
out=ROOT/'content'; out.mkdir(exist_ok=True)
keep=set()
def emit(name,body):
    fn=f'{name}.{h(body)}.js'; (out/fn).write_text(body,encoding='utf-8'); keep.add(fn); return 'content/'+fn
chapters={}
for t in topics:
    chapters[t['slug']]=emit(t['slug'],'(window.DOM_CHAPTERS=window.DOM_CHAPTERS||{})['+json.dumps(t['slug'])+']='+json.dumps(t['html'],ensure_ascii=False)+';\n')
search=emit('search','window.DOM_SEARCH='+json.dumps({t['slug']:t['plain'] for t in topics},ensure_ascii=False,separators=(',',':'))+';\n')
ver=lambda f: f+'?v='+h((ROOT/f).read_bytes())
widgets={}
for js in sorted(ROOT.glob('*-widgets.js')):
    if js.name=='teaching-widgets.js': continue
    for name in re.findall(r"register\('([a-z0-9-]+)'",js.read_text(encoding='utf-8')): widgets[name]=ver(js.name)
core=[ver(f) for f in ['figures.js','teaching-widgets.js','glossary.js','media.js','image-viewer.js']]
catalogue=[{k:v for k,v in t.items() if k not in ('html','plain')} for t in topics]
assets=sorted('assets/'+str(f.relative_to(ROOT/'assets')).replace('\\','/') for f in (ROOT/'assets').rglob('*') if f.is_file() and f.suffix in ('.jpg','.png','.webp','.svg'))
bundle={'chapters':chapters,'search':search,'core':core,'widgets':widgets,'assets':assets}
index='window.DOMINANCE_TOPICS='+json.dumps(catalogue,ensure_ascii=False,separators=(',',':'))+';\nwindow.DOM_BUNDLE='+json.dumps(bundle,separators=(',',':'))+';\n'
(out/'index.js').write_text(index,encoding='utf-8')
for f in out.glob('*.js'):
    if f.name!='index.js' and f.name not in keep: f.unlink()

# Point index.html at the current versions of every file it loads.
page=(ROOT/'index.html').read_text(encoding='utf-8')
for f in ['content/index.js','app.js','mobile-ui.js','offline.js','reader.js','styles.css']:
    page=re.sub(r'(["\'])'+re.escape(f)+r'(\?v=[0-9a-f]+)?\1',lambda m: m.group(1)+ver(f)+m.group(1),page)
(ROOT/'index.html').write_text(page,encoding='utf-8')
# Offline reading: the service worker is generated with the current shell file versions.
shell=['/','styles.css','content/index.js','app.js','mobile-ui.js','offline.js','reader.js']
shell=['/']+[ver(f) for f in shell[1:]]+core
sw=(ROOT/'sw-template.js').read_text(encoding='utf-8')
sw=sw.replace('__SHELL__',json.dumps(shell)).replace('__VERSION__',h(json.dumps(shell)+sw))
(ROOT/'sw.js').write_text(sw,encoding='utf-8')
print('Built',len(topics),'topics; full bundle',round(len(script)/1024),'KiB; catalogue',round(len(index)/1024),'KiB')
