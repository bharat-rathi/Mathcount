import { lockStatus } from './lib/blocking.js';

const $ = (id) => document.getElementById(id);

if (new URLSearchParams(location.search).get('why') === 'search') {
  $('title').textContent = 'Searching is turned off';
  $('msg').textContent = 'Search engines, AI chatbots and answer sites are blocked. Work it out on paper — you can do it!';
}
$('go').addEventListener('click', () => {
  location.href = chrome.runtime.getURL('app.html');
});
$('parent').addEventListener('click', () => {
  location.href = chrome.runtime.getURL('app.html#unlock');
});

// The background worker sends this tab back to its page after an unlock. If there's
// nothing to go back to, say that browsing is open again.
async function checkUnlocked() {
  const { state } = await chrome.storage.local.get('state');
  if (lockStatus(state).locked) return;
  setTimeout(() => {
    $('title').textContent = 'The browser is unlocked';
    $('msg').textContent = 'Type an address in the bar above, or open a new tab.';
  }, 800);
}
chrome.storage.onChanged.addListener((changes, area) => { if (area === 'local' && changes.state) checkUnlocked(); });
checkUnlocked();
