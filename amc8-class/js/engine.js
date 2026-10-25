// Course plan, class building and progress tracking. No DOM here, so tests can run it in Node.
(function (root) {
  const U = root.U;
  const byId = () => Object.fromEntries(root.TOPICS.map((t) => [t.id, t]));

  // Topics alternate between number, algebra/counting and geometry so no two days feel the same.
  const ORDER = ['mental', 'angles', 'fractions', 'counting', 'percents', 'area', 'ratios', 'sequences',
    'pythag', 'divisibility', 'probability', 'rates', 'circles', 'gcflcm', 'equations', 'stats',
    'divisors', 'coords', 'exponents', 'combos', 'units', 'solids', 'remainders'];

  // Pass 1 teaches each topic. Pass 2 revisits it with harder problems and a new trick.
  // A practice contest follows every 6th class.
  function buildPlan() {
    const plan = [];
    let sinceMock = 0;
    for (const pass of [1, 2]) {
      for (const id of ORDER) {
        plan.push({ type: 'lesson', topic: id, pass });
        if (++sinceMock === 6) { plan.push({ type: 'mock', upTo: plan.length }); sinceMock = 0; }
      }
    }
    plan.push({ type: 'mock', upTo: plan.length, final: true });
    return plan;
  }

  const DEFAULT_CONTEST = '2027-01-21';
  function newState() {
    return { name: '', contestDate: DEFAULT_CONTEST, classIdx: 0, xp: 0, streak: 0, bestStreak: 0,
      lastDay: null, mastery: {}, log: [], badges: [], sound: true, voice: false };
  }

  const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const daysBetween = (a, b) => Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 86400000);

  // Turn a generator result into a question with lettered choices.
  function makeQuestion(topicId, level, genIdx) {
    const t = byId()[topicId];
    const i = genIdx == null ? Math.floor(Math.random() * t.gens.length) : genIdx;
    for (let tries = 0; tries < 20; tries++) {
      const g = t.gens[i](level);
      const a = String(g.a);
      if (a === 'NaN' || a === 'undefined') continue;
      return { topic: topicId, level, gen: i, q: g.q, answer: a, choices: U.makeChoices(a, g.wrong), steps: g.steps };
    }
    throw new Error(`generator ${topicId}#${i} keeps failing`);
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

  // A class is a list of segments the UI plays in order.
  function buildClass(state, idx = state.classIdx) {
    const plan = buildPlan();
    const c = plan[Math.min(idx, plan.length - 1)];
    const T = byId();
    if (c.type === 'mock') {
      const pool = taughtTopics(state, c.upTo);
      // Spread 15 questions over the taught topics, getting harder like the real contest.
      let deck = [];
      const qs = [];
      for (let k = 0; k < 15; k++) {
        if (!deck.length) deck = U.shuffle(pool);
        qs.push(makeQuestion(deck.pop(), k < 5 ? 1 : k < 11 ? 2 : 3));
      }
      return { idx, kind: 'mock', title: c.final ? 'Final Dress Rehearsal' : 'Practice Contest', minutes: 25, segments: [{ type: 'mock', questions: qs }] };
    }
    const t = T[c.topic];
    const lv = c.pass === 1 ? [1, 1, 1, 2, 2, 2, 2, 2, 3, 3] : [2, 2, 2, 2, 3, 3, 3, 3, 3, 3];
    // Use every generator before repeating one, so a quiz covers the whole topic.
    const gens = U.shuffle(t.gens.map((_, i) => i));
    const quiz = lv.map((level, k) => makeQuestion(t.id, level, gens[k % gens.length]));
    const segments = [];
    const review = reviewTopics(state, taughtTopics(state, idx).filter((id) => id !== t.id), 3);
    if (review.length) segments.push({ type: 'warmup', questions: review.map((id) => makeQuestion(id, c.pass)) });
    segments.push({ type: 'lesson', topic: t.id, pass: c.pass });
    const tip = c.pass === 1 ? t.tips[0] : t.tips[1 + (idx % Math.max(1, t.tips.length - 1))] || t.tips[t.tips.length - 1];
    segments.push({ type: 'trick', topic: t.id, tip });
    segments.push({ type: 'quiz', questions: quiz.slice(0, 5), part: 1 });
    segments.push({ type: 'break' });
    segments.push({ type: 'quiz', questions: quiz.slice(5), part: 2 });
    segments.push({ type: 'boss', questions: [makeQuestion(t.id, 3)] });
    return { idx, kind: 'lesson', title: `${t.emoji} ${t.name}`, pass: c.pass, topic: t.id, minutes: 20, segments };
  }

  function record(state, q, correct, firstTry) {
    const m = (state.mastery[q.topic] = state.mastery[q.topic] || { r: [], seen: 0 });
    m.r.push(correct && firstTry ? 1 : 0);
    if (m.r.length > 20) m.r.shift();
    m.seen = state.log.length;
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
    if (state.lastDay !== today) {
      const gap = state.lastDay ? daysBetween(state.lastDay, today) : 1;
      state.streak = gap === 1 ? state.streak + 1 : 1;
      state.lastDay = today;
    }
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
    if (cls.kind === 'mock' && result.right >= 12) give('honor');
    if (result.bossWin) give('boss');
    return earned;
  }

  const BADGES = {
    first: ['🌱', 'First class'], perfect: ['💎', 'Perfect quiz'], streak3: ['🔥', '3-day streak'],
    streak7: ['⚡', '7-day streak'], streak30: ['🏆', '30-day streak'], mock: ['📝', 'First contest'],
    honor: ['🥇', '12+ on a practice contest'], boss: ['🐉', 'Beat a boss'],
  };

  root.Engine = { ORDER, buildPlan, newState, makeQuestion, buildClass, record, xpFor, levelOf, finishClass, dayKey, daysBetween, taughtTopics, BADGES };
})(typeof window !== 'undefined' ? window : globalThis);
