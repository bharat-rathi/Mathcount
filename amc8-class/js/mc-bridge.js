// Extra question types for the AMC 8 topics, borrowed from the MATHCOUNTS coach (../../lib).
// Each MATHCOUNTS problem type becomes one more generator on the matching AMC topic, converted
// to the AMC format: plain text, one answer, and wrong choices from the coach's list of classic
// mistakes (the choice builder tops them up to five). This is what keeps a topic from showing
// the same kind of question over and over.
import { TOPICS as MC_TOPICS, generateQuestion } from '../../lib/topics.js';
import { specToString } from '../../lib/answers.js';

// MATHCOUNTS topic → { AMC topic: [problem types] }. '*' means every type of that topic.
export const BRIDGE = {
  arith: { mental: '*' },
  fractions: { fractions: '*' },
  percents: { percents: '*' },
  ratios: { ratios: '*' },
  rates: { rates: ['walk', 'avgspeed', 'work', 'meet', 'catchup', 'drain'], units: ['units'] },
  divisors: { divisors: ['count', 'odd', 'sum', 'sqdiv'], gcflcm: ['gcf', 'lcm', 'gcflcm'], divisibility: ['digit9', 'zeros'] },
  primes: { gcflcm: ['sumpf', 'countp', 'largestpf', 'goldbach'], remainders: ['units', 'remainder', 'powmod'] },
  sequences: { sequences: '*' },
  equations: { equations: '*' },
  exponents: { exponents: '*' },
  operations: { logic: '*' },
  counting: { counting: ['outfits', 'digits3', 'digitprod'], combos: ['word', 'committee', 'handshake', 'teams', 'roundtable', 'together', 'circletri'], paths: ['grid'] },
  probability: { probability: ['dice', 'dice2', 'pickmult', 'coinsk', 'atleast', 'oneof'], probplus: ['marbles', 'consecsame'] },
  sets: { logic: ['neither', 'venn', 'venn3'], casework: ['orcount', 'both', 'neither2', 'summult'] },
  area: { area: '*' },
  circles: { circles: '*' },
  pythag: { pythag: ['hyp', 'leg', 'iso', 'rhombus', 't306090', 'boxdiag', 'equiarea', 'rectdiag'], coords: ['dist'] },
  angles: { angles: '*' },
  stats: { stats: '*' },
};

const SUP = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', '−': '⁻', '-': '⁻' };
const FORM = { 'common fraction': 'as a common fraction', 'in terms of π': 'in terms of π', 'simplest radical form': 'in simplest radical form' };

// The coach's little HTML (fractions as spans, exponents as <sup>) → plain text.
export function plain(html) {
  return String(html)
    .replace(/<span class="fr"><span>([^<]*)<\/span><span>([^<]*)<\/span><\/span>/g, '$1/$2')
    .replace(/<sup>([^<]*)<\/sup>/g, (_, x) => (/^[0-9−-]+$/.test(x) ? [...x].map((c) => SUP[c]).join('') : /^[a-z]$/.test(x) ? `^${x}` : `^(${x})`))
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ').trim();
}

const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
const squarefree = (n) => { for (let k = 2; k * k <= n; k++) if (n % (k * k) === 0) return false; return true; };

// Believable wrong answers shaped like the right one (a fraction, a radical, a multiple of π),
// used after the coach's own list of classic mistakes. Plain numbers are padded by the app.
function lookalikes(spec) {
  const out = [];
  if (spec.kind === 'frac' && spec.d > 1) {
    const { n, d } = spec, val = n / d;
    // Same denominator first, then the complement, doubled/halved, and only then odd denominators.
    const cands = [[n + 1, d], [n - 1, d], [d - n, d], [n + 2, d], [n - 2, d], [2 * n, d], [n, 2 * d], [d, n]];
    if (d % 2 === 0) cands.push([n, d / 2]);
    cands.push([n, d + 1], [n, d - 1], [n + 1, d + 1]);
    for (const [a, b] of cands) {
      if (a <= 0 || b <= 0 || (val <= 1 && a > b)) continue;
      const g = gcd(a, b); out.push(b / g === 1 ? String(a / g) : `${a / g}/${b / g}`);
    }
  } else if (spec.kind === 'radical' && spec.b > 1) {
    const { a, b, d = 1 } = spec;
    for (const [x, y] of [[a + 1, b], [a - 1, b], [a, b + 1], [a, b - 1], [a * 2, b], [a, b * 2], [a + 2, b], [a, b + 2]]) {
      if (x <= 0 || y <= 1 || !squarefree(y)) continue;
      const g = gcd(x, d); out.push(specToString({ kind: 'radical', a: x / g, b: y, d: d / g }));
    }
  } else if (spec.kind === 'pi') {
    const { n, d } = spec;
    for (const [x, y] of [[n + 1, d], [n - 1, d], [2 * n, d], [n, 2 * d], [n + 2, d], [n - 2, d], [n * n, d], [n + d, d]]) {
      if (x <= 0 || y <= 0) continue;
      const g = gcd(x, y); out.push(specToString({ kind: 'pi', n: x / g, d: y / g }));
    }
  }
  return out;
}

const nice = (v) => { const r = Math.round(v * 100) / 100; return Number.isFinite(r) ? String(r) : null; };

// One generated MATHCOUNTS problem → the shape an AMC generator returns: { q, a, wrong, steps }.
export function convert(q) {
  const unit = q.unit;
  const show = (text) => (unit === '%' ? `${text}%` : unit === '$' ? `$${text}` : text);
  const answer = show(specToString(q.answer));
  const wrong = [];
  for (const m of q.mistakes || []) {
    const v = m && m.value;
    const s = v == null ? null : typeof v === 'object' ? specToString(v) : nice(Number(v));
    if (s && s !== '?' && !/^NaN/.test(s)) wrong.push(show(s));
  }
  // Shuffled so the same look-alikes don't always follow the same mistakes.
  wrong.push(...lookalikes(q.answer).sort(() => Math.random() - 0.5).map(show));
  let text = plain(q.q);
  // "As a common fraction" only matters when the answer really is a fraction.
  const isWhole = q.answer.kind === 'frac' && q.answer.d === 1;
  if (q.form && FORM[q.form] && !isWhole) text += ` Express your answer ${FORM[q.form]}.`;
  const steps = (q.steps || []).map(plain);
  if (q.tip) steps.push(`💡 ${plain(q.tip)}`);
  return { q: text, a: answer, wrong, steps };
}

// Add the borrowed problem types to the AMC topics (mutates each topic's `gens`).
export function installBridge(topics) {
  const byId = Object.fromEntries(topics.map((t) => [t.id, t]));
  let added = 0;
  for (const [libId, targets] of Object.entries(BRIDGE)) {
    const lib = MC_TOPICS.find((t) => t.id === libId);
    if (!lib) continue;
    for (const [amcId, which] of Object.entries(targets)) {
      const topic = byId[amcId];
      if (!topic) continue;
      topic.bridged = topic.bridged || [];
      for (const v of lib.variants.filter((x) => which === '*' || which.includes(x.id))) {
        const key = `${libId}/${v.id}`;
        if (topic.bridged.includes(key)) continue; // installing twice must not duplicate
        const gen = (level) => convert(generateQuestion(libId, level, Math.floor(Math.random() * 2 ** 31), v.id));
        gen.lvl = v.level; // only shown at or above this difficulty
        gen.src = key;
        topic.gens.push(gen);
        topic.bridged.push(key);
        added++;
      }
    }
  }
  return added;
}
