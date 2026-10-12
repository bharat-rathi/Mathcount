// MATHCOUNTS question generators.
//
// Each topic has several variants. A variant's gen(rng, level) returns:
//   q        question text (simple HTML allowed)
//   answer   answer spec (see answers.js)
//   unit     optional label shown after the answer box, like the answer blanks on a real test
//   form     optional "Express your answer as ..." instruction
//   steps    simplest step-by-step solution
//   tip      how to do it better / faster next time
//   mistakes [{ value, why }] predictable wrong answers and what causes them
//
// Topics mirror what shows up on School/Chapter Sprint, Target and Team rounds.

import {
  gcd, lcm, frac, factorize, factorStr, isPrime, choose, fact,
  simplifyRadical, fmt, ordinal, makeRng,
} from './mathutil.js';
import { specToString } from './answers.js';

import { N, F, PI, RAD, fr, frf, money, COMMON } from './qhelpers.js';
import { MORE } from './topics-more.js';

export const TOPICS = [
  // ───────────────────────────────── Number sense
  {
    id: 'arith', name: 'Order of Operations & Mental Math', icon: '🧮', strand: 'Number Sense',
    variants: [
      {
        id: 'ooo', level: 1,
        gen(r, L) {
          const hi = L === 1 ? 9 : 15;
          const a = r.int(3, hi), b = r.int(3, hi), c = r.int(2, 9), d = r.int(2, 9), e = r.int(1, 9);
          const P = a * b, Q = c * d + e, ans = P - Q;
          return {
            q: `What is the value of (${a} × ${b}) − (${c} × ${d} + ${e})?`,
            answer: N(ans),
            steps: [
              `Work inside each set of parentheses first.`,
              `Left group: ${a} × ${b} = ${P}.`,
              `Right group: multiply before adding → ${c} × ${d} = ${c * d}, then + ${e} = ${Q}.`,
              `Now subtract the whole right group: ${P} − ${Q} = <b>${ans}</b>.`,
            ],
            tip: `Write the value of each parentheses group right above it, then combine. A minus sign in front of parentheses takes away the <i>whole</i> group, so ${e} gets subtracted too.`,
            mistakes: [
              { value: P - c * d + e, why: `You subtracted ${c * d} but then <b>added</b> ${e}. The minus sign applies to the whole group (${c * d} + ${e}), so ${e} must be subtracted too.` },
              { value: P - c * (d + e), why: `You added ${d} + ${e} before multiplying. Inside the parentheses, multiplication still comes before addition.` },
            ],
          };
        },
      },
      {
        id: 'gauss', level: 1,
        gen(r, L) {
          const m = r.int(2, L === 1 ? 10 : 30);
          const n = m + r.int(8, L === 1 ? 15 : 40);
          const count = n - m + 1;
          const ans = (count * (m + n)) / 2;
          return {
            q: `What is the value of ${m} + ${m + 1} + ${m + 2} + … + ${n}?`,
            answer: N(ans),
            steps: [
              `Count the numbers: from ${m} to ${n} there are ${n} − ${m} + 1 = ${count} numbers.`,
              `Average of a list that goes up evenly = (first + last) ÷ 2 = (${m} + ${n}) ÷ 2 = ${(m + n) / 2}.`,
              `Sum = how many × average = ${count} × ${(m + n) / 2} = <b>${ans}</b>.`,
            ],
            tip: `Sum of an evenly spaced list = (number of terms) × (first + last) ÷ 2. And remember the fencepost rule: from ${m} to ${n} <i>inclusive</i> is last − first <b>+ 1</b> numbers.`,
            mistakes: [
              { value: ((n - m) * (m + n)) / 2, why: `You used ${n - m} terms, but counting from ${m} to ${n} including both ends gives ${count}. (Fencepost error: always add 1.)` },
              { value: ((count + 1) * (m + n)) / 2, why: `You used ${count + 1} terms — one too many. ${n} − ${m} + 1 = ${count}.` },
            ],
          };
        },
      },
      {
        id: 'trick', level: 2,
        gen(r) {
          const type = r.pick(['25', '99', '125', '101']);
          if (type === '25') {
            const k = 4 * r.int(3, 30);
            return {
              q: `Without a calculator: what is 25 × ${k}?`, answer: N(25 * k),
              steps: [`${k} = 4 × ${k / 4}.`, `25 × 4 = 100, so 25 × ${k} = 100 × ${k / 4} = <b>${25 * k}</b>.`],
              tip: `Look for "friendly pairs": 25 × 4 = 100, 125 × 8 = 1000, 5 × 2 = 10. Split the other number to make one.`,
              mistakes: [],
            };
          }
          if (type === '125') {
            const k = 8 * r.int(2, 15);
            return {
              q: `Without a calculator: what is 125 × ${k}?`, answer: N(125 * k),
              steps: [`${k} = 8 × ${k / 8}.`, `125 × 8 = 1000, so the answer is 1000 × ${k / 8} = <b>${125 * k}</b>.`],
              tip: `125 × 8 = 1000 is worth memorizing — it turns big multiplications into adding zeros.`,
              mistakes: [],
            };
          }
          const k = r.int(13, 89);
          if (type === '99') {
            return {
              q: `Without a calculator: what is 99 × ${k}?`, answer: N(99 * k),
              steps: [`99 = 100 − 1.`, `So 99 × ${k} = 100 × ${k} − ${k} = ${100 * k} − ${k} = <b>${99 * k}</b>.`],
              tip: `Numbers close to 100 are easy: multiply by 100, then fix the small difference.`,
              mistakes: [{ value: 100 * k - 1, why: `You subtracted 1, but you need to subtract one whole ${k} (because 99 × ${k} is one ${k} less than 100 × ${k}).` }],
            };
          }
          return {
            q: `Without a calculator: what is 101 × ${k}?`, answer: N(101 * k),
            steps: [`101 = 100 + 1.`, `So 101 × ${k} = ${100 * k} + ${k} = <b>${101 * k}</b>.`],
            tip: `Multiplying a 2-digit number by 101 just writes it twice: 101 × 47 = 4747!`,
            mistakes: [{ value: 100 * k + 1, why: `You added 1, but you need to add one whole ${k}.` }],
          };
        },
      },
      {
        id: 'distrib', level: 2,
        gen(r, L) {
          const a = r.int(12, L === 3 ? 99 : 49);
          const b = r.int(11, 89), c = 100 - b;
          return {
            q: `What is ${a} × ${b} + ${a} × ${c}?`, answer: N(a * 100),
            steps: [
              `Both products share the factor ${a}. Pull it out (distributive property):`,
              `${a} × ${b} + ${a} × ${c} = ${a} × (${b} + ${c}) = ${a} × 100 = <b>${a * 100}</b>.`,
            ],
            tip: `Before multiplying big numbers, scan for a common factor. If the leftover numbers add to 10, 100 or 1000, the problem is basically done.`,
            mistakes: [],
          };
        },
      },
    ],
  },

  {
    id: 'fractions', name: 'Fractions', icon: '🍕', strand: 'Number Sense',
    variants: [
      {
        id: 'add', level: 1,
        gen(r) {
          let b, d;
          do { b = r.int(2, 12); d = r.int(2, 12); } while (b === d);
          const a = r.int(1, b - 1), c = r.int(1, d - 1);
          const L = lcm(b, d);
          const ans = F(a * d + c * b, b * d);
          return {
            q: `What is ${fr(a, b)} + ${fr(c, d)}?`, form: COMMON, answer: ans,
            steps: [
              `Find a common denominator: LCM(${b}, ${d}) = ${L}.`,
              `${fr(a, b)} = ${fr(a * L / b, L)} and ${fr(c, d)} = ${fr(c * L / d, L)}.`,
              `Add the tops: ${fr(a * L / b + c * L / d, L)}${ans.d !== L ? ` = <b>${frf(ans)}</b> (simplified)` : ` → <b>${frf(ans)}</b> (already in lowest terms)`}.`,
            ],
            tip: `Only add numerators once the denominators match. Use the <i>least</i> common multiple to keep numbers small, then always check if the answer reduces.`,
            mistakes: [{ value: F(a + c, b + d), why: `You added the tops AND the bottoms. Denominators tell you the size of the pieces — you can only add pieces of the same size, so get a common denominator first.` }],
          };
        },
      },
      {
        id: 'remain', level: 2,
        gen(r) {
          const a = r.int(2, 6), b = r.int(2, 6);
          const ans = F((a - 1) * (b - 1), a * b);
          const left1 = F(a - 1, a);
          return {
            q: `Ann eats ${fr(1, a)} of a pizza. Then Ben eats ${fr(1, b)} of what is left. What fraction of the whole pizza is left now?`,
            form: COMMON, answer: ans,
            steps: [
              `After Ann: 1 − ${fr(1, a)} = ${frf(left1)} of the pizza is left.`,
              `Ben eats ${fr(1, b)} <i>of that</i>, so ${fr(b - 1, b)} of it stays.`,
              `${fr(b - 1, b)} of ${frf(left1)} = ${fr(b - 1, b)} × ${frf(left1)} = <b>${frf(ans)}</b>.`,
            ],
            tip: `"Of what is left" means multiply by the fraction that <i>stays</i>. Track the remaining amount after each step instead of the eaten amount.`,
            mistakes: [
              { value: F(a * b - a - b, a * b), why: `You subtracted ${fr(1, b)} of the <i>whole</i> pizza, but Ben ate ${fr(1, b)} of what was <i>left</i> — a smaller amount.` },
              { value: F(1, a * b), why: `That's the amount Ben ate (or a product of the eaten parts). The question asks what's left.` },
            ],
          };
        },
      },
      {
        id: 'recipe', level: 2,
        gen(r) {
          const p = r.pick([2, 3, 4]);
          const whole = 1, num = r.pick([1, 3]), den = 4;
          const sugar = F(whole * den + num, den);
          const have = r.int(1, p - 1);
          const ans = F(sugar.n * have, sugar.d * p);
          return {
            q: `A cookie recipe uses ${p} cups of flour and ${whole} ${fr(num, den)} cups of brown sugar. Andy has only ${have} cup${have > 1 ? 's' : ''} of flour and shrinks the recipe proportionally. How many cups of brown sugar does he need?`,
            form: COMMON, unit: 'cups', answer: ans,
            steps: [
              `He uses ${have} out of ${p} cups of flour, so the scale factor is ${fr(have, p)}.`,
              `Write the sugar as an improper fraction: ${whole} ${fr(num, den)} = ${frf(sugar)}.`,
              `${frf(sugar)} × ${fr(have, p)} = <b>${frf(ans)}</b> cups.`,
            ],
            tip: `Scaling a recipe = multiply every ingredient by (new amount ÷ old amount). Convert mixed numbers to improper fractions before multiplying.`,
            mistakes: [{ value: sugar.n / sugar.d - (p - have), why: `You subtracted the missing flour from the sugar. Recipes scale by <i>multiplying</i>, not subtracting.` }],
          };
        },
      },
      {
        id: 'divide', level: 1,
        gen(r) {
          const b = r.pick([2, 3, 4, 5, 8]);
          let a; do { a = r.int(1, b - 1); } while (gcd(a, b) !== 1);
          const total = a * r.int(2, 9);
          const ans = (total * b) / a;
          return {
            q: `How many ${fr(a, b)}-cup servings are in ${total} cups of soup?`, unit: 'servings', answer: N(ans),
            steps: [
              `"How many ___ fit in ___" means divide: ${total} ÷ ${fr(a, b)}.`,
              `Dividing by a fraction = multiplying by its flip: ${total} × ${fr(b, a)} = <b>${ans}</b>.`,
            ],
            tip: `Sanity check: each serving is less than 1 cup, so you should get <i>more</i> servings than ${total}.`,
            mistakes: [{ value: (total * a) / b, why: `You multiplied by ${fr(a, b)}. Since each serving is smaller than a cup, there must be more servings than cups — divide (flip and multiply).` }],
          };
        },
      },
    ],
  },

  {
    id: 'percents', name: 'Percents', icon: '💯', strand: 'Number Sense',
    variants: [
      {
        id: 'of', level: 1,
        gen(r) {
          const p = r.pick([10, 15, 20, 25, 30, 35, 40, 60, 75]);
          const n = 20 * r.int(2, 30);
          const ans = (p * n) / 100;
          return {
            q: `What is ${p}% of ${n}?`, answer: N(ans),
            steps: [`${p}% means ${p} out of 100 = ${fr(p, 100)}.`, `${fr(p, 100)} × ${n} = <b>${ans}</b>.`],
            tip: `Mental shortcut: 10% = move the decimal one place left. Build other percents from it: 30% = 3 × 10%, 15% = 10% + 5%.`,
            mistakes: [{ value: p * n, why: `You forgot that percent means "out of 100" — divide by 100.` }],
          };
        },
      },
      {
        id: 'reverse', level: 2,
        gen(r) {
          const p = r.pick([10, 15, 20, 25, 30, 40]);
          const orig = 20 * r.int(3, 20);
          const paid = (orig * (100 - p)) / 100;
          return {
            q: `Sam uses a ${p}%-off coupon and pays ${money(paid)} after the discount. What was the original price, in dollars?`,
            unit: '$', answer: N(orig),
            steps: [
              `After ${p}% off, Sam pays ${100 - p}% of the original price.`,
              `So ${100 - p}% of price = ${paid} → price = ${paid} ÷ ${(100 - p) / 100}.`,
              `${paid} ÷ ${(100 - p) / 100} = <b>${orig}</b>.`,
            ],
            tip: `Discount problems: "p% off" means you pay (100 − p)%. To go backwards, divide by that decimal. Check: ${p}% of ${orig} is ${(orig * p) / 100}, and ${orig} − ${(orig * p) / 100} = ${paid}. ✓`,
            mistakes: [{ value: paid * (1 + p / 100), why: `You added ${p}% of the <i>sale</i> price. But the discount was ${p}% of the <i>original</i> (bigger) price, so that doesn't undo it. Divide by ${(100 - p) / 100} instead.` }],
          };
        },
      },
      {
        id: 'updown', level: 2,
        gen(r) {
          const p = r.pick([10, 20, 30, 40, 50]);
          const ans = (p * p) / 100;
          return {
            q: `A price goes up ${p}%, then the new price goes down ${p}%. By what percent did the price decrease overall?`,
            unit: '%', answer: N(ans),
            steps: [
              `Start with an easy price: $100.`,
              `Up ${p}%: $100 → $${100 + p}.`,
              `Down ${p}% of $${100 + p} = $${((100 + p) * p) / 100}: $${100 + p} → $${100 + p - ((100 + p) * p) / 100}.`,
              `From $100 to $${100 - ans} is a <b>${ans}%</b> decrease.`,
            ],
            tip: `When a percent problem has no starting number, pretend it's 100 — the answer comes out directly as a percent. (Up p% then down p% always loses p²/100 %.)`,
            mistakes: [{ value: 0, why: `The ups and downs don't cancel! The ${p}% decrease is taken from a <i>bigger</i> number, so it removes more than the increase added.` }],
          };
        },
      },
      {
        id: 'xminus', level: 3,
        gen(r) {
          const p = 5 * r.int(11, 19);
          const x = 20 * r.int(1, 8);
          const a = (x * (100 - p)) / 100;
          return {
            q: `If x − ${a} is ${p}% of x, what percent of x is x + ${a}?`, unit: '%', answer: N(200 - p),
            steps: [
              `x − ${a} = ${p}% of x means the missing ${a} is the other ${100 - p}% of x.`,
              `So x + ${a} = 100% of x + ${100 - p}% of x = <b>${200 - p}%</b> of x.`,
              `(Check: ${100 - p}% of x = ${a} gives x = ${x}, and ${x + a} ÷ ${x} = ${(200 - p) / 100}.)`,
            ],
            tip: `Think in percents of x instead of solving for x. If a piece is missing from 100%, adding that piece instead adds the same percent on top.`,
            mistakes: [
              { value: 100 - p, why: `${100 - p}% is how big ${a} is compared to x. The question asks about x + ${a}, which is 100% + ${100 - p}%.` },
              { value: 100 + p, why: `x + ${a} is x plus the <i>missing</i> part (${100 - p}%), not plus ${p}%.` },
            ],
          };
        },
      },
      {
        id: 'change', level: 1,
        gen(r) {
          let A, pct, B;
          do {
            A = r.pick([20, 25, 40, 50, 60, 80, 120, 200]);
            pct = r.pick([10, 20, 25, 30, 50, 75]);
            B = (A * (100 + pct)) / 100;
          } while (!Number.isInteger(B));
          return {
            q: `A plant grew from ${A} cm to ${B} cm. By what percent did its height increase?`, unit: '%', answer: N(pct),
            steps: [`Change = ${B} − ${A} = ${B - A}.`, `Percent change = change ÷ <i>original</i> = ${B - A} ÷ ${A} = ${(B - A) / A} = <b>${pct}%</b>.`],
            tip: `Percent change always divides by the <b>original</b> (starting) amount: (new − old) ÷ old.`,
            mistakes: [{ value: Math.round(((B - A) / B) * 10000) / 100, why: `You divided by the new height ${B}. Percent change is measured from the starting value ${A}.` }],
          };
        },
      },
    ],
  },

  {
    id: 'ratios', name: 'Ratios & Proportions', icon: '⚖️', strand: 'Number Sense',
    variants: [
      {
        id: 'chain', level: 1,
        gen(r) {
          const [A, B, C] = r.shuffle(['glump', 'floop', 'kimmi', 'zorb', 'blip']).slice(0, 3);
          const half = r.chance(0.5);
          const p = half ? 2 * r.int(1, 5) : r.int(2, 9), q = r.int(2, 9);
          const amt = half ? r.int(1, 3) + 0.5 : r.int(2, 4);
          const ans = p * q * amt;
          const words = { 1.5: 'one and a half', 2.5: 'two and a half', 3.5: 'three and a half' };
          return {
            q: `One ${A} is worth ${p} ${B}s, and one ${B} is worth ${q} ${C}s. How many ${C}s equal ${words[amt] || amt} ${A}s?`,
            unit: `${C}s`, answer: N(ans),
            steps: [
              `1 ${A} = ${p} ${B}s = ${p} × ${q} = ${p * q} ${C}s.`,
              `${amt} ${A}s = ${amt} × ${p * q} = <b>${ans}</b> ${C}s.`,
            ],
            tip: `Chain conversions: write each step as "1 big = __ small" and multiply straight through. Units cancel like fractions.`,
            mistakes: [
              { value: p * q, why: `That's the value of just 1 ${A}. Multiply by ${amt}.` },
              { value: (p + q) * amt, why: `Conversions multiply, not add: 1 ${A} = ${p} ${B}s, and each of those is ${q} ${C}s.` },
            ],
          };
        },
      },
      {
        id: 'squares', level: 2,
        gen(r) {
          let a, b;
          do { b = 5 * r.int(1, 8); a = 5 * r.int(2, 16); } while (a <= b || gcd(a, b) === b && a / b > 6);
          const ans = F(b * b, a * a);
          return {
            q: `Amy's square garden is ${a} m on each side. Bob's square garden is ${b} m on each side. What is the ratio of the area of Bob's garden to the area of Amy's garden?`,
            form: COMMON, answer: ans,
            steps: [
              `Ratio of sides (Bob : Amy) = ${fr(b, a)} = ${frf(F(b, a))}.`,
              `Areas use side × side, so square the ratio: (${frf(F(b, a))})² = <b>${frf(ans)}</b>.`,
            ],
            tip: `If lengths scale by k, areas scale by k² and volumes by k³. Simplify the side ratio <i>before</i> squaring to keep numbers small.`,
            mistakes: [{ value: F(b, a), why: `That's the ratio of the side lengths. Area depends on length × width, so square the ratio.` }, { value: F(a * a, b * b), why: `Flipped! The question asks Bob's area compared to Amy's (Bob on top).` }],
          };
        },
      },
      {
        id: 'proportion', level: 1,
        gen(r) {
          let e, c, T, ans;
          do {
            e = r.int(3, 9); c = r.int(10, 40); T = r.int(2, 4) * 12;
            ans = (c * T) / e;
          } while (!Number.isInteger(ans) || T === e);
          return {
            q: `${e} eggs make ${c} crepes. The team has ${T / 12} cartons of 12 eggs. How many crepes can they make?`,
            unit: 'crepes', answer: N(ans),
            steps: [
              `Total eggs: ${T / 12} × 12 = ${T}.`,
              `Set up a proportion: ${fr(c, e)} = ${fr('x', T)}.`,
              `x = ${c} × ${T} ÷ ${e} = <b>${ans}</b>.`,
            ],
            tip: `Proportions: crepes per egg stays the same. Find the multiplier (${T} ÷ ${e}) or cross-multiply. Divide before multiplying when you can to keep numbers small.`,
            mistakes: [{ value: c + (T - e), why: `You added the extra eggs as extra crepes. Each egg makes ${c}/${e} crepes, so scale by multiplying.` }],
          };
        },
      },
      {
        id: 'share', level: 2,
        gen(r) {
          let a, b;
          do { a = r.int(2, 7); b = r.int(a + 1, 9); } while (gcd(a, b) !== 1);
          const T = (a + b) * r.int(3, 12);
          const part = T / (a + b);
          return {
            q: `The ratio of boys to girls in a club is ${a}:${b}. There are ${T} members. How many more girls than boys are there?`,
            unit: 'girls', answer: N((b - a) * part),
            steps: [
              `The ratio has ${a} + ${b} = ${a + b} equal parts.`,
              `Each part = ${T} ÷ ${a + b} = ${part} people.`,
              `Girls − boys = ${b - a} part${b - a > 1 ? 's' : ''} = ${b - a} × ${part} = <b>${(b - a) * part}</b>.`,
            ],
            tip: `"Parts" method: add the ratio numbers to get total parts, find one part, then multiply. You often don't need to find each group.`,
            mistakes: [{ value: b - a, why: `${b - a} is the difference in <i>ratio parts</i>. Each part is ${part} people.` }],
          };
        },
      },
    ],
  },

  {
    id: 'rates', name: 'Rates, Work & Motion', icon: '🚆', strand: 'Number Sense',
    variants: [
      {
        id: 'walk', level: 1,
        gen(r) {
          const d = r.int(2, 5), t = 10 * r.int(2, 6);
          const m = r.int(d + 1, 4 * d);
          const D = (d * m) / 2;
          const ans = (t * m) / 2;
          return {
            q: `Jen walks ${d} km in ${t} minutes. At this rate, how many minutes will it take her to walk ${D} km?`,
            unit: 'min', answer: N(ans),
            steps: [`${D} km is ${D} ÷ ${d} = ${D / d} times as far.`, `So it takes ${D / d} × ${t} = <b>${ans}</b> minutes.`],
            tip: `Rate problems: find how many times bigger the new distance is, and scale the time by the same amount.`,
            mistakes: [{ value: (d * D) / t, why: `You flipped the rate. Longer walks take <i>more</i> time, so time should grow with distance.` }],
          };
        },
      },
      {
        id: 'avgspeed', level: 2,
        gen(r) {
          const [u, v] = r.pick([[30, 60], [20, 30], [40, 60], [12, 6], [45, 90], [10, 15], [60, 40], [24, 12]]);
          const ans = (2 * u * v) / (u + v);
          const D = lcm(u, v);
          return {
            q: `Maya bikes to the park at ${u} mph and returns home along the same path at ${v} mph. What is her average speed for the whole trip, in mph?`,
            unit: 'mph', answer: N(ans),
            steps: [
              `Pick a convenient distance each way: ${D} miles (a multiple of both speeds).`,
              `Time there: ${D} ÷ ${u} = ${D / u} h. Time back: ${D} ÷ ${v} = ${D / v} h.`,
              `Average speed = total distance ÷ total time = ${2 * D} ÷ ${D / u + D / v} = <b>${ans}</b> mph.`,
            ],
            tip: `Average speed is NOT the average of the speeds — she spends more time going slowly. Always use total distance ÷ total time. (Shortcut for there-and-back: 2uv ÷ (u + v).)`,
            mistakes: [{ value: (u + v) / 2, why: `You averaged the two speeds. She spends more <i>time</i> at the slower speed, so the true average is lower. Use total distance ÷ total time.` }],
          };
        },
      },
      {
        id: 'work', level: 2,
        gen(r) {
          let a, b;
          do { a = r.int(2, 9); b = r.int(2, 12); } while (a === b);
          const ans = F(a * b, a + b);
          return {
            q: `Leo can paint a fence in ${a} hours. Mia can paint the same fence in ${b} hours. Working together, how many hours will it take them?`,
            form: ans.d === 1 ? null : COMMON, unit: 'hours', answer: ans,
            steps: [
              `Leo paints ${fr(1, a)} of the fence per hour; Mia paints ${fr(1, b)} per hour.`,
              `Together: ${fr(1, a)} + ${fr(1, b)} = ${fr(a + b, a * b)} of the fence per hour.`,
              `Time = 1 ÷ ${fr(a + b, a * b)} = <b>${frf(ans)}</b> hours.`,
            ],
            tip: `Work problems: add the <i>rates</i> (jobs per hour), never the times. Quick check: together must be faster than the fastest person alone (less than ${Math.min(a, b)} hours).`,
            mistakes: [
              { value: (a + b) / 2, why: `Averaging times can't be right — two people together must finish faster than either alone. Add their rates instead.` },
              { value: a + b, why: `That's how long it would take if they worked one after the other. Working together is faster: add their rates.` },
            ],
          };
        },
      },
      {
        id: 'meet', level: 1,
        gen(r) {
          const u = 5 * r.int(6, 14), v = 5 * r.int(6, 14), t = r.int(2, 5);
          const D = (u + v) * t;
          return {
            q: `Two trains start ${D} miles apart and travel toward each other, one at ${u} mph and the other at ${v} mph. In how many hours will they meet?`,
            unit: 'hours', answer: N(t),
            steps: [`Moving toward each other, the gap shrinks by ${u} + ${v} = ${u + v} miles every hour.`, `${D} ÷ ${u + v} = <b>${t}</b> hours.`],
            tip: `Toward each other → add speeds (closing speed). Same direction → subtract speeds.`,
            mistakes: u !== v ? [{ value: D / Math.abs(u - v), why: `You subtracted the speeds. That's for chasing in the same direction; head-on, the gap closes at the sum of the speeds.` }] : [],
          };
        },
      },
    ],
  },

  // ───────────────────────────────── Number theory
  {
    id: 'divisors', name: 'Divisors, GCF & LCM', icon: '🔢', strand: 'Number Theory',
    variants: [
      {
        id: 'count', level: 2,
        gen(r, L) {
          let n, fs;
          do {
            const e2 = r.int(0, L === 3 ? 5 : 4), e3 = r.int(0, 3), e5 = r.int(0, 2), e7 = r.int(0, L === 3 ? 1 : 0);
            n = 2 ** e2 * 3 ** e3 * 5 ** e5 * 7 ** e7;
            fs = factorize(n);
          } while (fs.length < 2 || n < 30 || n > 8000);
          const ans = fs.reduce((t, [, e]) => t * (e + 1), 1);
          return {
            q: `How many positive divisors does ${fmt(n)} have?`, unit: 'divisors', answer: N(ans),
            steps: [
              `Prime factorize: ${fmt(n)} = ${factorStr(n)}.`,
              `A divisor picks how many of each prime to use. ${fs.map(([p, e]) => `${p}: choose 0 to ${e} copies (${e + 1} choices)`).join('; ')}.`,
              `Multiply the choices: ${fs.map(([, e]) => e + 1).join(' × ')} = <b>${ans}</b>.`,
            ],
            tip: `Divisor counting: add 1 to each exponent and multiply. The "+1" is for using zero copies of that prime.`,
            mistakes: [
              { value: fs.reduce((t, [, e]) => t * e, 1), why: `You multiplied the exponents without adding 1. Each prime can also be used 0 times, so there are (exponent + 1) choices.` },
              { value: fs.reduce((t, [, e]) => t + e + 1, 0), why: `You added the choices. Since every choice for one prime combines with every choice for the other, multiply.` },
            ],
          };
        },
      },
      {
        id: 'odd', level: 3,
        gen(r) {
          let n, fs, odd;
          do {
            const e2 = r.int(1, 4), e3 = r.int(1, 3), e5 = r.int(0, 2);
            n = 2 ** e2 * 3 ** e3 * 5 ** e5; fs = factorize(n); odd = fs.filter(([p]) => p !== 2);
          } while (n > 3000);
          const ans = odd.reduce((t, [, e]) => t * (e + 1), 1);
          const all = fs.reduce((t, [, e]) => t * (e + 1), 1);
          return {
            q: `How many odd positive divisors does ${fmt(n)} have?`, unit: 'divisors', answer: N(ans),
            steps: [
              `${fmt(n)} = ${factorStr(n)}.`,
              `An odd divisor can't use any 2s — so only choose from the odd primes: ${odd.map(([p, e]) => (e > 1 ? `${p}<sup>${e}</sup>` : p)).join(' × ')}.`,
              `Number of choices: ${odd.length > 1 ? `${odd.map(([, e]) => e + 1).join(' × ')} = ` : ''}<b>${ans}</b>.`,
            ],
            tip: `To count odd divisors, delete the 2s from the factorization and count divisors of what's left.`,
            mistakes: [{ value: all, why: `That counts all divisors. Odd ones can't include a factor of 2.` }],
          };
        },
      },
      {
        id: 'sum', level: 3,
        gen(r) {
          let n, fs;
          do { n = r.int(20, 300); fs = factorize(n); } while (fs.length < 2 || fs.some(([p]) => p > 13));
          const sig = fs.reduce((t, [p, e]) => t * ((p ** (e + 1) - 1) / (p - 1)), 1);
          return {
            q: `What is the sum of all the positive divisors of ${n}?`, answer: N(sig),
            steps: [
              `${n} = ${factorStr(n)}.`,
              `Sum of divisors = product of (1 + p + p² + … ) for each prime: ${fs.map(([p, e]) => `(${Array.from({ length: e + 1 }, (_, i) => p ** i).join(' + ')})`).join(' × ')}.`,
              `= ${fs.map(([p, e]) => (p ** (e + 1) - 1) / (p - 1)).join(' × ')} = <b>${sig}</b>.`,
            ],
            tip: `Expanding (1 + 2 + 4)(1 + 3) creates every divisor exactly once — a huge time saver over listing them.`,
            mistakes: [{ value: sig - n, why: `You left out ${n} itself. A number is always one of its own divisors.` }, { value: sig - 1 - n, why: `You left out 1 and ${n}. Both count as divisors.` }],
          };
        },
      },
      {
        id: 'gcf', level: 1,
        gen(r) {
          let a, b, g;
          do { g = r.int(3, 15); a = g * r.int(2, 7); b = g * r.int(2, 7); } while (a === b || gcd(a, b) !== g);
          return {
            q: `Maya has ${a} chocolates and Leo has ${b} mints. They make identical gift bags using all the candy, with no candy left over. What is the greatest number of bags they can make?`,
            unit: 'bags', answer: N(g),
            steps: [`The number of bags must divide both ${a} and ${b}.`, `${a} = ${factorStr(a)}, ${b} = ${factorStr(b)}.`, `Greatest common factor = <b>${g}</b>.`],
            tip: `"Greatest number of equal groups" → GCF. "First time they line up again / smallest shared amount" → LCM.`,
            mistakes: [{ value: lcm(a, b), why: `That's the LCM. Bags have to split the candy evenly, so you need a number that goes <i>into</i> both — the GCF.` }],
          };
        },
      },
      {
        id: 'lcm', level: 1,
        gen(r) {
          let a, b;
          do { a = r.int(4, 18); b = r.int(4, 24); } while (a === b || gcd(a, b) === 1 || a % b === 0 || b % a === 0);
          return {
            q: `One light blinks every ${a} seconds and another blinks every ${b} seconds. They just blinked together. In how many seconds will they next blink together?`,
            unit: 'seconds', answer: N(lcm(a, b)),
            steps: [`We need the smallest number that's a multiple of both ${a} and ${b} — the LCM.`, `${a} = ${factorStr(a)}, ${b} = ${factorStr(b)}.`, `Take each prime's highest power: LCM = <b>${lcm(a, b)}</b>.`],
            tip: `Quick LCM: (a × b) ÷ GCF. Here ${a} × ${b} ÷ ${gcd(a, b)} = ${lcm(a, b)}.`,
            mistakes: [{ value: a * b, why: `${a} × ${b} is a common multiple, but not the smallest, because ${a} and ${b} share a factor of ${gcd(a, b)}.` }, { value: gcd(a, b), why: `That's the GCF. The lights line up at a common <i>multiple</i>.` }],
          };
        },
      },
    ],
  },

  {
    id: 'primes', name: 'Primes & Number Patterns', icon: '🔍', strand: 'Number Theory',
    variants: [
      {
        id: 'sumpf', level: 1,
        gen(r) {
          let n, fs;
          do { n = r.int(60, 999); fs = factorize(n); } while (fs.length < 2 || fs.every(([, e]) => e === 1));
          const ans = fs.reduce((t, [p]) => t + p, 0);
          return {
            q: `What is the sum of the distinct prime factors of ${n}?`, answer: N(ans),
            steps: [`Factor: ${n} = ${factorStr(n)}.`, `Distinct primes: ${fs.map(([p]) => p).join(', ')}.`, `Sum = <b>${ans}</b>.`],
            tip: `"Distinct" means count each prime once, no matter how many times it repeats. Factor with a tree: try 2, 3, 5, 7, 11… in order.`,
            mistakes: [{ value: fs.reduce((t, [p, e]) => t + p * e, 0), why: `You added repeated primes more than once. "Distinct" means each different prime counts once.` }],
          };
        },
      },
      {
        id: 'units', level: 2,
        gen(r) {
          const a = r.pick([2, 3, 7, 8, 12, 13, 17, 22, 27]);
          const n = r.int(20, 99);
          const d = a % 10;
          const cycle = [];
          let x = d;
          do { cycle.push(x); x = (x * d) % 10; } while (x !== cycle[0]);
          const ans = cycle[(n - 1) % cycle.length];
          return {
            q: `What is the units digit of ${a}<sup>${n}</sup>?`, answer: N(ans),
            steps: [
              `Only the units digit (${d}) matters. Powers of ${d} end in: ${cycle.join(', ')}, then repeat — a cycle of ${cycle.length}.`,
              `${n} ÷ ${cycle.length} leaves remainder ${n % cycle.length}${n % cycle.length === 0 ? ` (remainder 0 means the last spot in the cycle)` : ''}.`,
              `So the units digit is <b>${ans}</b>.`,
            ],
            tip: `Units digits of powers always cycle (length 1, 2 or 4). Write the cycle, then use the remainder of the exponent ÷ cycle length.`,
            mistakes: [{ value: (d * n) % 10, why: `You multiplied ${d} × ${n}. Exponents mean repeated multiplication — look for the repeating cycle of units digits.` }],
          };
        },
      },
      {
        id: 'countp', level: 1,
        gen(r) {
          const a = r.int(0, 70), b = a + r.int(15, 30);
          const ps = []; for (let i = a + 1; i < b; i++) if (isPrime(i)) ps.push(i);
          const mistakes = [];
          if (a < 1 && b > 1) mistakes.push({ value: ps.length + 1, why: `1 is NOT prime — a prime has exactly two divisors.` });
          return {
            q: `How many prime numbers are greater than ${a} and less than ${b}?`, unit: 'primes', answer: N(ps.length),
            steps: [`Check each number from ${a + 1} to ${b - 1}. Skip evens (except 2) and multiples of 3, 5, 7.`, `Primes: ${ps.join(', ') || 'none'}.`, `Count: <b>${ps.length}</b>.`],
            tip: `To test n, you only need to try primes up to √n. For numbers under 100, that's just 2, 3, 5 and 7. Memorize the 25 primes under 100!`,
            mistakes,
          };
        },
      },
      {
        id: 'remainder', level: 2,
        gen(r) {
          let a, b, rem;
          do { a = r.int(3, 9); b = r.int(4, 12); rem = r.int(1, Math.min(a, b) - 1); } while (a === b || gcd(a, b) === 1);
          const ans = lcm(a, b) + rem;
          return {
            q: `What is the smallest whole number greater than ${rem} that leaves a remainder of ${rem} when divided by ${a} and also when divided by ${b}?`,
            answer: N(ans),
            steps: [`Subtract the remainder: n − ${rem} must be a multiple of both ${a} and ${b}.`, `Smallest positive common multiple: LCM(${a}, ${b}) = ${lcm(a, b)}.`, `n = ${lcm(a, b)} + ${rem} = <b>${ans}</b>.`],
            tip: `"Same remainder r" problems: take off r, use the LCM, then add r back.`,
            mistakes: [{ value: a * b + rem, why: `${a} × ${b} works but isn't the smallest — they share a factor, so use the LCM (${lcm(a, b)}).` }, { value: lcm(a, b), why: `Don't forget to add the remainder ${rem} back on.` }],
          };
        },
      },
    ],
  },

  // ───────────────────────────────── Algebra
  {
    id: 'sequences', name: 'Arithmetic Sequences', icon: '📈', strand: 'Algebra',
    variants: [
      {
        id: 'nth', level: 1,
        gen(r) {
          const a = r.int(-10, 20), d = r.pick([-7, -5, -3, 2, 3, 4, 5, 6, 7, 9]);
          const n = r.int(15, 60);
          const ans = a + (n - 1) * d;
          return {
            q: `The first term of an arithmetic sequence is ${a} and each term is ${d > 0 ? `${d} more` : `${-d} less`} than the one before. What is the ${ordinal(n)} term?`,
            answer: N(ans),
            steps: [`To get from term 1 to term ${n} you take ${n - 1} steps (not ${n}).`, `${ordinal(n)} term = ${a} + ${n - 1} × (${d}) = ${a} ${d < 0 ? '−' : '+'} ${Math.abs((n - 1) * d)} = <b>${ans}</b>.`],
            tip: `n-th term = first + (n − 1) × difference. Check with a tiny case: the 2nd term is first + 1 step.`,
            mistakes: [{ value: a + n * d, why: `You took ${n} steps, but from the 1st term to the ${ordinal(n)} is only ${n - 1} steps.` }],
          };
        },
      },
      {
        id: 'positive', level: 3,
        gen(r) {
          let a1, d, k, ak;
          do { d = -r.int(2, 7); k = r.pick([11, 16, 21, 26]); a1 = r.int(10, 60); ak = a1 + (k - 1) * d; } while (ak >= 0);
          const ad = -d;
          const ans = Math.floor((a1 - 1) / ad) + 1;
          const lastPos = a1 + (ans - 1) * d;
          return {
            q: `The first and ${ordinal(k)} terms of an arithmetic sequence are ${a1} and ${ak}. How many of its terms are positive?`,
            unit: 'terms', answer: N(ans),
            steps: [
              `From term 1 to term ${k} is ${k - 1} steps, so d = (${ak} − ${a1}) ÷ ${k - 1} = ${d}.`,
              `Terms: ${a1}, ${a1 + d}, ${a1 + 2 * d}, … dropping by ${ad} each time.`,
              `The last positive term is ${lastPos} (the next one, ${lastPos + d}, is not positive).`,
              `${lastPos} = ${a1} − ${ans - 1} × ${ad}, so it's term number ${ans}. Answer: <b>${ans}</b>.`,
            ],
            tip: `Find the common difference first. Then count terms with (first − last)/difference + 1 — and be careful: 0 is NOT positive.`,
            mistakes: [
              ...(a1 % ad === 0 ? [{ value: ans + 1, why: `One of the terms is exactly 0, and 0 is not positive.` }] : []),
              { value: Math.floor(a1 / ad), why: `Fencepost! Don't forget to count the first term itself.` },
            ],
          };
        },
      },
      {
        id: 'series', level: 2,
        gen(r) {
          const f = r.int(1, 12), d = r.int(2, 7), count = r.int(10, 25);
          const l = f + (count - 1) * d;
          const ans = (count * (f + l)) / 2;
          return {
            q: `What is the sum ${f} + ${f + d} + ${f + 2 * d} + … + ${l}?`, answer: N(ans),
            steps: [`Number of terms = (${l} − ${f}) ÷ ${d} + 1 = ${count}.`, `Average term = (${f} + ${l}) ÷ 2 = ${(f + l) / 2}.`, `Sum = ${count} × ${(f + l) / 2} = <b>${ans}</b>.`],
            tip: `Two formulas cover nearly every arithmetic series: count = (last − first) ÷ step + 1, and sum = count × (first + last) ÷ 2.`,
            mistakes: [{ value: ((count - 1) * (f + l)) / 2, why: `You used ${count - 1} terms. (last − first) ÷ step counts the <i>gaps</i>; add 1 to count the terms.` }],
          };
        },
      },
      {
        id: 'geo', level: 2,
        gen(r) {
          const a = r.int(1, 5), q = r.pick([2, 3]), n = r.int(5, q === 2 ? 9 : 6);
          const ans = a * q ** (n - 1);
          return {
            q: `In the sequence ${a}, ${a * q}, ${a * q * q}, ${a * q ** 3}, …, each term is ${q} times the previous one. What is the ${ordinal(n)} term?`,
            answer: N(ans),
            steps: [`Going from term 1 to term ${n} multiplies by ${q} a total of ${n - 1} times.`, `${a} × ${q}<sup>${n - 1}</sup> = ${a} × ${q ** (n - 1)} = <b>${ans}</b>.`],
            tip: `Geometric: n-th term = first × ratio<sup>n−1</sup>. Same "n − 1 steps" idea as arithmetic sequences.`,
            mistakes: [{ value: a * q ** n, why: `That's one multiplication too many. From term 1 to term ${n} is ${n - 1} steps.` }],
          };
        },
      },
    ],
  },

  {
    id: 'equations', name: 'Equations & Word Problems', icon: '✏️', strand: 'Algebra',
    variants: [
      {
        id: 'linear', level: 1,
        gen(r) {
          let a, c; do { a = r.int(2, 9); c = r.int(1, 9); } while (a === c);
          const x = r.int(-9, 12), b = r.int(-15, 15);
          const d = a * x + b - c * x;
          const sgn = (v) => (v < 0 ? `− ${-v}` : `+ ${v}`);
          const cx = c === 1 ? 'x' : `${c}x`;
          return {
            q: `Solve for x: ${a}x ${sgn(b)} = ${cx} ${sgn(d)}`, answer: N(x),
            steps: [
              `Get x-terms on one side: ${a}x − ${cx} = ${a - c}x.`,
              `Get numbers on the other: ${d} − (${b}) = ${d - b}.`,
              `${a - c}x = ${d - b} → x = <b>${x}</b>.`,
              `Check: ${a}(${x}) ${sgn(b)} = ${a * x + b} and ${c}(${x}) ${sgn(d)} = ${c * x + d}. ✓`,
            ],
            tip: `Do the same thing to both sides, and always plug your answer back in — it takes 10 seconds and catches sign mistakes.`,
            mistakes: x !== 0 ? [{ value: -x, why: `Sign error! When you move a term across the equals sign, it changes sign. Plug ${-x} back in to see it doesn't work.` }] : [],
          };
        },
      },
      {
        id: 'ages', level: 2,
        gen(r) {
          const C = r.int(4, 12), y = r.int(5, 20), P = 2 * C + y;
          return {
            q: `Addison is ${P} years old and her daughter Madison is ${C}. In how many years will Madison's age be half of Addison's age?`,
            unit: 'years', answer: N(y),
            steps: [
              `In y years: Madison is ${C} + y and Addison is ${P} + y.`,
              `Half: ${C} + y = (${P} + y) ÷ 2 → ${2 * C} + 2y = ${P} + y.`,
              `y = ${P} − ${2 * C} = <b>${y}</b>. (Check: ${C + y} is half of ${P + y}. ✓)`,
            ],
            tip: `Age problems: both people get older by the same amount. Write "age + y" for everyone, then translate the sentence into an equation.`,
            mistakes: [{ value: P / 2 - C, why: `You found when Madison reaches half of Addison's <i>current</i> age. Addison keeps aging too — add y to both ages.` }],
          };
        },
      },
      {
        id: 'coins', level: 3,
        gen(r) {
          const p = r.int(2, 9), k = r.int(2, 5);
          const cents = p * (1 + 25 * k);
          return {
            q: `A piggy bank has pennies, nickels and dimes. There are twice as many dimes as nickels and ${k} times as many nickels as pennies. The total value is ${money(cents / 100)}. How many nickels are there?`,
            unit: 'nickels', answer: N(k * p),
            steps: [
              `Let p = pennies. Then nickels = ${k}p and dimes = 2 × ${k}p = ${2 * k}p.`,
              `Value in cents: p + 5(${k}p) + 10(${2 * k}p) = p + ${5 * k}p + ${20 * k}p = ${1 + 25 * k}p.`,
              `${1 + 25 * k}p = ${cents} → p = ${p}.`,
              `Nickels = ${k} × ${p} = <b>${k * p}</b>.`,
            ],
            tip: `Coin problems: let the <i>smallest</i> group be the variable so everything else is a whole multiple, and work in cents to avoid decimals.`,
            mistakes: [{ value: p, why: `That's the number of pennies. The question asks for nickels (${k} times as many).` }, { value: 2 * k * p, why: `That's the number of dimes. Re-read what's being asked!` }],
          };
        },
      },
      {
        id: 'consec', level: 2,
        gen(r) {
          const n = r.pick([3, 4, 5, 6]), s = r.int(5, 60);
          const S = (n * (2 * s + n - 1)) / 2;
          return {
            q: `The sum of ${n} consecutive integers is ${S}. What is the largest of these integers?`, answer: N(s + n - 1),
            steps: [
              `The average of the ${n} integers is ${S} ÷ ${n} = ${S / n}.`,
              n % 2 ? `With an odd count, the average is the middle number: ${S / n}.` : `With an even count, the average sits between the two middle numbers: ${S / n - 0.5} and ${S / n + 0.5}.`,
              `List them: ${Array.from({ length: n }, (_, i) => s + i).join(', ')}. Largest = <b>${s + n - 1}</b>.`,
            ],
            tip: `Consecutive integers: divide the sum by the count to find the middle, then build outward. Much faster than solving x + (x+1) + …`,
            mistakes: [{ value: S / n, why: `That's the middle (average). The question wants the largest.` }, { value: s, why: `That's the smallest one. The question wants the largest.` }],
          };
        },
      },
      {
        id: 'pay', level: 3,
        gen(r) {
          const r1 = r.pick([12, 15]), r2 = r.pick([20, 25, 30]), e = r.int(2, 8), r3 = r.pick([18, 20, 22]);
          const h = 10 + e, Fl = 10 * r1 + e * r2;
          return {
            q: `Al's pays a flat $${Fl} a week. Carl's pays $${r1}/hour for the first 10 hours and $${r2}/hour for each hour beyond that. Bertha's pays $${r3}/hour. Charlene wants the number of hours that pays the same at Al's and Carl's. How much would she earn working those hours at Bertha's?`,
            unit: '$', answer: N(r3 * h),
            steps: [
              `Carl's for 10 hours pays 10 × $${r1} = $${10 * r1}. She needs $${Fl} − $${10 * r1} = $${Fl - 10 * r1} more.`,
              `Extra hours at $${r2}: $${Fl - 10 * r1} ÷ $${r2} = ${e}. Total hours = ${h}.`,
              `At Bertha's: ${h} × $${r3} = <b>$${r3 * h}</b>.`,
            ],
            tip: `Piecewise pay: handle the "first 10 hours" chunk first, then the rest. Then answer the question actually asked (Bertha's!).`,
            mistakes: [{ value: Fl, why: `That's what she'd make at Al's or Carl's. The question asks about Bertha's.` }, { value: h, why: `${h} is the number of hours. Multiply by Bertha's rate.` }],
          };
        },
      },
    ],
  },

  {
    id: 'exponents', name: 'Exponents & Square Roots', icon: '√', strand: 'Algebra',
    variants: [
      {
        id: 'simplify', level: 1,
        gen(r) {
          const a = r.int(2, 9), b = r.pick([2, 3, 5, 6, 7, 10, 11]);
          const n = a * a * b;
          return {
            q: `Express √${n} in simplest radical form.`, answer: RAD(1, n),
            steps: [`Find the biggest perfect square that divides ${n}: ${n} = ${a * a} × ${b}.`, `√${n} = √${a * a} × √${b} = <b>${a}√${b}</b>.`],
            tip: `Check perfect squares from big to small: 4, 9, 16, 25, 36, 49, 64, 81, 100… Pull out the biggest one that divides evenly.`,
            mistakes: [],
          };
        },
      },
      {
        id: 'rules', level: 1,
        gen(r) {
          const base = r.pick([2, 3]);
          const maxE = base === 2 ? 7 : 4;
          let a, b, c;
          do { a = r.int(2, 9); b = r.int(2, 9); c = r.int(2, 12); } while (a + b - c < 1 || a + b - c > maxE || a * b - c === a + b - c);
          const e = a + b - c;
          return {
            q: `What is ${base}<sup>${a}</sup> × ${base}<sup>${b}</sup> ÷ ${base}<sup>${c}</sup>?`, answer: N(base ** e),
            steps: [`Same base → multiply means add exponents, divide means subtract.`, `${a} + ${b} − ${c} = ${e}.`, `${base}<sup>${e}</sup> = <b>${base ** e}</b>.`],
            tip: `x<sup>a</sup> × x<sup>b</sup> = x<sup>a+b</sup>, x<sup>a</sup> ÷ x<sup>b</sup> = x<sup>a−b</sup>, (x<sup>a</sup>)<sup>b</sup> = x<sup>ab</sup>. Simplify exponents before computing anything.`,
            mistakes: a * b - c > 0 && a * b - c < 20 ? [{ value: base ** (a * b - c), why: `You multiplied the exponents. When you multiply powers of the same base, you <b>add</b> exponents.` }] : [],
          };
        },
      },
      {
        id: 'negexp', level: 2,
        gen(r) {
          let p, q; do { p = r.int(1, 5); q = r.int(2, 6); } while (gcd(p, q) !== 1 || p === q);
          const k = r.pick([2, 2, 3]);
          return {
            q: `What is (${fr(p, q)})<sup>−${k}</sup>?`, form: COMMON, answer: F(q ** k, p ** k),
            steps: [`A negative exponent means "flip": (${fr(p, q)})<sup>−${k}</sup> = (${fr(q, p)})<sup>${k}</sup>.`, `Raise top and bottom to the ${ordinal(k)} power: <b>${frf(F(q ** k, p ** k))}</b>.`],
            tip: `Negative exponent = reciprocal, not a negative number. x<sup>−n</sup> = 1 ÷ x<sup>n</sup>.`,
            mistakes: [
              { value: F(p ** k, q ** k), why: `The negative exponent means flip the fraction first.` },
              { value: F(-(q ** k), p ** k), why: `A negative exponent doesn't make the answer negative — it flips the fraction.` },
            ],
          };
        },
      },
      {
        id: 'rootprod', level: 2,
        gen(r) {
          let a, b, s;
          do { a = r.int(2, 30); b = r.int(2, 30); s = simplifyRadical(a * b); } while (s.a === 1 || s.b === 1 || a === b);
          return {
            q: `Express √${a} × √${b} in simplest radical form.`, answer: RAD(1, a * b),
            steps: [`√${a} × √${b} = √${a * b}.`, `${a * b} = ${s.a * s.a} × ${s.b}, so √${a * b} = <b>${s.a}√${s.b}</b>.`],
            tip: `Multiply under one root, then simplify. Better yet: factor first — shared factors pair up and come out of the root.`,
            mistakes: [],
          };
        },
      },
      {
        id: 'power', level: 3,
        gen(r) {
          const x = r.int(3, 6), base = 2;
          const v = base ** x;
          const k = r.pick([2, 3]);
          const big = k === 2 ? 4 : 8;
          return {
            q: `If 2<sup>x</sup> = ${v}, what is the value of ${big}<sup>x</sup>?`, answer: N(v ** k),
            steps: [`${big} = 2<sup>${k}</sup>, so ${big}<sup>x</sup> = (2<sup>${k}</sup>)<sup>x</sup> = (2<sup>x</sup>)<sup>${k}</sup>.`, `= ${v}<sup>${k}</sup> = <b>${v ** k}</b>.`],
            tip: `Rewrite everything with the same base. You often don't even need to solve for x!`,
            mistakes: [{ value: v * k, why: `(2<sup>x</sup>)<sup>${k}</sup> means multiply ${v} by itself ${k} times, not ${v} × ${k}.` }],
          };
        },
      },
    ],
  },

  {
    id: 'operations', name: 'Custom Operations & Functions', icon: '🎛️', strand: 'Algebra',
    variants: [
      {
        id: 'hash', level: 1,
        gen(r) {
          let a, b; do { a = r.int(2, 6); b = r.int(2, 6); } while (a === b);
          let p, q; do { p = r.int(1, 9); q = r.int(1, 9); } while (p === q);
          return {
            q: `If x # y = ${a}x + ${b}y, then 4 # 1 = ${a}(4) + ${b}(1) = ${4 * a + b}. What is ${p} # ${q}?`, answer: N(a * p + b * q),
            steps: [`Replace x with ${p} and y with ${q}.`, `${a}(${p}) + ${b}(${q}) = ${a * p} + ${b * q} = <b>${a * p + b * q}</b>.`],
            tip: `New symbols are just rules. Copy the rule, then substitute carefully — first number goes where x is, second where y is.`,
            mistakes: [{ value: a * q + b * p, why: `You swapped x and y. The first number (${p}) replaces x.` }],
          };
        },
      },
      {
        id: 'nested', level: 2,
        gen(r) {
          const a = r.int(2, 5), b = r.int(1, 9), c = r.int(1, 30);
          const op = (x, y) => x * x - y;
          const inner = op(a, b);
          return {
            q: `Define x ◇ y = x² − y. What is (${a} ◇ ${b}) ◇ ${c}?`, answer: N(op(inner, c)),
            steps: [`Inside first: ${a} ◇ ${b} = ${a}² − ${b} = ${inner}.`, `Then ${inner} ◇ ${c} = ${inner}² − ${c} = ${inner * inner} − ${c} = <b>${op(inner, c)}</b>.`],
            tip: `Work from the innermost parentheses outward, and write each intermediate result down.`,
            mistakes: [{ value: op(a, op(b, c)), why: `You grouped it as ${a} ◇ (${b} ◇ ${c}). Follow the parentheses: do (${a} ◇ ${b}) first.` }],
          };
        },
      },
      {
        id: 'compose', level: 2,
        gen(r) {
          const a = r.int(2, 5), b = r.int(-6, 9), c = r.int(-3, 6);
          const f = (x) => a * x + b;
          return {
            q: `If f(x) = ${a}x ${b < 0 ? `− ${-b}` : `+ ${b}`}, what is f(f(${c}))?`, answer: N(f(f(c))),
            steps: [`Inside first: f(${c}) = ${a}(${c}) ${b < 0 ? `− ${-b}` : `+ ${b}`} = ${f(c)}.`, `Then f(${f(c)}) = ${a}(${f(c)}) ${b < 0 ? `− ${-b}` : `+ ${b}`} = <b>${f(f(c))}</b>.`],
            tip: `f(f(x)) means "do f, then do f again to the answer". Inside out!`,
            mistakes: [{ value: f(c), why: `That's just f(${c}). You need to apply f a second time.` }],
          };
        },
      },
    ],
  },

  // ───────────────────────────────── Counting & probability
  {
    id: 'counting', name: 'Counting & Arrangements', icon: '🎲', strand: 'Counting & Probability',
    variants: [
      {
        id: 'outfits', level: 1,
        gen(r) {
          const s = r.int(3, 8), p = r.int(2, 6), h = r.int(2, 5);
          return {
            q: `Zoe has ${s} shirts, ${p} pairs of pants and ${h} hats. An outfit is one shirt, one pair of pants and one hat. How many different outfits can she make?`,
            unit: 'outfits', answer: N(s * p * h),
            steps: [`Each shirt can go with each pair of pants and each hat.`, `Multiply the choices: ${s} × ${p} × ${h} = <b>${s * p * h}</b>.`],
            tip: `Counting principle: independent choices in a row → multiply. "Or" choices (one thing OR another) → add.`,
            mistakes: [{ value: s + p + h, why: `Adding counts the items, not the combinations. Every shirt pairs with every pants and hat, so multiply.` }],
          };
        },
      },
      {
        id: 'word', level: 2,
        gen(r) {
          const w = r.pick([
            ['MATH', 24, '4!'], ['LEVEL', 30, '5! ÷ (2! × 2!)'], ['BANANA', 60, '6! ÷ (3! × 2!)'],
            ['COUNTS', 720, '6!'], ['SEESAW', 180, '6! ÷ (2! × 2!)'], ['APPLE', 60, '5! ÷ 2!'], ['PEPPER', 60, '6! ÷ (3! × 2!)'],
            ['TOOTH', 30, '5! ÷ (2! × 2!)'], ['ADDED', 20, '5! ÷ 3!'],
          ]);
          const [word, ans, formula] = w;
          const naive = fact(word.length);
          return {
            q: `How many different arrangements of the letters in the word ${word} are there?`, unit: 'arrangements', answer: N(ans),
            steps: [
              `${word.length} letters can be ordered in ${word.length}! = ${naive} ways if they were all different.`,
              naive === ans ? `All letters are different, so the answer is <b>${ans}</b>.` : `But swapping identical letters makes the same word, so divide by the repeats: ${formula} = <b>${ans}</b>.`,
            ],
            tip: `Arrangements with repeated letters: n! ÷ (k₁! × k₂! × …), one k! for each letter that repeats k times.`,
            mistakes: naive !== ans ? [{ value: naive, why: `${word} has repeated letters. Swapping two identical letters doesn't make a new arrangement, so divide by the factorial of each repeat count.` }] : [],
          };
        },
      },
      {
        id: 'committee', level: 1,
        gen(r) {
          const n = r.int(5, 10), k = r.int(2, 4);
          const perm = fact(n) / fact(n - k);
          return {
            q: `How many ways can a coach choose a ${k}-person team from ${n} Mathletes? (Order does not matter.)`, unit: 'ways', answer: N(choose(n, k)),
            steps: [`If order mattered: ${n} × ${Array.from({ length: k - 1 }, (_, i) => n - 1 - i).join(' × ')} = ${perm}.`, `Each team gets counted ${k}! = ${fact(k)} times (once per ordering), so divide: ${perm} ÷ ${fact(k)} = <b>${choose(n, k)}</b>.`],
            tip: `Order doesn't matter (teams, committees, handshakes) → combinations: count with order, then divide by k!.`,
            mistakes: [{ value: perm, why: `That counts ordered lists (like picking 1st, 2nd, 3rd place). A team is the same no matter what order you pick it, so divide by ${k}!.` }],
          };
        },
      },
      {
        id: 'grid', level: 2,
        gen(r) {
          const m = r.int(2, 6), n = r.int(2, 5);
          return {
            q: `A frog hops from (0, 0) to (${m}, ${n}). Each hop moves either 1 unit right or 1 unit up. How many different paths can it take?`, unit: 'paths', answer: N(choose(m + n, m)),
            steps: [`Every path has exactly ${m} rights (R) and ${n} ups (U): ${m + n} hops total.`, `A path is just choosing which ${m} of the ${m + n} hops are R's.`, `C(${m + n}, ${m}) = <b>${choose(m + n, m)}</b>.`],
            tip: `Grid paths = arrangements of R's and U's = C(total, rights). For grids with blocked spots, write the number of ways to reach each point (add left + below) — "Pascal's method".`,
            mistakes: [{ value: m * n, why: `Multiplying the dimensions doesn't count paths. Each path is a word of R's and U's — count the arrangements.` }, { value: 2 ** (m + n), why: `Not every R/U sequence ends at (${m}, ${n}) — you need exactly ${m} R's and ${n} U's.` }],
          };
        },
      },
      {
        id: 'handshake', level: 1,
        gen(r) {
          const n = r.int(5, 20);
          return {
            q: `At a party, each of ${n} people shakes hands with every other person exactly once. How many handshakes take place?`, unit: 'handshakes', answer: N((n * (n - 1)) / 2),
            steps: [`Each person shakes ${n - 1} hands: ${n} × ${n - 1} = ${n * (n - 1)}.`, `But each handshake involves 2 people, so it was counted twice: ${n * (n - 1)} ÷ 2 = <b>${(n * (n - 1)) / 2}</b>.`],
            tip: `Handshakes = C(n, 2) = n(n − 1) ÷ 2. Same idea counts games in a round-robin and segments between points.`,
            mistakes: [{ value: n * (n - 1), why: `You counted every handshake twice (once for each person). Divide by 2.` }],
          };
        },
      },
      {
        id: 'teams', level: 2,
        gen(r) {
          const n = r.int(4, 7);
          return {
            q: `${n} friends split up: some go buy soda and the rest wait for pizza, with at least one person on each task. In how many ways can they divide themselves?`, unit: 'ways', answer: N(2 ** n - 2),
            steps: [`Each friend chooses soda or pizza: 2 choices each, 2<sup>${n}</sup> = ${2 ** n} ways.`, `Remove the 2 bad cases: everyone on soda, or everyone on pizza.`, `${2 ** n} − 2 = <b>${2 ** n - 2}</b>.`],
            tip: `"At least one" problems: count everything, then subtract the cases that break the rule (complementary counting).`,
            mistakes: [{ value: 2 ** n, why: `That includes the cases where everyone is on one task. Each task needs at least one person — subtract those 2 cases.` }, { value: 2 ** n - 1, why: `There are 2 bad cases to remove (all soda AND all pizza), not 1.` }],
          };
        },
      },
      {
        id: 'digitprod', level: 3,
        gen(r) {
          const P = r.pick([8, 12, 18, 20, 24, 30]);
          const groups = [];
          for (let a = 1; a <= 9; a++) for (let b = a; b <= 9; b++) for (let c = b; c <= 9; c++) {
            if (a * b * c === P) {
              const ways = new Set([a, b, c]).size === 3 ? 6 : new Set([a, b, c]).size === 2 ? 3 : 1;
              groups.push({ d: [a, b, c], ways });
            }
          }
          const ans = groups.reduce((t, g) => t + g.ways, 0);
          return {
            q: `How many three-digit positive integers have digits whose product is ${P}?`, unit: 'integers', answer: N(ans),
            steps: [
              `List the digit sets (smallest first) with product ${P}: ${groups.map((g) => `{${g.d.join(', ')}}`).join(', ')}.`,
              `Count orderings: all different → 6, two the same → 3, all same → 1.`,
              `${groups.map((g) => g.ways).join(' + ')} = <b>${ans}</b>.`,
            ],
            tip: `Organize first, then count. List digit groups in increasing order so you never miss or repeat one (don't forget 1 as a digit!), then multiply by the number of orderings.`,
            mistakes: [{ value: groups.length, why: `You counted digit sets, but each set can be arranged in several orders (e.g. 1, 2, 9 makes 129, 192, 219, …).` }],
          };
        },
      },
    ],
  },

  {
    id: 'probability', name: 'Probability', icon: '🪙', strand: 'Counting & Probability',
    variants: [
      {
        id: 'dice', level: 1,
        gen(r) {
          const s = r.int(3, 11), c = 6 - Math.abs(s - 7);
          const pairs = []; for (let a = 1; a <= 6; a++) { const b = s - a; if (b >= 1 && b <= 6) pairs.push(`(${a},${b})`); }
          return {
            q: `Two standard six-sided dice are rolled. What is the probability that the sum is ${s}?`, form: COMMON, answer: F(c, 36),
            steps: [`There are 6 × 6 = 36 equally likely outcomes.`, `Ways to get ${s}: ${pairs.join(' ')} → ${c} ways.`, `Probability = ${fr(c, 36)} = <b>${frf(F(c, 36))}</b>.`],
            tip: `Sums of two dice aren't equally likely — 7 is most common (6 ways). Count ordered pairs out of 36, and remember (1,2) and (2,1) are different.`,
            mistakes: [{ value: F(1, 11), why: `There are 11 possible sums, but they aren't equally likely. Use the 36 equally likely (die 1, die 2) outcomes.` }, ...(c > 1 ? [{ value: F(Math.ceil(c / 2), 36), why: `Remember (a, b) and (b, a) are different outcomes — the dice are different dice.` }] : [])],
          };
        },
      },
      {
        id: 'coinsk', level: 2,
        gen(r) {
          const n = r.int(3, 6), k = r.int(1, n - 1);
          return {
            q: `A fair coin is flipped ${n} times. What is the probability of getting exactly ${k} head${k > 1 ? 's' : ''}?`, form: COMMON, answer: F(choose(n, k), 2 ** n),
            steps: [`Total outcomes: 2<sup>${n}</sup> = ${2 ** n}.`, `Ways to choose which ${k} flips are heads: C(${n}, ${k}) = ${choose(n, k)}.`, `Probability = ${F(choose(n, k), 2 ** n).d === 2 ** n ? '' : `${fr(choose(n, k), 2 ** n)} = `}<b>${frf(F(choose(n, k), 2 ** n))}</b>.`],
            tip: `"Exactly k heads in n flips" = C(n, k) ÷ 2<sup>n</sup>. Pascal's triangle row n gives all the C(n, k) at once.`,
            mistakes: [{ value: F(1, 2 ** n), why: `That's the chance of one specific sequence (like HHT…). Several different sequences have exactly ${k} heads — count them with C(${n}, ${k}).` }, { value: F(k, n), why: `Probability isn't heads ÷ flips. Count the outcomes with exactly ${k} heads out of all 2<sup>${n}</sup> outcomes.` }],
          };
        },
      },
      {
        id: 'atleast', level: 2,
        gen(r) {
          const n = r.int(3, 7);
          return {
            q: `A fair coin is flipped ${n} times. What is the probability of getting at least one head?`, form: COMMON, answer: F(2 ** n - 1, 2 ** n),
            steps: [`Opposite of "at least one head" = "no heads" = all tails.`, `P(all tails) = (${fr(1, 2)})<sup>${n}</sup> = ${fr(1, 2 ** n)}.`, `P(at least one head) = 1 − ${fr(1, 2 ** n)} = <b>${fr(2 ** n - 1, 2 ** n)}</b>.`],
            tip: `"At least one" → use the complement: 1 − P(none). It's almost always faster.`,
            mistakes: [{ value: F(1, 2 ** n), why: `That's the chance of NO heads. "At least one" is everything else: 1 minus that.` }, { value: F(n, 2 ** n), why: `That counts only "exactly one head" cases. At least one includes 2, 3, … heads too. Use 1 − P(no heads).` }],
          };
        },
      },
      {
        id: 'marbles', level: 2,
        gen(r) {
          const red = r.int(3, 8), blue = r.int(2, 8), t = red + blue;
          return {
            q: `A bag has ${red} red and ${blue} blue marbles. Two marbles are drawn without replacement. What is the probability both are red?`, form: COMMON, answer: F(red * (red - 1), t * (t - 1)),
            steps: [`First red: ${fr(red, t)}.`, `Now ${red - 1} red out of ${t - 1} left: ${fr(red - 1, t - 1)}.`, `Multiply: ${fr(red, t)} × ${fr(red - 1, t - 1)} = <b>${frf(F(red * (red - 1), t * (t - 1)))}</b>.`],
            tip: `"Without replacement" → after each draw, subtract one from both the count you want AND the total.`,
            mistakes: [{ value: F(red * red, t * t), why: `You kept the same numbers for the second draw. Without replacement, there's one fewer red and one fewer marble total.` }],
          };
        },
      },
      {
        id: 'consecsame', level: 3,
        gen(r) {
          const n = r.int(4, 7);
          return {
            q: `A fair coin is tossed ${n} times. What is the probability that at least two consecutive tosses show the same result?`, form: COMMON, answer: F(2 ** n - 2, 2 ** n),
            steps: [`Complement: NO two consecutive tosses match → the tosses alternate.`, `Only 2 sequences alternate: HTHT… and THTH….`, `P(alternating) = ${fr(2, 2 ** n)}, so the answer is 1 − ${fr(2, 2 ** n)} = <b>${frf(F(2 ** n - 2, 2 ** n))}</b>.`],
            tip: `When "at least" feels messy, describe the opposite. Here the opposite (perfect alternation) has only 2 cases.`,
            mistakes: [{ value: F(2, 2 ** n), why: `That's the chance they alternate perfectly — the opposite of what's asked. Subtract it from 1.` }],
          };
        },
      },
    ],
  },

  {
    id: 'sets', name: 'Sets, Venn Diagrams & Multiples', icon: '⭕', strand: 'Counting & Probability',
    variants: [
      {
        id: 'neither', level: 1,
        gen(r) {
          const both = r.int(2, 8), a = both + r.int(3, 12), b = both + r.int(3, 12), neither = r.int(1, 10);
          const T = a + b - both + neither;
          return {
            q: `In a class of ${T} students, ${a} play soccer, ${b} play basketball, and ${both} play both. How many students play neither sport?`, unit: 'students', answer: N(neither),
            steps: [`Students playing at least one = ${a} + ${b} − ${both} = ${a + b - both} (subtract "both" because they were counted twice).`, `Neither = ${T} − ${a + b - both} = <b>${neither}</b>.`],
            tip: `Draw a Venn diagram and fill the middle (both) first, then the "only" parts. Total = A + B − both + neither.`,
            mistakes: [{ value: T - a - b, why: `The ${both} students who play both were subtracted twice. Add them back once.` }],
          };
        },
      },
      {
        id: 'venn', level: 3,
        gen(r) {
          const [f1, f2] = r.pick([[2, 3], [2, 4], [3, 4], [3, 5], [4, 5], [2, 5]]);
          const D = lcm(f1, f2);
          const restFrac = F(D - D / f1 - D / f2, D);
          let Nn, both, neither;
          do { Nn = D * r.int(1, 5); both = r.int(1, 6); neither = both + (Nn * restFrac.n) / restFrac.d; } while (both > Nn / f2);
          return {
            q: `In a class, ${fr(1, f1)} of the students play piano and ${fr(1, f2)} play cello. ${both} students play both, and ${neither} play neither. How many students are in the class?`, unit: 'students', answer: N(Nn),
            steps: [
              `Let N = class size. Piano or cello = N/${f1} + N/${f2} − ${both}.`,
              `Everyone: N = N/${f1} + N/${f2} − ${both} + ${neither}.`,
              `N − N/${f1} − N/${f2} = ${neither - both} → ${frf(restFrac)} × N = ${neither - both}.`,
              `N = <b>${Nn}</b>.`,
            ],
            tip: `Venn diagram rule: Total = A + B − Both + Neither. Fractions of the whole are fine — the "both" overlap still gets subtracted once.`,
            mistakes: [{ value: ((neither + both) * restFrac.d) / restFrac.n, why: `Sign slip: the ${both} students in both groups get <i>subtracted</i> (they were counted twice), not added.` }],
          };
        },
      },
      {
        id: 'orcount', level: 2,
        gen(r) {
          let a, b; do { a = r.int(2, 7); b = r.int(3, 9); } while (a === b || a % b === 0 || b % a === 0);
          const n = r.int(50, 200);
          const A = Math.floor(n / a), B = Math.floor(n / b), AB = Math.floor(n / lcm(a, b));
          return {
            q: `How many integers from 1 to ${n} are divisible by ${a} or ${b} (or both)?`, unit: 'integers', answer: N(A + B - AB),
            steps: [`Multiples of ${a}: ⌊${n}/${a}⌋ = ${A}. Multiples of ${b}: ⌊${n}/${b}⌋ = ${B}.`, `Multiples of both = multiples of LCM ${lcm(a, b)}: ⌊${n}/${lcm(a, b)}⌋ = ${AB}.`, `${A} + ${B} − ${AB} = <b>${A + B - AB}</b>.`],
            tip: `"A or B" = A + B − both. The overlap of "multiples of a" and "multiples of b" is multiples of their LCM (not a × b, unless they share no factors).`,
            mistakes: [{ value: A + B, why: `Numbers divisible by both (multiples of ${lcm(a, b)}) got counted twice. Subtract them once.` }, ...(gcd(a, b) > 1 ? [{ value: A + B - Math.floor(n / (a * b)), why: `The overlap is multiples of LCM(${a}, ${b}) = ${lcm(a, b)}, not ${a * b}.` }] : [])],
          };
        },
      },
      {
        id: 'summult', level: 2,
        gen(r) {
          const k = r.int(3, 9), n = r.int(30, 80), m = Math.floor(n / k);
          return {
            q: `What is the sum of all the multiples of ${k} from 1 to ${n}?`, answer: N((k * m * (m + 1)) / 2),
            steps: [`Multiples: ${k}, ${2 * k}, …, ${k * m} → that's ${k} × (1 + 2 + … + ${m}).`, `1 + 2 + … + ${m} = ${m} × ${m + 1} ÷ 2 = ${(m * (m + 1)) / 2}.`, `${k} × ${(m * (m + 1)) / 2} = <b>${(k * m * (m + 1)) / 2}</b>.`],
            tip: `Factor out the common multiple: k + 2k + … + mk = k(1 + 2 + … + m) = k × m(m + 1)/2.`,
            mistakes: [{ value: (k * (m - 1) * m) / 2, why: `You missed the last multiple (${k * m}). There are ⌊${n}/${k}⌋ = ${m} multiples.` }],
          };
        },
      },
    ],
  },

  // ───────────────────────────────── Geometry
  {
    id: 'area', name: 'Area & Perimeter', icon: '📐', strand: 'Geometry',
    variants: [
      {
        id: 'rectsq', level: 1,
        gen(r) {
          let s, k, w, l;
          do { s = r.int(3, 10); k = r.int(2, 3); w = r.int(2, 12); l = (k * s * s) / w; } while (!Number.isInteger(l) || l === w);
          return {
            q: `The area of a rectangle is ${k === 2 ? 'twice' : 'three times'} the area of a square with side length ${s} cm. One side of the rectangle is ${w} cm. What is the perimeter of the rectangle?`, unit: 'cm', answer: N(2 * (w + l)),
            steps: [`Square area = ${s} × ${s} = ${s * s}. Rectangle area = ${k} × ${s * s} = ${k * s * s}.`, `Other side = ${k * s * s} ÷ ${w} = ${l}.`, `Perimeter = 2 × (${w} + ${l}) = <b>${2 * (w + l)}</b> cm.`],
            tip: `Write down what you know (area) and what's asked (perimeter) before computing — it's easy to stop one step early.`,
            mistakes: [{ value: k * s * s, why: `That's the area. The question asks for the perimeter (distance around).` }, { value: w + l, why: `That's only two sides. Perimeter adds all four: 2 × (length + width).` }],
          };
        },
      },
      {
        id: 'perimsum', level: 2,
        gen(r) {
          let L, W; do { L = r.int(4, 15); W = r.int(2, 14); } while (L === W);
          const P = 2 * (L + W), S = 2 * L;
          return {
            q: `A rectangle has perimeter ${P} units, and two of its side lengths sum to ${S} units. What is the area of the rectangle?`, unit: 'units²', answer: N(L * W),
            steps: [
              `Two different (adjacent) sides add to half the perimeter: ${P} ÷ 2 = ${P / 2}. That's not ${S}.`,
              `So the two sides that sum to ${S} must be the two equal, opposite sides: each is ${S / 2}.`,
              `The other side = ${P / 2} − ${S / 2} = ${W}. Area = ${S / 2} × ${W} = <b>${L * W}</b>.`,
            ],
            tip: `"Two of its sides" doesn't have to mean length + width. Check which pair of sides makes the numbers work.`,
            mistakes: [{ value: (S / 2) ** 2, why: `Not a square! One side is ${S / 2}; find the other from the perimeter.` }],
          };
        },
      },
      {
        id: 'trap', level: 2,
        gen(r) {
          let b1, b2, h; do { b1 = r.int(3, 15); b2 = r.int(b1 + 2, 24); h = r.int(2, 12); } while (((b1 + b2) * h) % 2);
          return {
            q: `A trapezoid has parallel sides of length ${b1} and ${b2} and a height of ${h}. What is its area?`, unit: 'units²', answer: N(((b1 + b2) * h) / 2),
            steps: [`Area = average of the bases × height.`, `(${b1} + ${b2}) ÷ 2 = ${(b1 + b2) / 2}; × ${h} = <b>${((b1 + b2) * h) / 2}</b>.`],
            tip: `Trapezoid area = (b₁ + b₂)/2 × h. Think of it as a rectangle whose width is the average of the two bases.`,
            mistakes: [{ value: (b1 + b2) * h, why: `Don't forget to divide by 2 — you need the <i>average</i> of the bases.` }],
          };
        },
      },
      {
        id: 'notch', level: 2,
        gen(r) {
          const L = r.int(8, 20), W = r.int(6, 15), c = r.int(2, Math.min(L, W) - 3);
          return {
            q: `A ${L} by ${W} rectangle has a ${c} by ${c} square cut out of one corner. What is the perimeter of the remaining shape?`, unit: 'units', answer: N(2 * (L + W)),
            steps: [`Cutting a corner removes a ${c} piece from two sides…`, `…but adds two new edges of length ${c} going inward.`, `They exactly cancel, so the perimeter is still 2 × (${L} + ${W}) = <b>${2 * (L + W)}</b>.`],
            tip: `Corner notches don't change perimeter — slide the inside edges outward and you get the original rectangle. (Area does change!)`,
            mistakes: [{ value: 2 * (L + W) - 2 * c, why: `The cut removes ${2 * c} of edge but creates ${2 * c} of new edge. They cancel.` }, { value: L * W - c * c, why: `That's the area. The question asks for perimeter.` }],
          };
        },
      },
    ],
  },

  {
    id: 'circles', name: 'Circles', icon: '⚪', strand: 'Geometry',
    variants: [
      {
        id: 'annulus', level: 2,
        gen(r) {
          const d = 2 * r.int(1, 5), D = d + 2 * r.int(1, 5);
          const ans = PI(D * D - d * d, 4);
          return {
            q: `A large circle has diameter ${D} ft. A smaller circle inside it has diameter ${d} ft. What is the area of the region inside the large circle but outside the small one?`, form: 'in terms of π', unit: 'ft²', answer: ans,
            steps: [`Radii are half the diameters: R = ${D / 2}, r = ${d / 2}.`, `Big area − small area = π(${D / 2})² − π(${d / 2})² = ${(D * D) / 4}π − ${(d * d) / 4}π.`, `= <b>${(D * D - d * d) / 4}π</b> ft².`],
            tip: `Area uses the RADIUS. When a problem gives diameters, halve them first — circle this step on your paper.`,
            mistakes: [{ value: PI(D * D - d * d), why: `You used the diameters as radii. Halve each diameter first (that makes the answer 4 times smaller).` }, { value: PI((D - d) * (D - d), 4), why: `Subtract the two areas, not the diameters. π(R² − r²) is not π(R − r)².` }],
          };
        },
      },
      {
        id: 'circarea', level: 1,
        gen(r) {
          const k = 2 * r.int(2, 10);
          return {
            q: `A circle has circumference ${k}π cm. What is its area?`, form: 'in terms of π', unit: 'cm²', answer: PI((k * k) / 4),
            steps: [`Circumference = 2πr = ${k}π → r = ${k / 2}.`, `Area = πr² = π × ${k / 2}² = <b>${(k * k) / 4}π</b> cm².`],
            tip: `Get to the radius first, then use whichever formula you need: C = 2πr, A = πr².`,
            mistakes: [{ value: PI(k * k), why: `${k} is the diameter (2r), not the radius. r = ${k / 2}.` }, { value: PI(k), why: `That's the circumference again. Area = πr².` }],
          };
        },
      },
      {
        id: 'areacirc', level: 1,
        gen(r) {
          const rr = r.int(2, 12);
          return {
            q: `A circle has area ${rr * rr}π m². What is its circumference?`, form: 'in terms of π', unit: 'm', answer: PI(2 * rr),
            steps: [`πr² = ${rr * rr}π → r² = ${rr * rr} → r = ${rr}.`, `Circumference = 2πr = <b>${2 * rr}π</b> m.`],
            tip: `Area → square root to get the radius. Then circumference = 2πr.`,
            mistakes: [{ value: PI(rr), why: `Circumference is 2πr, so double the radius.` }],
          };
        },
      },
      {
        id: 'semi', level: 2,
        gen(r) {
          const d = 2 * r.int(2, 9);
          return {
            q: `What is the area of a semicircle with diameter ${d} inches?`, form: 'in terms of π', unit: 'in²', answer: PI(d * d, 8),
            steps: [`r = ${d} ÷ 2 = ${d / 2}.`, `Full circle: π × ${d / 2}² = ${(d * d) / 4}π.`, `Half of it: <b>${specToString(PI(d * d, 8))}</b> in².`],
            tip: `Semicircle = half of πr². Two halvings happen here (diameter → radius, circle → semicircle) — don't skip either.`,
            mistakes: [{ value: PI(d * d, 2), why: `You used the diameter as the radius. r = ${d / 2}.` }, { value: PI(d * d, 4), why: `That's the whole circle. A semicircle is half.` }],
          };
        },
      },
    ],
  },

  {
    id: 'pythag', name: 'Right Triangles & Pythagorean Theorem', icon: '📏', strand: 'Geometry',
    variants: [
      {
        id: 'hyp', level: 1,
        gen(r) {
          const [a0, b0, c0] = r.pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]]);
          const k = r.int(1, a0 === 3 ? 6 : 2);
          const a = a0 * k, b = b0 * k, c = c0 * k;
          return {
            q: `A right triangle has legs of length ${a} and ${b}. What is the length of the hypotenuse?`, unit: 'units', answer: N(c),
            steps: [`a² + b² = c² → ${a * a} + ${b * b} = ${c * c}.`, `c = √${c * c} = <b>${c}</b>.`, k > 1 ? `(Shortcut: it's the ${a0}-${b0}-${c0} triangle scaled by ${k}.)` : `(This is the famous ${a0}-${b0}-${c0} triangle.)`],
            tip: `Memorize the common triples — 3-4-5, 5-12-13, 8-15-17, 7-24-25 — and their multiples. Divide out a common factor first to spot them.`,
            mistakes: [{ value: a + b, why: `The hypotenuse isn't the sum of the legs. Use a² + b² = c².` }, { value: c * c, why: `You found c². Take the square root.` }],
          };
        },
      },
      {
        id: 'leg', level: 1,
        gen(r) {
          const [a0, b0, c0] = r.pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [6, 8, 10]]);
          const k = r.int(1, 3);
          const a = a0 * k, b = b0 * k, c = c0 * k;
          return {
            q: `A ladder ${c} feet long leans against a wall. Its base is ${a} feet from the wall. How high up the wall does it reach?`, unit: 'feet', answer: N(b),
            steps: [`The ladder is the hypotenuse: ${a}² + h² = ${c}².`, `h² = ${c * c} − ${a * a} = ${b * b}.`, `h = <b>${b}</b> feet.`],
            tip: `Missing leg → subtract squares: leg² = hyp² − other leg². The hypotenuse is always the longest side, across from the right angle.`,
            mistakes: [{ value: Math.round(Math.sqrt(c * c + a * a) * 100) / 100, why: `You added the squares. The ladder is the hypotenuse, so subtract: ${c}² − ${a}².` }],
          };
        },
      },
      {
        id: 'iso', level: 2,
        gen(r) {
          const a = r.int(2, 15);
          return {
            q: `An isosceles right triangle has legs of length ${a}. What is the length of its hypotenuse?`, form: 'simplest radical form', unit: 'units', answer: RAD(a, 2),
            steps: [`c² = ${a}² + ${a}² = ${2 * a * a}.`, `c = √${2 * a * a} = <b>${a}√2</b>.`],
            tip: `45-45-90 triangle: hypotenuse = leg × √2. 30-60-90: sides are x, x√3, 2x. These two come up constantly.`,
            mistakes: [{ value: 2 * a, why: `The hypotenuse is leg × √2, not leg × 2.` }],
          };
        },
      },
      {
        id: 'rhombus', level: 3,
        gen(r) {
          let x, y; do { x = r.int(1, 8); y = r.int(1, 10); } while (x === y);
          const d1 = 2 * x, d2 = 2 * y, A = 2 * x * y;
          return {
            q: `A rhombus has area ${A} in² and one diagonal of length ${d1} inches. How long is a side of the rhombus?`, form: 'simplest radical form', unit: 'inches', answer: RAD(1, x * x + y * y),
            steps: [
              `Rhombus area = (d₁ × d₂) ÷ 2 → ${A} = ${d1} × d₂ ÷ 2 → d₂ = ${d2}.`,
              `The diagonals cut each other in half at right angles, making 4 right triangles with legs ${x} and ${y}.`,
              `Side = √(${x}² + ${y}²) = √${x * x + y * y}${simplifyRadical(x * x + y * y).a > 1 ? ` = <b>${specToString(RAD(1, x * x + y * y))}</b>` : ''}${simplifyRadical(x * x + y * y).a > 1 ? '' : ` → <b>${specToString(RAD(1, x * x + y * y))}</b>`}.`,
            ],
            tip: `Rhombus diagonals are perpendicular bisectors. Use HALF of each diagonal as the legs of a right triangle.`,
            mistakes: [{ value: Math.sqrt(d1 * d1 + d2 * d2), why: `Use half of each diagonal — the diagonals cross at their midpoints.` }],
          };
        },
      },
      {
        id: 'dist', level: 2,
        gen(r) {
          const [a0, b0, c0] = r.pick([[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17]]);
          const x1 = r.int(-5, 5), y1 = r.int(-5, 5);
          const sx = r.pick([1, -1]), sy = r.pick([1, -1]);
          const x2 = x1 + sx * a0, y2 = y1 + sy * b0;
          return {
            q: `What is the distance between the points (${x1}, ${y1}) and (${x2}, ${y2})?`, unit: 'units', answer: N(c0),
            steps: [`Horizontal change: |${x2} − (${x1})| = ${a0}. Vertical change: |${y2} − (${y1})| = ${b0}.`, `Distance = √(${a0}² + ${b0}²) = √${c0 * c0} = <b>${c0}</b>.`],
            tip: `The distance formula is just the Pythagorean theorem. Sketch the right triangle: legs are the x-change and y-change.`,
            mistakes: [{ value: a0 + b0, why: `That's the "taxicab" distance along the grid. Straight-line distance uses the Pythagorean theorem.` }],
          };
        },
      },
    ],
  },

  {
    id: 'angles', name: 'Angles & Polygons', icon: '🔺', strand: 'Geometry',
    variants: [
      {
        id: 'intsum', level: 1,
        gen(r) {
          const n = r.int(5, 14);
          return {
            q: `What is the sum of the interior angles of a polygon with ${n} sides?`, unit: 'degrees', answer: N((n - 2) * 180),
            steps: [`From one vertex you can split an n-gon into n − 2 triangles: ${n - 2} triangles.`, `${n - 2} × 180° = <b>${(n - 2) * 180}°</b>.`],
            tip: `Interior angle sum = (n − 2) × 180°. Exterior angles of ANY convex polygon always add to 360°.`,
            mistakes: [{ value: n * 180, why: `An n-gon splits into n − 2 triangles, not n. Use (n − 2) × 180.` }],
          };
        },
      },
      {
        id: 'regint', level: 2,
        gen(r) {
          const n = r.pick([5, 6, 8, 9, 10, 12, 15, 18, 20, 24, 30, 36]);
          return {
            q: `What is the measure of each interior angle of a regular polygon with ${n} sides?`, unit: 'degrees', answer: N(180 - 360 / n),
            steps: [`Each exterior angle = 360° ÷ ${n} = ${360 / n}°.`, `Interior + exterior = 180°, so interior = 180° − ${360 / n}° = <b>${180 - 360 / n}°</b>.`],
            tip: `Go through the exterior angle: 360 ÷ n is quick, then subtract from 180. Faster than (n − 2) × 180 ÷ n.`,
            mistakes: [{ value: 360 / n, why: `That's the exterior angle. The interior angle is 180° minus that.` }],
          };
        },
      },
      {
        id: 'turning', level: 2,
        gen(r) {
          const t = r.pick([10, 12, 15, 18, 20, 24, 30, 36, 40, 45, 60, 72]);
          const s = r.int(1, 3);
          const n = 360 / t;
          return {
            q: `Carson pushes a cart ${s} meter${s > 1 ? 's' : ''} in a straight line, then turns ${t}° to the right, and repeats. When he first returns to where he started, how far has he pushed the cart in total?`, unit: 'meters', answer: N(n * s),
            steps: [`He traces a regular polygon; each ${t}° turn is an exterior angle.`, `Exterior angles total 360°, so there are 360 ÷ ${t} = ${n} sides.`, `Distance = ${n} × ${s} = <b>${n * s}</b> meters.`],
            tip: `Walking around any closed shape, your total turning is exactly 360°. Number of sides = 360 ÷ (turn per corner).`,
            mistakes: [{ value: (180 / t) * s, why: `A full trip around turns you 360°, not 180°.` }, ...(s > 1 ? [{ value: n, why: `That's the number of sides. Each side is ${s} meters.` }] : [])],
          };
        },
      },
      {
        id: 'ratio', level: 2,
        gen(r) {
          let p, q, k, sum; do { p = r.int(1, 5); q = r.int(p, 7); k = r.int(q, 9); sum = p + q + k; } while (180 % sum !== 0 || p === k);
          return {
            q: `The angles of a triangle are in the ratio ${p} : ${q} : ${k}. What is the measure of the largest angle?`, unit: 'degrees', answer: N((180 / sum) * k),
            steps: [`Total parts: ${p} + ${q} + ${k} = ${sum}. Angles total 180°.`, `One part = 180° ÷ ${sum} = ${180 / sum}°.`, `Largest = ${k} × ${180 / sum}° = <b>${(180 / sum) * k}°</b>.`],
            tip: `Ratio problems → find one "part" first. Check: all angles should add to 180°.`,
            mistakes: [{ value: (360 / sum) * k, why: `A triangle's angles add to 180°, not 360°.` }],
          };
        },
      },
      {
        id: 'diag', level: 2,
        gen(r) {
          const n = r.int(5, 20);
          return {
            q: `How many diagonals does a convex polygon with ${n} sides have?`, unit: 'diagonals', answer: N((n * (n - 3)) / 2),
            steps: [`From each vertex, you can't draw a diagonal to itself or its 2 neighbors: ${n} − 3 = ${n - 3} diagonals each.`, `${n} × ${n - 3} counts every diagonal twice (once from each end).`, `${n * (n - 3)} ÷ 2 = <b>${(n * (n - 3)) / 2}</b>.`],
            tip: `Diagonals = n(n − 3)/2. Or: all segments between vertices C(n, 2) minus the n sides.`,
            mistakes: [{ value: (n * (n - 1)) / 2, why: `That counts all segments between vertices, including the ${n} sides. Subtract the sides.` }, { value: n * (n - 3), why: `Each diagonal has 2 ends, so you counted each twice. Divide by 2.` }],
          };
        },
      },
    ],
  },

  // ───────────────────────────────── Data
  {
    id: 'stats', name: 'Mean, Median & Mode', icon: '📊', strand: 'Data & Statistics',
    variants: [
      {
        id: 'missing', level: 1,
        gen(r) {
          const M = r.int(70, 92);
          const four = Array.from({ length: 4 }, () => r.int(M - 15, Math.min(100, M + 10)));
          const fifth = 5 * M - four.reduce((a, b) => a + b, 0);
          if (fifth < 40 || fifth > 100) return null;
          return {
            q: `Riya's average on 5 quizzes is ${M}. Four of her scores are ${four.join(', ')}. What was her fifth score?`, answer: N(fifth),
            steps: [`Total of all 5 = average × count = ${M} × 5 = ${5 * M}.`, `Sum of the four = ${four.reduce((a, b) => a + b, 0)}.`, `Fifth = ${5 * M} − ${four.reduce((a, b) => a + b, 0)} = <b>${fifth}</b>.`],
            tip: `Averages → think about the TOTAL. Total = average × count. Most mean problems become easy once you switch to totals.`,
            mistakes: [],
          };
        },
      },
      {
        id: 'raise', level: 2,
        gen(r) {
          const n = r.int(3, 6), A = r.int(78, 88), B = A + r.int(1, 3);
          const need = (n + 1) * B - n * A;
          if (need > 100) return null;
          return {
            q: `Liam's average on ${n} tests is ${A}. What score does he need on the next test to raise his average to ${B}?`, answer: N(need),
            steps: [`Current total: ${n} × ${A} = ${n * A}.`, `Needed total after ${n + 1} tests: ${n + 1} × ${B} = ${(n + 1) * B}.`, `Score needed = ${(n + 1) * B} − ${n * A} = <b>${need}</b>.`],
            tip: `Another shortcut: the new test must equal the new average PLUS enough to lift each old test by ${B - A}: ${B} + ${n} × ${B - A} = ${need}.`,
            mistakes: [{ value: 2 * B - A, why: `Raising the average by ${B - A} means lifting all ${n + 1} tests' average — the new score must cover ${n} old tests' shortfall of ${B - A} each.` }],
          };
        },
      },
      {
        id: 'meanmed', level: 2,
        gen(r) {
          const vals = Array.from({ length: 7 }, () => r.int(1, 30)).sort((a, b) => a - b);
          const s = vals.reduce((a, b) => a + b, 0);
          const adj = (7 - (s % 7)) % 7;
          vals[6] += adj;
          const sum = s + adj, mean = sum / 7, med = vals[3];
          const shuffled = r.shuffle(vals);
          return {
            q: `What is the positive difference between the mean and the median of these numbers: ${shuffled.join(', ')}?`, answer: N(Math.abs(mean - med)),
            steps: [`Sort: ${vals.join(', ')}. Median (4th of 7) = ${med}.`, `Mean = ${sum} ÷ 7 = ${mean}.`, `Difference = |${mean} − ${med}| = <b>${Math.abs(mean - med)}</b>.`],
            tip: `Always sort before finding a median. For mean, add carefully — pair numbers that make round totals.`,
            mistakes: [{ value: Math.abs(mean - shuffled[3]), why: `The median is the middle of the <i>sorted</i> list, not the middle of the list as given.` }],
          };
        },
      },
    ],
  },
];

// Extra problem types live in topics-more.js to keep this file manageable.
for (const t of TOPICS) t.variants.push(...(MORE[t.id] || []));

export const TOPIC_BY_ID = Object.fromEntries(TOPICS.map((t) => [t.id, t]));

// Build a concrete question. Retries if a generator rejects its random draw.
export function generateQuestion(topicId, level, seed, variantId) {
  const topic = TOPIC_BY_ID[topicId];
  let s = seed;
  for (let tries = 0; tries < 50; tries++, s = (s * 1103515245 + 12345) >>> 0) {
    const r = makeRng(s);
    let variants = topic.variants.filter((v) => (variantId ? v.id === variantId : v.level <= level));
    if (!variants.length) variants = topic.variants;
    // Prefer variants matching the current level
    const atLevel = variants.filter((v) => v.level === level);
    const v = variantId ? variants[0] : r.chance(0.6) && atLevel.length ? r.pick(atLevel) : r.pick(variants);
    const q = v.gen(r, level);
    if (!q) continue;
    return { ...q, topicId, variantId: v.id, level: Math.max(v.level, 1), seed: s };
  }
  throw new Error(`could not generate ${topicId}`);
}

