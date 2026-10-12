// Shared building blocks for question generators: answer specs and display helpers.

import { gcd, frac, simplifyRadical } from './mathutil.js';

export const N = (value) => ({ kind: 'num', value });
export const F = (n, d = 1) => { const f = frac(n, d); return { kind: 'frac', n: f.n, d: f.d }; };
export const PI = (n, d = 1) => { const f = frac(n, d); return { kind: 'pi', n: f.n, d: f.d }; };
// a√b / d, simplified
export function RAD(a, b, d = 1) {
  const s = simplifyRadical(b);
  const coef = a * s.a;
  const g = gcd(coef, d);
  return { kind: 'radical', a: coef / g, b: s.b, d: d / g };
}
// Pretty fraction for question/solution text
export const fr = (n, d) => (d === 1 ? `${n}` : `<span class="fr"><span>${n}</span><span>${d}</span></span>`);
export const frf = (f) => fr(f.n, f.d);
export const money = (x) => `$${x.toFixed(2)}`;
export const COMMON = 'common fraction';
