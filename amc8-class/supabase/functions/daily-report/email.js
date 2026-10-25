// Builds the daily parent email from each kid's saved report. Pure JS so it runs in
// Supabase's Deno edge function and in Node tests alike.

const TIPS = {
  careless: 'careless slips: slow down and double-check the easy steps',
  concept: "didn't know how: those topics come back in the warm-ups",
  trick: 'forgot the trick: flip through the Playbook cards together',
  time: 'ran out of time: practice skipping and coming back',
};

function kidSection(r, today) {
  const games = (r.recent || []).filter((g) => g.day === today);
  const days = Math.max(0, Math.round((new Date(r.contestDate + 'T00:00:00Z') - new Date(today + 'T00:00:00Z')) / 86400000));
  const topics = Object.entries(r.mastery || {}).filter(([, m]) => m.n >= 5).sort((a, b) => b[1].pct - a[1].pct);
  // Split into strongest and weakest without listing a topic twice.
  const strong = topics.slice(0, Math.min(3, Math.ceil(topics.length / 2)));
  const weak = topics.slice(strong.length).slice(-3).reverse();
  const fmt = (list) => list.map(([t, m]) => `${t} ${m.pct}%`).join(', ');
  const contest = (r.recent || []).filter((g) => g.kind === 'mock' || g.kind === 'paper').pop();
  const mis = Object.entries(r.mistakes || {}).sort((a, b) => b[1] - a[1])[0];
  const lines = [
    `🏀 ${r.name}`,
    games.length ? `✅ Today: ${games.map((g) => `${g.title} (${g.right}/${g.total})`).join(', ')}` : '⚠️ No game today. A short one tomorrow keeps the streak alive (timeouts cover one missed day).',
    `🔥 Streak: ${r.streak || 0} days (best ${r.bestStreak || 0}) · Game ${r.classIdx || 0} of ${r.totalClasses || '?'} · ${days} days to the AMC 8`,
    strong.length ? `💪 Strongest: ${fmt(strong)}` : '',
    weak.length ? `🎯 Needs work: ${fmt(weak)}` : '',
    contest ? `🏆 Latest contest: ${contest.title} ${contest.right}/${contest.total}` : '',
    mis && mis[1] > 0 ? `🧩 Most common mistake: ${TIPS[mis[0]] || mis[0]}` : '',
    weak[0] ? `💡 Tonight's idea: ask ${r.name} to explain one ${weak[0][0]} problem to you. Teaching it locks it in.` : '',
  ];
  return { played: games.length > 0, text: lines.filter(Boolean).join('\n') };
}

export function buildEmail(reports, today) {
  const kids = reports.filter((r) => r && r.name);
  if (!kids.length) return null;
  const parts = kids.map((r) => kidSection(r, today));
  const names = kids.map((r) => r.name).join(' & ');
  const status = parts.every((p) => p.played) ? '✅ all games done' : parts.some((p) => p.played) ? '🟡 some games done' : '⚠️ no game today';
  return { subject: `Math Hoops update for ${names} — ${today}: ${status}`, text: parts.map((p) => p.text).join('\n\n— — —\n\n') };
}

// The date and hour right now in a parent's time zone.
export function localNow(timeZone, now = new Date()) {
  const date = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  const hour = Number(new Intl.DateTimeFormat('en-US', { timeZone, hour: 'numeric', hourCycle: 'h23' }).format(now));
  return { date, hour };
}
