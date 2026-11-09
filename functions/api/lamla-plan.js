const reply=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const hasAI=env=>typeof env?.AI?.run==='function';
// Public readiness check reveals only whether this Pages deployment has its expected binding.
// It never returns credentials, account information, prompts, or model responses.
export function onRequestGet({env}) {
  return reply({service:'lamla-plan',endpoint:'ready',ai_binding:hasAI(env)?'connected':'missing',model:'@cf/meta/llama-3.1-8b-instruct-fast'});
}

export async function onRequestPost({request,env}) {
  if(!request.headers.get('content-type')?.includes('application/json'))return reply({error:'JSON required'},415);
  if(Number(request.headers.get('content-length')||0)>15000)return reply({error:'Payload too large'},413);
  let input;
  try {input=await request.json()}catch{return reply({error:'Invalid request'},400)}
  const goal=input?.goal==='revise'?'revise':'learn';
  const minutes=Number(input?.minutes),limit=Number(input?.limit);
  const chapters=Array.isArray(input?.chapters)?input.chapters:[];
  if(!Number.isInteger(minutes)||minutes<15||minutes>10080||!Number.isInteger(limit)||limit<1||limit>30||chapters.length<1||chapters.length>30)return reply({error:'Invalid study route'},400);
  const safe=chapters.map(c=>({slug:String(c?.slug||'').slice(0,60),title:String(c?.title||'').slice(0,100),highYield:Math.max(0,Math.min(30,Number(c?.highYield)||0)),questions:Math.max(0,Math.min(150,Number(c?.questions)||0))}));
  if(safe.some(c=>!/^[a-z0-9-]+$/.test(c.slug))||new Set(safe.map(c=>c.slug)).size!==safe.length)return reply({error:'Invalid chapter list'},400);
  if(!hasAI(env))return reply({error:'AI binding is missing from this Pages deployment',code:'binding_missing'},503);
  const prompt=`You plan a medical-student revision route from a FIXED, already reviewed curriculum. Do not write questions, explanations, medical facts, or new chapters. Choose exactly ${Math.min(limit,safe.length)} unique chapter slugs from the supplied list, in an educationally coherent learning order. Balance conceptual prerequisites, high-yield tags, and available question practice. Student goal: ${goal}. Available study minutes: ${minutes}. Return ONLY a JSON object of the form {"order":["slug1","slug2"]}. No markdown. Here is the chapter metadata: ${JSON.stringify(safe)}`;
  let stage='inference';
  try {
    const answer=await env.AI.run('@cf/meta/llama-3.1-8b-instruct-fast',{messages:[{role:'system',content:'You are a curriculum route planner. Return strict JSON only. You may select only the supplied chapter slugs.'},{role:'user',content:prompt}],max_tokens:700,temperature:0.1});
    stage='response';
    const raw=String(answer?.response||'');
    const match=raw.match(/\{[\s\S]*\}/);
    if(!match)throw Error('AI response had no JSON');
    const parsed=JSON.parse(match[0]);
    const valid=new Set(safe.map(c=>c.slug)),order=(Array.isArray(parsed.order)?parsed.order:[]).filter((s,i,a)=>valid.has(s)&&a.indexOf(s)===i);
    if(order.length!==Math.min(limit,safe.length))throw Error('Incomplete route');
    return reply({order,source:'workers-ai'});
  } catch (error) {
    // Distinguish Cloudflare inference failures from AI response/validation failures.
    // Details belong in private Pages Function logs, never in public API responses.
    const code=stage==='inference'?'inference_failed':'invalid_ai_response';
    console.error('LAMLA AI planner:',code,String(error?.message||'Unknown failure').slice(0,400));
    return reply({error:'AI route unavailable; use built-in planner',code},503);
  }
}
