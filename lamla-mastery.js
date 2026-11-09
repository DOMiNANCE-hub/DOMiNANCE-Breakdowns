/* LAMLA mastery and adaptive retrieval.
 * Reviewed questions and answers are the source of truth; no AI is required.
 * Saved learning estimates remain local to this browser, not a clinical/grade prediction. */
(()=> {
'use strict';
const KEY='dom-lamla-mastery-v1',DAY=86400000;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fresh=()=>({version:1,objectives:{},questionHistory:{}});
let data=(()=>{try{const x=JSON.parse(localStorage.getItem(KEY)||'null');return x?.version===1&&x.objectives&&x.questionHistory?x:fresh()}catch{return fresh()}})();
const persist=()=>{try{localStorage.setItem(KEY,JSON.stringify(data))}catch{}};
const ref=q=>q?.chapter&&q?.section?q.chapter+':'+q.section:null;
const now=()=>Date.now();
const mastery=o=>{
 if(!o||!o.attempts)return 'unseen';
 const recent=o.recent||[],accuracy=recent.reduce((a,b)=>a+b,0)/Math.max(1,recent.length);
 if(o.coachGap)return 'needs review';
 if(o.streak>=3&&accuracy>=.8)return 'strengthening';
 if(o.streak>=2&&accuracy>=.65)return 'developing';
 return 'needs review';
};
function addAnswer(q,choice,source='session') {
 const key=ref(q);
 if(!key||!q.id||!/[A-D]/.test(choice))return;
 const o=data.objectives[key]||{chapter:q.chapter,section:q.section,attempts:0,correct:0,recent:[],streak:0,last:0,due:0,lastQuestion:null};
 const isCorrect=choice===q.answer;
 o.attempts++;o.correct+=Number(isCorrect);o.recent=[...(o.recent||[]),Number(isCorrect)].slice(-6);
 o.streak=isCorrect?(o.streak||0)+1:0;
 if(o.coachGap&&o.streak>=2)o.coachGap=false;
 o.last=now();o.lastQuestion=q.id;
 const status=mastery(o);
 o.due=now()+(status==='strengthening'?7*DAY:status==='developing'?2*DAY:isCorrect?1*DAY:0);
 data.objectives[key]=o;
 const h=data.questionHistory[q.id]||{attempts:0,correct:0};
 h.attempts++;h.correct+=Number(isCorrect);h.last=o.last;h.lastChoice=choice;
 data.questionHistory[q.id]=h;
 persist();
 window.dispatchEvent(new CustomEvent('lamla:mastery-changed',{detail:{chapter:q.chapter,section:q.section,status,source}}));
}
window.addEventListener('lamla:coach-quality',e=>{
 const detail=e?.detail||{},key=detail.chapter+':'+detail.section;
 const o=data.objectives[key];
 if(!o||!['sound','partial','incorrect'].includes(detail.quality))return;
 o.coachQuality=detail.quality;o.coachLast=now();
 if(detail.quality==='partial'||detail.quality==='incorrect'){
   o.coachGap=true;o.due=now();
 }else if(o.correct===o.attempts&&o.streak>=2)o.coachGap=false;
 persist();
 window.dispatchEvent(new CustomEvent('lamla:mastery-changed',{detail:{chapter:o.chapter,section:o.section,source:'coach'}}));
});
window.addEventListener('dom:answer',e=>{
 const id=e?.detail?.q,choice=e?.detail?.o;
 if(!id||!choice)return;
 const q=Object.values(window.DOM_TESTS||{}).flatMap(x=>x?.questions||[]).find(x=>x.id===id);
 if(q)addAnswer(q,choice);
});

const topics=()=>window.DOMINANCE_TOPICS||[];
const sectionTitle=o=>{
 const topic=topics().find(t=>t.slug===o.chapter);
 const section=topic?.sections?.find(s=>s.id===o.section);
 return {chapter:topic?.title||o.chapter,section:section?.title||o.section};
};
const all=()=>Object.values(data.objectives);
const counts=()=>{
 const xs=all();
 return {tracked:xs.length,strong:xs.filter(o=>mastery(o)==='strengthening').length,
   growing:xs.filter(o=>mastery(o)==='developing').length,
   due:xs.filter(o=>o.due<=now()||mastery(o)==='needs review').length};
};
const weak=()=>all().filter(o=>mastery(o)!=='strengthening'||o.due<=now()).sort((a,b)=>{
 const score=o=> (mastery(o)==='needs review'?6:mastery(o)==='developing'?3:0)
   +(o.due<=now()?3:0)+(o.coachGap?5:0)+Math.min(5,(o.attempts-o.correct)*2);
 return score(b)-score(a)||a.due-b.due;
});
const css=document.createElement('style');
css.textContent='.lm-mastery{margin:1.1rem 0;padding:1rem;border:1px solid var(--border,#d4dce8);border-radius:15px;background:var(--surface,#fff)}'
 +'.lm-mastery h2{font-size:1.15rem;margin:0 0 .5rem}.lm-mastery h3{font-size:1rem;margin:.7rem 0}.lm-mastery p{margin:.5rem 0}'
 +'.lm-mastery-stats{display:flex;gap:.7rem;flex-wrap:wrap;margin:.8rem 0}.lm-mastery-stats span{padding:.5rem .7rem;background:rgba(75,112,160,.1);border-radius:9px}'
 +'.lm-mastery-list{padding-left:1.25rem}.lm-mastery-list li{margin:.5rem 0}.lm-mastery-list small{display:block;opacity:.78}'
 +'.lm-mastery button{margin:.5rem .5rem .3rem 0}.lm-mastery .lm-note{font-size:.82rem;opacity:.78}'
 +'.lm-drill-option{display:block;width:100%;padding:.75rem;text-align:left;border:1px solid #8190a6;border-radius:9px;margin:.5rem 0;background:transparent;color:inherit;font:inherit;cursor:pointer}'
 +'.lm-drill-option:disabled{opacity:.7;cursor:default}.lm-drill-answer{margin:.9rem 0;padding:.8rem;border:1px solid #94abc5;border-radius:9px}.lm-drill-answer p{margin:.5rem 0}';
document.head.appendChild(css);

let loading=null,drill=null;
const button=(text,cls='btn')=>'<button type="button" class="'+cls+'">'+esc(text)+'</button>';
async function bank(){
 if(loading)return loading;
 loading=(async()=>{
  const bundle=window.DOM_BUNDLE||{},files=Object.values(bundle.tests||{}).map(x=>x.file).filter(Boolean);
  if(!files.length)return [];
  const loaded=new Set();
  for(const f of files) {
   if(loaded.has(f))continue;loaded.add(f);
   if(Object.values(window.DOM_TESTS||{}).some(t=>t?.questions?.length&&bundle.tests[t.lecture]?.file===f))continue;
   await new Promise((resolve,reject)=>{
    const s=document.createElement('script');s.src=f;
    s.onload=resolve;s.onerror=()=>reject(new Error('Question bank could not load'));
    document.head.appendChild(s);
   });
  }
  return Object.values(window.DOM_TESTS||{}).flatMap(t=>t?.questions||[]);
 })().catch(error=>{loading=null;throw error});
 return loading;
}
function pick(qs,n=6){
 const seen=new Set(),picked=[],history=data.questionHistory;
 const sorted=[...qs].sort((a,b)=>{
  const oa=data.objectives[ref(a)],ob=data.objectives[ref(b)];
  const priority=q=>{
   const o=data.objectives[ref(q)];
   const h=history[q.id];
   if(!o)return 1;
   const m=mastery(o);
   return (m==='needs review'?10:m==='developing'?6:2)+(o.due<=now()?5:0)+(o.coachGap?5:0)
    +Math.min(5,(o.attempts-o.correct)*2) + (!h?4:h.last===o.last?-2:0);
  };
  return priority(b)-priority(a)||Number(!!history[a.id])-Number(!!history[b.id]);
 });
 let pool=[...sorted];
 // Prioritize weak objectives while still rotating across chapters.
 while(picked.length<n && pool.length){
  let at=pool.findIndex(q=>!seen.has(q.chapter)&&(!history[q.id]||history[q.id].attempts===0));
  if(at<0)at=pool.findIndex(q=>!seen.has(q.chapter));
  if(at<0){seen.clear();at=0}
  const [q]=pool.splice(at,1);if(!q)break;
  picked.push(q);seen.add(q.chapter);
 }
 return picked;
}
function targets(){
 const xs=weak().slice(0,3);
 if(!xs.length)return '<p>Complete a short assessment to discover which concepts need more work.</p>';
 return '<p>Based on your previous answers, these concepts deserve another look:</p><ol class="lm-mastery-list">'+
 xs.map(o=>{const t=sectionTitle(o);return '<li><strong>'+esc(t.chapter)+'</strong><small>'+esc(t.section)
 +' · '+(o.coachGap?'AI noted a reasoning gap':mastery(o)==='needs review'?'Needs more practice':o.due<=now()?'Review due':'Developing')
 +'</small></li>'}).join('')+'</ol>';
}
let detection=null;
async function aiState(node) {
 if(!node)return;
 if(navigator.onLine===false){node.textContent='Built-in tutor (offline). Reviewed teaching and mastery practice still work.';return}
 if(!detection)detection=fetch('/api/lamla-coach',{cache:'no-store',signal:AbortSignal.timeout(8500)})
  .then(r=>r.ok?r.json():{}).then(d=>d.available===true).catch(()=>false);
 const active=await detection;
 if(!node.isConnected)return;
 node.textContent=active?'AI tutor connected. Use the reasoning coach after answering a question.'
   :'Built-in tutor active. AI coaching is unavailable here; reviewed lessons and adaptive practice remain available.';
}
const summary=()=>{
 const c=counts();return '<div class="lm-mastery-stats"><span><strong>'+c.tracked+'</strong> concept'+(c.tracked===1?'':'s')+' attempted</span>'
  +'<span><strong>'+c.due+'</strong> to strengthen</span><span><strong>'+c.strong+'</strong> improving consistently</span></div>';
};
function mountIntro(){
 const box=document.querySelector('.lamla-intro');
 if(!box||box.querySelector('.lm-mastery'))return;
 const el=document.createElement('section');el.className='lm-mastery';
 el.innerHTML='<h2>Your learning map</h2>'+summary()+'<p class="lm-ai-mode" role="status">Checking tutor connection…</p>'
  +targets()+button(counts().tracked?'Practise my weakest concepts':'Find my weak concepts','btn btn-primary lm-mastery-start')
  +button('Clear my learning history','btn lm-mastery-clear')
  +'<p class="lm-note">Progress is stored on this device only. These are practice indicators, not guaranteed mastery or exam marks.</p>'
  +'<div class="lm-drill-root" hidden></div>';
 const before=box.querySelector('.lamla-pick');if(before)box.insertBefore(el,before);else box.appendChild(el);
 const start=el.querySelector('.lm-mastery-start'),clear=el.querySelector('.lm-mastery-clear');
 start.addEventListener('click',()=>startDrill(el));
 clear.addEventListener('click',()=>{
  if(!confirm('Clear LAMLA practice history saved on this device?'))return;
  data=fresh();persist();drill=null;
  el.remove();mountIntro();
 });
 aiState(el.querySelector('.lm-ai-mode'));
}
async function startDrill(el) {
 const area=el.querySelector('.lm-drill-root'),start=el.querySelector('.lm-mastery-start');
 if(!area)return;
 start.disabled=true;area.hidden=false;area.textContent='Preparing reviewed questions for your targeted practice…';
 try{
  const qs=await bank();
  if(!area.isConnected)return;
  if(!qs.length)throw new Error('No lecture questions available');
  drill={qs:pick(qs),index:0,results:[],selected:null};
  if(!drill.qs.length)throw new Error('No suitable questions available');
  renderDrill(area);
 }catch(error){area.textContent='Unable to load the reviewed question bank. Open the lecture tests online once, or retry when your connection returns.'}
 finally{if(start.isConnected)start.disabled=false}
}
function renderDrill(area) {
 if(!drill||!area.isConnected)return;
 const {qs,index,selected}=drill;
 if(index>=qs.length){
  const correct=drill.results.reduce((n,v)=>n+Number(v),0);
  area.innerHTML='<h3>Focused practice complete</h3><p><strong>'+correct+'/'+qs.length+'</strong> correct. '
    +'Your learning map has been updated.</p>'+targets()
    +button('Try another targeted set','btn btn-primary lm-drill-restart')
    +button('Close practice','btn lm-drill-close');
  area.querySelector('.lm-drill-restart').onclick=()=>startDrill(area.closest('.lm-mastery'));
  area.querySelector('.lm-drill-close').onclick=()=>{area.hidden=true;drill=null};
  return;
 }
 const q=qs[index],t=sectionTitle(q);
 area.innerHTML='<h3>Targeted practice · '+(index+1)+' of '+qs.length+'</h3>'
  +'<p class="lm-note">'+esc(t.chapter)+' · '+esc(t.section)+'</p>'
  +'<p><strong>'+esc(q.stem)+'</strong></p>'
  +['A','B','C','D'].map(k=>'<button type="button" class="lm-drill-option" data-option="'+k+'" '+(selected?'disabled':'')+'>'
   +'<strong>'+k+'.</strong> '+esc(q.options[k])+'</button>').join('')
  +(selected?'<div class="lm-drill-answer"><strong>'+ (selected===q.answer?'Correct.':'Let’s repair this concept.')+'</strong>'
      +'<p><strong>Reviewed answer: '+q.answer+'</strong> — '+esc(q.options[q.answer])+'</p>'
      +'<p>'+esc(q.why)+'</p>'
      +'<a href="#/physiology/cvs/'+encodeURIComponent(q.chapter)+'?section='+encodeURIComponent(q.section)+'">Read the full explanation</a>'
      +'</div>'+button(index===qs.length-1?'See my progress':'Next question','btn btn-primary lm-drill-next')
     :'');
 for(const b of area.querySelectorAll('.lm-drill-option'))b.onclick=()=>{
  if(drill.selected)return;
  const choice=b.dataset.option;drill.selected=choice;
  const correct=choice===q.answer;drill.results.push(correct);
  addAnswer(q,choice,'targeted');
  renderDrill(area);
 };
 area.querySelector('.lm-drill-next')?.addEventListener('click',()=>{
  drill.index++;drill.selected=null;renderDrill(area);
 });
}
function mountPlan(){
 const plan=document.querySelector('.lm-v2 .lm-plan');
 if(!plan||plan.querySelector('.lm-plan-mastery'))return;
 const el=document.createElement('aside');
 el.className='lm-mastery lm-plan-mastery';
 el.innerHTML='<h2>LAMLA tutor readiness</h2><p class="lm-ai-mode" role="status">Checking AI connection…</p>'
   + (counts().tracked?summary()+targets():'<p>Your first assessments will establish which objectives need more practice.</p>')
   +'<p class="lm-note">AI coaching checks your written reasoning when configured. The structured learning route and reviewed tests work without AI.</p>';
 const status=plan.querySelector('.lm-ai-status');
 if(status)status.after(el);else plan.appendChild(el);
 aiState(el.querySelector('.lm-ai-mode'));
}
function mountFinish(){
 const finish=[...document.querySelectorAll('.lm-v2 .lm-finish')].find(x=>x.textContent.includes('Session completed'));
 if(!finish||finish.querySelector('.lm-mastery'))return;
 const el=document.createElement('section');el.className='lm-mastery';
 el.innerHTML='<h2>Your next learning priorities</h2>'+summary()+targets()
  +'<p>These recommendations use your attempts and reviewed lecture questions, even when AI is unavailable.</p>'
  +'<a class="btn btn-primary" href="#/lamla">Open targeted practice</a>';
 const actions=finish.querySelector('.lt-actions');
 if(actions)finish.insertBefore(el,actions);else finish.appendChild(el);
}
let busy=false;
function update(){
 if(busy)return;busy=true;
 queueMicrotask(()=>{busy=false;
  if(!location.hash.startsWith('#/lamla'))return;
  mountIntro();mountPlan();mountFinish();
 });
}
new MutationObserver(update).observe(document.body,{childList:true,subtree:true});
window.addEventListener('hashchange',update);
window.addEventListener('lamla:mastery-changed',update);
window.addEventListener('online',()=>{detection=null;update()});
update();
window.LAMLAMastery={getSnapshot:()=>JSON.parse(JSON.stringify(data)),getCounts:counts};
})();
