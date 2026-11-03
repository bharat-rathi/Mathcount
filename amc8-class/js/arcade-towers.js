// 🎮 Arcade: Tower Builder. Slime robots march along a path toward your castle. Tap an empty
// pad to build a tower, but every tower is paid for with a geometry problem (with a picture):
// 🏹 Archer = easy, 💣 Cannon = medium, ⚡ Laser = hard, and tapping a tower upgrades it with a
// harder one. Right answer: the tower goes up. Wrong: half the gold is lost and the worked
// answer shows. You press "Send wave" when ready, so building is calm and the fight is fast.
// Problem makers (Arcade.TOWER_RULES) are pure and carry `expr`, an independent formula.
(function (root) {
  const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const svg = (inner) => `<svg viewBox="0 0 240 150" class="tq" role="img">${inner}</svg>`;
  const T = (x, y, s, extra = '') => `<text x="${x}" y="${y}" ${extra}>${s}</text>`;
  // Four different choices: the answer and three believable mistakes.
  function choices(ans, wrongs, unit = '') {
    const out = [ans + unit];
    for (const w of [...wrongs, ans + 2, ans * 2, ans + 10, Math.max(1, ans - 3)]) { const s = w + unit; if (w > 0 && Number.isFinite(w) && !out.includes(s)) out.push(s); if (out.length === 4) break; }
    return out.sort(() => Math.random() - 0.5);
  }

  const TOWER_RULES = {
    rectArea() {
      const w = R(4, 12), h = R(3, 9);
      return { text: 'What is the AREA of this rectangle?', answer: `${w * h}`, expr: `${w} * ${h}`, choices: choices(w * h, [2 * (w + h), w + h, w * h * 2]), why: `area = length × width = ${w} × ${h} = ${w * h}`,
        svg: svg(`<rect x="50" y="30" width="${w * 10 + 40}" height="${h * 8 + 20}" class="f1"/>${T(50 + (w * 10 + 40) / 2 - 8, 24, w)}${T(56 + w * 10 + 40, 30 + (h * 8 + 20) / 2 + 5, h)}`) };
    },
    rectPerim() {
      const w = R(4, 12), h = R(3, 9);
      return { text: 'What is the PERIMETER of this rectangle?', answer: `${2 * (w + h)}`, expr: `2 * (${w} + ${h})`, choices: choices(2 * (w + h), [w * h, w + h, 2 * w + h]), why: `perimeter = all four sides = ${w} + ${h} + ${w} + ${h} = ${2 * (w + h)}`,
        svg: svg(`<rect x="50" y="30" width="${w * 10 + 40}" height="${h * 8 + 20}" class="f2"/>${T(50 + (w * 10 + 40) / 2 - 8, 24, w)}${T(56 + w * 10 + 40, 30 + (h * 8 + 20) / 2 + 5, h)}`) };
    },
    lineAngle() {
      const a = R(5, 16) * 5;
      return { text: 'Two angles on a straight line. Find x.', answer: `${180 - a}`, expr: `180 - ${a}`, choices: choices(180 - a, [Math.abs(90 - a) || 95, 360 - a, a]), why: `angles on a straight line add to 180°: 180 − ${a} = ${180 - a}`,
        svg: svg(`<line x1="20" y1="110" x2="220" y2="110" class="ln"/><line x1="120" y1="110" x2="${120 + 80 * Math.cos((a * Math.PI) / 180)}" y2="${110 - 80 * Math.sin((a * Math.PI) / 180)}" class="ln"/>${T(150, 100, a + '°')}${T(80, 100, 'x')}`) };
    },
    triAngle() {
      const a = R(30, 80), b = R(30, 150 - a);
      return { text: 'Find the missing angle x of the triangle.', answer: `${180 - a - b}`, expr: `180 - ${a} - ${b}`, choices: choices(180 - a - b, [360 - a - b, a + b, Math.abs(90 - a)]), why: `a triangle's angles add to 180°: 180 − ${a} − ${b} = ${180 - a - b}`,
        svg: svg(`<polygon points="30,130 210,130 110,20" class="f1"/>${T(40, 122, a + '°')}${T(170, 122, b + '°')}${T(103, 48, 'x')}`) };
    },
    triArea() {
      const b = R(3, 12) * 2, h = R(3, 10);
      return { text: 'What is the AREA of this triangle?', answer: `${(b * h) / 2}`, expr: `${b} * ${h} / 2`, choices: choices((b * h) / 2, [b * h, b + h, (b * h) / 4]), why: `area = ½ × base × height = ½ × ${b} × ${h} = ${(b * h) / 2}`,
        svg: svg(`<polygon points="30,130 210,130 150,25" class="f2"/><line x1="150" y1="25" x2="150" y2="130" class="dash"/>${T(110, 146, b)}${T(156, 85, h)}`) };
    },
    circleCirc() {
      const r = R(2, 12);
      return { text: 'What is the CIRCUMFERENCE? (in terms of π)', answer: `${2 * r}π`, expr: `2 * ${r}`, pi: true, choices: choices(2 * r, [r, r * r, 4 * r], 'π'), why: `C = 2πr = 2 × π × ${r} = ${2 * r}π`,
        svg: svg(`<circle cx="120" cy="75" r="55" class="f1"/><line x1="120" y1="75" x2="175" y2="75" class="ln"/>${T(124, 66, 'r=' + r, 'font-size="13"')}`) };
    },
    pythag() {
      const [a, b, c] = pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [6, 8, 10], [7, 24, 25]]), k = pick([1, 1, 2, 3]);
      return { text: 'How long is the longest side, x?', answer: `${c * k}`, expr: `Math.sqrt(${a * k} ** 2 + ${b * k} ** 2)`, choices: choices(c * k, [(a + b) * k, (c + 1) * k, a * k * b * k]), why: `${a * k}² + ${b * k}² = ${(a * k) ** 2 + (b * k) ** 2} = ${c * k}², so x = ${c * k}`,
        svg: svg(`<polygon points="40,130 200,130 40,30" class="f2"/><rect x="40" y="118" width="12" height="12" class="f0"/>${T(110, 146, b * k)}${T(18, 85, a * k)}${T(125, 72, 'x')}`) };
    },
    circleArea() {
      const r = R(2, 10);
      return { text: 'What is the AREA of the circle? (in terms of π)', answer: `${r * r}π`, expr: `${r} * ${r}`, pi: true, choices: choices(r * r, [2 * r, 4 * r * r, 2 * r * r], 'π'), why: `area = πr² = π × ${r} × ${r} = ${r * r}π (careful: ${2 * r} is the diameter)`,
        svg: svg(`<circle cx="120" cy="75" r="55" class="f2"/><line x1="65" y1="75" x2="175" y2="75" class="ln"/>${T(100, 68, 'd = ' + 2 * r)}`) };
    },
    lShape() {
      const W = R(8, 14), H = R(6, 10), w = R(2, W - 4), h = R(2, H - 3);
      const s = 10;
      return { text: 'What is the area of this L-shape?', answer: `${W * H - w * h}`, expr: `${W} * ${H} - ${w} * ${h}`, choices: choices(W * H - w * h, [W * H, W * H + w * h, 2 * (W + H)]), why: `big rectangle ${W} × ${H} = ${W * H}, minus the missing ${w} × ${h} = ${w * h}: ${W * H - w * h}`,
        svg: svg(`<polygon points="40,20 ${40 + (W - w) * s},20 ${40 + (W - w) * s},${20 + h * s} ${40 + W * s},${20 + h * s} ${40 + W * s},${20 + H * s} 40,${20 + H * s}" class="f1"/>${T(40 + (W * s) / 2 - 6, 34 + H * s, W)}${T(26, 20 + (H * s) / 2, H)}${T(40 + (W - w / 2) * s - 5, 15, w)}${T(44 + (W - w) * s, 25 + (h * s) / 2, h)}`) };
    },
    boxVolume() {
      const l = R(2, 8), w = R(2, 6), h = R(2, 6);
      return { text: 'What is the VOLUME of this box?', answer: `${l * w * h}`, expr: `${l} * ${w} * ${h}`, choices: choices(l * w * h, [2 * (l * w + l * h + w * h), l + w + h, l * w]), why: `volume = length × width × height = ${l} × ${w} × ${h} = ${l * w * h}`,
        svg: svg(`<polygon points="40,60 150,60 150,130 40,130" class="f1"/><polygon points="40,60 80,30 190,30 150,60" class="f2"/><polygon points="150,60 190,30 190,100 150,130" class="f0"/>${T(90, 146, l)}${T(176, 120, w)}${T(24, 100, h)}`) };
    },
    similar() {
      const a = R(2, 6), b = R(3, 8), k = R(2, 4);
      return { text: 'The triangles are similar. Find x.', answer: `${b * k}`, expr: `${b} * ${k * a} / ${a}`, choices: choices(b * k, [b + (k * a - a), k * a, b * k + k]), why: `zoom factor = ${k * a} ÷ ${a} = ${k}, so x = ${b} × ${k} = ${b * k}`,
        svg: svg(`<polygon points="15,130 75,130 15,95" class="f1"/>${T(38, 146, a)}${T(2, 116, b)}<polygon points="100,130 220,130 100,60" class="f2"/>${T(152, 146, k * a)}${T(84, 100, 'x')}`) };
    },
  };
  // Which problems each tier draws from.
  const TIERS = [null, ['rectArea', 'rectPerim', 'lineAngle'], ['triAngle', 'triArea', 'circleCirc', 'rectArea'], ['pythag', 'circleArea', 'lShape', 'boxVolume', 'similar']];
  const KINDS = [
    { id: 'archer', name: 'Archer', emoji: '🏹', tier: 1, cost: 50, range: 95, dmg: 6, rate: 0.5, color: '#69db7c' },
    { id: 'cannon', name: 'Cannon', emoji: '💣', tier: 2, cost: 90, range: 85, dmg: 18, rate: 1.1, color: '#ffa94d' },
    { id: 'laser', name: 'Laser', emoji: '⚡', tier: 3, cost: 140, range: 125, dmg: 14, rate: 0.35, color: '#74c0fc' },
  ];
  const makeProblem = (tier) => TOWER_RULES[pick(TIERS[Math.min(3, tier)])]();

  function startTowers(host, opts = {}) {
    host.innerHTML = `<div class="ab tw"><canvas></canvas>
      <div class="ab-hud"><span id="ab-banner"></span><span class="ab-right"><span id="ab-score"></span><button id="ab-pause" aria-label="Pause">⏸</button></span></div>
      <div class="ab-msg" id="ab-msg"></div><div class="tw-modal" id="tw-modal" hidden></div></div>
      <div class="tw-bar"><span id="tw-help">Tap a 🟫 pad to build a tower.</span><button class="btn go" id="tw-go">▶ Send wave 1</button></div>`;
    const cvs = host.querySelector('canvas'), ctx = cvs.getContext('2d');
    const $ = (id) => host.querySelector('#' + id);
    let W = 0, H = 0;
    const fit = () => { const dpr = Math.min(2, root.devicePixelRatio || 1); W = host.clientWidth; H = Math.max(420, Math.min(root.innerHeight - 200, 640)); cvs.width = W * dpr; cvs.height = H * dpr; cvs.style.height = H + 'px'; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
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
    const sfx = { build: () => [392, 523, 784].forEach((f, i) => setTimeout(() => beep(f, 0.1, 'square', 0.04), i * 70)), nope: () => beep(160, 0.3, 'triangle', 0.07, -60), shot: () => beep(700, 0.04, 'square', 0.015, -300), pop: () => beep(240, 0.12, 'sine', 0.04, -120), leak: () => beep(110, 0.4, 'sawtooth', 0.06, -50), wave: () => [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, 0.12, 'square', 0.04), i * 90)) };

    // The path (fractions of the board) and the build pads beside it.
    const PATH = [[-0.05, 0.24], [0.75, 0.24], [0.75, 0.45], [0.2, 0.45], [0.2, 0.75], [0.85, 0.75], [0.85, 1.05]];
    const PADS = [[0.3, 0.135], [0.55, 0.135], [0.88, 0.3], [0.6, 0.31], [0.36, 0.31], [0.07, 0.55], [0.45, 0.6], [0.7, 0.6], [0.4, 0.88], [0.68, 0.88]];
    const P = (p) => [p[0] * W, p[1] * H];
    const st = { gold: 150, lives: 10, wave: 0, score: 0, kills: 0, towers: [], enemies: [], shots: [], parts: [], floats: [], spawnLeft: 0, spawnT: 0, active: false, paused: false, over: false, modal: false, mistakes: [], right: 0, asked: 0, t: 0, shake: 0 };
    const segLen = () => { let L = 0; for (let i = 1; i < PATH.length; i++) { const [a, b] = [P(PATH[i - 1]), P(PATH[i])]; L += Math.hypot(b[0] - a[0], b[1] - a[1]); } return L; };
    function posAt(d) {
      for (let i = 1; i < PATH.length; i++) {
        const a = P(PATH[i - 1]), b = P(PATH[i]), L = Math.hypot(b[0] - a[0], b[1] - a[1]);
        if (d <= L) return [a[0] + ((b[0] - a[0]) * d) / L, a[1] + ((b[1] - a[1]) * d) / L];
        d -= L;
      }
      return P(PATH[PATH.length - 1]);
    }
    let msgT = null;
    function flash(big, small) { const m = $('ab-msg'); m.innerHTML = `<b>${big}</b>${small ? `<span>${small}</span>` : ''}`; m.classList.add('on'); clearTimeout(msgT); msgT = setTimeout(() => m.classList.remove('on'), 1500); }
    const float = (x, y, text, color) => st.floats.push({ x, y, text, color, life: 1.4 });
    const hud = () => { $('ab-banner').textContent = st.wave ? `Wave ${st.wave}${st.active ? '' : ' cleared'}` : 'Build your defense'; $('ab-score').textContent = `💰 ${st.gold}  ❤️ ${st.lives}  ⭐ ${st.score}`; };

    function sendWave() {
      if (st.active || st.over || st.modal) return;
      st.wave++; st.active = true; st.spawnLeft = 6 + st.wave * 2; st.spawnT = 0;
      st.hp = Math.round(16 * Math.pow(1.28, st.wave - 1)); st.speed = 34 + st.wave * 2.5;
      $('tw-go').disabled = true; $('tw-go').textContent = `Wave ${st.wave} incoming…`;
      flash(`WAVE ${st.wave}`, `${st.spawnLeft} robots`); sfx.wave(); hud();
    }
    $('tw-go').onclick = sendWave;

    // Building and upgrading: show the geometry problem; the answer decides.
    function ask(tier, cost, onRight) {
      st.modal = true; st.asked++;
      const p = makeProblem(tier);
      st.q = p;
      const m = $('tw-modal'); m.hidden = false;
      m.innerHTML = `<div class="tw-card"><div class="row spread"><b>${'⭐'.repeat(tier)} Solve to build (💰 ${cost})</b><button class="btn ghost small" id="tw-x">✕</button></div>
        ${p.svg}<p class="qtext" style="font-size:18px;margin:6px 0">${p.text}</p>
        <div class="tw-ch">${p.choices.map((c) => `<button class="btn ghost" data-c="${c}">${c}</button>`).join('')}</div><div id="tw-fb"></div></div>`;
      const close = () => { m.hidden = true; m.innerHTML = ''; st.modal = false; hud(); };
      $('tw-x').onclick = close;
      m.querySelectorAll('[data-c]').forEach((b) => (b.onclick = () => {
        m.querySelectorAll('[data-c]').forEach((x) => { x.disabled = true; if (x.dataset.c === p.answer) x.classList.add('go'); });
        if (b.dataset.c === p.answer) { st.right++; st.gold -= cost; sfx.build(); onRight(); setTimeout(close, 450); }
        else {
          const lost = Math.floor(cost / 2); st.gold -= lost; sfx.nope();
          st.mistakes.push({ text: p.text, answer: p.answer, why: p.why });
          $('tw-fb').innerHTML = `<p class="feedback bad" style="margin-top:8px">Not quite: −💰${lost}. The answer is <b>${p.answer}</b>: ${p.why}</p><button class="btn" id="tw-ok">OK</button>`;
          $('tw-ok').onclick = close;
        }
      }));
    }
    function tapPad(i) {
      if (st.over || st.modal || st.paused) return;
      const t = st.towers.find((x) => x.pad === i);
      const m = $('tw-modal');
      if (t) {
        if (t.level >= 3) return float(...P(PADS[i]), 'Max level!', '#ffd43b');
        const cost = Math.round(t.kind.cost * 0.8 * t.level);
        if (st.gold < cost) return float(...P(PADS[i]), `Need 💰${cost}`, '#ff8787');
        return ask(Math.min(3, t.kind.tier + t.level), cost, () => { t.level++; float(...P(PADS[i]), `${t.kind.emoji} Level ${t.level}!`, '#ffd43b'); });
      }
      st.modal = true; m.hidden = false;
      m.innerHTML = `<div class="tw-card"><div class="row spread"><b>Build a tower</b><button class="btn ghost small" id="tw-x">✕</button></div>
        <div class="tw-ch">${KINDS.map((k) => `<button class="btn ${st.gold >= k.cost ? '' : 'ghost'}" data-k="${k.id}" ${st.gold >= k.cost ? '' : 'disabled'}>${k.emoji} ${k.name}<br><small>💰${k.cost} · ${'⭐'.repeat(k.tier)} problem</small></button>`).join('')}</div></div>`;
      $('tw-x').onclick = () => { m.hidden = true; st.modal = false; };
      m.querySelectorAll('[data-k]').forEach((b) => (b.onclick = () => {
        const k = KINDS.find((x) => x.id === b.dataset.k);
        st.modal = false;
        ask(k.tier, k.cost, () => { st.towers.push({ pad: i, kind: k, level: 1, cd: 0, aim: 0 }); float(...P(PADS[i]), `${k.emoji} built!`, '#ffd43b'); });
      }));
    }
    cvs.addEventListener('pointerdown', (e) => {
      const r = cvs.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      const i = PADS.findIndex((p) => Math.hypot(p[0] * W - x, p[1] * H - y) < 26);
      if (i >= 0) tapPad(i);
    });
    const pause = () => { if (st.over) return; st.paused = !st.paused; $('ab-pause').textContent = st.paused ? '▶' : '⏸'; if (st.paused) flash('PAUSED', 'tap ▶ or press P'); };
    $('ab-pause').onclick = pause;
    const key = (e) => { if (e.key === 'p' || e.key === 'P') pause(); if (e.key === 'Enter' && !st.modal) sendWave(); };
    root.addEventListener('keydown', key);

    function end() {
      st.over = true; $('tw-go').disabled = true;
      flash('THE CASTLE FELL', `You reached wave ${st.wave}`);
      const acc = st.asked ? Math.round((100 * st.right) / st.asked) : 0;
      setTimeout(() => opts.onEnd && opts.onEnd({ game: 'towers', mission: 'castle', score: st.score, wave: st.wave, hits: st.right, shots: st.asked, accuracy: acc, bestCombo: st.towers.length, mistakes: st.mistakes.slice(-4), seconds: Math.round(st.t) }), 1500);
    }

    function update(dt) {
      st.t += dt;
      if (st.modal) return; // time stops while he thinks
      if (st.active) {
        st.spawnT -= dt;
        if (st.spawnLeft > 0 && st.spawnT <= 0) { st.enemies.push({ d: 0, hp: st.hp, max: st.hp, speed: st.speed * (0.9 + Math.random() * 0.2), wob: Math.random() * 6 }); st.spawnLeft--; st.spawnT = Math.max(0.45, 1.1 - st.wave * 0.04); }
        const L = segLen();
        for (const e of st.enemies) { e.d += e.speed * dt; e.wob += dt * 8; }
        for (const e of st.enemies.filter((q) => q.d >= L)) {
          st.enemies.splice(st.enemies.indexOf(e), 1); st.lives--; st.shake = 0.3; sfx.leak();
          if (st.lives <= 0 && !st.over) { end(); break; }
        }
        for (const t of st.towers) {
          t.cd -= dt;
          const [tx, ty] = P(PADS[t.pad]);
          const range = t.kind.range * (1 + 0.15 * (t.level - 1));
          let target = null;
          for (const e of st.enemies) { const [ex, ey] = posAt(e.d); if (Math.hypot(ex - tx, ey - ty) <= range && (!target || e.d > target.d)) target = e; }
          if (target && t.cd <= 0) {
            t.cd = t.kind.rate; const [ex, ey] = posAt(target.d); t.aim = Math.atan2(ey - ty, ex - tx);
            target.hp -= t.kind.dmg * (1 + 0.6 * (t.level - 1));
            st.shots.push({ x1: tx, y1: ty, x2: ex, y2: ey, life: 0.12, color: t.kind.color, w: t.kind.id === 'cannon' ? 6 : 3 });
            sfx.shot();
          }
        }
        for (const e of st.enemies.filter((q) => q.hp <= 0)) {
          const [ex, ey] = posAt(e.d);
          st.enemies.splice(st.enemies.indexOf(e), 1); st.kills++; st.gold += 8; st.score += 10; sfx.pop();
          for (let i = 0; i < 14; i++) { const a = Math.random() * Math.PI * 2; st.parts.push({ x: ex, y: ey, vx: Math.cos(a) * 120, vy: Math.sin(a) * 120, life: 0.5, color: '#b2f2bb' }); }
          float(ex, ey - 10, '+💰8', '#ffd43b');
        }
        if (!st.over && st.spawnLeft === 0 && st.enemies.length === 0) {
          st.active = false; const bonus = 40 + st.wave * 10; st.gold += bonus; st.score += 200 * st.wave;
          flash(`WAVE ${st.wave} CLEARED`, `+💰${bonus}`);
          $('tw-go').disabled = false; $('tw-go').textContent = `▶ Send wave ${st.wave + 1}`;
        }
      }
      for (const s of st.shots) s.life -= dt; st.shots = st.shots.filter((s) => s.life > 0);
      for (const p of st.parts) { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; } st.parts = st.parts.filter((p) => p.life > 0);
      st.floats.forEach((f) => { f.y -= 24 * dt; f.life -= dt; }); st.floats = st.floats.filter((f) => f.life > 0);
      st.shake = Math.max(0, st.shake - dt);
    }
    function draw() {
      ctx.save();
      if (st.shake > 0) ctx.translate((Math.random() - 0.5) * 12 * st.shake, (Math.random() - 0.5) * 12 * st.shake);
      ctx.fillStyle = '#5c940d'; ctx.fillRect(-10, -10, W + 20, H + 20);
      ctx.fillStyle = 'rgba(0,0,0,.06)'; for (let i = 0; i < 40; i++) ctx.fillRect((i * 97) % W, (i * 53) % H, 6, 6);
      // path
      ctx.strokeStyle = '#d9a066'; ctx.lineWidth = 34; ctx.lineJoin = 'round'; ctx.beginPath();
      PATH.forEach((p, i) => { const [x, y] = P(p); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke();
      ctx.strokeStyle = 'rgba(0,0,0,.12)'; ctx.lineWidth = 2; ctx.setLineDash([6, 10]); ctx.stroke(); ctx.setLineDash([]);
      // castle
      const [cx, cy] = P([0.85, 0.96]);
      ctx.fillStyle = '#868e96'; ctx.fillRect(cx - 30, cy - 34, 60, 34); for (let i = 0; i < 4; i++) ctx.fillRect(cx - 30 + i * 17, cy - 44, 9, 10);
      ctx.font = '20px system-ui'; ctx.textAlign = 'center'; ctx.fillText('🏰', cx, cy - 12);
      // pads and towers
      PADS.forEach((p, i) => {
        const [x, y] = P(p), t = st.towers.find((q) => q.pad === i);
        if (!t) { ctx.fillStyle = '#8d6e63'; ctx.strokeStyle = '#ffe8cc'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 18, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#ffe8cc'; ctx.font = '800 18px system-ui'; ctx.textBaseline = 'middle'; ctx.fillText('+', x, y + 1); return; }
        ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.beginPath(); ctx.arc(x, y, t.kind.range * (1 + 0.15 * (t.level - 1)), 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#343a40'; ctx.beginPath(); ctx.arc(x, y, 19, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = t.kind.color; ctx.lineWidth = 3; ctx.stroke();
        ctx.font = '20px system-ui'; ctx.textBaseline = 'middle'; ctx.fillText(t.kind.emoji, x, y + 1);
        ctx.fillStyle = '#ffd43b'; ctx.font = '800 10px system-ui'; ctx.fillText('★'.repeat(t.level), x, y + 26);
      });
      // enemies
      for (const e of st.enemies) {
        const [x, y] = posAt(e.d), bob = Math.sin(e.wob) * 2;
        ctx.fillStyle = '#9775fa'; ctx.beginPath(); ctx.arc(x, y + bob, 11, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.fillRect(x - 6, y - 4 + bob, 4, 4); ctx.fillRect(x + 2, y - 4 + bob, 4, 4);
        ctx.fillStyle = '#000'; ctx.fillRect(x - 12, y - 20, 24, 4); ctx.fillStyle = '#51cf66'; ctx.fillRect(x - 12, y - 20, 24 * Math.max(0, e.hp / e.max), 4);
      }
      for (const s of st.shots) { ctx.strokeStyle = s.color; ctx.globalAlpha = s.life * 8; ctx.lineWidth = s.w; ctx.beginPath(); ctx.moveTo(s.x1, s.y1); ctx.lineTo(s.x2, s.y2); ctx.stroke(); }
      ctx.globalAlpha = 1;
      for (const p of st.parts) { ctx.globalAlpha = Math.max(0, p.life * 2); ctx.fillStyle = p.color; ctx.fillRect(p.x - 2, p.y - 2, 4, 4); }
      ctx.globalAlpha = 1;
      for (const f of st.floats) { ctx.globalAlpha = Math.min(1, f.life); ctx.fillStyle = f.color; ctx.font = '800 14px system-ui'; ctx.textAlign = 'center'; ctx.fillText(f.text, f.x, f.y - 24); }
      ctx.globalAlpha = 1;
      if (st.over) { ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(0, 0, W, H); }
      ctx.restore();
    }

    let last = performance.now(), raf = 0, stopped = false;
    function frame(now) {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (!st.paused) update(dt);
      draw(); hud();
      if (!stopped) raf = requestAnimationFrame(frame);
    }
    const stop = () => { stopped = true; cancelAnimationFrame(raf); root.removeEventListener('resize', fit); root.removeEventListener('keydown', key); clearTimeout(msgT); };
    host.abState = st; host.tapPad = tapPad; // lets automated tests play
    hud();
    raf = requestAnimationFrame(frame);
    return { stop, state: st };
  }

  Object.assign(root.Arcade = root.Arcade || {}, { TOWER_RULES, TOWER_TIERS: TIERS, TOWER_KINDS: KINDS, startTowers });
})(typeof window !== 'undefined' ? window : globalThis);
