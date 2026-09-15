// Shared submission store for the tracker: a Vercel Function backed by Upstash Redis (REST).
// Every device reads and writes the same records, so data no longer lives in one browser only.
import { RESTORED_SUBMISSIONS } from '../src/data/restoredSubmissions.js';

const HASH = 'ama2026:tracker:v1';
const LOG = 'ama2026:tracker:log';
const META = '__meta__';
const STATUSES = new Set(['submitted', 'pending']);
const ID_PATTERN = /^[a-z0-9-]{1,64}$/;
const RESTORED_UPDATED_AT = Date.parse('2026-09-14T23:04:00+09:00');

const redisConfig = () => {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ''), token } : null;
};

async function redis(config, commands) {
  const res = await fetch(`${config.url}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands)
  });
  if (!res.ok) throw new Error(`Storage request failed (${res.status})`);
  const results = await res.json();
  const failed = results.find(r => r && r.error);
  if (failed) throw new Error(failed.error);
  return results.map(r => r.result);
}

const clip = (value, max) => (typeof value === 'string' ? value.slice(0, max) : '');

// Only accept the fields the tracker actually edits, with sane sizes.
function sanitize(record) {
  if (!record || typeof record !== 'object' || !STATUSES.has(record.status)) return null;
  const submitted = record.status === 'submitted';
  return {
    status: record.status,
    submittedAt: submitted ? clip(record.submittedAt, 32) : '',
    computerOS: submitted ? clip(record.computerOS, 32) : '',
    fileTypes: submitted && Array.isArray(record.fileTypes)
      ? record.fileTypes.filter(t => typeof t === 'string').slice(0, 12).map(t => t.slice(0, 24))
      : [],
    notes: clip(record.notes, 1000)
  };
}

function readMeta(flat) {
  for (let i = 0; i + 1 < (flat || []).length; i += 2) {
    if (flat[i] !== META) continue;
    try {
      return JSON.parse(flat[i + 1]) || {};
    } catch {
      return {};
    }
  }
  return {};
}

function toItems(flat) {
  const items = {};
  for (let i = 0; i + 1 < (flat || []).length; i += 2) {
    if (flat[i] === META) continue;
    try {
      items[flat[i]] = JSON.parse(flat[i + 1]);
    } catch {
      // skip a malformed field rather than failing the whole read
    }
  }
  return items;
}

// First use only: load the recovered 2026-09-14 submissions so no device starts empty.
async function seedOnce(config) {
  const [hasMeta] = await redis(config, [['HEXISTS', HASH, META]]);
  if (hasMeta) return;
  const commands = [['HSETNX', HASH, META, JSON.stringify({ seededAt: Date.now(), source: 'restored 2026-09-14' })]];
  for (const r of RESTORED_SUBMISSIONS) {
    const clean = sanitize(r);
    if (clean && ID_PATTERN.test(r.id)) {
      commands.push(['HSETNX', HASH, r.id, JSON.stringify({ ...clean, updatedAt: RESTORED_UPDATED_AT })]);
    }
  }
  await redis(config, commands);
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const config = redisConfig();
  if (!config) {
    return res.status(503).json({ configured: false, error: 'Server storage is not connected yet.' });
  }

  try {
    if (req.method === 'GET') {
      await seedOnce(config);
      const [flat] = await redis(config, [['HGETALL', HASH]]);
      return res.status(200).json({
        configured: true,
        items: toItems(flat),
        resetAt: readMeta(flat).resetAt || 0,
        serverTime: Date.now()
      });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

      // Reset keeps a full backup copy first, then marks the store so it is not re-seeded.
      if (body.reset === true) {
        const resetAt = Date.now();
        const backupKey = `ama2026:tracker:backup:${resetAt}`;
        const [flat] = await redis(config, [['HGETALL', HASH]]);
        const commands = [];
        if (flat && flat.length) commands.push(['HSET', backupKey, ...flat], ['DEL', HASH]);
        commands.push(
          ['HSET', HASH, META, JSON.stringify({ resetAt, backupKey })],
          ['LPUSH', LOG, JSON.stringify({ at: resetAt, action: 'reset', backupKey })],
          ['LTRIM', LOG, 0, 1999]
        );
        await redis(config, commands);
        return res.status(200).json({ ok: true, backupKey, resetAt });
      }

      const { id } = body;
      const clean = sanitize(body.record);
      if (typeof id !== 'string' || !ID_PATTERN.test(id) || !clean) {
        return res.status(400).json({ error: 'Send an id and a record with status "submitted" or "pending".' });
      }
      const stored = { ...clean, updatedAt: Date.now() };
      await redis(config, [
        ['HSET', HASH, id, JSON.stringify(stored)],
        ['LPUSH', LOG, JSON.stringify({ at: stored.updatedAt, id, ...clean })],
        ['LTRIM', LOG, 0, 1999]
      ]);
      return res.status(200).json({ ok: true, id, record: stored });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Use GET to read or POST to save.' });
  } catch (err) {
    return res.status(502).json({ configured: true, error: err.message || 'Storage error' });
  }
}
