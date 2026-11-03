// 🎮 Arcade: Zombie Defense. Cartoon zombies shuffle toward your base, each holding a math
// problem. Type an answer (keyboard or on-screen keypad) and the zombie carrying that answer
// gets zapped. A zombie that reaches the base costs a heart and shows the worked answer.
// Each wave ends with a big zombie carrying a harder problem. The problem makers
// (Arcade.ZOMBIE_RULES) are pure so tests can check every answer.
(function (root) {
  const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // Each maker returns { text, answer (a whole number), why (the worked answer) }.
  const ZOMBIE_RULES = {
    mental(level) {
      const k = pick([[1, 2], [2, 3], [3, 4], [4, 5], [5, 5]][level - 1]);
      if (k === 1) { const a = R(12, 89), b = R(11, 79); return Math.random() < 0.5 ? { text: `${a} + ${b}`, answer: a + b, why: `${a} + ${b} = ${a + b}` } : { text: `${a + b} − ${b}`, answer: a, why: `${a + b} − ${b} = ${a}` }; }
      if (k === 2) { const a = R(3, 12), b = R(3, 12); return Math.random() < 0.5 ? { text: `${a} × ${b}`, answer: a * b, why: `${a} × ${b} = ${a * b}` } : { text: `${a * b} ÷ ${a}`, answer: b, why: `${a} × ${b} = ${a * b}, so ${a * b} ÷ ${a} = ${b}` }; }
      if (k === 3) { const a = R(12, 49), b = R(3, 9); return { text: `${a} × ${b}`, answer: a * b, why: `${a} × ${b} = ${Math.floor(a / 10) * 10} × ${b} + ${a % 10} × ${b} = ${a * b}` }; }
      if (k === 4) {
        const t = pick(['25', '99', 'sq']);
        if (t === '25') { const n = R(4, 40) * 4; return { text: `${n} × 25`, answer: n * 25, why: `× 25 = × 100 ÷ 4: ${n * 100} ÷ 4 = ${n * 25}` }; }
        if (t === '99') { const n = R(3, 15); return { text: `${n} × 99`, answer: n * 99, why: `${n} × 100 − ${n} = ${n * 99}` }; }
        const n = R(11, 25); return { text: `${n}²`, answer: n * n, why: `${n} × ${n} = ${n * n}` };
      }
      const m = R(20, 60), d = R(1, 5); return { text: `${m - d} × ${m + d}`, answer: (m - d) * (m + d), why: `${m}² − ${d}² = ${m * m} − ${d * d} = ${(m - d) * (m + d)}` };
    },
    ops(level) {
      const a = R(2, 9), b = R(2, 9), c = R(2, 9);
      const forms = [
        () => ({ text: `${a} + ${b} × ${c}`, answer: a + b * c, why: `× first: ${b} × ${c} = ${b * c}, then + ${a} = ${a + b * c}` }),
        () => ({ text: `(${a} + ${b}) × ${c}`, answer: (a + b) * c, why: `( ) first: ${a + b}, then × ${c} = ${(a + b) * c}` }),
        () => ({ text: `${a * b * 2} − ${a * c} ÷ ${a}`, answer: a * b * 2 - c, why: `÷ first: ${a * c} ÷ ${a} = ${c}, then ${a * b * 2} − ${c} = ${a * b * 2 - c}` }),
        () => ({ text: `${a}² − ${b} × ${c}`, answer: a * a - b * c, why: `power: ${a}² = ${a * a}; × : ${b * c}; ${a * a} − ${b * c} = ${a * a - b * c}` }),
        () => { const d = R(2, 5); return { text: `${a} × (${b} + ${c}) − ${d}²`, answer: a * (b + c) - d * d, why: `( ) = ${b + c}; × ${a} = ${a * (b + c)}; ${d}² = ${d * d}; ${a * (b + c)} − ${d * d} = ${a * (b + c) - d * d}` }; },
      ];
      return forms[Math.min(forms.length - 1, R(0, level))]();
    },
    equations(level) {
      const x = R(level < 3 ? 1 : -6, 12), a = R(2, 9), b = R(1, 20), c = R(2, 6);
      const forms = [
        () => ({ text: `x + ${b} = ${x + b}`, answer: x, why: `x = ${x + b} − ${b} = ${x}` }),
        () => ({ text: `${a}x = ${a * x}`, answer: x, why: `x = ${a * x} ÷ ${a} = ${x}` }),
        () => ({ text: `${a}x + ${b} = ${a * x + b}`, answer: x, why: `${a}x = ${a * x + b} − ${b} = ${a * x}, x = ${x}` }),
        () => ({ text: `${a}(x + ${c}) = ${a * (x + c)}`, answer: x, why: `x + ${c} = ${a * (x + c)} ÷ ${a} = ${x + c}, x = ${x}` }),
        () => { const d = a + c; return { text: `${d}x − ${b} = ${a}x + ${c * x - b}`, answer: x, why: `${d}x − ${a}x = ${c * x - b} + ${b} → ${c}x = ${c * x}, x = ${x}` }; },
      ];
      return forms[Math.min(forms.length - 1, level - 1)]();
    },
  };
  ZOMBIE_RULES.mixed = (level) => ZOMBIE_RULES[pick(['mental', 'ops', 'equations'])](level);

  const ZOMBIE_MISSIONS = [
    { id: 'mental', name: 'Mental math', emoji: '⚡' },
    { id: 'ops', name: 'Order of operations', emoji: '🧮' },
    { id: 'equations', name: 'Solve for x', emoji: '❓' },
    { id: 'mixed', name: 'Mixed horde', emoji: '🌀' },
  ];

  function startZombies(host, missionId, opts = {}) {
    const make = ZOMBIE_RULES[missionId] || ZOMBIE_RULES.mental;
    const KEYS = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '−', '0', '⌫'];
    host.innerHTML = `<div class="ab zd"><canvas></canvas>
      <div class="ab-hud"><span id="ab-banner"></span><span class="ab-right"><span id="ab-score">0</span><button id="ab-pause" aria-label="Pause">⏸</button></span></div>
      <div class="ab-msg" id="ab-msg"></div></div>
      <div class="zd-in"><div class="zd-ans" id="zd-ans">&nbsp;</div><button class="btn go" id="zd-fire">⚡ ZAP</button></div>
      <div class="zd-keys">${KEYS.map((k) => `<button class="btn ghost" data-k="${k}">${k}</button>`).join('')}</div>`;
    const cvs = host.querySelector('canvas'), ctx = cvs.getContext('2d');
    const $ = (id) => host.querySelector('#' + id);
    let W = 0, H = 0;
    const fit = () => { const dpr = Math.min(2, root.devicePixelRatio || 1); W = host.clientWidth; H = Math.max(340, Math.min(root.innerHeight - 300, 560)); cvs.width = W * dpr; cvs.height = H * dpr; cvs.style.height = H + 'px'; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
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
    const sfx = { zap: () => beep(1200, 0.15, 'sawtooth', 0.05, -900), splat: () => beep(90, 0.3, 'square', 0.06, -40), nope: () => beep(200, 0.15, 'triangle', 0.06), hurt: () => beep(140, 0.45, 'sawtooth', 0.07, -90), wave: () => [392, 523, 659, 784].forEach((f, i) => setTimeout(() => beep(f, 0.12, 'square', 0.04), i * 90)), groan: () => beep(70, 0.6, 'sawtooth', 0.04, 30) };

    const BASE_X = 54;
    const st = { score: 0, wave: 0, hearts: 3, combo: 0, best: 0, hits: 0, shots: 0, zs: [], parts: [], bolts: [], floats: [], shake: 0, input: '', paused: false, over: false, mistakes: [], t: 0, toSpawn: 0, spawnT: 0, level: 1 };

    function nextWave() {
      st.wave++;
      st.level = Math.min(5, 1 + Math.floor((st.wave - 1) / 2));
      st.toSpawn = 5 + Math.min(5, st.wave);
      st.bossDue = true;
      st.speed = 14 + st.wave * 2.2;
      st.spawnEvery = Math.max(2.2, 5 - st.wave * 0.3);
      st.spawnT = 0.5;
      if (st.wave > 1 && st.wave % 3 === 1) st.hearts = Math.min(3, st.hearts + 1);
      $('ab-banner').textContent = `Night ${st.wave}: ${ZOMBIE_MISSIONS.find((m) => m.id === missionId)?.name || ''}`;
      flash(`NIGHT ${st.wave}`, 'Type the answer to zap a zombie');
      sfx.wave();
    }
    let msgT = null;
    function flash(big, small) { const m = $('ab-msg'); m.innerHTML = `<b>${big}</b>${small ? `<span>${small}</span>` : ''}`; m.classList.add('on'); clearTimeout(msgT); msgT = setTimeout(() => m.classList.remove('on'), 1600); }

    const lanes = () => { const top = 70, bot = H - 40; return [0, 1, 2, 3].map((i) => top + ((bot - top) * (i + 0.5)) / 4); };
    function spawn(big) {
      const p = make(Math.min(5, st.level + (big ? 1 : 0)));
      // Never two zombies with the same answer on screen at once.
      if (st.zs.some((z) => z.answer === p.answer)) return false;
      const ls = lanes(), free = ls.filter((y) => !st.zs.some((z) => Math.abs(z.y - y) < 5 && z.x > W - 160));
      st.zs.push({ ...p, x: W + 40, y: pick(free.length ? free : ls), big, vx: st.speed * (big ? 0.7 : 0.85 + Math.random() * 0.3), phase: Math.random() * 6, hue: R(80, 140) });
      if (big) sfx.groan();
      return true;
    }
    function burst(x, y, color, n = 26) { for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, s = 50 + Math.random() * 200; st.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 60, life: 0.6 + Math.random() * 0.5, color }); } }
    const float = (x, y, text, color) => st.floats.push({ x, y, text, color, life: 1.6 });

    function fire() {
      if (st.paused || st.over || !st.input || st.input === '-') return;
      const v = Number(st.input);
      st.input = ''; showInput();
      st.shots++;
      const targets = st.zs.filter((z) => z.answer === v).sort((a, b) => a.x - b.x);
      if (!targets.length) {
        st.combo = 0; sfx.nope(); st.shake = 0.15;
        float(W / 2, H - 60, `No zombie has ${v}`, '#ff8787');
        return;
      }
      const z = targets[0];
      st.zs.splice(st.zs.indexOf(z), 1);
      st.hits++; st.combo++; st.best = Math.max(st.best, st.combo);
      const mult = 1 + Math.floor(st.combo / 5), pts = (z.big ? 500 : 100) * mult;
      st.score += pts;
      st.bolts.push({ x1: BASE_X + 10, y1: H / 2, x2: z.x, y2: z.y, life: 0.2 });
      burst(z.x, z.y, '#8ce99a', z.big ? 60 : 30); sfx.zap(); setTimeout(sfx.splat, 80);
      float(z.x, z.y - 30, `+${pts}${mult > 1 ? ` ×${mult}` : ''}`, '#ffd43b');
      if (st.combo % 5 === 0) flash(`🔥 ${st.combo} IN A ROW`, `×${mult} points`);
    }
    function showInput() { $('zd-ans').textContent = st.input || ' '; }
    function type(k) {
      if (st.over) return;
      if (k === '⌫' || k === 'Backspace') st.input = st.input.slice(0, -1);
      else if (k === '−' || k === '-') { if (!st.input) st.input = '-'; }
      else if (/^\d$/.test(k) && st.input.length < 6) st.input += k;
      else if (k === 'Enter' || k === ' ') return fire();
      showInput();
    }
    host.querySelectorAll('[data-k]').forEach((b) => b.addEventListener('pointerdown', (e) => { e.preventDefault(); type(b.dataset.k); }));
    $('zd-fire').addEventListener('pointerdown', (e) => { e.preventDefault(); fire(); });
    const pause = () => { if (st.over) return; st.paused = !st.paused; $('ab-pause').textContent = st.paused ? '▶' : '⏸'; if (st.paused) flash('PAUSED', 'tap ▶ or press P'); };
    $('ab-pause').onclick = pause;
    const key = (e) => { if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') return pause(); if (/^[\d-]$|^Backspace$|^Enter$/.test(e.key)) { e.preventDefault(); type(e.key); } };
    root.addEventListener('keydown', key);

    function hurt(z) {
      st.hearts--; st.combo = 0; st.shake = 0.4; sfx.hurt();
      burst(BASE_X, z.y, '#ff6b6b', 20);
      float(Math.max(120, W / 2), z.y, `${z.text} = ${z.answer}`, '#ff8787');
      st.mistakes.push({ text: z.text, answer: z.answer, why: z.why });
      if (st.hearts <= 0) end();
    }
    function end() {
      if (st.over) return;
      st.over = true;
      const acc = st.shots ? Math.round((100 * st.hits) / st.shots) : 0;
      setTimeout(() => opts.onEnd && opts.onEnd({ game: 'zombies', mission: missionId, score: st.score, wave: st.wave, hits: st.hits, shots: st.shots, accuracy: acc, bestCombo: st.best, mistakes: st.mistakes.slice(-4), seconds: Math.round(st.t) }), 900);
    }

    function update(dt) {
      st.t += dt;
      if (!st.over) {
        st.spawnT -= dt;
        if (st.toSpawn > 0 && (st.spawnT <= 0 || st.zs.length === 0)) { if (spawn(false)) st.toSpawn--; st.spawnT = st.spawnEvery; }
        else if (st.toSpawn === 0 && st.bossDue && st.zs.length <= 1) { if (spawn(true)) st.bossDue = false; }
        else if (st.toSpawn === 0 && !st.bossDue && st.zs.length === 0) { st.score += 200 * st.wave; flash('NIGHT SURVIVED', `+${200 * st.wave} bonus`); st.toSpawn = -1; setTimeout(() => { if (!st.over) nextWave(); }, 1400); }
      }
      for (const z of st.zs) { z.x -= z.vx * dt; z.phase += dt * 6; }
      for (const z of st.zs.filter((q) => q.x < BASE_X + 30)) { st.zs.splice(st.zs.indexOf(z), 1); if (!st.over) hurt(z); }
      for (const p of st.parts) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 300 * dt; p.life -= dt; }
      st.parts = st.parts.filter((p) => p.life > 0);
      st.bolts.forEach((b) => (b.life -= dt)); st.bolts = st.bolts.filter((b) => b.life > 0);
      st.floats.forEach((f) => { f.y -= 30 * dt; f.life -= dt; }); st.floats = st.floats.filter((f) => f.life > 0);
      st.shake = Math.max(0, st.shake - dt);
    }

    function drawZombie(z) {
      const s = z.big ? 1.5 : 1, bob = Math.sin(z.phase) * 3;
      ctx.save(); ctx.translate(z.x, z.y + bob); ctx.scale(s, s);
      ctx.fillStyle = `hsl(${z.hue},45%,42%)`;
      ctx.fillRect(-11, -6, 22, 26); // body
      ctx.fillStyle = '#5c4b8a'; ctx.fillRect(-11, 14, 22, 8); // shorts
      ctx.fillStyle = `hsl(${z.hue},45%,52%)`;
      ctx.beginPath(); ctx.arc(0, -16, 13, 0, Math.PI * 2); ctx.fill(); // head
      ctx.fillRect(-26, -2 + Math.sin(z.phase) * 2, 16, 6); ctx.fillRect(-24, 6 - Math.sin(z.phase) * 2, 14, 6); // arms reaching
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-5, -18, 4, 0, Math.PI * 2); ctx.arc(5, -18, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#c92a2a'; ctx.beginPath(); ctx.arc(-6, -18, 2, 0, Math.PI * 2); ctx.arc(4, -18, 2, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#222'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-6, -8); ctx.lineTo(6, -9); ctx.stroke();
      ctx.restore();
      // problem sign
      ctx.font = `800 ${z.big ? 18 : 16}px system-ui, sans-serif`;
      const w = ctx.measureText(z.text).width + 18, top = z.y - (z.big ? 70 : 52);
      const sx = Math.min(W - w / 2 - 4, Math.max(w / 2 + 4, z.x));
      ctx.fillStyle = z.big ? '#ffd43b' : '#fff8e1'; ctx.strokeStyle = '#3b2f1e'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(sx - w / 2, top, w, 26, 6) : ctx.rect(sx - w / 2, top, w, 26); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#2b1f0e'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(z.text, sx, top + 13);
    }
    function draw() {
      ctx.save();
      if (st.shake > 0) ctx.translate((Math.random() - 0.5) * 14 * st.shake, (Math.random() - 0.5) * 14 * st.shake);
      const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#10162b'); g.addColorStop(0.6, '#1f2a44'); g.addColorStop(1, '#2b3a2a');
      ctx.fillStyle = g; ctx.fillRect(-10, -10, W + 20, H + 20);
      ctx.fillStyle = '#f1f3f5'; ctx.beginPath(); ctx.arc(W - 60, 70, 24, 0, Math.PI * 2); ctx.fill(); // moon
      ctx.fillStyle = '#2f3f2c'; ctx.fillRect(0, H - 30, W, 30);
      // base wall and tesla tower
      ctx.fillStyle = '#495057'; ctx.fillRect(0, 50, BASE_X, H - 80);
      ctx.fillStyle = '#74c0fc'; for (let i = 0; i < st.hearts; i++) ctx.fillRect(10, 64 + i * 22, BASE_X - 20, 14);
      ctx.fillStyle = '#ffd43b'; ctx.beginPath(); ctx.arc(BASE_X - 4, H / 2, 10, 0, Math.PI * 2); ctx.fill();
      for (const b of st.bolts) {
        ctx.strokeStyle = `rgba(165,216,255,${b.life * 5})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(b.x1, b.y1);
        for (let i = 1; i <= 6; i++) ctx.lineTo(b.x1 + ((b.x2 - b.x1) * i) / 6 + (i < 6 ? (Math.random() - 0.5) * 20 : 0), b.y1 + ((b.y2 - b.y1) * i) / 6 + (i < 6 ? (Math.random() - 0.5) * 20 : 0));
        ctx.stroke();
      }
      st.zs.slice().sort((a, b) => a.y - b.y).forEach(drawZombie);
      for (const p of st.parts) { ctx.globalAlpha = Math.max(0, p.life); ctx.fillStyle = p.color; ctx.fillRect(p.x - 3, p.y - 3, 6, 6); }
      ctx.globalAlpha = 1;
      for (const f of st.floats) { ctx.globalAlpha = Math.min(1, f.life); ctx.fillStyle = f.color; ctx.font = '800 16px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(f.text, Math.min(W - 90, Math.max(110, f.x)), f.y); }
      ctx.globalAlpha = 1;
      if (st.over) { ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#fff'; ctx.font = '900 38px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('THE BASE FELL', W / 2, H / 2); }
      ctx.restore();
    }

    let last = performance.now(), raf = 0, stopped = false;
    function frame(now) {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (!st.paused) update(dt);
      draw();
      $('ab-score').textContent = `⭐ ${st.score}  ${'❤️'.repeat(Math.max(0, st.hearts))}`;
      if (!stopped) raf = requestAnimationFrame(frame);
    }
    const stop = () => { stopped = true; cancelAnimationFrame(raf); root.removeEventListener('resize', fit); root.removeEventListener('keydown', key); clearTimeout(msgT); };
    host.abState = st; // lets automated tests see the zombies
    nextWave();
    raf = requestAnimationFrame(frame);
    return { stop, state: st };
  }

  Object.assign(root.Arcade = root.Arcade || {}, { ZOMBIE_RULES, ZOMBIE_MISSIONS, startZombies });
})(typeof window !== 'undefined' ? window : globalThis);
