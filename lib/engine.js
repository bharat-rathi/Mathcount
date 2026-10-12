// Progress tracking, adaptive question selection, streaks and badges.
// All functions take and mutate a plain `state` object so they're easy to test.

import { TOPICS, TOPIC_BY_ID, generateQuestion } from './topics.js';
import { checkAnswer, matchesValue, specToString, specValue } from './answers.js';

export const DEFAULT_SETTINGS = {
  questionsPerDay: 10,
  afterDaily: 'day', // after the daily set: 'day' = unlocked until midnight, 'minutes' = for rewardUnlockMinutes, 'locked' = parent must unlock
  rewardUnlockMinutes: 60,
  allowlist: [], // domains always reachable, e.g. "classroom.google.com"
  blockSearchWhenUnlocked: true,
};

export function newState() {
  return {
    version: 1,
    profile: { name: '', createdAt: Date.now() },
    parent: { pinHash: null, salt: null },
    settings: { ...DEFAULT_SETTINGS },
    lock: { unlockedUntil: 0, mode: 'locked' }, // mode: locked | parent | reward
    topics: {},
    days: {}, // 'YYYY-MM-DD' → { completed, correct, total, minutes }
    session: null,
    streaks: { day: { current: 0, best: 0, lastDate: null }, correct: { current: 0, best: 0 } },
    xp: 0,
    badges: {}, // badgeId → date earned
    log: [], // compact history of answered questions (capped)
    misses: [], // recent wrong answers with the question text, for the parent dashboard
  };
}

export function dateKey(d = new Date()) {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function daysBetween(a, b) {
  const [y1, m1, d1] = a.split('-').map(Number);
  const [y2, m2, d2] = b.split('-').map(Number);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000);
}

export function topicStats(state, id) {
  if (!state.topics[id]) {
    state.topics[id] = { attempts: 0, correct: 0, level: 1, mastery: 0.5, recent: [], lastSeen: null, runAtLevel: 0, missRun: 0, missedVariants: {}, everLow: false };
  }
  return state.topics[id];
}

// Accuracy over the last few attempts (null if not enough data).
export function recentAccuracy(t, n = 10) {
  const r = t.recent.slice(-n);
  return r.length ? r.reduce((a, b) => a + b, 0) / r.length : null;
}

// ─────────────────────────────── Daily set selection

export function buildDailySet(state, today, rand = Math.random) {
  const count = state.settings.questionsPerDay || 10;
  const picks = [];
  const perTopic = {};

  // 1. Redemption: re-try question types missed recently (fresh numbers).
  const missed = [];
  for (const id of Object.keys(state.topics)) {
    const t = state.topics[id];
    if (!TOPIC_BY_ID[id]) continue;
    for (const [vid, info] of Object.entries(t.missedVariants || {})) missed.push({ id, vid, when: info.when });
  }
  missed.sort((a, b) => (a.when < b.when ? 1 : -1));
  for (const m of missed.slice(0, Math.min(2, Math.floor(count / 4)))) {
    picks.push({ topicId: m.id, variantId: m.vid, review: true });
    perTopic[m.id] = (perTopic[m.id] || 0) + 1;
  }

  // 2. Weighted by weakness, staleness, and novelty.
  const scored = TOPICS.map((topic) => {
    const t = topicStats(state, topic.id);
    const weakness = 1 - t.mastery;
    const stale = t.lastSeen ? Math.min(daysBetween(t.lastSeen, today), 14) / 14 : 1;
    const novelty = t.attempts === 0 ? 0.6 : 0;
    return { id: topic.id, weight: 0.15 + 4 * weakness * weakness + stale * 0.6 + novelty, weakness };
  });

  while (picks.length < count) {
    const pool = scored.filter((s) => (perTopic[s.id] || 0) < (s.weakness > 0.45 ? 2 : 1));
    const use = pool.length ? pool : scored;
    const total = use.reduce((a, s) => a + s.weight, 0);
    let x = rand() * total;
    let chosen = use[use.length - 1];
    for (const s of use) { x -= s.weight; if (x <= 0) { chosen = s; break; } }
    picks.push({ topicId: chosen.id });
    perTopic[chosen.id] = (perTopic[chosen.id] || 0) + 1;
  }

  const questions = picks.map((p) => {
    const t = topicStats(state, p.topicId);
    const seed = Math.floor(rand() * 2 ** 31);
    const q = generateQuestion(p.topicId, t.level, seed, p.variantId);
    return { ...q, review: !!p.review };
  });

  // Easier first, like a real Sprint Round.
  questions.sort((a, b) => a.level - b.level);
  return questions;
}

