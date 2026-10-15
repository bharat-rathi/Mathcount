import { TOPICS, TOPIC_BY_ID } from './lib/topics.js';
import {
  dateKey, startSession, gradeCurrent, advance, finishSession, liveDayStreak, rankFor,
  GLOBAL_BADGES, TIERS, TIER_RULES, topicTier, recentAccuracy, newState, dailyUnlock,
  dashboardData, unlockUntil,
} from './lib/engine.js';
import { loadState, saveState, setPin, verifyPin } from './lib/store.js';
import { lockStatus, cleanDomain } from './lib/blocking.js';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let state;
let parentAuthed = false;
let parentTimer = null;
let timerHandle = null;

// ───────────────────────────── Navigation

function show(view) {
  document.querySelectorAll('.view').forEach((v) => (v.hidden = true));
  $(`view-${view}`).hidden = false;
  document.body.dataset.view = view;
  if (view !== 'quiz') stopTimer();
  if (view === 'home') renderHome();
  if (view === 'badges') renderBadges();
  if (view === 'parent') renderParent();
  window.scrollTo(0, 0);
}

document.addEventListener('click', (e) => {
  const go = e.target.closest('[data-go]');
  if (!go) return;
  if (!state.parent?.pinHash) return show('setup');
  show(go.dataset.go);
});

async function save() {
  await saveState(state);
}

// ───────────────────────────── Lock chip

function renderLockChip() {
  const st = lockStatus(state);
  const chip = $('lock-chip');
  if (st.locked) {
    chip.textContent = '🔒 Browser locked';
    chip.className = 'chip locked';
  } else if (st.mode === 'setup') {
    chip.textContent = '⚙️ Setup — not locked yet';
    chip.className = 'chip';
  } else {
    chip.textContent = `🔓 ${unlockText(st)}`;
    chip.className = 'chip unlocked';
  }
  $('unlock-btn').hidden = !st.locked;
  $('relock-btn').hidden = st.locked || st.mode === 'setup';
}

function unlockText(st) {
  if (st.until - Date.now() > 7 * 86400000) return 'Unlocked until a parent locks it';
  const midnight = new Date(); midnight.setHours(24, 0, 0, 0);
  if (st.until === midnight.getTime()) return 'Unlocked for the rest of today';
  const t = new Date(st.until).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const tomorrow = new Date(st.until).toDateString() !== new Date().toDateString() ? ' tomorrow' : '';
  return `${st.mode === 'reward' ? 'Reward time' : 'Unlocked'} until ${t}${tomorrow}`;
}

// ───────────────────────────── Setup

$('setup-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = $('setup-name').value.trim();
  const pin = $('setup-pin').value, pin2 = $('setup-pin2').value;
  if (!/^\d{4,8}$/.test(pin)) return ($('setup-error').textContent = 'PIN must be 4–8 digits.');
  if (pin !== pin2) return ($('setup-error').textContent = "PINs don't match.");
  state.profile.name = name;
  await setPin(state, pin);
  await save();
  toast('All set! The browser is now locked to practice.', '✅');
  show('home');
});

// ───────────────────────────── Home

