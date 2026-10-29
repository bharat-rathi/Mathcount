// UI for the daily class. One thing on screen at a time, big buttons, instant feedback,
// and short segments with a movement break in the middle — built for a student with ADHD.
(function () {
  const E = window.Engine;
  const H = window.Hoops;
  const TOP = Object.fromEntries(window.TOPICS.map((t) => [t.id, t]));
  const app = document.getElementById('app');
  const fx = document.getElementById('fx');
  const KEY = 'amc8-class-v1';
  const LETTERS = 'ABCDE';

  // ── Saved progress. It always lives in this browser. With Supabase set up (js/config.js),
  // a signed-in parent picks a kid profile and every save also goes to that kid's row; on
  // load, the newer of the two copies wins.
  const C = window.Cloud;
  let kidId = null, onHome = false;
  const keyFor = () => (kidId ? `${KEY}:${kidId}` : KEY);
  const fromSaved = (raw) => {
    const st = Object.assign(E.newState(), { planVersion: 1 }, raw || {});
    if (st.name) E.migratePlan(st); else st.planVersion = E.PLAN_VERSION;
    return st;
  };
  const readLocal = () => { try { return JSON.parse(localStorage.getItem(keyFor()) || 'null'); } catch { return null; } };
  const pref = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch { return null; } };
  let S = fromSaved(readLocal());
  // A small summary for the parent dashboard and the daily email.
  const report = () => ({
    name: S.name, updatedAt: new Date().toISOString(), contestDate: S.contestDate,
    classIdx: S.classIdx, totalClasses: E.buildPlan().length, streak: S.streak, bestStreak: S.bestStreak,
    xp: S.xp, level: E.levelOf(S.xp).lvl, badges: S.badges,
    recent: S.log.slice(-14), mistakes: S.mistakes || {},
    mastery: Object.fromEntries(Object.entries(S.mastery).filter(([, m]) => m.r.length).map(([id, m]) =>
      [TOP[id].name, { pct: Math.round((100 * m.r.reduce((a, b) => a + b, 0)) / m.r.length), n: m.r.length }])),
  });
  const save = (game) => {
    S.savedAt = Date.now();
    try { localStorage.setItem(keyFor(), JSON.stringify(S)); } catch { /* private mode */ }
    if (kidId) C.saveKid(kidId, S, report(), game);
  };

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const h = (html) => { onHome = false; app.innerHTML = html; window.scrollTo(0, 0); };
  const $ = (sel) => app.querySelector(sel);

  // ── Sound and voice
  let actx;
  function tone(freqs, dur = 0.12, type = 'sine', vol = 0.15) {
    if (!S.sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      freqs.forEach((f, i) => {
        const o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime + i * dur;
        o.type = type; o.frequency.value = f; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur * 1.6);
        o.connect(g).connect(actx.destination); o.start(t); o.stop(t + dur * 1.7);
      });
    } catch { /* no audio */ }
  }
  const sfx = { good: () => tone([523, 659, 784]), bad: () => tone([220, 196], 0.15, 'triangle', 0.1), level: () => tone([523, 659, 784, 1047], 0.14), tick: () => tone([880], 0.05, 'square', 0.04) };
  function speak(text) {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const clean = String(text).replace(/<[^>]+>/g, ' ').replace(/√/g, ' root ').replace(/π/g, ' pie ').replace(/\^/g, ' to the power ').replace(/×/g, ' times ').replace(/÷/g, ' divided by ').replace(/−/g, ' minus ');
    const u = new SpeechSynthesisUtterance(clean); u.rate = 0.95; speechSynthesis.speak(u);
  }
  const autoSpeak = (t) => { if (S.voice) speak(t); };

  function confetti(n = 60) {
    const colors = ['#7048e8', '#ff922b', '#12b886', '#f06595', '#fab005'];
    for (let i = 0; i < n; i++) {
      const c = document.createElement('i');
      c.className = 'confetti';
      c.style.left = Math.random() * 100 + 'vw';
      c.style.background = colors[i % colors.length];
      c.style.animationDuration = 1.5 + Math.random() * 1.5 + 's';
      c.style.animationDelay = Math.random() * 0.4 + 's';
      fx.appendChild(c);
      setTimeout(() => c.remove(), 3500);
    }
  }
  function floater(text, el) {
    const r = el ? el.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight / 2, width: 0 };
    const f = document.createElement('div');
    f.className = 'floater'; f.textContent = text;
    f.style.left = r.left + r.width / 2 - 20 + 'px'; f.style.top = r.top + 'px';
    fx.appendChild(f); setTimeout(() => f.remove(), 1000);
  }

  // ── Basketball look: court colors, his jersey, and the swish animation
  function applyCourt() {
    const c = H.COURTS.find((x) => x.id === S.court) || H.COURTS[0];
    document.documentElement.style.setProperty('--accent', c.accent);
    document.documentElement.style.setProperty('--accent2', c.accent2);
  }
  function jerseySvg(size = 96) {
    const j = H.JERSEYS.find((x) => x.id === S.jersey) || H.JERSEYS[0];
    return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" aria-hidden="true">
      <path d="M30 8 L42 8 Q50 20 58 8 L70 8 L74 22 Q78 30 86 30 L86 92 L14 92 L14 30 Q22 30 26 22 Z" fill="${j.main}" stroke="${j.trim}" stroke-width="4"/>
      <text x="50" y="52" text-anchor="middle" font-size="11" font-weight="800" fill="${j.trim}">${esc(String(S.name || '').toUpperCase().slice(0, 8))}</text>
      <text x="50" y="82" text-anchor="middle" font-size="30" font-weight="900" fill="${j.trim}">${S.number}</text></svg>`;
  }
  function swish() {
    const b = document.createElement('div');
    b.className = 'swish'; b.textContent = '🏀';
    fx.appendChild(b); setTimeout(() => b.remove(), 900);
  }

  let timers = [];
  const clearTimers = () => { timers.forEach(clearInterval); timers = []; if ('speechSynthesis' in window) speechSynthesis.cancel(); };
  let keyHandler = null;
  document.addEventListener('keydown', (e) => { if (keyHandler && !e.target.matches('input, select')) keyHandler(e); });

  // ── Home
  function home() {
    clearTimers(); clearInterval(clock); keyHandler = null; applyCourt();
    if (!S.name) return welcome();
    const plan = E.buildPlan();
    const next = plan[S.classIdx];
    const daysLeft = Math.max(0, E.daysBetween(E.dayKey(), S.contestDate));
    const L = E.levelOf(S.xp);
    const doneToday = S.lastDay === E.dayKey();
    const nextLabel = next.type === 'paper' ? `🏆 The Finals: the real ${next.year} AMC 8 (40 min)` : next.type === 'mock' ? '🏆 Playoff Game: practice contest (25 min)' : `${TOP[next.topic].emoji} ${TOP[next.topic].name}${next.pass === 2 ? ' · Level Up' : ''}`;
    const nodes = plan.map((c, i) => {
      const cls = i < S.classIdx ? 'done' : i === S.classIdx ? 'now' : '';
      const em = c.type === 'paper' ? '🏆' : c.type === 'mock' ? '📝' : TOP[c.topic].emoji;
      return `<div class="node ${cls} ${c.type === 'lesson' ? '' : 'mock'}" title="${c.type === 'paper' ? `Real ${c.year} AMC 8` : c.type === 'mock' ? 'Practice contest' : esc(TOP[c.topic].name)}">${i < S.classIdx ? '✅' : em}<small>${i + 1}</small></div>`;
    }).join('');
    h(`
      <div class="card court">
        <div class="hero">
          <div class="avatar">${jerseySvg()}</div>
          <div style="flex:1"><h1>${esc(S.name)} #${S.number}</h1>
            <p class="muted" style="margin:0">${H.rankOf(L.lvl)} · Season ${S.wins}–${S.losses}</p></div>
        </div>
        <div class="row" style="margin:10px 0"><span class="pill">🔥 ${S.streak}-day streak</span><span class="pill" title="A timeout saves your streak if you miss one day">⏸️ ${S.timeouts} timeout${S.timeouts === 1 ? '' : 's'}</span><span class="pill">🏆 Finals in ${daysLeft} days</span></div>
        <div class="row spread"><b>Level ${L.lvl}</b><span class="muted">${L.into} / ${L.need} pts</span></div>
        <div class="xpbar"><i style="width:${(100 * L.into) / L.need}%"></i></div>
        <p class="muted" style="margin:8px 0 0;font-size:14px">${kidId ? '☁️ Saved to your family account' : '💾 Saved on this device'}</p>
      </div>
      <div class="card">
        <span class="tag">${doneToday ? 'Done for today! Bonus game?' : "Today's game"} · Game ${S.classIdx + 1} of ${plan.length}</span>
        <h2>${next.type !== 'lesson' ? nextLabel : `vs. ${H.opponent(S.classIdx)}`}</h2>
        ${next.type !== 'lesson' ? '' : `<p style="margin:0 0 6px"><b>${nextLabel}</b></p>`}
        <p class="muted">${next.type === 'paper' ? 'A real past AMC 8: 25 problems, 40 minutes, pencil and paper. Then enter your score.' : next.type === 'mock' ? '15 contest-style questions, a timer, answers at the end, just like the real thing.' : 'Shootaround → pregame → film room → new play → 1st half → halftime → 2nd half → clutch shot. About 20 minutes.'}</p>
        <button class="btn big go" id="start">🏀 ${doneToday ? 'Play a bonus game' : 'Tip off!'}</button>
      </div>
      ${(() => { const f = E.focusTopics(S, 1)[0]; return f && TOP[f.id] ? `<div class="card row spread"><span>🧢 <b>Coach's pick:</b> ${TOP[f.id].emoji} ${esc(TOP[f.id].name)} <span class="muted">(${esc(focusWhy(f))})</span></span><button class="btn small" id="coach" data-t="${f.id}">🎯 Practice it</button></div>` : ''; })()}
      <div class="card">
        <h3>Season schedule</h3>
        <div class="map" id="map">${nodes}</div>
      </div>
      <div class="grid2">
        <button class="btn ghost" id="practice">🎯 Practice Ground</button>
        <button class="btn ghost" id="hacks">🧰 Test Hacks</button>
        <button class="btn ghost" id="cards">🃏 Playbook (${S.cards.length})</button>
        <button class="btn ghost" id="locker">👕 Locker room</button>
        <button class="btn ghost" id="badges">🏅 Trophies (${S.badges.length})</button>
        <button class="btn ghost" id="parent">👪 Parent page</button>
        ${kidId ? '<button class="btn ghost" id="family">🔄 Switch player / Family</button>' : ''}
      </div>`);
    onHome = true;
    $('#start').onclick = () => startClass(S.classIdx);
    $('#practice').onclick = practiceGround;
    $('#hacks').onclick = () => hacksPage();
    if ($('#coach')) $('#coach').onclick = () => startPractice($('#coach').dataset.t);
    $('#badges').onclick = badgesPage;
    $('#cards').onclick = playbookPage;
    $('#locker').onclick = lockerRoom;
    $('#parent').onclick = parentPage;
    if ($('#family')) $('#family').onclick = () => familyScreen(false);
    const cur = app.querySelector('.node.now');
    if (cur) cur.scrollIntoView({ inline: 'center', block: 'nearest' });
    keyHandler = (e) => { if (e.key === 'Enter') startClass(S.classIdx); };
  }

  function welcome() {
    h(`<div class="card" style="text-align:center">
        <div style="font-size:72px">🏀</div>
        <h1>Math Hoops</h1>
        <p>One game a day. Train like a pro, win the AMC 8 Finals.</p>
        <label for="nm">Player name</label><input id="nm" autocomplete="off" maxlength="20">
        <label for="num">Jersey number</label><input id="num" type="number" min="0" max="99" value="23">
        <label for="dt">AMC 8 date (check the MAA site; this can be changed later)</label><input id="dt" type="date" value="${S.contestDate}">

        <p></p><button class="btn big go" id="go">Let's go!</button>
      </div>`);
    onHome = true;
    $('#nm').focus();
    $('#go').onclick = () => { const n = $('#nm').value.trim(); if (!n) return $('#nm').focus(); S.name = n; S.number = Math.max(0, Math.min(99, parseInt($('#num').value, 10) || 0)); S.contestDate = $('#dt').value || S.contestDate; save(); home(); };
  }

  // ── Class player
  let P, clock;
  function startClass(idx, custom) {
    clearTimers();
    const cls = custom || E.buildClass(S, idx);
    const steps = [];
    for (const seg of cls.segments) {
      if (seg.type === 'shootaround') steps.push({ kind: 'shoot' });
      else if (seg.type === 'warmup' || seg.type === 'quiz') seg.questions.forEach((q, i) => steps.push({ kind: 'q', seg: seg.type, q, n: i + 1, of: seg.questions.length, part: seg.part }));
      else if (seg.type === 'lesson') TOP[seg.topic].slides.forEach((s, i) => steps.push({ kind: 'slide', topic: seg.topic, i, pass: seg.pass }));
      else if (seg.type === 'trick') steps.push({ kind: 'trick', topic: seg.topic, tip: seg.tip });
      else if (seg.type === 'break') steps.push({ kind: 'break' });
      else if (seg.type === 'boss') steps.push({ kind: 'boss', q: seg.questions[0] });
      else if (seg.type === 'mock') steps.push({ kind: 'mock', qs: seg.questions });
      else if (seg.type === 'paper') steps.push({ kind: 'paper', year: seg.year, url: seg.url });
    }
    P = { cls, steps, i: 0, xp: 0, right: 0, total: 0, combo: 0, bestCombo: 0, bossWin: false, t0: Date.now(), practice: !!custom, missed: [] };
    clearInterval(clock);
    clock = setInterval(() => { const c = $('#clock'); if (c) c.textContent = `⏱ ${Math.floor((Date.now() - P.t0) / 60000)}m`; }, 15000);
    show();
  }

  function frame(inner, label) {
    const cur = P.steps[P.i];
    const bars = P.steps.map((s, i) => `<i class="${i < P.i ? 'on' : i === P.i ? 'cur' : ''}"></i>`).join('');
    const mins = Math.floor((Date.now() - P.t0) / 60000);
    h(`<div class="topbar"><button class="btn ghost small" id="quit" aria-label="Leave class">✕</button><div class="steps">${bars}</div><span class="pill">🏀 ${P.xp}</span><span class="pill" id="clock">⏱ ${mins}m</span></div>
       ${label ? `<span class="tag">${label}</span>` : ''}${inner}`);
    $('#quit').onclick = () => { if (confirm('Leave this class? Progress in this class will be lost.')) home(); };
    return cur;
  }

  function next() { clearTimers(); P.i++; P.i >= P.steps.length ? results() : show(); }

  function show() {
    const s = P.steps[P.i];
    keyHandler = null;
    if (s.kind === 'shoot') return shootaround();
    if (s.kind === 'slide') return slide(s);
    if (s.kind === 'trick') return trick(s);
    if (s.kind === 'q') return question(s);
    if (s.kind === 'break') return brainBreak();
    if (s.kind === 'boss') return boss(s);
    if (s.kind === 'mock') return mock(s);
    if (s.kind === 'paper') return paper(s);
  }

  // Color code used in all lessons: {g:given} blue, {f:find} orange, {a:answer} green.
  const fmt = (t) => String(t).replace(/\{([gfa]):([^}]*)\}/g, (_, k, x) => `<span class="cc-${k}">${x}</span>`);
  const plain = (t) => String(t).replace(/\{[gfa]:([^}]*)\}/g, '$1');

  function slide(s) {
    const t = TOP[s.topic], sl = t.slides[s.i];
    const label = `🎬 Film room · ${t.emoji} ${t.name}${s.pass === 2 ? ' · Level Up' : ''} · ${s.i + 1} of ${t.slides.length}`;
    if (sl.type === 'predict') return predictSlide(sl, label);
    if (sl.type === 'steps') return stepsSlide(sl, label);
    if (sl.type === 'order') return orderSlide(sl, label);
    frame(`<div class="card">
        <h2>${sl.h}</h2>
        <div id="pic">${sl.svg}</div>
        <p class="slide-text">${fmt(sl.text)}</p>
        <div class="row spread"><button class="btn ghost small" id="say">🔊 Read to me</button><button class="btn ghost small" id="replay">🔁 Replay</button><button class="btn" id="nx">Got it ▶</button></div>
      </div>`, label);
    const replay = () => { const p = $('#pic'); p.innerHTML = sl.svg; };
    $('#pic').onclick = replay; $('#replay').onclick = replay;
    $('#say').onclick = () => speak(`${sl.h}. ${plain(sl.text)}`);
    autoSpeak(`${sl.h}. ${plain(sl.text)}`);
    $('#nx').onclick = next;
    keyHandler = (e) => { if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') { e.preventDefault(); next(); } };
  }

  const nextKeys = () => { keyHandler = (e) => { if (e.key === 'Enter' || e.key === 'ArrowRight') { e.preventDefault(); next(); } }; };

  // Guess first, then the picture explains. Any guess is fine: guessing is what hooks attention.
  function predictSlide(sl, label) {
    frame(`<div class="card">
        <h2>🤔 ${sl.h}</h2>
        <p class="slide-text">${fmt(sl.ask)}</p>
        <p class="muted" style="margin:0 0 8px">Make your call:</p>
        <div class="guesses">${sl.options.map((o) => `<button class="btn ghost guess" data-o="${esc(o)}">${esc(o)}</button>`).join('')}</div>
        <div id="rv"></div>
        <div class="row" style="margin-top:10px"><button class="btn ghost small" id="say">🔊 Read to me</button></div>
      </div>`, label);
    $('#say').onclick = () => speak(`${sl.h}. ${plain(sl.ask)}. ${sl.options.join(', ')}`);
    autoSpeak(plain(sl.ask));
    const pickIt = (b) => {
      const ok = b.dataset.o === sl.answer;
      app.querySelectorAll('.guess').forEach((g) => { g.disabled = true; if (g.dataset.o === sl.answer) g.classList.add('right-g'); });
      if (!ok) b.classList.add('wrong-g');
      if (ok) { sfx.good(); swish(); P.xp += 2; floater('+2', b); } else sfx.bad();
      $('#rv').innerHTML = `<div class="feedback ${ok ? 'good' : 'bad'}">${ok ? 'Called it! 🎯' : 'Good guess! Watch the replay:'}</div>
        ${sl.svg ? `<div id="pic">${sl.svg}</div>` : ''}<p class="slide-text">${fmt(sl.text)}</p><button class="btn big" id="nx">Got it ▶</button>`;
      autoSpeak(plain(sl.text));
      $('#nx').onclick = next; nextKeys();
      $('#rv').scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    app.querySelectorAll('.guess').forEach((b) => (b.onclick = () => pickIt(b)));
    keyHandler = (e) => { const i = '1234'.indexOf(e.key); const g = app.querySelectorAll('.guess')[i]; if (g && !g.disabled) pickIt(g); };
  }

  // A worked example that builds one tap at a time; the newest step is highlighted.
  function stepsSlide(sl, label) {
    let shown = 0;
    frame(`<div class="card">
        <h2>📋 ${sl.h}</h2>
        <div class="problem">${fmt(sl.problem)}</div>
        ${sl.svg ? `<div id="pic">${sl.svg}</div>` : ''}
        <div id="stp"></div>
        <div class="row spread" style="margin-top:10px"><button class="btn ghost small" id="say">🔊 Read to me</button><button class="btn" id="nx">Show step 1 ▶</button></div>
      </div>`, label);
    const btn = $('#nx');
    const reveal = () => {
      if (shown === sl.steps.length) return next();
      const st = sl.steps[shown++];
      app.querySelectorAll('.step').forEach((d) => d.classList.remove('now'));
      $('#stp').insertAdjacentHTML('beforeend', `<div class="step now"><b>Step ${shown}</b>${st.svg || ''}<p>${fmt(st.say)}</p></div>`);
      autoSpeak(plain(st.say)); sfx.tick();
      btn.textContent = shown === sl.steps.length ? 'Got it ▶' : `Show step ${shown + 1} ▶`;
      app.querySelector('.step.now').scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
    btn.onclick = reveal;
    $('#say').onclick = () => speak(plain(sl.problem) + '. ' + sl.steps.slice(0, shown).map((x) => plain(x.say)).join(' '));
    autoSpeak(plain(sl.problem));
    keyHandler = (e) => { if (e.key === 'Enter' || e.key === 'ArrowRight') { e.preventDefault(); reveal(); } };
  }

  // Tap items into order; a wrong tap shakes and resets so he can try again.
  function orderSlide(sl, label) {
    let picked = [];
    const draw = () => {
      $('#slots').innerHTML = sl.answer.map((_, i) => `<div class="slot">${i + 1}. ${picked[i] ? esc(picked[i]) : ''}</div>`).join('');
      app.querySelectorAll('.chip').forEach((c) => (c.disabled = picked.includes(c.dataset.v)));
    };
    frame(`<div class="card" id="oc">
        <h2>👆 ${sl.h}</h2>
        <p class="slide-text">${fmt(sl.text)}</p>
        <div class="guesses">${shuffleArr(sl.items).map((v) => `<button class="btn ghost chip" data-v="${esc(v)}">${esc(v)}</button>`).join('')}</div>
        <div id="slots" class="slots"></div>
        <div id="rv"></div>
      </div>`, label);
    autoSpeak(plain(sl.text));
    draw();
    app.querySelectorAll('.chip').forEach((c) => (c.onclick = () => {
      picked.push(c.dataset.v); sfx.tick(); draw();
      if (picked[picked.length - 1] !== sl.answer[picked.length - 1]) {
        sfx.bad(); $('#oc').classList.remove('shake'); void $('#oc').offsetWidth; $('#oc').classList.add('shake');
        $('#rv').innerHTML = '<div class="feedback bad">Not that one. Re-read the clues and try again!</div>';
        picked = []; setTimeout(draw, 500); return;
      }
      if (picked.length === sl.answer.length) {
        sfx.good(); swish(); P.xp += 3; floater('+3', $('#oc'));
        $('#rv').innerHTML = `<div class="feedback good">Nailed it! ${esc(sl.explain)}</div><p></p><button class="btn big" id="nx">Next ▶</button>`;
        $('#nx').onclick = next; nextKeys();
      }
    }));
  }
  const shuffleArr = (a) => window.U.shuffle(a);

  function trick(s) {
    sfx.level();
    const id = `${s.topic}|${s.tip.name}`, isNew = !S.cards.includes(id);
    if (isNew && !P.practice) S.cards.push(id);
    frame(`<div class="tcard flip">
        <div class="tcard-top">${TOP[s.topic].emoji} ${esc(TOP[s.topic].name)}<span>${isNew ? 'NEW' : 'PLAY'}</span></div>
        <h2>🃏 ${esc(s.tip.name)}</h2>
        <p class="slide-text">${esc(s.tip.how)}</p>
        <div class="ex">Example: ${esc(s.tip.ex)}</div>
      </div>
      <div class="row spread"><button class="btn ghost small" id="say">🔊 Read to me</button><button class="btn" id="nx">Run this play in the game ▶</button></div>`, isNew ? 'New play added to your Playbook!' : 'Play of the day');
    $('#say').onclick = () => speak(`${s.tip.name}. ${s.tip.how}. Example: ${s.tip.ex}`);
    autoSpeak(`${s.tip.name}. ${s.tip.how}`);
    $('#nx').onclick = next;
    keyHandler = (e) => { if (e.key === 'Enter') next(); };
  }

  // Shared multiple-choice block. A first miss gets one more try; after that the solution appears.
  function askQ(q, { seg, onDone, label, before = '' }) {
    let tries = 0, done = false, hintsUsed = 0;
    const hintBar = q.hints ? `<div class="row" id="hb" style="margin-top:10px"><button class="btn ghost small" id="h1">💡 Small hint (−10)</button></div><div id="hs"></div>` : '';
    const choices = q.choices.map((c, i) => `<button class="choice" data-c="${esc(c)}"><span class="L">${LETTERS[i]}</span><span>${esc(c)}</span></button>`).join('');
    frame(`${before}<div class="card" id="qc">
        <div class="qtext">${esc(q.q)}</div>
        ${q.svg ? `<div class="qviz">${q.svg}</div>` : ''}
        <div class="choices">${choices}</div>
        ${hintBar}
        <div id="fb"></div>
        <div class="row spread" style="margin-top:12px"><button class="btn ghost small" id="say">🔊 Read</button><span class="combo" id="combo">${P.combo >= 3 ? `🔥 ${P.combo} straight: you're heating up!` : P.combo === 2 ? '🔥 2 in a row' : ''}</span></div>
      </div>`, label);
    $('#say').onclick = () => speak(q.q + '. ' + q.choices.map((c, i) => LETTERS[i] + ': ' + c).join('. '));
    autoSpeak(q.q);
    const btns = [...app.querySelectorAll('.choice')];
    const finish = (correct) => {
      done = true;
      btns.forEach((b) => { b.disabled = true; if (b.dataset.c === q.answer) b.classList.add('right'); });
      const firstTry = tries === 1 && correct;
      E.record(S, q, correct, firstTry);
      if (!firstTry && q.topic) P.missed.push(q.topic);
      P.total++;
      if (correct) P.right++;
      P.combo = firstTry ? P.combo + 1 : 0;
      P.bestCombo = Math.max(P.bestCombo, P.combo);
      const gain = Math.max(correct ? 5 : 0, E.xpFor(seg, correct, firstTry, P.combo) - 10 * hintsUsed);
      if (q.id && !P.practice && !(S.hardSeen || []).includes(q.id)) (S.hardSeen = S.hardSeen || []).push(q.id);
      const hb = $('#hb'); if (hb) hb.remove();
      P.xp += gain;
      if (gain) floater(`+${gain}`, $('#qc'));
      if (correct) swish();
      const praise = ['Swish! 🏀', 'Nothing but net!', 'And one! 💪', 'Splash! 💦', 'Bucket! 🔥', 'Too easy! 😎', 'From downtown! 🎯'];
      const steps = q.steps.map((s) => `<li>${esc(s)}</li>`).join('');
      $('#fb').innerHTML = `<div class="feedback ${correct ? 'good' : 'bad'}">${correct ? (firstTry ? praise[Math.floor(Math.random() * praise.length)] : 'Got it on the second try 👍') : `The answer is <b>${esc(q.answer)}</b>. Here's how:`}
        ${correct && firstTry ? `<details><summary>See the fast way</summary><ol class="sol">${steps}</ol></details>` : `<ol class="sol">${steps}</ol>`}</div>
        ${firstTry ? '' : `<div class="why" id="why"><b>What happened?</b> (one tap)<div class="guesses">${Object.entries(E.MISTAKES).map(([k, [em, t]]) => `<button class="btn ghost small mk" data-k="${k}">${em} ${t}</button>`).join('')}</div></div>`}
        ${q.key ? `<div class="why" id="kq"><b>🔑 What was the key idea?</b><div class="guesses">${window.HARD.keyOptions({ key: q.key }).map((k) => `<button class="btn ghost small kk" data-k="${esc(k)}">${esc(k)}</button>`).join('')}</div></div>` : ''}
        <p></p><button class="btn big" id="nx">Next ▶</button>`;
      app.querySelectorAll('.mk').forEach((b) => (b.onclick = () => {
        E.recordMistake(S, q, b.dataset.k);
        $('#why').innerHTML = `<b>Logged: ${E.MISTAKES[b.dataset.k][0]} ${E.MISTAKES[b.dataset.k][1]}.</b> ${{ careless: 'Slow down on the easy steps and double-check.', concept: 'It comes back in your warm-ups. You will get it.', trick: 'Check your Playbook for this one.', time: 'Skip and come back next time; every question is worth the same.' }[b.dataset.k]}`;
      }));
      app.querySelectorAll('.kk').forEach((b) => (b.onclick = () => {
        const ok = b.dataset.k === q.key;
        app.querySelectorAll('.kk').forEach((x) => { x.disabled = true; if (x.dataset.k === q.key) x.classList.add('right-g'); });
        if (ok) { P.xp += 5; floater('+5', b); sfx.good(); } else { b.classList.add('wrong-g'); sfx.bad(); }
      }));
      $('#combo').textContent = P.combo >= 3 ? `🔥 ${P.combo} straight: you're heating up!` : P.combo === 2 ? '🔥 2 in a row' : '';
      if (P.combo && P.combo % 5 === 0) confetti(40);
      $('#nx').onclick = () => onDone(correct, firstTry);
      $('#nx').focus({ preventScroll: true });
      keyHandler = (e) => { if (e.key === 'Enter') { e.preventDefault(); onDone(correct, firstTry); } };
    };
    const pick = (b) => {
      if (done || b.disabled) return;
      tries++;
      if (b.dataset.c === q.answer) { sfx.good(); return finish(true); }
      sfx.bad(); b.classList.add('wrong'); b.disabled = true;
      $('#qc').classList.remove('shake'); void $('#qc').offsetWidth; $('#qc').classList.add('shake');
      if (tries === 1) $('#fb').innerHTML = '<div class="feedback bad">Rim out! Grab the rebound: one more shot. 💪</div>';
      else finish(false);
    };
    btns.forEach((b) => (b.onclick = () => pick(b)));
    if (q.hints) {
      const showHint = (i) => {
        hintsUsed = i + 1; sfx.tick();
        $('#hs').insertAdjacentHTML('beforeend', `<div class="hint">💡 ${esc(q.hints[i])}</div>`);
        $('#hb').innerHTML = i === 0 && q.hints[1] ? '<button class="btn ghost small" id="h2">💡💡 Big hint (−10)</button>' : '';
        const h2 = $('#h2'); if (h2) h2.onclick = () => showHint(1);
      };
      $('#h1').onclick = () => showHint(0);
    }
    keyHandler = (e) => {
      const k = e.key.toUpperCase(), i = '12345'.includes(k) ? +k - 1 : LETTERS.indexOf(k);
      if (i >= 0 && i < 5 && btns[i]) pick(btns[i]);
    };
  }

  function question(s) {
    const t = TOP[s.q.topic];
    const label = s.seg === 'warmup' ? `Pregame warm-up ${s.n}/${s.of} · ${t.emoji} ${t.name}` : `${s.part === 2 ? '2nd' : '1st'} half · possession ${s.n}/${s.of}`;
    askQ(s.q, { seg: s.seg, label, onDone: next });
  }

  function brainBreak() {
    const move = H.HALFTIME[Math.floor(Math.random() * H.HALFTIME.length)];
    const total = 40; let left = total;
    const C = 2 * Math.PI * 64;
    frame(`<div class="card" style="text-align:center">
        <h2>⏸️ Halftime drills!</h2>
        <p class="slide-text">${move}</p>
        <div class="ringwrap"><svg class="ring" viewBox="0 0 160 160"><circle class="bg" cx="80" cy="80" r="64"/><circle class="fg" id="fg" cx="80" cy="80" r="64" stroke-dasharray="${C}" stroke-dashoffset="0"/><text x="80" y="80" id="sec">${left}</text></svg></div>
        <button class="btn big" id="nx" disabled>Ready in a moment…</button>
      </div>`, 'Halftime');
    autoSpeak('Halftime! ' + move);
    const nx = $('#nx');
    timers.push(setInterval(() => {
      left--;
      const sec = $('#sec'), fg = $('#fg');
      if (!sec) return;
      sec.textContent = Math.max(0, left);
      fg.setAttribute('stroke-dashoffset', String(C * (1 - left / total)));
      if (left === total - 15) { nx.disabled = false; nx.textContent = "Done, back on the court ▶"; }
      if (left <= 0) { sfx.level(); nx.textContent = 'Back on the court ▶'; clearTimers(); }
    }, 1000));
    nx.onclick = next;
  }

  function boss(s) {
    const m = '🏀';
    const before = `<div class="card scoreboard"><div class="sb-row"><span>${esc(S.name.toUpperCase())}</span><b>98</b><i>–</i><b>98</b><span>${esc(H.opponent(P.cls.idx).toUpperCase())}</span></div>
      <div class="boss">${m}</div><div class="boss-msg" id="bm"></div><div class="hp"><i id="hp" style="width:100%"></i></div>
      <p style="text-align:center"><b>Clutch time!</b> Tie game, ball in your hands. A real AMC-level problem. Hints cost points, but they are better than a miss. <span class="pill" id="bt">2:00</span></p></div>`;
    let left = 120;
    askQ(s.q, {
      seg: 'boss', label: 'Clutch shot', before,
      onDone: (correct) => { P.bossWin = correct; next(); },
    });
    timers.push(setInterval(() => {
      left = Math.max(0, left - 1);
      const bt = $('#bt'); if (bt) bt.textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
      if (left === 0) clearTimers();
    }, 1000));
    // Watch for the answer to animate the boss.
    const obs = new MutationObserver(() => {
      const ok = app.querySelector('.feedback.good'), bad = app.querySelector('.choice.right') && !ok;
      const hp = $('#hp');
      if (ok && hp) { hp.style.width = '0%'; app.querySelector('.boss').textContent = '🏆'; $('#bm').textContent = 'GAME WINNER!'; confetti(80); sfx.level(); obs.disconnect(); }
      else if (bad && hp) { app.querySelector('.boss').textContent = '😤'; $('#bm').textContent = 'So close. Study the replay!'; obs.disconnect(); }
    });
    obs.observe(app, { subtree: true, childList: true });
  }

  // Practice contest: no feedback until the end, like the real AMC. Unanswered = 0 points.
  function mock(s) {
    const picks = Array(s.qs.length).fill(null);
    let cur = 0, left = 25 * 60;
    const render = () => {
      const q = s.qs[cur];
      const nav = s.qs.map((_, i) => `<button class="btn small ${i === cur ? '' : 'ghost'}" data-j="${i}" style="min-width:42px">${picks[i] != null ? '●' : i + 1}</button>`).join('');
      frame(`<div class="card"><div class="row spread"><b>Problem ${cur + 1} of ${s.qs.length}</b><span class="pill" id="mt"></span></div></div>
        <div class="card"><div class="qtext">${esc(q.q)}</div>${q.svg ? `<div class="qviz">${q.svg}</div>` : ''}<div class="choices">${q.choices.map((c, i) => `<button class="choice ${picks[cur] === c ? 'picked' : ''}" data-c="${esc(c)}"><span class="L">${LETTERS[i]}</span><span>${esc(c)}</span></button>`).join('')}</div>
        <p></p><div class="row spread"><button class="btn ghost" id="pv" ${cur ? '' : 'disabled'}>◀ Back</button><button class="btn ghost" id="skip">Skip</button><button class="btn" id="fw">${cur === s.qs.length - 1 ? 'Finish' : 'Next ▶'}</button></div></div>
        <div class="card"><div class="row">${nav}</div></div>`, P.cls.title);
      tick();
      app.querySelectorAll('.choice').forEach((b) => (b.onclick = () => { picks[cur] = b.dataset.c; sfx.tick(); render(); }));
      app.querySelectorAll('[data-j]').forEach((b) => (b.onclick = () => { cur = +b.dataset.j; render(); }));
      $('#pv').onclick = () => { cur--; render(); };
      $('#skip').onclick = $('#fw').onclick = () => { if (cur < s.qs.length - 1) { cur++; render(); } else if (confirm('Hand in your answers?')) grade(); };
      keyHandler = (e) => {
        const k = e.key.toUpperCase(), i = '12345'.includes(k) ? +k - 1 : LETTERS.indexOf(k);
        if (i >= 0 && i < 5) { picks[cur] = q.choices[i]; render(); }
        if (e.key === 'ArrowRight' && cur < s.qs.length - 1) { cur++; render(); }
        if (e.key === 'ArrowLeft' && cur) { cur--; render(); }
      };
    };
    const tick = () => { const mt = $('#mt'); if (mt) mt.textContent = `⏳ ${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`; };
    const grade = () => {
      clearTimers();
      s.qs.forEach((q, i) => { const ok = picks[i] === q.answer; E.record(S, q, ok, true); P.total++; if (ok) { P.right++; P.xp += 15; } });
      P.review = s.qs.map((q, i) => ({ q, pick: picks[i] }));
      next();
    };
    render();
    timers.push(setInterval(() => { left--; tick(); if (left <= 0) { alert("Time's up! Let's see how you did."); grade(); } }, 1000));
  }

  // A real past paper, taken on the hosting site (or printed). He types in his score after.
  function paper(s) {
    frame(`<div class="card scoreboard" style="text-align:center"><div style="font-size:56px">🏆</div>
        <h2 style="color:#ffd43b">The Finals: ${s.year} AMC 8</h2>
        <p>The real test from ${s.year}. 25 problems, 40 minutes, pencil and scratch paper only. No calculator!</p></div>
      <div class="card">
        <ol class="sol"><li>Get scratch paper and a pencil, and set a 40-minute timer.</li>
          <li>Pacing goal: problems 1–10 in about 12 minutes. If one takes over 2 minutes, skip it and come back.</li>
          <li>Open the test and press <b>Start</b> there. When you finish, check the answers on that page.</li></ol>
        <a class="btn big go" href="${s.url}" target="_blank" rel="noopener" style="display:block;text-align:center;text-decoration:none">Open the ${s.year} AMC 8 ↗</a>
        <label for="sc">How many did you get right? (0–25)</label><input id="sc" type="number" min="0" max="25" inputmode="numeric">
        <p></p><button class="btn big" id="nx">Record my score ▶</button>
        <p class="muted" style="font-size:14px">Problems hosted with MAA permission by LIVE by Po-Shen Loh.</p></div>`, 'Finals');
    $('#nx').onclick = () => {
      const v = parseInt($('#sc').value, 10);
      if (!(v >= 0 && v <= 25)) { $('#sc').focus(); return; }
      P.right = v; P.total = 25; P.xp += v * 4;
      next();
    };
  }

  function results() {
    clearTimers(); clearInterval(clock); keyHandler = null;
    const pct = P.total ? P.right / P.total : 0;
    const stars = pct >= 0.9 ? 3 : pct >= 0.7 ? 2 : 1;
    let earned = [];
    const before = E.levelOf(S.xp).lvl;
    if (!P.practice) earned = E.finishClass(S, P.cls, { xp: P.xp, right: P.right, total: P.total, score: P.right, bossWin: P.bossWin });
    else S.xp += P.xp;
    const win = !P.practice && earned.win;
    const pack = P.practice ? null : openPack(win);
    save(P.practice ? null : S.log[S.log.length - 1]);
    const leveled = E.levelOf(S.xp).lvl > before;
    confetti(stars * 40); sfx.level();
    const review = P.review ? `<div class="card"><h3>Review your answers</h3>${P.review.map(({ q, pick }, i) => `
        <details ${pick === q.answer ? '' : 'open'}><summary>${pick === q.answer ? '✅' : pick == null ? '⬜' : '❌'} ${i + 1}. ${esc(q.q)}</summary>
        <p>Your answer: <b>${pick == null ? 'skipped' : esc(pick)}</b> · Correct: <b>${esc(q.answer)}</b></p><ol class="sol">${q.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol></details>`).join('')}</div>` : '';
    h(`<div class="card" style="text-align:center">
        <h1>${P.practice ? 'Practice complete! 🎉' : P.cls.kind === 'paper' ? `${P.right}/25 on the real AMC 8 ${P.right >= 21 ? '👑' : '🏆'}` : win ? 'FINAL: WIN! 🏆' : 'FINAL: tough loss 😤'}</h1>
        ${P.cls.kind === 'paper' ? `<p>${P.right >= 24 ? 'Distinguished Honor Roll level!' : P.right >= 21 ? 'Honor Roll level!' : `Honor Roll was 21 in 2026: ${21 - P.right} more to go.`}</p>` : ''}
        ${P.practice ? '' : `<p class="muted">Season record ${S.wins}–${S.losses}${earned.usedTimeout ? ' · ⏸️ a timeout saved your streak!' : ''}</p>`}
        <div class="stars">${'⭐'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>
        <h2>${P.right} / ${P.total} correct</h2>
        <div class="grid2"><div class="stat"><b>+${P.xp}</b>points</div><div class="stat"><b>🔥 ${S.streak}</b>day streak</div><div class="stat"><b>${P.bestCombo}</b>best combo</div>${P.cls.kind === 'lesson' ? `<div class="stat"><b>${P.bossWin ? '🏆' : '😤'}</b>${P.bossWin ? 'hit the game-winner' : 'missed the clutch shot'}</div>` : ''}</div>
        ${leveled ? `<h3 style="margin-top:14px">⬆️ Level up! You're now level ${E.levelOf(S.xp).lvl}: ${H.rankOf(E.levelOf(S.xp).lvl)}</h3>` : ''}
        ${pack ? `<div class="pack" id="pack"><button class="btn big" id="open">🎁 Open your post-game pack</button></div>` : ''}
        ${earned.length ? `<p style="margin-top:14px"><b>New badge${earned.length > 1 ? 's' : ''}:</b><br>${earned.map((b) => `<span class="badge">${E.BADGES[b][0]} ${E.BADGES[b][1]}</span>`).join('')}</p>` : ''}
        <p class="muted" style="margin-top:12px">${pct >= 0.9 ? 'Outstanding. You own this topic!' : pct >= 0.7 ? 'Great work. A few more reps and it sticks.' : 'Tough one! It comes back in your warm-ups so you can beat it.'}</p>
        <button class="btn big go" id="home">Back home 🏠</button>
      </div>${nextUp()}${review}`);
    $('#home').onclick = home;
    bindPracticeButtons();
    if (pack) $('#open').onclick = () => { sfx.level(); confetti(60); $('#pack').innerHTML = `<div class="pack-open">${pack.em}<b>${esc(pack.label)}</b>${pack.kind ? '<span>Equip it in the Locker room</span>' : ''}</div>`; };
  }

  // ── Shootaround: 60 seconds of rapid-fire mental math on a big keypad. Typing the answer
  // (no choices to lean on) is what builds the instant recall a "calculation machine" needs.
  function shootaround() {
    let left = 60, made = 0, shots = 0, entry = '', fact = H.nextFact(S), shownAt = Date.now(), over = false;
    const keys = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '.', '0', '⌫'];
    frame(`<div class="card" style="text-align:center">
        <div class="row spread"><span class="pill">🏀 ${'<b id="made">0</b>'} made</span><span class="pill" id="sc">⏱ 60</span><span class="pill">🏅 Best ${S.shootPB}</span></div>
        <div class="fact" id="fq"></div>
        <div class="entry" id="en">&nbsp;</div>
        <div class="miss" id="ms">&nbsp;</div>
        <div class="keypad">${keys.map((k) => `<button class="key" data-k="${k}">${k}</button>`).join('')}</div>
        <button class="btn big go" id="shoot">Shoot! 🏀</button>
      </div>`, 'Shootaround: how many can you sink in 60 seconds?');
    const draw = () => { $('#fq').textContent = fact.q; $('#en').innerHTML = entry || '&nbsp;'; };
    const shoot = () => {
      if (over || entry === '') return;
      shots++;
      const ok = Math.abs(Number(entry) - fact.a) < 1e-9;
      H.recordFact(S, fact, ok, Date.now() - shownAt);
      if (ok) { made++; swish(); sfx.good(); $('#made').textContent = made; }
      $('#ms').textContent = ok ? '' : `Brick! ${fact.q} = ${fact.a}`;
      if (!ok) sfx.bad();
      entry = ''; const last = fact.key; do fact = H.nextFact(S); while (fact.key === last); shownAt = Date.now(); draw();
    };
    const press = (k) => { if (over) return; if (k === '⌫') entry = entry.slice(0, -1); else if (entry.length < 7) entry += k; draw(); };
    app.querySelectorAll('.key').forEach((b) => (b.onclick = () => press(b.dataset.k)));
    $('#shoot').onclick = shoot;
    keyHandler = (e) => { if (/^[0-9.]$/.test(e.key)) press(e.key); else if (e.key === 'Backspace') press('⌫'); else if (e.key === 'Enter') shoot(); };
    draw();
    timers.push(setInterval(() => {
      left--; const sc = $('#sc'); if (sc) sc.textContent = `⏱ ${left}`;
      if (left > 0) return;
      over = true; clearTimers(); keyHandler = null;
      const pb = made > S.shootPB;
      if (pb) S.shootPB = made;
      P.xp += made * 2;
      sfx.level(); if (pb) confetti(60);
      $('#fq').textContent = pb ? `🏆 New personal best: ${made}!` : `${made} made out of ${shots}`;
      $('#en').innerHTML = '&nbsp;';
      const btn = $('#shoot'); btn.textContent = 'To the locker room ▶'; btn.onclick = next;
      keyHandler = (e) => { if (e.key === 'Enter') next(); };
    }, 1000));
  }

  // ── Post-game pack: a surprise reward. Wins open a pack more often than losses.
  function openPack(win) {
    if (Math.random() > (win ? 0.8 : 0.35)) return null;
    const locked = [
      ...H.JERSEYS.filter((j) => !S.unlocks.includes(j.id)).map((j) => ({ kind: 'jersey', id: j.id, label: `${j.name} jersey`, em: '👕' })),
      ...H.COURTS.filter((c) => !S.unlocks.includes(c.id)).map((c) => ({ kind: 'court', id: c.id, label: `${c.name} court`, em: '🏟️' })),
    ];
    if (!locked.length || (S.timeouts < 3 && Math.random() < 0.2)) { S.timeouts = Math.min(3, S.timeouts + 1); return { label: 'Extra timeout', em: '⏸️' }; }
    const r = locked[Math.floor(Math.random() * locked.length)];
    S.unlocks.push(r.id);
    return r;
  }

  function playbookPage() {
    const all = window.TOPICS.flatMap((t) => t.tips.map((tip) => ({ t, tip, id: `${t.id}|${tip.name}` })));
    h(`<div class="card"><div class="row spread"><h2>🃏 Playbook</h2><button class="btn ghost small" id="back">✕</button></div>
      <p class="muted">${S.cards.length} of ${all.length} plays collected. New plays unlock in your games.</p></div>
      <div class="cards">${all.map(({ t, tip, id }) => S.cards.includes(id)
        ? `<div class="tcard"><div class="tcard-top">${t.emoji} ${esc(t.name)}</div><h3>${esc(tip.name)}</h3><p>${esc(tip.how)}</p><div class="ex">${esc(tip.ex)}</div></div>`
        : `<div class="tcard locked"><div class="tcard-top">${t.emoji} ${esc(t.name)}</div><h3>🔒 ???</h3></div>`).join('')}</div>`);
    $('#back').onclick = home;
  }

  function lockerRoom() {
    h(`<div class="card" style="text-align:center"><div class="row spread"><h2>👕 Locker room</h2><button class="btn ghost small" id="back">✕</button></div>
        <div class="avatar" id="av">${jerseySvg(140)}</div>
        <label for="num">Jersey number</label><input id="num" type="number" min="0" max="99" value="${S.number}" style="max-width:120px;text-align:center">
        <h3 style="margin-top:16px">Jerseys</h3>
        <div class="swatches">${H.JERSEYS.map((j) => `<button class="swatch ${S.jersey === j.id ? 'on' : ''}" data-j="${j.id}" ${S.unlocks.includes(j.id) ? '' : 'disabled'} style="background:${j.main};border-color:${j.trim}" title="${j.name}">${S.unlocks.includes(j.id) ? '' : '🔒'}</button>`).join('')}</div>
        <h3 style="margin-top:16px">Courts</h3>
        <div class="grid2">${H.COURTS.map((c) => `<button class="btn ${S.court === c.id ? '' : 'ghost'}" data-c="${c.id}" ${S.unlocks.includes(c.id) ? '' : 'disabled'}>${S.unlocks.includes(c.id) ? '' : '🔒 '}${c.name}</button>`).join('')}</div>
        <p class="muted" style="margin-top:12px">Win games to open packs and unlock more.</p></div>`);
    $('#back').onclick = () => { S.number = Math.max(0, Math.min(99, parseInt($('#num').value, 10) || 0)); save(); home(); };
    $('#num').oninput = () => { S.number = Math.max(0, Math.min(99, parseInt($('#num').value, 10) || 0)); $('#av').innerHTML = jerseySvg(140); };
    app.querySelectorAll('[data-j]').forEach((b) => (b.onclick = () => { S.jersey = b.dataset.j; save(); lockerRoom(); }));
    app.querySelectorAll('[data-c]').forEach((b) => (b.onclick = () => { S.court = b.dataset.c; applyCourt(); save(); lockerRoom(); }));
  }

  // ── Practice Ground: any topic, any time, at the difficulty he picks. Nothing here changes the
  // season record, but answers do count toward topic mastery, so the coach's picks stay current.
  const CHAPTERS = [
    ['🔢 Numbers & arithmetic', ['mental', 'fractions', 'percents', 'ratios', 'rates', 'units']],
    ['🧮 Number theory', ['divisibility', 'gcflcm', 'divisors', 'remainders', 'exponents']],
    ['📈 Algebra, patterns & data', ['equations', 'sequences', 'stats', 'graphs']],
    ['📐 Geometry', ['angles', 'area', 'pythag', 'similar', 'circles', 'coords', 'solids', 'spatial']],
    ['🎲 Counting & probability', ['counting', 'combos', 'casework', 'paths', 'probability', 'probplus']],
    ['🧩 Logic', ['logic']],
  ];
  const LEVELS = { easy: ['🟢 Easy', [1]], mix: ['🟡 Mixed', [1, 2, 2, 3, 3]], hard: ['🔴 AMC hard', [3]] };
  const pg = { level: 'mix', count: 5 };
  try { Object.assign(pg, JSON.parse(pref('mh-pg') || '{}')); } catch { /* defaults */ }

  const focusWhy = (f) => [f.n ? `${f.pct}% first-try lately` : '', f.misses ? `${f.misses} "didn't know" tags` : ''].filter(Boolean).join(' · ');
  const masteryPct = (id) => { const m = S.mastery[id]; return m && m.r.length ? Math.round((100 * m.r.reduce((a, b) => a + b, 0)) / m.r.length) : null; };

  function practiceQuestions(id, level, count) {
    const lv = LEVELS[level][1], gens = window.U.shuffle(TOP[id].gens.map((_, i) => i));
    return Array.from({ length: count }, (_, k) => E.makeQuestion(id, lv[Math.floor((k * lv.length) / count)], gens[k % gens.length]));
  }
  function startPractice(id) {
    startClass(null, { idx: -1, kind: 'practice', title: TOP[id].name, segments: [{ type: 'quiz', part: 1, questions: practiceQuestions(id, pg.level, pg.count) }] });
  }
  // "I've never seen this": the lesson, every shortcut for the topic, then 5 easy-to-medium questions.
  function startLearn(id) {
    const t = TOP[id];
    startClass(null, { idx: -1, kind: 'practice', title: `Learn: ${t.name}`, segments: [
      { type: 'lesson', topic: id, pass: 1 },
      ...t.tips.map((tip) => ({ type: 'trick', topic: id, tip })),
      { type: 'quiz', part: 1, questions: practiceQuestions(id, 'mix', 5) },
    ] });
  }
  // Coach's mix: questions spread over his weakest topics (or everything taught so far).
  function startMix() {
    const weak = E.focusTopics(S, 4).map((f) => f.id).filter((id) => TOP[id]);
    const pool = weak.length >= 2 ? weak : E.taughtTopics(S, S.classIdx).length ? E.taughtTopics(S, S.classIdx) : E.ORDER.slice(0, 3);
    const qs = Array.from({ length: pg.count }, (_, k) => practiceQuestions(pool[k % pool.length], pg.level, 1)[0]);
    startClass(null, { idx: -1, kind: 'practice', title: "Coach's mix", segments: [{ type: 'quiz', part: 1, questions: window.U.shuffle(qs) }] });
  }
  function bindPracticeButtons() {
    app.querySelectorAll('[data-pt]').forEach((b) => (b.onclick = () => startPractice(b.dataset.pt)));
    app.querySelectorAll('[data-lt]').forEach((b) => (b.onclick = () => startLearn(b.dataset.lt)));
  }
  const practiceRow = (id, why) => `<div class="prow"><span class="pname">${TOP[id].emoji} ${esc(TOP[id].name)}${why ? `<small class="muted">${esc(why)}</small>` : ''}</span>
    <span class="prow-b"><button class="btn ghost small" data-lt="${id}" title="Lesson and shortcuts first">📖 Learn</button><button class="btn small" data-pt="${id}">🎯 Practice</button></span></div>`;

  // After any game: the topics to work on next, from today's misses and his recent record.
  function nextUp() {
    const missed = {};
    P.missed.forEach((t) => (missed[t] = (missed[t] || 0) + 1));
    (P.review || []).forEach(({ q, pick }) => { if (pick !== q.answer && q.topic) missed[q.topic] = (missed[q.topic] || 0) + 1; });
    const today = Object.entries(missed).filter(([id]) => TOP[id]).sort((a, b) => b[1] - a[1]).map(([id, c]) => [id, `missed ${c} today`]);
    const overall = E.focusTopics(S, 3).filter((f) => !missed[f.id] && TOP[f.id]).map((f) => [f.id, focusWhy(f)]);
    const recs = [...today, ...overall].slice(0, 3);
    if (!recs.length) return '';
    return `<div class="card"><h3>🎯 Practice these next</h3><p class="muted">Not sure how? Tap 📖 Learn for the lesson and shortcuts first.</p>${recs.map(([id, why]) => practiceRow(id, why)).join('')}</div>`;
  }

  function practiceGround() {
    const focus = E.focusTopics(S, 4).filter((f) => TOP[f.id]);
    const taught = new Set(E.taughtTopics(S, S.classIdx));
    const chip = (id) => {
      const p = masteryPct(id);
      return p == null ? `<span class="pill">${taught.has(id) ? '—' : '🆕'}</span>` : `<span class="pill ${p >= 80 ? 'p-good' : p < 60 ? 'p-low' : ''}">${p}%</span>`;
    };
    h(`<div class="card"><div class="row spread"><h2>🎯 Practice Ground</h2><button class="btn ghost small" id="back">✕</button></div>
        <p class="muted">Practice any topic, even ones the season hasn't reached. Practice never changes your season record.</p>
        <div class="row"><b>Level</b>${Object.entries(LEVELS).map(([k, [label]]) => `<button class="btn small ${pg.level === k ? '' : 'ghost'}" data-lv="${k}">${label}</button>`).join('')}</div>
        <div class="row" style="margin-top:8px"><b>Questions</b>${[5, 10].map((n) => `<button class="btn small ${pg.count === n ? '' : 'ghost'}" data-n="${n}">${n}</button>`).join('')}</div></div>
      <div class="card"><h3>🧢 Coach's picks</h3>
        ${focus.length ? `<p class="muted">Your toughest topics lately. Beat these and your score jumps.</p>${focus.map((f) => practiceRow(f.id, focusWhy(f))).join('')}`
          : '<p class="muted">Play a few more games and the coach will spot what to practice.</p>'}
        <button class="btn big go" id="mix" style="margin-top:10px">🎲 Coach's mix (${pg.count} questions)</button></div>
      ${CHAPTERS.map(([name, ids]) => `<details class="card chap"><summary><h3 style="display:inline">${name}</h3></summary>
        ${ids.filter((id) => TOP[id]).map((id) => `<div class="prow"><span class="pname">${TOP[id].emoji} ${esc(TOP[id].name)}</span>${chip(id)}
          <span class="prow-b"><button class="btn ghost small" data-lt="${id}">📖 Learn</button><button class="btn small" data-pt="${id}">🎯 Practice</button></span></div>`).join('')}</details>`).join('')}
      <p class="muted" style="text-align:center">% = first-try accuracy on recent questions · 🆕 = not in your season yet</p>`);
    $('#back').onclick = home;
    $('#mix').onclick = startMix;
    app.querySelectorAll('[data-lv]').forEach((b) => (b.onclick = () => { pg.level = b.dataset.lv; pref('mh-pg', JSON.stringify(pg)); practiceGround(); }));
    app.querySelectorAll('[data-n]').forEach((b) => (b.onclick = () => { pg.count = +b.dataset.n; pref('mh-pg', JSON.stringify(pg)); practiceGround(); }));
    bindPracticeButtons();
  }

  // ── Test Hacks: how to play the test itself, plus every shortcut from every topic in one place.
  const GAME_PLAN = [
    ['🎯', 'Answer every question', 'There is no penalty for a wrong answer on the AMC 8: your score is just how many you get right. Never leave a blank.', 'Out of time on #24? Pick your best guess. A blank is a guaranteed 0.'],
    ['⏱️', 'Pace yourself', '40 minutes for 25 questions. The early ones are easier: aim to finish #1–10 in about 10 minutes and bank time for the hard ones.', 'Check the clock at question 10 and again at question 20.'],
    ['⏭️', 'Skip and come back', 'Every question is worth 1 point. If one is eating your time, circle it, move on, and return at the end.', 'Stuck for 2 minutes? Skip. A fresh look later often cracks it.'],
    ['🔙', 'Work backwards from the choices', 'Plug the answer choices into the problem. Choices are usually in order, so start with C: if it is too big, try A or B.', '"A number plus 3 times itself is 48." Try C = 12: 12 + 36 = 48 ✓'],
    ['✂️', 'Eliminate', 'Cross out choices that cannot be right: wrong sign, too big, not a whole number, wrong units digit. Then guess from what is left.', 'Area of a 7 × 9 rectangle can only end in 3, so cross out every choice that doesn\'t.'],
    ['🎲', 'Pick easy numbers', 'If a problem works for "any" number, or the answer is a formula, try a simple value like 1, 2, 10 or 100 and test each choice.', 'Percent problems: start with 100. "Up 20% then down 20%" → 100 → 120 → 96.'],
    ['📏', 'Estimate first', 'Round the numbers to get a ballpark, then pick the choice that is close. Often only one choice fits.', '49 × 21 ≈ 50 × 20 = 1000, so 1029 beats 879 and 1290.'],
    ['✏️', 'Draw it', 'Sketch every geometry and word problem and label what you know. Mark what you are looking for with a "?".', 'Two trains, two speeds? Draw a line with both trains on it.'],
    ['🔍', 'Try small cases', 'Big number in the problem? Try the same thing with 1, 2, 3 and 4, and look for the pattern.', 'Units digit of 3¹⁰⁰: 3, 9, 7, 1 repeats every 4. 100 is a multiple of 4, so the answer is 1.'],
    ['📋', 'Make a list or table', 'For counting problems, list in order so you never miss or double count one.', 'Ways to make 10¢ from pennies and nickels: 0, 1 or 2 nickels → 3 ways.'],
    ['❓', 'Read the last line twice', 'Before you start, be sure what is asked: "NOT", "least", "how many more", minutes or hours?', 'You found Sam\'s age, but the question asked for Ann\'s. Re-read before you bubble in.'],
    ['⚖️', 'Check odd and even', 'Odd + odd = even, and even × anything = even. This fast check rules out choices.', 'The sum of 5 odd numbers is odd, so any even choice is out.'],
    ['🧘', 'Reset when stuck', 'Take one slow breath, re-read the question, and ask: "Which play from my Playbook fits?"', 'Mixed-up feeling? Look for a "given" you haven\'t used yet.'],
  ];
  function hacksPage(tab = 'plan', filter = '') {
    const tips = CHAPTERS.flatMap(([ch, ids]) => ids.filter((id) => TOP[id]).flatMap((id) => TOP[id].tips.map((tip) => ({ ch, id, tip }))));
    const f = filter.trim().toLowerCase();
    const shown = f ? tips.filter(({ id, tip }) => `${TOP[id].name} ${tip.name} ${tip.how} ${tip.ex}`.toLowerCase().includes(f)) : tips;
    const tipCard = ({ id, tip }) => `<div class="tcard"><div class="tcard-top">${TOP[id].emoji} ${esc(TOP[id].name)}${S.cards.includes(`${id}|${tip.name}`) ? '<span>IN PLAYBOOK</span>' : ''}</div>
      <h3>${esc(tip.name)}</h3><p>${esc(tip.how)}</p><div class="ex">${esc(tip.ex)}</div>
      <div class="row" style="margin-top:10px"><button class="btn ghost small" data-say="${esc(`${tip.name}. ${tip.how}. Example: ${tip.ex}`)}">🔊</button><button class="btn small" data-pt="${id}">🎯 Try it</button></div></div>`;
    h(`<div class="card"><div class="row spread"><h2>🧰 Test Hacks</h2><button class="btn ghost small" id="back">✕</button></div>
        <div class="row"><button class="btn small ${tab === 'plan' ? '' : 'ghost'}" id="t-plan">🏀 Test-day game plan</button><button class="btn small ${tab === 'tips' ? '' : 'ghost'}" id="t-tips">⚡ Shortcuts by topic (${tips.length})</button></div></div>
      ${tab === 'plan' ? `<div class="cards">${GAME_PLAN.map(([em, name, how, ex]) => `<div class="tcard"><div class="tcard-top">Game plan</div><h3>${em} ${esc(name)}</h3><p>${esc(how)}</p><div class="ex">${esc(ex)}</div>
          <div class="row" style="margin-top:10px"><button class="btn ghost small" data-say="${esc(`${name}. ${how}`)}">🔊</button></div></div>`).join('')}</div>`
        : `<div class="card"><input id="q" type="search" placeholder="Search shortcuts: square, percent, angle…" value="${esc(filter)}"></div>
          ${CHAPTERS.map(([ch]) => { const list = shown.filter((x) => x.ch === ch); return list.length ? `<h3>${ch}</h3><div class="cards">${list.map(tipCard).join('')}</div>` : ''; }).join('') || '<p class="muted">No shortcut matches that search.</p>'}`}`);
    $('#back').onclick = home;
    $('#t-plan').onclick = () => hacksPage('plan');
    $('#t-tips').onclick = () => hacksPage('tips');
    const q = $('#q');
    if (q) { q.oninput = () => { const v = q.value; hacksPage('tips', v); const n = $('#q'); n.focus(); n.setSelectionRange(v.length, v.length); }; }
    app.querySelectorAll('[data-say]').forEach((b) => (b.onclick = () => speak(b.dataset.say)));
    bindPracticeButtons();
  }

  function badgesPage() {
    h(`<div class="card"><div class="row spread"><h2>🏅 Trophies</h2><button class="btn ghost small" id="back">✕</button></div>
      ${Object.entries(E.BADGES).map(([id, [em, name]]) => `<span class="badge ${S.badges.includes(id) ? '' : 'locked'}">${em} ${name}</span>`).join('')}
      <p class="muted" style="margin-top:12px">Best streak: ${S.bestStreak} days · Classes finished: ${S.log.length}</p></div>`);
    $('#back').onclick = home;
  }

  // ── Parent page: mastery per topic, class history, settings
  function parentPage() {
    const rows = E.ORDER.map((id) => {
      const m = S.mastery[id], t = TOP[id];
      if (!m || !m.r.length) return `<tr><td>${t.emoji} ${t.name}</td><td class="muted">not started</td><td></td></tr>`;
      const acc = Math.round((100 * m.r.reduce((a, b) => a + b, 0)) / m.r.length);
      const col = acc >= 80 ? 'var(--good)' : acc >= 60 ? 'var(--accent2)' : 'var(--bad)';
      return `<tr><td>${t.emoji} ${t.name}</td><td><div class="meter"><i style="width:${acc}%;background:${col}"></i></div></td><td>${acc}% <span class="muted">(${m.r.length})</span></td></tr>`;
    }).join('');
    const log = S.log.slice().reverse().slice(0, 30).map((l) => `<tr><td>${l.day}</td><td>${esc(l.title)}</td><td>${l.right}/${l.total}</td><td>+${l.xp}</td></tr>`).join('');
    const weak = E.ORDER.filter((id) => S.mastery[id] && S.mastery[id].r.length >= 5 && S.mastery[id].r.reduce((a, b) => a + b, 0) / S.mastery[id].r.length < 0.6).map((id) => TOP[id].name);
    const mocks = S.log.filter((l) => l.kind === 'mock');
    const papers = S.log.filter((l) => l.kind === 'paper');
    h(`<div class="card"><div class="row spread"><h2>👪 Parent page</h2><button class="btn ghost small" id="back">✕</button></div>
        <p>${esc(S.name)} has finished <b>${S.log.length}</b> classes (${S.classIdx} of ${E.buildPlan().length} in the course). Current streak <b>${S.streak}</b>, best <b>${S.bestStreak}</b>.</p>
        ${mocks.length ? `<p>Practice contests: ${mocks.map((m) => `<b>${m.right}/${m.total}</b>`).join(', ')}</p>` : ''}
        ${papers.length ? `<p>Real AMC 8 papers: ${papers.map((m) => `${esc(m.title)}: <b>${m.right}/25</b>`).join(', ')} (Honor Roll was 21 in 2026)</p>` : ''}
        ${weak.length ? `<p>⚠️ Needs work: <b>${weak.join(', ')}</b>. These come back automatically in warm-ups.</p>` : ''}
        ${(() => { const m = S.mistakes || {}, tot = Object.values(m).reduce((a, b) => a + b, 0); return tot ? `<p><b>Why answers went wrong</b> (his own tags, ${tot} total): ${Object.entries(E.MISTAKES).map(([k, [em, t]]) => `${em} ${t}: <b>${m[k] || 0}</b>`).join(' · ')}</p>` : ''; })()}
        <p>Clutch problems seen: <b>${(S.hardSeen || []).length}</b> of ${window.HARD.problems.length}.</p>
        <p class="muted">Accuracy counts first-try answers over the last 20 questions per topic.</p>
        <table><thead><tr><th>Topic</th><th>Mastery</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
      <div class="card"><h3>Recent classes</h3>${log ? `<table><thead><tr><th>Day</th><th>Class</th><th>Score</th><th>XP</th></tr></thead><tbody>${log}</tbody></table>` : '<p class="muted">None yet.</p>'}</div>
      <div class="card"><h3>Settings</h3>
        <label for="nm">Student name</label><input id="nm" value="${esc(S.name)}">
        <label for="dt">AMC 8 date</label><input id="dt" type="date" value="${S.contestDate}">
        <label for="jump">Jump to class</label><select id="jump">${E.buildPlan().map((c, i) => `<option value="${i}" ${i === S.classIdx ? 'selected' : ''}>#${i + 1} ${c.type === 'paper' ? `🏆 Real ${c.year} AMC 8` : c.type === 'mock' ? '📝 Practice contest' : `${TOP[c.topic].name}${c.pass === 2 ? ' (Level Up)' : ''}`}</option>`).join('')}</select>
        <label><input type="checkbox" id="snd" style="width:auto" ${S.sound ? 'checked' : ''}> Sound effects</label>
        <label><input type="checkbox" id="vc" style="width:auto" ${S.voice ? 'checked' : ''}> Read every slide and question aloud</label>
        <p></p><div class="row"><button class="btn" id="sv">Save</button><button class="btn ghost" id="reset">Reset all progress</button></div></div>`);
    $('#back').onclick = home;
    $('#sv').onclick = () => {
      S.name = $('#nm').value.trim() || S.name; S.contestDate = $('#dt').value || S.contestDate;
      S.classIdx = +$('#jump').value; S.sound = $('#snd').checked; S.voice = $('#vc').checked;
      save(); home();
    };
    $('#reset').onclick = () => { if (confirm('Erase ALL progress, XP and badges?')) { S = fromSaved({ name: S.name, number: S.number }); save(); home(); } };
  }

  // ── Family accounts (only when Supabase is configured in js/config.js)
  async function boot() {
    if (!C.enabled || pref('mh-local') === '1') return home();
    h('<div class="card" style="text-align:center"><div style="font-size:56px">🏀</div><p>Loading…</p></div>');
    try {
      if (!(await C.session())) return authScreen();
      return familyScreen(true);
    } catch { return home(); }
  }

  // Parents sign in with an emailed link; no passwords, and kids never need an account.
  function authScreen() {
    h(`<div class="card" style="text-align:center"><div style="font-size:64px">🏀</div><h1>Math Hoops</h1>
        <p>Parents: sign in to save your kids' progress on every device and get a daily email.</p>
        <label for="em">Parent email</label><input id="em" type="email" autocomplete="email" placeholder="you@example.com">
        <p></p><button class="btn big go" id="send">Email me a sign-in link</button>
        <div id="st" class="muted" style="margin-top:10px"></div>
        <hr style="border:0;border-top:1px solid var(--line);margin:18px 0">
        <button class="btn ghost" id="local">Play on this device only (no account)</button>
        <p class="muted" style="font-size:13px;margin-top:12px">We store only nicknames and game progress. You can delete your family's data at any time.</p></div>`);
    $('#send').onclick = async () => {
      const em = $('#em').value.trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) return $('#em').focus();
      $('#send').disabled = true; $('#st').textContent = 'Sending…';
      try { await C.signIn(em); $('#st').innerHTML = `📬 Check <b>${esc(em)}</b> for a sign-in link, then open it on this device.`; }
      catch (e) { $('#st').textContent = `Could not send the link: ${e.message || e}`; $('#send').disabled = false; }
    };
    $('#local').onclick = () => { pref('mh-local', '1'); kidId = null; S = fromSaved(readLocal()); home(); };
  }

  // Load a kid's profile: the newer of the browser copy and the cloud copy wins.
  function playAs(kid) {
    kidId = kid.id; pref('mh-kid', kid.id);
    const local = readLocal(), remote = kid.state && kid.state.name ? kid.state : null;
    const pick = !local ? remote : !remote ? local : (remote.savedAt || 0) > (local.savedAt || 0) ? remote : local;
    S = fromSaved(pick || { name: kid.name });
    if (!S.name) { S.name = kid.name; save(); }
    home();
  }

  // "Who's playing?" plus the parent's view of every kid and the family settings.
  async function familyScreen(autoResume) {
    let kids, settings;
    try { [kids, settings] = await Promise.all([C.listKids(), C.loadSettings()]); }
    catch (e) { h(`<div class="card"><p>Could not reach your family account (${esc(e.message || e)}).</p><button class="btn" id="off">Play offline</button></div>`); $('#off').onclick = home; return; }
    const last = kids.find((k) => k.id === pref('mh-kid'));
    if (autoResume && last) return playAs(last);
    const tz = (settings && settings.timezone) || Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York';
    const card = (k) => { const r = k.report || {}; const game = r.classIdx != null ? `Game ${r.classIdx + 1} of ${r.totalClasses}` : 'New player';
      const lastDay = r.recent && r.recent.length ? r.recent[r.recent.length - 1].day : '—';
      return `<div class="card kid"><div class="row spread"><h2 style="margin:0">🏀 ${esc(k.name)}</h2><button class="btn go" data-k="${k.id}">Play ▶</button></div>
        <p class="muted" style="margin:6px 0 0">${game} · 🔥 ${r.streak || 0}-day streak · last played ${esc(lastDay)}</p></div>`; };
    h(`<div class="card"><h1>Who's playing?</h1><p class="muted">Pick a player. Parents: the Parent page inside each player shows full stats.</p></div>
      ${kids.map(card).join('')}
      ${kids.length < 6 ? `<div class="card"><h3>➕ Add a player</h3>
        <label for="kn">Nickname (no full names needed)</label><input id="kn" maxlength="20" autocomplete="off">
        <label for="kj">Jersey number</label><input id="kj" type="number" min="0" max="99" value="23" style="max-width:120px">
        <p></p><button class="btn" id="add">Add player</button></div>` : ''}
      <div class="card"><h3>📬 Daily email</h3>
        <label for="et">Send to (comma-separated)</label><input id="et" value="${esc(((settings && settings.email_to) || []).join(', '))}" placeholder="you@example.com, partner@example.com">
        <label for="eh">Time (${esc(tz)})</label><select id="eh">${[...Array(24).keys()].map((x) => `<option value="${x}" ${x === ((settings && settings.send_hour) ?? 20) ? 'selected' : ''}>${(x % 12) || 12}:00 ${x < 12 ? 'AM' : 'PM'}</option>`).join('')}</select>
        <label><input type="checkbox" id="eo" style="width:auto" ${!settings || settings.email_enabled ? 'checked' : ''}> Send the daily email</label>
        <p></p><button class="btn" id="es">Save email settings</button> <span id="ess" class="muted"></span></div>
      <div class="card"><div class="row"><button class="btn ghost" id="out">Sign out</button><button class="btn ghost" id="del">Delete my family's data</button></div></div>`);
    app.querySelectorAll('[data-k]').forEach((b) => (b.onclick = () => playAs(kids.find((k) => k.id === b.dataset.k))));
    if ($('#add')) $('#add').onclick = async () => {
      const n = $('#kn').value.trim(); if (!n) return $('#kn').focus();
      try {
        const k = await C.addKid(n);
        kidId = k.id; pref('mh-kid', k.id);
        // The first player added on a device takes over progress played there without an account.
        let device = null; try { device = JSON.parse(pref(KEY) || 'null'); } catch { /* unreadable */ }
        const keep = device && device.log && device.log.length ? device : {};
        S = fromSaved({ ...keep, name: n, number: Math.max(0, Math.min(99, parseInt($('#kj').value, 10) || 0)) });
        if (keep === device) pref(KEY, null);
        save(); home();
      } catch (e) { alert(`Could not add the player: ${e.message || e}`); }
    };
    $('#es').onclick = async () => {
      const to = $('#et').value.split(',').map((x) => x.trim()).filter(Boolean);
      try { await C.saveSettings({ email_to: to, send_hour: +$('#eh').value, email_enabled: $('#eo').checked, timezone: tz }); $('#ess').textContent = '✅ Saved'; }
      catch (e) { $('#ess').textContent = `Could not save: ${e.message || e}`; }
    };
    $('#out').onclick = async () => { await C.signOut(); kidId = null; pref('mh-kid', null); authScreen(); };
    $('#del').onclick = async () => {
      if (!confirm("Delete ALL of your family's players, progress, and your account? This cannot be undone.")) return;
      if (prompt('Type DELETE to confirm') !== 'DELETE') return;
      try { await C.deleteFamily(); } catch (e) { return alert(`Could not delete: ${e.message || e}`); }
      kids.forEach((k) => { try { localStorage.removeItem(`${KEY}:${k.id}`); } catch { /* ignore */ } });
      await C.signOut(); kidId = null; pref('mh-kid', null); authScreen();
    };
  }

  boot();
})();
