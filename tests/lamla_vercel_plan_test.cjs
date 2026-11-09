const assert=require('node:assert/strict');
const handler=require('../api/lamla-plan.js');
const payload={goal:'learn',minutes:60,limit:2,chapters:[
 {slug:'cardiac-muscle',title:'Cardiac muscle',questions:12,highYield:4},
 {slug:'cardiac-cycle',title:'Cardiac cycle',questions:15,highYield:6}
]};
const invoke=async(method,body=payload)=>{
 const out={code:200,headers:{},body:null,
   setHeader(k,v){this.headers[k]=v;return this},
   status(n){this.code=n;return this},
   json(x){this.body=x;return this}};
 await handler({method,headers:{'content-type':'application/json','x-forwarded-for':'192.0.2.19'},body},out);
 return out;
};
(async()=>{
 const off=await invoke('GET');
 assert.equal(off.body.ai_binding,'missing');
 assert.equal((await invoke('POST')).code,503);
 const initial={LAMLA_COACH_ENABLED:process.env.LAMLA_COACH_ENABLED,OPENAI_API_KEY:process.env.OPENAI_API_KEY,
   KV_REST_API_URL:process.env.KV_REST_API_URL,KV_REST_API_TOKEN:process.env.KV_REST_API_TOKEN};
 const fetchOriginal=global.fetch;
 try{
   Object.assign(process.env,{LAMLA_COACH_ENABLED:'true',OPENAI_API_KEY:'TEST-FAKE-KEY',
     KV_REST_API_URL:'https://redis.test',KV_REST_API_TOKEN:'TEST-FAKE-TOKEN'});
   let calls=0;
   global.fetch=async(url,opts)=>{
     calls++;
     if(String(url).includes('/pipeline'))return {ok:true,json:async()=>[{result:1},{result:1}]};
     assert.equal(url,'https://api.openai.com/v1/chat/completions');
     const optsJSON=JSON.parse(opts.body);
     assert.equal(optsJSON.response_format.type,'json_object');
     return {ok:true,json:async()=>({choices:[{message:{content:'{"order":["cardiac-cycle","cardiac-muscle"]}'}}]})};
   };
   assert.equal((await invoke('GET')).body.ai_binding,'connected');
   const planned=await invoke('POST');
   assert.equal(planned.code,200);
   assert.deepEqual(planned.body.order,['cardiac-cycle','cardiac-muscle']);
   assert.equal(calls,2);
   assert.equal((await invoke('POST',{...payload,chapters:[]})).code,400);
 }finally{
   global.fetch=fetchOriginal;
   for(const [k,v] of Object.entries(initial)){if(v===undefined)delete process.env[k];else process.env[k]=v}
 }
 console.log('PASS Vercel LAMLA AI route availability, validation, planner response');
})().catch(e=>{console.error(e);process.exit(1)});
