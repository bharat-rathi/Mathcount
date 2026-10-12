// chrome.storage wrapper + parent PIN hashing.

import { newState, DEFAULT_SETTINGS } from './engine.js';

const hasChrome = typeof chrome !== 'undefined' && chrome.storage?.local;

export async function loadState() {
  let state = null;
  if (hasChrome) state = (await chrome.storage.local.get('state')).state;
  else state = JSON.parse(localStorage.getItem('mc-state') || 'null');
  if (!state) state = newState();
  state.settings = { ...DEFAULT_SETTINGS, ...state.settings };
  return state;
}

export async function saveState(state) {
  if (hasChrome) await chrome.storage.local.set({ state });
  else localStorage.setItem('mc-state', JSON.stringify(state));
}

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function setPin(state, pin) {
  const salt = crypto.getRandomValues(new Uint32Array(4)).join('-');
  state.parent = { pinHash: await sha256(`${salt}:${pin}`), salt, failures: 0, lockedUntil: 0 };
}

// Slows down guessing: after 5 wrong PINs, wait a minute (doubling each time).
export async function verifyPin(state, pin) {
  const p = state.parent;
  if (!p?.pinHash) return { ok: false };
  if (p.lockedUntil && Date.now() < p.lockedUntil) {
    return { ok: false, wait: Math.ceil((p.lockedUntil - Date.now()) / 1000) };
  }
  const ok = (await sha256(`${p.salt}:${pin}`)) === p.pinHash;
  if (ok) p.failures = 0;
  else {
    p.failures = (p.failures || 0) + 1;
    if (p.failures >= 5) p.lockedUntil = Date.now() + 60000 * 2 ** Math.min(p.failures - 5, 6);
  }
  await saveState(state);
  return { ok };
}
