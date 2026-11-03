// 🎮 Arcade: Drift Racer. A question flashes up, then a gate with three answers races toward
// your car. Steer into the right lane before it arrives (← → keys, A/D, or tap a lane).
// Right lane = nitro boost; wrong lane = spin-out, a lost 🔧 and the worked answer. Laps
// get faster and the numbers trickier. Problem makers (Arcade.RACER_RULES) are pure, and
// each carries `expr`, an independent formula for its answer, so tests can check them.
(function (root) {
  const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
  const money = (x) => `$${x.toFixed(2)}`;

  // Three different choices: the answer plus two believable wrong ones.
  function choices(answer, wrongs, fallback) {
    const out = [String(answer)];
    for (const w of [...wrongs, ...fallback()]) { const s = String(w); if (!out.includes(s) && !/NaN|Infinity|undefined|-/.test(s)) out.push(s); if (out.length === 3) break; }
    return out;
  }
  const near = (n, step = 1) => () => [n + step, n - step, n + 2 * step, n * 2, Math.round(n / 2)].filter((x) => x > 0);

  const RACER_RULES = {
    ratios(level) {
      const t = pick(level < 3 ? ['share', 'simplify', 'unit'] : ['share', 'simplify', 'unit', 'scale']);
      if (t === 'share') {
        const a = R(1, 4), b = R(a + 1, a + 4), k = R(2, level < 3 ? 6 : 15), tot = (a + b) * k;
        return { text: `Boys : girls = ${a} : ${b}, ${tot} kids. Girls?`, answer: String(b * k), expr: `${tot} / (${a} + ${b}) * ${b}`, choices: choices(b * k, [a * k, tot - a, b * Math.round(tot / b / 2)], near(b * k, k)), why: `${a + b} parts = ${tot}, 1 part = ${k}, girls = ${b} × ${k} = ${b * k}` };
      }
      if (t === 'simplify') {
        const a = R(1, 6), b = R(a + 1, 9), k = R(2, level < 3 ? 6 : 12), g = gcd(a, b), A = a / g, B = b / g;
        return { text: `Simplify ${a * k} : ${b * k}`, answer: `${A}:${B}`, expr: `${a * k} / ${b * k}`, choices: choices(`${A}:${B}`, [`${B}:${A}`, `${A + 1}:${B + 1}`, `${a * k / 2}:${b * k / 2}`], () => [`${A}:${B + 1}`, `${A + 1}:${B}`]), why: `divide both by ${k * g}: ${A} : ${B}` };
      }
      if (t === 'unit') {
        const n = R(2, 6), p = R(2, 9), m = R(n + 1, 12);
        return { text: `${n} pens cost $${n * p}. Cost of ${m} pens?`, answer: `$${m * p}`, expr: `${n * p} / ${n} * ${m}`, choices: choices(`$${m * p}`, [`$${n * p + (m - n)}`, `$${m * p + p}`, `$${(m - n) * p}`], () => [`$${m * p - p}`, `$${m * p * 2}`]), why: `1 pen = $${n * p} ÷ ${n} = $${p}, × ${m} = $${m * p}` };
      }
      const s = R(2, 5), cm = R(3, 12);
      return { text: `Map: 1 cm = ${s} km. ${cm} cm on the map = ? km`, answer: String(s * cm), expr: `${cm} * ${s}`, choices: choices(s * cm, [cm + s, cm, s * cm * 10], near(s * cm, s)), why: `${cm} × ${s} = ${s * cm} km` };
    },
    rates(level) {
      const t = pick(level < 2 ? ['speed', 'dist'] : ['speed', 'dist', 'time', 'unitprice']);
      if (t === 'speed') { const v = R(3, 15) * 5, h = R(2, level < 3 ? 4 : 6); return { text: `${v * h} miles in ${h} hours. Speed?`, answer: `${v} mph`, expr: `${v * h} / ${h}`, choices: choices(`${v} mph`, [`${v * h * h} mph`, `${v + 10} mph`, `${v * 2} mph`], () => [`${v - 5} mph`]), why: `speed = distance ÷ time = ${v * h} ÷ ${h} = ${v}` }; }
      if (t === 'dist') { const v = R(3, 14) * 5, h = R(2, 5); return { text: `${v} mph for ${h} hours. Distance?`, answer: `${v * h} mi`, expr: `${v} * ${h}`, choices: choices(`${v * h} mi`, [`${v + h} mi`, `${v * (h + 1)} mi`, `${v * h * 2} mi`], () => [`${v * (h - 1)} mi`]), why: `distance = speed × time = ${v} × ${h} = ${v * h}` }; }
      if (t === 'time') { const v = R(3, 12) * 5, h = R(2, 6); return { text: `${v * h} miles at ${v} mph. Hours?`, answer: `${h} h`, expr: `${v * h} / ${v}`, choices: choices(`${h} h`, [`${h + 1} h`, `${h * 2} h`, `${h - 1} h`], () => [`${h + 2} h`]), why: `time = distance ÷ speed = ${v * h} ÷ ${v} = ${h}` }; }
      const lb = R(2, 6), p = R(3, 15) * 0.25;
      return { text: `${lb} lb cost ${money(lb * p)}. Price per lb?`, answer: money(p), expr: `${lb * p} / ${lb}`, choices: choices(money(p), [money(p * 2), money(p + 0.5), money(lb * p - lb)], () => [money(p + 0.25)]), why: `${money(lb * p)} ÷ ${lb} = ${money(p)}` };
    },
    units(level) {
      const all = [
        ['ft', 'in', 12, 1], ['yd', 'ft', 3, 1], ['h', 'min', 60, 1], ['min', 's', 60, 2], ['km', 'm', 1000, 2], ['m', 'cm', 100, 2], ['gal', 'qt', 4, 3], ['lb', 'oz', 16, 3],
        ['yd²', 'ft²', 9, 4], ['ft²', 'in²', 144, 5], ['day', 'h', 24, 3], ['h', 's', 3600, 5],
      ].filter((u) => u[3] <= level);
      const [from, to, f] = pick(all);
      const n = level >= 3 && f <= 60 && Math.random() < 0.4 ? R(1, 9) + 0.5 : R(2, 9);
      const ans = n * f;
      const wrongF = to.includes('²') ? Math.round(Math.sqrt(f)) : f === 60 ? 100 : f === 12 ? 10 : f / 2;
      return { text: `${n} ${from} = ? ${to}`, answer: String(ans), expr: `${n} * ${f}`, choices: choices(ans, [n * wrongF, n + f, ans * 10], near(ans, f)), why: `1 ${from} = ${f} ${to}, so ${n} × ${f} = ${ans}` };
    },
    estimate(level) {
      const t = pick(['mult', 'add', 'root']);
      if (t === 'mult') {
        const a = R(2, 9) * 10 + pick([-1, 1, -2, 2]), b = R(2, 9) * 10 + pick([-1, 1]), e = Math.round(a / 10) * 10 * Math.round(b / 10) * 10;
        return { text: `About how much is ${a} × ${b}?`, answer: String(e), expr: `${a} * ${b}`, estimate: true, choices: choices(e, [e * 10, Math.round(e / 10), e * 2], () => [e + 1000]), why: `${a} ≈ ${Math.round(a / 10) * 10}, ${b} ≈ ${Math.round(b / 10) * 10}, so ≈ ${e} (exact ${a * b})` };
      }
      if (t === 'add') {
        const a = R(2, 9) * 100 + R(-4, 4), b = R(2, 9) * 100 + R(-4, 4), e = Math.round(a / 100) * 100 + Math.round(b / 100) * 100;
        return { text: `About how much is ${a} + ${b}?`, answer: String(e), expr: `${a} + ${b}`, estimate: true, choices: choices(e, [e + 300, e - 300, e * 2], () => [e + 500]), why: `${a} ≈ ${Math.round(a / 100) * 100}, ${b} ≈ ${Math.round(b / 100) * 100}, so ≈ ${e} (exact ${a + b})` };
      }
      const k = R(3, level < 3 ? 9 : 14), n = k * k + R(1, 2 * k);
      return { text: `√${n} is between…`, answer: `${k} and ${k + 1}`, expr: `Math.sqrt(${n})`, root: [k, k + 1], choices: choices(`${k} and ${k + 1}`, [`${k - 1} and ${k}`, `${k + 1} and ${k + 2}`, `${Math.floor(n / 2) - 1} and ${Math.floor(n / 2)}`], () => [`${k + 2} and ${k + 3}`]), why: `${k}² = ${k * k} and ${k + 1}² = ${(k + 1) ** 2}, and ${n} is in between` };
    },
  };
  RACER_RULES.mixed = (level) => RACER_RULES[pick(['ratios', 'rates', 'units', 'estimate'])](level);

  const RACER_MISSIONS = [
    { id: 'ratios', name: 'Ratios', emoji: '⚖️' },
    { id: 'rates', name: 'Speed & rates', emoji: '⏱️' },
    { id: 'units', name: 'Unit conversions', emoji: '📏' },
    { id: 'estimate', name: 'Estimation', emoji: '🎯' },
    { id: 'mixed', name: 'Grand Prix (mixed)', emoji: '🏁' },
  ];

  function startRacer(host, missionId, opts = {}) {
    const make = RACER_RULES[missionId] || RACER_RULES.ratios;
    host.innerHTML = `<div class="ab dr"><canvas></canvas>
      <div class="ab-hud"><span id="ab-banner"></span><span class="ab-right"><span id="ab-score">0</span><button id="ab-pause" aria-label="Pause">⏸</button></span></div>
      <div class="dr-q" id="dr-q"></div>
      <div class="ab-msg" id="ab-msg"></div></div>
      <div class="dr-pad"><button class="btn ghost" data-l="0">◀ Left</button><button class="btn ghost" data-l="1">Middle</button><button class="btn ghost" data-l="2">Right ▶</button></div>`;
    const cvs = host.querySelector('canvas'), ctx = cvs.getContext('2d');
    const $ = (id) => host.querySelector('#' + id);
    let W = 0, H = 0;
    const fit = () => { const dpr = Math.min(2, root.devicePixelRatio || 1); W = host.clientWidth; H = Math.max(420, Math.min(root.innerHeight - 200, 680)); cvs.width = W * dpr; cvs.height = H * dpr; cvs.style.height = H + 'px'; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
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
    const sfx = { steer: () => beep(500, 0.05, 'triangle', 0.03), boost: () => beep(300, 0.35, 'sawtooth', 0.05, 900), crash: () => beep(110, 0.5, 'sawtooth', 0.08, -70), lap: () => [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, 0.12, 'square', 0.04), i * 90)) };

    const st = { score: 0, lap: 0, gates: 0, perLap: 8, repairs: 3, combo: 0, best: 0, hits: 0, shots: 0, lane: 1, carX: null, scroll: 0, speed: 1, gate: null, spin: 0, boost: 0, parts: [], floats: [], shake: 0, paused: false, over: false, mistakes: [], t: 0, level: 1, waitT: 0 };
    const laneX = (i) => W / 2 + (i - 1) * Math.min(130, W / 3.2);

    function nextLap() {
      st.lap++; st.gates = 0;
      st.level = Math.min(5, 1 + Math.floor((st.lap - 1) / 2));
      st.travel = Math.max(3.2, 7 - st.lap * 0.45); // seconds a gate takes to reach the car
      if (st.lap > 1 && st.lap % 3 === 1) st.repairs = Math.min(3, st.repairs + 1);
      $('ab-banner').textContent = `Lap ${st.lap} · ${RACER_MISSIONS.find((m) => m.id === missionId)?.name || ''}`;
      flash(`LAP ${st.lap}`, 'Steer into the right answer!');
      sfx.lap();
      st.waitT = 1.2;
    }
    let msgT = null;
    function flash(big, small) { const m = $('ab-msg'); m.innerHTML = `<b>${big}</b>${small ? `<span>${small}</span>` : ''}`; m.classList.add('on'); clearTimeout(msgT); msgT = setTimeout(() => m.classList.remove('on'), 1500); }
    function newGate() {
      const p = make(st.level);
      const order = p.choices.slice().sort(() => Math.random() - 0.5);
      st.gate = { ...p, order, y: -40, correctLane: order.indexOf(p.answer) };
      $('dr-q').textContent = p.text;
      $('dr-q').classList.add('on');
    }
    function steer(i) { if (st.over || st.paused || st.spin > 0) return; const n = Math.max(0, Math.min(2, i)); if (n !== st.lane) { st.lane = n; sfx.steer(); } }
    host.querySelectorAll('[data-l]').forEach((b) => b.addEventListener('pointerdown', (e) => { e.preventDefault(); steer(+b.dataset.l); }));
    cvs.addEventListener('pointerdown', (e) => { const r = cvs.getBoundingClientRect(), x = e.clientX - r.left; steer(x < W / 3 ? 0 : x < (2 * W) / 3 ? 1 : 2); });
    const pause = () => { if (st.over) return; st.paused = !st.paused; $('ab-pause').textContent = st.paused ? '▶' : '⏸'; if (st.paused) flash('PAUSED', 'tap ▶ or press P'); };
    $('ab-pause').onclick = pause;
    const key = (e) => {
      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') return pause();
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { e.preventDefault(); steer(st.lane - 1); }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { e.preventDefault(); steer(st.lane + 1); }
      if (['1', '2', '3'].includes(e.key)) steer(+e.key - 1);
    };
    root.addEventListener('keydown', key);

    function burst(x, y, colors, n = 24) { for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, s = 60 + Math.random() * 220; st.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.5 + Math.random() * 0.5, color: pick(colors) }); } }
    const float = (x, y, text, color) => st.floats.push({ x, y, text, color, life: 1.8 });

    function resolveGate() {
      const g = st.gate; st.gate = null; st.shots++; st.gates++;
      $('dr-q').classList.remove('on');
      const carY = H - 90;
      if (st.lane === g.correctLane) {
        st.hits++; st.combo++; st.best = Math.max(st.best, st.combo);
        const mult = 1 + Math.floor(st.combo / 5), pts = 100 * mult;
        st.score += pts; st.boost = 1.2; sfx.boost();
        burst(laneX(st.lane), carY + 30, ['#ffd43b', '#ff922b', '#fff'], 30);
        float(laneX(st.lane), carY - 40, `NITRO! +${pts}${mult > 1 ? ` ×${mult}` : ''}`, '#ffd43b');
        if (st.combo % 5 === 0) flash(`🔥 ${st.combo} IN A ROW`, `×${mult} points`);
      } else {
        st.combo = 0; st.repairs--; st.spin = 1.1; st.shake = 0.45; sfx.crash();
        burst(laneX(st.lane), carY, ['#adb5bd', '#ff6b6b', '#495057'], 30);
        float(W / 2, carY - 60, `${g.answer}: ${g.why}`, '#ff8787');
        st.mistakes.push({ text: g.text, answer: g.answer, why: g.why });
        if (st.repairs <= 0) return end();
      }
      if (st.gates >= st.perLap) { st.score += 300 * st.lap; flash('LAP COMPLETE', `+${300 * st.lap} bonus`); setTimeout(() => { if (!st.over) nextLap(); }, 1300); st.waitT = 99; }
      else st.waitT = 0.6;
    }
    function end() {
      if (st.over) return;
      st.over = true;
      $('dr-q').classList.remove('on');
      const acc = st.shots ? Math.round((100 * st.hits) / st.shots) : 0;
      setTimeout(() => opts.onEnd && opts.onEnd({ game: 'racer', mission: missionId, score: st.score, wave: st.lap, hits: st.hits, shots: st.shots, accuracy: acc, bestCombo: st.best, mistakes: st.mistakes.slice(-4), seconds: Math.round(st.t) }), 1000);
    }

    function update(dt) {
      st.t += dt;
      const target = laneX(st.lane);
      st.carX = st.carX == null ? target : st.carX + (target - st.carX) * Math.min(1, dt * 10);
      st.speed = 1 + st.lap * 0.15 + (st.boost > 0 ? 1 : 0);
      st.scroll = (st.scroll + dt * 420 * st.speed) % 80;
      st.boost = Math.max(0, st.boost - dt); st.spin = Math.max(0, st.spin - dt); st.shake = Math.max(0, st.shake - dt);
      if (!st.over) {
        if (!st.gate) { st.waitT -= dt; if (st.waitT <= 0 && st.waitT > -50) newGate(); }
        else { st.gate.y += ((H - 90 + 40) / st.travel) * dt; if (st.gate.y >= H - 110) resolveGate(); }
      }
      for (const p of st.parts) { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; }
      st.parts = st.parts.filter((p) => p.life > 0);
      st.floats.forEach((f) => { f.y -= 26 * dt; f.life -= dt; }); st.floats = st.floats.filter((f) => f.life > 0);
    }
    function draw() {
      ctx.save();
      if (st.shake > 0) ctx.translate((Math.random() - 0.5) * 16 * st.shake, (Math.random() - 0.5) * 16 * st.shake);
      ctx.fillStyle = '#2b8a3e'; ctx.fillRect(-10, -10, W + 20, H + 20);
      const roadW = Math.min(420, W - 20), rx = (W - roadW) / 2;
      ctx.fillStyle = '#343a40'; ctx.fillRect(rx, -10, roadW, H + 20);
      // curbs
      for (let y = -80 + st.scroll; y < H; y += 80) { ctx.fillStyle = '#e03131'; ctx.fillRect(rx - 10, y, 10, 40); ctx.fillRect(rx + roadW, y, 10, 40); ctx.fillStyle = '#fff'; ctx.fillRect(rx - 10, y + 40, 10, 40); ctx.fillRect(rx + roadW, y + 40, 10, 40); }
      // lane dashes
      ctx.fillStyle = 'rgba(255,255,255,.6)';
      for (const lx of [(laneX(0) + laneX(1)) / 2, (laneX(1) + laneX(2)) / 2]) for (let y = -80 + st.scroll; y < H; y += 80) ctx.fillRect(lx - 3, y, 6, 40);
      // speed lines when boosting
      if (st.boost > 0) { ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 2; for (let i = 0; i < 14; i++) { const x = rx + Math.random() * roadW, y = Math.random() * H; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 60); ctx.stroke(); } }
      // gate
      if (st.gate) {
        const g = st.gate, bw = Math.min(118, W / 3.4);
        ctx.fillStyle = '#ffd43b'; ctx.fillRect(rx, g.y - 6, roadW, 6);
        g.order.forEach((txt, i) => {
          const x = laneX(i);
          ctx.fillStyle = '#1c7ed6'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x - bw / 2, g.y, bw, 40, 8) : ctx.rect(x - bw / 2, g.y, bw, 40); ctx.fill(); ctx.stroke();
          ctx.fillStyle = '#fff'; ctx.font = `800 ${txt.length > 8 ? 14 : 18}px system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(txt, x, g.y + 21);
        });
      }
      // car
      const cy = H - 90;
      ctx.save(); ctx.translate(st.carX ?? W / 2, cy); ctx.rotate(st.spin > 0 ? st.spin * 9 : (laneX(st.lane) - (st.carX ?? 0)) * -0.004);
      if (st.boost > 0) { ctx.fillStyle = pick(['#ff922b', '#ffd43b']); ctx.beginPath(); ctx.moveTo(-10, 34); ctx.lineTo(0, 34 + 20 + Math.random() * 20); ctx.lineTo(10, 34); ctx.fill(); }
      ctx.fillStyle = '#111'; [[-22, -24], [14, -24], [-22, 12], [14, 12]].forEach(([x, y]) => ctx.fillRect(x, y, 8, 16));
      ctx.fillStyle = '#f03e3e'; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-16, -34, 32, 68, 10) : ctx.rect(-16, -34, 32, 68); ctx.fill();
      ctx.fillStyle = '#a5d8ff'; ctx.fillRect(-11, -18, 22, 14);
      ctx.fillStyle = '#fff'; ctx.fillRect(-3, -34, 6, 68);
      ctx.restore();
      for (const p of st.parts) { ctx.globalAlpha = Math.max(0, p.life); ctx.fillStyle = p.color; ctx.fillRect(p.x - 3, p.y - 3, 6, 6); }
      ctx.globalAlpha = 1;
      for (const f of st.floats) { ctx.globalAlpha = Math.min(1, f.life); ctx.fillStyle = f.color; ctx.font = '800 15px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(f.text, W / 2, f.y); }
      ctx.globalAlpha = 1;
      // lap progress
      ctx.fillStyle = 'rgba(255,255,255,.2)'; ctx.fillRect(12, H - 16, W - 24, 6); ctx.fillStyle = '#ffd43b'; ctx.fillRect(12, H - 16, (W - 24) * Math.min(1, st.gates / st.perLap), 6);
      if (st.over) { ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#fff'; ctx.font = '900 38px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('WRECKED!', W / 2, H / 2); }
      ctx.restore();
    }

    let last = performance.now(), raf = 0, stopped = false;
    function frame(now) {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (!st.paused) update(dt);
      draw();
      $('ab-score').textContent = `⭐ ${st.score}  ${'🔧'.repeat(Math.max(0, st.repairs))}`;
      if (!stopped) raf = requestAnimationFrame(frame);
    }
    const stop = () => { stopped = true; cancelAnimationFrame(raf); root.removeEventListener('resize', fit); root.removeEventListener('keydown', key); clearTimeout(msgT); };
    host.abState = st; // lets automated tests see the gates
    nextLap();
    raf = requestAnimationFrame(frame);
    return { stop, state: st };
  }

  Object.assign(root.Arcade = root.Arcade || {}, { RACER_RULES, RACER_MISSIONS, startRacer });
})(typeof window !== 'undefined' ? window : globalThis);
