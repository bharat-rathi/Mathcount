// Service worker: keeps the browser locked to the practice app unless a parent
// (or a finished daily set, if enabled) has unlocked it.

import { buildRules, isUrlAllowed, isNewTabUrl, lockStatus } from './lib/blocking.js';

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
    addRules: buildRules(current, BLOCKED_URL),
  });

  await chrome.alarms.clear('relock');
  if (!current.locked) chrome.alarms.create('relock', { when: current.until + 500 });

  const wasLocked = lastLocked !== false;
  lastLocked = current.locked;
  if (current.locked) await sweepTabs();
  else if (wasLocked) await restoreBlockedTabs();
}

let lastLocked = null;

// After an unlock, tabs showing the "locked" page go back to the page they were on.
// Search pages stay put when search is still blocked.
async function restoreBlockedTabs() {
  const tabs = (await chrome.tabs.query({})).filter((t) => (t.url || '').startsWith(BLOCKED_URL));
  for (const t of tabs) {
    if ((t.url || '').includes('why=search') && current.blockSearch) continue;
    const from = fromOf(t.url);
    await chrome.tabs.update(t.id, { url: from || 'chrome://newtab/' }).catch(() => {});
  }
}

function isAppTab(tab) {
  return (tab.pendingUrl || tab.url || '').startsWith(APP_URL);
}

// While locked, a new tab or window goes to the one practice tab instead of
// opening another copy. A new tab next to other tabs is folded into the
// existing practice tab; a new window keeps its tab (as the practice app if
// there is none yet, otherwise as the "locked" page) so the window stays open.
async function handleNewTab(tab) {
  if (!current.locked) return;
  const tabs = await chrome.tabs.query({});
  const app = tabs.find((t) => t.id !== tab.id && isAppTab(t));
  const alone = !tabs.some((t) => t.windowId === tab.windowId && t.id !== tab.id);
  if (!app) await chrome.tabs.update(tab.id, { url: APP_URL }).catch(() => {});
  else if (alone) await chrome.tabs.update(tab.id, { url: BLOCKED_URL }).catch(() => {});
  else {
    await focusTab(app);
    await chrome.tabs.remove(tab.id).catch(() => {});
  }
}

// Tabs that aren't allowed switch to the "locked" page in place. Nothing is ever
// closed, so no window disappears. If there's no practice tab yet, the first
// blocked tab becomes the practice app.
async function sweepTabs() {
  if (!current.locked) return;
  const tabs = await chrome.tabs.query({});
  const bad = tabs.filter((t) => !isUrlAllowed(t.pendingUrl || t.url, current, ORIGIN));
  if (!bad.length) return;
  let hasApp = tabs.some(isAppTab);
  for (const t of bad) {
    if (isNewTabUrl(t.pendingUrl || t.url)) { await handleNewTab(t); hasApp = true; continue; }
    await chrome.tabs.update(t.id, { url: hasApp ? blockedUrlFor(t.pendingUrl || t.url) : APP_URL }).catch(() => {});
    hasApp = true;
  }
}

async function focusTab(tab) {
  await chrome.tabs.update(tab.id, { active: true }).catch(() => {});
  await chrome.windows.update(tab.windowId, { focused: true }).catch(() => {});
}

// The "locked" page remembers the address it replaced (after ?from=).
function blockedUrlFor(url) {
  return /^https?:/.test(url || '') ? `${BLOCKED_URL}?from=${url}` : BLOCKED_URL;
}
function fromOf(url) {
  const i = (url || '').indexOf('?from=');
  return i === -1 ? null : url.slice(i + 6);
}

function redirect(tabId, url) {
  chrome.tabs.update(tabId, { url: blockedUrlFor(url) }).catch(() => {});
}

async function openApp() {
  const tabs = await chrome.tabs.query({});
  const app = tabs.find(isAppTab);
  if (app) await focusTab(app);
  else await chrome.tabs.create({ url: APP_URL });
}

function checkTab(tab, url) {
  if (!url || isUrlAllowed(url, current, ORIGIN)) return;
  if (isNewTabUrl(url)) handleNewTab(tab);
  else redirect(tab.id, url);
}

chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
  checkTab(tab, info.url || (info.status === 'loading' ? tab.pendingUrl || tab.url : null));
});

chrome.tabs.onCreated.addListener((tab) => checkTab(tab, tab.pendingUrl || tab.url));

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
  if (current.locked) openApp(); // when unlocked, Chrome starts normally
});

chrome.action.onClicked.addListener(openApp);

chrome.runtime.onMessage.addListener((msg, _sender, reply) => {
  if (msg?.type === 'applyLock') applyLock().then(() => reply({ ok: true }));
  if (msg?.type === 'openApp') openApp().then(() => reply({ ok: true }));
  return true;
});

// Service workers restart often; make sure rules match stored state every time we wake.
applyLock();
