// Small math helpers shared by the question generators and the answer checker.
// Everything here is pure and works in both the browser and Node (for tests).

// Seeded PRNG (mulberry32) so a question can be regenerated exactly from its seed.
export function makeRng(seed) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (lo, hi) => lo + Math.floor(next() * (hi - lo + 1)),
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    chance: (p) => next() < p,
    shuffle: (arr) => {
      const out = arr.slice();
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
      }
      return out;
    },
  };
}

export function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

export const lcm = (a, b) => (a / gcd(a, b)) * b;

// Reduced fraction {n, d} with d > 0.
export function frac(n, d = 1) {
  if (d === 0) throw new Error('zero denominator');
  if (d < 0) { n = -n; d = -d; }
  const g = gcd(n, d) || 1;
  return { n: n / g, d: d / g };
}

export const fracAdd = (a, b) => frac(a.n * b.d + b.n * a.d, a.d * b.d);
export const fracSub = (a, b) => frac(a.n * b.d - b.n * a.d, a.d * b.d);
export const fracMul = (a, b) => frac(a.n * b.n, a.d * b.d);
export const fracDiv = (a, b) => frac(a.n * b.d, a.d * b.n);

export function fracStr(f) {
  return f.d === 1 ? String(f.n) : `${f.n}/${f.d}`;
}

export function factorize(n) {
  const out = [];
  let p = 2;
  while (n > 1 && p * p <= n) {
    let e = 0;
    while (n % p === 0) { n /= p; e++; }
    if (e) out.push([p, e]);
    p++;
  }
  if (n > 1) out.push([n, 1]);
  return out;
}

export function factorStr(n) {
  return factorize(n)
    .map(([p, e]) => (e === 1 ? `${p}` : `${p}<sup>${e}</sup>`))
    .join(' × ');
}

export function isPrime(n) {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
  return true;
}

export function choose(n, k) {
  if (k < 0 || k > n) return 0;
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
  return Math.round(r);
}

export function fact(n) {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

// Split √n into a√b with b square-free.
export function simplifyRadical(n) {
  let a = 1;
  let b = n;
  for (let i = 2; i * i <= b; i++) {
    while (b % (i * i) === 0) { b /= i * i; a *= i; }
  }
  return { a, b };
}

export function radicalStr(coef, rad) {
  if (rad === 1) return String(coef);
  return `${coef === 1 ? '' : coef}√${rad}`;
}

export function piStr(f) {
  // f is the coefficient of π as a fraction
  const top = f.n === 1 ? 'π' : f.n === -1 ? '-π' : `${f.n}π`;
  return f.d === 1 ? top : `${top}/${f.d}`;
}

export function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export const fmt = (n) => n.toLocaleString('en-US');