export function buildExtraSet(state, rand = Math.random, n = 5) {
  // Bonus practice: the weakest topic(s), at current level.
  const ranked = TOPICS.map((t) => ({ id: t.id, m: topicStats(state, t.id).mastery })).sort((a, b) => a.m - b.m);
  const top = ranked.slice(0, 2);
  return Array.from({ length: n }, (_, i) => {
    const id = top[i % top.length].id;
    return generateQuestion(id, topicStats(state, id).level, Math.floor(rand() * 2 ** 31));
  });
}

export function startSession(state, today, kind = 'daily', rand = Math.random) {
  const questions = kind === 'daily' ? buildDailySet(state, today, rand) : buildExtraSet(state, rand);
  state.session = { date: today, kind, index: 0, questions, results: [], startedAt: Date.now(), questionStartedAt: Date.now(), xpStart: state.xp };
  return state.session;
}

// ─────────────────────────────── Grading

export function explainWrong(q, raw, check) {
  const lines = [];
  if (check.unreadable) {
    lines.push(`I couldn't read "${raw}" as a number. Use digits, a fraction like 3/4, √ or π.`);
  } else if (check.formIssue) {
    lines.push(check.formIssue);
  } else {
    const hit = (q.mistakes || []).find((m) => !matchesValue({ value: specValue(q.answer) }, m.value) && matchesValue(check.parsed, m.value));
    if (hit) lines.push(hit.why);
    else if (check.parsed) {
      const target = specValue(q.answer);
      const ratio = check.parsed.value / target;
      if (Math.abs(check.parsed.value + target) < 1e-9 && target !== 0) lines.push('Right size, wrong sign. Check each minus sign carefully.');
      else if ([10, 100, 0.1, 0.01].some((k) => Math.abs(ratio - k) < 1e-9)) lines.push('Your digits look right but the place value is off — check your decimal point or zeros.');
      else if ([2, 0.5].some((k) => Math.abs(ratio - k) < 1e-9)) lines.push('Your answer is off by a factor of 2. Did you forget to halve (or double) something — like radius vs. diameter, or counting things twice?');
      else lines.push('Compare your work with the steps below to find where it went off track.');
    }
  }
  return lines;
}

export function gradeCurrent(state, raw, now = Date.now()) {
  const s = state.session;
  const q = s.questions[s.index];
  const check = checkAnswer(raw, q.answer);
  const seconds = Math.round((now - (s.questionStartedAt || now)) / 1000);
  const result = { raw, correct: check.correct, seconds, why: check.correct ? [] : explainWrong(q, raw, check), answerText: specToString(q.answer) };
  s.results[s.index] = result;
  const events = applyResult(state, q, result, s.date);
  return { result, events };
}

function applyResult(state, q, result, today) {
  const events = { badges: [], levelUp: null, levelDown: null, xp: 0 };
  const t = topicStats(state, q.topicId);
  t.attempts++;
  t.lastSeen = today;
  t.recent.push(result.correct ? 1 : 0);
  if (t.recent.length > 20) t.recent.shift();
  t.mastery = t.mastery * 0.8 + (result.correct ? 1 : 0) * 0.2;
  if (t.attempts >= 4 && t.mastery < 0.5) t.everLow = true;

  if (result.correct) {
    t.correct++;
    t.runAtLevel++;
    t.missRun = 0;
    if (t.missedVariants[q.variantId]) delete t.missedVariants[q.variantId];
    if (t.runAtLevel >= 3 && t.level < 3) { t.level++; t.runAtLevel = 0; events.levelUp = { topicId: q.topicId, level: t.level }; }
    const gain = 10 + (q.level - 1) * 5 + (result.seconds <= 60 ? 2 : 0);
    state.xp += gain; events.xp += gain;
    state.streaks.correct.current++;
    state.streaks.correct.best = Math.max(state.streaks.correct.best, state.streaks.correct.current);
  } else {
    t.runAtLevel = 0;
    t.missRun++;
    t.missedVariants[q.variantId] = { when: today };
    if (t.missRun >= 2 && t.level > 1) { t.level--; t.missRun = 0; events.levelDown = { topicId: q.topicId, level: t.level }; }
    state.streaks.correct.current = 0;
    state.xp += 2; events.xp += 2; // effort points
  }

  state.log.push({ d: today, t: q.topicId, v: q.variantId, l: q.level, c: result.correct ? 1 : 0, s: result.seconds });
  if (!result.correct) {
    state.misses = state.misses || [];
    state.misses.push({ d: today, t: q.topicId, q: plainText(q.q), a: result.raw, ans: result.answerText });
    if (state.misses.length > 40) state.misses.splice(0, state.misses.length - 40);
  }
  if (state.log.length > 3000) state.log.splice(0, state.log.length - 3000);

  events.badges.push(...awardBadges(state));
  return events;
}

