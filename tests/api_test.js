// Feedback endpoints, tested against a small in-memory stand-in for the Upstash Redis REST API.
'use strict';
const http = require('http');
const assert = require('assert');
const path = require('path');

const db = new Map();
const hash = k => { if (!db.has(k)) db.set(k, new Map()); return db.get(k); };
function run([cmd, ...a]) {
  switch (cmd) {
    case 'HINCRBY': { const h = hash(a[0]); h.set(a[1], (Number(h.get(a[1])) || 0) + Number(a[2])); return h.get(a[1]); }
    case 'HGETALL': return db.has(a[0]) ? [...db.get(a[0])].flat().map(String) : [];
    case 'INCRBY': { const v = (Number(db.get(a[0])) || 0) + Number(a[1]); db.set(a[0], v); return v; }
    case 'EXPIRE': return 1;
    case 'ZINCRBY': { const h = hash(a[0]); h.set(a[2], (Number(h.get(a[2])) || 0) + Number(a[1])); return h.get(a[2]); }
    case 'ZREVRANGE': return db.has(a[0]) ? [...db.get(a[0])].sort((x, y) => y[1] - x[1]).slice(Number(a[1]), Number(a[2]) + 1).flat().map(String) : [];
    case 'LPUSH': { if (!db.has(a[0])) db.set(a[0], []); db.get(a[0]).unshift(a[1]); return db.get(a[0]).length; }
    case 'LTRIM': return 'OK';
    case 'LRANGE': return (db.get(a[0]) || []).slice(Number(a[1]), Number(a[2]) + 1);
    default: throw new Error('unexpected command ' + cmd);
  }
}

(async () => {
  const redis = http.createServer((req, res) => {
    let body = '';
    req.on('data', c => (body += c));
    req.on('end', () => {
      assert.strictEqual(req.headers.authorization, 'Bearer test-token');
      const cmds = JSON.parse(body);
      cmds.forEach(c => c.forEach(x => assert.strictEqual(typeof x, 'string', 'every argument is sent as a string')));
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(cmds.map(c => ({ result: run(c) }))));
    });
  });
  await new Promise(r => redis.listen(0, '127.0.0.1', r));

  const call = async (handler, { method = 'POST', body, headers = {} } = {}) => {
    const out = { statusCode: 200, headers: {}, body: '' };
    const res = { setHeader: (k, v) => (out.headers[k.toLowerCase()] = v), end: b => (out.body = b || '') };
    Object.defineProperty(res, 'statusCode', { set: v => (out.statusCode = v), get: () => out.statusCode });
    await handler({ method, body, headers }, res);
    return out;
  };
  const fresh = () => { for (const k of Object.keys(require.cache)) if (k.includes(path.sep + 'api' + path.sep)) delete require.cache[k]; };

  // Not connected yet: the site keeps working, nothing is stored.
  delete process.env.KV_REST_API_URL; delete process.env.KV_REST_API_TOKEN;
  fresh();
  assert.strictEqual((await call(require('../api/collect'), { body: { events: [{ t: 'view', c: 'reflexes' }] } })).statusCode, 503);

  process.env.KV_REST_API_URL = `http://127.0.0.1:${redis.address().port}`;
  process.env.KV_REST_API_TOKEN = 'test-token';
  process.env.STATS_KEY = 'secret-key';
  fresh();
  const collect = require('../api/collect');
  const stats = require('../api/stats');

  assert.strictEqual((await call(collect, { method: 'GET' })).statusCode, 405);
  assert.strictEqual((await call(collect, { body: 'not json' })).statusCode, 400);
  const events = [
    { t: 'view', c: 'reflexes' }, { t: 'view', c: 'reflexes' }, { t: 'depth', c: 'reflexes', d: 75 },
    { t: 'answer', q: 'reflexes:1a2b3c4d', o: 'C', ok: 1 }, { t: 'answer', q: 'reflexes:1a2b3c4d', o: 'A', ok: 0 },
    { t: 'tip', k: 'baroreceptors' }, { t: 'miss', s: '  Bainbridge Reflex  ' }, { t: 'media', m: 'v7Q9BrNfIpQ' },
    { t: 'vote', c: 'reflexes', v: 'down' },
    { t: 'note', k: 'unclear', c: 'reflexes', s: '6-the-cushing-reflex-when-the-brain-is-squeezed', q: '', x: 'Why does the heart slow?' },
    // rejected: bad chapter, bad option, script in a field, unknown type
    { t: 'view', c: '../etc' }, { t: 'answer', q: 'reflexes:1a2b3c4d', o: 'Z' }, { t: 'note', c: 'reflexes', x: '' }, { t: 'hack' },
  ];
  assert.strictEqual((await call(collect, { body: JSON.stringify({ events }) })).statusCode, 204, 'a sendBeacon text body is accepted');

  assert.strictEqual((await call(stats, { method: 'GET' })).statusCode, 401, 'stats need the key');
  assert.strictEqual((await call(stats, { method: 'GET', headers: { 'x-stats-key': 'wrong-key!' } })).statusCode, 401);
  const out = await call(stats, { method: 'GET', headers: { 'x-stats-key': 'secret-key' } });
  assert.strictEqual(out.statusCode, 200);
  const d = JSON.parse(out.body);
  assert.deepStrictEqual(d.views, { reflexes: 2 });
  assert.deepStrictEqual(d.depth.reflexes, { 75: 1 });
  assert.deepStrictEqual(d.questions, [{ id: 'reflexes:1a2b3c4d', total: 2, right: 1, options: { C: 1, A: 1 } }]);
  assert.deepStrictEqual(d.tips, { baroreceptors: 1 });
  assert.deepStrictEqual(d.searchMisses, { 'bainbridge reflex': 1 });
  assert.deepStrictEqual(d.votes, { up: {}, down: { reflexes: 1 } });
  assert.strictEqual(d.notes.length, 1);
  assert.strictEqual(d.notes[0].text, 'Why does the heart slow?');
  assert.strictEqual(d.daily[0].views, 2);
  assert.ok(!JSON.stringify([...db.keys()]).includes('127.0.0.1'), 'no addresses are stored');

  redis.close();
  console.log('PASS feedback endpoints');
})().catch(e => { console.error(e); process.exit(1); });
