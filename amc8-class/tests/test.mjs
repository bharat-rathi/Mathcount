// Run with: node amc8-class/tests/test.mjs
import vm from 'node:vm';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'js');
const ctx = vm.createContext({ console, Math, Date });
for (const f of ['util.js', 'viz.js', 'hoops.js', 'topics-number.js', 'topics-algebra.js', 'topics-geometry.js', 'topics-logic.js', 'topics-counting.js', 'topics-visual.js', 'topics-extra.js', 'hard.js', 'hard-diagrams.js', 'studio-counting.js', 'studio-geometry.js', 'studio-algebra.js', 'studio-number-theory.js', 'studio-arithmetic.js', 'studio-logic.js', 'arcade.js', 'arcade-zombies.js', 'arcade-racer.js', 'arcade-buzzer.js', 'arcade-towers.js', 'arcade-heist.js', 'engine.js']) {
  vm.runInContext(fs.readFileSync(path.join(dir, f), 'utf8'), ctx, { filename: f });
}
const { TOPICS, Engine, U, CLIPS, Arcade, Hoops } = ctx;
// The AMC topics also borrow the MATHCOUNTS coach's problem types (an ES module, so imported here).
const { installBridge } = await import('../js/mc-bridge.js');
const bridged = installBridge(TOPICS);