export function advance(state) {
  const s = state.session;
  s.index++;
  s.questionStartedAt = Date.now();
  return s.index >= s.questions.length;
}

// Called when the session's last question is answered.
export function finishSession(state) {
  const s = state.session;
  const correct = s.results.filter((r) => r && r.correct).length;
  const total = s.questions.length;
  const events = { badges: [], xp: 0, streakExtended: false, perfect: correct === total };
  if (s.kind === 'daily') {
    const day = state.days[s.date] || { completed: false, correct: 0, total: 0, minutes: 0 };
    const firstCompletion = !day.completed;
    day.completed = true;
    day.correct += correct;
    day.total += total;
    day.minutes += Math.round((Date.now() - s.startedAt) / 60000);
    state.days[s.date] = day;

    if (firstCompletion) {
      const ds = state.streaks.day;
      if (ds.lastDate && daysBetween(ds.lastDate, s.date) === 1) ds.current++;
      else if (ds.lastDate !== s.date) ds.current = 1;
      ds.lastDate = s.date;
      ds.best = Math.max(ds.best, ds.current);
      events.streakExtended = true;
      const bonus = 20 + (events.perfect ? 50 : 0) + Math.min(ds.current, 30);
      state.xp += bonus; events.xp += bonus;
    }
  }
  s.finished = true;
  events.correct = correct;
  events.total = total;
  events.badges.push(...awardBadges(state, s));
  return events;
}

// Streak shown on the dashboard (0 if a day was missed).
// Browsing time earned by finishing today's set. Returns the new lock, or null if
// the settings keep the browser locked (or a longer unlock is already running).
export function dailyUnlock(state, now = Date.now()) {
  const mode = state.settings.afterDaily || 'day';
  let until;
  if (mode === 'day') {
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    until = midnight.getTime();
  } else if (mode === 'minutes' && state.settings.rewardUnlockMinutes > 0) {
    until = now + state.settings.rewardUnlockMinutes * 60000;
  } else {
    return null;
  }
  if ((state.lock?.unlockedUntil || 0) >= until) return null;
  return { unlockedUntil: until, mode: 'reward', kind: mode };
}

export function liveDayStreak(state, today) {
  const ds = state.streaks.day;
  if (!ds.lastDate) return 0;
  const gap = daysBetween(ds.lastDate, today);
  return gap <= 1 ? ds.current : 0;
}

// ─────────────────────────────── Ranks & badges

export const RANKS = [
  [0, 'Rookie', '🐣'], [150, 'Problem Solver', '🧩'], [400, 'Mathlete', '🎯'], [800, 'Sprint Star', '⚡'],
  [1400, 'Target Pro', '🏹'], [2200, 'Team Captain', '🛡️'], [3300, 'Countdown Champ', '⏱️'],
  [4800, 'State Qualifier', '🏅'], [7000, 'National Contender', '🏆'], [10000, 'MATHCOUNTS Legend', '👑'],
];

export function rankFor(xp) {
  let i = 0;
  while (i + 1 < RANKS.length && xp >= RANKS[i + 1][0]) i++;
  const [min, name, icon] = RANKS[i];
  const next = RANKS[i + 1];
  return { name, icon, min, next: next ? { xp: next[0], name: next[1] } : null, progress: next ? (xp - min) / (next[0] - min) : 1 };
}

