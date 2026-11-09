// One-time production health probe, gated by the launch repair commit marker.
// Uses two synthetic chapter names; does not send student information or secrets.
const base='https://dominance-breakdowns.pages.dev/api/lamla-plan';
try {
  const check=await fetch(base,{signal:AbortSignal.timeout(15000)});
  const raw=await check.text();
  console.log('LAMLA LIVE GET',check.status,raw.slice(0,550));
  let status={};try{status=JSON.parse(raw)}catch{}
  if(check.ok && status.ai_binding==='connected') {
    const payload={goal:'learn',minutes:120,limit:2,chapters:[
      {slug:'cardiac-muscle',title:'Cardiac muscle',highYield:3,questions:12},
      {slug:'cardiac-cycle',title:'Cardiac cycle',highYield:4,questions:20}
    ]};
    const plan=await fetch(base,{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify(payload),signal:AbortSignal.timeout(25000)
    });
    console.log('LAMLA LIVE POST',plan.status,(await plan.text()).slice(0,700));
  }
} catch(e) {
  console.log('LAMLA live probe unreachable:',String(e?.message||e).slice(0,250));
}
