// Answer parsing and checking, following the MATHCOUNTS "Forms of Answers" rules:
// fractions must be common fractions in lowest terms, radicals must be simplified,
// answers "in terms of π" must keep π exact.
//
// Expected answers ("specs") look like:
//   { kind: 'num', value: 42 }                 integer or decimal
//   { kind: 'frac', n: 3, d: 4 }               common fraction (d === 1 means integer)
//   { kind: 'radical', a: 6, b: 5, d: 1 }      a√b / d
//   { kind: 'pi', n: 16, d: 1 }                (n/d)π
//   { kind: 'text', value: 'Friday' }

import { gcd, simplifyRadical, frac } from './mathutil.js';

export function specValue(spec) {
  switch (spec.kind) {
    case 'num': return spec.value;
    case 'frac': return spec.n / spec.d;
    case 'radical': return (spec.a * Math.sqrt(spec.b)) / (spec.d || 1);
    case 'pi': return (spec.n / spec.d) * Math.PI;
    default: return NaN;
  }
}

export function specToString(spec) {
  switch (spec.kind) {
    case 'num': return String(spec.value);
    case 'frac': return spec.d === 1 ? String(spec.n) : `${spec.n}/${spec.d}`;
    case 'radical': {
      const d = spec.d || 1;
      if (spec.b === 1) return d === 1 ? String(spec.a) : `${spec.a}/${d}`;
      const top = `${spec.a === 1 ? '' : spec.a === -1 ? '-' : spec.a}√${spec.b}`;
      return d === 1 ? top : `${top}/${d}`;
    }
    case 'pi': {
      const top = spec.n === 1 ? 'π' : spec.n === -1 ? '-π' : `${spec.n}π`;
      return spec.d === 1 ? top : `${top}/${spec.d}`;
    }
    case 'text': return spec.value;
    default: return '?';
  }
}

function normalize(raw) {
  return String(raw)
    .trim()
    .toLowerCase()
    .replace(/[−–—]/g, '-')
    .replace(/÷/g, '/')
    .replace(/\$/g, '')
    .replace(/(\d),(\d{3})/g, '$1$2')
    .replace(/(\d),(\d{3})/g, '$1$2')
    .replace(/square\s*root\s*(of)?|sqrt|root|rt/g, '√')
    .replace(/pi/g, 'π');
}

// Turn what the student typed into a value plus a description of its form.
export function parseAnswer(raw) {
  const s0 = normalize(raw);
  if (!s0) return null;

  // Mixed number "1 2/3" (needs the space, so check before stripping spaces)
  let m = s0.match(/^(-?)(\d+)\s+(\d+)\/(\d+)$/);
  if (m) {
    const whole = +m[2], n = +m[3], d = +m[4];
    if (d === 0) return null;
    const sign = m[1] ? -1 : 1;
    return { value: sign * (whole + n / d), form: 'mixed' };
  }

  const s = s0.replace(/\s+/g, '').replace(/[()]/g, '').replace(/\*/g, '');

  // Integer / decimal
  if (/^-?(\d+\.?\d*|\.\d+)$/.test(s)) {
    const isInt = /^-?\d+$/.test(s);
    return { value: parseFloat(s), form: isInt ? 'int' : 'dec' };
  }

  // Fraction a/b (possibly decimal parts, which we flag)
  m = s.match(/^(-?)(\d+\.?\d*)\/(-?)(\d+\.?\d*)$/);
  if (m) {
    const n = parseFloat(m[2]), d = parseFloat(m[4]);
    if (d === 0) return null;
    const neg = (m[1] ? 1 : 0) ^ (m[3] ? 1 : 0);
    const value = (neg ? -1 : 1) * (n / d);
    const intParts = Number.isInteger(n) && Number.isInteger(d);
    const simplified = intParts && gcd(n, d) === 1 && d !== 1;
    return { value, form: 'frac', simplified, intParts, n, d };
  }

  // π forms: π, 3π, -2π, π/4, 3π/4, 3/4π
  m = s.match(/^(-?)(\d*)π(?:\/(\d+))?$/) || null;
  if (m) {
    const n = m[2] === '' ? 1 : +m[2];
    const d = m[3] ? +m[3] : 1;
    if (d === 0) return null;
    const sign = m[1] ? -1 : 1;
    return { value: (sign * n * Math.PI) / d, form: 'pi', simplified: gcd(n, d) === 1, n, d };
  }
  m = s.match(/^(-?)(\d+)\/(\d+)π$/);
  if (m) {
    const n = +m[2], d = +m[3];
    if (d === 0) return null;
    const sign = m[1] ? -1 : 1;
    return { value: (sign * n * Math.PI) / d, form: 'pi', simplified: gcd(n, d) === 1, n, d };
  }

  // Radical forms: √b, a√b, a√b/d
  m = s.match(/^(-?)(\d*)√(\d+)(?:\/(\d+))?$/);
  if (m) {
    const a = m[2] === '' ? 1 : +m[2];
    const b = +m[3];
    const d = m[4] ? +m[4] : 1;
    if (d === 0) return null;
    const sign = m[1] ? -1 : 1;
    const r = simplifyRadical(b);
    const simplified = r.a === 1 && b !== 1 && gcd(a, d) === 1;
    return { value: (sign * a * Math.sqrt(b)) / d, form: 'radical', simplified, a, b, d };
  }

  return null;
}

