// Math Hoops progress sync + daily parent email, for a Google Sheet you own.
// Paste this into the Sheet's Extensions → Apps Script, then follow sync/SETUP.md.
//
// The app POSTs its saved state after every game; this script keeps:
//   • "Games":   one row per finished game (date, game, score, points, streak)
//   • "Summary": the latest topic mastery and mistake counts
//   • "State":   the full saved state, so progress can be restored on any device
// and emails a daily summary to RECIPIENTS.

const RECIPIENTS = 'bharat.r04@gmail.com, renu.rathi23@gmail.com';
const CHUNK = 40000; // characters per cell (Sheets allows 50,000)

function doPost(e) {
  const d = JSON.parse(e.postData.contents);
  const ss = SpreadsheetApp.getActive();
  if (d.state) saveState_(ss, d.state);
  if (d.report) {
    PropertiesService.getScriptProperties().setProperty('report', JSON.stringify(d.report));
    writeSummary_(ss, d.report);
  }
  if (d.event) appendGame_(ss, d.event, d.report || {});
  return ContentService.createTextOutput('ok');
}

// The app reads its state back from here on a new device.
function doGet() {
  return ContentService.createTextOutput(loadState_() || 'null').setMimeType(ContentService.MimeType.JSON);
}

function sheet_(ss, name, header) {
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    if (header) { sh.appendRow(header); sh.setFrozenRows(1); sh.getRange(1, 1, 1, header.length).setFontWeight('bold'); }
  }
  return sh;
}

function saveState_(ss, state) {
  const json = JSON.stringify(state), sh = sheet_(ss, 'State');
  const parts = [];
  for (let i = 0; i < json.length; i += CHUNK) parts.push([json.slice(i, i + CHUNK)]);
  sh.clearContents();
  sh.getRange(1, 1, parts.length, 1).setValues(parts);
}

function loadState_() {
  const sh = SpreadsheetApp.getActive().getSheetByName('State');
  if (!sh || sh.getLastRow() === 0) return '';
  return sh.getRange(1, 1, sh.getLastRow(), 1).getValues().map((r) => r[0]).join('');
}

function appendGame_(ss, ev, rep) {
  const sh = sheet_(ss, 'Games', ['Date', 'Game', 'Type', 'Right', 'Out of', 'Points', 'Streak', 'Level']);
  sh.appendRow([ev.day, ev.title, ev.kind, ev.right, ev.total, ev.xp, rep.streak || '', rep.level || '']);
}

function writeSummary_(ss, rep) {
  const sh = sheet_(ss, 'Summary');
  sh.clearContents();
  const rows = [
    ['Player', rep.name], ['Updated', rep.updatedAt], ['Games finished', `${rep.classIdx} of ${rep.totalClasses}`],
    ['Streak (best)', `${rep.streak} (${rep.bestStreak})`], ['Contest date', rep.contestDate], ['', ''], ['Topic', 'First-try accuracy %'],
  ];
  Object.entries(rep.mastery || {}).sort((a, b) => a[1].pct - b[1].pct).forEach(([t, m]) => rows.push([t, `${m.pct}% (${m.n} questions)`]));
  rows.push(['', ''], ['Why answers went wrong', 'Count']);
  const names = { careless: 'Careless slip', concept: "Didn't know how", trick: 'Forgot the trick', time: 'Ran out of time' };
  Object.entries(rep.mistakes || {}).forEach(([k, v]) => rows.push([names[k] || k, v]));
  sh.getRange(1, 1, rows.length, 2).setValues(rows);
}

// ── Daily email (scheduled by setup())
function sendDailyReport() {
  const raw = PropertiesService.getScriptProperties().getProperty('report');
  const tz = Session.getScriptTimeZone();
  const today = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
  if (!raw) {
    MailApp.sendEmail(RECIPIENTS, `AMC 8 update — ${today}: no progress yet`, 'No progress has been synced yet. Check that the sync URL is saved on the app\'s Parent page.');
    return;
  }
  const r = JSON.parse(raw);
  const games = (r.recent || []).filter((g) => g.day === today);
  const days = Math.max(0, Math.round((new Date(r.contestDate + 'T00:00:00') - new Date(today + 'T00:00:00')) / 86400000));
  const topics = Object.entries(r.mastery || {}).filter(([, m]) => m.n >= 5).sort((a, b) => b[1].pct - a[1].pct);
  const fmt = (list) => list.map(([t, m]) => `${t} ${m.pct}%`).join(', ') || 'not enough games yet';
  const mock = (r.recent || []).filter((g) => g.kind === 'mock' || g.kind === 'paper').pop();
  const mis = Object.entries(r.mistakes || {}).sort((a, b) => b[1] - a[1])[0];
  const tips = { careless: 'careless slips: slow down and double-check the easy steps', concept: "didn't know how: those topics come back in his warm-ups", trick: 'forgot the trick: flip through the Playbook cards together', time: 'ran out of time: practice skipping and coming back' };
  // Split into strongest and weakest without listing a topic twice.
  const strong = topics.slice(0, Math.min(3, Math.ceil(topics.length / 2)));
  const weak = topics.slice(strong.length).slice(-3).reverse();
  const weakest = weak[0];
  const lines = [
    games.length ? `✅ Today: ${games.map((g) => `${g.title} (${g.right}/${g.total})`).join(', ')}` : '⚠️ No game today. A short one tomorrow keeps the streak alive (he has timeouts to cover one missed day).',
    `🔥 Streak: ${r.streak} days (best ${r.bestStreak}) · Game ${r.classIdx} of ${r.totalClasses} · ${days} days to the AMC 8`,
    `💪 Strongest: ${fmt(strong)}`,
    weak.length ? `🎯 Needs work: ${fmt(weak)}` : '',
    mock ? `🏆 Latest contest: ${mock.title} ${mock.right}/${mock.total}` : '',
    mis && mis[1] > 0 ? `🧩 Most common mistake: ${tips[mis[0]] || mis[0]}` : '',
    weakest ? `💡 Tonight's idea: ask him to explain one ${weakest[0]} problem to you. Teaching it locks it in.` : '',
  ].filter(Boolean);
  MailApp.sendEmail(RECIPIENTS, `AMC 8 update for ${r.name} — ${today}: ${games.length ? '✅ game done' : '⚠️ no game today'}`, lines.join('\n\n'));
}

// Run once: names the sheets and schedules the daily email for about 8 PM in the script's time zone.
function setup() {
  const ss = SpreadsheetApp.getActive();
  sheet_(ss, 'Games', ['Date', 'Game', 'Type', 'Right', 'Out of', 'Points', 'Streak', 'Level']);
  sheet_(ss, 'Summary'); sheet_(ss, 'State');
  ScriptApp.getProjectTriggers().filter((t) => t.getHandlerFunction() === 'sendDailyReport').forEach((t) => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('sendDailyReport').timeBased().everyDays(1).atHour(20).create();
}