export const GLOBAL_BADGES = [
  { id: 'first-day', icon: '🌱', name: 'First Steps', desc: 'Finish your first daily set', test: (s) => Object.values(s.days).some((d) => d.completed) },
  { id: 'streak-3', icon: '🔥', name: 'On Fire', desc: '3-day streak', test: (s) => s.streaks.day.best >= 3 },
  { id: 'streak-7', icon: '📅', name: 'Full Week', desc: '7-day streak', test: (s) => s.streaks.day.best >= 7 },
  { id: 'streak-14', icon: '💪', name: 'Two-Week Titan', desc: '14-day streak', test: (s) => s.streaks.day.best >= 14 },
  { id: 'streak-30', icon: '🗓️', name: 'Month of Math', desc: '30-day streak', test: (s) => s.streaks.day.best >= 30 },
  { id: 'streak-100', icon: '💯', name: 'Century', desc: '100-day streak', test: (s) => s.streaks.day.best >= 100 },
  { id: 'correct-10', icon: '🎯', name: 'Sharpshooter', desc: '10 correct in a row', test: (s) => s.streaks.correct.best >= 10 },
  { id: 'correct-25', icon: '🏹', name: 'Bullseye', desc: '25 correct in a row', test: (s) => s.streaks.correct.best >= 25 },
  { id: 'correct-50', icon: '🚀', name: 'Unstoppable', desc: '50 correct in a row', test: (s) => s.streaks.correct.best >= 50 },
  { id: 'correct-100', icon: '🌟', name: 'Perfectionist', desc: '100 correct in a row', test: (s) => s.streaks.correct.best >= 100 },
  { id: 'perfect', icon: '✨', name: 'Perfect 10', desc: 'Get every question right in a daily set', test: (s, sess) => sess && sess.kind === 'daily' && sess.finished && sess.results.every((r) => r && r.correct) },
  { id: 'speed', icon: '⚡', name: 'Sprint Ready', desc: 'Perfect daily set averaging under 60 s per question', test: (s, sess) => sess && sess.kind === 'daily' && sess.finished && sess.results.every((r) => r && r.correct) && sess.results.reduce((a, r) => a + r.seconds, 0) / sess.results.length < 60 },
  { id: 'explorer', icon: '🧭', name: 'Explorer', desc: 'Try every topic at least once', test: (s) => TOPICS.every((t) => (s.topics[t.id]?.attempts || 0) > 0) },
  { id: 'comeback', icon: '📈', name: 'Comeback Kid', desc: 'Raise a weak topic (under 50%) to 80%+', test: (s) => Object.values(s.topics).some((t) => t.everLow && (recentAccuracy(t, 10) ?? 0) >= 0.8 && t.recent.length >= 10) },
  { id: 'q-100', icon: '📚', name: '100 Problems', desc: 'Answer 100 questions', test: (s) => Object.values(s.topics).reduce((a, t) => a + t.attempts, 0) >= 100 },
  { id: 'q-500', icon: '🏛️', name: '500 Problems', desc: 'Answer 500 questions', test: (s) => Object.values(s.topics).reduce((a, t) => a + t.attempts, 0) >= 500 },
  { id: 'gold-3', icon: '👑', name: 'Triple Crown', desc: 'Earn gold in 3 topics', test: (s) => TOPICS.filter((t) => topicTier(s, t.id) === 3).length >= 3 },
];

export const TIERS = [null, { name: 'Bronze', icon: '🥉' }, { name: 'Silver', icon: '🥈' }, { name: 'Gold', icon: '🥇' }];

export function topicTier(state, id) {
  const t = state.topics[id];
  if (!t) return 0;
  const acc = recentAccuracy(t, 10) ?? 0;
  if (t.correct >= 30 && t.level >= 3 && acc >= 0.85) return 3;
  if (t.correct >= 15 && t.level >= 2 && acc >= 0.7) return 2;
  if (t.correct >= 5) return 1;
  return 0;
}

export const TIER_RULES = [
  'Bronze: 5 correct answers in the topic',
  'Silver: 15 correct, reached Level 2, and 70%+ on your last 10',
  'Gold: 30 correct, reached Level 3, and 85%+ on your last 10',
];

function awardBadges(state, sess) {
  const earned = [];
  const today = dateKey();
  for (const b of GLOBAL_BADGES) {
    if (!state.badges[b.id] && b.test(state, sess)) {
      state.badges[b.id] = today;
      earned.push({ icon: b.icon, name: b.name, desc: b.desc });
    }
  }
  for (const topic of TOPICS) {
    const tier = topicTier(state, topic.id);
    for (let k = 1; k <= tier; k++) {
      const id = `${topic.id}-${k}`;
      if (!state.badges[id]) {
        state.badges[id] = today;
        earned.push({ icon: TIERS[k].icon, name: `${TIERS[k].name}: ${topic.name}`, desc: TIER_RULES[k - 1] });
      }
    }
  }
  return earned;
}

export function weakestTopics(state, n = 3) {
  return TOPICS.map((t) => ({ topic: t, s: state.topics[t.id] }))
    .filter((x) => x.s && x.s.attempts >= 3)
    .sort((a, b) => a.s.mastery - b.s.mastery)
    .slice(0, n);
}

// ─────────────────────────────── Parent dashboard

export function plainText(html) {
  return String(html)
    .replace(/<span class="fr"><span>(.*?)<\/span><span>(.*?)<\/span><\/span>/g, '$1/$2')
    .replace(/<sup>(.*?)<\/sup>/g, '^$1')
    .replace(/<[^>]+>/g, '');
}