function renderHome() {
  const today = dateKey();
  const name = state.profile.name || 'Mathlete';
  const doneToday = state.days[today]?.completed;
  const s = state.session;
  const inProgress = s && !s.finished && s.kind === 'daily' && s.date === today;
  const hr = new Date().getHours();
  $('greeting').textContent = `${hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening'}, ${name}!`;

  const streak = liveDayStreak(state, today);
  if (doneToday) {
    const st = lockStatus(state);
    $('today-msg').textContent = `Today's set is done — ${state.days[today].correct}/${state.days[today].total} correct. 🎉 ${st.locked ? '' : `${unlockText(st)} — enjoy! `}Come back tomorrow to keep your ${streak}-day streak going!`;
    $('start-daily').textContent = '✅ Done for today';
    $('start-daily').disabled = true;
    $('start-extra').hidden = false;
  } else {
    $('today-msg').textContent = inProgress
      ? `You're on question ${s.index + 1} of ${s.questions.length}. Let's finish it!`
      : streak > 0
        ? `Your ${streak}-day streak is waiting. 10 problems, picked for the topics you most need.`
        : `10 problems today, picked for the topics you most need. Let's start a streak!`;
    $('start-daily').textContent = inProgress ? `▶ Continue (${s.index + 1}/${s.questions.length})` : "▶ Start today's 10";
    $('start-daily').disabled = false;
    $('start-extra').hidden = true;
  }

  $('st-day').textContent = streak;
  $('st-day-best').textContent = `(best ${state.streaks.day.best})`;
  $('st-correct').textContent = state.streaks.correct.current;
  $('st-correct-best').textContent = `(best ${state.streaks.correct.best})`;
  $('st-total').textContent = Object.values(state.topics).reduce((a, t) => a + t.correct, 0);

  const rank = rankFor(state.xp);
  $('rank-icon').textContent = rank.icon;
  $('rank-name').textContent = `${rank.name} · ${state.xp} XP`;
  $('rank-bar').style.width = `${Math.round(rank.progress * 100)}%`;
  $('rank-next').textContent = rank.next ? `${rank.next.xp - state.xp} XP to ${rank.next.name}` : 'Top rank reached!';

  // Calendar
  const cal = $('calendar');
  cal.innerHTML = '';
  for (let i = 27; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const k = dateKey(d);
    const info = state.days[k];
    const cell = document.createElement('div');
    cell.className = 'day' + (info?.completed ? ' done' : '') + (k === today ? ' today' : '');
    cell.title = `${d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}${info ? ` — ${info.correct}/${info.total}` : ''}`;
    cell.textContent = d.getDate();
    cal.appendChild(cell);
  }

  // Topics
  const grid = $('topics');
  grid.innerHTML = '';
  let lastStrand = '';
  for (const t of TOPICS) {
    if (t.strand !== lastStrand) {
      lastStrand = t.strand;
      const h = document.createElement('div');
      h.className = 'strand';
      h.textContent = t.strand;
      grid.appendChild(h);
    }
    const ts = state.topics[t.id];
    const acc = ts ? recentAccuracy(ts, 10) : null;
    const tier = topicTier(state, t.id);
    const div = document.createElement('div');
    div.className = 'topic';
    div.innerHTML = `
      <div class="topic-top"><span class="ticon">${t.icon}</span><span class="tname">${t.name}</span><span class="medal">${tier ? TIERS[tier].icon : ''}</span></div>
      <div class="bar ${acc == null ? '' : acc >= 0.8 ? 'good' : acc >= 0.5 ? 'ok' : 'weak'}"><div style="width:${acc == null ? 0 : Math.round(acc * 100)}%"></div></div>
      <div class="topic-bottom small muted"><span>${ts?.attempts ? `${Math.round(acc * 100)}% recent · ${ts.correct}/${ts.attempts}` : 'not tried yet'}</span><span class="level">${'★'.repeat(ts?.level || 1)}${'☆'.repeat(3 - (ts?.level || 1))}</span></div>`;
    grid.appendChild(div);
  }
  renderLockChip();
}

$('start-daily').addEventListener('click', async () => {
  const today = dateKey();
  const s = state.session;
  if (!(s && !s.finished && s.kind === 'daily' && s.date === today)) {
    startSession(state, today, 'daily');
    await save();
  }
  show('quiz');
  renderQuestion();
});

async function startExtra() {
  startSession(state, dateKey(), 'extra');
  await save();
  show('quiz');
  renderQuestion();
}
$('start-extra').addEventListener('click', startExtra);
$('sum-extra').addEventListener('click', startExtra);

// ───────────────────────────── Quiz

function renderDots() {
  const s = state.session;
  $('dots').innerHTML = s.questions.map((_, i) => {
    const r = s.results[i];
    const cls = r ? (r.correct ? 'right' : 'wrong') : i === s.index ? 'current' : '';
    return `<span class="dot ${cls}">${i + 1}</span>`;
  }).join('');
}

function renderQuestion() {
  const s = state.session;
  const q = s.questions[s.index];
  const topic = TOPIC_BY_ID[q.topicId];
  renderDots();
  $('q-topic').textContent = `${topic.icon} ${topic.name}`;
  $('q-level').textContent = `Level ${'★'.repeat(q.level)}${'☆'.repeat(3 - q.level)}`;
  $('q-review').hidden = !q.review;
  $('q-text').innerHTML = q.q;
  $('q-form').textContent = q.form ? `Express your answer ${q.form.startsWith('in ') ? '' : 'as a '}${q.form}.` : '';
  $('q-unit').textContent = q.unit || '';
  $('answer').value = '';
  $('answer').disabled = false;
  $('submit-btn').disabled = false;
  $('keys').hidden = false;
  $('feedback').hidden = true;

  const existing = s.results[s.index];
  if (existing) {
    // Already answered (e.g. the tab was reopened) — show the feedback again.
    showFeedback(q, existing, null);
  } else {
    startTimer();
    setTimeout(() => $('answer').focus(), 30);
  }
}

