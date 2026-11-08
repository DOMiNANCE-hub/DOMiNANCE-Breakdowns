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
    """Typeset authored MathML as responsive, accessible HTML without external dependencies.

    Unlike plain-text flattening, fractions retain a visible bar and scripted
    characters retain their proper vertical position. The aria-label is a
    linear reading of the same equation for assistive technologies.
    """
    def walk(el):
        name=el.tag.rsplit('}',1)[-1]
        kids=list(el)
        if name in ('math','mrow','mstyle','semantics'):
            return ''.join(walk(k) for k in kids)
        if name=='mfrac' and len(kids)>=2:
            return ('<span class="eq-fraction"><span class="eq-numerator">'
                    +walk(kids[0])+'</span><span class="eq-denominator">'
                    +walk(kids[1])+'</span></span>')
        if name=='msup' and len(kids)>=2:
            return '<span class="eq-script">'+walk(kids[0])+'<sup>'+walk(kids[1])+'</sup></span>'
        if name=='msub' and len(kids)>=2:
            return '<span class="eq-script">'+walk(kids[0])+'<sub>'+walk(kids[1])+'</sub></span>'
        if name=='msubsup' and len(kids)>=3:
            return ('<span class="eq-script">'+walk(kids[0])
                    +'<span class="eq-both"><sup>'+walk(kids[2])
                    +'</sup><sub>'+walk(kids[1])+'</sub></span></span>')
        if name=='msqrt':
            return '<span class="eq-root"><span class="eq-root-symbol">√</span><span class="eq-radicand">'+''.join(walk(k) for k in kids)+'</span></span>'
        if name=='mover' and len(kids)>=2:
            return ('<span class="eq-over"><span class="eq-accent">'+walk(kids[1])
                    +'</span><span class="eq-over-base">'+walk(kids[0])+'</span></span>')
        if name=='mspace':
            width=el.attrib.get('width','0.8em')
            if not re.fullmatch(r'\d+(?:\.\d+)?(?:em|ex|px)',width):
                width='0.8em'
            return '<span class="eq-gap" style="width:'+width+'"></span>'
        if name=='mphantom':
            return '<span class="eq-phantom">'+''.join(walk(k) for k in kids)+'</span>'
        if not kids:
            kind={'mi':'eq-identifier','mn':'eq-number','mo':'eq-operator','mtext':'eq-words'}.get(name,'eq-words')
            return '<span class="eq-token '+kind+'">'+html_module.escape(''.join(el.itertext()))+'</span>'
        return ''.join(walk(k) for k in kids)

    def spoken(el):
        name=el.tag.rsplit('}',1)[-1]
        kids=list(el)
        if name=='mfrac' and len(kids)>=2:
            return '('+spoken(kids[0])+') divided by ('+spoken(kids[1])+')'
        if name=='msup' and len(kids)>=2:
            return spoken(kids[0])+' to the power of '+spoken(kids[1])
        if name=='msub' and len(kids)>=2:
            return spoken(kids[0])+' subscript '+spoken(kids[1])
        if name=='msubsup' and len(kids)>=3:
            return spoken(kids[0])+' subscript '+spoken(kids[1])+' to the power of '+spoken(kids[2])
        if name=='msqrt':
            return 'square root of ('+''.join(spoken(k) for k in kids)+')'
        if name=='mover' and len(kids)>=2:
            return spoken(kids[0])+' with '+spoken(kids[1])+' above'
        if name in ('mspace','mphantom'):
            return ' '
        if not kids:
            return ''.join(el.itertext()).strip()
        return ''.join(spoken(k) for k in kids)

    def replace(match):
        try:
            root=ET.fromstring(match.group(0))
        except ET.ParseError:
            raise ValueError('Invalid MathML in chapter content: '+match.group(0)[:150])
        label=re.sub(r'\s+',' ',spoken(root)).strip()
        label=re.sub(r'\s*([=≈×+−<>])\s*',r' \1 ',label)
        label=re.sub(r'\s+',' ',label).strip()
        return ('<span class="equation-formula" role="math" aria-label="'
                +html_module.escape(label,quote=True)
                +'"><span class="eq-layout" aria-hidden="true">'
                +walk(root)+'</span></span>')
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
# Reading layout: section numbers get their own span, and each set of Understanding Check
# questions is grouped so it reads as one calm panel. Text and anchors are unchanged.
def html_escape(x):
    return x.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;").replace('"',"&quot;")
