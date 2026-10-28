(() => {
  'use strict';
  const topics = window.DOMINANCE_TOPICS || [];
  const bySlug = new Map(topics.map(t => [t.slug, t]));
  const main = document.getElementById('main');
  const colors = {
    Heart: ['#e9efff', '#315fdf', '♥'],
    Vessels: ['#e3f9ef', '#14896c', '≋'],
    Control: ['#fff0d5', '#a66e16', '◎'],
    Regional: ['#f0eaff', '#835ac1', '✧']
  };
  const groups = [
    ['Heart', 'The heart and its electrical activity'],
    ['Vessels', 'Blood flow, pressure and exchange'],
    ['Control', 'Regulation and cardiovascular responses'],
    ['Regional', 'Special circulatory beds']
  ];

  // The filenames and page references follow the six uploaded lecture documents.
  // Each lecture links to the SAME canonical topic notes; duplicate PDFs are not duplicated.
  const lectures = [
    {
      slug: 'circulation-1', index: '01', name: 'The Heart and Circulation',
      file: 'CIRCULATION 1(4).pdf', pages: 100, tone: 'blue',
      overview: 'Heart mechanics, pulses, cardiac output, blood flow, blood pressure and capillary exchange.',
      modules: [
        ['cv-introduction','1–6','The heart and the circulatory system'],
        ['cardiac-conduction','7–10','Specialized conducting tissue and impulse propagation'],
        ['cardiac-cycle','11–21','Ventricular filling, contraction, ejection and relaxation'],
        ['pulses','22–26','Arterial pulse and jugular venous pressure'],
        ['heart-sounds','18–19, 27–34','Heart sounds, valve lesions and murmurs'],
        ['cardiac-output','35–51','Cardiac output, preload, afterload and Frank–Starling law'],
        ['co-measurement','52–54, 62','Fick principle, cardiac work and selected flow measurements'],
        ['hemodynamics','55–74','Flow dynamics, vessel properties and resistance'],
        ['venous-return','59, 73–75, 97–98','Venous compliance, blood distribution and venous return'],
        ['blood-pressure','76–83','Arterial pressure, measurement and pulse pressure'],
        ['microcirculation','58, 84–89','Capillary structure, Starling forces and tissue exchange'],
        ['edema','89–93','Mechanisms responsible for oedema'],
        ['lymphatics','60, 94–95','Lymph drainage and lymphoedema']
      ],
      supplements: ['cardiac-muscle']
    },
    {
      slug: 'circulation-2', index: '02', name: 'Regulation of the Cardiovascular System',
      file: 'CIRCULATION 2 REGULATION OF THE CVS(2).pdf', pages: 37, tone: 'teal',
      overview: 'Local autoregulation, nervous and humoral control, baroreceptors and cardiovascular reflexes.',
      modules: [
        ['local-regulation','1–11','Metabolic and myogenic autoregulation, hyperaemia and Laplace law'],
        ['neural-humoral','12–21, 28–30','Sympathetic tone, circulating mediators and central control'],
        ['reflexes','18–36','Baroreceptor, atrial receptor and Cushing responses']
      ]
    },
    {
      slug: 'circulation-3', index: '03', name: 'Homeostasis of the Cardiovascular System',
      file: 'CIRCULATION 3 Homeostasis in CVS.pdf', pages: 43, tone: 'amber',
      overview: 'Gravity, postural compensation, shock, syncope and heart failure; followed by reference images.',
      modules: [
        ['gravity','2–11','Gravity, standing, orthostatic hypotension and acceleration'],
        ['shock','12–30','Types of shock, compensatory responses and syncope'],
        ['heart-failure','31–33','Forward and backward consequences of heart failure'],
        ['ecg','35–38','ECG reference illustrations; explained fully in Lecture 7'],
        ['cerebral','39–41','CSF reference illustrations; developed in Lecture 6'],
        ['coronary','42–43','Coronary reference illustrations; developed in Lecture 6']
      ]
    },
    {
      slug: 'lecture-5', index: '05', name: 'Homeostasis in CVS (Lecture 5)',
      file: 'Lecture 5 Homeostais in CVS.pdf', pages: 35, tone: 'amber', duplicateOf: 'circulation-3',
      overview: 'This is substantially the same Homeostasis material as Circulation 3. Use the same three explanations without rereading duplicates.',
      modules: [
        ['gravity','2–11','Gravity and postural cardiovascular responses'],
        ['shock','12–30','Shock, compensatory mechanisms and syncope'],
        ['heart-failure','31–33','Heart failure physiology']
      ]
    },
    {
      slug: 'lecture-6', index: '06', name: 'Regional Circulation',
      file: 'Lecture 6 Regional Circulation Proper.pdf', pages: 48, tone: 'violet',
      overview: 'How circulation adapts in the brain, coronary vessels, lungs, gut, skin and fetus.',
      modules: [
        ['cerebral','2–25','Brain blood supply, cerebrospinal fluid, BBB, intracranial pressure and stroke'],
        ['coronary','26–29','Coronary perfusion, blood-flow regulation and ischaemia'],
        ['pulmonary','30–32','Low-pressure pulmonary circulation and hypoxic vasoconstriction'],
        ['splanchnic','33–37','Splanchnic, portal and hepatic circulation; ascites'],
        ['skin','38–41','Cutaneous circulation, temperature regulation and triple response'],
        ['fetal','42–45','Fetal shunts and changes after birth'],
        ['lymphatics','47–48','Additional lymphatic anatomy and drainage illustrations']
      ]
    },
    {
      slug: 'lecture-7', index: '07', name: 'Cardiac Rhythms and the Electrocardiogram',
      file: 'Lecture 7 ECG 2.pdf', pages: 14, tone: 'rose',
      overview: 'ECG leads, the meaning of waves and intervals, standard calibration and heart-rate calculation.',
      modules: [
        ['ecg','1–14','12-lead ECG, P/QRS/T waves, PR and QT intervals, ST segment and rate']
      ]
    }
  ];
  const byLecture = new Map(lectures.map(l => [l.slug, l]));
  const completed = new Set(JSON.parse(localStorage.getItem('dom-completed') || '[]'));
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
  const topicUrl = (slug, from) => '#/physiology/cvs/' + slug + (from ? '?from=' + encodeURIComponent(from) : '');
  const lectureUrl = slug => '#/physiology/cvs/lecture/' + slug;
  const baseUrl = '#/physiology/cvs';
  const heroSvg = `<svg class="hero-heart" viewBox="0 0 120 120" aria-hidden="true"><path d="M60 103C48 91 20 73 15 50 9 21 43 7 60 34 77 7 111 21 105 50c-5 23-33 41-45 53Z"/><path d="M17 60h22l9-15 12 34 9-21h35"/></svg>`;
  const topIcon = t => {
    const [bg, color, icon] = colors[t.group] || colors.Heart;
    return `<span class="topic-icon" style="--ico-bg:${bg};--ico-color:${color}">${icon}</span>`;
  };
  const buildTopicCard = t => `<a class="topic-card" href="${topicUrl(t.slug)}" aria-label="Open ${esc(t.title)}"><div class="card-top">${topIcon(t)}<span class="topic-arrow" aria-hidden="true">↗</span></div><h3>${esc(t.title)}</h3><div class="meta">${completed.has(t.slug) ? '<span class="done-tag">✓ Reviewed</span>' : 'Open breakdown'}</div></a>`;
  const getFrom = () => {
    const raw = (location.hash || '').split('?')[1] || '';
    const m = new URLSearchParams(raw).get('from');
    return byLecture.get(m) || null;
  };

  function home() {
    document.title = 'CVS Study Library | DOMiNANCE Breakdowns';
    main.innerHTML = `<section class="hero"><div class="hero-content"><div class="eyebrow">DOMiNANCE · PHYSIOLOGY</div><h1>Cardiovascular System,<br>made understandable.</h1><p>Find your lecture document, see exactly what it covers, and open the relevant explanations.</p><span class="hero-chip">6 lecture PDFs · ${topics.length} breakdowns</span></div><div class="hero-visual"><div class="hero-orbit">${heroSvg}</div></div></section>
      <div class="library-heading"><div><h2>Find your material</h2><p>Start with the slides your lecturer shared, or revise by individual topic.</p></div><div class="library-tabs" role="group" aria-label="Choose browsing method"><button class="library-tab" type="button" data-mode="lectures" aria-pressed="true">By lecture slides</button><button class="library-tab" type="button" data-mode="topics" aria-pressed="false">By topic</button></div></div>
      <label class="search-field" aria-label="Search lecture documents and topics"><span>⌕</span><input id="search" autocomplete="off" placeholder="Search lectures or topics…"/></label><div id="library-list"></div>`;
    const requestedView = new URLSearchParams((location.hash || '').split('?')[1] || '').get('view');
    let mode = requestedView === 'topics' ? 'topics' : (localStorage.getItem('dom-library-view') === 'topics' ? 'topics' : 'lectures');
    let term = '';
    let group = 'All';
    const draw = () => {
      document.querySelectorAll('[data-mode]').forEach(b => {
        const chosen = b.dataset.mode === mode;
        b.classList.toggle('selected', chosen);
        b.setAttribute('aria-pressed', String(chosen));
      });
      document.querySelector('#search').placeholder = mode === 'lectures' ? 'Search lecture title or topic…' : 'Search any topic or concept…';
      if (mode === 'lectures') {
        const relevant = lectures.filter(l => `${l.file} ${l.name} ${l.overview} ${l.modules.map(m => bySlug.get(m[0])?.title).join(' ')}`.toLowerCase().includes(term));
        document.getElementById('library-list').innerHTML = `<div class="library-explain">Lecture filenames match your uploaded slides. Each opens a syllabus-style overview with links to its breakdowns.</div><div class="lecture-grid">${relevant.map(l => `<a class="lecture-card tone-${l.tone}" href="${lectureUrl(l.slug)}"><div class="lecture-card-head"><span class="lecture-number">${l.index}</span><span class="lecture-doc-icon" aria-hidden="true">▤</span></div><div class="lecture-file">${esc(l.file)}</div><h3>${esc(l.name)}</h3><p>${esc(l.overview)}</p><div class="lecture-card-bottom"><span>${l.pages} slide pages · ${l.modules.length} linked breakdowns</span><span aria-hidden="true">↗</span></div></a>`).join('')}</div>${relevant.length ? '<p class="library-note">Some slides appear in more than one document. Shared concepts link to the same explanation.</p>' : '<div class="empty">No lecture matches your search.</div>'}`;
      } else {
        const filtered = groups.map(([grp, desc]) => {
          if (group !== 'All' && group !== grp) return '';
          const selected = topics.filter(t => t.group === grp && (`${t.title} ${t.plain}`).toLowerCase().includes(term));
          return selected.length ? `<section><div class="group-label">${esc(grp)} · ${esc(desc)}</div><div class="cards">${selected.map(buildTopicCard).join('')}</div></section>` : '';
        }).join('');
        document.getElementById('library-list').innerHTML = `<div class="filters" role="group" aria-label="Filter by section">${['All',...groups.map(g => g[0])].map(g => `<button class="filter ${group===g?'active':''}" type="button" data-group="${g}">${g === 'All' ? 'All topics' : g}</button>`).join('')}</div>${filtered || '<div class="empty">No matching topics. Try another keyword.</div>'}<p class="library-note">Cardiac Muscle Physiology includes important supplementary foundations that are not developed in a standalone lecture PDF.</p>`;
        document.querySelectorAll('[data-group]').forEach(b => b.addEventListener('click', () => {group = b.dataset.group; draw();}));
      }
    };
    document.querySelector('#search').addEventListener('input', e => {term = e.target.value.trim().toLowerCase(); draw();});
    document.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => {mode = b.dataset.mode; term = ''; group = 'All'; document.querySelector('#search').value = ''; localStorage.setItem('dom-library-view', mode); draw();}));
    draw();
  }

  function lecturePage(l) {
    document.title = l.name + ' | DOMiNANCE Breakdowns';
    const rows = l.modules.map((m, i) => {
      const t = bySlug.get(m[0]);
      if (!t) return '';
      return `<a class="lecture-row" href="${topicUrl(t.slug, l.slug)}"><span class="lecture-order">${String(i+1).padStart(2, '0')}</span><span class="lecture-row-main"><span class="lecture-row-title">${esc(t.title)}</span><span class="lecture-row-detail">${esc(m[2])}</span></span><span class="lecture-page-ref">PDF pp. ${esc(m[1])}</span><span class="lecture-arrow" aria-hidden="true">↗</span></a>`;
    }).join('');
    const extra = l.supplements?.length ? `<section class="extra-foundations"><h3>Important foundations added for understanding</h3><p>The lecture refers to these concepts but does not explain them as a full standalone topic.</p>${l.supplements.map(slug => {const t=bySlug.get(slug);return t?`<a class="foundation-link" href="${topicUrl(slug, l.slug)}">${esc(t.title)} <span>Supplementary teaching →</span></a>`:''}).join('')}</section>` : '';
    const duplicate = l.duplicateOf ? `<div class="duplicate-notice"><strong>Shared material:</strong> This PDF substantially repeats <a href="${lectureUrl(l.duplicateOf)}">Circulation 3</a>. The links below deliberately use the same notes, so you only need to study them once.</div>` : '';
    main.innerHTML = `<div class="breadcrumb"><a href="${baseUrl}">Physiology</a> / <a href="${baseUrl}">Cardiovascular System</a> / ${esc(l.name)}</div><section class="lecture-hero tone-${l.tone}"><span class="lecture-kicker">FROM YOUR LECTURE SLIDES</span><div class="lecture-hero-layout"><div><div class="lecture-filename">${esc(l.file)}</div><h1>${esc(l.name)}</h1><p>${esc(l.overview)}</p></div><div class="lecture-stats"><strong>${l.pages}</strong><span>PDF pages</span></div></div></section>${duplicate}<section class="lecture-outline"><div class="section-heading"><div><h2>What this lecture contains</h2><p>Select a part to open its explanatory breakdown. Page references help you follow your PDF.</p></div></div><div class="lecture-rows">${rows}</div></section>${extra}<div class="lecture-footnav"><a class="btn" href="${baseUrl}">← All lecture documents</a><a class="btn" href="${baseUrl}?view=topics">Browse all CVS topics</a></div>`;
  }

  function article(t) {
    document.title = t.title + ' | DOMiNANCE Breakdowns';
    const sourceLecture = getFrom();
    const idx = topics.indexOf(t);
    const relevant = sourceLecture ? sourceLecture.modules.map(m => m[0]).concat(sourceLecture.supplements || []).filter((v,i,a) => a.indexOf(v)===i) : topics.map(t => t.slug);
    const rIdx = relevant.indexOf(t.slug);
    const prev = bySlug.get(relevant[rIdx - 1]) || (!sourceLecture ? topics[idx - 1] : null);
    const next = bySlug.get(relevant[rIdx + 1]) || (!sourceLecture ? topics[idx + 1] : null);
    const scope = sourceLecture?.modules.find(m => m[0] === t.slug);
    const breadcrumb = sourceLecture ? `<a href="${lectureUrl(sourceLecture.slug)}">${esc(sourceLecture.name)}</a>` : `<a href="${baseUrl}">All CVS topics</a>`;
    const toc = t.sections.map(s => `<a href="#${esc(s.id)}" data-scroll="${esc(s.id)}">${esc(s.title)}</a>`).join('');
    main.innerHTML = `<div class="breadcrumb"><a href="${baseUrl}">Physiology</a> / <a href="${baseUrl}">Cardiovascular System</a> / ${breadcrumb} / ${esc(t.title)}</div><div class="article-layout"><article class="article-sheet"><div class="article-top"><span class="topic-flag">${esc(t.group)} · CVS</span><span class="topic-flag">Explanatory breakdown</span></div><h1>${esc(t.title)}</h1><div class="article-summary">${sourceLecture ? `From <strong>${esc(sourceLecture.file)}</strong>${scope ? `, slides ${esc(scope[1])}` : ' · supplementary foundation'}. ` : ''}Study one idea at a time: understand the mechanism, then check your reasoning.</div><div class="mobile-sections"><label for="sections-select" class="group-label">Jump to a section</label><select id="sections-select"><option value="">Select section…</option>${t.sections.map(s => `<option value="${esc(s.id)}">${esc(s.title)}</option>`).join('')}</select></div><div class="article-text">${window.DOM_DIAGRAMS?.[t.slug] || ''}${t.html}</div><div class="source-foot"><b>Source coverage:</b> ${esc(t.source)}, pages ${esc(t.pages)}. Some prerequisite explanations are supplementary. This is a teaching breakdown, not a slide transcription.</div><div class="article-end"><button id="mark-read" class="btn btn-primary">${completed.has(t.slug) ? '✓ Reviewed' : 'Mark as reviewed'}</button>${sourceLecture ? `<a class="btn" href="${lectureUrl(sourceLecture.slug)}">← Back to lecture outline</a>` : ''}${next ? `<a class="btn" href="${topicUrl(next.slug, sourceLecture?.slug)}">Next: ${esc(next.title)} →</a>` : `<a class="btn" href="${baseUrl}">All CVS topics →</a>`}</div></article><aside class="toc"><h2>In this breakdown</h2>${toc}<div class="toc-info">Short teaching sections with explanations and quick checks.</div><div class="nav-bottom">${prev ? `<a href="${topicUrl(prev.slug, sourceLecture?.slug)}">← Previous topic</a>` : ''}${sourceLecture ? `<a href="${lectureUrl(sourceLecture.slug)}">Back to ${esc(sourceLecture.name)}</a>` : `<a href="${baseUrl}">All CVS topics</a>`}${next ? `<a href="${topicUrl(next.slug, sourceLecture?.slug)}">Next topic →</a>` : ''}</div></aside></div>`;
    document.getElementById('mark-read').addEventListener('click', () => {
      if (completed.has(t.slug)) completed.delete(t.slug); else completed.add(t.slug);
      localStorage.setItem('dom-completed', JSON.stringify([...completed]));
      document.getElementById('mark-read').textContent = completed.has(t.slug) ? '✓ Reviewed' : 'Mark as reviewed';
    });
    document.querySelectorAll('[data-scroll]').forEach(a => a.addEventListener('click', e => {e.preventDefault();document.getElementById(a.dataset.scroll)?.scrollIntoView({behavior:'smooth'});}));
    document.getElementById('sections-select')?.addEventListener('change', e => document.getElementById(e.target.value)?.scrollIntoView({behavior:'smooth'}));
  }

  function navigate() {
    const path = (location.hash || '').replace(/^#\/?/, '').split('?')[0].split('/').filter(Boolean);
    if (path[2] === 'lecture' && byLecture.has(path[3])) lecturePage(byLecture.get(path[3]));
    else if (bySlug.has(path[2])) article(bySlug.get(path[2]));
    else home();
    window.scrollTo({top:0, behavior:'instant'});
    updateProgress();
  }
  function updateProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    document.getElementById('scroll-progress').style.width = (max > 0 ? Math.min(100, 100 * window.scrollY / max) : 0) + '%';
  }
  window.addEventListener('hashchange', navigate);
  window.addEventListener('scroll', updateProgress, {passive:true});
  window.addEventListener('resize', updateProgress);
  document.documentElement.setAttribute('data-theme', localStorage.getItem('dom-theme') || 'light');
  document.getElementById('theme-toggle').addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('dom-theme', next);
  });
  navigate();
})();
