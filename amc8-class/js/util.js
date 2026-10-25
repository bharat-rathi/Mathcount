// Small math + randomness helpers shared by every topic. Plain script (no modules) so the
// app also works when index.html is opened straight from disk.
(function (root) {
  const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
  const lcm = (a, b) => (a / gcd(a, b)) * b;
  const fact = (n) => (n <= 1 ? 1 : n * fact(n - 1));
  const choose = (n, k) => (k < 0 || k > n ? 0 : Math.round(fact(n) / (fact(k) * fact(n - k))));

  // "a/b" in lowest terms; whole numbers print without a denominator.
  const frac = (n, d) => {
    if (d < 0) { n = -n; d = -d; }
    const g = gcd(n, d) || 1;
    n /= g; d /= g;
    return d === 1 ? String(n) : `${n}/${d}`;
  };

  // k√m with the largest square pulled out.
  const surd = (n) => {
    let out = 1, inside = n;
    for (let f = 2; f * f <= inside; f++) while (inside % (f * f) === 0) { out *= f; inside /= f * f; }
    if (inside === 1) return String(out);
    return (out === 1 ? '' : out) + '√' + inside;
  };

  // "a + bπ" style strings for circle answers.
  const piStr = (k) => (k === 1 ? 'π' : k === -1 ? '-π' : `${k}π`);

  const divisors = (n) => { const out = []; for (let i = 1; i <= n; i++) if (n % i === 0) out.push(i); return out; };
  const isPrime = (n) => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };
  const ordinal = (n) => n + (['th', 'st', 'nd', 'rd'][(n % 100 - 20) % 10] || ['th', 'st', 'nd', 'rd'][n % 100] || 'th');

  // Five AMC-style answer choices (A–E). `wrong` should hold the classic mistakes first;
  // numeric answers are topped up with nearby values so there are always five distinct options.
  function makeChoices(answer, wrong = []) {
    const seen = new Set([String(answer)]);
    const pool = [];
    const num = Number(answer);
    for (const w of wrong) {
      const s = String(w);
      if (seen.has(s) || s === 'NaN' || s === 'undefined') continue;
      // A whole, non-negative answer gets whole, non-negative wrong choices too.
      if (Number.isInteger(num) && Number.isFinite(Number(s)) && (!Number.isInteger(Number(s)) || (num >= 0 && Number(s) < 0))) continue;
      seen.add(s); pool.push(s);
    }
    if (Number.isFinite(num)) {
      const step = Math.max(1, Math.round(Math.abs(num) / 10));
      for (const delta of [1, -1, 2, -2, 3, -3, 5, -5, 10]) {
        if (pool.length >= 4) break;
        const s = String(num + delta * step);
        if (!seen.has(s) && num + delta * step >= 0) { seen.add(s); pool.push(s); }
      }
    }
    // Non-numeric answers (3/4, 6√2, 16π, (2, 3), 4 : 9): nudge one of the numbers inside.
    const str = String(answer);
    const nums = [...str.matchAll(/\d+/g)];
    const tidy = (s) => {
      let m = s.match(/^(-?\d+)\/(\d+)$/);
      if (m) return frac(+m[1], +m[2]);
      m = s.match(/^(\d+) : (\d+)$/);
      if (m) { const g = gcd(+m[1], +m[2]) || 1; return `${m[1] / g} : ${m[2] / g}`; }
      return s;
    };
    const variants = [];
    for (const delta of [1, -1, 2, 3, -2, 4]) {
      nums.forEach((m, i) => {
        const v = Number(m[0]) + delta;
        if (v > 0) variants.push(str.slice(0, m.index) + v + str.slice(m.index + m[0].length));
      });
      if (!nums.length) variants.push(`${delta + 2}${str}`);
    }
    for (const v of variants) {
      if (pool.length >= 4) break;
      const s = tidy(v);
      if (!seen.has(s)) { seen.add(s); pool.push(s); }
    }
    let n = 1;
    while (pool.length < 4) { const s = `${answer} ${'+'.repeat(n++)}`; pool.push(s); }
    const list = [String(answer), ...pool.slice(0, 4)];
    // AMC lists numeric choices in increasing order; keep that habit.
    const allNum = list.every((s) => Number.isFinite(Number(s)));
    return allNum ? list.sort((a, b) => Number(a) - Number(b)) : shuffle(list);
  }

  root.U = { R, pick, shuffle, gcd, lcm, fact, choose, frac, surd, piStr, divisors, isPrime, ordinal, makeChoices };
})(typeof window !== 'undefined' ? window : globalThis);