function startTimer() {
  stopTimer();
  const tick = () => {
    const sec = Math.max(0, Math.floor((Date.now() - (state.session.questionStartedAt || Date.now())) / 1000));
    $('q-timer').textContent = `⏱ ${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
  };
  tick();
  timerHandle = setInterval(tick, 1000);
}
function stopTimer() { if (timerHandle) clearInterval(timerHandle); timerHandle = null; }

document.querySelectorAll('[data-ins]').forEach((b) => b.addEventListener('click', () => {
  const inp = $('answer');
  const pos = inp.selectionStart ?? inp.value.length;
  inp.value = inp.value.slice(0, pos) + b.dataset.ins + inp.value.slice(inp.selectionEnd ?? pos);
  inp.focus();
  inp.setSelectionRange(pos + 1, pos + 1);
}));

$('answer-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const raw = $('answer').value.trim();
  if (!raw) return;
  const s = state.session;
  if (s.results[s.index]) return;
  stopTimer();
  const q = s.questions[s.index];
  const { result, events } = gradeCurrent(state, raw);
  await save();
  showFeedback(q, result, events);
});

const PRAISE = ['Nailed it!', 'Correct!', 'Boom! 💥', 'Exactly right!', 'Great work!', 'You got it!', 'Sharp thinking!', 'Perfect!'];

function showFeedback(q, result, events) {
  renderDots();
  $('answer').value = result.raw;
  $('answer').disabled = true;
  $('submit-btn').disabled = true;
  $('keys').hidden = true;
  $('feedback').hidden = false;
  const banner = $('fb-banner');
  if (result.correct) {
    const streak = state.streaks.correct.current;
    banner.className = 'banner good';
    banner.innerHTML = `✅ ${PRAISE[Math.floor(Math.random() * PRAISE.length)]} ${events ? `<span class="xp">+${events.xp} XP</span>` : ''} ${streak >= 3 ? `<span class="small">🎯 ${streak} in a row!</span>` : ''}`;
    $('fb-wrong').hidden = true;
    $('fb-steps-title').textContent = '🪜 How to solve it (quick check)';
  } else {
    banner.className = 'banner bad';
    banner.innerHTML = `❌ Not quite — let's see why.`;
    $('fb-wrong').hidden = false;
    $('fb-yours').textContent = result.raw;
    $('fb-right').textContent = result.answerText + (q.unit && !['$'].includes(q.unit) ? ` ${q.unit}` : '');
    $('fb-why').innerHTML = result.why.map((w) => `<p>${w}</p>`).join('');
    $('fb-steps-title').textContent = '🪜 Simplest way to solve it';
  }
  $('fb-steps').innerHTML = q.steps.map((st) => `<li>${st}</li>`).join('');
  $('fb-tip').innerHTML = q.tip;
  // Fold the solution away for correct answers so the flow stays quick.
  $('fb-steps').classList.toggle('collapsed', result.correct);
  $('fb-steps-title').classList.toggle('clickable', result.correct);

  if (events) {
    if (result.correct) burst(40);
    if (events.levelUp) toast(`Level up! ${TOPIC_BY_ID[events.levelUp.topicId].name} is now Level ${events.levelUp.level} ${'★'.repeat(events.levelUp.level)}`, '⬆️');
    for (const b of events.badges) { toast(`New badge: ${b.name}`, b.icon); burst(120); }
  }
  const last = state.session.index === state.session.questions.length - 1;
  $('next-btn').textContent = last ? 'See results 🏁' : 'Next →';
  setTimeout(() => $('next-btn').focus(), 30);
}

$('fb-steps-title').addEventListener('click', () => $('fb-steps').classList.remove('collapsed'));

$('next-btn').addEventListener('click', async () => {
  const done = advance(state);
  if (done) {
    const events = finishSession(state);
    if (state.session.kind === 'daily' && events.streakExtended) {
      const unlock = dailyUnlock(state);
      if (unlock) {
        state.lock = { unlockedUntil: unlock.unlockedUntil, mode: 'reward' };
        events.reward = unlock.kind === 'day' ? 'for the rest of today' : `for ${state.settings.rewardUnlockMinutes} minutes`;
      }
    }
    await save();
    renderSummary(events);
    show('summary');
  } else {
    await save();
    renderQuestion();
  }
});

