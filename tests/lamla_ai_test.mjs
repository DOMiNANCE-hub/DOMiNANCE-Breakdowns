// The LAMLA Pages Function must explain whether a binding or AI response failed.
// Node 22 can import the Pages ESM handler from a data URL without reconfiguring this repo.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const source=readFileSync(new URL('../functions/api/lamla-plan.js',import.meta.url),'utf8');
const {onRequestGet,onRequestPost}=await import('data:text/javascript;charset=utf-8,'+encodeURIComponent(source));
const payload={goal:'learn',minutes:120,limit:2,chapters:[
  {slug:'cardiac-muscle',title:'Cardiac muscle',highYield:3,questions:12},
  {slug:'cardiac-cycle',title:'Cardiac cycle',highYield:4,questions:20}
]};
const post=env=>onRequestPost({
  env,
  request:new Request('https://example.test/api/lamla-plan',{
    method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)
  })
});
const missingGet=await onRequestGet({env:{}});
assert.equal(missingGet.status,200);
assert.equal((await missingGet.json()).ai_binding,'missing');
const boundGet=await onRequestGet({env:{AI:{run:async()=>({})}}});
assert.equal((await boundGet.json()).ai_binding,'connected');
const missing=await post({});
assert.equal(missing.status,503);
assert.equal((await missing.json()).code,'binding_missing');
const ok=await post({AI:{run:async()=>({response:'{"order":["cardiac-muscle","cardiac-cycle"]}'})}});
assert.equal(ok.status,200);
assert.deepEqual((await ok.json()).order,['cardiac-muscle','cardiac-cycle']);
const saved=console.error;console.error=()=>{};
try {
  const inference=await post({AI:{run:async()=>{throw Error('test model outage')}}});
  assert.equal(inference.status,503);
  assert.equal((await inference.json()).code,'inference_failed');
  const invalid=await post({AI:{run:async()=>({response:'not valid JSON'})}});
  assert.equal(invalid.status,503);
  assert.equal((await invalid.json()).code,'invalid_ai_response');
} finally {console.error=saved}
console.log('PASS LAMLA binding diagnostics and safe AI planning failures');
