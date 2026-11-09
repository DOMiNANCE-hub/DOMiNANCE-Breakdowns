/* LAMLA Reasoning Coach: optional, grounded AI feedback on the student's own explanation.
   Loaded only on LAMLA routes. It leaves the reviewed offline question/answer flow intact. */
(() => {
  'use strict';
  const css=document.createElement('style');
  css.textContent='.lm-coach-panel{margin:1rem 0;padding:1rem;border:1px solid var(--border,#d5dce6);border-radius:14px;background:var(--surface,#fff)}'
    +'.lm-coach-panel h2{font-size:1.08rem;margin:0 0 .45rem}.lm-coach-panel p{margin:.4rem 0 .8rem}'
    +'.lm-coach-panel textarea{display:block;width:100%;box-sizing:border-box;min-height:90px;margin:.6rem 0;padding:.8rem;border:1px solid #8292ab;border-radius:10px;font:inherit;color:inherit;background:transparent;resize:vertical}'
    +'.lm-coach-panel .lm-coach-state{font-size:.9rem}.lm-coach-panel .lm-coach-output{margin-top:.85rem;padding:.85rem;border-radius:10px;background:rgba(90,128,183,.09)}'
    +'.lm-coach-output p{white-space:pre-wrap;overflow-wrap:anywhere}.lm-coach-panel .lm-coach-privacy{font-size:.78rem;opacity:.8}'
    +'.lm-coach-panel button{margin:.35rem 0}.lm-coach-panel button:disabled{opacity:.6;cursor:not-allowed}';
  document.head.appendChild(css);
  let readiness=null,probe=null;
  const questions=()=>Object.values(window.DOM_TESTS||{}).flatMap(t=>t?.questions||[]);
  const status=(node,text)=>{node.textContent=text};
  async function checkAI(){
    if(readiness!==null)return readiness;
    if(probe)return probe;
    probe=(async()=>{
      if(navigator.onLine===false)return false;
      try{
        const response=await fetch('/api/lamla-coach',{headers:{Accept:'application/json'},cache:'no-store',signal:AbortSignal.timeout(9000)});
        if(!response.ok)return false;
        const result=await response.json();
        return result?.available===true && result?.mode==='ai-ready';
      }catch{return false}
    })();
    readiness=await probe;probe=null;
    return readiness;
  }
  function render(){
    if(!location.hash.startsWith('#/lamla/'))return;
    const verdict=document.querySelector('.lm-v2 .lt-verdict');
    const explanation=document.querySelector('.lm-v2 .lt-feedback');
    const stem=document.querySelector('.lm-v2 .lt-stem')?.textContent?.trim();
    if(!verdict||!explanation||!stem||explanation.querySelector('.lm-coach-panel'))return;
    const q=questions().find(item=>item.stem.trim()===stem);
    if(!q||!q.answer||!q.why||!q.options)return;
    const chosen=(document.querySelector('.lm-v2 .lt-option.is-wrong .lt-letter')||
      document.querySelector('.lm-v2 .lt-option.is-correct .lt-letter'))?.textContent?.trim();
    if(!/^[A-D]$/.test(chosen||''))return;

    const panel=document.createElement('section');
    panel.className='lm-coach-panel';
    panel.setAttribute('aria-label','LAMLA AI reasoning coach');
    panel.innerHTML='<h2>Can you explain your reasoning?</h2>'
      +'<p>The reviewed explanation above is available without AI. To go deeper, explain <strong>why</strong> you chose your answer. LAMLA AI can then assess the reasoning, not just the letter.</p>'
      +'<label class="lm-coach-label" for="lm-coach-reason">Your explanation</label>'
      +'<textarea id="lm-coach-reason" maxlength="850" placeholder="I chose this because..."></textarea>'
      +'<button class="btn btn-primary lm-coach-send" type="button" disabled>Check my reasoning with LAMLA AI</button>'
      +'<p class="lm-coach-state" role="status" aria-live="polite">Checking AI availability…</p>'
      +'<div class="lm-coach-output" aria-live="polite" hidden></div>'
      +'<p class="lm-coach-privacy">Optional: submitting sends this question, the reviewed answer, and your written reasoning to the configured AI service. No name or student number is included.</p>';
    explanation.appendChild(panel);
    const input=panel.querySelector('textarea'),button=panel.querySelector('button'),
      state=panel.querySelector('.lm-coach-state'),output=panel.querySelector('.lm-coach-output');
    let isReady=false,working=false;
    const update=()=>{
      button.disabled=working||!isReady||input.value.trim().length<15;
      if(navigator.onLine===false){isReady=false;button.disabled=true;status(state,'Offline: your reviewed lecture explanation remains available. AI feedback requires a connection.');}
    };
    input.addEventListener('input',update);
    checkAI().then(yes=>{
      if(!panel.isConnected)return;
      isReady=yes&&navigator.onLine!==false;
      status(state,isReady
        ?'AI tutor connected. Describe your thinking in at least 15 characters to receive personalized feedback.'
        :'Built-in tutor active. AI coaching is not configured or reachable on this deployment; your reviewed explanation is still available.');
      update();
    });
    button.addEventListener('click',async()=>{
      const studentReason=input.value.trim();
      if(!isReady||working||studentReason.length<15)return;
      working=true;update();
      status(state,'LAMLA is checking your reasoning against the approved explanation…');
      output.hidden=true;output.replaceChildren();
      const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
      try{
        const response=await fetch('/api/lamla-coach',{
          method:'POST',headers:{'Content-Type':'application/json'},
          body:JSON.stringify({
            topic:q.chapter,stem:q.stem,chosen,correct:q.answer,
            options:['A','B','C','D'].map(k=>q.options[k]),explanation:q.why,studentReason
          }),signal:controller.signal
        });
        const result=await response.json();
        if(!response.ok||!result?.diagnosis||!result?.coaching||!result?.checkQuestion)
          throw new Error(result?.code==='limit_reached'?'Daily AI limit reached.':'AI coaching unavailable.');
        if(!panel.isConnected)return;
        const heading=document.createElement('strong');
        heading.textContent='LAMLA AI feedback';
        output.append(heading);
        for(const [name,value] of [['Diagnosis',result.diagnosis],['Let's strengthen it',result.coaching],['Try this',result.checkQuestion]]){
          const p=document.createElement('p'),label=document.createElement('strong');
          label.textContent=name+': ';p.append(label,document.createTextNode(String(value)));output.append(p);
        }
        output.hidden=false;
        status(state,'AI feedback ready. The reviewed question answer remains authoritative.');
      }catch(error){
        if(panel.isConnected)status(state,error?.name==='AbortError'
          ?'AI request timed out. Continue with the reviewed explanation above.'
          :'AI feedback is currently unavailable. '+(error?.message||'Use the reviewed explanation above.'));
      }finally{clearTimeout(timer);working=false;update()}
    });
  }
  let scheduled=false;
  const watch=()=>{
    if(scheduled)return;scheduled=true;
    queueMicrotask(()=>{scheduled=false;render()});
  };
  new MutationObserver(watch).observe(document.body,{childList:true,subtree:true});
  window.addEventListener('hashchange',watch);
  window.addEventListener('offline',watch);
  window.addEventListener('online',()=>{readiness=null;watch()});
  watch();
})();