// ───────────────────────────── Summary

function renderSummary(ev) {
  const s = state.session;
  const pct = ev.correct / ev.total;
  $('sum-emoji').textContent = pct === 1 ? '🏆' : pct >= 0.8 ? '🌟' : pct >= 0.5 ? '💪' : '🌱';
  $('sum-title').textContent = `${ev.correct} / ${ev.total} correct`;
  $('sum-sub').textContent = pct === 1 ? 'A perfect set! Incredible.' : pct >= 0.8 ? 'Excellent work!' : pct >= 0.5 ? 'Solid effort — the misses below are your best learning today.' : 'Tough set! Every miss below is a lesson you now know.';
  const pills = [];
  if (s.kind === 'daily' && ev.streakExtended) pills.push(`🔥 ${state.streaks.day.current}-day streak`);
  pills.push(`⭐ +${state.xp - (s.xpStart ?? state.xp)} XP`);
  pills.push(`🎯 ${state.streaks.correct.current} correct in a row`);
  const avg = Math.round(s.results.reduce((a, r) => a + r.seconds, 0) / s.results.length);
  if (avg >= 3) pills.push(`⏱ ${avg}s per question`);
  if (ev.reward) pills.push(`🔓 Browser unlocked ${ev.reward}`);
  $('sum-pills').innerHTML = pills.map((p) => `<span class="pill">${p}</span>`).join('');
  $('sum-badges').innerHTML = ev.badges.map((b) => `<div class="badge earned"><div class="bicon">${b.icon}</div><div><b>${esc(b.name)}</b><div class="small muted">${esc(b.desc)}</div></div></div>`).join('');

  const missed = s.questions.map((q, i) => ({ q, r: s.results[i] })).filter((x) => !x.r.correct);
  $('sum-review-card').hidden = !missed.length;
  $('sum-review').innerHTML = missed.map(({ q, r }) => `
    <details class="review">
      <summary><span class="chip topic-chip">${TOPIC_BY_ID[q.topicId].icon} ${TOPIC_BY_ID[q.topicId].name}</span> <span>${q.q}</span></summary>
      <p><span class="bad-text">You: ${esc(r.raw)}</span> · <span class="good-text">Answer: ${esc(r.answerText)}</span></p>
      ${r.why.map((w) => `<p>${w}</p>`).join('')}
      <ol class="steps">${q.steps.map((st) => `<li>${st}</li>`).join('')}</ol>
      <div class="tip"><strong>💡 Next time:</strong> ${q.tip}</div>
    </details>`).join('');
  if (pct >= 0.8) burst(200);
  renderLockChip();
}

// ───────────────────────────── Badges

function renderBadges() {
  $('badge-grid').innerHTML = GLOBAL_BADGES.map((b) => {
    const when = state.badges[b.id];
    return `<div class="badge ${when ? 'earned' : 'locked'}"><div class="bicon">${b.icon}</div><div><b>${b.name}</b><div class="small muted">${b.desc}${when ? ` · earned ${when}` : ''}</div></div></div>`;
  }).join('');
  $('tier-rules').innerHTML = TIER_RULES.map((r, i) => `${TIERS[i + 1].icon} ${r}`).join('<br>');
  $('medal-grid').innerHTML = TOPICS.map((t) => {
    const tier = topicTier(state, t.id);
    return `<div class="medal-card tier-${tier}"><div class="bicon">${tier ? TIERS[tier].icon : '⚪'}</div><div><b>${t.icon} ${t.name}</b><div class="small muted">${tier ? TIERS[tier].name : 'No medal yet'}</div></div></div>`;
  }).join('');
}

// ───────────────────────────── Parent

function renderParent() {
  $('parent-gate').hidden = parentAuthed;
  $('parent-panel').hidden = !parentAuthed;
  $('pin-error').textContent = '';
  $('pin-input').value = '';
  if (!parentAuthed) { setTimeout(() => $('pin-input').focus(), 30); return; }

  const st = lockStatus(state);
  $('parent-lock-state').textContent = st.locked ? '🔒 Locked' : `🔓 ${unlockText(st)}`;
  $('parent-lock-state').className = `chip ${st.locked ? 'locked' : 'unlocked'}`;

  renderDashboard();

  $('set-count').value = state.settings.questionsPerDay;
  $('set-after').value = state.settings.afterDaily;
  $('set-reward').value = state.settings.rewardUnlockMinutes;
  $('set-reward-row').hidden = state.settings.afterDaily !== 'minutes';
  $('set-allow').value = state.settings.allowlist.join('\n');
  $('set-search').checked = state.settings.blockSearchWhenUnlocked !== false;
  $('settings-saved').textContent = '';
}

