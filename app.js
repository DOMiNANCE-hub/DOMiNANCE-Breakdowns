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
      file: 'Lecture 5 Homeostasis in CVS.pdf', pages: 35, tone: 'amber', duplicateOf: 'circulation-3',
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
  // Saved preferences are optional: storage can be blocked (private browsing, in-app browsers) or hold corrupt values.
  const readStore = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const writeStore = (key, value) => { try { localStorage.setItem(key, value); } catch { /* preference is not saved */ } };
  const readCompleted = () => {
    try {
      const saved = JSON.parse(readStore('dom-completed') || '[]');
      return Array.isArray(saved) ? saved.filter(s => typeof s === 'string') : [];
    } catch { return []; }
  };
  const completed = new Set(readCompleted());
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
  // ---------- on-demand loading: only the chapter being read is downloaded ----------
  const bundle = window.DOM_BUNDLE || {chapters: {}, core: [], widgets: {}};
  const scripts = new Map();
  const loadScript = src => {
    if (!scripts.has(src)) scripts.set(src, new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src; s.async = false;   // keep execution order (widget files need teaching-widgets.js first)
      s.onload = resolve;
      s.onerror = () => { scripts.delete(src); s.remove(); reject(new Error('Could not load ' + src)); };
      document.head.append(s);
    }));
    return scripts.get(src);
  };
  const chapterHtml = slug => (window.DOM_CHAPTERS || {})[slug];
  const ensureChapter = t => chapterHtml(t.slug) != null ? Promise.resolve() :
    Promise.all([loadScript(bundle.chapters[t.slug]), loadScript(bundle.core[0])]);
  const loadCore = () => Promise.all(bundle.core.map(loadScript));
  const loadWidgetsFor = html => {
    const names = new Set([...html.matchAll(/data-widget="([a-z0-9-]+)"/g)].map(m => m[1]));
    const files = new Set([...names].map(n => bundle.widgets[n]).filter(Boolean));
    return Promise.all([...files].map(loadScript));
  };
  const searchIndex = () => window.DOM_SEARCH ? Promise.resolve() : loadScript(bundle.search);
  const prefetch = src => {
    if (!src || scripts.has(src) || document.querySelector(`link[href="${src}"]`)) return;
    const l = document.createElement('link'); l.rel = 'prefetch'; l.as = 'script'; l.href = src; document.head.append(l);
  };
  const idle = fn => (window.requestIdleCallback || (f => setTimeout(f, 1200)))(fn);
  let routeToken = 0;
  const markRendered = () => { main.dataset.route = location.hash || '#/'; main.removeAttribute('aria-busy'); };
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

  // "Continue where you left off": the last chapter and section read on this device.
  function resumeCard() {
    let last = null;
    try { last = JSON.parse(readStore('dom-last') || 'null'); } catch { last = null; }
    const t = last && bySlug.get(last.slug);
    if (!t) return '';
    const s = t.sections.find(x => x.id === last.id);
    return `<a class="resume-card" href="${topicUrl(t.slug)}${s ? '?section=' + encodeURIComponent(s.id) : ''}"><span class="resume-text"><small>Continue where you left off</small><strong>${esc(t.title)}</strong>${s ? `<span>${esc(s.title)}</span>` : ''}</span><span class="resume-go" aria-hidden="true">Resume →</span></a>`;
  }
  // Lecture PDFs that repeat another one are shown on that lecture's card, not as a card of their own.
  const twins = l => lectures.filter(d => d.duplicateOf === l.slug);
  const docName = f => String(f || '').replace(/\.pdf$/i, '').replace(/\s*\(\d+\)$/, '').trim();
  function cvsHome() {
    document.title = 'Cardiovascular Physiology | DOMiNANCE Breakdowns';
    main.innerHTML = `<section class="hero"><div class="hero-content"><div class="eyebrow">DOMiNANCE BREAKDOWNS · PHYSIOLOGY</div><h1>Cardiovascular Physiology,<br>Made Understandable.</h1><p>Understand your lectures through clear explanations of what happens, why it happens, and how the underlying mechanisms work.</p><span class="hero-chip">6 lecture documents · ${topics.length} breakdowns</span></div><div class="hero-visual"><div class="hero-orbit">${heroSvg}</div></div></section>
      <div class="library-heading"><div><h2>Find your breakdown</h2><p>Browse by lecture document or choose a specific topic to begin studying.</p></div><div class="library-tabs" role="group" aria-label="Choose browsing method"><button class="library-tab" type="button" data-mode="lectures" aria-pressed="true">By lecture document</button><button class="library-tab" type="button" data-mode="topics" aria-pressed="false">By topic</button></div></div>
      ${resumeCard()}<label class="search-field" aria-label="Search lecture documents and topics"><span>⌕</span><input id="search" autocomplete="off" placeholder="Search lectures or topics…"/></label><div id="library-list"></div><section class="offline-card" id="offline-card" aria-label="Offline reading"></section>`;
    const requestedView = new URLSearchParams((location.hash || '').split('?')[1] || '').get('view');
    let mode = requestedView === 'topics' ? 'topics' : (readStore('dom-library-view') === 'topics' ? 'topics' : 'lectures');
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
        const relevant = lectures.filter(l => !l.duplicateOf && `${l.file} ${l.name} ${l.overview} ${twins(l).map(d => `${d.file} ${d.name}`).join(' ')} ${l.modules.map(m => bySlug.get(m[0])?.title).join(' ')}`.toLowerCase().includes(term));
        document.getElementById('library-list').innerHTML = `<div class="lecture-grid">${relevant.map(l => `<a class="lecture-card tone-${l.tone}" href="${lectureUrl(l.slug)}"><div class="lecture-card-head"><span class="lecture-number">${l.index}</span><span class="lecture-doc-icon" aria-hidden="true">▤</span></div><div class="lecture-file">${esc(docName(l.file))}</div>${twins(l).map(d => `<div class="lecture-file lecture-twin">Same slides as ${esc(docName(d.file))}</div>`).join('')}<h3>${esc(l.name)}</h3><p>${esc(l.overview)}</p><div class="lecture-card-bottom"><span>${l.pages} slide pages · ${l.modules.length} linked breakdowns</span><span aria-hidden="true">↗</span></div></a>`).join('')}</div>${relevant.length ? '<p class="library-note">Related lectures may lead to the same topic. Continue where you left off.</p>' : '<div class="empty">No lecture matches your search.</div>'}`;
      } else {
        const filtered = groups.map(([grp, desc]) => {
          if (group !== 'All' && group !== grp) return '';
          const selected = topics.filter(t => t.group === grp && (`${t.title} ${(window.DOM_SEARCH || {})[t.slug] || ''}`).toLowerCase().includes(term));
          return selected.length ? `<section><div class="group-label">${esc(grp)} · ${esc(desc)}</div><div class="cards">${selected.map(buildTopicCard).join('')}</div></section>` : '';
        }).join('');
        document.getElementById('library-list').innerHTML = `<div class="filters" role="group" aria-label="Filter by section">${['All',...groups.map(g => g[0])].map(g => `<button class="filter ${group===g?'active':''}" type="button" data-group="${g}">${g === 'All' ? 'All topics' : g}</button>`).join('')}</div>${filtered || (term && !window.DOM_SEARCH ? '<div class="empty" role="status">Searching all breakdowns…</div>' : '<div class="empty">No matching topics. Try another keyword.</div>')}`;
        document.querySelectorAll('[data-group]').forEach(b => b.addEventListener('click', () => {group = b.dataset.group; draw();}));
      }
    };
    document.querySelector('#search').addEventListener('input', e => {
      term = e.target.value.trim().toLowerCase(); draw();
      if (term && !window.DOM_SEARCH) searchIndex().then(() => { if (document.getElementById('library-list')) draw(); }).catch(() => {});
    });
    document.querySelector('#search').addEventListener('focus', () => idle(() => searchIndex().catch(() => {})), {once: true});
    document.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => {mode = b.dataset.mode; term = ''; group = 'All'; document.querySelector('#search').value = ''; writeStore('dom-library-view', mode); draw();}));
    draw();
  }

  function lecturePage(l) {
    document.title = l.name + ' | DOMiNANCE Breakdowns';
    const rows = l.modules.map((m, i) => {
      const t = bySlug.get(m[0]);
      if (!t) return '';
      return `<a class="lecture-row" href="${topicUrl(t.slug, l.slug)}"><span class="lecture-order">${String(i+1).padStart(2, '0')}</span><span class="lecture-row-main"><span class="lecture-row-title">${esc(t.title)}</span><span class="lecture-row-detail">${esc(m[2])}</span></span><span class="lecture-page-ref">PDF pp. ${esc(m[1])}</span><span class="lecture-arrow" aria-hidden="true">↗</span></a>`;
    }).join('');
    const extra = l.supplements?.length ? `<section class="extra-foundations"><h3>Important foundations added for understanding</h3><p>The lecture refers to these concepts but does not explain them as a full standalone topic.</p>${l.supplements.map(slug => {const t=bySlug.get(slug);return t?`<a class="foundation-link" href="${topicUrl(slug, l.slug)}">${esc(t.title)} <span>Study topic →</span></a>`:''}).join('')}</section>` : '';
    const twinNote = twins(l).map(d => `<div class="duplicate-notice"><strong>Same slides:</strong> ${esc(docName(d.file))} repeats this lecture, so these notes cover both.</div>`).join('');
    const duplicate = l.duplicateOf ? `<div class="duplicate-notice"><strong>Shared material:</strong> This PDF substantially repeats <a href="${lectureUrl(l.duplicateOf)}">Circulation 3</a>. The links below deliberately use the same notes, so you only need to study them once.</div>` : '';
    main.innerHTML = `<div class="breadcrumb"><a href="#/">Home</a> / <a href="${baseUrl}">Cardiovascular System</a> / ${esc(l.name)}</div><section class="lecture-hero tone-${l.tone}"><span class="lecture-kicker">LECTURE BREAKDOWN</span><div class="lecture-hero-layout"><div><div class="lecture-filename">${esc(docName(l.file))}</div><h1>${esc(l.name)}</h1><p>${esc(l.overview)}</p></div><div class="lecture-stats"><strong>${l.pages}</strong><span>PDF pages</span></div></div></section>${duplicate}${twinNote}<section class="lecture-outline"><div class="section-heading"><div><h2>What this lecture contains</h2><p>Select a part to open its explanatory breakdown. Page references help you follow your PDF.</p></div></div><div class="lecture-rows">${rows}</div></section>${extra}<div class="lecture-footnav"><a class="btn" href="${baseUrl}">← All lecture documents</a><a class="btn" href="${baseUrl}?view=topics">Browse all CVS topics</a></div>`;
  }

  // Open a chapter: show its outline at once, download the chapter (cached after the first visit), then render.
  function article(t, done) {
    document.title = t.title + ' | DOMiNANCE Breakdowns';
    const token = ++routeToken;
    const ready = () => {
      if (token !== routeToken) return;
      renderArticle(t);
      done();
      const html = chapterHtml(t.slug);
      Promise.all([loadCore(), loadWidgetsFor(html)]).catch(() => {});
      const next = topics[topics.indexOf(t) + 1];
      if (next) idle(() => prefetch(bundle.chapters[next.slug]));
    };
    if (chapterHtml(t.slug) != null && window.DOM_DIAGRAMS) { ready(); return; }
    main.setAttribute('aria-busy', 'true');
    renderArticle(t, true);
    ensureChapter(t).then(ready, () => {
      if (token !== routeToken) return;
      main.removeAttribute('aria-busy');
      main.innerHTML = `<div class="load-error" role="alert"><h1>${esc(t.title)}</h1><p>This breakdown couldn’t be downloaded. Check your connection, then try again.</p><button class="btn btn-primary" type="button" id="retry-load">Try again</button></div>`;
      document.getElementById('retry-load').addEventListener('click', navigate);
    });
  }

  function renderArticle(t, skeleton = false) {
    const sourceLecture = getFrom();
    const idx = topics.indexOf(t);
    const relevant = sourceLecture ? sourceLecture.modules.map(m => m[0]).concat(sourceLecture.supplements || []).filter((v,i,a) => a.indexOf(v)===i) : topics.map(t => t.slug);
    const rIdx = relevant.indexOf(t.slug);
    const prev = bySlug.get(relevant[rIdx - 1]) || (!sourceLecture ? topics[idx - 1] : null);
    const next = bySlug.get(relevant[rIdx + 1]) || (!sourceLecture ? topics[idx + 1] : null);
    const scope = sourceLecture?.modules.find(m => m[0] === t.slug);
    const parent = sourceLecture ? {href: lectureUrl(sourceLecture.slug), label: sourceLecture.name} : {href: baseUrl, label: 'All CVS topics'};
    const toc = t.sections.map(s => `<a href="#${esc(s.id)}" data-scroll="${esc(s.id)}">${esc(s.title)}</a>`).join('');
    const html = skeleton ? '' : chapterHtml(t.slug);
    const minutes = Math.max(3, Math.round(html.replace(/<[^>]+>/g, ' ').split(/\s+/).length / 200));
    const questions = (html.match(/class="mcq-answer"/g) || []).length;
    const meta = [`${t.sections.length} sections`, html ? `about ${minutes} min` : '', questions ? `${questions} questions` : ''].filter(Boolean).join(' · ');
    const groupName = {Heart: 'The heart', Vessels: 'Blood vessels', Control: 'Cardiovascular control', Regional: 'Regional circulation'}[t.group] || t.group;
    main.innerHTML = `<nav class="breadcrumb" aria-label="You are here"><span class="crumb crumb-root"><a href="#/">Home</a> / <a href="${baseUrl}">Cardiovascular System</a> / </span><span class="crumb crumb-parent"><a href="${parent.href}">${esc(parent.label)}</a></span></nav>` +
      `<div class="article-layout"><article class="article-sheet${skeleton ? ' is-skeleton' : ''}"${skeleton ? ' aria-busy="true"' : ''}>` +
      `<p class="article-kicker">${esc(groupName)} · Chapter ${idx + 1} of ${topics.length}</p><h1>${esc(t.title)}</h1>` +
      `<div class="article-summary"><span class="article-meta">${meta}</span>${skeleton ? '<span class="reader-toolbar-space" aria-hidden="true"></span>' : ''}${sourceLecture ? `<span class="article-source">From ${esc(sourceLecture.file)}${scope ? `, slides ${esc(scope[1])}` : ''}</span>` : ''}</div>` +
      `<div class="mobile-sections"><label for="sections-select" class="group-label">Jump to a section</label><select id="sections-select"><option value="">Select section…</option>${t.sections.map(s => `<option value="${esc(s.id)}">${esc(s.title)}</option>`).join('')}</select></div>` +
      `<div class="article-text">${window.DOM_DIAGRAMS?.[t.slug] || ''}${skeleton ? '<p class="skeleton-note" role="status">Loading this breakdown…</p><div class="skeleton-lines" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>' : html}</div>` +
      `<footer class="article-end">${next ? `<a class="next-card" href="${topicUrl(next.slug, sourceLecture?.slug)}"><span class="next-label">Next breakdown</span><span class="next-title">${esc(next.title)}</span></a>` : `<a class="next-card" href="${baseUrl}"><span class="next-label">You’ve reached the last breakdown</span><span class="next-title">Back to all CVS topics</span></a>`}` +
      `<div class="end-actions"><button id="mark-read" class="btn">${completed.has(t.slug) ? '✓ Reviewed' : 'Mark as reviewed'}</button>${sourceLecture ? `<a class="btn" href="${lectureUrl(sourceLecture.slug)}">Back to the lecture outline</a>` : ''}</div></footer></article>` +
      `<aside class="toc"><h2>In this breakdown</h2>${toc}<div class="nav-bottom">${prev ? `<a href="${topicUrl(prev.slug, sourceLecture?.slug)}">← ${esc(prev.title)}</a>` : ''}${next ? `<a href="${topicUrl(next.slug, sourceLecture?.slug)}">${esc(next.title)} →</a>` : ''}</div></aside></div>`;
    if (skeleton) return;
    document.getElementById('mark-read').addEventListener('click', () => {
      if (completed.has(t.slug)) completed.delete(t.slug); else completed.add(t.slug);
      writeStore('dom-completed', JSON.stringify([...completed]));
      document.getElementById('mark-read').textContent = completed.has(t.slug) ? '✓ Reviewed' : 'Mark as reviewed';
    });
    document.querySelectorAll('[data-scroll]').forEach(a => a.addEventListener('click', e => {e.preventDefault();document.getElementById(a.dataset.scroll)?.scrollIntoView({behavior:'smooth'});}));
    document.getElementById('sections-select')?.addEventListener('change', e => document.getElementById(e.target.value)?.scrollIntoView({behavior:'smooth'}));
  }

  function platformHome() {
    document.title = 'DOMiNANCE Breakdowns | Understand More';
    main.innerHTML = `<section class="platform-hero"><span class="platform-kicker">DOMiNANCE BREAKDOWNS</span><h1>Complex concepts.<br><em>Clear explanations.</em></h1><p>Understand what happens, why it happens and how it works, one concept at a time.</p><a href="${baseUrl}" class="btn btn-primary">Explore Cardiovascular Physiology →</a></section><section class="platform-library" aria-labelledby="platform-heading"><div class="section-heading"><div><h2 id="platform-heading">Explore by subject</h2></div></div><h3 class="platform-subheading">Physiology</h3><div class="platform-grid"><a class="platform-system platform-available" href="${baseUrl}"><span class="platform-symbol" aria-hidden="true">♥</span><span class="platform-state">Available now</span><h4>Cardiovascular Physiology</h4><p>${topics.length} explanatory breakdowns organised around six lecture documents.</p><span class="platform-open">Open breakdowns →</span></a><div class="platform-system platform-upcoming"><span class="platform-symbol" aria-hidden="true">◌</span><span class="platform-state">Coming later</span><h4>More systems</h4><p>Respiratory, renal and neurophysiology will be added when their breakdowns are ready.</p></div></div></div></section>`;
  }

  function navigate() {
    const path = (location.hash || '').replace(/^#\/?/, '').split('?')[0].split('/').filter(Boolean);
    const section = new URLSearchParams((location.hash || '').split('?')[1] || '').get('section');
    const done = () => {
      markRendered();
      window.dispatchEvent(new CustomEvent('dom:rendered'));
      updateProgress();
      if (section) setTimeout(() => goToSection(section), 0);
    };
    window.scrollTo({top:0, behavior:'instant'});
    if (bySlug.has(path[2]) && path[2] !== 'lecture') { article(bySlug.get(path[2]), done); return; }
    ++routeToken;
    if (path[2] === 'lecture' && byLecture.has(path[3])) lecturePage(byLecture.get(path[3]));
    else if (path[0] === 'physiology' && path[1] === 'cvs') cvsHome();
    else platformHome();
    done();
  }
  // Deep links: #/physiology/cvs/<slug>?section=<heading-id> opens a chapter at that section.
  function goToSection(id) {
    const target = document.getElementById(id);
    if (!target || !main.contains(target)) return;
    window.dispatchEvent(new CustomEvent('dom:section', {detail: id}));
    target.scrollIntoView({behavior: 'instant', block: 'start'});
    updateProgress();
  }
  // A link to a section of the chapter already open scrolls in place instead of re-rendering it.
  document.addEventListener('click', e => {
    const link = e.target.closest?.('a[href^="#/physiology/cvs/"]');
    if (!link || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const [path, query] = link.getAttribute('href').slice(1).split('?');
    const section = new URLSearchParams(query || '').get('section');
    const current = (location.hash || '').replace(/^#/, '').split('?')[0];
    if (!section || path !== current || !document.getElementById(section)) return;
    e.preventDefault();
    try { history.replaceState(null, '', link.getAttribute('href')); } catch {}
    goToSection(section);
  });
  // Reading progress bar: one update per frame, page height measured only when it can change.
  const bar = document.getElementById('scroll-progress');
  let maxScroll = 0, framePending = false;
  const measure = () => { maxScroll = document.documentElement.scrollHeight - window.innerHeight; };
  const paint = () => { framePending = false; bar.style.transform = `scaleX(${maxScroll > 0 ? Math.min(1, window.scrollY / maxScroll) : 0})`; };
  function updateProgress() { measure(); paint(); }
  const onScroll = () => { if (!framePending) { framePending = true; requestAnimationFrame(paint); } };
  window.addEventListener('hashchange', navigate);
  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', updateProgress, {passive:true});
  if (window.ResizeObserver) new ResizeObserver(measure).observe(main);
  document.documentElement.setAttribute('data-theme', readStore('dom-theme') === 'dark' ? 'dark' : 'light');
  document.getElementById('theme-toggle').addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    writeStore('dom-theme', next);
  });
  navigate();
})();
