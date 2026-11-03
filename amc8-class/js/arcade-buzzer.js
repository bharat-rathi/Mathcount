// 🎮 Arcade: Buzzer Beater. A 2-minute game against a CPU team, like a Countdown speed round.
// Every possession shows two shots: an easier 2-pointer and a harder 3-pointer. Type either
// answer to shoot it. A miss (wrong answer) is a brick and the next possession comes up.
// The CPU scores at a steady pace, so you have to keep up. Questions come from
// Arcade.ZOMBIE_RULES (arcade-zombies.js), which the tests already check.
(function (root) {
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const BUZZER_MISSIONS = [
    { id: 'mental', name: 'Mental math', emoji: '⚡' },
    { id: 'ops', name: 'Order of operations', emoji: '🧮' },
    { id: 'equations', name: 'Solve for x', emoji: '❓' },
    { id: 'mixed', name: 'Countdown mix', emoji: '🏀' },
  ];
  const OPPONENTS = [
    { id: 'rookie', name: 'Rookies', every: 12 },
    { id: 'pro', name: 'Pros', every: 9 },
    { id: 'allstar', name: 'All-Stars', every: 6.5 },
  ];
  const GAME_SECONDS = 120;

  function startBuzzer(host, missionId, opts = {}) {
    const Z = root.Arcade.ZOMBIE_RULES, make = Z[missionId] || Z.mental;
    const KEYS = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '−', '0', '⌫'];
    host.innerHTML = `<div class="ab bb"><canvas></canvas>
      <div class="ab-hud"><span id="ab-banner"></span><span class="ab-right"><span id="ab-score"></span><button id="ab-pause" aria-label="Pause">⏸</button></span></div>
      <div class="ab-msg" id="ab-msg"></div>
      <div class="bb-pick" id="bb-pick"><b>Pick your opponent</b>${OPPONENTS.map((o) => `<button class="btn" data-o="${o.id}">${o.name}</button>`).join('')}</div></div>
      <div class="bb-shots"><div class="bb-shot" id="bb-2"></div><div class="bb-shot three" id="bb-3"></div></div>
      <div class="zd-in"><div class="zd-ans" id="zd-ans">&nbsp;</div><button class="btn go" id="zd-fire">🏀 SHOOT</button><button class="btn ghost" id="bb-pass" title="New possession">Pass</button></div>
      <div class="zd-keys">${KEYS.map((k) => `<button class="btn ghost" data-k="${k}">${k}</button>`).join('')}</div>`;
    const cvs = host.querySelector('canvas'), ctx = cvs.getContext('2d');
    const $ = (id) => host.querySelector('#' + id);
    let W = 0, H = 0;
    const fit = () => { const dpr = Math.min(2, root.devicePixelRatio || 1); W = host.clientWidth; H = Math.max(260, Math.min(root.innerHeight - 380, 420)); cvs.width = W * dpr; cvs.height = H * dpr; cvs.style.height = H + 'px'; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    fit(); root.addEventListener('resize', fit);

    let ac = null;
    const beep = (f, dur = 0.08, type = 'square', vol = 0.05, slide = 0) => {
      if (opts.sound === false) return;
      try {
        ac = ac || new (root.AudioContext || root.webkitAudioContext)();
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = type; o.frequency.value = f; if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, f + slide), ac.currentTime + dur);
        g.gain.value = vol; g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + dur);
        o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime + dur);
      } catch { /* no audio */ }
    };
    const sfx = { swish: () => beep(900, 0.18, 'triangle', 0.05, 500), brick: () => beep(130, 0.25, 'square', 0.07, -40), cpu: () => beep(300, 0.1, 'sine', 0.03), buzzer: () => beep(180, 1.1, 'sawtooth', 0.08), fire: () => [659, 784, 988].forEach((f, i) => setTimeout(() => beep(f, 0.1, 'square', 0.04), i * 70)) };

    const st = { started: false, opp: OPPONENTS[1], you: 0, cpu: 0, clock: GAME_SECONDS, cpuT: 0, combo: 0, best: 0, hits: 0, shots: 0, two: null, three: null, input: '', balls: [], parts: [], floats: [], net: 0, shake: 0, paused: false, over: false, mistakes: [], t: 0, fire: false };
    const level = () => Math.min(5, 1 + Math.floor((GAME_SECONDS - st.clock) / 30)); // harder each half-minute

    function possession() {
      const l = level();
      // The 3-pointer is always the harder shot: in the mix it is an equation or order-of-
      // operations problem a level up, against a mental-math 2-pointer.
      const mixed = missionId === 'mixed';
      st.two = (mixed ? Z.mental : make)(Math.max(1, l - 1));
      do { st.three = (mixed ? Z[pick(['ops', 'equations'])] : make)(Math.min(5, l + 1)); } while (st.three.answer === st.two.answer);
      $('bb-2').innerHTML = `<small>2 PT</small>${st.two.text}`;
      $('bb-3').innerHTML = `<small>3 PT${st.clock <= 10 ? ' · BUZZER BEATER = 4' : ''}</small>${st.three.text}`;
    }
    let msgT = null;
    function flash(big, small) { const m = $('ab-msg'); m.innerHTML = `<b>${big}</b>${small ? `<span>${small}</span>` : ''}`; m.classList.add('on'); clearTimeout(msgT); msgT = setTimeout(() => m.classList.remove('on'), 1300); }
    const showInput = () => { $('zd-ans').textContent = st.input || ' '; };
    const float = (x, y, text, color) => st.floats.push({ x, y, text, color, life: 1.6 });
    const hoop = () => ({ x: W - 70, y: 70 });

    function shoot() {
      if (!st.started || st.paused || st.over || !st.input || st.input === '-') return;
      const v = Number(st.input); st.input = ''; showInput();
      st.shots++;
      const which = v === st.three.answer ? 3 : v === st.two.answer ? 2 : 0;
      const from = { x: which === 3 ? 60 : 140, y: H - 40 };
      if (which) {
        let pts = which === 3 && st.clock <= 10 ? 4 : which;
        st.combo++; st.best = Math.max(st.best, st.combo); st.hits++;
        if (st.combo >= 3) pts += 1; // on fire: +1 per bucket
        if (st.combo === 3) { st.fire = true; sfx.fire(); flash('🔥 ON FIRE', '+1 on every bucket'); }
        st.balls.push({ ...from, t: 0, make: true, fire: st.fire, pts });
      } else {
        st.combo = 0; st.fire = false;
        st.balls.push({ ...from, t: 0, make: false });
        st.mistakes.push({ text: st.two.text, answer: st.two.answer, why: st.two.why }, { text: st.three.text, answer: st.three.answer, why: st.three.why });
        float(W / 2, H / 2, `Brick! 2 PT = ${st.two.answer}, 3 PT = ${st.three.answer}`, '#ff8787');
      }
      possession();
    }
    function pass() { if (!st.started || st.over || st.paused) return; st.combo = 0; st.fire = false; float(W / 2, H / 2, `2 PT = ${st.two.answer} · 3 PT = ${st.three.answer}`, '#adb5bd'); possession(); }
    function type(k) {
      if (st.over) return;
      if (k === '⌫' || k === 'Backspace') st.input = st.input.slice(0, -1);
      else if (k === '−' || k === '-') { if (!st.input) st.input = '-'; }
      else if (/^\d$/.test(k) && st.input.length < 6) st.input += k;
      else if (k === 'Enter' || k === ' ') return shoot();
      showInput();
    }
    host.querySelectorAll('[data-k]').forEach((b) => b.addEventListener('pointerdown', (e) => { e.preventDefault(); type(b.dataset.k); }));
    $('zd-fire').addEventListener('pointerdown', (e) => { e.preventDefault(); shoot(); });
    $('bb-pass').addEventListener('pointerdown', (e) => { e.preventDefault(); pass(); });
    host.querySelectorAll('[data-o]').forEach((b) => (b.onclick = () => {
      st.opp = OPPONENTS.find((o) => o.id === b.dataset.o); st.started = true; $('bb-pick').remove();
      $('ab-banner').textContent = `vs. the ${st.opp.name}`;
      possession(); flash('TIP-OFF!', 'Type a 2 PT or 3 PT answer');
    }));
    const pause = () => { if (st.over || !st.started) return; st.paused = !st.paused; $('ab-pause').textContent = st.paused ? '▶' : '⏸'; if (st.paused) flash('TIMEOUT', 'tap ▶ or press P'); };
    $('ab-pause').onclick = pause;
    const key = (e) => { if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') return pause(); if (/^[\d-]$|^Backspace$|^Enter$/.test(e.key)) { e.preventDefault(); type(e.key); } };
    root.addEventListener('keydown', key);

    function end() {
      st.over = true; sfx.buzzer();
      // Shots already in the air when the buzzer sounds still count.
      for (const b of st.balls) if (b.make && !b.done) { b.done = true; st.you += b.pts; }
      const win = st.you > st.cpu;
      flash(win ? 'YOU WIN! 🏆' : st.you === st.cpu ? 'TIE GAME' : 'FINAL', `${st.you} – ${st.cpu}`);
      const acc = st.shots ? Math.round((100 * st.hits) / st.shots) : 0;
      setTimeout(() => opts.onEnd && opts.onEnd({ game: 'buzzer', mission: missionId, score: st.you * 100 + (win ? 1000 : 0), you: st.you, cpu: st.cpu, win, opponent: st.opp.name, wave: 0, hits: st.hits, shots: st.shots, accuracy: acc, bestCombo: st.best, mistakes: st.mistakes.slice(-4), seconds: Math.round(st.t) }), 1600);
    }

    function update(dt) {
      if (!st.started || st.over) { st.t += st.started ? dt : 0; return; }
      st.t += dt;
      const before = st.clock;
      st.clock = Math.max(0, st.clock - dt);
      if (before > 10 && st.clock <= 10) { flash('⏱️ 10 SECONDS', '3-pointers are worth 4!'); possession(); }
      st.cpuT += dt;
      if (st.cpuT >= st.opp.every) { st.cpuT = 0; st.cpu += pick([2, 2, 2, 3]); sfx.cpu(); }
      if (st.clock <= 0) end();
    }
    function step(dt) {
      for (const b of st.balls) {
        b.t += dt * 1.6;
        if (b.t >= 1 && !b.done) {
          b.done = true;
          if (b.make) { st.you += b.pts; st.net = 0.5; sfx.swish(); float(hoop().x - 30, hoop().y + 40, `+${b.pts}`, '#ffd43b'); for (let i = 0; i < 24; i++) { const a = Math.random() * Math.PI * 2; st.parts.push({ x: hoop().x, y: hoop().y, vx: Math.cos(a) * 160, vy: Math.sin(a) * 160, life: 0.6, color: b.fire ? '#ff922b' : '#ffd43b' }); } }
          else { sfx.brick(); st.shake = 0.3; }
        }
      }
      st.balls = st.balls.filter((b) => b.t < 1.6);
      for (const p of st.parts) { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; }
      st.parts = st.parts.filter((p) => p.life > 0);
      st.floats.forEach((f) => { f.y -= 24 * dt; f.life -= dt; }); st.floats = st.floats.filter((f) => f.life > 0);
      st.net = Math.max(0, st.net - dt); st.shake = Math.max(0, st.shake - dt);
    }
    function draw() {
      ctx.save();
      if (st.shake > 0) ctx.translate((Math.random() - 0.5) * 10 * st.shake, 0);
      ctx.fillStyle = '#c47a3a'; ctx.fillRect(-10, -10, W + 20, H + 20);
      ctx.strokeStyle = 'rgba(255,255,255,.08)'; for (let x = 0; x < W; x += 28) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(W - 70, 70, Math.min(W * 0.62, 300), Math.PI * 0.5, Math.PI * 1.05); ctx.stroke(); // 3-point arc
      ctx.strokeRect(W - 150, 0, 150, 150); // key
      const h = hoop();
      ctx.fillStyle = '#fff'; ctx.fillRect(h.x + 22, h.y - 46, 8, 70); ctx.fillStyle = '#f8f9fa'; ctx.fillRect(h.x + 4, h.y - 40, 26, 44); // backboard
      ctx.strokeStyle = '#e8590c'; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(h.x, h.y, 22, 7, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 1.5;
      for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(h.x + i * 9, h.y + 4); ctx.lineTo(h.x + i * 5 + Math.sin(st.net * 30) * st.net * 8, h.y + 30); ctx.stroke(); }
      for (const b of st.balls) {
        const tt = Math.min(1, b.t), tx = b.make ? h.x : h.x + 26, ty = b.make ? h.y : h.y - 6;
        let x = b.x + (tx - b.x) * tt, y = b.y + (ty - b.y) * tt - Math.sin(Math.PI * tt) * 140;
        if (b.t > 1) { const k = b.t - 1; x = b.make ? h.x : tx + k * 140; y = b.make ? h.y + k * 220 : ty - Math.sin(Math.PI * Math.min(1, k * 1.6)) * 60 + k * 100; }
        if (b.fire) { ctx.fillStyle = 'rgba(255,146,43,.6)'; ctx.beginPath(); ctx.arc(x, y + 8, 16, 0, Math.PI * 2); ctx.fill(); }
        ctx.fillStyle = '#f76707'; ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#212529'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x - 12, y); ctx.lineTo(x + 12, y); ctx.moveTo(x, y - 12); ctx.lineTo(x, y + 12); ctx.stroke();
      }
      for (const p of st.parts) { ctx.globalAlpha = Math.max(0, p.life * 1.6); ctx.fillStyle = p.color; ctx.fillRect(p.x - 3, p.y - 3, 6, 6); }
      ctx.globalAlpha = 1;
      // scoreboard
      ctx.fillStyle = 'rgba(0,0,0,.75)'; ctx.fillRect(12, 46, 190, 54);
      ctx.fillStyle = '#ffd43b'; ctx.font = '900 26px system-ui, sans-serif'; ctx.textAlign = 'left';
      ctx.fillText(`${st.you} – ${st.cpu}`, 22, 82);
      const s = Math.ceil(st.clock);
      ctx.fillStyle = st.clock <= 10 ? '#ff6b6b' : '#fff'; ctx.font = '800 20px system-ui, sans-serif'; ctx.fillText(`${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`, 128, 82);
      ctx.fillStyle = '#ced4da'; ctx.font = '700 11px system-ui, sans-serif'; ctx.fillText(`YOU     ${st.opp.name.toUpperCase()}`, 22, 60);
      for (const f of st.floats) { ctx.globalAlpha = Math.min(1, f.life); ctx.fillStyle = f.color; ctx.font = '800 15px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(f.text, Math.min(W - 120, Math.max(120, f.x)), f.y); }
      ctx.globalAlpha = 1;
      if (st.fire) { ctx.fillStyle = 'rgba(255,146,43,.18)'; ctx.fillRect(0, 0, W, H); }
      ctx.restore();
    }

    let last = performance.now(), raf = 0, stopped = false;
    function frame(now) {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (!st.paused) { update(dt); step(dt); }
      draw();
      $('ab-score').textContent = st.combo >= 3 ? `🔥 ${st.combo} straight` : '';
      if (!stopped) raf = requestAnimationFrame(frame);
    }
    const stop = () => { stopped = true; cancelAnimationFrame(raf); root.removeEventListener('resize', fit); root.removeEventListener('keydown', key); clearTimeout(msgT); };
    host.abState = st; // lets automated tests see the shots
    $('ab-banner').textContent = '🏀 Buzzer Beater';
    raf = requestAnimationFrame(frame);
    return { stop, state: st };
  }

  Object.assign(root.Arcade = root.Arcade || {}, { BUZZER_MISSIONS, BUZZER_OPPONENTS: OPPONENTS, startBuzzer });
})(typeof window !== 'undefined' ? window : globalThis);
