// Run with: node amc8-class/tests/email-test.mjs
import assert from 'node:assert/strict';
import { buildEmail, localNow } from '../supabase/functions/daily-report/email.js';

const base = { totalClasses: 56, contestDate: '2027-01-21', streak: 3, bestStreak: 4, classIdx: 5,
  mastery: { Logic: { pct: 80, n: 10 }, Fractions: { pct: 40, n: 6 }, Circles: { pct: 60, n: 2 } }, mistakes: { careless: 3, concept: 1 } };
const arjun = { ...base, name: 'Arjun', recent: [{ day: '2026-11-02', title: '🧠 Logic', kind: 'lesson', right: 9, total: 11 }, { day: '2026-11-01', title: 'Practice Contest', kind: 'mock', right: 11, total: 15 }] };
const mia = { ...base, name: 'Mia', recent: [] };

const one = buildEmail([arjun], '2026-11-02');
assert.equal(one.subject, 'Math Hoops update for Arjun — 2026-11-02: ✅ all games done');
assert.match(one.text, /Today: 🧠 Logic \(9\/11\)/);
assert.match(one.text, /80 days to the AMC 8/);
assert.match(one.text, /Strongest: Logic 80%\n/);
assert.match(one.text, /Needs work: Fractions 40%\n/);
assert.doesNotMatch(one.text, /Circles/, 'topics with under 5 questions are left out');
assert.match(one.text, /Latest contest: Practice Contest 11\/15/);
assert.match(one.text, /careless slips/);

const two = buildEmail([arjun, mia], '2026-11-02');
assert.match(two.subject, /Arjun & Mia .* 🟡 some games done/);
assert.match(two.text, /🏀 Mia\n⚠️ No game today/);
assert.equal(buildEmail([{}], '2026-11-02'), null, 'no named kids → no email');

const t = localNow('America/New_York', new Date('2026-11-03T01:30:00Z'));
assert.deepEqual({ ...t }, { date: '2026-11-02', hour: 20 }, '01:30 UTC is 8:30 PM the day before in New York');
console.log('OK — email builder');
