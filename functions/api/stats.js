// Cloudflare Pages adapter for the existing private insights dashboard.
// The secret stays in Vercel; this adapter forwards the user's supplied key
// without storing it or adding it to a URL.
const ENDPOINT = 'https://dominance-breakdowns.vercel.app/api/stats';

export async function onRequest({ request }) {
  if (request.method !== 'GET') return new Response('', { status: 405, headers: { Allow: 'GET' } });
  const key = request.headers.get('x-stats-key') || '';
  if (!key || key.length > 300) return new Response('{"error":"key"}', { status: 401, headers: { 'Cache-Control': 'no-store' } });
  try {
    const upstream = await fetch(ENDPOINT, {
      headers: { 'x-stats-key': key, 'Accept': 'application/json' },
      redirect: 'manual',
    });
    if (upstream.status >= 300 && upstream.status < 400) throw new Error('Unexpected upstream redirect');
    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'application/json; charset=utf-8',
        'X-Robots-Tag': 'noindex',
      },
    });
  } catch {
    return new Response('{"error":"upstream"}', { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
