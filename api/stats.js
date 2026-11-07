// The owner's dashboard data (stats.html). Requires the private key set as STATS_KEY in the Vercel project.
const crypto = require('crypto');
const { connected, pipeline } = require('./_store');

const same = (a, b) => a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
const pairs = flat => { const o = {}; for (let i = 0; i < (flat || []).length; i += 2) o[flat[i]] = Number(flat[i + 1]); return o; };

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex');
  const key = String(req.headers['x-stats-key'] || '');
  const expected = process.env.STATS_KEY || '';
  if (!expected || !key || !same(key, expected)) { res.statusCode = 401; return res.end('{"error":"key"}'); }
  if (!connected()) { res.statusCode = 503; res.setHeader('Content-Type', 'application/json'); return res.end('{"error":"store"}'); }
  try {
    const [views, total, right, tips, media, up, down, miss, notes] = await pipeline([
      ['HGETALL', 'views'], ['HGETALL', 'ans:total'], ['HGETALL', 'ans:right'], ['HGETALL', 'tips'], ['HGETALL', 'media'],
      ['HGETALL', 'votes:up'], ['HGETALL', 'votes:down'], ['ZREVRANGE', 'search:miss', 0, 49, 'WITHSCORES'], ['LRANGE', 'notes', 0, 299],
    ]);
    const chapters = Object.keys(pairs(views));
    const depthRows = await pipeline(chapters.map(c => ['HGETALL', 'depth:' + c]));
    const answered = pairs(total);
    const qids = Object.keys(answered).sort((a, b) => answered[b] - answered[a]).slice(0, 400);
    const options = await pipeline(qids.map(q => ['HGETALL', 'ans:' + q]));
    const days = [];
    for (let i = 0; i < 28; i++) days.push(new Date(Date.now() - i * 86400000).toISOString().slice(0, 10));
    const daily = await pipeline(days.map(d => ['HGETALL', 'views:day:' + d]));
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      views: pairs(views),
      depth: Object.fromEntries(chapters.map((c, i) => [c, pairs(depthRows[i])])),
      questions: qids.map((q, i) => ({ id: q, total: answered[q], right: pairs(right)[q] || 0, options: pairs(options[i]) })),
      tips: pairs(tips), media: pairs(media), votes: { up: pairs(up), down: pairs(down) },
      searchMisses: pairs(miss),
      daily: days.map((d, i) => ({ day: d, views: Object.values(pairs(daily[i])).reduce((a, b) => a + b, 0) })),
      notes: (notes || []).map(n => { try { return JSON.parse(n); } catch { return null; } }).filter(Boolean),
    }));
  } catch {
    res.statusCode = 502; res.end('{"error":"read"}');
  }
};
