import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Send, Copy, Check } from 'lucide-react';

// Live text relay between devices (phone -> computer).
// Messages pass through ntfy.sh with server-side caching turned off, and are
// end-to-end encrypted with a key derived from the shared connection code,
// so neither the relay nor other visitors of this page can read them.
const RELAY_URL = 'https://ntfy.sh';
const CODE_KEY = 'ama2026_memo_relay_code';
const MIN_CODE_LENGTH = 6;
const MAX_PAYLOAD_CHARS = 3900; // ntfy's message limit is 4096 bytes
const MAX_ITEMS = 50;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const toBase64 = (bytes) => {
  let binary = '';
  bytes.forEach(b => { binary += String.fromCharCode(b); });
  return btoa(binary);
};

const fromBase64 = (b64) => Uint8Array.from(atob(b64), c => c.charCodeAt(0));

async function deriveChannel(code) {
  const digest = new Uint8Array(
    await crypto.subtle.digest('SHA-256', encoder.encode(`ama2026-relay-topic:${code}`))
  );
  const topic = 'ama-relay-' + [...digest.slice(0, 16)].map(b => b.toString(16).padStart(2, '0')).join('');
  const material = await crypto.subtle.importKey('raw', encoder.encode(code), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: encoder.encode('ama2026-memo-relay'), iterations: 150000, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
  return { topic, key };
}

const deviceLabel = () => {
  const ua = navigator.userAgent;
  if (/iPhone/.test(ua)) return 'iPhone';
  if (/iPad/.test(ua)) return 'iPad';
  if (/Android/.test(ua)) return 'Android';
  if (/Macintosh/.test(ua)) return navigator.maxTouchPoints > 1 ? 'iPad' : 'Mac';
  if (/Windows/.test(ua)) return 'Windows';
  return 'Browser';
};

const formatTime = (ms) => {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const readStoredCode = () => {
  try {
    return localStorage.getItem(CODE_KEY) || '';
  } catch {
    return '';
  }
};

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fall through to the legacy path
    }
  }
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.top = '0';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.focus();
  area.select();
  area.setSelectionRange(0, text.length);
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  document.body.removeChild(area);
  return ok;
}

const STATUS_LABEL = {
  live: '연결됨',
  connecting: '연결 중…',
  offline: '연결 끊김',
  idle: ''
};

