// Run with: node amc8-class/tests/sync-test.mjs
// Exercises sync/Code.gs against small fakes of the Apps Script services.
import vm from 'node:vm';
import fs from 'node:fs';
import assert from 'node:assert/strict';

const sheets = {}, props = {}, mail = [], triggers = [];
const mkSheet = (name) => {
  const rows = [];
  return { name, rows,
    appendRow: (r) => rows.push(r), setFrozenRows() {}, clearContents: () => { rows.length = 0; },
    getLastRow: () => rows.length,
    getRange: (r, c, n, w) => ({ setFontWeight() {}, setValues: (vals) => vals.forEach((v, i) => (rows[r - 1 + i] = v)), getValues: () => rows.slice(r - 1, r - 1 + n) }) };
};
const ss = { getSheetByName: (n) => sheets[n], insertSheet: (n) => (sheets[n] = mkSheet(n)) };
const ctx = vm.createContext({
  JSON, Math, Date, Object,
  SpreadsheetApp: { getActive: () => ss },
  PropertiesService: { getScriptProperties: () => ({ setProperty: (k, v) => (props[k] = v), getProperty: (k) => props[k] }) },
  ContentService: { MimeType: { JSON: 'json' }, createTextOutput: (t) => ({ t, setMimeType() { return this; } }) },
  MailApp: { sendEmail: (to, subj, body) => mail.push({ to, subj, body }) },
  Session: { getScriptTimeZone: () => 'America/New_York' },
  Utilities: { formatDate: () => '2026-11-02' },
  ScriptApp: { getProjectTriggers: () => [], deleteTrigger() {}, newTrigger: (f) => ({ timeBased: () => ({ everyDays: () => ({ atHour: (h) => ({ create: () => triggers.push([f, h]) }) }) }) }) },
});
vm.runInContext(fs.readFileSync(new URL('../sync/Code.gs', import.meta.url), 'utf8'), ctx);

ctx.setup();
assert.equal(JSON.stringify(triggers), '[["sendDailyReport",20]]');
ctx.sendDailyReport();
assert.match(mail[0].subj, /no progress yet/);

const big = 'x'.repeat(95000); // state bigger than one cell
const state = { name: 'Arjun', savedAt: 5, pad: big };
const report = { name: 'Arjun', streak: 3, bestStreak: 4, level: 2, classIdx: 5, totalClasses: 56, contestDate: '2027-01-21',
  recent: [{ day: '2026-11-02', title: '🧠 Logic & Puzzles', kind: 'lesson', right: 9, total: 11, xp: 120 }],
  mastery: { 'Logic & Puzzles': { pct: 80, n: 10 }, Fractions: { pct: 40, n: 6 } }, mistakes: { careless: 3, concept: 1, trick: 0, time: 0 } };
assert.equal(ctx.doPost({ postData: { contents: JSON.stringify({ state, report, event: report.recent[0] }) } }).t, 'ok');
assert.equal(sheets.State.rows.length, 3, 'state split across cells');
assert.deepEqual(JSON.parse(ctx.doGet().t), state, 'state round-trips');
assert.equal(JSON.stringify(sheets.Games.rows[1].slice(0, 6)), JSON.stringify(['2026-11-02', '🧠 Logic & Puzzles', 'lesson', 9, 11, 120]));
assert.ok(sheets.Summary.rows.some((r) => r[0] === 'Fractions'));

ctx.sendDailyReport();
const m = mail[1];
assert.equal(m.to, 'bharat.r04@gmail.com, renu.rathi23@gmail.com');
assert.match(m.subj, /Arjun — 2026-11-02: ✅ game done/);
assert.match(m.body, /80 days to the AMC 8/);
assert.match(m.body, /Strongest: Logic & Puzzles 80%\n/); assert.match(m.body, /Needs work: Fractions 40%\n/);
assert.match(m.body, /careless slips/);
console.log('OK — sync script\n---\n' + m.subj + '\n' + m.body);