document.querySelectorAll('[data-ptab]').forEach((b) => b.addEventListener('click', () => {
  document.querySelectorAll('[data-ptab]').forEach((x) => x.classList.toggle('active', x === b));
  $('ptab-dash').hidden = b.dataset.ptab !== 'dash';
  $('ptab-controls').hidden = b.dataset.ptab !== 'controls';
}));

// ───────────────────────────── Parent dashboard

const pct = (x) => (x == null ? '—' : `${Math.round(x * 100)}%`);
const STATUS = {
  strong: { icon: '✅', label: 'Strong' },
  ok: { icon: '⚠️', label: 'Getting there' },
  help: { icon: '🆘', label: 'Needs help' },
  new: { icon: '·', label: 'Not enough data' },
};
const shortDate = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString([], { month: 'short', day: 'numeric' }); };

function renderDashboard() {
  const d = dashboardData(state, dateKey());
  const name = state.profile.name || 'your Mathlete';
  document.querySelectorAll('.report-name').forEach((e) => (e.textContent = name));
  $('dash-asof').textContent = `as of ${new Date().toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}`;

  // Headline numbers
  const tw = d.thisWeek, lw = d.lastWeek;
  const delta = tw.acc != null && lw.acc != null ? Math.round((tw.acc - lw.acc) * 100) : null;
  const kpis = [
    { label: 'Accuracy this week', value: pct(tw.acc), sub: tw.total ? `${tw.correct} of ${tw.total} correct` + (delta == null ? '' : ` · ${delta >= 0 ? '▲' : '▼'} ${Math.abs(delta)} pts vs last week`) : 'no questions yet this week', cls: delta == null ? '' : delta >= 0 ? 'up' : 'down' },
    { label: 'Daily sets done', value: `${d.totals.daysDoneInWindow}/30`, sub: 'in the last 30 days' },
    { label: 'Day streak', value: d.totals.streak, sub: `best ${d.totals.bestStreak}` },
    { label: 'Questions answered', value: d.totals.answered, sub: d.totals.answered ? `${pct(d.totals.acc)} correct overall` : 'starts with the first set' },
  ];
  $('dash-kpis').innerHTML = kpis.map((k) => `<div class="kpi"><div class="kpi-label">${k.label}</div><div class="kpi-value">${k.value}</div><div class="kpi-sub ${k.cls || ''}">${esc(k.sub)}</div></div>`).join('');

  // Needs help / doing well
  const missFor = (id) => d.misses.find((m) => m.t === id);
  const topicCard = (t, showMiss) => {
    const m = showMiss && missFor(t.id);
    const trend = t.trend == null ? '' : t.trend > 0.15 ? ' · ▲ improving' : t.trend < -0.15 ? ' · ▼ slipping' : '';
    return `<div class="topic-row">
      <div class="topic-row-top"><span>${t.icon} <b>${esc(t.name)}</b></span><span class="status-tag ${t.status}">${STATUS[t.status].icon} ${pct(t.recentAcc)}</span></div>
      <div class="small muted">${Math.round(t.recentAcc * t.recentCount)} of last ${t.recentCount} right · Level ${'★'.repeat(t.level)}${trend}</div>
      ${m ? `<div class="small miss-eg">Missed: “${esc(m.q.length > 110 ? m.q.slice(0, 107) + '…' : m.q)}” — answered ${esc(m.a)}, correct ${esc(m.ans)}</div>` : ''}
    </div>`;
  };
  $('dash-help').innerHTML = d.needsHelp.length ? d.needsHelp.map((t) => topicCard(t, true)).join('') :
    `<p class="muted">${d.totals.answered < 15 ? 'Topics show up here after a few days of practice (3+ questions in a topic).' : 'Nothing below 80% right now. 🎉'}</p>`;
  $('dash-well').innerHTML = d.doingWell.length ? d.doingWell.map((t) => topicCard(t, false)).join('') :
    `<p class="muted">Topics with 80%+ on recent questions will show here.</p>`;

  // Daily accuracy (one series: no legend; hover for details)
  $('dash-daily').innerHTML = `<div class="vbars-grid"><span style="bottom:100%">100%</span><span style="bottom:50%">50%</span></div>` + d.series.map((p) => {
    const tipText = p.total ? `${shortDate(p.date)}: ${p.correct}/${p.total} correct (${pct(p.correct / p.total)})${p.done ? ' · daily set done' : ''}` : `${shortDate(p.date)}: no practice`;
    return p.total
      ? `<div class="vcol" data-tip="${esc(tipText)}"><div class="vbar" style="height:${Math.max(2, (100 * p.correct) / p.total)}%"></div></div>`
      : `<div class="vcol empty" data-tip="${esc(tipText)}"><div class="vstub"></div></div>`;
  }).join('');
  $('dash-daily').setAttribute('aria-label', `Daily accuracy over the last 30 days. ${d.series.filter((p) => p.total).length} days with practice.`);
  $('dash-daily-axis').innerHTML = `<span>${shortDate(d.series[0].date)}</span><span>${shortDate(d.series[15].date)}</span><span>Today</span>`;
  $('days-table').innerHTML = `<tr><th>Date</th><th>Daily set</th><th>Correct</th><th>Accuracy</th></tr>` +
    d.series.slice().reverse().map((p) => `<tr><td>${p.date}</td><td>${p.done ? '✅' : '—'}</td><td>${p.total ? `${p.correct}/${p.total}` : ''}</td><td>${p.total ? pct(p.correct / p.total) : ''}</td></tr>`).join('');

  // Every topic, weakest first; untried at the end
  const order = { help: 0, ok: 1, strong: 2, new: 3 };
  const rows = d.topics.slice().sort((a, b) => order[a.status] - order[b.status] || (a.recentAcc ?? 2) - (b.recentAcc ?? 2) || b.attempts - a.attempts);
  $('dash-topics').innerHTML = rows.map((t) => {
    const tipText = t.attempts ? `${t.name}: ${Math.round((t.recentAcc ?? 0) * t.recentCount)}/${t.recentCount} on recent questions, ${t.correct}/${t.attempts} all-time · Level ${t.level} · last practiced ${t.lastSeen}` : `${t.name}: not practiced yet`;
    return `<div class="hrow" data-tip="${esc(tipText)}">
      <div class="hlabel">${t.icon} ${esc(t.name)}</div>
      <div class="htrack">${t.recentAcc != null ? `<div class="hbar ${t.status}" style="width:${Math.max(1.5, t.recentAcc * 100)}%"></div>` : ''}</div>
      <div class="hval">${t.attempts ? `${STATUS[t.status].icon} ${pct(t.recentAcc)}` : '<span class="muted">not tried</span>'}</div>
    </div>`;
  }).join('');
  $('report-table').innerHTML = `<tr><th>Topic</th><th>Status</th><th>Last 10</th><th>All-time</th><th>Level</th><th>Medal</th><th>Last practiced</th></tr>` +
    rows.map((t) => `<tr><td>${t.icon} ${esc(t.name)}</td><td>${t.status === 'new' ? '—' : `${STATUS[t.status].icon} ${STATUS[t.status].label}`}</td><td>${t.recentCount ? `${pct(t.recentAcc)} (${Math.round(t.recentAcc * t.recentCount)}/${t.recentCount})` : '—'}</td>
      <td>${t.attempts ? `${t.correct}/${t.attempts}` : '—'}</td><td>${'★'.repeat(t.level)}</td><td>${t.tier ? TIERS[t.tier].icon : ''}</td><td>${t.lastSeen || '—'}</td></tr>`).join('');

  // By area (one hue)
  $('dash-strands').innerHTML = d.strands.map((s) => `<div class="hrow" data-tip="${esc(`${s.name}: ${s.correct}/${s.attempts} correct`)}">
      <div class="hlabel">${esc(s.name)}</div>
      <div class="htrack">${s.acc != null ? `<div class="hbar plain" style="width:${Math.max(1.5, s.acc * 100)}%"></div>` : ''}</div>
      <div class="hval">${s.attempts ? pct(s.acc) : '<span class="muted">—</span>'}</div></div>`).join('');

  // Recent mistakes
  $('dash-misses').innerHTML = d.misses.length ? d.misses.map((m) => {
    const t = TOPIC_BY_ID[m.t];
    return `<div class="miss"><div class="small muted">${shortDate(m.d)} · ${t ? `${t.icon} ${esc(t.name)}` : ''}</div><div>${esc(m.q)}</div><div class="small"><span class="bad-text">Answered ${esc(m.a)}</span> · <span class="good-text">Correct: ${esc(m.ans)}</span></div></div>`;
  }).join('') : '<p class="muted">No mistakes recorded yet.</p>';
}

