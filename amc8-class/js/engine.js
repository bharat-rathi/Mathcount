// Course plan, class building and progress tracking. No DOM here, so tests can run it in Node.
(function (root) {
  const U = root.U;
  const byId = () => Object.fromEntries(root.TOPICS.map((t) => [t.id, t]));

  // Every topic, in first-lesson order. Areas alternate so no two days feel the same.
  const ORDER = ['mental', 'angles', 'logic', 'fractions', 'counting', 'area', 'ratios', 'sequences', 'pythag', 'similar', 'combos',
    'casework', 'divisibility', 'probability', 'percents', 'paths', 'circles', 'gcflcm', 'equations', 'stats', 'graphs', 'divisors',
    'coords', 'probplus', 'exponents', 'rates', 'units', 'solids', 'spatial', 'remainders'];

  // Second ("Level Up") games go to the areas that matter most on the real test, based on
  // 200 problems from 2018–2026 (analysis/README.md): counting & probability is the hardest
  // area, then logic and geometry. Number theory and easy arithmetic get one game each, and
  // arithmetic speed is trained daily in the Shootaround instead.
  const LEVEL_UP = ['logic', 'counting', 'area', 'casework', 'probability', 'pythag', 'similar', 'ratios', 'combos',
    'circles', 'paths', 'sequences', 'equations', 'rates', 'stats'];

  // The last games are real past AMC 8 papers, hosted with MAA permission by LIVE by Po-Shen Loh.
  const PAPERS = [2023, 2024, 2025, 2026];
  const paperUrl = (y) => `https://live.poshenloh.com/past-contests/amc8/${y}`;

  // The season ends like a real one: the Playoffs (a full 25-question contest on every topic),
  // then a Finals Prep week built from the Playoff results, then the Finals (the real papers).
  const PREP_GAMES = 6;

  // Lessons with a practice contest after every 6, then the Playoffs, Finals Prep and Finals.
  function buildPlan() {
    const lessons = [...ORDER.map((topic) => ({ topic, pass: 1 })), ...LEVEL_UP.map((topic) => ({ topic, pass: 2 }))];
    const plan = [];
    lessons.forEach((l, i) => {
      plan.push({ type: 'lesson', ...l });
      if ((i + 1) % 6 === 0) plan.push({ type: 'mock', upTo: plan.length });
    });
    plan.push({ type: 'playoff' });
    for (let k = 0; k < PREP_GAMES; k++) plan.push({ type: 'prep', k });
    PAPERS.forEach((year, i) => plan.push({ type: 'paper', year, url: paperUrl(year), final: i === PAPERS.length - 1 }));
    return plan;
  }
  const PLAN_VERSION = 4;
  const playoffIdx = () => buildPlan().findIndex((c) => c.type === 'playoff');

  // Older saves used a different plan. Rebuild his place from the class log: the nth time a
  // topic shows up is that topic's pass n, and each logged contest covers one contest slot.
  function migratePlan(state) {
    if ((state.planVersion || 1) >= PLAN_VERSION) return;
    // Version 3 → 4 only added the Playoffs and Finals Prep before the papers.
    if (state.planVersion === 3) {
      if (state.classIdx >= playoffIdx()) state.classIdx += 1 + PREP_GAMES;
      state.planVersion = PLAN_VERSION;
      return;
    }
    const seen = {};
    let mocks = 0;
    for (const l of state.log) {
      if (l.kind === 'mock') { mocks++; continue; }
      const t = root.TOPICS.find((x) => l.title === `${x.emoji} ${x.name}`);
      if (t) seen[t.id] = (seen[t.id] || 0) + 1;
    }
    const plan = buildPlan();
    let idx = plan.findIndex((c) => (c.type === 'lesson' && (seen[c.topic] || 0) < c.pass) || (c.type === 'mock' && mocks-- <= 0) || c.type === 'playoff');
    state.classIdx = idx < 0 ? 0 : idx;
    state.planVersion = PLAN_VERSION;
  }

  const DEFAULT_CONTEST = '2027-01-21';
  function newState() {
    return { name: '', contestDate: DEFAULT_CONTEST, planVersion: PLAN_VERSION, classIdx: 0, xp: 0, streak: 0, bestStreak: 0,
      lastDay: null, mastery: {}, log: [], badges: [], sound: true, voice: false,
      // Basketball layer: season record, streak timeouts, look, trick cards and Shootaround facts.
      wins: 0, losses: 0, timeouts: 2, jersey: 'gold', number: 23, court: 'hardwood',
      unlocks: ['gold', 'hardwood'], cards: [], shootPB: 0, facts: {},
      // Clutch problems already seen, and why answers went wrong (careless/concept/trick/time).
      clips: [], reports: [], seenQ: [], genUse: {}, tick: 0, hardSeen: [], mistakes: { careless: 0, concept: 0, trick: 0, time: 0 }, mistakeLog: [] };
  }

  const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const daysBetween = (a, b) => Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 86400000);

  // Short fingerprint of a question's text, so "have I seen this?" costs a few bytes each.
  const hash = (str) => { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); };

  // Turn a generator result into a question with lettered choices.
  function makeQuestion(topicId, level, genIdx) {
    const t = byId()[topicId];
    const i = genIdx == null ? Math.floor(Math.random() * t.gens.length) : genIdx;
    for (let tries = 0; tries < 20; tries++) {
      const g = t.gens[i](level);
      const a = String(g.a);
      if (a === 'NaN' || a === 'undefined') continue;
      return { topic: topicId, level, gen: i, tpl: `${topicId}#${i}`, fp: hash(`${topicId}|${g.q}`), q: g.q, svg: g.svg, chk: g.chk, answer: a, choices: U.makeChoices(a, g.wrong), steps: g.steps };
    }
    throw new Error(`generator ${topicId}#${i} keeps failing`);
  }

  // A question he hasn't met, from a question type he hasn't just used.
  // Every topic has many question types (generators). fresh() tries the least recently used
  // types first and re-draws until the question is new to him (state.seenQ, the last 500 he
  // answered) and new to this game (`batch`), preferring a type not yet used in this game.
  // Pass `gen` to stay on one type (the adaptive quiz re-makes a question at a new level).
  function newBatch() { return { fp: new Set(), tpl: new Set() }; }
  function fresh(state, topicId, level, { gen, batch } = {}) {
    const t = byId()[topicId], n = t.gens.length;
    const seen = new Set(state.seenQ || []);
    const use = (state.genUse && state.genUse[topicId]) || {};
    const used = batch || newBatch();
    // Borrowed (MATHCOUNTS) types appear at or below their own difficulty, and one or two
    // notches above when a topic would otherwise have fewer than 8 types to rotate through.
    const upTo = (cap) => [...Array(n).keys()].filter((i) => !(t.gens[i].lvl > cap));
    let allowed = upTo(level);
    for (let cap = level + 1; allowed.length < 8 && cap <= level + 2; cap++) allowed = upTo(cap);
    const order = U.shuffle(allowed).sort((a, b) => (use[a] || 0) - (use[b] || 0));
    const tries = [];
    if (gen != null && allowed.includes(gen)) for (let k = 0; k < 6; k++) tries.push(gen);
    for (let k = 0; k < 40; k++) tries.push(order[k % order.length]);
    let best = null, bestScore = 99;
    for (const gi of tries) {
      const q = makeQuestion(topicId, level, gi);
      const score = (used.fp.has(q.fp) ? 8 : 0) + (seen.has(q.fp) ? 4 : 0) + (gen == null && used.tpl.has(q.tpl) ? 1 : 0);
      if (score < bestScore) { best = q; bestScore = score; }
      if (score === 0) break;
    }
    used.fp.add(best.fp); used.tpl.add(best.tpl);
    return best;
  }

  // "Report this question": why a player flags one, kept on his profile and sent to the owner.
  const REPORT_REASONS = [['wrong', 'Wrong answer'], ['confusing', 'Confusing'], ['hard', 'Too hard'], ['easy', 'Too easy'], ['seen', 'Seen it before'], ['other', 'Something else']];
  function reportQuestion(state, q, reason, game = 'amc8') {
    const r = {
      topic: q.topic || null, tpl: q.tpl || (q.id ? `clutch#${q.id}` : null), game, reason: String(reason).slice(0, 40),
      question: String(q.q).slice(0, 1000), answer: String(q.answer).slice(0, 200), choices: (q.choices || []).join(' | ').slice(0, 600), at: dayKey(),
    };
    const list = (state.reports = state.reports || []);
    list.push(r);
    if (list.length > 100) list.splice(0, list.length - 100);
    // He never sees a reported question again.
    if (q.fp) { const seen = (state.seenQ = state.seenQ || []); seen.push(q.fp); if (seen.length > 500) seen.splice(0, seen.length - 500); }
    if (q.id) (state.hardSeen = state.hardSeen || []).push(q.id);
    return r;
  }

  // A hand-written clutch problem (js/hard.js) in the same shape as a generated question.
  function makeHard(topic, seen) {
    const p = root.HARD.pickHard(topic, seen || []);
    return { topic: p.topic, level: 4, id: p.id, q: p.q, svg: p.svg, answer: p.a, choices: p.choices, steps: p.steps, hints: p.hints, key: p.key };
  }

  // Weakest (or longest-unseen) topics among those already taught come back as warm-ups.
  function reviewTopics(state, taught, n) {
    const score = (id) => {
      const m = state.mastery[id];
      if (!m || !m.r.length) return -1;
      const acc = m.r.reduce((x, y) => x + y, 0) / m.r.length;
      return acc - Math.min(0.3, (state.log.length - (m.seen || 0)) * 0.02);
    };
    return taught.slice().sort((a, b) => score(a) - score(b)).slice(0, n);
  }

  function taughtTopics(state, upTo) {
    const plan = buildPlan();
    const ids = plan.slice(0, upTo).filter((c) => c.type === 'lesson').map((c) => c.topic);
    return [...new Set(ids)];
  }

  // Adaptive difficulty. Each topic has a skill from 1 (easy) to 3 (AMC-hard). A first-try
  // answer nudges it up a little; a miss drops it more, so a struggling topic gets easier
  // fast and then climbs back slowly. Question level = the skill, rounded.
  const avg = (r) => r.reduce((a, b) => a + b, 0) / r.length;
  function skillOf(state, id, pass = 1) {
    const s = (state.skill || {})[id];
    if (s != null) return s;
    const m = state.mastery[id];
    if (m && m.r.length >= 3) return 1 + 2 * avg(m.r.slice(-10));
    return pass === 2 ? 2 : 1;
  }
  const levelFor = (skill) => Math.max(1, Math.min(3, Math.round(skill)));
  const adapt = (skill, correct, firstTry) => Math.max(1, Math.min(3.4, skill + (correct && firstTry ? 0.25 : correct ? -0.1 : -0.5)));

  // Finals Prep topics, from the Playoffs: topics missed there first (most misses first),
  // then the weakest topics overall.
  function prepTopics(state) {
    const by = (state.playoff && state.playoff.byTopic) || {};
    const acc = (id) => { const m = state.mastery[id]; return m && m.r.length ? avg(m.r) : 0.5; };
    const miss = (id) => (by[id] ? by[id][1] - by[id][0] : 0);
    const missed = ORDER.filter((id) => miss(id) > 0).sort((a, b) => miss(b) - miss(a) || acc(a) - acc(b));
    // Then the weakest topics; ties go to the big test areas, and topics aced in the Playoffs go last.
    const rank = (id) => (by[id] ? 2 : 0) + acc(id) + (LEVEL_UP.includes(id) ? 0 : 0.01);
    const rest = ORDER.filter((id) => !missed.includes(id)).sort((a, b) => rank(a) - rank(b));
    return [...missed, ...rest].slice(0, PREP_GAMES);
  }

  // A class is a list of segments the UI plays in order.
  function buildClass(state, idx = state.classIdx) {
    const plan = buildPlan();
    let c = plan[Math.min(idx, plan.length - 1)];
    const T = byId();
    if (c.type === 'paper') {
      return { idx, kind: 'paper', title: `${c.year} AMC 8${c.final ? ' (Final Dress Rehearsal)' : ''}`, minutes: 40, year: c.year, url: c.url, segments: [{ type: 'paper', year: c.year, url: c.url }] };
    }
    if (c.type === 'mock') {
      const pool = taughtTopics(state, c.upTo);
      // Spread 15 questions over the taught topics, getting harder like the real contest.
      let deck = [];
      const qs = [], batch = newBatch();
      for (let k = 0; k < 15; k++) {
        if (!deck.length) deck = U.shuffle(pool);
        // The last three are hand-written hard problems, like #23–25 on the real test.
        qs.push(k >= 12 && root.HARD ? makeHard(deck.pop(), (state.hardSeen || []).concat(qs.map((x) => x.id))) : fresh(state, deck.pop(), k < 5 ? 1 : k < 11 ? 2 : 3, { batch }));
      }
      return { idx, kind: 'mock', title: 'Practice Contest', minutes: 25, segments: [{ type: 'mock', questions: qs }] };
    }
    if (c.type === 'playoff') {
      // 25 questions over every topic (the big areas twice as likely), on the real test's curve.
      let deck = [];
      const qs = [], batch = newBatch();
      for (let k = 0; k < 25; k++) {
        if (!deck.length) deck = U.shuffle([...ORDER, ...LEVEL_UP]);
        qs.push(k >= 22 && root.HARD ? makeHard(deck.pop(), (state.hardSeen || []).concat(qs.map((x) => x.id))) : fresh(state, deck.pop(), k < 8 ? 1 : k < 17 ? 2 : 3, { batch }));
      }
      return { idx, kind: 'playoff', title: '🏆 The Playoffs', minutes: 40, segments: [{ type: 'mock', questions: qs }] };
    }
    let prep = false;
    if (c.type === 'prep') { prep = true; c = { type: 'lesson', topic: prepTopics(state)[c.k % PREP_GAMES], pass: 2 }; }
    const t = T[c.topic];
    // Every quiz question adapts: it is re-made at the topic's current skill when it is shown.
    const start = levelFor(skillOf(state, t.id, c.pass));
    // One shared batch per game: no repeated question, and each question uses a different type
    // from the last until every type for this topic has been used.
    const batch = newBatch();
    const quiz = [...Array(10)].map(() => Object.assign(fresh(state, t.id, start, { batch }), { adapt: true }));
    const segments = [{ type: 'shootaround' }];
    const review = reviewTopics(state, taughtTopics(state, idx).filter((id) => id !== t.id), 3);
    if (review.length) segments.push({ type: 'warmup', questions: review.map((id) => Object.assign(fresh(state, id, levelFor(skillOf(state, id, c.pass)), { batch }), { adapt: true })) });
    segments.push({ type: 'lesson', topic: t.id, pass: c.pass });
    const tip = c.pass === 1 ? t.tips[0] : t.tips[1 + (idx % Math.max(1, t.tips.length - 1))] || t.tips[t.tips.length - 1];
    segments.push({ type: 'trick', topic: t.id, tip });
    segments.push({ type: 'quiz', questions: quiz.slice(0, 5), part: 1 });
    segments.push({ type: 'break' });
    segments.push({ type: 'quiz', questions: quiz.slice(5), part: 2 });
    segments.push({ type: 'boss', questions: [root.HARD ? makeHard(t.id, state.hardSeen) : makeQuestion(t.id, 3)] });
    return { idx, batch, kind: 'lesson', title: prep ? `🔥 Finals Prep: ${t.emoji} ${t.name}` : `${t.emoji} ${t.name}`, pass: c.pass, topic: t.id, prep, minutes: 20, segments };
  }

  function record(state, q, correct, firstTry) {
    const m = (state.mastery[q.topic] = state.mastery[q.topic] || { r: [], seen: 0 });
    m.r.push(correct && firstTry ? 1 : 0);
    if (m.r.length > 20) m.r.shift();
    m.seen = state.log.length;
    // Anti-repeat memory: what he has answered, and when each question type was last used.
    if (q.fp) {
      const seenQ = (state.seenQ = state.seenQ || []);
      seenQ.push(q.fp);
      if (seenQ.length > 500) seenQ.splice(0, seenQ.length - 500);
    }
    if (q.gen != null) {
      const use = ((state.genUse = state.genUse || {})[q.topic] = state.genUse[q.topic] || {});
      use[q.gen] = state.tick = (state.tick || 0) + 1;
    }
  }

  const XP_RIGHT = 10, XP_SECOND_TRY = 4, XP_BOSS = 30;
  function xpFor(seg, correct, firstTry, combo) {
    if (!correct) return 0;
    if (seg === 'boss') return firstTry ? XP_BOSS : XP_SECOND_TRY * 2;
    return firstTry ? XP_RIGHT + Math.min(10, 2 * combo) : XP_SECOND_TRY;
  }

  // Levels get longer as you go: 100, 150, 200 … XP.
  function levelOf(xp) {
    let lvl = 1, need = 100;
    while (xp >= need) { xp -= need; lvl++; need += 50; }
    return { lvl, into: xp, need };
  }

  // Called once a class is finished. Updates streak, XP, badges and moves on in the plan.
  function finishClass(state, cls, result, today = dayKey()) {
    let usedTimeout = false;
    if (state.lastDay !== today) {
      const gap = state.lastDay ? daysBetween(state.lastDay, today) : 1;
      // A missed day can be covered by a timeout instead of losing the streak.
      if (gap === 2 && state.timeouts > 0) { state.timeouts--; usedTimeout = true; }
      state.streak = gap === 1 || usedTimeout ? state.streak + 1 : 1;
      state.lastDay = today;
      if (state.streak % 7 === 0) state.timeouts = Math.min(3, state.timeouts + 1);
    }
    const win = result.total > 0 && result.right / result.total >= 0.7;
    if (cls.kind !== 'practice') win ? state.wins++ : state.losses++;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
    state.xp += result.xp;
    state.log.push({ day: today, idx: cls.idx, title: cls.title, kind: cls.kind, right: result.right, total: result.total, xp: result.xp, score: result.score });
    if (cls.idx === state.classIdx) state.classIdx = Math.min(state.classIdx + 1, buildPlan().length - 1);
    const earned = [];
    const give = (id) => { if (!state.badges.includes(id)) { state.badges.push(id); earned.push(id); } };
    if (state.log.length === 1) give('first');
    if (result.right === result.total) give('perfect');
    if (state.streak >= 3) give('streak3');
    if (state.streak >= 7) give('streak7');
    if (state.streak >= 30) give('streak30');
    if (cls.kind === 'mock') give('mock');
    if (cls.kind === 'playoff') give('playoff');
    if (cls.kind === 'mock' && result.right >= 12) give('honor');
    if (cls.kind === 'paper') give('paper');
    if (cls.kind === 'paper' && result.right >= 21) give('honorroll');
    if (result.bossWin) give('boss');
    earned.usedTimeout = usedTimeout;
    earned.win = win;
    return earned;
  }

  const BADGES = {
    first: ['🌱', 'First class'], perfect: ['💎', 'Perfect quiz'], streak3: ['🔥', '3-day streak'],
    streak7: ['⚡', '7-day streak'], streak30: ['🏆', '30-day streak'], mock: ['📝', 'First contest'],
    honor: ['🥇', '12+ on a practice contest'], paper: ['📜', 'First real AMC paper'], honorroll: ['👑', 'Honor Roll score (21+) on a real paper'], playoff: ['🏟️', 'Played the Playoffs'], boss: ['🏀', 'Hit a game-winner'],
  };

  const MISTAKES = { careless: ['😬', 'Careless slip'], concept: ['🤷', "Didn't know how"], trick: ['🃏', 'Forgot the trick'], time: ['⏱️', 'Ran out of time'] };
  function recordMistake(state, q, kind) {
    state.mistakes = state.mistakes || { careless: 0, concept: 0, trick: 0, time: 0 };
    state.mistakes[kind]++;
    (state.mistakeLog = state.mistakeLog || []).push({ day: dayKey(), topic: q.topic, kind });
    if (state.mistakeLog.length > 200) state.mistakeLog.shift();
  }

  // Topics to practice next: low recent first-try accuracy, or repeated "didn't know how" /
  // "forgot the trick" tags. Careless slips don't count against a topic.
  function focusTopics(state, n = 3) {
    const out = [];
    const recentMistakes = (state.mistakeLog || []).slice(-60);
    const ids = new Set([...Object.keys(state.mastery), ...recentMistakes.map((x) => x.topic)]);
    for (const id of ids) {
      const recent = ((state.mastery[id] || {}).r || []).slice(-10);
      const acc = recent.length ? recent.reduce((a, b) => a + b, 0) / recent.length : 0;
      const misses = recentMistakes.filter((x) => x.topic === id && x.kind !== 'careless').length;
      if ((recent.length >= 3 && acc < 0.8) || misses >= 2) out.push({ id, pct: Math.round(100 * acc), n: recent.length, misses, score: acc - 0.05 * misses });
    }
    return out.sort((a, b) => a.score - b.score).slice(0, n);
  }

  root.Engine = { REPORT_REASONS, reportQuestion, fresh, newBatch, PREP_GAMES, playoffIdx, prepTopics, skillOf, levelFor, adapt, focusTopics, migratePlan, PLAN_VERSION, MISTAKES, recordMistake, makeHard, ORDER, buildPlan, newState, makeQuestion, buildClass, record, xpFor, levelOf, finishClass, dayKey, daysBetween, taughtTopics, BADGES };
})(typeof window !== 'undefined' ? window : globalThis);
