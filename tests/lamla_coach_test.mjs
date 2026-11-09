// LAMLA reasoning coach: enabled-state, limits, grounding input and error-path regression tests.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../functions/api/lamla-coach.js',import.meta.url),'utf8');
const {onRequestGet,onRequestPost}=await import('data:text/javascript;charset=utf-8,'+encodeURIComponent(source));
const payload={
  topic:'reflexes',stem:'What is the principal immediate response to a sudden fall in arterial pressure?',
  chosen:'B',correct:'B',
  options:['Vagal discharge rises','Sympathetic discharge rises','TPR falls','Cardiac output falls'],
  explanation:'Reduced baroreceptor stretch decreases afferent firing and raises sympathetic outflow.',
  studentReason:'The arteries are less stretched, so baroreceptors fire less and sympathetic drive rises.'
};
const request=(data=payload)=>new Request('https://example.test/api/lamla-coach',{
  method:'POST',headers:{'content-type':'application/json','CF-Connecting-IP':'192.0.2.15'},
  body:JSON.stringify(data)
});
const noAI=await onRequestGet({env:{}});
assert.equal((await noAI.json()).available,false);
const noLimit=await onRequestGet({env:{LAMLA_COACH_ENABLED:'true',AI:{run:async()=>({})}}});
assert.equal((await noLimit.json()).available,false);
const unavailable=await onRequestPost({request:request(),env:{}});
assert.equal(unavailable.status,503);
let count=0;
const makeEnv=run=>({
  LAMLA_COACH_ENABLED:'true',
  LAMLA_COACH_LIMITS:{
    get:async()=>String(count),
    put:async(_k,v)=>{count=Number(v)}
  },
  AI:{run}
});
const modelReply={response:{diagnosis:'The mechanism is correct.',coaching:'Lower stretch reduces baroreceptor firing, disinhibiting sympathetic outflow.',checkQuestion:'What happens to arteriolar resistance?',reasoningQuality:'sound'}};
const env=makeEnv(async(model,options)=>{
  assert.ok(model.includes('llama'));
  assert.equal(options.messages.length,2);
  assert.ok(options.messages[1].content.includes(payload.studentReason));
  assert.ok(options.messages[1].content.includes(payload.explanation));
  return modelReply;
});
assert.equal((await onRequestGet({env})).status,200);
const good=await onRequestPost({request:request(),env});
assert.equal(good.status,200);
const data=await good.json();
assert.equal(data.source,'workers-ai');
assert.equal(data.diagnosis,'The mechanism is correct.');
assert.equal(data.reasoningQuality,'sound');
assert.equal(count,1);
const second={...payload,followUpQuestion:'What happens to arteriolar resistance?',
  followUpAnswer:'Sympathetic activation constricts arterioles, increasing total peripheral resistance.'};
const next=await onRequestPost({request:request(second),env});
assert.equal(next.status,200);
assert.equal(count,2);
const incomplete=await onRequestPost({request:request({...payload,followUpQuestion:'Where is the reflex center?'}),env});
assert.equal(incomplete.status,400);
const invalid=await onRequestPost({request:request({...payload,studentReason:'short'}),env});
assert.equal(invalid.status,400);
assert.equal(count,2);
count=25;
const limited=await onRequestPost({request:request(),env});
assert.equal(limited.status,429);
const downEnv=makeEnv(async()=>{throw new Error('model problem')});
count=0;
const original=console.error;console.error=()=>{};
try{
 const broken=await onRequestPost({request:request(),env:downEnv});
 assert.equal(broken.status,503);
 assert.equal((await broken.json()).code,'inference_failed');
}finally{console.error=original}
console.log('PASS LAMLA reasoning coach availability, feedback, validation and usage guards');