// Hover tooltip for any [data-tip] mark
document.addEventListener('mousemove', (e) => {
  const el = e.target.closest('[data-tip]');
  const tip = $('tip');
  if (!el) { tip.hidden = true; return; }
  tip.textContent = el.dataset.tip;
  tip.hidden = false;
  const w = tip.offsetWidth;
  tip.style.left = `${Math.min(innerWidth - w - 8, Math.max(8, e.clientX - w / 2))}px`;
  tip.style.top = `${e.clientY - tip.offsetHeight - 14}px`;
});

function authParent() {
  parentAuthed = true;
  clearTimeout(parentTimer);
  parentTimer = setTimeout(() => { parentAuthed = false; if (document.body.dataset.view === 'parent') renderParent(); }, 10 * 60000);
}

$('pin-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  state = await loadState();
  const res = await verifyPin(state, $('pin-input').value);
  if (res.ok) { authParent(); renderParent(); }
  else $('pin-error').textContent = res.wait ? `Too many tries. Wait ${res.wait} seconds.` : 'Wrong PIN.';
  $('pin-input').value = '';
});

// ───────────────────────────── Unlock (PIN-protected)

function openUnlock() {
  $('unlock-pin-row').hidden = parentAuthed;
  $('unlock-pin').value = '';
  $('unlock-error').textContent = '';
  $('unlock-modal').hidden = false;
  setTimeout(() => (parentAuthed ? $('unlock-form').querySelector('[type=submit]') : $('unlock-pin')).focus(), 30);
}
function closeUnlock() { $('unlock-modal').hidden = true; }

