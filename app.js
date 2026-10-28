(() => {
  'use strict';
  const topics = window.DOMINANCE_TOPICS || [];
  const bySlug = new Map(topics.map(t => [t.slug, t]));
  const main = document.getElementById('main');
  const colors={Heart:['#e9efff','#315fdf','♥'],Vessels:['#e3f9ef','#14896c','≋'],Control:['#fff0d5','#a66e16','◎'],Regional:['#f0eaff','#835ac1','✧']};
  const groups=[['Heart','The heart and its electrical activity'],['Vessels','Blood flow, pressure and exchange'],['Control','Regulation and cardiovascular responses'],['Regional','Special circulatory beds']];
  const completed = new Set(JSON.parse(localStorage.getItem('dom-completed')||'[]'));
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const routeFor=t=>'#/physiology/cvs/'+t.slug;
  const currentSlug=()=>decodeURIComponent((location.hash||'').split('/').at(-1)||'');
  const heroSvg=`<svg class="hero-heart" viewBox="0 0 120 120" aria-hidden="true"><path d="M60 103C48 91 20 73 15 50 9 21 43 7 60 34 77 7 111 21 105 50c-5 23-33 41-45 53Z"/><path d="M17 60h22l9-15 12 34 9-21h35"/></svg>`;
  const topIcon=t=>{const [bg,color,icon]=colors[t.group]||colors.Heart;return `<span class="topic-icon" style="--ico-bg:${bg};--ico-color:${color}">${icon}</span>`};
  const buildCard=t=>`<a class="topic-card" href="${routeFor(t)}" aria-label="Open ${esc(t.title)}"><div class="card-top">${topIcon(t)}<span class="topic-arrow" aria-hidden="true">↗</span></div><h3>${esc(t.title)}</h3><div class="meta">${completed.has(t.slug)?'<span class="done-tag">✓ Reviewed</span>':'Open breakdown'}</div></a>`;
  function home(){
    document.title='CVS Topics | DOMiNANCE Breakdowns';
    main.innerHTML=`<section class="hero"><div class="hero-content"><div class="eyebrow">DOMiNANCE · PHYSIOLOGY</div><h1>Cardiovascular System,<br>made understandable.</h1><p>Explanatory notes that connect the facts to the mechanisms. Choose a topic and start learning.</p><span class="hero-chip">${topics.length} focused breakdowns</span></div><div class="hero-visual"><div class="hero-orbit">${heroSvg}</div></div></section><div class="section-heading"><div><h2>Explore CVS topics</h2><p>Clear explanations. Real physiological reasoning. No distractions.</p></div></div><label class="search-field" aria-label="Search topics"><span>⌕</span><input id="search" autocomplete="off" placeholder="Search any topic or concept…"/></label><div class="filters" role="group" aria-label="Filter by section">${['All',...groups.map(g=>g[0])].map((x,i)=>`<button type="button" class="filter ${i===0?'active':''}" data-filter="${x}">${x==='All'?'All topics':x}</button>`).join('')}</div><div id="topic-groups"></div>`;
    let filter='All',term='';
    const draw=()=>{
      let count=0;
      document.getElementById('topic-groups').innerHTML=groups.map(([grp,desc])=>{
        if(filter!=='All'&&filter!==grp)return '';
        const list=topics.filter(t=>t.group===grp&&(`${t.title} ${t.plain}`).toLowerCase().includes(term));
        if(!list.length)return '';
        count+=list.length;
        return `<section><div class="group-label">${grp} · ${desc}</div><div class="cards">${list.map(buildCard).join('')}</div></section>`;
      }).join('')||'<div class="empty">No matching topics. Try another keyword.</div>';
    };
    document.getElementById('search').addEventListener('input',e=>{term=e.target.value.trim().toLowerCase();draw()});
    document.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{filter=btn.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('active',x===btn));draw()}));
    draw();
  }
  function article(t){
    document.title=t.title+' | DOMiNANCE Breakdowns';
    const idx=topics.indexOf(t),prev=topics[idx-1],next=topics[idx+1];
    const toc=t.sections.map(s=>`<a href="#${esc(s.id)}" data-scroll="${esc(s.id)}">${esc(s.title)}</a>`).join('');
    main.innerHTML=`<div class="breadcrumb"><a href="#/physiology/cvs">Physiology</a> / <a href="#/physiology/cvs">Cardiovascular System</a> / ${esc(t.title)}</div><div class="article-layout"><article class="article-sheet"><div class="article-top"><span class="topic-flag">${esc(t.group)} · CVS</span><span class="topic-flag">Explanatory breakdown</span></div><h1>${esc(t.title)}</h1><div class="article-summary">Study one idea at a time. Read the mechanism, work through the application and check your reasoning.</div><div class="mobile-sections"><label for="sections-select" class="group-label">Jump to a section</label><select id="sections-select"><option value="">Select section…</option>${t.sections.map(s=>`<option value="${esc(s.id)}">${esc(s.title)}</option>`).join('')}</select></div><div class="article-text">${window.DOM_DIAGRAMS?.[t.slug] || ''}${t.html}</div><div class="source-foot"><b>Source coverage:</b> ${esc(t.source)}, pages ${esc(t.pages)}. Some prerequisite explanations are supplementary. This is a learning breakdown, not a reproduction of lecture slides.</div><div class="article-end"><button id="mark-read" class="btn btn-primary">${completed.has(t.slug)?'✓ Reviewed':'Mark as reviewed'}</button>${next?`<a class="btn" href="${routeFor(next)}">Next: ${esc(next.title)} →</a>`:`<a class="btn" href="#/physiology/cvs">All CVS topics →</a>`}</div></article><aside class="toc"><h2>In this breakdown</h2>${toc}<div class="toc-info">Short teaching sections with explanations and quick checks.</div><div class="nav-bottom">${prev?`<a href="${routeFor(prev)}">← Previous topic</a>`:''}<a href="#/physiology/cvs">All CVS topics</a>${next?`<a href="${routeFor(next)}">Next topic →</a>`:''}</div></aside></div>`;
    document.getElementById('mark-read').addEventListener('click',()=>{if(completed.has(t.slug))completed.delete(t.slug);else completed.add(t.slug);localStorage.setItem('dom-completed',JSON.stringify([...completed]));document.getElementById('mark-read').textContent=completed.has(t.slug)?'✓ Reviewed':'Mark as reviewed'});
    document.querySelectorAll('[data-scroll]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();document.getElementById(a.dataset.scroll)?.scrollIntoView({behavior:'smooth'});}));
    document.getElementById('sections-select')?.addEventListener('change',e=>document.getElementById(e.target.value)?.scrollIntoView({behavior:'smooth'}));
  }
  function navigate(){const slug=currentSlug();if(bySlug.has(slug))article(bySlug.get(slug));else home();window.scrollTo({top:0,behavior:'instant'});updateProgress();}
  function updateProgress(){const d=document.documentElement;const max=d.scrollHeight-window.innerHeight;document.getElementById('scroll-progress').style.width=(max>0?Math.min(100,100*window.scrollY/max):0)+'%'}
  window.addEventListener('hashchange',navigate);window.addEventListener('scroll',updateProgress,{passive:true});window.addEventListener('resize',updateProgress);
  const mode=localStorage.getItem('dom-theme')||'light';document.documentElement.setAttribute('data-theme',mode);
  document.getElementById('theme-toggle').addEventListener('click',()=>{const next=document.documentElement.getAttribute('data-theme')==='light'?'dark':'light';document.documentElement.setAttribute('data-theme',next);localStorage.setItem('dom-theme',next)});
  navigate();
})();
