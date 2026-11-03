// 🎮 Arcade: Asteroid Blaster. Number asteroids fall toward your ship; blast only the ones that
// match the wave's rule ("multiples of 7", "= 3/4", "primes"…). The math IS the action: every
// shot is a decision, a wrong shot costs a shield and shows why, and a good target that slips
// past costs one too. Waves speed up and the numbers get harder.
// The rules (window.Arcade.RULES) are pure so tests can check them; the game draws on a canvas.
(function (root) {
  const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
  const isPrime = (n) => { if (n < 2) return false; for (let d = 2; d * d <= n; d++) if (n % d === 0) return false; return true; };
  const smallestFactor = (n) => { for (let d = 2; d * d <= n; d++) if (n % d === 0) return d; return n; };

  // A rule makes one wave: a banner, and item(good) → { text, ok, why } for one asteroid.
  // level 1–5 sets how big and tricky the numbers are.
  const RULES = {
    multiples(level) {
      const k = pick(level < 2 ? [2, 3, 4, 5, 10] : level < 4 ? [3, 4, 6, 7, 8, 9] : [7, 9, 11, 12, 13, 15]);
      const top = [0, 50, 100, 150, 300, 1000][level];
      return {
        banner: `Blast MULTIPLES of ${k}`,
        item(good) {
          let n;
          if (good) n = k * R(2, Math.floor(top / k));
          else do { n = R(k + 1, top); } while (n % k === 0);
          return { text: String(n), ok: n % k === 0, why: n % k === 0 ? `${n} = ${k} × ${n / k}` : `${n} ÷ ${k} = ${Math.floor(n / k)} rem ${n % k}` };
        },
      };
    },
    factors(level) {
      const N = pick(level < 2 ? [12, 18, 20, 24] : level < 4 ? [36, 48, 60, 72] : [84, 90, 96, 120, 144]);
      const divs = [], non = [];
      for (let d = 2; d < N; d++) (N % d === 0 ? divs : non).push(d);
      return {
        banner: `Blast FACTORS of ${N}`,
        item(good) {
          const n = good ? pick(divs) : pick(non.filter((x) => x <= Math.max(30, N / 2)));
          return { text: String(n), ok: N % n === 0, why: N % n === 0 ? `${N} = ${n} × ${N / n}` : `${N} ÷ ${n} = ${Math.floor(N / n)} rem ${N % n}` };
        },
      };
    },
    primes(level) {
      const top = [0, 30, 60, 100, 150, 200][level];
      return {
        banner: 'Blast PRIME numbers',
        item(good) {
          let n;
          // Wrong ones are odd composites (no easy even giveaways) once the numbers get bigger.
          if (good) do { n = R(2, top); } while (!isPrime(n));
          else do { n = level < 2 ? R(4, top) : R(9, top) | 1; } while (isPrime(n) || n < 4);
          const f = smallestFactor(n);
          return { text: String(n), ok: isPrime(n), why: isPrime(n) ? `${n} is prime` : `${n} = ${f} × ${n / f}` };
        },
      };
    },
    squares(level) {
      const cubes = level >= 4 && Math.random() < 0.5;
      const maxR = cubes ? 10 : [0, 10, 15, 20, 25, 30][level];
      const pw = cubes ? 3 : 2;
      return {
        banner: `Blast PERFECT ${cubes ? 'CUBES' : 'SQUARES'}`,
        item(good) {
          let n;
          if (good) n = R(2, maxR) ** pw;
          else { const r = R(2, maxR); do { n = r ** pw + R(-r, r); } while (Math.round(Math.cbrt(n)) ** 3 === n || Math.round(Math.sqrt(n)) ** 2 === n || n < 2); }
          const r = Math.floor(pw === 2 ? Math.sqrt(n) : Math.cbrt(n) + 1e-9);
          const ok = r ** pw === n;
          const sup = pw === 2 ? '²' : '³';
          return { text: String(n), ok, why: ok ? `${n} = ${r}${sup}` : `${r}${sup} = ${r ** pw}, ${r + 1}${sup} = ${(r + 1) ** pw}` };
        },
      };
    },
    fractions(level) {
      const base = pick(level < 3 ? [[1, 2], [1, 3], [2, 3], [3, 4], [1, 4]] : [[2, 5], [3, 5], [5, 6], [3, 8], [4, 7], [5, 9]]);
      const [p, q] = base;
      return {
        banner: `Blast fractions EQUAL to ${p}/${q}`,
        item(good) {
          let a, b;
          if (good) { const m = R(2, level < 3 ? 6 : 12); a = p * m; b = q * m; }
          else do { const m = R(2, level < 3 ? 6 : 12); a = p * m + pick([-1, 1, 0]); b = q * m + pick([1, -1, 0]); } while (a <= 0 || b <= 0 || a * q === b * p);
          const g = gcd(a, b);
          return { text: `${a}/${b}`, ok: a * q === b * p, why: `${a}/${b} = ${a / g}/${b / g}` };
        },
      };
    },
    percents(level) {
      const PCT = { 10: ['1/10', '0.1', '2/20', '3/30'], 20: ['1/5', '0.2', '2/10', '4/20'], 25: ['1/4', '0.25', '2/8', '5/20'], 40: ['2/5', '0.4', '4/10', '6/15'], 50: ['1/2', '0.5', '3/6', '7/14'],
        60: ['3/5', '0.6', '6/10', '9/15'], 75: ['3/4', '0.75', '6/8', '15/20'], 30: ['3/10', '0.3', '6/20', '9/30'], 80: ['4/5', '0.8', '8/10', '12/15'], 5: ['1/20', '0.05', '2/40', '5/100'] };
      const keys = Object.keys(PCT).map(Number).filter((k) => level >= 3 || [10, 20, 25, 50, 75].includes(k));
      const t = pick(keys);
      const others = keys.filter((k) => k !== t);
      return {
        banner: `Blast everything EQUAL to ${t}%`,
        item(good) {
          const k = good ? t : pick(others);
          const text = pick(PCT[k]);
          return { text, ok: k === t, why: `${text} = ${k}%` };
        },
      };
    },
  };

  const MISSIONS = [
    { id: 'multiples', name: 'Multiples', emoji: '🎯', rules: ['multiples'] },
    { id: 'factors', name: 'Factors', emoji: '🧩', rules: ['factors'] },
    { id: 'primes', name: 'Primes', emoji: '💎', rules: ['primes'] },
    { id: 'squares', name: 'Squares & cubes', emoji: '🟪', rules: ['squares'] },
    { id: 'fractions', name: 'Equal fractions', emoji: '🍕', rules: ['fractions'] },
    { id: 'percents', name: 'Percents', emoji: '💯', rules: ['percents'] },
    { id: 'mixed', name: 'Mixed mayhem', emoji: '🌀', rules: Object.keys(RULES) },
  ];

  // ── The game
  function start(host, missionId, opts = {}) {
    const mission = MISSIONS.find((m) => m.id === missionId) || MISSIONS[0];
    host.innerHTML = `<div class="ab"><canvas></canvas>
      <div class="ab-hud"><span id="ab-banner"></span><span class="ab-right"><span id="ab-score">0</span><button id="ab-pause" aria-label="Pause">⏸</button></span></div>
      <div class="ab-msg" id="ab-msg"></div></div>`;
    const cvs = host.querySelector('canvas'), ctx = cvs.getContext('2d');
    const $ = (id) => host.querySelector('#' + id);
    let W = 0, H = 0, dpr = 1;
    const fit = () => { dpr = Math.min(2, root.devicePixelRatio || 1); W = host.clientWidth; H = Math.max(420, Math.min(root.innerHeight - 140, 720)); cvs.width = W * dpr; cvs.height = H * dpr; cvs.style.height = H + 'px'; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    fit(); root.addEventListener('resize', fit);

    // Sound: tiny synth blips, no files to load.
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
    const sfx = { laser: () => beep(880, 0.09, 'square', 0.04, -500), boom: () => beep(120, 0.25, 'sawtooth', 0.07, -80), bad: () => beep(160, 0.3, 'triangle', 0.08, -60), wave: () => [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, 0.12, 'square', 0.04), i * 90)), shield: () => beep(220, 0.4, 'sawtooth', 0.06, -150) };

    const stars = [...Array(90)].map(() => ({ x: Math.random(), y: Math.random(), z: Math.random() * 2 + 0.5 }));
    const st = { score: 0, wave: 0, shields: 3, combo: 0, best: 0, hits: 0, shots: 0, rocks: [], parts: [], lasers: [], floats: [], shake: 0, need: 0, got: 0, rule: null, spawnT: 0, paused: false, over: false, aim: -Math.PI / 2, mistakes: [], t: 0 };

    function nextWave() {
      st.wave++; st.got = 0; st.need = 6 + Math.min(6, st.wave);
      const level = Math.min(5, 1 + Math.floor((st.wave - 1) / 2));
      st.rule = RULES[pick(mission.rules)](level);
      st.speed = 38 + st.wave * 7;
      st.spawnEvery = Math.max(0.55, 1.5 - st.wave * 0.08);
      if (st.wave > 1 && st.wave % 3 === 1) st.shields = Math.min(3, st.shields + 1);
      $('ab-banner').textContent = `Wave ${st.wave}: ${st.rule.banner}`;
      flash(`WAVE ${st.wave}`, st.rule.banner);
      sfx.wave();
    }
    let msgT = null;
    function flash(big, small) {
      const m = $('ab-msg'); m.innerHTML = `<b>${big}</b>${small ? `<span>${small}</span>` : ''}`; m.classList.add('on');
      clearTimeout(msgT); msgT = setTimeout(() => m.classList.remove('on'), 1600);
    }

    function spawn() {
      // About 45% of rocks are targets, so every shot is a real choice.
      const good = Math.random() < 0.45;
      const it = st.rule.item(good);
      const r = 26 + Math.min(14, it.text.length * 3);
      const pts = [...Array(10)].map((_, i) => { const a = (i / 10) * Math.PI * 2; return [Math.cos(a) * r * (0.82 + Math.random() * 0.25), Math.sin(a) * r * (0.82 + Math.random() * 0.25)]; });
      st.rocks.push({ ...it, x: R(r + 8, Math.max(r + 9, W - r - 8)), y: -r, r, vy: st.speed * (0.8 + Math.random() * 0.5), vx: (Math.random() - 0.5) * 20, rot: 0, vr: (Math.random() - 0.5) * 1.5, pts, hue: it.ok ? 0 : 0 });
    }

    function boom(x, y, color, n = 24) {
      for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, s = 60 + Math.random() * 220; st.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.6 + Math.random() * 0.5, color }); }
    }
    const float = (x, y, text, color) => st.floats.push({ x, y, text, color, life: 1.4 });

    function shoot(px, py) {
      if (st.paused || st.over) return;
      const shipX = W / 2, shipY = H - 40;
      let hit = null, bestD = 1e9;
      for (const r of st.rocks) { const d = Math.hypot(r.x - px, r.y - py); if (d < r.r + 18 && d < bestD) { hit = r; bestD = d; } }
      st.aim = Math.atan2((hit ? hit.y : py) - shipY, (hit ? hit.x : px) - shipX);
      st.lasers.push({ x1: shipX, y1: shipY, x2: hit ? hit.x : px, y2: hit ? hit.y : py, life: 0.12 });
      sfx.laser();
      if (!hit) return;
      st.shots++;
      st.rocks.splice(st.rocks.indexOf(hit), 1);
      if (hit.ok) {
        st.hits++; st.got++; st.combo++; st.best = Math.max(st.best, st.combo);
        const mult = 1 + Math.floor(st.combo / 5);
        const pts = 100 * mult;
        st.score += pts; boom(hit.x, hit.y, '#ffd43b', 30); sfx.boom();
        float(hit.x, hit.y, `+${pts}${mult > 1 ? ` ×${mult}` : ''}`, '#ffd43b');
        if (st.combo % 5 === 0) flash(`🔥 ${st.combo} STREAK`, `×${mult + (st.combo % 5 === 0 ? 0 : 0)} points`);
        if (st.got >= st.need) { st.score += 250 * st.wave; st.rocks.forEach((r) => boom(r.x, r.y, '#74c0fc', 12)); st.rocks = []; flash('WAVE CLEARED', `+${250 * st.wave} bonus`); setTimeout(() => { if (!st.over) nextWave(); }, 1500); st.need = 1e9; }
      } else {
        st.combo = 0; hurt(); boom(hit.x, hit.y, '#ff6b6b', 18);
        float(hit.x, hit.y, `✗ ${hit.why}`, '#ff8787');
        st.mistakes.push({ rule: st.rule.banner, text: hit.text, why: hit.why, kind: 'shot' });
      }
    }
    function hurt() { st.shields--; st.shake = 0.35; sfx.shield(); if (st.shields <= 0) end(); }

    function end() {
      if (st.over) return;
      st.over = true;
      sfx.bad();
      const acc = st.shots ? Math.round((100 * st.hits) / st.shots) : 0;
      setTimeout(() => opts.onEnd && opts.onEnd({ mission: mission.id, score: st.score, wave: st.wave, hits: st.hits, shots: st.shots, accuracy: acc, bestCombo: st.best, mistakes: st.mistakes.slice(-4), seconds: Math.round(st.t) }), 900);
    }

    cvs.addEventListener('pointerdown', (e) => { const b = cvs.getBoundingClientRect(); shoot(e.clientX - b.left, e.clientY - b.top); });
    const pause = () => { if (st.over) return; st.paused = !st.paused; $('ab-pause').textContent = st.paused ? '▶' : '⏸'; if (st.paused) flash('PAUSED', 'tap ▶ or press P'); };
    $('ab-pause').onclick = pause;
    const key = (e) => { if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') pause(); };
    root.addEventListener('keydown', key);

    let last = performance.now(), raf = 0;
    function frame(now) {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (!st.paused) update(dt);
      draw();
      $('ab-score').textContent = `⭐ ${st.score}  ${'🛡️'.repeat(Math.max(0, st.shields))}`;
      if (!stopped) raf = requestAnimationFrame(frame);
    }
    function update(dt) {
      st.t += dt;
      if (!st.over && st.need < 1e9) { st.spawnT -= dt; if (st.spawnT <= 0) { spawn(); st.spawnT = st.spawnEvery; } }
      for (const r of st.rocks) { r.y += r.vy * dt; r.x += r.vx * dt; r.rot += r.vr * dt; if (r.x < r.r || r.x > W - r.r) r.vx *= -1; }
      // A target that reaches the ground costs a shield; a wrong one just drops away.
      for (const r of st.rocks.filter((x) => x.y - x.r > H - 70)) {
        st.rocks.splice(st.rocks.indexOf(r), 1);
        if (r.ok && !st.over) { st.combo = 0; hurt(); boom(r.x, H - 60, '#ff6b6b', 14); float(r.x, H - 90, `missed ${r.text}! ${r.why}`, '#ff8787'); st.mistakes.push({ rule: st.rule.banner, text: r.text, why: r.why, kind: 'missed' }); }
      }
      for (const p of st.parts) { p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.97; p.vy *= 0.97; p.life -= dt; }
      st.parts = st.parts.filter((p) => p.life > 0);
      st.lasers.forEach((l) => (l.life -= dt)); st.lasers = st.lasers.filter((l) => l.life > 0);
      st.floats.forEach((f) => { f.y -= 40 * dt; f.life -= dt; }); st.floats = st.floats.filter((f) => f.life > 0);
      st.shake = Math.max(0, st.shake - dt);
      for (const s of stars) { s.y += (s.z * (0.02 + st.wave * 0.004)) * dt * 3; if (s.y > 1) { s.y = 0; s.x = Math.random(); } }
    }
    function draw() {
      ctx.save();
      if (st.shake > 0) ctx.translate((Math.random() - 0.5) * 14 * st.shake, (Math.random() - 0.5) * 14 * st.shake);
      const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0b0820'); g.addColorStop(1, '#1d1442');
      ctx.fillStyle = g; ctx.fillRect(-10, -10, W + 20, H + 20);
      for (const s of stars) { ctx.fillStyle = `rgba(255,255,255,${0.3 + s.z * 0.3})`; ctx.fillRect(s.x * W, s.y * H, s.z, s.z); }
      // ground line
      ctx.strokeStyle = 'rgba(116,192,252,.35)'; ctx.setLineDash([6, 8]); ctx.beginPath(); ctx.moveTo(0, H - 70); ctx.lineTo(W, H - 70); ctx.stroke(); ctx.setLineDash([]);
      for (const r of st.rocks) {
        ctx.save(); ctx.translate(r.x, r.y); ctx.rotate(r.rot);
        ctx.beginPath(); r.pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath();
        ctx.fillStyle = '#4a3f6b'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#9d8cd9'; ctx.stroke();
        ctx.restore();
        ctx.fillStyle = '#fff'; ctx.font = `800 ${r.text.length > 4 ? 16 : 20}px system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(r.text, r.x, r.y);
      }
      for (const l of st.lasers) { ctx.strokeStyle = `rgba(105,219,124,${l.life * 8})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(l.x1, l.y1); ctx.lineTo(l.x2, l.y2); ctx.stroke(); }
      for (const p of st.parts) { ctx.globalAlpha = Math.max(0, p.life); ctx.fillStyle = p.color; ctx.fillRect(p.x - 2, p.y - 2, 4, 4); }
      ctx.globalAlpha = 1;
      // ship
      ctx.save(); ctx.translate(W / 2, H - 40); ctx.rotate(st.aim + Math.PI / 2);
      ctx.fillStyle = st.over ? '#ff6b6b' : '#69db7c'; ctx.beginPath(); ctx.moveTo(0, -22); ctx.lineTo(16, 16); ctx.lineTo(0, 8); ctx.lineTo(-16, 16); ctx.closePath(); ctx.fill();
      if (st.shields > 0 && !st.over) { ctx.strokeStyle = `rgba(116,192,252,${0.25 + 0.15 * st.shields})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 30, 0, Math.PI * 2); ctx.stroke(); }
      ctx.restore();
      for (const f of st.floats) { ctx.globalAlpha = Math.min(1, f.life); ctx.fillStyle = f.color; ctx.font = '800 15px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(f.text, Math.min(W - 80, Math.max(80, f.x)), f.y); }
      ctx.globalAlpha = 1;
      // wave progress
      if (st.need < 1e9) { ctx.fillStyle = 'rgba(255,255,255,.15)'; ctx.fillRect(12, H - 18, W - 24, 6); ctx.fillStyle = '#ffd43b'; ctx.fillRect(12, H - 18, (W - 24) * Math.min(1, st.got / st.need), 6); }
      if (st.over) { ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#fff'; ctx.font = '900 40px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('GAME OVER', W / 2, H / 2); }
      ctx.restore();
    }
    let stopped = false;
    const stop = () => { stopped = true; cancelAnimationFrame(raf); root.removeEventListener('resize', fit); root.removeEventListener('keydown', key); clearTimeout(msgT); };
    host.abState = st; // lets automated tests see the rocks
    nextWave();
    raf = requestAnimationFrame(frame);
    return { stop, state: st };
  }

  root.Arcade = { RULES, MISSIONS, start };
})(typeof window !== 'undefined' ? window : globalThis);
