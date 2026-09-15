// Client side of the shared tracker store (/api/tracker).
// Once the server is connected it is the source of truth; until then the app keeps
// working from this browser's storage. Writes that fail are queued and retried.

const API = '/api/tracker';
const QUEUE_KEY = 'ama2026_sync_queue_v1';

export const pickRecord = (s = {}) => ({
  status: s.status === 'submitted' ? 'submitted' : 'pending',
  submittedAt: s.submittedAt || '',
  computerOS: s.computerOS || '',
  fileTypes: Array.isArray(s.fileTypes) ? s.fileTypes : [],
  notes: s.notes || ''
});

export const sameRecord = (a, b) => JSON.stringify(pickRecord(a)) === JSON.stringify(pickRecord(b));

async function request(options) {
  const res = await fetch(API, { cache: 'no-store', ...options });
  if (res.status === 503) return { configured: false };
  if (!res.ok) throw new Error(`Server responded ${res.status}`);
  return { configured: true, ...(await res.json()) };
}

export const fetchServerState = () => request({ headers: { Accept: 'application/json' } });

export const saveServerRecord = (id, record) => request({
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ id, record: pickRecord(record) })
});

export const resetServerState = () => request({
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ reset: true })
});

export function loadQueue() {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '{}') || {};
  } catch {
    return {};
  }
}

export function saveQueue(queue) {
  try {
    if (Object.keys(queue).length) localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    else localStorage.removeItem(QUEUE_KEY);
  } catch {
    // storage unavailable: the in-memory queue still retries this session
  }
}
