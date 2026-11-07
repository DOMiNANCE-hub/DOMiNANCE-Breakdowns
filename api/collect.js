// Receives small, anonymous batches of reading events from the site.
// Nothing personal is stored: no names, no accounts, no IP addresses (an hourly hash of the address
// is kept for two minutes only, to stop flooding). Free text is limited to feedback the student types.
const crypto = require('crypto');
const { connected, pipeline } = require('./_store');

const SLUG = /^[a-z0-9-]{2,40}$/;
const ID = /^[a-z0-9-]{1,40}:[0-9a-f]{8}$/;
const SECTION = /^[a-z0-9-]{1,120}$/;
const short = (v, n) => String(v ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n);

function commandsFor(e) {
  const day = new Date().toISOString().slice(0, 10);
  switch (e.t) {
    case 'view':
      if (!SLUG.test(e.c)) return [];
      return [['HINCRBY', 'views', e.c, 1], ['HINCRBY', 'views:day:' + day, e.c, 1], ['EXPIRE', 'views:day:' + day, 60 * 86400]];
    case 'depth': {
      const d = [25, 50, 75, 100].includes(e.d) ? e.d : null;
      return SLUG.test(e.c) && d ? [['HINCRBY', 'depth:' + e.c, String(d), 1]] : [];
    }
    case 'answer':
      if (!ID.test(e.q) || !/^[A-F]$/.test(e.o)) return [];
      return [['HINCRBY', 'ans:' + e.q, e.o, 1], ['HINCRBY', 'ans:total', e.q, 1], ...(e.ok ? [['HINCRBY', 'ans:right', e.q, 1]] : [])];
    case 'tip':
      return /^[a-z0-9-]{1,40}$/.test(e.k) ? [['HINCRBY', 'tips', e.k, 1]] : [];
    case 'miss': {
      const term = short(e.s, 60).toLowerCase();
      return term.length >= 2 ? [['ZINCRBY', 'search:miss', 1, term]] : [];
    }
    case 'media':
      return /^[\w-]{3,40}$/.test(e.m) ? [['HINCRBY', 'media', e.m, 1]] : [];
    case 'vote':
      if (!SLUG.test(e.c) || !['up', 'down'].includes(e.v)) return [];
      return [['HINCRBY', 'votes:' + e.v, e.c, 1]];
    case 'note': {
      const text = short(e.x, 1000);
      if (!SLUG.test(e.c) || text.length < 2) return [];
      const kind = ['unclear', 'problem', 'question'].includes(e.k) ? e.k : 'problem';
      const item = { kind, chapter: e.c, section: SECTION.test(e.s || '') ? e.s : '', question: ID.test(e.q || '') ? e.q : '', text, at: new Date().toISOString() };
      return [['LPUSH', 'notes', JSON.stringify(item)], ['LTRIM', 'notes', 0, 4999]];
    }
    default:
      return [];
  }
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.statusCode = 405; return res.end(); }
  if (!connected()) { res.statusCode = 503; return res.end('not connected'); }
  let body = req.body;
  try { if (typeof body === 'string') body = JSON.parse(body); } catch { body = null; }
  const events = Array.isArray(body?.events) ? body.events.slice(0, 60) : [];
  if (!events.length) { res.statusCode = 400; return res.end(); }
  try {
    const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0];
    const who = crypto.createHash('sha256').update(ip + new Date().toISOString().slice(0, 13)).digest('hex').slice(0, 16);
    const minute = Math.floor(Date.now() / 60000);
    const [count] = await pipeline([['INCRBY', `rl:${who}:${minute}`, events.length], ['EXPIRE', `rl:${who}:${minute}`, 120]]);
    if (count > 400) { res.statusCode = 429; return res.end(); }
    await pipeline(events.flatMap(e => (e && typeof e === 'object' ? commandsFor(e) : [])));
    res.statusCode = 204; res.end();
  } catch {
    res.statusCode = 502; res.end();
  }
};
module.exports.commandsFor = commandsFor;
