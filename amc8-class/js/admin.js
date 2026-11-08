// Owner dashboard (admin.html): every family, their kids, activity, time and results.
// Only works for emails in the admins table (supabase/migrations/002-analytics.sql); the
// database refuses everyone else, so this page shows nothing to anyone but the owner.
(function () {
  const C = window.Cloud;
  const app = document.getElementById('app');
  const $ = (s) => app.querySelector(s);
  const h = (html) => { app.innerHTML = html; };
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const DAY = 864e5;

  async function boot() {
    if (!C.enabled) return h('<div class="card"><h1>📊 Math Hoops Admin</h1><p>Supabase is not configured in js/config.js.</p></div>');
    h('<div class="card"><p>Loading…</p></div>');
    let session;
    try { session = await C.session(); } catch (e) { return h(`<div class="card"><p>Could not reach the database: ${esc(e.message || e)}</p></div>`); }
    if (!session) return signIn();
    if (!(await C.isAdmin())) {
      h(`<div class="card"><h1>📊 Math Hoops Admin</h1><p>This page is only for the site owner. You are signed in as <b>${esc(session.user.email)}</b>.</p><button class="btn ghost" id="out">Sign out</button></div>`);
      $('#out').onclick = async () => { await C.signOut(); signIn(); };
      return;
    }
    load(session.user.email);
  }

  function signIn() {
    h(`<div class="card" style="max-width:480px;margin:40px auto"><h1>📊 Math Hoops Admin</h1>
        <p>Sign in with the owner's email. We'll email you a sign-in link.</p>
        <label for="em">Email</label><input id="em" type="email" autocomplete="email">
        <p></p><button class="btn go" id="send">Email me a sign-in link</button><div id="st" class="muted" style="margin-top:10px"></div></div>`);
    $('#send').onclick = async () => {
      const em = $('#em').value.trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) return $('#em').focus();
      $('#send').disabled = true; $('#st').textContent = 'Sending…';
      try { await C.signIn(em); $('#st').textContent = '📬 Check your inbox and open the link in this browser.'; }
      catch (e) { $('#st').textContent = `Could not send: ${e.message || e}`; $('#send').disabled = false; }
    };
  }

  let fams = [], kids = [], reports = [], reportsErr = '', sortKey = 'last', sortDir = -1, filter = '';
  const mins = (k) => Math.max((k.report && k.report.minutes) || 0, Math.round((k.game_seconds || 0) / 60));
  const hm = (m) => (m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`);
  const ago = (t) => { if (!t) return '—'; const d = Math.floor((Date.now() - new Date(t)) / DAY); return d <= 0 ? 'today' : d === 1 ? 'yesterday' : `${d}d ago`; };
  const acc = (k) => (k.total ? Math.round((100 * k.right) / k.total) : null);
  const weakest = (r) => Object.entries((r && r.mastery) || {}).filter(([, m]) => m.n >= 5).sort((a, b) => a[1].pct - b[1].pct).slice(0, 2).map(([n, m]) => `${n} ${m.pct}%`).join(', ');
  const COLS = [
    ['parent', 'Parent', (k) => k.email],
    ['kid', 'Kid', (k) => k.name],
    ['games', 'Games', (k) => k.games],
    ['days', 'Days active', (k) => k.days_active],
    ['time', 'Time', (k) => mins(k), (k) => hm(mins(k))],
    ['acc', 'Accuracy', (k) => acc(k) ?? -1, (k) => (acc(k) == null ? '—' : `${acc(k)}%`)],
    ['season', 'Season', (k) => (k.report && k.report.classIdx) || 0, (k) => (k.report && k.report.totalClasses ? `${k.report.classIdx}/${k.report.totalClasses}` : '—')],
    ['streak', 'Streak', (k) => (k.report && k.report.streak) || 0],
    ['clips', 'Clips', (k) => (k.report && k.report.clips) || 0],
    ['last', 'Last played', (k) => (k.last_played ? new Date(k.last_played).getTime() : 0), (k) => ago(k.last_played)],
    ['joined', 'Kid added', (k) => new Date(k.created).getTime(), (k) => String(k.created).slice(0, 10)],
    ['weak', 'Weakest topics', (k) => weakest(k.report)],
  ];

  async function load(me) {
    h('<div class="card"><p>Loading analytics…</p></div>');
    try { fams = await C.adminOverview(); } catch (e) { return h(`<div class="card"><p>Could not load analytics: ${esc(e.message || e)}</p></div>`); }
    kids = fams.flatMap((f) => f.kids.map((k) => ({ ...k, email: f.email })));
    // Reported questions come from a separate migration; the rest of the page works without it.
    try { reports = await C.adminReports(); reportsErr = ''; } catch (e) { reports = []; reportsErr = String(e.message || e); }
    render(me);
  }

  // 🚩 Reported questions: which question types get flagged most, and the latest reports.
  function reportsCard() {
    if (reportsErr) return `<div class="card"><h2>🚩 Reported questions</h2><p class="muted">Not set up yet (${esc(reportsErr)}). In Supabase → SQL Editor, run <code>supabase/migrations/003-question-reports.sql</code>, then refresh.</p></div>`;
    if (!reports.length) return '<div class="card"><h2>🚩 Reported questions</h2><p class="muted">No reports yet. Players can tap 🚩 Report on any question.</p></div>';
    const by = {};
    reports.forEach((r) => { const g = (by[r.tpl || '(unknown)'] = by[r.tpl || '(unknown)'] || { tpl: r.tpl || '(unknown)', topic: r.topic, n: 0, reasons: {}, q: r.question, a: r.answer }); g.n++; g.reasons[r.reason] = (g.reasons[r.reason] || 0) + 1; });
    const top = Object.values(by).sort((a, b) => b.n - a.n).slice(0, 15);
    const cut = (t, n) => (String(t).length > n ? String(t).slice(0, n) + '…' : String(t));
    return `<div class="card"><div class="row spread"><h2>🚩 Reported questions</h2><button class="btn ghost small" id="repcsv">⬇️ Reports CSV</button></div>
        <p class="muted">Most-reported question types first. "Wrong answer" reports are the ones to check right away.</p>
        <div class="scroll"><table><thead><tr><th>Type</th><th>Topic</th><th>Reports</th><th>Reasons</th><th>Example</th><th>Its answer</th></tr></thead><tbody>${top.map((g) => `<tr><td>${esc(g.tpl)}</td><td>${esc(g.topic || '')}</td><td><b>${g.n}</b></td><td class="wrap">${Object.entries(g.reasons).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${esc(k)} ×${n}`).join(', ')}</td><td class="wrap">${esc(cut(g.q, 110))}</td><td>${esc(g.a || '')}</td></tr>`).join('')}</tbody></table></div>
        <h3 style="margin-top:16px">Latest</h3>
        <div class="scroll"><table><thead><tr><th>When</th><th>Parent</th><th>Kid</th><th>Game</th><th>Reason</th><th>Question</th></tr></thead><tbody>${reports.slice(0, 40).map((r) => `<tr><td>${esc(String(r.when).slice(0, 10))}</td><td>${esc(r.email || '')}</td><td>${esc(r.kid || '')}</td><td>${esc(r.game || '')}</td><td>${esc(r.reason)}</td><td class="wrap">${esc(cut(r.question, 100))}</td></tr>`).join('')}</tbody></table></div></div>`;
  }

  function render(me) {
    const now = Date.now();
    const active7 = kids.filter((k) => k.last_played && now - new Date(k.last_played) < 7 * DAY).length;
    const new7 = fams.filter((f) => now - new Date(f.joined) < 7 * DAY).length;
    const totalMin = kids.reduce((a, k) => a + mins(k), 0);
    const games = kids.reduce((a, k) => a + k.games, 0);
    const right = kids.reduce((a, k) => a + k.right, 0), total = kids.reduce((a, k) => a + k.total, 0);
    // Families joining per week, for the last 8 weeks.
    const weeks = [...Array(8)].map((_, i) => fams.filter((f) => { const age = (now - new Date(f.joined)) / DAY; return age >= (7 - i) * 7 && age < (8 - i) * 7; }).length);
    const top = Math.max(1, ...weeks);
    const f = filter.toLowerCase();
    const shown = kids.filter((k) => !f || `${k.email} ${k.name}`.toLowerCase().includes(f))
      .sort((a, b) => { const col = COLS.find((c) => c[0] === sortKey); const x = col[2](a), y = col[2](b); return (x > y ? 1 : x < y ? -1 : 0) * sortDir; });
    h(`<div class="card"><div class="row spread"><h1>📊 Math Hoops Admin</h1><span class="row"><span class="muted">${esc(me)}</span><button class="btn ghost small" id="rf">↻ Refresh</button><button class="btn ghost small" id="csv">⬇️ CSV</button><button class="btn ghost small" id="out">Sign out</button></span></div>
        <div class="tiles">
          <div class="stat"><b>${fams.length}</b>families</div>
          <div class="stat"><b>${new7}</b>new this week</div>
          <div class="stat"><b>${kids.length}</b>kids</div>
          <div class="stat"><b>${active7}</b>kids active in 7 days</div>
          <div class="stat"><b>${games}</b>games played</div>
          <div class="stat"><b>${hm(totalMin)}</b>total time</div>
          <div class="stat"><b>${total ? Math.round((100 * right) / total) + '%' : '—'}</b>accuracy</div>
          <div class="stat"><b>${reportsErr ? '—' : reports.length}</b>question reports</div>
        </div>
        <h3 style="margin-top:18px">New families per week</h3>
        <div class="bars">${weeks.map((n) => `<i style="height:${(100 * n) / top}%" title="${n}"></i>`).join('')}</div>
        <div class="bars-x"><span>8 weeks ago</span><span>this week</span></div></div>
      <div class="card"><div class="row spread"><h2>Kids</h2><input id="q" type="search" placeholder="Filter by email or name" value="${esc(filter)}"></div>
        <div class="scroll"><table><thead><tr>${COLS.map(([key, label]) => `<th data-s="${key}">${label}${sortKey === key ? (sortDir > 0 ? ' ▲' : ' ▼') : ''}</th>`).join('')}</tr></thead>
        <tbody>${shown.map((k) => `<tr>${COLS.map(([key, , val, show]) => `<td class="${key === 'weak' ? 'wrap' : ''}">${esc((show || val)(k))}</td>`).join('')}</tr>`).join('') || `<tr><td colspan="${COLS.length}" class="muted">No kids yet.</td></tr>`}</tbody></table></div></div>
      ${reportsCard()}
      <div class="card"><h2>Families</h2><div class="scroll"><table><thead><tr><th>Parent email</th><th>Joined</th><th>Last sign-in</th><th>Kids</th><th>Last active</th></tr></thead>
        <tbody>${fams.map((x) => `<tr><td>${esc(x.email)}</td><td>${esc(String(x.joined).slice(0, 10))}</td><td>${ago(x.last_sign_in)}</td><td>${x.kids.length ? x.kids.map((k) => esc(k.name)).join(', ') : '<span class="muted">none yet</span>'}</td><td>${ago(x.last_active)}</td></tr>`).join('')}</tbody></table></div></div>
      <p class="muted" style="text-align:center">Time counts games, practice and Concept Studio clips. Accuracy is over all game questions. Only emails in the admins table can open this page.</p>`);
    $('#rf').onclick = () => load(me);
    if ($('#repcsv')) $('#repcsv').onclick = () => {
      const q = (x) => `"${String(x ?? '').replace(/"/g, '""')}"`;
      const head = ['when', 'parent', 'kid', 'game', 'topic', 'type', 'reason', 'question', 'answer', 'choices'];
      const text = [head, ...reports.map((r) => [String(r.when).slice(0, 19), r.email, r.kid, r.game, r.topic, r.tpl, r.reason, r.question, r.answer, r.choices])].map((row) => row.map(q).join(',')).join('\n');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([text], { type: 'text/csv' }));
      a.download = `math-hoops-reports-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    };
    $('#out').onclick = async () => { await C.signOut(); signIn(); };
    $('#csv').onclick = () => {
      const q = (x) => `"${String(x).replace(/"/g, '""')}"`;
      const text = [COLS.map((c) => c[1]), ...shown.map((k) => COLS.map(([, , val, show]) => (show || val)(k)))].map((r) => r.map(q).join(',')).join('\n');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([text], { type: 'text/csv' }));
      a.download = `math-hoops-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    };
    app.querySelectorAll('th[data-s]').forEach((th) => (th.onclick = () => { const k = th.dataset.s; sortDir = sortKey === k ? -sortDir : -1; sortKey = k; render(me); }));
    const qi = $('#q');
    qi.oninput = () => { filter = qi.value; const pos = qi.selectionStart; render(me); const n = $('#q'); n.focus(); n.setSelectionRange(pos, pos); };
  }

  boot();
})();
