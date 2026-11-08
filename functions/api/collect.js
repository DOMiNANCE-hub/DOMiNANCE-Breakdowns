// Cloudflare Pages adapter: preserve the existing Vercel/Upstash feedback backend.
// This route proxies only POST /api/collect; it contains no database credentials.
const ENDPOINT = 'https://dominance-breakdowns.vercel.app/api/collect';

export async function onRequest({ request }) {
  if (request.method !== 'POST') return new Response('', { status: 405, headers: { Allow: 'POST' } });
  let body;
  try { body = await request.text(); } catch { return new Response('', { status: 400 }); }
  if (!body || body.length > 100_000) return new Response('', { status: 413 });
  try {
    const upstream = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      redirect: 'manual',
    });
    if (upstream.status >= 300 && upstream.status < 400) return new Response('Feedback upstream unavailable', { status: 503 });
    return new Response(upstream.body, {
      status: upstream.status,
      headers: { 'Cache-Control': 'no-store', 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch {
    return new Response('Feedback upstream unavailable', { status: 503 });
  }
}
