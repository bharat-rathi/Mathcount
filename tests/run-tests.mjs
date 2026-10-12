// Run with: node tests/run-tests.mjs
import assert from 'node:assert/strict';
import { TOPICS, generateQuestion } from '../lib/topics.js';
import { checkAnswer, specToString, specValue, matchesValue } from '../lib/answers.js';
import { newState, startSession, gradeCurrent, advance, finishSession, liveDayStreak, buildDailySet, dailyUnlock, unlockUntil, dashboardData, FOREVER_MS } from '../lib/engine.js';
import { lockStatus } from '../lib/blocking.js';
import { makeRng } from '../lib/mathutil.js';

let failures = 0;
const fail = (msg) => { failures++; if (failures < 40) console.error('FAIL', msg); };

// ── Answer checker
const cases = [
  ['3/4', { kind: 'frac', n: 3, d: 4 }, true],
  ['6/8', { kind: 'frac', n: 3, d: 4 }, false],
  ['0.75', { kind: 'frac', n: 3, d: 4 }, false],
  ['-3/4', { kind: 'frac', n: -3, d: 4 }, true],
  ['1 1/2', { kind: 'frac', n: 3, d: 2 }, false],
  ['3/2', { kind: 'frac', n: 3, d: 2 }, true],
  ['12', { kind: 'frac', n: 12, d: 1 }, true],
  ['1,200', { kind: 'num', value: 1200 }, true],
  ['$177', { kind: 'num', value: 177 }, true],
  ['177.00', { kind: 'num', value: 177 }, true],
  ['5√3', { kind: 'radical', a: 5, b: 3, d: 1 }, true],
  ['5sqrt3', { kind: 'radical', a: 5, b: 3, d: 1 }, true],
  ['5 sqrt 3', { kind: 'radical', a: 5, b: 3, d: 1 }, true],
  ['√75', { kind: 'radical', a: 5, b: 3, d: 1 }, false],
  ['√2', { kind: 'radical', a: 1, b: 2, d: 1 }, true],
  ['16π', { kind: 'pi', n: 16, d: 1 }, true],
  ['16pi', { kind: 'pi', n: 16, d: 1 }, true],
  ['16', { kind: 'pi', n: 16, d: 1 }, false],
  ['50.27', { kind: 'pi', n: 16, d: 1 }, false],
  ['9π/2', { kind: 'pi', n: 9, d: 2 }, true],
  ['9/2π', { kind: 'pi', n: 9, d: 2 }, true],
  ['π', { kind: 'pi', n: 1, d: 1 }, true],
  ['banana', { kind: 'num', value: 3 }, false],
  ['−7', { kind: 'num', value: -7 }, true],
];
for (const [raw, spec, want] of cases) {
  const got = checkAnswer(raw, spec).correct;
  if (got !== want) fail(`checkAnswer(${raw}, ${JSON.stringify(spec)}) = ${got}, want ${want}`);
}
assert.ok(checkAnswer('√75', { kind: 'radical', a: 5, b: 3, d: 1 }).formIssue);
assert.ok(checkAnswer('6/8', { kind: 'frac', n: 3, d: 4 }).formIssue);

