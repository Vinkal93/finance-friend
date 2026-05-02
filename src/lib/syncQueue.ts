/**
 * Offline-first sync queue.
 * Operations are queued in localStorage; flushed automatically when online.
 */

export type QueueOp =
  | { kind: 'ai-categorize'; payload: any; localId: string }
  | { kind: 'ai-chat'; payload: any; localId: string }
  | { kind: 'tx-change'; payload: any; localId: string };

const KEY = 'finance-sync-queue';

function readQ(): QueueOp[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}
function writeQ(q: QueueOp[]) {
  localStorage.setItem(KEY, JSON.stringify(q));
  window.dispatchEvent(new CustomEvent('sync-queue-changed', { detail: q.length }));
}

export function queueOp(op: QueueOp) {
  const q = readQ();
  q.push(op);
  writeQ(q);
}

export function getQueueSize(): number {
  return readQ().length;
}

export function clearQueue() {
  writeQ([]);
}

type Handler = (op: QueueOp) => Promise<boolean>;
const handlers: Record<QueueOp['kind'], Handler | undefined> = {
  'ai-categorize': undefined,
  'ai-chat': undefined,
  'tx-change': undefined,
};

export function registerHandler(kind: QueueOp['kind'], fn: Handler) {
  handlers[kind] = fn;
}

let flushing = false;

export async function flush(): Promise<void> {
  if (flushing || !navigator.onLine) return;
  flushing = true;
  try {
    let q = readQ();
    const remaining: QueueOp[] = [];
    for (const op of q) {
      const h = handlers[op.kind];
      if (!h) { remaining.push(op); continue; }
      try {
        const ok = await h(op);
        if (!ok) remaining.push(op);
      } catch {
        remaining.push(op);
      }
    }
    writeQ(remaining);
  } finally {
    flushing = false;
  }
}

export function startAutoSync() {
  window.addEventListener('online', () => flush());
  // Periodic flush every 30s while online
  setInterval(() => { if (navigator.onLine) flush(); }, 30000);
  // Initial flush after 2s
  setTimeout(() => flush(), 2000);
}
