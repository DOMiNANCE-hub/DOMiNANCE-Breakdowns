/* Optional LAMLA guided lesson. The approved bullet points remain the learning source. */
(()=>{
'use strict';
const style=document.createElement('style');
style.textContent='.lm-ai-lesson{margin:1rem 0;padding:.9rem 1rem;border:1px solid var(--border,#cdd8e5);border-radius:14px}'
  +'.lm-ai-lesson summary{font-weight:700;cursor:pointer}.lm-ai-lesson .lm-lesson-label{display:block;font-size:.9rem;margin:.75rem 0 .35rem}'
  +'.lm-ai-lesson select,.lm-ai-lesson textarea{display:block;width:100%;box-sizing:border-box;border:1px solid #899bb5;border-radius:9px;background:transparent;color:inherit;font:inherit;padding:.7rem}'
  +'.lm-ai-lesson textarea{min-height:84px;margin:.7rem 0;resize:vertical}.lm-ai-lesson button{margin:.75rem 0 .4rem}'
  +'.lm-ai-lesson button:disabled{opacity:.6;cursor:not-allowed}.lm-ai-lesson .lm-ai-lesson-result{padding:.7rem .85rem;background:rgba(86,119,158,.09);border-radius:10px;margin:.8rem 0}'
  +'.lm-ai-lesson .lm-ai-lesson-result p{white-space:pre-wrap;overflow-wrap:anywhere}.lm-ai-lesson small{display:block;opacity:.8;margin-top:.65rem}';
document.head.appendChild(style);
let checked=null;
const ready=()=>{
 if(navigator.onLine===false)return Promise.resolve(false);
 if(!checked)checked=fetch('/api/lamla-lesson',{cache:'no-store',signal:AbortSignal.timeout(9000)})
  .then(r=>r.ok?r.json():{}).then(x=>x?.available===true).catch(()=>false);
 return checked;
};
const tag=(name,text)=>{const el=document.createElement(name);el.textContent=text;return el};
async function post(payload){
 const abort=new AbortController(),timeout=setTimeout(()=>abort.abort(),22000);
 try{
   const response=await fetch('/api/lamla-lesson',{
     method:'POST',headers:{'Content-Type':'application/json'},
     body:JSON.stringify(payload),signal:abort.signal
   });
   const body=await response.json();
   if(!response.ok)throw Error(body?.code==='limit_reached'
     ?'Daily AI limit reached. Continue with the reviewed explanations.'
     :'AI teaching is unavailable. The reviewed points remain available.');
   return body;
 }finally{clearTimeout(timeout)}
}
function mount(){
 if(!location.hash.startsWith('#/lamla/'))return;
 const section=document.querySelector('.lm-v2 .lm-learn');
 if(!section||section.querySelector('.lm-ai-lesson'))return;
 const li=[...section.querySelectorAll('.lm-must > li')].map(el=>el.textContent.replace(/\s+/g,' ').trim())
   .filter(Boolean).slice(0,14);
 if(!li.length)return;
 const panel=document.createElement('details');panel.className='lm-ai-lesson';
 const summ=tag('summary','Explore this concept with LAMLA AI');
 const label=tag('label','Choose a concept from the approved notes');label.className='lm-lesson-label';
 const choose=document.createElement('select');label.append(choose);
 li.forEach((fact,i)=>{const option=document.createElement('option');option.value=String(i);
  option.textContent=fact.slice(0,100)+(fact.length>100?'…':'');choose.append(option)});
 const status=tag('p','Checking AI availability…');status.setAttribute('role','status');
 const button=tag('button','Teach this concept');button.type='button';button.className='btn btn-primary';button.disabled=true;
 const result=document.createElement('div');result.className='lm-ai-lesson-result';result.hidden=true;
 const note=tag('small','AI teaching is optional. A request sends selected reviewed points and, if supplied, your written answer to the AI provider. No account identity is automatically attached. Avoid sharing personal details.');
 panel.append(summ,label,status,button,result,note);
 const list=section.querySelector('.lm-must');
 if(list)list.before(panel);else section.append(panel);
 let isReady=false,working=false;
 ready().then(ok=>{if(!panel.isConnected)return;
   isReady=ok&&navigator.onLine!==false;button.disabled=!isReady;
   status.textContent=isReady?'AI tutor connected. Select a concept to begin guided learning.'
     :'Built-in mode: the reviewed notes below remain available. AI teaching is not connected on this deployment.';
 });
 const buildFacts=()=>{
   const focus=li[Number(choose.value)||0]||li[0];
   const facts=[focus,...li.filter(x=>x!==focus)].slice(0,9).map(x=>x.slice(0,280));
   return {topic:section.querySelector('h1')?.textContent?.trim().slice(0,110)||'CVS Physiology',focus:focus.slice(0,300),facts};
 };
 const run=async mode=>{
  if(working||!isReady)return;
  working=true;button.disabled=true;result.hidden=true;
  status.textContent='LAMLA is working from the approved concept notes…';
  try{
   const facts=buildFacts(),response=await post({...facts,mode});
   if(!panel.isConnected)return;
   result.replaceChildren();
   result.append(tag('h3','Guided explanation'),tag('p',response.explanation),
     tag('strong','Understanding check'),tag('p',response.checkQuestion));
   const answerLabel=tag('label','Explain your answer in your own words');
   const answer=document.createElement('textarea');answer.maxLength=550;
   answer.placeholder='I think this happens because…';answerLabel.append(answer);
   const check=tag('button','Assess my explanation');check.type='button';
   check.className='btn btn-primary';check.disabled=true;
   answer.addEventListener('input',()=>{check.disabled=answer.disabled||answer.value.trim().length<15});
   result.append(answerLabel,check);
   check.addEventListener('click',async()=>{
    if(working||answer.value.trim().length<15)return;
    working=true;check.disabled=true;answer.disabled=true;
    status.textContent='LAMLA is checking your reasoning against the reviewed notes…';
    try{
      const fb=await post({...facts,mode:'assess',previousQuestion:response.checkQuestion,answer:answer.value.trim()});
      if(!panel.isConnected)return;
      const wrap=document.createElement('div');
      wrap.append(tag('h3','Reasoning feedback'),tag('p',fb.feedback),
        tag('strong','Next question to think about'),tag('p',fb.checkQuestion));
      result.append(wrap);status.textContent='Guided check complete. Return to the lecture questions for further practice.';
      check.remove();
    }catch(error){answer.disabled=false;check.disabled=false;status.textContent=error?.message||'Unable to assess; reviewed notes remain available.'}
    finally{working=false;button.disabled=!isReady}
   });
   result.hidden=false;
   status.textContent='Read the explanation, then answer the check question.';
  }catch(error){status.textContent=error?.name==='AbortError'
      ?'AI request timed out. Continue using the reviewed notes.'
      :(error?.message||'AI lesson unavailable.')}
  finally{working=false;button.disabled=!isReady}
 };
 button.addEventListener('click',()=>run('teach'));
}
let busy=false;
const update=()=>{if(busy)return;busy=true;queueMicrotask(()=>{busy=false;mount()})};
new MutationObserver(update).observe(document.body,{subtree:true,childList:true});
window.addEventListener('hashchange',update);
window.addEventListener('online',()=>{checked=null;update()});
update();
})();