const close = (x, y) => Math.abs(x - y) <= 1e-9 * Math.max(1, Math.abs(x), Math.abs(y));

// Returns { correct, parsed, formIssue } where formIssue explains a right value
// written in a form MATHCOUNTS would not accept.
export function checkAnswer(raw, spec) {
  if (spec.kind === 'text') {
    const t = String(raw).trim().toLowerCase();
    const accepted = [spec.value, ...(spec.accept || [])].map((x) => x.toLowerCase());
    return { correct: accepted.includes(t), parsed: null };
  }

  const parsed = parseAnswer(raw);
  if (!parsed) {
    return { correct: false, parsed: null, unreadable: true };
  }
  const target = specValue(spec);

  if (spec.kind === 'num') {
    if (close(parsed.value, target)) {
      if (parsed.form === 'frac' || parsed.form === 'mixed') {
        return { correct: false, parsed, formIssue: `Right value! But write whole numbers and decimals as plain numbers, like ${specToString(spec)}.` };
      }
      return { correct: true, parsed };
    }
    if (spec.places != null && parsed.form !== 'frac') {
      // Allow the student's rounding to the requested number of places.
      const r = Math.round(target * 10 ** spec.places) / 10 ** spec.places;
      if (close(parsed.value, r)) return { correct: true, parsed };
    }
    return { correct: false, parsed };
  }

  if (spec.kind === 'frac') {
    if (!close(parsed.value, target)) return { correct: false, parsed };
    if (spec.d === 1) {
      if (parsed.form === 'int' || parsed.form === 'dec') return { correct: true, parsed };
      return { correct: false, parsed, formIssue: `Right value! But ${raw} is just ${spec.n} — write whole numbers as whole numbers.` };
    }
    if (parsed.form === 'frac' && parsed.simplified) return { correct: true, parsed };
    if (parsed.form === 'frac') {
      return { correct: false, parsed, formIssue: `Right value, but not in lowest terms. Divide top and bottom by their GCF to get ${specToString(spec)}.` };
    }
    if (parsed.form === 'dec') {
      return { correct: false, parsed, formIssue: `Right value, but MATHCOUNTS wants a common fraction here: ${specToString(spec)}, not a decimal.` };
    }
    if (parsed.form === 'mixed') {
      return { correct: false, parsed, formIssue: `Right value, but "common fraction" means no mixed numbers. Write it as ${specToString(spec)}.` };
    }
    return { correct: false, parsed };
  }

  if (spec.kind === 'radical') {
    if (!close(parsed.value, target)) {
      if (parsed.form === 'dec' && Math.abs(parsed.value - target) < 0.01 * Math.abs(target)) {
        return { correct: false, parsed, formIssue: `That's the decimal approximation. Keep the square root exact: ${specToString(spec)}.` };
      }
      return { correct: false, parsed };
    }
    if (spec.b === 1) return { correct: parsed.form === 'int' || parsed.form === 'frac', parsed };
    if (parsed.form === 'radical' && parsed.simplified) return { correct: true, parsed };
    if (parsed.form === 'radical') {
      return { correct: false, parsed, formIssue: `Right value, but the radical isn't simplified. Pull perfect squares out from under the √: ${specToString(spec)}.` };
    }
    return { correct: false, parsed, formIssue: `Write this in simplest radical form: ${specToString(spec)}.` };
  }

  if (spec.kind === 'pi') {
    if (close(parsed.value, target)) {
      if (parsed.form === 'pi' && parsed.simplified) return { correct: true, parsed };
      if (parsed.form === 'pi') return { correct: false, parsed, formIssue: `Right value, but reduce the fraction: ${specToString(spec)}.` };
    }
    if (parsed.form !== 'pi' && Math.abs(parsed.value - target) < 0.01 * Math.abs(target)) {
      return { correct: false, parsed, formIssue: `The question says "in terms of π" — leave π as a symbol: ${specToString(spec)}.` };
    }
    // Student wrote the coefficient but forgot π
    const coef = spec.n / spec.d;
    if (parsed.form !== 'pi' && close(parsed.value, coef)) {
      return { correct: false, parsed, formIssue: `So close — you forgot the π! The answer is ${specToString(spec)}.` };
    }
    return { correct: false, parsed };
  }

  return { correct: false, parsed };
}

// Does the student's value match a known "common mistake" value?
export function matchesValue(parsed, mistakeValue) {
  if (!parsed) return false;
  const v = typeof mistakeValue === 'number' ? mistakeValue : specValue(mistakeValue);
  return close(parsed.value, v);
}

export { frac };