let failures = 0;
const fail = (msg) => { failures++; if (failures < 40) console.error('FAIL', msg); };
const bad = (s) => /NaN|undefined|Infinity|\[object/.test(String(s));

// Every topic in the course order exists, and every topic is in the order.
const ids = TOPICS.map((t) => t.id);
for (const id of Engine.ORDER) if (!ids.includes(id)) fail(`ORDER has unknown topic ${id}`);
for (const id of ids) if (!Engine.ORDER.includes(id)) fail(`topic ${id} missing from ORDER`);
if (new Set(ids).size !== ids.length) fail('duplicate topic ids');

for (const t of TOPICS) {
  if (t.slides.length < 3) fail(`${t.id}: needs 3 slides`);
  if (t.tips.length < 2) fail(`${t.id}: needs 2 tips`);
  for (const s of t.slides) {
    if (s.svg && (!s.svg.startsWith('<svg') || bad(s.svg))) fail(`${t.id}: bad svg in "${s.h}"`);
    if (s.type === 'predict' && !s.options.includes(s.answer)) fail(`${t.id}: predict answer missing in "${s.h}"`);
    if (s.type === 'order' && [...s.answer].sort().join() !== [...s.items].sort().join()) fail(`${t.id}: order items mismatch in "${s.h}"`);
    if (s.type === 'steps' && (!s.steps.length || s.steps.some((x) => !x.say))) fail(`${t.id}: empty step in "${s.h}"`);
    if (!s.type && !s.svg) fail(`${t.id}: plain slide needs a picture in "${s.h}"`);
  }
  t.gens.forEach((_, gi) => {
    for (const level of [1, 2, 3]) {
      for (let k = 0; k < 400; k++) {
        let q;
        try { q = Engine.makeQuestion(t.id, level, gi); } catch (e) { fail(`${t.id}#${gi} L${level} threw ${e.message}`); break; }
        const where = `${t.id}#${gi} L${level}: ${q.q} → ${q.answer} [${q.choices.join(' | ')}]`;
        if (!q.q || (q.svg && (!q.svg.startsWith('<svg') || bad(q.svg))) || bad(q.q) || bad(q.answer) || q.steps.some(bad)) { fail(`bad text ${where} ${q.steps.join(' ')}`); break; }
        if (q.choices.length !== 5 || new Set(q.choices).size !== 5) { fail(`choices ${where}`); break; }
        if (!q.choices.includes(q.answer)) { fail(`answer missing ${where}`); break; }
        if (q.choices.some((c) => bad(c) || / \++$/.test(c))) { fail(`filler/bad choice ${where}`); break; }
        const n = Number(q.answer);
        if (Number.isFinite(n) && !Number.isInteger(n) && String(n).split('.')[1].length > 2) { fail(`ugly decimal ${where}`); break; }
        // Generators that carry an independent second calculation must agree with their answer.
        if (q.chk !== undefined && !(typeof q.chk === 'number' ? Math.abs(q.chk - Number(q.answer)) < 1e-9 : String(q.chk) === q.answer)) { fail(`check disagrees ${where} (second calculation: ${q.chk})`); break; }
      }
    }
  });
}

// Hand-checked answers for a few classic results.
const spot = [
  [U.frac(6, 8), '3/4'], [U.surd(72), '6√2'], [U.surd(49), '7'], [U.lcm(12, 18), 36], [U.choose(6, 3), 20],
];
for (const [got, want] of spot) if (got !== want) fail(`spot ${got} !== ${want}`);

// The whole plan can be built and every class has the expected parts.
const plan = Engine.buildPlan();
if (plan.length < 50) fail(`plan too short: ${plan.length}`);
const state = Engine.newState();
for (let i = 0; i < plan.length; i++) {
  const c = Engine.buildClass(state, i);
  if (plan[i].type === 'lesson' || plan[i].type === 'prep') {
    const types = c.segments.map((s) => s.type).join(',');
    const want = 'shootaround,' + (i === 0 ? '' : 'warmup,') + 'lesson,trick,quiz,break,quiz,boss';
    if (types !== want) fail(`class ${i} segments ${types}`);
    if (!c.segments.find((s) => s.type === 'trick').tip) fail(`class ${i} has no trick`);
  } else if (plan[i].type === 'mock' && c.segments[0].questions.length !== 15) fail(`mock ${i} size`);
  else if (plan[i].type === 'paper' && !c.segments[0].url.startsWith('https://')) fail(`paper ${i} url`);
  else if (plan[i].type === 'playoff' && (c.segments[0].questions.length !== 25 || c.minutes !== 40)) fail(`playoffs ${i} shape`);
  if (plan[i].type === 'prep' && !c.title.startsWith('🔥 Finals Prep')) fail(`prep ${i} title ${c.title}`);
}

// Streaks: consecutive days add, a gap resets, the same day twice counts once.
const s = Engine.newState();
const cls = Engine.buildClass(s, 0);
const res = { xp: 50, right: 10, total: 10, score: 10, bossWin: true };
Engine.finishClass(s, cls, res, '2026-11-01');
Engine.finishClass(s, Engine.buildClass(s), res, '2026-11-02');
if (s.streak !== 2) fail(`streak should be 2, got ${s.streak}`);
Engine.finishClass(s, Engine.buildClass(s), res, '2026-11-02');
if (s.streak !== 2) fail(`same-day class changed streak to ${s.streak}`);
Engine.finishClass(s, Engine.buildClass(s), res, '2026-11-05');
if (s.streak !== 1) fail(`gap should reset streak, got ${s.streak}`);
// A one-day gap is covered by a timeout.
const t = Engine.newState();
Engine.finishClass(t, Engine.buildClass(t, 0), res, '2026-11-01');
Engine.finishClass(t, Engine.buildClass(t), res, '2026-11-03');
if (t.streak !== 2 || t.timeouts !== 1) fail(`timeout should keep streak: streak ${t.streak}, timeouts ${t.timeouts}`);
if (t.wins !== 2) fail(`wins should be 2, got ${t.wins}`);
// Every Shootaround fact has a clean numeric answer.
for (let k = 0; k < 3000; k++) { const f = ctx.Hoops.nextFact(t); if (!Number.isFinite(f.a) || !f.q || !f.key) fail(`bad fact ${JSON.stringify(f)}`); }
if (s.classIdx !== 4) fail(`classIdx should be 4, got ${s.classIdx}`);
if (!s.badges.includes('perfect') || !s.badges.includes('boss')) fail('badges not awarded');
const L = Engine.levelOf(260);
if (L.lvl !== 3 || L.into !== 10) fail(`levelOf(260) = ${JSON.stringify(L)}`);

// Clutch problems: well-formed, answer among 5 distinct choices, known topic, hints and key.
for (const h of ctx.HARD.problems) {
  if (h.choices.length !== 5 || new Set(h.choices).size !== 5 || !h.choices.includes(h.a)) fail(`hard ${h.id} choices`);
  if (!ids.includes(h.topic)) fail(`hard ${h.id} unknown topic ${h.topic}`);
  if (h.hints.length !== 2 || !h.steps.length || !h.key) fail(`hard ${h.id} missing hints/steps/key`);
  if (h.svg && (!h.svg.startsWith('<svg') || bad(h.svg))) fail(`hard ${h.id} bad diagram`);
}
if (new Set(ctx.HARD.problems.map((h) => h.id)).size !== ctx.HARD.problems.length) fail('duplicate hard ids');
const boss = Engine.buildClass(Engine.newState(), 0).segments.find((x) => x.type === 'boss').questions[0];
if (!boss.hints || !boss.id) fail('clutch shot is not a hand-written problem');

// Plan: every topic appears; length fits the season; real papers at the end.
if (plan.length > 64) fail(`plan too long: ${plan.length}`);
// The season ends Playoffs → Finals Prep → Finals (papers).
const po = Engine.playoffIdx();
if (po < 0 || plan.slice(po + 1, po + 1 + Engine.PREP_GAMES).some((c) => c.type !== 'prep') || plan[po + 1 + Engine.PREP_GAMES].type !== 'paper') fail('playoffs/prep/finals order');
// Finals Prep goes to the topics missed in the Playoffs, most misses first.
const ps = Object.assign(Engine.newState(), { playoff: { byTopic: { circles: [0, 3], logic: [1, 2], mental: [2, 2] } } });
const pt = Engine.prepTopics(ps);
if (pt[0] !== 'circles' || pt[1] !== 'logic' || pt.includes('mental') || pt.length !== Engine.PREP_GAMES) fail(`prep topics ${pt}`);
if (!Engine.buildClass(ps, po + 1).title.includes('Circle')) fail('first prep game should be circles');
// Adaptive difficulty: first-try wins climb slowly, misses drop faster, levels stay 1–3.
let sk = 1;
for (let k = 0; k < 2; k++) sk = Engine.adapt(sk, true, true);
if (Engine.levelFor(sk) !== 2) fail(`two wins should reach level 2, got skill ${sk}`);
sk = Engine.adapt(sk, false, false);
if (Engine.levelFor(sk) !== 1) fail('a miss should drop the level');
for (let k = 0; k < 20; k++) sk = Engine.adapt(sk, true, true);
if (Engine.levelFor(sk) !== 3 || sk > 3.4) fail('skill should top out at level 3');
if (Engine.skillOf(Engine.newState(), 'logic', 1) !== 1 || Engine.skillOf(Engine.newState(), 'logic', 2) !== 2) fail('default skill');
const qz = Engine.buildClass(Engine.newState(), 0).segments.find((x) => x.type === 'quiz').questions;
if (!qz.every((q) => q.adapt && q.level === 1)) fail('first lesson quiz should be adaptive and start easy');
// Version-3 saves past the regular season skip over the new games.
const v3 = Object.assign(Engine.newState(), { planVersion: 3, classIdx: po + 1 });
Engine.migratePlan(v3);
if (v3.classIdx !== po + 2 + Engine.PREP_GAMES || v3.planVersion !== Engine.PLAN_VERSION) fail(`v3 migration ${v3.classIdx}`);
const v3b = Object.assign(Engine.newState(), { planVersion: 3, classIdx: 5 });
Engine.migratePlan(v3b);
if (v3b.classIdx !== 5) fail('v3 migration moved an early save');
for (const id of ids) if (!plan.some((c) => c.topic === id)) fail(`topic ${id} not in plan`);
if (plan.slice(-4).some((c) => c.type !== 'paper')) fail('last 4 games should be real papers');
// Old saves move onto the new plan by what they already finished.
const old = Object.assign(Engine.newState(), { planVersion: 1, log: [
  { kind: 'lesson', title: `${TOPICS.find((x) => x.id === 'mental').emoji} ${TOPICS.find((x) => x.id === 'mental').name}` },
  { kind: 'lesson', title: `${TOPICS.find((x) => x.id === 'angles').emoji} ${TOPICS.find((x) => x.id === 'angles').name}` }] });
Engine.migratePlan(old);
if (old.classIdx !== 2 || old.planVersion !== Engine.PLAN_VERSION) fail(`migration put him at ${old.classIdx}`);

// Asteroid Blaster: every rule, at every level, makes targets and decoys whose 'ok' is right
// (checked independently here) and that come with an explanation.
const gcdT = (a, b) => (b ? gcdT(b, a % b) : a);
const primeT = (n) => n > 1 && [...Array(Math.floor(Math.sqrt(n)) + 1).keys()].slice(2).every((d) => n % d);
for (const [name, make] of Object.entries(Arcade.RULES)) {
  for (let level = 1; level <= 5; level++) for (let w = 0; w < 20; w++) {
    const rule = make(level);
    for (let k = 0; k < 20; k++) {
      const good = k % 2 === 0, it = rule.item(good);
      if (it.ok !== good || !it.why || bad(it.text) || bad(it.why)) { fail(`blaster ${name} L${level}: ${it.text} ok=${it.ok} want ${good} (${rule.banner})`); continue; }
      const n = Number(it.text), m = rule.banner.match(/(\d+)/), x = m && Number(m[1]);
      let truth = null;
      if (name === 'multiples') truth = n % x === 0;
      else if (name === 'factors') truth = x % n === 0;
      else if (name === 'primes') truth = primeT(n);
      else if (name === 'squares') truth = /CUBES/.test(rule.banner) ? Math.round(Math.cbrt(n)) ** 3 === n : Math.round(Math.sqrt(n)) ** 2 === n;
      else if (name === 'fractions') { const [a, b] = it.text.split('/').map(Number), [p, q] = rule.banner.match(/(\d+)\/(\d+)/).slice(1).map(Number); truth = a * q === b * p; }
      else if (name === 'percents') { const v = it.text.includes('/') ? it.text.split('/').reduce((a, b) => a / b) : Number(it.text); truth = Math.abs(v * 100 - x) < 1e-9; }
      if (truth !== good) fail(`blaster ${name} L${level}: ${it.text} is really ${truth} for "${rule.banner}"`);
    }
  }
}
// Zombie Defense: every problem's answer is a whole number and matches the problem when the
// problem is worked out independently here.
const evalT = (t) => Function(`return (${t.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/(\d+)²/g, '($1**2)')})`)();
for (const [name, make] of Object.entries(Arcade.ZOMBIE_RULES)) {
  for (let level = 1; level <= 5; level++) for (let k = 0; k < 400; k++) {
    const p = make(level);
    if (!Number.isInteger(p.answer) || !p.why || bad(p.text) || bad(p.why)) { fail(`zombie ${name} L${level}: ${p.text} = ${p.answer}`); continue; }
    if (p.text.includes('x')) {
      const [l, r] = p.text.split('=').map((sd) => sd.trim().replace(/(\d)x/g, '$1*x').replace(/(\d)\(/g, '$1*('));
      const f = (x) => Function('x', `return (${l.replace(/−/g, '-')}) - (${r.replace(/−/g, '-')})`)(x);
      if (Math.abs(f(p.answer)) > 1e-9) fail(`zombie ${name} L${level}: x = ${p.answer} does not solve ${p.text}`);
    } else if (Math.abs(evalT(p.text) - p.answer) > 1e-9) fail(`zombie ${name} L${level}: ${p.text} is ${evalT(p.text)}, not ${p.answer}`);
  }
}

// Drift Racer: three different choices including the answer, and the answer agrees with an
// independent formula (estimates: the choice closest to the exact value).
const numOf = (t) => Number(String(t).replace(/[$,]|mph|mi|h$/g, '').trim());
for (const [name, make] of Object.entries(Arcade.RACER_RULES)) {
  for (let level = 1; level <= 5; level++) for (let k = 0; k < 400; k++) {
    const p = make(level), c = p.choices;
    if (c.length !== 3 || new Set(c).size !== 3 || !c.includes(p.answer) || !p.why || [p.text, p.why, ...c].some(bad)) { fail(`racer ${name} L${level}: ${p.text} → ${p.answer} [${c}]`); continue; }
    const exact = Function(`return ${p.expr}`)();
    if (p.root) { if (!(p.root[0] < exact && exact < p.root[1])) fail(`racer ${p.text}: √ not between ${p.root}`); }
    else if (p.estimate) { const best = c.slice().sort((a, b) => Math.abs(numOf(a) - exact) - Math.abs(numOf(b) - exact))[0]; if (best !== p.answer) fail(`racer ${p.text}: closest choice is ${best}, not ${p.answer}`); }
    else if (p.answer.includes(':')) { const [a, b] = p.answer.split(':').map(Number); if (Math.abs(a / b - exact) > 1e-9 || gcdT(a, b) !== 1) fail(`racer ${p.text}: ${p.answer}`); }
    else if (Math.abs(numOf(p.answer) - exact) > 1e-6) fail(`racer ${p.text}: answer ${p.answer} but formula gives ${exact}`);
  }
}

// Tower Builder: 4 different choices including the answer, a picture, and an answer that agrees
// with an independent formula (π answers compare the coefficient of π).
for (const [name, make] of Object.entries(Arcade.TOWER_RULES)) {
  for (let k = 0; k < 500; k++) {
    const p = make(), c = p.choices;
    if (c.length !== 4 || new Set(c).size !== 4 || !c.includes(p.answer) || !/^<svg/.test(p.svg) || [p.text, p.why, p.svg, ...c].some(bad)) { fail(`tower ${name}: ${p.text} → ${p.answer} [${c}]`); continue; }
    const exact = Function(`return ${p.expr}`)(), got = Number(p.answer.replace('π', ''));
    if (Math.abs(got - exact) > 1e-9 || p.pi !== p.answer.endsWith('π') && p.pi) fail(`tower ${name}: answer ${p.answer} but formula gives ${exact}`);
  }
}
if (Arcade.TOWER_TIERS.slice(1).some((t) => t.some((id) => !Arcade.TOWER_RULES[id]))) fail('tower tier uses an unknown problem');

// Probability Heist: recount every vault's odds from its setup; the answer must be the single
// best vault. Lock problems: 4 different choices and an answer that matches its formula.
const recount = (o) => {
  const p = o.params;
  if (o.kind === 'bag' || o.kind === 'spinner') return [p.g, p.n];
  if (o.kind === 'die') { const f = { atleast: (d) => d >= p.k, even: (d) => d % 2 === 0, prime: (d) => [2, 3, 5].includes(d), mult3: (d) => d % 3 === 0 }[p.t]; return [[1, 2, 3, 4, 5, 6].filter(f).length, 6]; }
  if (o.kind === 'coins') { let g = 0; for (let m = 0; m < 2 ** p.n; m++) { const h = m.toString(2).split('').filter((c) => c === '1').length; if (p.t === 'all' ? h === p.n : p.t === 'atleast1' ? h >= 1 : h === 1) g++; } return [g, 2 ** p.n]; }
  let g = 0; for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (a + b === p.s) g++; return [g, 36];
};
for (let level = 1; level <= 5; level++) for (let k = 0; k < 400; k++) {
  const q = Arcade.HEIST_RULES.vaults(level);
  const odds = q.options.map((o) => { const [g, t] = recount(o); if (g !== o.good || t !== o.total) fail(`heist ${o.kind} ${JSON.stringify(o.params)}: says ${o.good}/${o.total}, really ${g}/${t}`); return g / t; });
  const best = Math.max(...odds);
  if (odds.indexOf(best) !== q.answer || odds.filter((x) => x === best).length !== 1 || !q.why) fail(`heist vaults L${level}: answer ${q.answer} but odds ${odds}`);
  const l = Arcade.HEIST_RULES.lock(level);
  if (l.choices.length !== 4 || new Set(l.choices).size !== 4 || !l.choices.includes(l.answer) || Function(`return ${l.expr}`)() !== l.answer || bad(l.why)) fail(`heist lock: ${l.text} → ${l.answer} [${l.choices}]`);
}

if (Arcade.BUZZER_MISSIONS.some((m) => !Arcade.ZOMBIE_RULES[m.id])) fail('buzzer mission without a question maker');
if (Arcade.MISSIONS.some((m) => m.rules.some((r) => !Arcade.RULES[r]))) fail('blaster mission uses an unknown rule');

// Variety: the quizzes must not feel repetitive. Every topic has plenty of question types, and over
// simulated seasons (answering everything) there are no repeats inside a game, almost none across
// the season, no long runs of the same type, and most of a quiz is a different type each time.
for (const t of TOPICS) if (t.gens.length < 8) fail(`${t.id} has only ${t.gens.length} question types (want 8+)`);
{
  let gameDup = 0, seasonDup = 0, adj = 0, pairs = 0, qn = 0, share = 0, quizzes = 0; const perTopic = {};
  for (let season = 0; season < 4; season++) {
    const st = Engine.newState(), seenAll = new Set();
    for (let i = 0; i < plan.length; i++) {
      if (plan[i].type !== 'lesson' && plan[i].type !== 'prep') continue;
      const c = Engine.buildClass(st, i);
      const quiz = c.segments.filter((x) => x.type === 'quiz').flatMap((x) => x.questions);
      const warm = c.segments.filter((x) => x.type === 'warmup').flatMap((x) => x.questions);
      const fps = new Set(), tpls = new Set();
      for (const q of quiz) { if (fps.has(q.fp)) gameDup++; fps.add(q.fp); tpls.add(q.tpl); if (seenAll.has(q.fp)) seasonDup++; qn++; }
      for (let k = 1; k < quiz.length; k++) { pairs++; if (quiz[k].tpl === quiz[k - 1].tpl) adj++; }
      share += tpls.size / quiz.length; quizzes++;
      const pt = (perTopic[c.topic] = perTopic[c.topic] || [0, 0]); pt[0] += tpls.size / quiz.length; pt[1]++;
      for (const q of [...quiz, ...warm]) { Engine.record(st, q, true, true); seenAll.add(q.fp); }
    }
  }
  if (gameDup) fail(`${gameDup} repeated questions inside a single game`);
  if (seasonDup / qn > 0.03) fail(`${(100 * seasonDup / qn).toFixed(1)}% of quiz questions repeat one seen earlier in the season (max 3%)`);
  if (adj / pairs > 0.03) fail(`${(100 * adj / pairs).toFixed(1)}% of back-to-back questions are the same type (max 3%)`);
  if (share / quizzes < 0.85) fail(`only ${(100 * share / quizzes).toFixed(0)}% of a quiz is a different type each time (want 85%+)`);
  for (const [id, [sum, n]] of Object.entries(perTopic)) if (sum / n < 0.7) fail(`${id}: quizzes are only ${(100 * sum / n).toFixed(0)}% varied (want 70%+)`);
}

// Reporting a question: kept on his profile, never shown again, with sensible limits.
{
  const st = Engine.newState(), q = Engine.makeQuestion('percents', 2, 0);
  const r = Engine.reportQuestion(st, q, 'Wrong answer', 'lesson');
  if (st.reports.length !== 1 || r.tpl !== q.tpl || r.question !== q.q || r.answer !== q.answer || r.game !== 'lesson') fail('report did not keep the question, type and game');
  if (!st.seenQ.includes(q.fp)) fail('a reported question must count as seen so it is not shown again');
  const hard = Engine.makeHard('logic', []);
  Engine.reportQuestion(st, hard, 'Confusing');
  if (!st.hardSeen.includes(hard.id) || st.reports[1].tpl !== `clutch#${hard.id}`) fail('a reported clutch problem must be marked seen');
  const long = Engine.reportQuestion(st, { ...q, q: 'x'.repeat(5000), choices: ['y'.repeat(5000)] }, 'z'.repeat(99));
  if (long.question.length !== 1000 || long.reason.length !== 40 || long.choices.length !== 600) fail('report fields are not length limited');
  for (let i = 0; i < 150; i++) Engine.reportQuestion(st, q, 'Too easy');
  if (st.reports.length !== 100) fail('reports on the profile are capped at 100');
  if (Engine.REPORT_REASONS.length < 4 || Engine.REPORT_REASONS.some(([k, t]) => !k || t.length > 40)) fail('report reasons');
}

// Shootaround: 24 kinds of fact, every answer a number the keypad can type (it has a decimal point) that matches its second calculation,
// and a 60-second session never repeats a fact or asks the same kind twice in a row.
if (Hoops.FACTS.length < 24) fail(`Shootaround has only ${Hoops.FACTS.length} kinds of fact`);
Hoops.FACTS.forEach((make, gi) => { for (let k = 0; k < 300; k++) { const f = make(); if (!Number.isFinite(f.a) || String(f.a).length > 7 || bad(f.q) || (f.chk !== undefined && f.chk !== f.a)) { fail(`fact #${gi} ${f.q}: a=${f.a} chk=${f.chk}`); break; } } });
{
  const kindsSeen = new Set(); let repeatKey = 0, sameKind = 0, sessions = 0;
  for (let s = 0; s < 200; s++) {
    const st = { facts: {} }, recent = { kinds: [], keys: [] }; let lastKind = null;
    for (let k = 0; k < 30; k++) {
      const f = Hoops.nextFact(st, recent), kind = Hoops.kindOf(f.q);
      if (recent.keys.includes(f.key)) repeatKey++;
      if (kind === lastKind) sameKind++;
      kindsSeen.add(kind); lastKind = kind; Hoops.noteFact(recent, f);
      Hoops.recordFact(st, f, k % 3 !== 0, 1500); // some misses, so the spaced-repetition path runs too
    }
    sessions++;
  }
  if (repeatKey) fail(`Shootaround repeated a fact inside a session ${repeatKey} times`);
  if (sameKind) fail(`Shootaround asked the same kind twice in a row ${sameKind} times`);
  if (kindsSeen.size < 18) fail(`Shootaround only showed ${kindsSeen.size} kinds of fact`);
}

if (failures) { console.error(`\n${failures} failure(s)`); process.exit(1); }
// Concept Studio clips: unique ids, a real topic, frames with a picture and a sentence, and a
// check whose answer is one of its (distinct) options.
const clipIds = new Set();
for (const c of CLIPS) {
  if (clipIds.has(c.id)) fail(`clip ${c.id}: duplicate id`); clipIds.add(c.id);
  if (!ids.includes(c.topic)) fail(`clip ${c.id}: unknown topic ${c.topic}`);
  if (!c.title || !c.emoji || !c.remember || !c.frames.length) fail(`clip ${c.id}: missing title, emoji, takeaway or frames`);
  c.frames.forEach((f, i) => { if (!/^<svg/.test(f.svg) || !f.say || bad(f.svg) || bad(f.say)) fail(`clip ${c.id} frame ${i + 1}: bad svg or text`); });
  const o = c.check.options;
  if (!o.includes(c.check.answer) || new Set(o).size !== o.length || !c.check.why) fail(`clip ${c.id}: check answer/options`);
}
console.log(`OK — ${TOPICS.length} topics, ${TOPICS.reduce((n, t) => n + t.gens.length, 0)} question types, ${plan.length} classes, ${CLIPS.length} clips`);
