// Service worker: keeps the browser locked to the practice app unless a parent
// (or a finished daily set, if enabled) has unlocked it.

import { buildRules, isUrlAllowed, lockStatus } from './lib/blocking.js';

const APP_URL = chrome.runtime.getURL('app.html');
const BLOCKED_URL = chrome.runtime.getURL('blocked.html');
const ORIGIN = chrome.runtime.getURL('');

async function getState() {
  const { state } = await chrome.storage.local.get('state');
  return state || null;
}

let current = lockStatus(null);
let chain = Promise.resolve();

// Serialize: overlapping updates could otherwise try to add the same rule IDs twice.
function applyLock() {
  chain = chain.then(doApplyLock).catch((e) => console.error('applyLock failed', e));
  return chain;
}

async function doApplyLock() {
  const state = await getState();
  current = lockStatus(state);

  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: existing.map((r) => r.id),
    addRules: buildRules(current),
  });

  await chrome.alarms.clear('relock');
  if (!current.locked) chrome.alarms.create('relock', { when: current.until + 500 });

  await sweepTabs();
}

// The practice app shows up either as app.html or as Chrome's new-tab page (which it replaces).
function isAppTab(tab) {
  const url = tab.pendingUrl || tab.url || '';
  return url.startsWith(APP_URL) || url.startsWith('chrome://newtab');
}

// Tabs that aren't allowed switch to the "locked" page in place. Nothing is ever
// closed, so no window disappears. If there's no practice tab yet, the first
// blocked tab becomes the practice app.
async function sweepTabs() {
  if (!current.locked) return;
  const tabs = await chrome.tabs.query({});
  const bad = tabs.filter((t) => !isUrlAllowed(t.pendingUrl || t.url, current, ORIGIN));
  if (!bad.length) return;
  const hasApp = tabs.some(isAppTab);
  for (const [i, t] of bad.entries()) {
    const url = !hasApp && i === 0 ? APP_URL : BLOCKED_URL;
    await chrome.tabs.update(t.id, { url }).catch(() => {});
  }
}

async function focusTab(tab) {
  await chrome.tabs.update(tab.id, { active: true }).catch(() => {});
  await chrome.windows.update(tab.windowId, { focused: true }).catch(() => {});
}

function redirect(tabId) {
  chrome.tabs.update(tabId, { url: BLOCKED_URL }).catch(() => {});
}

async function openApp() {
  const tabs = await chrome.tabs.query({});
  const app = tabs.find(isAppTab);
  if (app) await focusTab(app);
  else await chrome.tabs.create({ url: APP_URL });
}

chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
  const url = info.url || (info.status === 'loading' ? tab.pendingUrl || tab.url : null);
  if (url && !isUrlAllowed(url, current, ORIGIN)) redirect(tabId);
});

chrome.tabs.onCreated.addListener((tab) => {
  const url = tab.pendingUrl || tab.url;
  if (url && !isUrlAllowed(url, current, ORIGIN)) redirect(tab.id);
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.state) {
    const before = JSON.stringify(lockStatus(changes.state.oldValue));
    const after = JSON.stringify(lockStatus(changes.state.newValue));
    if (before !== after) applyLock();
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'relock' || alarm.name === 'heartbeat') applyLock();
});

chrome.runtime.onInstalled.addListener(async () => {
  chrome.alarms.create('heartbeat', { periodInMinutes: 1 });
  await applyLock();
  openApp();
});

chrome.runtime.onStartup.addListener(async () => {
  chrome.alarms.create('heartbeat', { periodInMinutes: 1 });
  await applyLock();
  openApp();
});

chrome.action.onClicked.addListener(openApp);

chrome.runtime.onMessage.addListener((msg, _sender, reply) => {
  if (msg?.type === 'applyLock') applyLock().then(() => reply({ ok: true }));
  if (msg?.type === 'openApp') openApp().then(() => reply({ ok: true }));
  return true;
});

// Service workers restart often; make sure rules match stored state every time we wake.
applyLock();
