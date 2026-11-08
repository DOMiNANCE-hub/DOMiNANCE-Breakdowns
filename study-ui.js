/* Lazy-loaded setup screens: loaded only for LAMLA or question-only practice. */
window.DOMStudyUI = function(ctx) {
  const {main,lectures,bundle,baseUrl,topics,esc,docName,testFor,testBest,testUrl,bySlug,ensureChapter,loadScript,navigate} = ctx;
function lamlaPicker() {
    document.title = 'LAMLA | DOMiNANCE Breakdowns';
    const ready=lectures.filter(l=>!l.duplicateOf && (bundle.lamla||{})[l.slug]);
    main.innerHTML=`<div class="lt-wrap"><nav class="breadcrumb"><a href="#/">Home</a> / <a href="${baseUrl}">CVS</a></nav>
      <section class="lt-intro lamla-intro"><p class="lt-kicker">LAMLA · Your smart study route</p><h1>Learn faster. Revise smarter.</h1>
      <p class="lt-lede">Choose how you want to study. LAMLA will guide you through our high-yield explanations and reviewed lecture questions.</p>
      <fieldset class="lm-setup"><legend>What's your goal?</legend>
        <label class="lt-choice"><input type="radio" name="goal" value="learn" checked><span><strong>Learn quickly</strong><small>Cover key concepts, then apply them in questions.</small></span></label>
        <label class="lt-choice"><input type="radio" name="goal" value="revise"><span><strong>Revise & strengthen</strong><small>Test what you remember, then repair weak concepts.</small></span></label>
      </fieldset>
      <div class="lm-time-form"><label for="lm-time">How much study time do you have?</label>
        <select id="lm-time"><option value="30">30 minutes</option><option value="60">1 hour</option><option value="120" selected>2 hours</option><option value="180">3 hours</option><option value="day1">1 day</option><option value="day3">3 days</option></select>
        <label class="lm-hours-label" for="lm-hours" hidden>Study hours per day <input id="lm-hours" type="number" min="1" max="8" value="3" inputmode="numeric"/></label>
      </div>
      <h2 class="lamla-pick">What would you like to cover?</h2>
      <div class="lamla-lectures"><button type="button" class="lamla-lecture lm-whole" data-lecture="all"><span class="lamla-num">★</span><span><strong>The whole cardiovascular system</strong><small>All ${topics.length} chapters, when time allows</small></span><span aria-hidden="true">→</span></button>
        ${ready.map(l=>`<button type="button" class="lamla-lecture" data-lecture="${l.slug}"><span class="lamla-num">${l.index}</span><span><strong>${esc(l.name)}</strong><small>${esc(docName(l.file))}</small></span><span aria-hidden="true">→</span></button>`).join('')}</div>
      <p class="lm-fine">Short plans prioritise topics; they do not guarantee that every chapter or question will fit.</p></section></div>`;
    const time=main.querySelector('#lm-time'),hoursLabel=main.querySelector('.lm-hours-label');
    time.addEventListener('change',()=>{hoursLabel.hidden=!time.value.startsWith('day')});
    main.querySelectorAll('[data-lecture]').forEach(b=>b.addEventListener('click',()=>{
      const goal=main.querySelector('input[name="goal"]:checked')?.value||'learn';
      const days=time.value==='day1'?1:time.value==='day3'?3:0;
      const hours=Math.max(1,Math.min(8,Number(main.querySelector('#lm-hours').value)||3));
      const minutes=days?days*hours*60:Number(time.value)||120;
      location.hash='#/lamla/'+b.dataset.lecture+'?t='+minutes+'&g='+goal+(days?'&d='+days:'');
    }));
  }
  function lamlaSession(l,minutes,goal,days,done,alive) {
    const whole=l.slug==='all',ready=lectures.filter(x=>!x.duplicateOf&&(bundle.lamla||{})[x.slug]);
    const picked=whole?ready:[l],modules=picked.map(x=>bundle.lamla[x.slug]).filter(Boolean);
    document.title='LAMLA: '+l.name+' | DOMiNANCE Breakdowns';
    main.innerHTML='<div class="lt-wrap"><p class="skeleton-note" role="status">Preparing your learning route…</p></div>';
    const chapters=[...new Set(modules.flatMap(x=>x.chapters))].map(slug=>bySlug.get(slug)).filter(Boolean);
    const questionFiles=picked.map(x=>testFor(x)?.file).filter(Boolean);
    Promise.all([loadScript(bundle.lamlaApp),...modules.map(x=>loadScript(x.file)),...questionFiles.map(loadScript),...chapters.map(ensureChapter)]).then(()=>{
      if(!alive())return;
      const sheets=picked.map(x=>window.DOM_LAMLA[x.slug]).filter(Boolean);
      const merged={chapters:sheets.flatMap(s=>s.chapters).filter((c,i,a)=>a.findIndex(x=>x.slug===c.slug)===i)};
      const questions=picked.flatMap(x=>window.DOM_TESTS?.[testFor(x)?.slug]?.questions||[]);
      const testList=picked.map(x=>{const t=testFor(x);return t?{name:x.name,count:t.count,url:testUrl(t.slug)}:null}).filter(Boolean);
      const t=whole?null:testFor(l);
      window.DOMLamla.mount(main,{lecture:l,sheet:merged,minutes,goal,days,topics,questions,tests:whole?testList:[],
        chapterUrl:(slug,sec)=>'#/physiology/cvs/'+slug+(sec?'?section='+encodeURIComponent(sec):''),
        testUrl:t?testUrl(t.slug):'',homeUrl:'#/lamla'});
      done();
    },()=>{
      if(!alive())return;
      main.innerHTML='<div class="load-error" role="alert"><h1>LAMLA</h1><p>Could not load the learning materials. Check your connection and try again.</p><button type="button" class="btn btn-primary" id="lm-retry">Try again</button></div>';
      main.querySelector('#lm-retry').addEventListener('click',navigate);done();
    });
  }
  function practiceHome() {
    document.title='Practice questions | DOMiNANCE Breakdowns';
    const ready=lectures.filter(l=>!l.duplicateOf&&testFor(l));
    main.innerHTML=`<div class="lt-wrap"><nav class="breadcrumb"><a href="#/">Home</a> / <a href="${baseUrl}">CVS</a></nav>
    <section class="lt-intro"><p class="lt-kicker">DOMiNANCE Practice</p><h1>Questions first.</h1>
    <p class="lt-lede">Go straight into a lecture test. Choose quick practice or all questions, with immediate explanations or exam-style marking.</p>
    <div class="lamla-lectures">${ready.map(l=>{const t=testFor(l),best=testBest(t.slug);return `<a class="lamla-lecture" href="${testUrl(t.slug)}"><span class="lamla-num">${l.index}</span><span><strong>${esc(l.name)}</strong><small>${t.count} questions${best!=null?' · best '+best+'%':''}</small></span><span aria-hidden="true">→</span></a>`}).join('')}</div>
    <p class="lm-fine">Practice tests use the lecture question bank. Mixed whole-CVS practice remains available through LAMLA.</p></section></div>`;
  }
  return {lamlaPicker,lamlaSession,practiceHome};
};
