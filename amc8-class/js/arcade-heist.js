// 🎮 Arcade: Probability Heist. Sneak up a vault tower floor by floor before the security
// sweep catches you. Vault floors: three vaults, each guarded by a chance game (a marble bag,
// a spinner, dice, coins). Crack the one with the BEST odds. Lock floors: work out how many
// codes or arrangements are possible. A wrong pick or running out of time costs a 🎭 disguise
// and shows every vault's odds, so each mistake teaches the comparison.
// Makers (Arcade.HEIST_RULES) are pure; vault options carry their raw counts so tests can
// recount them, and lock problems carry `expr`, an independent formula.
(function (root) {
  const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  const fr = (g, t) => { const d = gcd(g, t); return `${g / d}/${t / d}`; };
  const fact = (n) => (n <= 1 ? 1 : n * fact(n - 1));
  const C = (n, k) => fact(n) / (fact(k) * fact(n - k));

  // One chance game. Returns { kind, label, pic, good, total, params }.
  function vaultOption(level) {
    const kinds = ['bag', 'spinner', 'die'].concat(level >= 2 ? ['coins'] : [], level >= 3 ? ['dice2'] : []);
    const kind = pick(kinds);
    if (kind === 'bag') {
      const n = R(4, level < 3 ? 8 : 12), g = R(1, n - 1);
      const dots = [...Array(n)].map((_, i) => `<i class="hb-dot ${i < g ? 'gold' : ''}"></i>`).sort(() => Math.random() - 0.5).join('');
      return { kind, label: `Draw a <b>gold</b> marble from the bag`, pic: `<div class="hb-bag">${dots}</div>`, good: g, total: n, params: { g, n } };
    }
    if (kind === 'spinner') {
      const n = pick([4, 5, 6, 8, 10]), g = R(1, n - 1);
      const stops = [...Array(n)].map((_, i) => `${i < g ? '#fcc419' : '#495057'} ${(i * 360) / n}deg ${((i + 1) * 360) / n}deg`).join(',');
      return { kind, label: `Spin and land on <b>gold</b> (${n} equal parts)`, pic: `<div class="hb-spin" style="background:conic-gradient(${stops})"></div>`, good: g, total: n, params: { g, n } };
    }
    if (kind === 'die') {
      const t = pick(['atleast', 'even', 'prime', 'mult3']);
      if (t === 'atleast') { const k = R(2, 6); return { kind, label: `Roll a die: get <b>${k} or more</b>`, pic: '<div class="hb-big">🎲</div>', good: 7 - k, total: 6, params: { t, k } }; }
      const good = { even: 3, prime: 3, mult3: 2 }[t];
      return { kind, label: `Roll a die: get ${{ even: 'an <b>even</b> number', prime: 'a <b>prime</b> number', mult3: 'a <b>multiple of 3</b>' }[t]}`, pic: '<div class="hb-big">🎲</div>', good, total: 6, params: { t } };
    }
    if (kind === 'coins') {
      const n = R(2, 3), t = pick(['all', 'atleast1', 'exactly1']);
      const good = t === 'all' ? 1 : t === 'atleast1' ? 2 ** n - 1 : n;
      return { kind, label: `Flip ${n} coins: ${{ all: '<b>all heads</b>', atleast1: '<b>at least one</b> head', exactly1: '<b>exactly one</b> head' }[t]}`, pic: `<div class="hb-big">${'🪙'.repeat(n)}</div>`, good, total: 2 ** n, params: { n, t } };
    }
    const s = R(4, 10), good = 6 - Math.abs(7 - s);
    return { kind, label: `Roll two dice: the sum is <b>${s}</b>`, pic: '<div class="hb-big">🎲🎲</div>', good, total: 36, params: { s } };
  }

  const HEIST_RULES = {
    // Three vaults with different odds; the answer is the one with the best chance.
    vaults(level) {
      for (;;) {
        const opts = [vaultOption(level), vaultOption(level), vaultOption(level)];
        const v = opts.map((o) => o.good / o.total);
        if (new Set(v.map((x) => x.toFixed(9))).size < 3) continue;
        const best = v.indexOf(Math.max(...v));
        // Make it a real decision: the best and second best can't be miles apart at higher levels.
        const sorted = v.slice().sort((a, b) => b - a);
        if (level >= 3 && sorted[0] - sorted[1] > 0.25) continue;
        return { type: 'vaults', options: opts, answer: best, why: opts.map((o, i) => `Vault ${'ABC'[i]}: ${o.good}/${o.total}${o.good / o.total === o.good / o.total && gcd(o.good, o.total) > 1 ? ` = ${fr(o.good, o.total)}` : ''} ≈ ${Math.round((100 * o.good) / o.total)}%`).join(' · ') };
      }
    },
    // How many codes / arrangements? Four choices; the wrong ones are the classic mix-ups.
    lock(level) {
      const forms = [
        () => { const k = R(3, 6), n = R(2, 3); return { text: `A lock uses <b>${n}</b> buttons in a row, each one of <b>${k}</b> colors (repeats allowed). How many codes?`, answer: k ** n, expr: `${k} ** ${n}`, wrong: [k * n, k + n, C(k + n - 1, n) || k * n + 1], why: `${n} spots, ${k} choices each: ${Array(n).fill(k).join(' × ')} = ${k ** n}` }; },
        () => { const k = R(5, 9), n = 3, a = k * (k - 1) * (k - 2); return { text: `A code uses <b>3 different</b> digits picked from ${k} digits. How many codes?`, answer: a, expr: `${k} * ${k - 1} * ${k - 2}`, wrong: [k ** 3, C(k, 3), 3 * k], why: `${k} choices, then ${k - 1}, then ${k - 2}: ${a}` }; },
        () => { const n = R(4, 6); return { text: `How many ways can <b>${n}</b> guards stand in a line?`, answer: fact(n), expr: `${fact(n)}`, wrong: [n * n, fact(n - 1), 2 ** n], why: `${[...Array(n)].map((_, i) => n - i).join(' × ')} = ${fact(n)}` }; },
        () => { const n = R(5, 9), k = pick([2, 3]); return { text: `Pick a crew of <b>${k}</b> from <b>${n}</b> thieves (order doesn't matter). How many crews?`, answer: C(n, k), expr: `${C(n, k)}`, wrong: [fact(n) / fact(n - k), n * k, C(n, k) * 2], why: `${fact(n) / fact(n - k)} ordered picks ÷ ${fact(k)} orders of the same crew = ${C(n, k)}` }; },
        () => { const a = R(2, 4), b = R(2, 4); return { text: `Sneak through a ${a} × ${b} grid of halls moving only right or down. How many routes?`, answer: C(a + b, a), expr: `${C(a + b, a)}`, wrong: [a * b, 2 ** (a + b), a + b], why: `${a + b} moves, choose which ${a} go right: C(${a + b}, ${a}) = ${C(a + b, a)}` }; },
        () => { const n = 3; return { text: `How many 3-digit codes (000–999) have <b>at least one 7</b>?`, answer: 1000 - 729, expr: '1000 - 9 ** 3', wrong: [300, 3 * 100, 729], why: `all codes 1000, minus codes with no 7: 9 × 9 × 9 = 729 → ${1000 - 729}` }; },
      ];
      const f = forms[Math.min(forms.length - 1, R(0, Math.min(forms.length - 1, level)))]();
      const ch = [f.answer];
      for (const w of [...f.wrong, f.answer + 1, f.answer * 2, f.answer - 1]) if (w > 0 && Number.isInteger(w) && !ch.includes(w)) { ch.push(w); if (ch.length === 4) break; }
      return { type: 'lock', ...f, choices: ch.sort(() => Math.random() - 0.5) };
    },
  };

  function startHeist(host, opts = {}) {
    host.innerHTML = `<div class="hb">
      <div class="hb-hud"><span id="hb-floor"></span><span id="hb-loot"></span><span id="hb-lives"></span></div>
      <canvas id="hb-cv"></canvas>
      <div class="hb-timer"><i id="hb-t"></i></div>
      <div id="hb-stage"></div>
      <div class="ab-msg" id="ab-msg"></div></div>`;
    const $ = (id) => host.querySelector('#' + id);
    const cvs = $('hb-cv'), ctx = cvs.getContext('2d');
    let W = 0; const H = 110;
    const fit = () => { const dpr = Math.min(2, root.devicePixelRatio || 1); W = host.clientWidth; cvs.width = W * dpr; cvs.height = H * dpr; cvs.style.height = H + 'px'; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
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
    const sfx = { crack: () => [523, 659, 784, 1047, 1319].forEach((f, i) => setTimeout(() => beep(f, 0.09, 'square', 0.04), i * 60)), alarm: () => [880, 660, 880, 660].forEach((f, i) => setTimeout(() => beep(f, 0.14, 'sawtooth', 0.05), i * 150)), tick: () => beep(1200, 0.03, 'square', 0.02) };

    const st = { floor: 0, loot: 0, lives: 3, streak: 0, best: 0, right: 0, asked: 0, left: 0, limit: 0, busy: false, over: false, mistakes: [], t: 0, q: null };
    const hud = () => { $('hb-floor').textContent = `🏢 Floor ${st.floor}`; $('hb-loot').textContent = `💰 $${st.loot.toLocaleString()}`; $('hb-lives').textContent = '🎭'.repeat(Math.max(0, st.lives)); };
    let msgT = null;
    function flash(big, small) { const m = $('ab-msg'); m.innerHTML = `<b>${big}</b>${small ? `<span>${small}</span>` : ''}`; m.classList.add('on'); clearTimeout(msgT); msgT = setTimeout(() => m.classList.remove('on'), 1400); }

    function nextFloor() {
      if (st.over) return;
      st.floor++; st.busy = false;
      const level = Math.min(5, 1 + Math.floor((st.floor - 1) / 3));
      st.limit = Math.max(14, 32 - st.floor); st.left = st.limit;
      const vault = st.floor % 3 !== 0; // every third floor is a lock
      const q = (st.q = vault ? HEIST_RULES.vaults(level) : HEIST_RULES.lock(level));
      st.asked++;
      $('hb-stage').innerHTML = vault
        ? `<p class="hb-ask">🔍 Crack the vault with the <b>BEST odds</b>:</p><div class="hb-vaults">${q.options.map((o, i) => `<button class="hb-vault" data-i="${i}"><span class="hb-door">🔒 ${'ABC'[i]}</span>${o.pic}<span class="hb-lbl">${o.label}</span></button>`).join('')}</div>`
        : `<p class="hb-ask">🔐 Lock floor: ${q.text}</p><div class="tw-ch">${q.choices.map((c) => `<button class="btn ghost" data-c="${c}">${c}</button>`).join('')}</div>`;
      host.querySelectorAll('[data-i]').forEach((b) => (b.onclick = () => choose(+b.dataset.i, b)));
      host.querySelectorAll('[data-c]').forEach((b) => (b.onclick = () => choose(+b.dataset.c, b)));
      flash(`FLOOR ${st.floor}`, vault ? 'Which vault gives you the best chance?' : 'Count the codes to open the lock');
      hud();
    }
    function choose(v, btn) {
      if (st.busy || st.over) return;
      st.busy = true;
      const q = st.q, ok = v === q.answer;
      host.querySelectorAll('[data-i],[data-c]').forEach((b) => (b.disabled = true));
      if (q.type === 'vaults') host.querySelectorAll('[data-i]').forEach((b) => { const o = q.options[+b.dataset.i]; b.querySelector('.hb-door').textContent = `${+b.dataset.i === q.answer ? '🔓' : '🔒'} ${Math.round((100 * o.good) / o.total)}%`; if (+b.dataset.i === q.answer) b.classList.add('open'); });
      else host.querySelectorAll('[data-c]').forEach((b) => { if (+b.dataset.c === q.answer) b.classList.add('go'); });
      if (ok) {
        st.right++; st.streak++; st.best = Math.max(st.best, st.streak);
        const bonus = Math.round((st.left / st.limit) * 500), take = 1000 * st.floor + bonus + (st.streak >= 3 ? 500 : 0);
        st.loot += take; sfx.crack(); flash('CRACKED! 💰', `+$${take.toLocaleString()}${st.streak >= 3 ? ' · 🔥 streak bonus' : ''}`);
        burst('#ffd43b');
      } else {
        st.streak = 0; st.lives--; sfx.alarm(); alarmT = 1.2;
        if (btn) btn.classList.add('wrong');
        st.mistakes.push({ text: q.type === 'vaults' ? 'Which vault had the best odds?' : q.text.replace(/<[^>]+>/g, ''), answer: q.type === 'vaults' ? `Vault ${'ABC'[q.answer]}` : String(q.answer), why: q.why });
        flash(v === -1 ? '⏰ TOO SLOW' : '🚨 ALARM!', q.type === 'vaults' ? `Best was vault ${'ABC'[q.answer]}` : `It was ${q.answer}`);
        const why = document.createElement('p'); why.className = 'feedback bad'; why.style.marginTop = '8px'; why.textContent = q.why; $('hb-stage').appendChild(why);
      }
      hud();
      if (st.lives <= 0) return end();
      const nx = document.createElement('button'); nx.className = 'btn big go'; nx.style.marginTop = '10px'; nx.textContent = 'Next floor ▲'; nx.id = 'hb-next';
      nx.onclick = nextFloor; $('hb-stage').appendChild(nx);
    }
    function end() {
      st.over = true;
      flash('BUSTED!', `Escaped with $${st.loot.toLocaleString()}`);
      setTimeout(() => opts.onEnd && opts.onEnd({ game: 'heist', mission: 'tower', score: st.loot, wave: st.floor, hits: st.right, shots: st.asked, accuracy: st.asked ? Math.round((100 * st.right) / st.asked) : 0, bestCombo: st.best, mistakes: st.mistakes.slice(-4), seconds: Math.round(st.t) }), 1800);
    }
    const key = (e) => {
      if (st.busy && e.key === 'Enter' && $('hb-next')) return nextFloor();
      const i = 'abc'.indexOf(e.key.toLowerCase());
      if (!st.busy && st.q && st.q.type === 'vaults' && i >= 0) choose(i, host.querySelector(`[data-i="${i}"]`));
    };
    root.addEventListener('keydown', key);

    // The laser corridor: sweeping beams, a sneaking thief, flashing red on an alarm.
    let alarmT = 0, sparkle = [];
    function burst(color) { for (let i = 0; i < 30; i++) sparkle.push({ x: W / 2, y: H / 2, vx: (Math.random() - 0.5) * 300, vy: (Math.random() - 0.5) * 200, life: 0.8, color }); }
    function draw(dt) {
      ctx.fillStyle = alarmT > 0 && Math.floor(alarmT * 8) % 2 ? '#5c0b0b' : '#0f1a2b'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#1c2a3f'; for (let x = 0; x < W; x += 40) ctx.fillRect(x, 0, 2, H);
      for (let i = 0; i < 3; i++) {
        const x = (W / 2) + Math.sin(st.t * (0.8 + i * 0.35) + i * 2) * W * 0.42;
        ctx.strokeStyle = 'rgba(255,60,60,.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + Math.sin(st.t + i) * 40, H); ctx.stroke();
      }
      const tx = 20 + ((st.floor % 5) / 5) * (W - 60) + Math.sin(st.t * 3) * 3;
      ctx.font = '30px system-ui'; ctx.textBaseline = 'middle'; ctx.fillText('🥷', tx, H / 2 + Math.abs(Math.sin(st.t * 6)) * -4);
      ctx.fillText('💎', W - 40, H / 2);
      for (const p of sparkle) { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; ctx.globalAlpha = Math.max(0, p.life); ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, 4, 4); }
      ctx.globalAlpha = 1; sparkle = sparkle.filter((p) => p.life > 0);
    }

    let last = performance.now(), raf = 0, stopped = false, lastSec = 0;
    function frame(now) {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      st.t += dt; alarmT = Math.max(0, alarmT - dt);
      if (!st.busy && !st.over && st.q) {
        st.left = Math.max(0, st.left - dt);
        if (st.left <= 5 && Math.ceil(st.left) !== lastSec) { lastSec = Math.ceil(st.left); sfx.tick(); }
        if (st.left <= 0) choose(-1, null);
      }
      $('hb-t').style.width = `${(100 * st.left) / (st.limit || 1)}%`;
      $('hb-t').style.background = st.left <= 5 ? '#fa5252' : '#fcc419';
      draw(dt);
      if (!stopped) raf = requestAnimationFrame(frame);
    }
    const stop = () => { stopped = true; cancelAnimationFrame(raf); root.removeEventListener('resize', fit); root.removeEventListener('keydown', key); clearTimeout(msgT); };
    host.abState = st; // lets automated tests play
    nextFloor();
    raf = requestAnimationFrame(frame);
    return { stop, state: st };
  }

  Object.assign(root.Arcade = root.Arcade || {}, { HEIST_RULES, startHeist });
})(typeof window !== 'undefined' ? window : globalThis);