export function MemoRelay() {
  const [code, setCode] = useState(readStoredCode);
  const [codeDraft, setCodeDraft] = useState('');
  const [channel, setChannel] = useState(null);
  const [status, setStatus] = useState('idle');
  const [items, setItems] = useState([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [copyState, setCopyState] = useState(null); // { id, ok }
  const [reconnectKey, setReconnectKey] = useState(0);

  const clientId = useRef(Math.random().toString(36).slice(2) + Date.now().toString(36));
  const listRef = useRef(null);
  const inputRef = useRef(null);

  const addItem = useCallback((item) => {
    setItems(prev => [...prev, item].slice(-MAX_ITEMS));
  }, []);

  // Derive the relay topic and encryption key from the connection code
  useEffect(() => {
    let cancelled = false;
    setChannel(null);
    if (!code) {
      setStatus('idle');
      return undefined;
    }
    if (!window.crypto?.subtle) {
      setError('이 브라우저는 암호화를 지원하지 않아 연결할 수 없습니다. 최신 브라우저로 열어 주세요.');
      return undefined;
    }
    setStatus('connecting');
    deriveChannel(code).then(ch => {
      if (!cancelled) setChannel(ch);
    });
    return () => {
      cancelled = true;
    };
  }, [code]);

  // Live subscription: only devices with the page open receive messages
  useEffect(() => {
    if (!channel) return undefined;
    const source = new EventSource(`${RELAY_URL}/${channel.topic}/sse`);
    setStatus('connecting');
    source.onopen = () => setStatus('live');
    source.onerror = () => setStatus(source.readyState === EventSource.CLOSED ? 'offline' : 'connecting');
    source.onmessage = async (event) => {
      try {
        const envelope = JSON.parse(event.data);
        if (envelope.event !== 'message' || !envelope.message) return;
        const { iv, ct } = JSON.parse(envelope.message);
        const plain = await crypto.subtle.decrypt(
          { name: 'AES-GCM', iv: fromBase64(iv) },
          channel.key,
          fromBase64(ct)
        );
        const body = JSON.parse(decoder.decode(plain));
        if (body.cid === clientId.current) return; // our own message, already shown
        addItem({ id: envelope.id, text: body.t, from: body.from, at: body.at || Date.now(), mine: false });
      } catch {
        // Not a relay message for this code: ignore
      }
    };

    const onVisible = () => {
      if (document.visibilityState === 'visible' && source.readyState === EventSource.CLOSED) {
        setReconnectKey(k => k + 1);
      }
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      source.close();
    };
  }, [channel, reconnectKey, addItem]);

  // Keep the newest message in view
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [items]);

  const handleConnect = (e) => {
    e.preventDefault();
    const next = codeDraft.trim();
    if (next.length < MIN_CODE_LENGTH) {
      setError(`연결 코드는 ${MIN_CODE_LENGTH}자 이상으로 정해 주세요.`);
      return;
    }
    try {
      localStorage.setItem(CODE_KEY, next);
    } catch {
      // Private browsing: keep the code for this visit only
    }
    setError('');
    setItems([]);
    setCodeDraft('');
    setCode(next);
  };

  const handleChangeCode = () => {
    try {
      localStorage.removeItem(CODE_KEY);
    } catch {
      // ignore
    }
    setCode('');
    setItems([]);
    setError('');
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    const text = draft.trim();
    if (!text || !channel || sending) return;

    setSending(true);
    setError('');
    try {
      const at = Date.now();
      const plain = encoder.encode(JSON.stringify({ t: text, from: deviceLabel(), cid: clientId.current, at }));
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, channel.key, plain));
      const payload = JSON.stringify({ v: 1, iv: toBase64(iv), ct: toBase64(ct) });

      if (payload.length > MAX_PAYLOAD_CHARS) {
        setError('텍스트가 너무 깁니다. 나눠서 보내 주세요. (한글 약 900자, 영문 약 2,700자까지)');
        return;
      }

      const res = await fetch(`${RELAY_URL}/${channel.topic}?cache=no&firebase=no`, {
        method: 'POST',
        body: payload
      });
      if (res.status === 429) throw new Error('rate_limited');
      if (!res.ok) throw new Error(String(res.status));

      addItem({ id: `mine-${at}`, text, from: deviceLabel(), at, mine: true });
      setDraft('');
      if (inputRef.current) inputRef.current.style.height = '';
    } catch (err) {
      setError(
        err.message === 'rate_limited'
          ? '짧은 시간에 너무 많이 보냈습니다. 잠시 후 다시 보내 주세요.'
          : '보내지 못했습니다. 인터넷 연결을 확인하고 다시 보내 주세요.'
      );
    } finally {
      setSending(false);
    }
  };

  // Enter sends on computers; on phones Enter is a newline and the button sends.
  // isComposing guards Korean IME input (Enter confirms the syllable first).
  const handleKeyDown = (e) => {
    const finePointer = window.matchMedia?.('(hover: hover) and (pointer: fine)').matches;
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing && finePointer) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDraftChange = (e) => {
    setDraft(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  const handleCopy = async (item, textEl) => {
    const ok = await copyText(item.text);
    if (!ok && textEl) {
      // Clipboard blocked by the browser: select the text so it can be copied by hand
      const range = document.createRange();
      range.selectNodeContents(textEl);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
    setCopyState({ id: item.id, ok });
    setTimeout(() => setCopyState(cur => (cur?.id === item.id ? null : cur)), ok ? 1500 : 4000);
  };

  return (
    <section className="relay" aria-label="메모 릴레이">
      <div className="relay-head">
        <div className="relay-title-row">
          <h2 className="relay-title">메모 릴레이</h2>
          {code && (
            <span className={`relay-status is-${status}`}>
              <span className="relay-dot" aria-hidden="true" />
              {STATUS_LABEL[status]}
            </span>
          )}
        </div>
        {code && (
          <div className="relay-head-actions">
            {items.length > 0 && (
              <button type="button" className="link-btn" onClick={() => setItems([])}>
                목록 지우기
              </button>
            )}
            <button type="button" className="link-btn" onClick={handleChangeCode}>
              코드 변경
            </button>
          </div>
        )}
      </div>

      {!code ? (
        <form className="relay-connect" onSubmit={handleConnect}>
          <input
            className="text-input"
            type="text"
            value={codeDraft}
            onChange={(e) => setCodeDraft(e.target.value)}
            placeholder="연결 코드 (두 기기에 같은 코드)"
            aria-label="연결 코드"
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
          />
          <button type="submit" className="btn-primary">연결</button>
        </form>
      ) : (
        <>
          <div className="relay-list" ref={listRef} aria-live="polite">
            {items.length === 0 ? (
              <p className="relay-empty">다른 기기에서 보낸 텍스트가 여기에 바로 나타납니다.</p>
            ) : (
              items.map(item => {
                const copy = copyState?.id === item.id ? copyState : null;
                return (
                  <article key={item.id} className={`relay-item ${item.mine ? 'is-mine' : 'is-incoming'}`}>
                    <p className="relay-text">{item.text}</p>
                    <div className="relay-meta">
                      <span>
                        {item.mine ? '이 기기에서 보냄' : item.from} · {formatTime(item.at)}
                      </span>
                      <button
                        type="button"
                        className={`relay-copy ${copy ? (copy.ok ? 'is-copied' : 'is-selected') : ''}`}
                        onClick={(e) => handleCopy(item, e.currentTarget.closest('.relay-item').querySelector('.relay-text'))}
                        title={copy && !copy.ok ? '텍스트를 선택해 두었습니다. 길게 누르거나 Ctrl+C로 복사하세요.' : undefined}
                      >
                        {copy?.ok ? <Check size={13} strokeWidth={2.5} /> : <Copy size={13} />}
                        <span>{copy ? (copy.ok ? '복사됨' : '선택됨') : '복사'}</span>
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          <form className="relay-compose" onSubmit={handleSend}>
            <textarea
              ref={inputRef}
              className="relay-input"
              rows={1}
              value={draft}
              onChange={handleDraftChange}
              onKeyDown={handleKeyDown}
              placeholder="보낼 텍스트"
              aria-label="보낼 텍스트"
            />
            <button type="submit" className="btn-primary relay-send" disabled={!draft.trim() || sending}>
              <Send size={15} />
              <span>{sending ? '보내는 중' : '보내기'}</span>
            </button>
          </form>
        </>
      )}

      {error && <p className="relay-error" role="alert">{error}</p>}
    </section>
  );
}