def reading_layout(html):
    html=re.sub(r'(<h2 id="[^"]+">)(\d+\.)\s+',r'\1<span class="sec-num">\2</span> ',html)
    out=[];pos=0
    starts=[m for m in re.finditer(r'<p><strong>Understanding Check[^<]*</strong></p>|<h2 id="[^"]+"><span class="sec-num">\d+\.</span> Understanding Check[^<]*</h2>',html)]
    for m in starts:
        if m.start()<pos: continue
        end=len(html)
        nxt=re.compile(r'<h[23][ >]').search(html,m.end())
        if nxt: end=nxt.start()
        if m.group(0).startswith('<h2'):
            out.append(html[pos:m.end()]); body=html[m.end():end]; label=''
        else:
            out.append(html[pos:m.start()]); body=html[m.end():end]
            label=m.group(0).replace('<p><strong>','<p class="check-label"><strong>',1)
        # On phones the questions open in their own sheet: the block shows only this launcher card.
        title=re.sub(r'<[^>]+>','',m.group(0))
        title=re.sub(r'^\s*\d+\.\s*','',title).strip()
        part=re.sub(r'^Understanding Check\s*[:—–-]?\s*','',title).strip()
        n=len(re.findall(r'<details(?![^>]*figure-attribution)',body))
        sub=(part+' · ' if part else '')+f'{n} question'+('s' if n!=1 else '')
        launch=(f'<button type="button" class="check-launch" aria-haspopup="dialog" data-questions="{n}" data-part="{html_escape(part)}">'
                '<span class="cl-badge" aria-hidden="true">?</span><span class="cl-text"><strong>Understanding Check</strong>'
                f'<span class="cl-sub">{html_escape(sub)}</span></span><span class="cl-go">Start</span></button>')
        out.append('<section class="check-block">'+launch+'<div class="check-body">'+label+body.rstrip('\n')+'</div></section>\n'); pos=end
    out.append(html[pos:])
    return ''.join(out)
# Every multiple-choice question gets a stable id (chapter + a hash of its wording), so answer
# statistics follow the question even if questions are reordered. Rewording a question gives it a new id.
def question_ids(html, slug):
    def add(m):
        before=html[:m.start()]
        p=before.rfind('<p>')
        stem=re.sub(r'<[^>]+>','',before[p:].split('<span class="mcq-options">')[0])
        stem=re.sub(r'^\s*\d+\.\s*','',stem).strip()
        qid=slug+':'+hashlib.sha1(stem.encode('utf-8')).hexdigest()[:8]
        return f'<details class="mcq-answer" data-qid="{qid}"'
    return re.sub(r'<details class="mcq-answer"',add,html)