function shiftDate(key, days) {
  const [y, m, d] = key.split('-').map(Number);
  return dateKey(new Date(y, m - 1, d + days));
}

const acc = (c, n) => (n ? c / n : null);

// Status of a topic from its last 10 answers. Needs at least 3 answers to judge.
export function topicStatus(t) {
  if (!t || t.recent.length < 3) return 'new';
  const a = recentAccuracy(t, 10);
  return a >= 0.8 ? 'strong' : a >= 0.5 ? 'ok' : 'help';
}

export function dashboardData(state, today = dateKey(), days = 30) {
  // Daily accuracy from the answer log (daily sets and extra practice).
  const byDay = {};
  for (const e of state.log) {
    const day = (byDay[e.d] = byDay[e.d] || { correct: 0, total: 0 });
    day.total++; day.correct += e.c;
  }
  const series = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = shiftDate(today, -i);
    const v = byDay[d] || { correct: 0, total: 0 };
    series.push({ date: d, correct: v.correct, total: v.total, done: !!state.days[d]?.completed });
  }
  const window = (from, to) => {
    let c = 0, n = 0;
    for (let i = from; i < to; i++) { const v = byDay[shiftDate(today, -i)]; if (v) { c += v.correct; n += v.total; } }
    return { correct: c, total: n, acc: acc(c, n) };
  };
  const thisWeek = window(0, 7), lastWeek = window(7, 14);

  const topics = TOPICS.map((topic) => {
    const t = state.topics[topic.id];
    const recent = t ? t.recent.slice(-10) : [];
    const last5 = t ? t.recent.slice(-5) : [], prev5 = t ? t.recent.slice(-10, -5) : [];
    const trend = last5.length >= 3 && prev5.length >= 3
      ? last5.reduce((a, b) => a + b, 0) / last5.length - prev5.reduce((a, b) => a + b, 0) / prev5.length
      : null;
    return {
      id: topic.id, name: topic.name, icon: topic.icon, strand: topic.strand,
      attempts: t?.attempts || 0, correct: t?.correct || 0,
      recentAcc: recent.length ? recent.reduce((a, b) => a + b, 0) / recent.length : null,
      recentCount: recent.length, level: t?.level || 1, tier: topicTier(state, topic.id),
      lastSeen: t?.lastSeen || null, trend, status: topicStatus(t),
    };
  });

  const strands = [];
  for (const tp of topics) {
    let s = strands.find((x) => x.name === tp.strand);
    if (!s) strands.push((s = { name: tp.strand, correct: 0, attempts: 0 }));
    s.correct += tp.correct; s.attempts += tp.attempts;
  }
  strands.forEach((s) => (s.acc = acc(s.correct, s.attempts)));

  const judged = topics.filter((t) => t.status !== 'new');
  const needsHelp = judged.filter((t) => t.status !== 'strong').sort((a, b) => a.recentAcc - b.recentAcc).slice(0, 4);
  const doingWell = judged.filter((t) => t.status === 'strong').sort((a, b) => b.recentAcc - a.recentAcc || b.attempts - a.attempts).slice(0, 4);

  const answered = topics.reduce((a, t) => a + t.attempts, 0);
  const correct = topics.reduce((a, t) => a + t.correct, 0);
  return {
    series, thisWeek, lastWeek, topics, strands, needsHelp, doingWell,
    notTried: topics.filter((t) => t.attempts === 0).map((t) => t.name),
    totals: {
      answered, correct, acc: acc(correct, answered),
      daysDone: Object.values(state.days).filter((d) => d.completed).length,
      daysDoneInWindow: series.filter((d) => d.done).length,
      streak: liveDayStreak(state, today), bestStreak: state.streaks.day.best,
    },
    misses: (state.misses || []).slice(-8).reverse(),
  };
}

// When a parent unlock should end. choice: minutes as a number, 'time' (with "HH:MM"), or 'forever'.
// A time earlier than now means that time tomorrow (e.g. "until 7:00" at 9 PM).
export const FOREVER_MS = 365 * 86400000;
export function unlockUntil(choice, time, now = Date.now()) {
  if (choice === 'forever') return now + FOREVER_MS;
  if (choice === 'time') {
    const [h, m] = String(time || '').split(':').map(Number);
    if (!Number.isInteger(h) || !Number.isInteger(m)) return null;
    const t = new Date(now);
    t.setHours(h, m, 0, 0);
    if (t.getTime() <= now) t.setDate(t.getDate() + 1);
    return t.getTime();
  }
  const mins = Number(choice);
  return mins > 0 ? now + mins * 60000 : null;
}
