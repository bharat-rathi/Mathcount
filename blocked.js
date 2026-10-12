if (new URLSearchParams(location.search).get('why') === 'search') {
  document.getElementById('title').textContent = 'Searching is turned off';
  document.getElementById('msg').textContent = 'Search engines, AI chatbots and answer sites are blocked. Work it out on paper — you can do it!';
}
document.getElementById('go').addEventListener('click', () => {
  location.href = chrome.runtime.getURL('app.html');
});
document.getElementById('parent').addEventListener('click', () => {
  location.href = chrome.runtime.getURL('app.html#parent');
});
