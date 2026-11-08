(() => {
'use strict';
const esc = s => String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const read = k => {try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}};
const write = (k,v) => {try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
const fmt = n => n < 60 ? n+' min' : Math.floor(n/60)+'h'+(n%60?' '+n%60+'m':'');
let cleanup=()=>{};
function mount(root,{lecture,sheet,minutes,goal,days=0,topics,chapterUrl,testUrl,tests=[],questions=[],homeUrl}) {
 cleanup();
 const mode=goal==='revise'?'revise':'learn',budget=Math.min(10080,Math.max(15,minutes||60));
 const title=slug=>topics.find(t=>t.slug===slug)?.title||slug;
 const all=sheet.chapters.map(c=>({...c,title:title(c.slug),qs:questions.filter(q=>q.chapter===c.slug)}));
 const names=new Map(all.map(c=>[c.slug,c]));
 if(!all.length){root.innerHTML='<p class="load-error">No chapters available for this route.</p>';return}
 const limit=Math.min(all.length,Math.max(1,Math.floor((budget-Math.min(20,budget*.14))/(mode==='learn'?9:6))));
 const importance=c=>c.must.filter(m=>m.star).length*2+Math.min(12,c.qs.length);
 const initial=[...all].sort((a,b)=>importance(b)-importance(a)).slice(0,limit).sort((a,b)=>all.indexOf(a)-all.indexOf(b)).map(c=>c.slug);
 const allocate=order=>{const weights=order.map(s=>2+Math.sqrt(names.get(s).qs.length||1)+names.get(s).must.filter(m=>m.star).length/5),sum=weights.reduce((a,b)=>a+b,0)||1;
   return Object.fromEntries(order.map((s,i)=>[s,Math.max(2,Math.round((budget*.83)*weights[i]/sum))]));};
 const key='dom-lamla-v2-'+lecture.slug+'-'+mode;
 let st=read(key);
 if(!st||st.v!==2||st.minutes!==budget||st.done||!Array.isArray(st.order)||st.order.some(s=>!names.has(s)))
   st={v:2,minutes:budget,mode,days,step:'plan',started:false,done:false,order:initial,ci:0,qi:0,answers:{},picks:{},mixed:[],wrong:[],spent:0,ai:'pending'};
 if(!st.alloc)st.alloc=allocate(st.order);
 const save=()=>write(key,st);
 let attempts=0;
 const elapsed=()=>Math.floor(st.spent/60)+':'+String(st.spent%60).padStart(2,'0');
 const tick=setInterval(()=>{
   if(!location.hash.startsWith('#/lamla/'))return cleanup();
   if(!st.started||st.done||document.visibilityState!=='visible')return;
   st.spent++;if(++attempts%10===0)save();
   const e=root.querySelector('.lm-clock');if(e)e.textContent=elapsed();
 },1000);
 cleanup=()=>{clearInterval(tick);save()};
 const scroll=()=>window.scrollTo({top:0,behavior:'instant'});
 const focus=s=>root.querySelector(s)?.focus({preventScroll:true});
 function frame(html) {
   const progress=st.step==='plan'?0:st.step==='finish'?100:st.step==='mixed'?92:Math.round(85*st.ci/st.order.length);
   root.innerHTML=`<div class="lm-wrap lm-v2"><header class="lm-top"><a class="lm-exit-link" href="${homeUrl}">Save & exit</a><div class="lt-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}" aria-label="Session progress"><span style="transform:scaleX(${progress/100})"></span></div><span class="lm-clock" aria-label="Active study time">${elapsed()}</span></header><p class="lm-where"><span class="lm-badge">LAMLA</span> ${esc(lecture.name)} · ${mode==='learn'?'Learn quickly':'Revise & strengthen'} · ${days?days+' day(s)':fmt(budget)}</p>${html}</div>`;
   root.querySelector('.lm-exit-link').addEventListener('click',save);
 }
 const picker=slug=>{
   if(st.picks[slug])return st.picks[slug].map(id=>questions.find(q=>q.id===id)).filter(Boolean);
   const c=names.get(slug),groups={};
   for(const q of c.qs)(groups[q.section] ||= []).push(q);
   const lists=Object.values(groups),out=[],n=Math.min(c.qs.length,Math.max(2,Math.min(7,Math.round((st.alloc[slug]||9)/(mode==='learn'?3:2.4)))));
   while(out.length<n&&lists.some(g=>g.length))for(const g of lists){if(out.length>=n)break;if(g.length)out.push(g.shift())}
   st.picks[slug]=out.map(q=>q.id);save();return out;
 };
 let aiSent=false;
 async function requestAI(){
   try {
     const body={goal:mode,minutes:budget,limit,chapters:all.map(c=>({slug:c.slug,title:c.title,highYield:c.must.filter(m=>m.star).length,questions:c.qs.length}))};
     const res=await fetch('/api/lamla-plan',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
     if(!res.ok)throw Error('Unavailable');
     const data=await res.json(),out=(Array.isArray(data.order)?data.order:[]).filter((s,i,a)=>names.has(s)&&a.indexOf(s)===i).slice(0,limit);
     if(out.length!==limit||st.started||st.step!=='plan')throw Error('Unsafe plan');
     st.order=out;st.alloc=allocate(out);st.ai='ready';save();plan();
   }catch {
     if(!st.started&&st.step==='plan'){st.ai='unavailable';save();const e=root.querySelector('.lm-ai-status');if(e)e.textContent='Using our built-in planner (AI not connected or quota reached).'}
   }
 }
 function plan(){
   let mins=0;
   const rows=st.order.map((slug,i)=>{
     const t=st.alloc[slug],day=days?Math.min(days,Math.floor(mins/(budget/days))+1):0;mins+=t;
     return `<li><span class="lm-route-index">${i+1}</span><span class="lm-route-name">${esc(title(slug))}${day?`<small>Day ${day}</small>`:''}</span><strong>${fmt(t)}</strong></li>`
   }).join('');
   const omitted=all.length-st.order.length;
   frame(`<section class="lm-finish lm-plan" aria-labelledby="lm-h"><p class="lt-kicker">Your LAMLA route</p><h1 id="lm-h" tabindex="-1">${mode==='learn'?'Learn efficiently. Practise as you go.':'Test what you recall. Repair what you miss.'}</h1>
   <p>${mode==='learn'?'Essential concepts first, followed by real lecture-test questions.':'Questions first; corrective explanations only when you need them.'} Both paths finish with mixed practice.</p>
   <div class="lm-plan-stats"><span><strong>${st.order.length}/${all.length}</strong> chapters</span><span><strong>${questions.length}</strong> available questions</span><span><strong>${fmt(budget)}</strong> budget</span></div>
   <p class="lm-notice">${omitted?`Your time allows a priority route through ${st.order.length} chapters; ${omitted} are not included yet. You can study them separately or extend your plan.`:'All chapters are included; not every question can fit inside this session.'}</p>
   <p class="lm-ai-status" role="status">${st.ai==='ready'?'AI-assisted route based on our approved chapter outline.':st.ai==='unavailable'?'Using our built-in planner (AI not connected or quota reached).':'Preparing your study route…'}</p>
   <ol class="lm-route">${rows}</ol>
   <div class="lt-actions"><button type="button" class="btn btn-primary lm-start">Start my route</button><a href="${homeUrl}" class="btn">Change selection</a></div>
   <p class="lm-fine">Time allocations are approximate. Coverage and scores do not guarantee an exam result.</p></section>`);
   root.querySelector('.lm-start').addEventListener('click',()=>{st.started=true;st.step=mode==='learn'?'learn':'practice';save();render();scroll()});
   focus('#lm-h');
   if(!aiSent&&st.ai!=='ready'){aiSent=true;requestAI()}
 }
 function learn(){
   const c=names.get(st.order[st.ci]);if(!c)return startMixed();
   const items=[...c.must.filter(m=>m.star),...c.must.filter(m=>!m.star)];
   const cap=Math.min(14,Math.max(3,Math.round((st.alloc[c.slug]||10)*.75))),shown=items.slice(0,cap),extra=items.slice(cap);
   frame(`<section class="lm-learn" aria-labelledby="lm-h"><p class="lt-qmeta">Chapter ${st.ci+1} of ${st.order.length} · ${fmt(st.alloc[c.slug])} planned</p>
   <h1 id="lm-h" tabindex="-1">${esc(c.title)}</h1>
   <p>${mode==='revise'?'Review the points behind your missed questions.':'Understand these high-yield points, then apply them in questions.'}</p>
   <h2 class="lm-must-title">Must know</h2><ul class="lm-must">${shown.map(m=>`<li class="${m.star?'is-star':''}">${m.star?'<span class="lm-star">★</span>':''}<span>${m.html}</span></li>`).join('')}</ul>
   ${extra.length?`<details class="lm-more"><summary>Show ${extra.length} more points</summary><ul class="lm-must">${extra.map(m=>`<li><span>${m.html}</span></li>`).join('')}</ul></details>`:''}
   ${c.chains?`<details class="lm-more"><summary>Mechanism chains</summary><div class="lm-part">${c.chains}</div></details>`:''}
   ${c.traps?`<details class="lm-more"><summary>Common exam traps</summary><div class="lm-part">${c.traps}</div></details>`:''}
   <p class="lm-full"><a href="${chapterUrl(c.slug)}" target="_blank" rel="noopener">Open full breakdown</a></p>
   <div class="lt-actions"><button class="btn btn-primary lm-next" type="button">${mode==='revise'?'Next chapter':picker(c.slug).length?'Practise what I learnt':'Next chapter'} →</button></div></section>`);
   root.querySelector('.lm-next').addEventListener('click',()=>{if(mode==='revise')nextChapter();else{st.step='practice';st.qi=0;save();render();scroll()}});
   focus('#lm-h');
 }
 function practice(){
   const mixed=st.step==='mixed',c=mixed?null:names.get(st.order[st.ci]),qs=mixed?st.mixed.map(id=>questions.find(q=>q.id===id)).filter(Boolean):picker(c.slug);
   if(!qs.length)return mixed?finish():nextChapter();
   const q=qs[st.qi],chosen=st.answers[q.id];
   frame(`<section class="lt-running"><div class="lt-question"><p class="lt-qmeta">${mixed?'Mixed practice':esc(c.title)} · Question ${st.qi+1} of ${qs.length}</p>
   <h1 id="lm-h" class="lt-stem" tabindex="-1">${esc(q.stem)}</h1>
   <div class="lt-options" role="group" aria-labelledby="lm-h">${Object.entries(q.options).filter(([k])=>/^[A-D]$/.test(k)).map(([k,v])=>`<button type="button" class="lt-option${chosen?(k===q.answer?' is-correct':k===chosen?' is-wrong':' is-other'):''}" data-key="${k}" ${chosen?'disabled':''}><span class="lt-letter">${k}</span><span class="lt-text">${esc(v)}</span></button>`).join('')}</div>
   ${chosen?`<div class="lt-feedback"><div class="lt-verdict ${chosen===q.answer?'is-right':'is-wrong'}"><strong>${chosen===q.answer?'Correct.':'Not quite.'}</strong> ${esc(q.why)}</div></div>`:''}</div>
   <div class="lt-nav"><button class="btn lm-skip" type="button">${chosen?'Skip ahead':'Skip question'}</button><button class="btn btn-primary lm-next" type="button" ${!chosen?'disabled':''}>${st.qi<qs.length-1?'Next question':mixed?'See results': 'Finish chapter'} →</button></div></section>`);
   root.querySelectorAll('.lt-option').forEach(b=>b.addEventListener('click',()=>{
     if(st.answers[q.id])return;
     st.answers[q.id]=b.dataset.key;
     if(b.dataset.key!==q.answer)st.wrong.push({id:q.id,chapter:q.chapter,section:q.section,stem:q.stem,why:q.why,answer:q.options[q.answer]});
     window.dispatchEvent(new CustomEvent('dom:answer',{detail:{q:q.id,o:b.dataset.key,ok:b.dataset.key===q.answer?1:0}}));
     save();practice()
   }));
   function advance(){
     if(st.qi<qs.length-1){st.qi++;save();practice();scroll();return}
     if(mixed){st.step='finish';st.done=true;save();finish();scroll();return}
     if(mode==='revise'&&qs.some(q=>st.answers[q.id]!==q.answer)){st.step='learn';st.qi=0;save();learn();scroll();return}
     nextChapter();
   }
   root.querySelector('.lm-skip').addEventListener('click',advance);
   root.querySelector('.lm-next').addEventListener('click',advance);
   focus(chosen?'.lm-next':'#lm-h');
 }
 function nextChapter(){st.ci++;st.qi=0;st.step=mode==='learn'?'learn':'practice';save();if(st.ci>=st.order.length)startMixed();else{render();scroll()}}
 function startMixed(){
   if(!st.mixed.length){
     const unused=questions.filter(q=>!Object.hasOwn(st.answers,q.id)&&st.order.includes(q.chapter)),groups={};
     for(const q of unused)(groups[q.chapter] ||= []).push(q);
     const lists=Object.values(groups),n=Math.min(unused.length,Math.min(15,Math.max(3,Math.round(budget/13)))),picked=[];
     while(picked.length<n&&lists.some(g=>g.length))for(const g of lists){if(picked.length>=n)break;if(g.length)picked.push(g.shift())}
     st.mixed=picked.map(q=>q.id)
   }
   st.step=st.mixed.length?'mixed':'finish';st.qi=0;if(!st.mixed.length)st.done=true;save();render();scroll();
 }
 function finish(){
   const answered=Object.keys(st.answers).length,correct=Object.entries(st.answers).filter(([id,k])=>questions.find(q=>q.id===id)?.answer===k).length;
   frame(`<section class="lm-finish" aria-labelledby="lm-h"><p class="lt-kicker">Session completed</p><h1 id="lm-h" tabindex="-1">Your revision review</h1>
   <div class="lm-plan-stats"><span><strong>${st.order.length}/${all.length}</strong> chapters</span><span><strong>${answered}</strong> questions tried</span><span><strong>${correct}/${answered}</strong> correct</span></div>
   <p>${st.wrong.length?'Correct these misunderstandings before your next assessment.':'Well done. Keep testing yourself with mixed lecture questions.'}</p>
   ${st.wrong.length?`<h2>Review these concepts</h2>${st.wrong.slice(0,18).map(w=>`<article class="lt-item is-wrong"><p class="lt-item-head">${esc(title(w.chapter))}</p><p class="lt-item-stem">${esc(w.stem)}</p><p><strong>Correct:</strong> ${esc(w.answer)}</p><p>${esc(w.why)}</p><a class="lt-revise" href="${chapterUrl(w.chapter,w.section)}">Review this concept</a></article>`).join('')}`:''}
   <h2>More question practice</h2>${testUrl?`<a class="test-card" href="${testUrl}"><span class="test-card-text"><strong>Open the full lecture test</strong><span>Answer every question, with practice or exam marking.</span></span><span class="test-card-go">→</span></a>`:''}
   ${tests.map(t=>`<a class="lm-test-link" href="${t.url}">${esc(t.name)} · ${t.count} questions →</a>`).join('')}
   <div class="lt-actions"><button class="btn lm-again">Start another session</button><a class="btn" href="${homeUrl}">Change my route</a></div>
   <p class="lm-fine">This score reflects attempted questions, not a prediction of exam performance.</p></section>`);
   root.querySelector('.lm-again').addEventListener('click',()=>{
     st={...st,step:'plan',started:false,done:false,ci:0,qi:0,answers:{},picks:{},mixed:[],wrong:[],spent:0,ai:'pending'};
     aiSent=false;save();plan();scroll()
   });focus('#lm-h');
 }
 function render(){if(st.step==='plan')plan();else if(st.step==='learn')learn();else if(st.step==='practice'||st.step==='mixed')practice();else finish()}
 if(st.started&&st.step!=='plan'){
   frame(`<section class="lm-learn"><h1>Your session is saved</h1><p>Resume your learning and questions where you stopped.</p><button class="btn btn-primary lm-resume">Continue session</button></section>`);
   root.querySelector('.lm-resume').addEventListener('click',()=>{render();scroll()});
 }else render();
 save();
}
window.DOMLamla={mount};
})();
