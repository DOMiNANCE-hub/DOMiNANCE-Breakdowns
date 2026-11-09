import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const src=readFileSync(new URL('../functions/api/lamla-lesson.js',import.meta.url),'utf8');
const {onRequestGet,onRequestPost}=await import('data:text/javascript;charset=utf-8,'+encodeURIComponent(src));
const base={mode:'teach',topic:'Baroreceptor reflex',focus:'Falling BP lowers baroreceptor stretch.',
  facts:['Falling BP lowers baroreceptor stretch.','Reduced afferent firing increases sympathetic tone.']};
const req=body=>new Request('https://example.test/api/lamla-lesson',{method:'POST',
  headers:{'content-type':'application/json','CF-Connecting-IP':'192.0.2.22'},body:JSON.stringify(body)});
const absent=await onRequestGet({env:{}});
assert.equal((await absent.json()).available,false);
assert.equal((await onRequestPost({request:req(base),env:{}})).status,503);
let count=0,call=0;
const env={LAMLA_COACH_ENABLED:'true',LAMLA_COACH_LIMITS:{
  get:async()=>String(count),put:async(_key,x)=>{count=Number(x)}
},AI:{run:async(_model,args)=>{
  call++;
  const parsed=JSON.parse(args.messages[1].content);
  if(parsed.mode==='teach'){
    assert.equal(parsed.reviewedFacts.length,2);
    return {response:{explanation:'Reduced stretch means fewer baroreceptor signals reach the medulla.',feedback:'',checkQuestion:'What happens to sympathetic discharge?'}};
  }
  assert.equal(parsed.studentAnswer,'Sympathetic outflow increases as a reflex to lower blood pressure.');
  return {response:{explanation:'',feedback:'That is consistent with the reviewed notes.',checkQuestion:'What happens to resistance vessels?'}};
}}};
const up=await onRequestGet({env});
assert.equal((await up.json()).available,true);
const lesson=await onRequestPost({request:req(base),env});
assert.equal(lesson.status,200);assert.equal((await lesson.json()).mode,'teach');
const assess=await onRequestPost({request:req({...base,mode:'assess',previousQuestion:'What happens to sympathetic discharge?',
  answer:'Sympathetic outflow increases as a reflex to lower blood pressure.'}),env});
assert.equal(assess.status,200);assert.equal((await assess.json()).mode,'assess');
assert.equal(call,2);assert.equal(count,2);
const bad=await onRequestPost({request:req({...base,facts:[]}),env});
assert.equal(bad.status,400);assert.equal(count,2);
count=25;assert.equal((await onRequestPost({request:req(base),env})).status,429);
let fallbackCount=0;
const noKVEnv={AI:{run:async()=>{fallbackCount++;return {response:{explanation:'A falling pressure reduces stretch.',feedback:'',checkQuestion:'What happens to firing?'}}}}};
for(let i=0;i<4;i++)assert.equal((await onRequestPost({request:req(base),env:noKVEnv})).status,200);
assert.equal((await onRequestPost({request:req(base),env:noKVEnv})).status,429);
assert.equal(fallbackCount,4);
console.log('PASS LAMLA lesson learning, grounded assessment, unavailable mode and quota');
