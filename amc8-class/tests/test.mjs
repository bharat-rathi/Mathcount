// Run with: node amc8-class/tests/test.mjs
import vm from 'node:vm';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'js');
const ctx = vm.createContext({ console, Math, Date });
for (const f of ['util.js', 'viz.js', 'hoops.js', 'topics-number.js', 'topics-algebra.js', 'topics-geometry.js', 'topics-logic.js', 'topics-counting.js', 'topics-visual.js', 'hard.js', 'hard-diagrams.js', 'studio-counting.js', 'studio-geometry.js', 'studio-algebra.js', 'studio-number-theory.js', 'studio-arithmetic.js', 'studio-logic.js', 'arcade.js', 'engine.js']) {
  vm.runInContext(fs.readFileSync(path.join(dir, f), 'utf8'), ctx, { filename: f });
}
const { TOPICS, Engine, U, CLIPS, Arcade } = ctx;

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
if (Arcade.MISSIONS.some((m) => m.rules.some((r) => !Arcade.RULES[r]))) fail('blaster mission uses an unknown rule');

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
