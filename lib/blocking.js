// Which pages the browser may show, and the declarativeNetRequest rules that enforce it.

// Search engines, AI chatbots and homework-answer sites. Blocked whenever the browser is
// locked, and (by default) even during unlocked time, so practice answers can't be looked up.
export const SEARCH_DOMAINS = [
  'bing.com', 'duckduckgo.com', 'search.yahoo.com', 'yandex.com', 'yandex.ru', 'baidu.com', 'ecosia.org',
  'search.brave.com', 'startpage.com', 'ask.com', 'you.com', 'kagi.com', 'qwant.com', 'dogpile.com',
  'perplexity.ai', 'chatgpt.com', 'chat.openai.com', 'claude.ai', 'gemini.google.com', 'bard.google.com',
  'copilot.microsoft.com', 'poe.com', 'character.ai', 'deepseek.com', 'chat.deepseek.com', 'meta.ai', 'grok.com',
  'wolframalpha.com', 'mathway.com', 'symbolab.com', 'photomath.com', 'photomath.app', 'brainly.com',
  'chegg.com', 'socratic.org', 'quizlet.com', 'lens.google.com', 'mathsolver.microsoft.com', 'gauthmath.com',
  'questionai.com', 'coursehero.com',
];

export const SEARCH_REGEXES = [
  // Google search, image search and the Google home page (search box)
  '^https?://([a-z0-9-]+\\.)?google\\.[a-z.]+/(search|webhp|imgres|url|complete)',
  '^https?://(www\\.)?google\\.[a-z.]+/?(\\?.*)?$',
  // YouTube search results
  '^https?://([a-z0-9-]+\\.)?youtube\\.com/results',
];

const RULE = { REDIRECT_ALL: 1, BLOCK_FRAMES: 2, ALLOW_BASE: 100, SEARCH_DOMAINS: 500, SEARCH_REGEX_BASE: 510 };
const WEB = ['main_frame', 'sub_frame'];

export function cleanDomain(input) {
  return String(input || '')
    .trim()
    .toLowerCase()
    .replace(/^[a-z]+:\/\//, '')
    .replace(/\/.*$/, '')
    .replace(/:\d+$/, '')
    .replace(/^www\./, '');
}

export function lockStatus(state, now = Date.now()) {
  // Nothing is locked until a parent has finished setup (set the PIN).
  if (!state?.parent?.pinHash) {
    return { locked: false, mode: 'setup', until: 0, allowlist: [], blockSearch: false };
  }
  const lock = state?.lock || {};
  const unlocked = lock.unlockedUntil > now;
  return {
    locked: !unlocked,
    mode: unlocked ? lock.mode || 'parent' : 'locked',
    until: unlocked ? lock.unlockedUntil : 0,
    allowlist: (state?.settings?.allowlist || []).map(cleanDomain).filter(Boolean),
    blockSearch: !unlocked || state?.settings?.blockSearchWhenUnlocked !== false,
  };
}

// blockedPage: full URL of blocked.html. The redirect keeps the original address in
// ?from= so the tab can go back to it after an unlock.
export function buildRules(status, blockedPage = null) {
  const rules = [];
  if (status.locked) {
    rules.push({
      id: RULE.REDIRECT_ALL, priority: 1,
      action: { type: 'redirect', redirect: blockedPage ? { regexSubstitution: `${blockedPage}?from=\\0` } : { extensionPath: '/blocked.html' } },
      condition: { regexFilter: '^https?://.*$', resourceTypes: ['main_frame'] },
    });
    rules.push({
      id: RULE.BLOCK_FRAMES, priority: 1,
      action: { type: 'block' },
      condition: { regexFilter: '^https?://', resourceTypes: ['sub_frame'] },
    });
    status.allowlist.forEach((domain, i) => {
      rules.push({
        id: RULE.ALLOW_BASE + i, priority: 2,
        action: { type: 'allow' },
        condition: { requestDomains: [domain], resourceTypes: WEB },
      });
    });
  }
  if (status.blockSearch) {
    rules.push({
      id: RULE.SEARCH_DOMAINS, priority: 3,
      action: { type: 'redirect', redirect: { extensionPath: '/blocked.html?why=search' } },
      condition: { requestDomains: SEARCH_DOMAINS, resourceTypes: ['main_frame'] },
    });
    SEARCH_REGEXES.forEach((re, i) => {
      rules.push({
        id: RULE.SEARCH_REGEX_BASE + i, priority: 3,
        action: { type: 'redirect', redirect: { extensionPath: '/blocked.html?why=search' } },
        condition: { regexFilter: re, resourceTypes: ['main_frame'] },
      });
    });
  }
  return rules;
}

export function isNewTabUrl(url) {
  return /^(chrome:\/\/(newtab|new-tab-page)|chrome-search:\/\/)/.test(url || '');
}

function hostMatches(host, domain) {
  return host === domain || host.endsWith('.' + domain);
}

// Second line of defense for pages declarativeNetRequest can't touch (chrome://, the Web
// Store, file://) and for tabs that were already open when the lock turned on.
export function isUrlAllowed(url, status, extensionOrigin) {
  if (!url) return true;
  if (url.startsWith(extensionOrigin)) return true;
  if (url === 'about:blank') return true;
  // Chrome's own new-tab page: fine when unlocked; while locked the background
  // worker sends it to the practice tab instead.
  if (isNewTabUrl(url)) return !status.locked;

  let u;
  try { u = new URL(url); } catch { return false; }
  const host = u.hostname.replace(/^www\./, '');

  if (u.protocol === 'http:' || u.protocol === 'https:') {
    if (status.blockSearch) {
      if (SEARCH_DOMAINS.some((d) => hostMatches(host, d))) return false;
      if (SEARCH_REGEXES.some((re) => new RegExp(re).test(url))) return false;
    }
    if (!status.locked) return true;
    return status.allowlist.some((d) => hostMatches(host, d));
  }

  // chrome://, edge://, devtools://, view-source:, file://, other extensions, the Web Store…
  // Only a parent unlock (or first-time setup) opens these, so the extension can't be
  // switched off during reward time.
  return status.mode === 'parent' || status.mode === 'setup';
}
