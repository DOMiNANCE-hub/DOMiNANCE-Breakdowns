// Shared by the feedback endpoints. Talks to the Upstash Redis database that Vercel connects to the
// project (Storage → Upstash for Redis). Until it is connected, the endpoints answer 503 and the site
// simply keeps working without collecting anything.
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

const connected = () => Boolean(URL_ && TOKEN);

async function pipeline(commands) {
  if (!commands.length) return [];
  const res = await fetch(URL_ + '/pipeline', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands.map(c => c.map(String))),
  });
  if (!res.ok) throw new Error('store ' + res.status);
  return (await res.json()).map(r => r.result);
}

module.exports = { connected, pipeline };
