// Run with: node amc8-class/tests/test.mjs
import vm from 'node:vm';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'js');
const ctx = vm.createContext({ console, Math, Date });
for (const f of ['util.js', 'viz.js', 'hoops.js', 'topics-number.js', 'topics-algebra.js', 'topics-geometry.js', 'topics-logic.js', 'engine.js']) {
  vm.runInContext(fs.readFileSync(path.join(dir, f), 'utf8'), ctx, { filename: f });
}
const { TOPICS, Engine, U } = ctx;

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
        if (!q.q || bad(q.q) || bad(q.answer) || q.steps.some(bad)) { fail(`bad text ${where} ${q.steps.join(' ')}`); break; }
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
  if (plan[i].type === 'lesson') {
    const types = c.segments.map((s) => s.type).join(',');
    const want = 'shootaround,' + (i === 0 ? '' : 'warmup,') + 'lesson,trick,quiz,break,quiz,boss';
    if (types !== want) fail(`class ${i} segments ${types}`);
    if (!c.segments.find((s) => s.type === 'trick').tip) fail(`class ${i} has no trick`);
  } else if (c.segments[0].questions.length !== 15) fail(`mock ${i} size`);
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

if (failures) { console.error(`\n${failures} failure(s)`); process.exit(1); }
console.log(`OK — ${TOPICS.length} topics, ${TOPICS.reduce((n, t) => n + t.gens.length, 0)} question types, ${plan.length} classes`);