$('unlock-btn').addEventListener('click', openUnlock);
$('parent-unlock').addEventListener('click', openUnlock);
$('unlock-cancel').addEventListener('click', closeUnlock);
$('unlock-modal').addEventListener('click', (e) => { if (e.target === $('unlock-modal')) closeUnlock(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('unlock-modal').hidden) closeUnlock(); });
$('unlock-time').addEventListener('focus', () => { document.querySelector('input[name=dur][value=time]').checked = true; });

$('unlock-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  state = await loadState();
  if (!parentAuthed) {
    const res = await verifyPin(state, $('unlock-pin').value);
    if (!res.ok) {
      $('unlock-error').textContent = res.wait ? `Too many tries. Wait ${res.wait} seconds.` : 'Wrong PIN.';
      $('unlock-pin').value = '';
      return;
    }
  }
  const choice = document.querySelector('input[name=dur]:checked').value;
  const until = unlockUntil(choice, $('unlock-time').value);
  if (!until) { $('unlock-error').textContent = 'Pick a time.'; return; }
  state.lock = { unlockedUntil: until, mode: 'parent' };
  await save();
  closeUnlock();
  toast(`Browser ${choice === 'forever' ? 'unlocked until you lock it again' : unlockText(lockStatus(state)).replace(/^Unlocked/, 'unlocked')}`, '🔓');
  renderLockChip();
  if (document.body.dataset.view === 'parent') renderParent();
});

async function lockNow() {
  state.lock = { unlockedUntil: 0, mode: 'locked' };
  await save();
  toast('Browser locked', '🔒');
  renderLockChip();
  if (document.body.dataset.view === 'parent') renderParent();
}
$('lock-now').addEventListener('click', lockNow);
$('relock-btn').addEventListener('click', lockNow);

$('settings-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!parentAuthed) return;
  state.settings.questionsPerDay = Math.min(30, Math.max(5, Number($('set-count').value) || 10));
  state.settings.afterDaily = $('set-after').value;
  state.settings.rewardUnlockMinutes = Math.min(240, Math.max(5, Number($('set-reward').value) || 60));
  state.settings.allowlist = [...new Set($('set-allow').value.split(/[\s,]+/).map(cleanDomain).filter(Boolean))];
  state.settings.blockSearchWhenUnlocked = $('set-search').checked;
  await save();
  renderParent();
  $('settings-saved').textContent = 'Saved ✓';
});

$('export-btn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify({ ...state, parent: undefined }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `mathcounts-progress-${dateKey()}.json`;
  a.click();
});