import hashlib
# Videos: one compact, tappable card (title, creator, part/length, one line of what it shows). Technical
# notes ("loads only when tapped", embed details) stay out of sight; the credit and a YouTube link appear
# with the player once it opens.
def video_cards(html):
    def card(m):
        attrs,inner=m.group(1),m.group(2)
        get=lambda pat: (re.search(pat,inner,re.S) or [None,''])[1]
        eyebrow=html_module.unescape(get(r'<span class="media-eyebrow">(.*?)</span>'))
        title=get(r'<h3>(.*?)</h3>')
        desc=get(r'</h3>\s*<p>(.*?)</p>')
        url=get(r'<a class="media-outlink" href="([^"]+)"')
        credit=html_module.unescape(re.sub(r'<[^>]+>','',get(r'<p class="media-credit">(.*?)</p>')))
        creator=(re.match(r'©\s*([^.,;]+)',credit) or [None,''])[1].strip()
        credit=re.sub(r"\s*(Shown|shown) via YouTube's privacy-enhanced embed\.?|\s*Official YouTube embed; not (downloaded or )?rehosted\.|\s*The written explanation (above|on this page) does not depend on this video\.",'',credit).strip().rstrip(',')
        desc=re.sub(r'\s*It loads only when tapped\.','',desc).strip()
        if creator and desc.startswith(creator): desc=desc[len(creator):].lstrip('. ').strip()
        em=re.match(r'^,?\s*<em>(.*?)</em>\.?$',desc)
        if em: title,desc=em.group(1),''                      # the video's own title was given in the description
        aff=re.match(r'^,\s*([^.]+)\.\s*',desc)
        if aff: creator+=', '+aff.group(1); desc=desc[aff.end():]   # e.g. "Catherine Tsai, UCSF School of Medicine"
        if creator: title=re.sub(r'\s*[—–-]\s*'+re.escape(creator)+r'$','',title)
        start=re.search(r'Starts at ([0-9:]+)\.\s*',desc)
        desc=re.sub(r'Starts at [0-9:]+\.\s*','',desc).strip()
        meta=['Video']+([creator] if creator else [])
        part=re.search(r'PART (\d+) OF (\d+)',eyebrow); mins=re.search(r'ABOUT (\d+) MINUTES?',eyebrow)
        if part: meta.append(f'Part {part[1]} of {part[2]}')
        if mins: meta.append(f'about {mins[1]} min')
        if 'NARRATED' in eyebrow: meta.append('narrated')
        if start: meta.append(f'from {start[1]}')
        esc_attr=lambda x: html_module.escape(x,quote=True)
        return (f'<div class="media-resource video-resource"{attrs} data-credit="{esc_attr(credit)}" data-url="{url}">'
                f'<button type="button" class="video-card" data-media-action="play-video" aria-expanded="false">'
                f'<span class="vc-play" aria-hidden="true"></span><span class="vc-text"><span class="vc-title">{title}</span>'
                f'<span class="vc-meta">{" · ".join(meta)}</span>{f"<span class=vc-desc>{desc}</span>" if desc else ""}</span></button>'
                f'<div class="media-stage"></div></div>')
    html=re.sub(r'<div class="media-resource video-resource"([^>]*)>(.*?<p class="media-credit">.*?</p>)</div>',card,html,flags=re.S)
    # Other media labels in sentence case, not capitals
    return re.sub(r'<span class="media-eyebrow">([^<]*)</span>',lambda m: '<span class="media-eyebrow">'+m.group(1)[:1]+m.group(1)[1:].lower()+'</span>',html)
for t in topics: t['html']=responsive_images(question_ids(video_cards(reading_layout(t['html'])),t['slug']))

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
# Lecture tests: lecture-tests/<lecture-slug>.md (reviewed question files) → one file each, loaded only
# when a student opens that test. Every question keeps a stable id (hash of its wording) for answer statistics.
def lecture_test(path):
    src=path.read_text(encoding='utf-8')
    head,*blocks=re.split(r'\n### Q\d+\n',src)
    meta=dict(re.findall(r'^(Lecture slug|Chapters): (.+)$',head,re.M))
    lecture=meta['Lecture slug'].strip(); chapters=[c.strip() for c in meta['Chapters'].split(',')]
    by_title={t['title'].lower():t for t in topics if t['slug'] in chapters}
    questions=[]
    for b in blocks:
        f=dict(re.findall(r'^(Chapter|Section|Type|Stem|Answer|Why|Slides): (.*)$',b,re.M))
        opts=dict(re.findall(r'^([A-D])\. (.*)$',b,re.M)); nots=dict(re.findall(r'^Not ([A-D]): (.*)$',b,re.M))
        title=re.sub(r'^Chapter \d+\s*[—-]\s*','',f['Chapter']).strip().lower()
        t=by_title.get(title)
        assert t, f'{path.name}: unknown chapter {f["Chapter"]}'
        num=re.match(r'(\d+)\.',f['Section'].strip())
        sec=next((s for s in t['sections'] if num and s['title'].startswith(num.group(1)+'.')),None)
        assert sec, f'{path.name}: unknown section {f["Section"]}'
        assert set(opts)==set('ABCD') and f['Answer'].strip() in opts and len(nots)==3, f'{path.name}: incomplete question {f["Stem"][:40]}'
        qid='lt-'+lecture+':'+hashlib.sha1(f['Stem'].encode('utf-8')).hexdigest()[:8]
        questions.append({'id':qid,'chapter':t['slug'],'section':sec['id'],'type':f['Type'].strip(),'stem':f['Stem'].strip(),
            'options':opts,'answer':f['Answer'].strip(),'why':f['Why'].strip(),'not':nots})
    assert len({q['id'] for q in questions})==len(questions), f'{path.name}: duplicate question'
    return lecture,{'lecture':lecture,'chapters':chapters,'questions':questions}