// ── Generators
const N = 400;
let generated = 0;
for (const topic of TOPICS) {
  for (const v of topic.variants) {
    for (let level = 1; level <= 3; level++) {
      for (let i = 0; i < N; i++) {
        const seed = (i * 7919 + level * 104729 + v.id.length * 31) >>> 0;
        let q;
        try { q = generateQuestion(topic.id, level, seed, v.id); } catch (e) { fail(`${topic.id}/${v.id} threw ${e.message}`); break; }
        generated++;
        const tag = `${topic.id}/${v.id} L${level} seed ${seed}`;
        const val = specValue(q.answer);
        if (!Number.isFinite(val) && q.answer.kind !== 'text') fail(`${tag}: non-finite answer ${JSON.stringify(q.answer)}`);
        const text = [q.q, ...(q.steps || []), q.tip, ...(q.mistakes || []).map((m) => m.why)].join(' ');
        if (/NaN|undefined|Infinity|\[object/.test(text)) fail(`${tag}: bad text: ${text.slice(0, 300)}`);
        if (!q.steps?.length || !q.tip) fail(`${tag}: missing steps/tip`);
        const own = specToString(q.answer);
        const res = checkAnswer(own, q.answer);
        if (!res.correct) fail(`${tag}: own answer "${own}" rejected ${JSON.stringify(res)} — ${q.q}`);
        if (q.answer.kind === 'frac' && q.answer.d !== 1 && !q.form) fail(`${tag}: fraction answer without form instruction`);
        if (q.answer.kind === 'frac' && q.answer.d === 1 && q.answer.n !== Math.round(q.answer.n)) fail(`${tag}: bad int`);
        if (q.answer.kind === 'num' && !Number.isInteger(q.answer.value) && Math.abs(q.answer.value * 100 - Math.round(q.answer.value * 100)) > 1e-6) fail(`${tag}: messy decimal answer ${q.answer.value}`);
        // The bold final answer in the steps should match the real answer.
        const last = q.steps.join(' ');
        if (!last.includes('<b>')) fail(`${tag}: no bolded final answer`);
      }
    }
  }
}

// Every step's bold answer contains the answer string (spot check on a sample)
for (const topic of TOPICS) {
  for (const v of topic.variants) {
    const q = generateQuestion(topic.id, 3, 12345, v.id);
    const bold = (q.steps.join(' ').match(/<b>(.*?)<\/b>/g) || []).map((b) => b.replace(/<\/?b>|<[^>]+>/g, ''));
    const want = specToString(q.answer).replace(/\//g, '');
    const ok = bold.some((b) => b.replace(/[^0-9a-z√π\-.]/gi, '').includes(want.replace(/[^0-9a-z√π\-.]/gi, '')));
    if (!ok) fail(`${topic.id}/${v.id}: final bold "${bold}" doesn't show answer "${specToString(q.answer)}"`);
  }
}

// ── Engine: simulate 20 days of a student who is weak in geometry
const state = newState();
const rng = makeRng(42);
const start = new Date(2026, 9, 1);
for (let day = 0; day < 20; day++) {
  if (day === 12) continue; // a missed day breaks the streak
  const d = new Date(start); d.setDate(start.getDate() + day);
  const key = d.toISOString().slice(0, 10);
  startSession(state, key, 'daily', rng.next);
  assert.equal(state.session.questions.length, 10);
  for (;;) {
    const q = state.session.questions[state.session.index];
    const weak = ['circles', 'pythag', 'angles', 'area'].includes(q.topicId);
    const right = rng.next() < (weak ? 0.3 : 0.9);
    gradeCurrent(state, right ? specToString(q.answer) : '99999');
    if (advance(state)) break;
  }
  finishSession(state);
}
assert.equal(state.streaks.day.best, 12);
assert.equal(state.streaks.day.current, 7);
assert.equal(liveDayStreak(state, '2026-10-20'), 7);
assert.equal(liveDayStreak(state, '2026-10-25'), 0);
const geo = ['circles', 'pythag', 'angles', 'area'];
const set = buildDailySet(state, '2026-10-21', rng.next);
const geoCount = set.filter((q) => geo.includes(q.topicId)).length;
console.log(`weak-topic questions in next daily set: ${geoCount}/10`);
assert.ok(geoCount >= 4, 'adaptive selection should favor weak topics');
console.log('badges:', Object.keys(state.badges).join(', '));
console.log('xp:', state.xp);

// ── Mistake diagnosis shows up
const st2 = newState();
st2.session = { date: '2026-10-12', kind: 'daily', index: 0, questions: [generateQuestion('circles', 2, 7, 'annulus')], results: [] };
const q0 = st2.session.questions[0];
const wrong = q0.mistakes[0].value;
const { result } = gradeCurrent(st2, specToString(wrong));
assert.equal(result.correct, false);
assert.ok(result.why[0].includes('diameter'), 'should explain the radius/diameter mistake');

// ── Lock rules
{
  const st = newState();
  assert.equal(lockStatus(st).locked, false, 'no lock before the parent sets a PIN');
  st.parent.pinHash = 'x';
  assert.equal(lockStatus(st).locked, true, 'locked once setup is done');
  const now = new Date(2026, 9, 12, 16, 30).getTime();
  const u = dailyUnlock(st, now);
  assert.equal(u.unlockedUntil, new Date(2026, 9, 13, 0, 0).getTime(), 'default: unlocked until midnight');
  st.lock = u;
  assert.equal(lockStatus(st, now + 3600000).locked, false);
  assert.equal(lockStatus(st, u.unlockedUntil + 1).locked, true, 'locks again after midnight');
  st.lock = { unlockedUntil: 0 };
  st.settings.afterDaily = 'minutes'; st.settings.rewardUnlockMinutes = 45;
  assert.equal(dailyUnlock(st, now).unlockedUntil, now + 45 * 60000);
  st.settings.afterDaily = 'locked';
  assert.equal(dailyUnlock(st, now), null);
}

// ── Parent unlock times
{
  const now = new Date(2026, 9, 12, 16, 30).getTime();
  assert.equal(unlockUntil('30', '', now), now + 30 * 60000);
  assert.equal(unlockUntil('time', '20:15', now), new Date(2026, 9, 12, 20, 15).getTime());
  assert.equal(unlockUntil('time', '07:00', now), new Date(2026, 9, 13, 7, 0).getTime(), 'earlier time means tomorrow');
  assert.equal(unlockUntil('forever', '', now), now + FOREVER_MS);
  assert.equal(unlockUntil('time', '', now), null);
}

// ── Dashboard (uses the 20-day geometry-weak student simulated above)
{
  const d = dashboardData(state, '2026-10-20');
  assert.equal(d.series.length, 30);
  assert.equal(d.series.at(-1).date, '2026-10-20');
  assert.equal(d.series.filter((p) => p.done).length, 19);
  assert.equal(d.series.find((p) => p.date === '2026-10-13').total, 0, 'the skipped day has no answers');
  const geo = ['circles', 'pythag', 'angles', 'area'];
  assert.ok(d.needsHelp.length > 0 && d.needsHelp.every((t) => t.status !== 'strong'));
  assert.ok(geo.includes(d.needsHelp[0].id), `weakest topic should be geometry, got ${d.needsHelp[0].id}`);
  assert.ok(d.doingWell.every((t) => !geo.includes(t.id) && t.recentAcc >= 0.8));
  assert.equal(d.totals.answered, 190);
  assert.ok(d.misses.length > 0 && d.misses[0].q && !/<[a-z]/.test(d.misses[0].q), 'misses are stored as plain text');
  console.log('needs help:', d.needsHelp.map((t) => `${t.id} ${Math.round(t.recentAcc * 100)}%`).join(', '));
}

console.log(`${generated} questions generated across ${TOPICS.length} topics / ${TOPICS.reduce((a, t) => a + t.variants.length, 0)} variants`);
if (failures) { console.error(`${failures} failures`); process.exit(1); }
console.log('All tests passed');