$('change-pin-btn').addEventListener('click', async () => {
  const pin = prompt('New PIN (4–8 digits):');
  if (pin == null) return;
  if (!/^\d{4,8}$/.test(pin)) return alert('PIN must be 4–8 digits.');
  if (prompt('Type the new PIN again:') !== pin) return alert("PINs don't match.");
  await setPin(state, pin);
  await save();
  toast('PIN changed', '🔑');
});

$('reset-btn').addEventListener('click', async () => {
  if (!confirm('Erase ALL progress, streaks and badges? This cannot be undone.')) return;
  const keep = { parent: state.parent, profile: state.profile, settings: state.settings };
  state = { ...newState(), ...keep };
  await save();
  toast('Progress reset', '🧹');
  renderParent();
});

$('parent-exit').addEventListener('click', () => { parentAuthed = false; show('home'); });

// ───────────────────────────── Toasts & confetti

function toast(text, icon = '🎉') {
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<span class="ticon">${icon}</span><span>${esc(text)}</span>`;
  $('toasts').appendChild(t);
  setTimeout(() => t.classList.add('out'), 3800);
  setTimeout(() => t.remove(), 4400);
}

const canvas = $('confetti');
const ctx = canvas.getContext('2d');
let parts = [];
let animating = false;
const COLORS = ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93', '#ff924c'];
function burst(n) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  canvas.width = innerWidth; canvas.height = innerHeight;
  for (let i = 0; i < n; i++) {
    parts.push({ x: innerWidth / 2 + (Math.random() - 0.5) * 200, y: innerHeight / 3, vx: (Math.random() - 0.5) * 14, vy: -Math.random() * 12 - 4, s: 4 + Math.random() * 6, c: COLORS[i % COLORS.length], r: Math.random() * 6, life: 0 });
  }
  if (!animating) { animating = true; requestAnimationFrame(frame); }
}
function frame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  parts = parts.filter((p) => p.y < canvas.height + 20 && p.life < 240);
  for (const p of parts) {
    p.vy += 0.35; p.x += p.vx; p.y += p.vy; p.vx *= 0.99; p.r += 0.1; p.life++;
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6); ctx.restore();
  }
  if (parts.length) requestAnimationFrame(frame);
  else { animating = false; ctx.clearRect(0, 0, canvas.width, canvas.height); }
}

// ───────────────────────────── Boot

// While locked, keep a single copy of the app: a new tab that finds an older app
// tab focuses it and closes itself.
async function closeIfDuplicate() {
  if (location.hash === '#parent' || location.hash === '#unlock' || !lockStatus(state).locked || typeof chrome === 'undefined' || !chrome.tabs) return false;
  const self = await chrome.tabs.getCurrent();
  if (!self) return false;
  const appUrl = chrome.runtime.getURL('app.html');
  const tabs = await chrome.tabs.query({});
  const older = tabs.find((t) => t.id < self.id && ((t.pendingUrl || t.url || '').startsWith(appUrl) || (t.pendingUrl || t.url || '').startsWith('chrome://newtab')));
  if (!older) return false;
  await chrome.tabs.update(older.id, { active: true });
  await chrome.windows.update(older.windowId, { focused: true });
  window.close();
  return true;
}

$('set-after').addEventListener('change', () => { $('set-reward-row').hidden = $('set-after').value !== 'minutes'; });

async function boot() {
  state = await loadState();
  if (await closeIfDuplicate()) return;
  renderLockChip();
  if (!state.parent?.pinHash) return show('setup');
  if (location.hash === '#parent' || location.hash === '#unlock') {
    const wantUnlock = location.hash === '#unlock';
    history.replaceState(null, '', location.pathname);
    show(wantUnlock ? 'home' : 'parent');
    if (wantUnlock) openUnlock();
    setInterval(renderLockChip, 30000);
    return;
  }
  const s = state.session;
  if (s && !s.finished && (s.kind === 'extra' || s.date === dateKey())) {
    show('quiz');
    renderQuestion();
  } else {
    show('home');
  }
  setInterval(renderLockChip, 30000);
}

// If another tab changed progress, pick it up when this tab becomes visible again.
document.addEventListener('visibilitychange', async () => {
  if (document.visibilityState !== 'visible' || !state) return;
  const fresh = await loadState();
  const busy = document.body.dataset.view === 'quiz' && !$('answer').disabled && $('answer').value;
  if (busy) return;
  state = fresh;
  const v = document.body.dataset.view;
  if (v === 'quiz') {
    if (state.session && !state.session.finished) renderQuestion();
    else show('home');
  } else if (v === 'home' || v === 'badges' || v === 'parent') show(v);
});

boot();
