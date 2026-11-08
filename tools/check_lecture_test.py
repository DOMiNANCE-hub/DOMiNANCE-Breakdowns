"""Check a ChatGPT lecture-test draft before review: structure, answer spread, length giveaways,
stem words echoed only in the right option, absolute words, meta references, thin explanations.
Usage: python3 tools/check_lecture_test.py lecture-tests/<lecture>.md"""
import re,sys,json,collections
def parse(path):
    s=open(path).read()
    qs=[]
    for blk in re.split(r'\n### Q',s)[1:]:
        num,body=blk.split('\n',1)
        q={'n':int(num.strip()),'not':{}}
        for line in body.split('\n'):
            m=re.match(r'^(Chapter|Section|Type|Stem|Answer|Why|Slides): (.*)$',line)
            if m: q[m.group(1).lower()]=m.group(2).strip(); continue
            m=re.match(r'^([A-D])\. (.*)$',line)
            if m: q.setdefault('opts',{})[m.group(1)]=m.group(2).strip(); continue
            m=re.match(r'^Not ([A-D]): (.*)$',line)
            if m: q['not'][m.group(1)]=m.group(2).strip()
        qs.append(q)
    return qs

qs=parse(sys.argv[1])
print('questions',len(qs))
print('answer spread',collections.Counter(q['answer'] for q in qs))
longest=0;issues=[]
for q in qs:
    o=q['opts'];L={k:len(v) for k,v in o.items()};key=q['answer']
    if set(o)!=set('ABCD') or len(q['not'])!=3 or key in q['not']: issues.append((q['n'],'structure'))
    mx=max(L.values());mn=min(L.values())
    if L[key]==mx and list(L.values()).count(mx)==1: longest+=1
    if L[key]==mx and mx>1.25*sorted(L.values())[-2]: issues.append((q['n'],'correct clearly longest'))
    if mx>1.6*mn: issues.append((q['n'],f'length spread {mn}-{mx}'))
    stemw=set(w.lower() for w in re.findall(r'[A-Za-z₀-₉]{5,}',q['stem']))
    for k,v in o.items():
        hits=stemw & set(w.lower() for w in re.findall(r'[A-Za-z₀-₉]{5,}',v))
        others=[stemw & set(w.lower() for w in re.findall(r'[A-Za-z₀-₉]{5,}',o[j])) for j in o if j!=k]
        if k==key and hits and not any(hits & x for x in others): issues.append((q['n'],f'stem word only in correct option: {hits}'))
    if re.search(r'\b(always|never|all of the above|none of the above)\b',' '.join(o.values()),re.I): issues.append((q['n'],'absolute word'))
    if re.search(r'\((?!.*\)\s*$)',q['stem']) : pass
    if re.search(r'approved|the slides|notes\b',q['stem']+q['why']+' '.join(q['not'].values()),re.I): issues.append((q['n'],'meta reference'))
    if len(q['why'].split())<14: issues.append((q['n'],f"thin explanation ({len(q['why'].split())} words)"))
print('correct option is uniquely longest in',longest,'of',len(qs))
for i in issues: print(i)
