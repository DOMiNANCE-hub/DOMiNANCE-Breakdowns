// Live rollout smoke test: runs only when the main-branch merge commit contains [lamla-probe].
// Exercises the real Cloudflare Workers AI binding with a synthetic learning example.
// Does not use personal data and makes only two AI inference calls after readiness.
const base='https://dominance-breakdowns.pages.dev';
const withTimeout=(ms=18000)=>AbortSignal.timeout(ms);
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const checks=['/api/lamla-plan','/api/lamla-coach','/api/lamla-lesson'];
async function readiness(){
 const results={};
 for(const path of checks){
  const r=await fetch(base+path,{cache:'no-store',signal:withTimeout()});
  const j=await r.json();
  results[path]={status:r.status,ready:path.endsWith('plan')?j.ai_binding==='connected':j.available===true,mode:j.mode||null};
 }
 return results;
}
async function response(path,payload){
 const r=await fetch(base+path,{
  method:'POST',headers:{'Content-Type':'application/json','X-LAMLA-Visitor':'00000000-0000-4000-8000-111111111111'},
  body:JSON.stringify(payload),signal:withTimeout(35000)
 });
 const j=await r.json();
 console.log('LIVE',path,'status',r.status,'source',j.source,'code',j.code||'-');
 if(!r.ok||j.source!=='workers-ai')throw Error(path+' failed '+r.status+' '+(j.code||''));
 return j;
}
try{
 let result={};
 for(let attempt=0;attempt<16;attempt++){
  try{result=await readiness()}catch(e){result={error:String(e?.message||e)}}
  console.log('LAMLA production readiness',attempt+1,JSON.stringify(result));
  if(checks.every(path=>result[path]?.ready))break;
  if(attempt<15)await wait(15000);
 }
 if(!checks.every(path=>result[path]?.ready))throw Error('Cloudflare production AI binding or new endpoints not yet ready');
 const coach=await response('/api/lamla-coach',{
  topic:'Baroreceptor reflex',
  stem:'What is the immediate neural response to falling arterial pressure?',
  chosen:'B',correct:'B',
  options:['Increased vagal output','Increased sympathetic output','Reduced systemic resistance','Suppressed ventricular contraction'],
  explanation:'Lower arterial pressure reduces stretch and afferent firing from arterial baroreceptors, increasing sympathetic and decreasing parasympathetic outflow.',
  studentReason:'The baroreceptors stretch less and fire less, so sympathetic drive rises and vagal output falls.'
 });
 if(!coach.diagnosis||!coach.coaching||!coach.checkQuestion)throw Error('Incomplete real AI coaching feedback');
 const lesson=await response('/api/lamla-lesson',{
  mode:'teach',topic:'Arterial baroreceptor reflex',
  focus:'A fall in arterial pressure reduces baroreceptor stretch and afferent firing.',
  facts:[
   'A fall in arterial pressure reduces baroreceptor stretch and afferent firing.',
   'This increases sympathetic and decreases parasympathetic output.',
   'Heart rate, contractility, venous tone and systemic arteriolar resistance increase.'
  ]
 });
 if(!lesson.explanation||!lesson.checkQuestion)throw Error('Incomplete real AI teaching');
 console.log('PASS live Cloudflare AI: readiness, reason assessment, guided lesson');
}catch(e){
 console.error('FAIL live Cloudflare LAMLA probe',String(e?.message||e).slice(0,250));
 process.exitCode=1;
}