tests={}
for path in sorted((ROOT/'lecture-tests').glob('*.md')):
    lecture,data=lecture_test(path)
    tests[lecture]={'count':len(data['questions']),'chapters':data['chapters'],'file':emit('test-'+lecture,'(window.DOM_TESTS=window.DOM_TESTS||{})['+json.dumps(lecture)+']='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n')}
# LAMLA (last-minute mode): lamla/<lecture-slug>.md → one compact file per lecture: per chapter, the
# must-know lines (★ = highest yield) and the other sheet sections as ready-made HTML.
def lamla_sheet(path):
    src=path.read_text(encoding='utf-8')
    meta=dict(re.findall(r'^(Lecture slug|Chapters): (.+)$',src,re.M))
    lecture=meta['Lecture slug'].strip(); slugs=[c.strip() for c in meta['Chapters'].split(',')]
    by_title={t['title'].lower():t['slug'] for t in topics if t['slug'] in slugs}
    chapters=[]
    for block in re.split(r'\n(?=## )',src)[1:]:
        heading,body=block.split('\n',1)
        title=re.sub(r'^##\s*(Chapter \d+\s*[—-]\s*)?','',heading).strip().lower()
        slug=by_title.get(title)
        assert slug, f'{path.name}: unknown chapter {heading}'
        parts=dict((m.group(1).strip().lower(),m.group(2)) for m in re.finditer(r'^### (.+?)\n(.*?)(?=^### |\Z)',body,re.M|re.S))
        must=[]
        for line in re.findall(r'^- (.+)$',parts.get('must-know',''),re.M):
            star=line.startswith('★'); text=line.lstrip('★ ').strip()
            must.append({'star':star,'html':readable_math(md(text)).strip().removeprefix('<p>').removesuffix('</p>')})
        sec=lambda k: readable_math(md(parts[k].strip())) if k in parts else ''
        chapters.append({'slug':slug,'must':must,'numbers':sec('numbers to know'),'chains':sec('core chains'),
                         'confuse':sec("don't confuse"),'traps':sec('exam traps')})
    assert [c['slug'] for c in chapters]==slugs, f'{path.name}: chapters out of order'
    return lecture,{'lecture':lecture,'chapters':chapters}
lamla={}
for path in sorted((ROOT/'lamla').glob('*.md')):
    lecture,data=lamla_sheet(path)
    lamla[lecture]={'chapters':[c['slug'] for c in data['chapters']],'file':emit('lamla-'+lecture,'(window.DOM_LAMLA=window.DOM_LAMLA||{})['+json.dumps(lecture)+']='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n')}
catalogue=[{k:v for k,v in t.items() if k not in ('html','plain')} for t in topics]
assets=sorted('assets/'+str(f.relative_to(ROOT/'assets')).replace('\\','/') for f in (ROOT/'assets').rglob('*') if f.is_file() and f.suffix in ('.jpg','.png','.webp','.svg'))
bundle={'chapters':chapters,'search':search,'core':core,'widgets':widgets,'assets':assets,'tests':tests,'testApp':ver('lecture-test.js'),'lamla':lamla,'lamlaApp':ver('lamla.js')}
index='window.DOMINANCE_TOPICS='+json.dumps(catalogue,ensure_ascii=False,separators=(',',':'))+';\nwindow.DOM_BUNDLE='+json.dumps(bundle,separators=(',',':'))+';\n'
(out/'index.js').write_text(index,encoding='utf-8')
for f in out.glob('*.js'):
    if f.name!='index.js' and f.name not in keep: f.unlink()

# Point index.html at the current versions of every file it loads.
for html_page in ['index.html','stats.html']:
    page=(ROOT/html_page).read_text(encoding='utf-8')
    for f in ['content/index.js','app.js','mobile-ui.js','offline.js','reader.js','feedback.js','styles.css']:
        page=re.sub(r'(["\'])'+re.escape(f)+r'(\?v=[0-9a-f]+)?\1',lambda m: m.group(1)+ver(f)+m.group(1),page)
    (ROOT/html_page).write_text(page,encoding='utf-8')
# Offline reading: the service worker is generated with the current shell file versions.
shell=['/','styles.css','content/index.js','app.js','mobile-ui.js','offline.js','reader.js','feedback.js']
shell=['/']+[ver(f) for f in shell[1:]]+core
sw=(ROOT/'sw-template.js').read_text(encoding='utf-8')
sw=sw.replace('__SHELL__',json.dumps(shell)).replace('__VERSION__',h(json.dumps(shell)+sw))
(ROOT/'sw.js').write_text(sw,encoding='utf-8')
print('Built',len(topics),'topics; full bundle',round(len(script)/1024),'KiB; catalogue',round(len(index)/1024),'KiB')
