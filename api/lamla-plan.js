// Vercel counterpart to Cloudflare's LAMLA chapter planner.
// Disabled without configured AI and Redis; local study planning remains fully functional.
const {createHash}=require('node:crypto');
const ready=()=>process.env.LAMLA_COACH_ENABLED==='true'&&!!process.env.OPENAI_API_KEY&&
 !!process.env.KV_REST_API_URL&&!!process.env.KV_REST_API_TOKEN;
const send=(res,status,data)=>res.status(status).json(data);
const clean=(x,n)=>typeof x==='string'?x.trim().slice(0,n):'';
async function guard(req){
 const ip=String(req.headers['x-vercel-forwarded-for']||req.headers['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0].trim();
 const key='lamla-coach:v1:'+createHash('sha256').update(ip+'|'+new Date().toISOString().slice(0,10)).digest('hex').slice(0,24);
 const reply=await fetch(process.env.KV_REST_API_URL.replace(/\/$/,'')+'/pipeline',{
   method:'POST',headers:{Authorization:'Bearer '+process.env.KV_REST_API_TOKEN,'Content-Type':'application/json'},
   body:JSON.stringify([['INCR',key],['EXPIRE',key,'86400']]),signal:AbortSignal.timeout(7000)
 });
 if(!reply.ok)throw Error('Rate limit unavailable');
 const value=Number((await reply.json())?.[0]?.result);
 if(!Number.isFinite(value))throw Error('Invalid rate limit');
 return value<=25;
}
module.exports=async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 res.setHeader('X-Content-Type-Options','nosniff');
 if(req.method==='GET')return send(res,200,{service:'lamla-plan',endpoint:'ready',ai_binding:ready()?'connected':'missing',model:'gpt-6-luna'});
 if(req.method!=='POST')return send(res,405,{error:'Method not allowed'});
 if(!ready())return send(res,503,{error:'AI route unavailable; use built-in planner',code:'ai_unavailable'});
 if(!String(req.headers['content-type']||'').includes('application/json'))return send(res,415,{error:'JSON required'});
 let v=req.body;
 try{if(typeof v==='string')v=JSON.parse(v)}catch{return send(res,400,{error:'Invalid JSON',code:'invalid_request'})}
 if(!v||typeof v!=='object'||JSON.stringify(v).length>7000)return send(res,413,{error:'Request too large'});
 const goal=v.goal==='revise'?'revise':'learn',minutes=Number(v.minutes),limit=Number(v.limit);
 const chapters=Array.isArray(v.chapters)?v.chapters:[];
 if(!Number.isInteger(minutes)||minutes<15||minutes>10080||!Number.isInteger(limit)||limit<1||limit>30||
   !chapters.length||chapters.length>30)return send(res,400,{error:'Invalid learning route',code:'invalid_request'});
 const safe=chapters.map(x=>({
   slug:clean(x?.slug,60),title:clean(x?.title,100),
   highYield:Math.max(0,Math.min(30,Number(x?.highYield)||0)),
   questions:Math.max(0,Math.min(150,Number(x?.questions)||0))
 }));
 if(safe.some(x=>!/^[a-z0-9-]+$/.test(x.slug))||new Set(safe.map(x=>x.slug)).size!==safe.length)
   return send(res,400,{error:'Invalid chapter list',code:'invalid_request'});
 try{if(!await guard(req))return send(res,429,{error:'Daily AI usage limit reached',code:'limit_reached'})}
 catch{return send(res,503,{error:'AI usage protection unavailable',code:'service_unavailable'})}
 try{
   const target=Math.min(limit,safe.length);
   const prompt='Design a medical-student learning sequence using ONLY the approved chapter identifiers supplied. '
    +'No new facts, questions or chapters. Choose exactly '+target+' unique slugs, following learning prerequisites and high-yield priorities. '
    +'Goal: '+goal+'. Minutes: '+minutes+'. Return JSON {"order":["slug1","slug2"]}. Chapters: '+JSON.stringify(safe);
   const response=await fetch('https://api.openai.com/v1/chat/completions',{
     method:'POST',headers:{Authorization:'Bearer '+process.env.OPENAI_API_KEY,'Content-Type':'application/json'},
     body:JSON.stringify({model:process.env.LAMLA_AI_MODEL||'gpt-6-luna',reasoning_effort:'none',max_completion_tokens:500,
       response_format:{type:'json_object'},messages:[
         {role:'system',content:'Return only reviewed chapter slugs from the user-supplied list. Never invent curriculum material.'},
         {role:'user',content:prompt}
       ]}),signal:AbortSignal.timeout(17000)
   });
   if(!response.ok)throw Error('AI planning unavailable');
   const raw=await response.json(),parsed=JSON.parse(String(raw?.choices?.[0]?.message?.content||'{}'));
   const valid=new Set(safe.map(x=>x.slug));
   const selected=(Array.isArray(parsed.order)?parsed.order:[])
     .filter((slug,i,arr)=>valid.has(slug)&&arr.indexOf(slug)===i).slice(0,target);
   if(!selected.length)throw Error('No usable chapter slugs');
   const rest=safe.map(x=>x.slug).filter(x=>!selected.includes(x));
   return send(res,200,{source:'openai',order:selected.concat(rest).slice(0,target),aiSelected:selected.length});
 }catch(e){
   console.error('LAMLA planning failure',String(e?.message||'unknown').slice(0,160));
   return send(res,503,{error:'AI route unavailable; use built-in planner',code:'inference_failed'});
 }
};
