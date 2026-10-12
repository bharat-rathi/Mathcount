// More problem types, keyed by topic id. Same shape as the variants in topics.js.

import { gcd, lcm, factorize, factorStr, isPrime, choose, fact, simplifyRadical, ordinal } from './mathutil.js';
import { N, F, PI, RAD, fr, frf, money, COMMON } from './qhelpers.js';
import { specToString } from './answers.js';

const sgn = (v) => (v < 0 ? `− ${-v}` : `+ ${v}`);
const radStr = (spec) => specToString(spec);

export const MORE = {
  // ───────────────────────────────── Order of operations & mental math
  arith: [
    {
      id: 'diffsq', level: 2,
      gen(r) {
        const b = r.int(11, 60), a = b + r.pick([2, 4, 6, 8, 10]);
        return {
          q: `Without a calculator: what is ${a}² − ${b}²?`, answer: N(a * a - b * b),
          steps: [
            `Use the difference of squares: x² − y² = (x + y)(x − y).`,
            `(${a} + ${b})(${a} − ${b}) = ${a + b} × ${a - b} = <b>${a * a - b * b}</b>.`,
          ],
          tip: `Whenever you see one square minus another, factor it as (x + y)(x − y) instead of squaring big numbers.`,
          mistakes: [{ value: (a - b) ** 2, why: `(${a} − ${b})² is not the same as ${a}² − ${b}². Use (x + y)(x − y).` }],
        };
      },
    },
    {
      id: 'oddsum', level: 1,
      gen(r) {
        const n = r.int(8, 30), last = 2 * n - 1;
        return {
          q: `What is 1 + 3 + 5 + 7 + … + ${last}?`, answer: N(n * n),
          steps: [
            `How many odd numbers from 1 to ${last}? (${last} + 1) ÷ 2 = ${n}.`,
            `The sum of the first n odd numbers is n²: 1 = 1², 1 + 3 = 2², 1 + 3 + 5 = 3², …`,
            `So the sum is ${n}² = <b>${n * n}</b>.`,
          ],
          tip: `Test a pattern on tiny cases first (1, 1+3, 1+3+5…). Sums of odd numbers are always perfect squares.`,
          mistakes: [{ value: last * last, why: `That's ${last}², but there are only ${n} odd numbers in the list. The sum is ${n}².` }, { value: (n + 1) ** 2, why: `There are ${n} terms, not ${n + 1}: (${last} + 1) ÷ 2 = ${n}.` }],
        };
      },
    },
    {
      id: 'negexp', level: 1,
      gen(r) {
        const a = r.int(2, 6), b = r.int(2, 6), c = r.int(2, 9), d = r.int(2, 5);
        const ans = -(a * a) + b * b - c * d;
        return {
          q: `What is −${a}² + (−${b})² − ${c} × ${d}?`, answer: N(ans),
          steps: [
            `−${a}² means −(${a}²) = −${a * a}. The square happens before the minus sign.`,
            `(−${b})² = ${b * b}, because the parentheses square the negative number.`,
            `${c} × ${d} = ${c * d}.`,
            `−${a * a} + ${b * b} − ${c * d} = <b>${ans}</b>.`,
          ],
          tip: `−x² and (−x)² are different! Exponents come before the negative sign unless parentheses say otherwise.`,
          mistakes: [{ value: a * a + b * b - c * d, why: `−${a}² is −${a * a}, not +${a * a}. The exponent applies only to ${a}, then the minus sign.` }],
        };
      },
    },
  ],

  // ───────────────────────────────── Fractions
  fractions: [
    {
      id: 'divfrac', level: 1,
      gen(r) {
        let a, b, c, d;
        do { b = r.int(2, 9); d = r.int(2, 9); a = r.int(1, b - 1); c = r.int(1, d - 1); } while (gcd(a, b) !== 1 || gcd(c, d) !== 1 || a * d === b * c);
        const ans = F(a * d, b * c);
        return {
          q: `What is ${fr(a, b)} ÷ ${fr(c, d)}?`, form: ans.d === 1 ? null : COMMON, answer: ans,
          steps: [`Dividing by a fraction = multiplying by its reciprocal: ${fr(a, b)} × ${fr(d, c)}.`, `= ${F(a * d, b * c).d !== b * c ? `${fr(a * d, b * c)} = ` : ''}<b>${frf(ans)}</b>.`],
          tip: `"Keep, change, flip": keep the first fraction, change ÷ to ×, flip the second. Cancel common factors before multiplying.`,
          mistakes: [{ value: F(a * c, b * d), why: `You multiplied instead of dividing. Flip the second fraction first.` }, { value: F(b * c, a * d), why: `You flipped the wrong fraction. Only flip the one you're dividing by (the second).` }],
        };
      },
    },
    {
      id: 'halfway', level: 2,
      gen(r) {
        let a, b, c, d;
        do { b = r.int(2, 9); d = r.int(2, 9); a = r.int(1, b - 1); c = r.int(1, d - 1); } while (b === d || a * d === b * c || gcd(a, b) !== 1 || gcd(c, d) !== 1);
        const ans = F(a * d + b * c, 2 * b * d);
        return {
          q: `What number is exactly halfway between ${fr(a, b)} and ${fr(c, d)}?`, form: COMMON, answer: ans,
          steps: [
            `Halfway = the average: (${fr(a, b)} + ${fr(c, d)}) ÷ 2.`,
            `${fr(a, b)} + ${fr(c, d)} = ${frf(F(a * d + b * c, b * d))}.`,
            `Divide by 2: <b>${frf(ans)}</b>.`,
          ],
          tip: `The midpoint of two numbers is their average. Add them, then halve.`,
          mistakes: [{ value: F(a + c, b + d), why: `Adding tops and bottoms gives a number between them, but not the halfway point. Average them: add, then divide by 2.` }],
        };
      },
    },
    {
      id: 'telescope', level: 3,
      gen(r) {
        const n = r.int(5, 30);
        return {
          q: `What is ${fr(1, '1 × 2')} + ${fr(1, '2 × 3')} + ${fr(1, '3 × 4')} + … + ${fr(1, `${n} × ${n + 1}`)}?`, form: COMMON, answer: F(n, n + 1),
          steps: [
            `Each term splits: ${fr(1, 'k(k + 1)')} = ${fr(1, 'k')} − ${fr(1, 'k + 1')}. Check: ${fr(1, 2)} − ${fr(1, 3)} = ${fr(1, 6)} ✓.`,
            `The sum becomes (1 − ${fr(1, 2)}) + (${fr(1, 2)} − ${fr(1, 3)}) + … + (${fr(1, n)} − ${fr(1, n + 1)}).`,
            `Everything in the middle cancels, leaving 1 − ${fr(1, n + 1)} = <b>${fr(n, n + 1)}</b>.`,
          ],
          tip: `Long sums of fractions with products in the denominator usually "telescope": split each term into a difference and watch the middle cancel.`,
          mistakes: [{ value: F(1, n + 1), why: `That's the leftover piece that gets subtracted. The answer is 1 minus that.` }],
        };
      },
    },
    {
      id: 'continued', level: 2,
      gen(r) {
        const k = r.int(2, 9);
        const ans = F(k + 1, 2 * k + 1);
        return {
          q: `What is the value of 1 ÷ (1 + 1 ÷ (1 + 1 ÷ ${k}))?`, form: COMMON, answer: ans,
          steps: [
            `Work from the inside out. 1 + 1 ÷ ${k} = ${fr(k + 1, k)}.`,
            `1 ÷ ${fr(k + 1, k)} = ${fr(k, k + 1)}, so 1 + ${fr(k, k + 1)} = ${fr(2 * k + 1, k + 1)}.`,
            `1 ÷ ${fr(2 * k + 1, k + 1)} = <b>${frf(ans)}</b>.`,
          ],
          tip: `Nested fractions: start at the deepest level and simplify one layer at a time. Write each layer's result down.`,
          mistakes: [],
        };
      },
    },
  ],

  // ───────────────────────────────── Percents
  percents: [
    {
      id: 'successive', level: 2,
      gen(r) {
        const p = 10 * r.int(1, 5), q = 10 * r.int(1, 5);
        const pay = ((100 - p) * (100 - q)) / 100;
        return {
          q: `A jacket is marked ${p}% off. At the register, you get an extra ${q}% off the sale price. What single percent discount is this equal to?`,
          unit: '%', answer: N(100 - pay),
          steps: [
            `Start with $100. After ${p}% off: $${100 - p}.`,
            `${q}% off $${100 - p} is $${((100 - p) * q) / 100}, so you pay $${pay}.`,
            `From $100 to $${pay} is a <b>${100 - pay}%</b> discount.`,
          ],
          tip: `Back-to-back discounts multiply, they don't add: you pay ${(100 - p) / 100} × ${(100 - q) / 100} of the price. Pretending the price is $100 makes it easy.`,
          mistakes: [{ value: p + q, why: `The second discount is taken from the already-lower sale price, so it saves less than ${q}% of the original. Discounts don't simply add.` }],
        };
      },
    },
    {
      id: 'whatpct', level: 1,
      gen(r) {
        let A, B, pct;
        do { A = r.pick([20, 25, 40, 50, 80, 125, 200, 250]); pct = r.pick([5, 10, 12, 15, 20, 30, 40, 60, 75, 80, 150]); B = (A * pct) / 100; } while (!Number.isInteger(B));
        return {
          q: `${B} is what percent of ${A}?`, unit: '%', answer: N(pct),
          steps: [`Part ÷ whole = ${B} ÷ ${A} = ${B / A}.`, `As a percent: ${B / A} × 100 = <b>${pct}%</b>.`],
          tip: `"A is what percent of B" → A ÷ B × 100. The number after "of" is the whole (it goes on the bottom).`,
          mistakes: [{ value: Math.round(((A / B) * 100) * 100) / 100, why: `You divided the wrong way. The whole (${A}, the number after "of") goes on the bottom.` }],
        };
      },
    },
    {
      id: 'compound', level: 2,
      gen(r) {
        const P = 100 * r.int(2, 30), rate = r.pick([10, 20]);
        const total = (P * (100 + rate) ** 2) / 10000;
        return {
          q: `Maria puts $${P} in a savings account that earns ${rate}% interest per year, compounded yearly. How many dollars will be in the account after 2 years?`,
          unit: '$', answer: N(total),
          steps: [
            `After year 1: $${P} + ${rate}% = $${(P * (100 + rate)) / 100}.`,
            `Year 2 earns interest on the NEW amount: $${(P * (100 + rate)) / 100} + ${rate}% = <b>$${total}</b>.`,
          ],
          tip: `Compound interest = multiply by (1 + rate) once per year: ${P} × ${(100 + rate) / 100} × ${(100 + rate) / 100}. Interest earns interest!`,
          mistakes: [{ value: P * (1 + (2 * rate) / 100), why: `That's simple interest. With compounding, year 2's interest is ${rate}% of the bigger balance.` }],
        };
      },
    },
  ],

  // ───────────────────────────────── Ratios
  ratios: [
    {
      id: 'combine', level: 2,
      gen(r) {
        let a, b, c, d;
        do { a = r.int(1, 7); b = r.int(2, 8); c = r.int(1, 8); d = r.int(2, 9); } while (gcd(a, b) !== 1 || gcd(c, d) !== 1 || a * c === b * d);
        const ans = F(a * c, b * d);
        return {
          q: `The ratio of x to y is ${a}:${b}, and the ratio of y to z is ${c}:${d}. What is the ratio of x to z?`, form: COMMON, answer: ans,
          steps: [
            `x/y = ${fr(a, b)} and y/z = ${fr(c, d)}.`,
            `x/z = (x/y) × (y/z) = ${fr(a, b)} × ${fr(c, d)} = <b>${frf(ans)}</b>. (The y's cancel.)`,
          ],
          tip: `Chain ratios by multiplying them as fractions so the middle letter cancels. Or rewrite both with the same number of "y" parts.`,
          mistakes: [{ value: F(a, d), why: `You can't just take the outside numbers — the two ratios use different-sized "y" parts. Multiply: (x/y)(y/z).` }],
        };
      },
    },
    {
      id: 'map', level: 1,
      gen(r) {
        const k = r.pick([5, 8, 10, 12, 20, 25, 40]), d = r.int(2, 13) / 2;
        return {
          q: `On a map, 1 inch represents ${k} miles. Two towns are ${d} inches apart on the map. How many miles apart are they really?`, unit: 'miles', answer: N(k * d),
          steps: [`Each inch is ${k} miles, so ${d} inches is ${d} × ${k} = <b>${k * d}</b> miles.`],
          tip: `Scale problems are proportions: real ÷ map stays the same. Set up ${k}/1 = x/${d}.`,
          mistakes: [{ value: k / d, why: `More map inches means MORE real miles, so multiply.` }],
        };
      },
    },
    {
      id: 'dilute', level: 3,
      gen(r) {
        let V, p, q, W;
        do { V = r.pick([4, 5, 6, 8, 10, 12, 15, 20]); p = r.pick([20, 25, 30, 40, 50, 60]); q = r.pick([10, 12, 15, 20, 25, 30, 40]); W = (V * (p - q)) / q; } while (q >= p || !Number.isInteger(W));
        const juice = (V * p) / 100;
        return {
          q: `A ${V}-liter drink is ${p}% juice. How many liters of water must be added to make it ${q}% juice?`, unit: 'liters', answer: N(W),
          steps: [
            `The amount of juice doesn't change: ${p}% of ${V} = ${juice} liters.`,
            `In the new drink, ${juice} liters must be ${q}% of the total: total = ${juice} ÷ ${q / 100} = ${V + W} liters.`,
            `Water added = ${V + W} − ${V} = <b>${W}</b> liters.`,
          ],
          tip: `Mixture problems: find the thing that stays the same (the juice), then use it to find the new total.`,
          mistakes: [{ value: V + W, why: `That's the new total. Subtract the original ${V} liters to get the water added.` }],
        };
      },
    },
  ],

  // ───────────────────────────────── Rates
  rates: [
    {
      id: 'units', level: 2,
      gen(r) {
        const kmh = 18 * r.int(1, 8);
        return {
          q: `A car travels at ${kmh} kilometers per hour. What is its speed in meters per second?`, unit: 'm/s', answer: N((kmh * 1000) / 3600),
          steps: [`${kmh} km/h = ${kmh * 1000} meters per 3600 seconds.`, `${kmh * 1000} ÷ 3600 = <b>${(kmh * 1000) / 3600}</b> m/s.`],
          tip: `To go from km/h to m/s, multiply by 1000/3600 = 5/18. Write the units as fractions so they cancel.`,
          mistakes: [{ value: kmh * 3.6, why: `You multiplied by 3.6. m/s is a smaller unit-of-time rate than km/h, so the number should get smaller: divide by 3.6.` }],
        };
      },
    },
    {
      id: 'catchup', level: 2,
      gen(r) {
        let u, v, t, T;
        do { u = 5 * r.int(6, 12); v = u + 5 * r.int(2, 8); t = r.int(1, 3); T = (u * t) / (v - u); } while (!Number.isInteger(T));
        return {
          q: `A truck leaves town at ${u} mph. ${t} hour${t > 1 ? 's' : ''} later, a car leaves the same town on the same road at ${v} mph. How many hours after the car leaves does it catch the truck?`,
          unit: 'hours', answer: N(T),
          steps: [
            `When the car starts, the truck is ${u} × ${t} = ${u * t} miles ahead.`,
            `The car gains ${v} − ${u} = ${v - u} miles every hour.`,
            `${u * t} ÷ ${v - u} = <b>${T}</b> hours.`,
          ],
          tip: `Chasing in the same direction: gap ÷ (difference in speeds). Head-on: gap ÷ (sum of speeds).`,
          mistakes: [{ value: (u * t) / (u + v), why: `Adding speeds is for moving toward each other. Here the car chases the truck, so it only gains ${v - u} mph.` }, { value: T + t, why: `That's measured from when the truck left. The question asks from when the car leaves.` }],
        };
      },
    },
    {
      id: 'drain', level: 3,
      gen(r) {
        let a, b;
        do { a = r.int(2, 8); b = r.int(a + 1, 15); } while (gcd(a, b) === b);
        const ans = F(a * b, b - a);
        return {
          q: `A faucet fills a tub in ${a} hours. The drain empties a full tub in ${b} hours. If the tub starts empty with the faucet on and the drain open, how many hours will it take to fill?`,
          form: ans.d === 1 ? null : COMMON, unit: 'hours', answer: ans,
          steps: [
            `Faucet: +${fr(1, a)} tub per hour. Drain: −${fr(1, b)} tub per hour.`,
            `Net: ${fr(1, a)} − ${fr(1, b)} = ${frf(F(b - a, a * b))} tub per hour.`,
            `Time = 1 ÷ ${frf(F(b - a, a * b))} = <b>${frf(ans)}</b> hours.`,
          ],
          tip: `Work problems with something working against you: subtract that rate. Sanity check: it must take longer than ${a} hours.`,
          mistakes: [{ value: F(a * b, a + b), why: `The drain works AGAINST the faucet, so subtract its rate instead of adding it.` }, { value: b - a, why: `Subtract the rates (tubs per hour), not the times.` }],
        };
      },
    },
  ],

  // ───────────────────────────────── Divisors
  divisors: [
    {
      id: 'sqdiv', level: 3,
      gen(r) {
        let n, fs;
        do { n = 2 ** r.int(1, 6) * 3 ** r.int(0, 4) * 5 ** r.int(0, 3); fs = factorize(n); } while (fs.length < 2 || n > 20000 || n < 100);
        const ans = fs.reduce((t, [, e]) => t * (Math.floor(e / 2) + 1), 1);
        const all = fs.reduce((t, [, e]) => t * (e + 1), 1);
        return {
          q: `How many positive divisors of ${n.toLocaleString('en-US')} are perfect squares?`, unit: 'divisors', answer: N(ans),
          steps: [
            `${n.toLocaleString('en-US')} = ${factorStr(n)}.`,
            `A perfect square uses an EVEN number of each prime. ${fs.map(([p, e]) => `${p}: ${Array.from({ length: Math.floor(e / 2) + 1 }, (_, i) => 2 * i).join(', ')} copies (${Math.floor(e / 2) + 1} choice${Math.floor(e / 2) ? 's' : ''})`).join('; ')}.`,
            `${fs.map(([, e]) => Math.floor(e / 2) + 1).join(' × ')} = <b>${ans}</b>.`,
          ],
          tip: `Special divisors (square, odd, multiple of 6…) → restrict the exponent choices for each prime, then multiply.`,
          mistakes: [{ value: all, why: `That counts all divisors. A square divisor needs an even exponent on every prime.` }],
        };
      },
    },
    {
      id: 'gcflcm', level: 2,
      gen(r) {
        let g, x, y;
        do { g = r.int(2, 12); x = r.int(2, 9); y = r.int(2, 9); } while (x === y || gcd(x, y) !== 1);
        const a = g * x, b = g * y, L = g * x * y;
        return {
          q: `Two positive integers have a GCF of ${g} and an LCM of ${L}. One of the numbers is ${a}. What is the other number?`, answer: N(b),
          steps: [`For any two numbers: GCF × LCM = product of the numbers.`, `${g} × ${L} = ${g * L} = ${a} × other.`, `Other = ${g * L} ÷ ${a} = <b>${b}</b>.`],
          tip: `Memorize GCF(a, b) × LCM(a, b) = a × b. It turns many "find the other number" problems into one division.`,
          mistakes: [{ value: L / a, why: `Use GCF × LCM = a × b, so other = (${g} × ${L}) ÷ ${a}.` }],
        };
      },
    },
    {
      id: 'digit9', level: 1,
      gen(r) {
        let digits, pos, need;
        do {
          digits = [r.int(1, 9), r.int(0, 9), r.int(0, 9), r.int(0, 9)];
          pos = r.int(1, 3);
          const s = digits.reduce((t, d, i) => (i === pos ? t : t + d), 0);
          need = (9 - (s % 9)) % 9;
        } while (need === 0); // 0 and 9 would both work
        const k = r.pick([9, 3]);
        let shown, ans;
        if (k === 9) { ans = need; } else {
          const s = digits.reduce((t, d, i) => (i === pos ? t : t + d), 0);
          // digits that make sum divisible by 3: list them and ask for the largest
          const ok = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter((d) => (s + d) % 3 === 0);
          ans = ok[ok.length - 1];
        }
        shown = digits.map((d, i) => (i === pos ? '□' : d)).join('');
        const rest = digits.reduce((t, d, i) => (i === pos ? t : t + d), 0);
        return {
          q: k === 9 ? `The four-digit number ${shown} is divisible by 9. What digit goes in the box?` : `The four-digit number ${shown} is divisible by 3. What is the greatest digit that could go in the box?`,
          answer: N(ans),
          steps: [
            `A number is divisible by ${k} when its digit sum is divisible by ${k}.`,
            `The other digits add to ${rest}.`,
            k === 9 ? `The next multiple of 9 is ${rest + ans}, so the box is ${rest + ans} − ${rest} = <b>${ans}</b>.` : `${rest} + □ must be a multiple of 3. The largest digit that works is <b>${ans}</b> (sum ${rest + ans}).`,
          ],
          tip: `Divisibility rules to know cold: 3 and 9 (digit sum), 4 (last two digits), 8 (last three), 5 and 10 (last digit), 11 (alternating sum).`,
          mistakes: [],
        };
      },
    },
    {
      id: 'zeros', level: 2,
      gen(r) {
        const n = r.int(25, 130);
        const z = Math.floor(n / 5) + Math.floor(n / 25) + Math.floor(n / 125);
        return {
          q: `How many zeros are at the end of ${n}! (the product 1 × 2 × 3 × … × ${n})?`, unit: 'zeros', answer: N(z),
          steps: [
            `Each ending zero needs a 10 = 2 × 5. There are plenty of 2s, so count the 5s.`,
            `Multiples of 5 up to ${n}: ⌊${n}/5⌋ = ${Math.floor(n / 5)}.`,
            `Multiples of 25 give an extra 5 each: ⌊${n}/25⌋ = ${Math.floor(n / 25)}.${n >= 125 ? ` Multiples of 125 give one more: ${Math.floor(n / 125)}.` : ''}`,
            `Total: <b>${z}</b>.`,
          ],
          tip: `Trailing zeros of n! = ⌊n/5⌋ + ⌊n/25⌋ + ⌊n/125⌋ + … Don't forget numbers like 25 and 50 contain two 5s.`,
          mistakes: [{ value: Math.floor(n / 5), why: `Numbers like 25, 50, 75 each contain TWO factors of 5. Add ⌊${n}/25⌋ more.` }, { value: Math.floor(n / 10), why: `Count factors of 5, not multiples of 10. 15 × 2 = 30 makes a zero too.` }],
        };
      },
    },
  ],

  // ───────────────────────────────── Primes & patterns
  primes: [
    {
      id: 'powmod', level: 2,
      gen(r) {
        const b = r.pick([2, 3, 5]), m = r.pick([7, 9, 11, 13].filter((x) => x % b !== 0)), n = r.int(20, 100);
        const cycle = []; let x = b % m;
        do { cycle.push(x); x = (x * b) % m; } while (x !== cycle[0]);
        const ans = cycle[(n - 1) % cycle.length];
        return {
          q: `What is the remainder when ${b}<sup>${n}</sup> is divided by ${m}?`, answer: N(ans),
          steps: [
            `Remainders of ${b}, ${b}², ${b}³, … when divided by ${m}: ${cycle.join(', ')}, then they repeat (cycle of ${cycle.length}).`,
            `${n} ÷ ${cycle.length} leaves remainder ${n % cycle.length}${n % cycle.length === 0 ? ' (0 means the last spot in the cycle)' : ''}.`,
            `So the remainder is <b>${ans}</b>.`,
          ],
          tip: `You never need the giant number. Multiply only the remainders, and look for the cycle.`,
          mistakes: [],
        };
      },
    },
    {
      id: 'largestpf', level: 1,
      gen(r) {
        const big = r.pick([17, 19, 23, 29, 31, 37, 41, 43, 47]);
        const small = r.pick([6, 8, 9, 10, 12, 14, 15, 18, 20]);
        const n = big * small;
        return {
          q: `What is the largest prime factor of ${n}?`, answer: N(big),
          steps: [`Divide out small primes: ${n} = ${factorStr(n)}.`, `The largest prime is <b>${big}</b>.`],
          tip: `Peel off 2s, 3s, 5s, 7s first. Whatever is left (if it has no factor up to its square root) is prime.`,
          mistakes: [{ value: n / 2, why: `${n / 2} is a factor but not prime. Keep factoring until every piece is prime.` }],
        };
      },
    },
    {
      id: 'goldbach', level: 3,
      gen(r) {
        const n = 2 * r.int(10, 40);
        const pairs = [];
        for (let p = 2; p <= n / 2; p++) if (isPrime(p) && isPrime(n - p)) pairs.push(`${p} + ${n - p}`);
        return {
          q: `In how many different ways can ${n} be written as the sum of two primes? (${pairs[0]} and ${pairs[0].split(' + ').reverse().join(' + ')} count as the same way.)`, unit: 'ways', answer: N(pairs.length),
          steps: [`Try each prime p up to ${n / 2} and check whether ${n} − p is prime.`, `${pairs.join(', ')}.`, `That's <b>${pairs.length}</b> ways.`],
          tip: `Stop at half the number to avoid counting pairs twice. Skip 2 — 2 + (even number) is never prime for even targets over 4.`,
          mistakes: [{ value: 2 * pairs.length - (isPrime(n / 2) ? 1 : 0), why: `You counted each pair twice (like 3 + ${n - 3} and ${n - 3} + 3). Only go up to ${n / 2}.` }],
        };
      },
    },
  ],

  // ───────────────────────────────── Sequences
  sequences: [
    {
      id: 'twoterms', level: 1,
      gen(r) {
        const a1 = r.int(-10, 20), d = r.pick([-5, -3, -2, 2, 3, 4, 5, 6]);
        const i = r.int(2, 5), j = i + r.int(2, 6);
        const ai = a1 + (i - 1) * d, aj = a1 + (j - 1) * d;
        return {
          q: `In an arithmetic sequence, the ${ordinal(i)} term is ${ai} and the ${ordinal(j)} term is ${aj}. What is the first term?`, answer: N(a1),
          steps: [
            `From term ${i} to term ${j} is ${j - i} steps: d = (${aj} − (${ai})) ÷ ${j - i} = ${d}.`,
            `From term 1 to term ${i} is ${i - 1} steps back: ${ai} − ${i - 1} × (${d}) = <b>${a1}</b>.`,
          ],
          tip: `Steps between term i and term j = j − i. Find d first, then walk back to term 1.`,
          mistakes: [{ value: ai - i * d, why: `From term ${i} back to term 1 is ${i - 1} steps, not ${i}.` }],
        };
      },
    },
    {
      id: 'whichterm', level: 2,
      gen(r) {
        const a = r.int(1, 15), d = r.int(2, 9), n = r.int(20, 80);
        const v = a + (n - 1) * d;
        return {
          q: `${a}, ${a + d}, ${a + 2 * d}, ${a + 3 * d}, … Which term of this sequence is ${v}? (Give its position number.)`, answer: N(n),
          steps: [`Steps from ${a} to ${v}: (${v} − ${a}) ÷ ${d} = ${n - 1}.`, `${n - 1} steps after term 1 is term <b>${n}</b>.`],
          tip: `Position = (value − first) ÷ difference + 1. That "+1" is the same fencepost idea as counting terms.`,
          mistakes: [{ value: n - 1, why: `${n - 1} is the number of steps. Add 1 because you start at term 1, not term 0.` }],
        };
      },
    },
    {
      id: 'fiblike', level: 2,
      gen(r) {
        const a = r.int(1, 6), b = r.int(1, 8), n = r.int(7, 10);
        const t = [a, b];
        while (t.length < n) t.push(t[t.length - 1] + t[t.length - 2]);
        return {
          q: `A sequence starts ${a}, ${b}, and each term after that is the sum of the two terms before it. What is the ${ordinal(n)} term?`, answer: N(t[n - 1]),
          steps: [`Just build it carefully: ${t.map((x, i) => (i === n - 1 ? `<b>${x}</b>` : x)).join(', ')}.`],
          tip: `For short recursive sequences, listing terms is fastest. Number them as you go so you stop at the right one.`,
          mistakes: [{ value: t[n - 2], why: `That's the ${ordinal(n - 1)} term — one short. Number the terms as you write them.` }],
        };
      },
    },
  ],

  // ───────────────────────────────── Equations
  equations: [
    {
      id: 'system', level: 2,
      gen(r) {
        let x, y; do { x = r.int(3, 30); y = r.int(1, 25); } while (x === y);
        const S = x + y, D = x - y;
        return {
          q: `Two numbers have a sum of ${S} and a difference of ${D} (larger minus smaller). What is their product?`, answer: N(x * y),
          steps: [
            `Add the equations: (x + y) + (x − y) = ${S} + (${D}) → 2x = ${S + D} → x = ${x}.`,
            `Then y = ${S} − ${x} = ${y}.`,
            `Product = ${x} × ${y} = <b>${x * y}</b>.`,
          ],
          tip: `Sum and difference given? Larger = (sum + difference) ÷ 2, smaller = (sum − difference) ÷ 2. Then answer what's actually asked.`,
          mistakes: [{ value: x, why: `That's the larger number. The question asks for the product.` }],
        };
      },
    },
    {
      id: 'tickets', level: 2,
      gen(r) {
        const A = r.pick([8, 9, 10, 12, 15]), C = r.pick([4, 5, 6]), adults = r.int(10, 60), kids = r.int(10, 60);
        const T = adults + kids, R = A * adults + C * kids;
        return {
          q: `Adult tickets cost $${A} and child tickets cost $${C}. ${T} tickets were sold for a total of $${R}. How many adult tickets were sold?`, unit: 'tickets', answer: N(adults),
          steps: [
            `Pretend all ${T} were child tickets: ${T} × $${C} = $${T * C}.`,
            `The extra $${R} − $${T * C} = $${R - T * C} comes from adults, who each pay $${A - C} more.`,
            `Adults = ${R - T * C} ÷ ${A - C} = <b>${adults}</b>.`,
          ],
          tip: `"Pretend they're all the cheap kind" is a fast way to solve two-item problems without algebra.`,
          mistakes: [{ value: kids, why: `That's the number of child tickets. Re-read what's asked.` }],
        };
      },
    },
    {
      id: 'agemult', level: 3,
      gen(r) {
        const k = r.pick([3, 4, 5]), B = r.int(3, 10), y = B * (k - 2);
        return {
          q: `Ana is ${k} times as old as her brother Bo. In ${y} years, Ana will be twice as old as Bo. How old is Ana now?`, unit: 'years', answer: N(k * B),
          steps: [
            `Let Bo = b now, so Ana = ${k}b.`,
            `In ${y} years: ${k}b + ${y} = 2(b + ${y}) → ${k}b + ${y} = 2b + ${2 * y}.`,
            `${k - 2}b = ${y} → b = ${B}. Ana = ${k} × ${B} = <b>${k * B}</b>.`,
          ],
          tip: `Use one variable for the younger person and write everyone else in terms of it. Check: in ${y} years they're ${k * B + y} and ${B + y}. ✓`,
          mistakes: [{ value: B, why: `That's Bo's age. The question asks for Ana's.` }],
        };
      },
    },
    {
      id: 'ineq', level: 1,
      gen(r) {
        const a = r.int(2, 9), b = r.int(1, 20), c = b + a * r.int(3, 15) + r.pick([0, 0, r.int(1, a - 1)]);
        let count = 0; for (let x = 1; a * x + b < c; x++) count++;
        const exact = (c - b) % a === 0;
        return {
          q: `How many positive integers x satisfy ${a}x + ${b} < ${c}?`, unit: 'integers', answer: N(count),
          steps: [
            `Subtract ${b}: ${a}x < ${c - b}. Divide by ${a}: x < ${exact ? (c - b) / a : `${c - b}/${a} ≈ ${((c - b) / a).toFixed(2)}`}.`,
            `Positive integers: 1, 2, …, ${count}${exact ? ` (not ${(c - b) / a}, because the inequality is strict)` : ''}.`,
            `That's <b>${count}</b>.`,
          ],
          tip: `"<" means the boundary itself doesn't count; "≤" means it does. Always check the endpoint.`,
          mistakes: exact ? [{ value: count + 1, why: `x = ${(c - b) / a} gives exactly ${c}, which is not LESS than ${c}. Strict inequality: leave it out.` }] : [],
        };
      },
    },
  ],

  // ───────────────────────────────── Exponents & roots
  exponents: [
    {
      id: 'zeroneg', level: 1,
      gen(r) {
        const b = r.int(2, 6);
        return {
          q: `What is ${b}<sup>−1</sup> + ${b}<sup>0</sup> + ${b}<sup>1</sup>?`, form: COMMON, answer: F(b * b + b + 1, b),
          steps: [`${b}<sup>−1</sup> = ${fr(1, b)}, ${b}<sup>0</sup> = 1, ${b}<sup>1</sup> = ${b}.`, `${fr(1, b)} + 1 + ${b} = <b>${frf(F(b * b + b + 1, b))}</b>.`],
          tip: `Anything (except 0) to the 0 power is 1. A negative exponent means "1 over".`,
          mistakes: [{ value: F(b * b + 1, b), why: `${b}<sup>0</sup> is 1, not 0.` }, { value: F(-b + 1 + b), why: `${b}<sup>−1</sup> is ${fr(1, b)}, not −${b}. A negative exponent flips; it doesn't make the number negative.` }],
        };
      },
    },
    {
      id: 'solveexp', level: 2,
      gen(r) {
        const b = r.pick([2, 3, 5]), k = r.int(3, b === 2 ? 9 : b === 3 ? 6 : 4), c = r.int(1, 3);
        const x = k - c;
        return {
          q: `If ${b}<sup>x + ${c}</sup> = ${b ** k}, what is x?`, answer: N(x),
          steps: [`Write ${b ** k} as a power of ${b}: ${b ** k} = ${b}<sup>${k}</sup>.`, `Same base, so exponents match: x + ${c} = ${k} → x = <b>${x}</b>.`],
          tip: `Know powers of 2 up to 2¹⁰ = 1024, powers of 3 up to 3⁶ = 729, and powers of 5 up to 5⁴ = 625.`,
          mistakes: [{ value: k, why: `${k} is x + ${c}. Subtract ${c} to get x.` }],
        };
      },
    },
    {
      id: 'addroots', level: 2,
      gen(r) {
        const rad = r.pick([2, 3, 5, 6, 7]), m = r.int(2, 6), n = r.int(2, 7);
        const A = m * m * rad, B = n * n * rad;
        if (A === B) return null;
        return {
          q: `Express √${A} + √${B} in simplest radical form.`, answer: RAD(m + n, rad),
          steps: [`√${A} = √${m * m} × √${rad} = ${m}√${rad}.`, `√${B} = √${n * n} × √${rad} = ${n}√${rad}.`, `${m}√${rad} + ${n}√${rad} = <b>${m + n}√${rad}</b>.`],
          tip: `You can only add "like" radicals. Simplify each one first — they often turn out to share the same √.`,
          mistakes: [{ value: Math.sqrt(A + B), why: `√a + √b is NOT √(a + b). Simplify each root separately, then add like terms.` }],
        };
      },
    },
    {
      id: 'between', level: 1,
      gen(r) {
        const a = r.int(5, 60), b = a + r.int(40, 300);
        let count = 0; for (let k = 1; k * k < b; k++) if (k * k > a) count++;
        const lo = Math.floor(Math.sqrt(a)) + 1, hi = Math.ceil(Math.sqrt(b)) - 1;
        return {
          q: `How many integers are between √${a} and √${b}?`, unit: 'integers', answer: N(count),
          steps: [
            `${(lo - 1) ** 2} ≤ ${a} < ${lo ** 2}, so √${a} is between ${lo - 1} and ${lo}. The first integer above it is ${lo}.`,
            `${hi ** 2} < ${b} ≤ ${(hi + 1) ** 2}, so the last integer below √${b} is ${hi}.`,
            `${lo} through ${hi}: ${hi} − ${lo} + 1 = <b>${count}</b> integers.`,
          ],
          tip: `Trap each square root between perfect squares. Know squares up to 25² = 625 by heart.`,
          mistakes: [{ value: b - a - 1, why: `Count integers between the square ROOTS, not between ${a} and ${b}.` }],
        };
      },
    },
  ],

  // ───────────────────────────────── Operations
  operations: [
    {
      id: 'solveop', level: 2,
      gen(r) {
        const a = r.int(2, 7), k = r.int(2, 12), v = a * k + a + k;
        return {
          q: `Define x ★ y = xy + x + y. If ${a} ★ k = ${v}, what is k?`, answer: N(k),
          steps: [`${a} ★ k = ${a}k + ${a} + k = ${a + 1}k + ${a}.`, `${a + 1}k + ${a} = ${v} → ${a + 1}k = ${v - a}.`, `k = <b>${k}</b>.`],
          tip: `Write out the rule with the numbers plugged in, collect the unknown, and solve like any equation.`,
          mistakes: [{ value: (v - a) / a, why: `There are TWO k terms (${a}k and k), so it's ${a + 1}k.` }],
        };
      },
    },
    {
      id: 'collatz', level: 2,
      gen(r) {
        const n = r.int(3, 40);
        const f = (x) => (x % 2 === 0 ? x / 2 : 3 * x + 1);
        const v1 = f(n), v2 = f(v1), v3 = f(v2);
        return {
          q: `Let f(n) = n ÷ 2 if n is even, and f(n) = 3n + 1 if n is odd. What is f(f(f(${n})))?`, answer: N(v3),
          steps: [`f(${n}) = ${v1} (${n} is ${n % 2 ? 'odd' : 'even'}).`, `f(${v1}) = ${v2} (${v1} is ${v1 % 2 ? 'odd' : 'even'}).`, `f(${v2}) = <b>${v3}</b> (${v2} is ${v2 % 2 ? 'odd' : 'even'}).`],
          tip: `With "piecewise" rules, check which case applies at EVERY step — the parity changes as you go.`,
          mistakes: [{ value: v1, why: `That's f(${n}) only. Apply f three times.` }, { value: v2, why: `That's f(f(${n})). Apply f one more time.` }],
        };
      },
    },
    {
      id: 'avgop', level: 1,
      gen(r) {
        const p = r.int(1, 20), q = r.int(1, 20), s = r.int(1, 20);
        const op = (x, y) => F(x.n * y.d + y.n * x.d, 2 * x.d * y.d);
        const P = F(p), Q = F(q), S = F(s);
        const ans = op(op(P, Q), S), wrong = op(P, op(Q, S));
        return {
          q: `Define a ⊕ b = (a + b) ÷ 2. What is (${p} ⊕ ${q}) ⊕ ${s}?`, form: ans.d === 1 ? null : COMMON, answer: ans,
          steps: [`Inside first: ${p} ⊕ ${q} = (${p} + ${q}) ÷ 2 = ${frf(op(P, Q))}.`, `Then ${frf(op(P, Q))} ⊕ ${s} = (${frf(op(P, Q))} + ${s}) ÷ 2 = <b>${frf(ans)}</b>.`],
          tip: `New operations aren't always "associative" — (a ⊕ b) ⊕ c can differ from a ⊕ (b ⊕ c). Follow the parentheses exactly.`,
          mistakes: wrong.n * ans.d !== ans.n * wrong.d ? [{ value: wrong, why: `You did ${q} ⊕ ${s} first. The parentheses say (${p} ⊕ ${q}) first.` }] : [],
        };
      },
    },
  ],

  // ───────────────────────────────── Counting
  counting: [
    {
      id: 'roundtable', level: 2,
      gen(r) {
        const n = r.int(4, 8);
        return {
          q: `In how many ways can ${n} people sit around a round table, if two seatings that are rotations of each other count as the same?`, unit: 'ways', answer: N(fact(n - 1)),
          steps: [`In a row there would be ${n}! = ${fact(n)} ways.`, `Each circular seating appears ${n} times (once per rotation), so divide by ${n}.`, `${fact(n)} ÷ ${n} = (${n} − 1)! = <b>${fact(n - 1)}</b>.`],
          tip: `Circular arrangements: fix one person's seat, then arrange the rest: (n − 1)!.`,
          mistakes: [{ value: fact(n), why: `Rotating everyone one seat gives the same arrangement, so divide by ${n}.` }],
        };
      },
    },
    {
      id: 'digits3', level: 2,
      gen(r) {
        const kind = r.pick(['even', 'odd', 'distinct', 'nozero']);
        const data = {
          even: { q: 'all digits even', ans: 100, steps: ['Hundreds digit: 2, 4, 6 or 8 (not 0!) → 4 choices.', 'Tens and units: 0, 2, 4, 6, 8 → 5 choices each.', '4 × 5 × 5 = <b>100</b>.'], wrong: 125, why: 'A three-digit number can\'t start with 0, so the hundreds digit has only 4 even choices.' },
          odd: { q: 'all digits odd', ans: 125, steps: ['Each digit: 1, 3, 5, 7 or 9 → 5 choices.', '5 × 5 × 5 = <b>125</b>.'], wrong: 100, why: 'Odd digits never include 0, so all three places have 5 choices.' },
          distinct: { q: 'three different digits', ans: 648, steps: ['Hundreds: 1–9 → 9 choices.', 'Tens: any digit except the one used → 9 choices (0 is allowed now).', 'Units: 8 choices left.', '9 × 9 × 8 = <b>648</b>.'], wrong: 720, why: 'The hundreds digit can\'t be 0, so start with 9 choices, then 9, then 8.' },
          nozero: { q: 'no digit equal to 0', ans: 729, steps: ['Each digit: 1–9 → 9 choices.', '9 × 9 × 9 = <b>729</b>.'], wrong: 900, why: '900 counts all three-digit numbers, including ones with a 0 in the tens or units place.' },
        }[kind];
        return {
          q: `How many three-digit positive integers have ${data.q}?`, unit: 'integers', answer: N(data.ans), steps: data.steps,
          tip: `Fill the most restricted spot first (usually the leading digit, which can't be 0), then multiply the choices.`,
          mistakes: [{ value: data.wrong, why: data.why }],
        };
      },
    },
    {
      id: 'together', level: 3,
      gen(r) {
        const n = r.int(4, 7), apart = r.chance(0.5);
        const tog = 2 * fact(n - 1);
        const ans = apart ? fact(n) - tog : tog;
        return {
          q: `${n} friends, including Ali and Ben, line up in a row. In how many orders can they line up if Ali and Ben ${apart ? 'must NOT stand next to each other' : 'must stand next to each other'}?`, unit: 'orders', answer: N(ans),
          steps: [
            `Glue Ali and Ben into one block. Now arrange ${n - 1} items: ${n - 1}! = ${fact(n - 1)}.`,
            `Inside the block they can be AB or BA: × 2 → ${tog} orders with them together.`,
            apart ? `All orders: ${n}! = ${fact(n)}. Not together = ${fact(n)} − ${tog} = <b>${ans}</b>.` : `Answer: <b>${ans}</b>.`,
          ],
          tip: `"Must be together" → glue them into a block (don't forget the block's internal order). "Must be apart" → total minus together.`,
          mistakes: apart ? [{ value: tog, why: `That's the number with them TOGETHER. Subtract it from all ${fact(n)} orders.` }] : [{ value: fact(n - 1), why: `Inside the block, Ali and Ben can switch places — multiply by 2.` }],
        };
      },
    },
    {
      id: 'circletri', level: 2,
      gen(r) {
        const n = r.int(5, 12);
        return {
          q: `${n} points are marked on a circle. How many triangles can be drawn using three of these points as vertices?`, unit: 'triangles', answer: N(choose(n, 3)),
          steps: [`No three points on a circle are in a line, so any 3 points make a triangle.`, `Order doesn't matter: C(${n}, 3) = ${n} × ${n - 1} × ${n - 2} ÷ 6 = <b>${choose(n, 3)}</b>.`],
          tip: `Choosing a set of points (triangle, committee, handshake) → combinations. Divide by k! to remove order.`,
          mistakes: [{ value: n * (n - 1) * (n - 2), why: `That counts each triangle 6 times (once for each order of its 3 corners). Divide by 3! = 6.` }],
        };
      },
    },
  ],

  // ───────────────────────────────── Probability
  probability: [
    {
      id: 'dice2', level: 2,
      gen(r) {
        const opts = [
          ['the product is even', (a, b) => (a * b) % 2 === 0, 'Easier with the complement: product is odd only when BOTH are odd: 3 × 3 = 9 ways. Even: 36 − 9 = 27.', { value: F(1, 2), why: `Even and odd products aren't equally likely — the product is odd only if both dice are odd.` }],
          ['the product is a multiple of 3', (a, b) => (a * b) % 3 === 0, 'Not a multiple of 3 when neither die is 3 or 6: 4 × 4 = 16 ways. So 36 − 16 = 20.', { value: F(1, 3), why: `The product is a multiple of 3 if EITHER die is 3 or 6 — that's more than 1/3 of the time.` }],
          ['at least one die shows a 6', (a, b) => a === 6 || b === 6, 'Complement: no 6 at all is 5 × 5 = 25 ways. So 36 − 25 = 11.', { value: F(1, 3), why: `1/6 + 1/6 counts (6, 6) twice. Use 1 − P(no 6) = 1 − 25/36.` }],
          ['both dice show the same number', (a, b) => a === b, 'Doubles: (1,1), (2,2), …, (6,6) → 6 ways.', { value: F(1, 36), why: `There are 6 different doubles, not just 1.` }],
          ['the two numbers differ by 2', (a, b) => Math.abs(a - b) === 2, 'Pairs: (1,3), (2,4), (3,5), (4,6) and the reverses → 8 ways.', { value: F(4, 36), why: `(1, 3) and (3, 1) are different outcomes — count both orders.` }],
        ];
        const [desc, pred, how, mistake] = r.pick(opts);
        let c = 0; for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (pred(a, b)) c++;
        return {
          q: `Two fair six-sided dice are rolled. What is the probability that ${desc}?`, form: COMMON, answer: F(c, 36),
          steps: [`36 equally likely outcomes.`, how, `Probability = ${F(c, 36).d !== 36 ? `${fr(c, 36)} = ` : ''}<b>${frf(F(c, 36))}</b>.`],
          tip: `For two dice, picture the 6 × 6 grid. If the event is "at least…" or has many cases, count the opposite and subtract from 36.`,
          mistakes: [mistake],
        };
      },
    },
    {
      id: 'oneof', level: 2,
      gen(r) {
        let a, b, c, d;
        do { a = r.int(1, 4); b = r.int(a + 1, 6); c = r.int(1, 4); d = r.int(c + 1, 6); } while (gcd(a, b) !== 1 || gcd(c, d) !== 1);
        const pA = F(a, b), pB = F(c, d);
        const ans = F(a * (d - c) + c * (b - a), b * d);
        return {
          q: `The probability that Mia makes a free throw is ${fr(a, b)}. The probability that Leo makes one is ${fr(c, d)}. They each take one shot (independently). What is the probability that exactly one of them makes it?`,
          form: COMMON, answer: ans,
          steps: [
            `Mia makes, Leo misses: ${fr(a, b)} × ${fr(d - c, d)} = ${frf(F(a * (d - c), b * d))}.`,
            `Mia misses, Leo makes: ${fr(b - a, b)} × ${fr(c, d)} = ${frf(F((b - a) * c, b * d))}.`,
            `Add the two cases: <b>${frf(ans)}</b>.`,
          ],
          tip: `"Exactly one" = list the cases (A not B, B not A), multiply within each case, add the cases.`,
          mistakes: [{ value: F(a * d + c * b, b * d), why: `Adding ${frf(pA)} + ${frf(pB)} includes the chance they BOTH make it. You need one makes and the other misses.` }],
        };
      },
    },
    {
      id: 'pickmult', level: 1,
      gen(r) {
        let n, a, b; do { n = r.pick([20, 30, 40, 50, 60, 100]); a = r.int(2, 6); b = r.int(3, 9); } while (a === b || a % b === 0 || b % a === 0);
        const cnt = Math.floor(n / a) + Math.floor(n / b) - Math.floor(n / lcm(a, b));
        return {
          q: `A whole number from 1 to ${n} is chosen at random. What is the probability that it is a multiple of ${a} or a multiple of ${b}?`, form: COMMON, answer: F(cnt, n),
          steps: [
            `Multiples of ${a}: ${Math.floor(n / a)}. Multiples of ${b}: ${Math.floor(n / b)}. Both (multiples of ${lcm(a, b)}): ${Math.floor(n / lcm(a, b))}.`,
            `${a} or ${b}: ${Math.floor(n / a)} + ${Math.floor(n / b)} − ${Math.floor(n / lcm(a, b))} = ${cnt}.`,
            `Probability = ${fr(cnt, n)} = <b>${frf(F(cnt, n))}</b>.`,
          ],
          tip: `Probability = favorable ÷ total. For "or", count with inclusion-exclusion so the overlap isn't counted twice.`,
          mistakes: [{ value: F(Math.floor(n / a) + Math.floor(n / b), n), why: `Multiples of ${lcm(a, b)} were counted twice. Subtract them once.` }],
        };
      },
    },
  ],

  // ───────────────────────────────── Sets
  sets: [
    {
      id: 'neither2', level: 2,
      gen(r) {
        let a, b; do { a = r.int(2, 7); b = r.int(3, 11); } while (a === b || a % b === 0 || b % a === 0);
        const n = r.int(50, 200);
        const A = Math.floor(n / a), B = Math.floor(n / b), AB = Math.floor(n / lcm(a, b));
        const ans = n - (A + B - AB);
        return {
          q: `How many integers from 1 to ${n} are divisible by neither ${a} nor ${b}?`, unit: 'integers', answer: N(ans),
          steps: [`Divisible by ${a}: ${A}. By ${b}: ${B}. By both (LCM ${lcm(a, b)}): ${AB}.`, `Divisible by at least one: ${A} + ${B} − ${AB} = ${A + B - AB}.`, `Neither: ${n} − ${A + B - AB} = <b>${ans}</b>.`],
          tip: `"Neither" = total minus "at least one". Find "at least one" with inclusion-exclusion.`,
          mistakes: [{ value: n - A - B, why: `You subtracted the multiples of ${lcm(a, b)} twice. Add them back once.` }],
        };
      },
    },
    {
      id: 'venn3', level: 3,
      gen(r) {
        // Pick the 7 region sizes so everything is consistent.
        const onlyA = r.int(2, 9), onlyB = r.int(2, 9), onlyC = r.int(2, 9);
        const ab = r.int(1, 5), ac = r.int(1, 5), bc = r.int(1, 5), abc = r.int(1, 4);
        const A = onlyA + ab + ac + abc, B = onlyB + ab + bc + abc, C = onlyC + ac + bc + abc;
        const AB = ab + abc, AC = ac + abc, BC = bc + abc;
        const ans = A + B + C - AB - AC - BC + abc;
        return {
          q: `In a club, ${A} students play chess, ${B} play Go and ${C} play checkers. ${AB} play chess and Go, ${AC} play chess and checkers, ${BC} play Go and checkers, and ${abc} play all three. Everyone plays at least one. How many students are in the club?`,
          unit: 'students', answer: N(ans),
          steps: [
            `Add the three groups: ${A} + ${B} + ${C} = ${A + B + C}. Anyone in two groups was counted twice.`,
            `Subtract the pairs: − ${AB} − ${AC} − ${BC} = ${A + B + C - AB - AC - BC}.`,
            `The ${abc} who play all three were added 3 times and subtracted 3 times — add them back once: <b>${ans}</b>.`,
          ],
          tip: `Three-set rule: A + B + C − (each pair) + (all three). Or fill a Venn diagram from the center outward.`,
          mistakes: [{ value: ans - abc, why: `After subtracting the pairs, the ${abc} students in all three aren't counted at all. Add them back.` }],
        };
      },
    },
    {
      id: 'both', level: 1,
      gen(r) {
        let a, b; do { a = r.int(2, 9); b = r.int(2, 12); } while (a === b || gcd(a, b) === 1 || a % b === 0 || b % a === 0);
        const n = r.int(60, 300);
        return {
          q: `How many integers from 1 to ${n} are multiples of both ${a} and ${b}?`, unit: 'integers', answer: N(Math.floor(n / lcm(a, b))),
          steps: [`Multiples of both ${a} and ${b} are exactly the multiples of LCM(${a}, ${b}) = ${lcm(a, b)}.`, `⌊${n} ÷ ${lcm(a, b)}⌋ = <b>${Math.floor(n / lcm(a, b))}</b>.`],
          tip: `"Multiple of both" → use the LCM. Only use a × b when a and b share no factors.`,
          mistakes: [{ value: Math.floor(n / (a * b)), why: `${a} and ${b} share a factor, so the common multiples are multiples of ${lcm(a, b)}, not ${a * b}.` }],
        };
      },
    },
  ],

  // ───────────────────────────────── Area & perimeter
  area: [
    {
      id: 'coordtri', level: 2,
      gen(r) {
        const x1 = r.int(-6, 2), y1 = r.int(-6, 2), base = r.int(3, 12), h = r.int(2, 10), px = r.int(-4, 12);
        if ((base * h) % 2) return null;
        return {
          q: `What is the area of the triangle with vertices (${x1}, ${y1}), (${x1 + base}, ${y1}) and (${px}, ${y1 + h})?`, unit: 'units²', answer: N((base * h) / 2),
          steps: [`Two vertices share y = ${y1}, so that side is a horizontal base of length ${base}.`, `The height is the vertical distance to the third point: ${y1 + h} − (${y1}) = ${h}.`, `Area = ½ × ${base} × ${h} = <b>${(base * h) / 2}</b>.`],
          tip: `On a grid, look for a horizontal or vertical side to use as the base — the height is then just a difference of coordinates.`,
          mistakes: [{ value: base * h, why: `Triangle area is HALF of base × height.` }],
        };
      },
    },
    {
      id: 'sqdiag', level: 2,
      gen(r) {
        const d = 2 * r.int(2, 12);
        return {
          q: `A square has a diagonal of length ${d} cm. What is its area?`, unit: 'cm²', answer: N((d * d) / 2),
          steps: [`A square is a rhombus, so area = (d₁ × d₂) ÷ 2 with both diagonals equal.`, `${d} × ${d} ÷ 2 = <b>${(d * d) / 2}</b> cm².`],
          tip: `Square area from its diagonal: d² ÷ 2. (Or: side = d/√2, and side² = d²/2.)`,
          mistakes: [{ value: d * d, why: `${d} is the diagonal, not the side. Area = diagonal² ÷ 2.` }],
        };
      },
    },
    {
      id: 'path', level: 2,
      gen(r) {
        const L = r.int(8, 30), W = r.int(5, 20), w = r.int(1, 3);
        const ans = (L + 2 * w) * (W + 2 * w) - L * W;
        return {
          q: `A ${L} m by ${W} m garden has a path ${w} m wide all the way around the outside. What is the area of the path?`, unit: 'm²', answer: N(ans),
          steps: [`Outer rectangle: (${L} + ${2 * w}) × (${W} + ${2 * w}) = ${L + 2 * w} × ${W + 2 * w} = ${(L + 2 * w) * (W + 2 * w)}.`, `Garden: ${L} × ${W} = ${L * W}.`, `Path = ${(L + 2 * w) * (W + 2 * w)} − ${L * W} = <b>${ans}</b> m².`],
          tip: `Border problems: big rectangle minus small rectangle. The path adds ${w} on EACH side, so each dimension grows by ${2 * w}.`,
          mistakes: [{ value: 2 * w * (L + W), why: `You missed the four ${w} × ${w} corner squares. Use outer area − inner area.` }, { value: (L + w) * (W + w) - L * W, why: `The path is on both sides, so add ${2 * w} to each dimension, not ${w}.` }],
        };
      },
    },
    {
      id: 'scalearea', level: 1,
      gen(r) {
        const p = r.pick([10, 20, 30, 50, 100]);
        const ans = (100 + p) ** 2 / 100 - 100;
        return {
          q: `Each side of a square is increased by ${p}%. By what percent does its area increase?`, unit: '%', answer: N(ans),
          steps: [`Use a 10 × 10 square: area 100.`, `New side = ${10 + p / 10}, new area = ${(10 + p / 10) ** 2}.`, `Increase: ${(10 + p / 10) ** 2} − 100 = ${ans} out of 100 → <b>${ans}%</b>.`],
          tip: `Lengths × k means area × k². Here k = ${(100 + p) / 100}, so area × ${((100 + p) / 100) ** 2}.`,
          mistakes: [{ value: 2 * p, why: `Doubling the percent ignores the small corner piece (${p}% of ${p}%). Square the scale factor instead.` }, { value: p, why: `Area grows faster than side length — it uses length × length.` }],
        };
      },
    },
  ],

  // ───────────────────────────────── Circles
  circles: [
    {
      id: 'arc', level: 2,
      gen(r) {
        const th = r.pick([30, 40, 45, 60, 72, 90, 120, 135, 150]), rr = r.int(2, 12);
        return {
          q: `A circle has radius ${rr} cm. What is the length of an arc with a central angle of ${th}°?`, form: 'in terms of π', unit: 'cm', answer: PI(2 * rr * th, 360),
          steps: [`Full circumference: 2π × ${rr} = ${2 * rr}π.`, `The arc is ${fr(th, 360)} = ${frf(F(th, 360))} of the circle.`, `${frf(F(th, 360))} × ${2 * rr}π = <b>${specToString(PI(2 * rr * th, 360))}</b> cm.`],
          tip: `Arc length and sector area are both "fraction of the circle": (angle ÷ 360) × circumference or × area.`,
          mistakes: [{ value: PI(rr * rr * th, 360), why: `That's the sector's AREA. Arc length uses the circumference 2πr.` }],
        };
      },
    },
    {
      id: 'sector', level: 2,
      gen(r) {
        const th = r.pick([30, 45, 60, 90, 120, 135, 150, 240, 270]), rr = r.int(2, 12);
        return {
          q: `What is the area of a sector with radius ${rr} and central angle ${th}°?`, form: 'in terms of π', unit: 'units²', answer: PI(rr * rr * th, 360),
          steps: [`Full circle area: π × ${rr}² = ${rr * rr}π.`, `The sector is ${frf(F(th, 360))} of the circle.`, `${frf(F(th, 360))} × ${rr * rr}π = <b>${specToString(PI(rr * rr * th, 360))}</b>.`],
          tip: `Simplify angle/360 first (like 120/360 = 1/3) — it makes the multiplication easy.`,
          mistakes: [{ value: PI(2 * rr * th, 360), why: `That's the arc LENGTH. Sector area uses πr².` }],
        };
      },
    },
    {
      id: 'wheel', level: 1,
      gen(r) {
        const d = r.int(10, 30), n = r.int(5, 50);
        return {
          q: `A bike wheel has a diameter of ${d} inches. How far does the bike travel when the wheel turns ${n} full times?`, form: 'in terms of π', unit: 'inches', answer: PI(n * d),
          steps: [`One turn rolls out one circumference: π × ${d} = ${d}π inches.`, `${n} turns: ${n} × ${d}π = <b>${n * d}π</b> inches.`],
          tip: `Rolling wheel: distance per turn = circumference = π × diameter.`,
          mistakes: [{ value: PI(2 * n * d), why: `${d} is the diameter. Circumference = π × diameter (or 2π × radius), so you doubled it once too often.` }],
        };
      },
    },
    {
      id: 'arearatio', level: 2,
      gen(r) {
        let a, b; do { a = r.int(1, 6); b = r.int(2, 9); } while (a >= b || gcd(a, b) !== 1);
        return {
          q: `The circumferences of two circles are in the ratio ${a}:${b}. What is the ratio of the area of the smaller circle to the area of the larger circle?`, form: COMMON, answer: F(a * a, b * b),
          steps: [`Circumference is proportional to the radius, so the radii are in ratio ${a}:${b}.`, `Area uses r², so square the ratio: (${fr(a, b)})² = <b>${fr(a * a, b * b)}</b>.`],
          tip: `Any length ratio (radius, diameter, circumference) squared gives the area ratio.`,
          mistakes: [{ value: F(a, b), why: `That's the ratio of lengths. Areas scale by the SQUARE of the length ratio.` }],
        };
      },
    },
  ],

  // ───────────────────────────────── Right triangles
  pythag: [
    {
      id: 't306090', level: 2,
      gen(r) {
        const x = r.int(2, 12);
        const askLong = r.chance(0.5);
        return askLong ? {
          q: `In a 30-60-90 triangle, the hypotenuse is ${2 * x}. What is the length of the longer leg?`, form: 'simplest radical form', unit: 'units', answer: RAD(x, 3),
          steps: [`30-60-90 sides are in ratio 1 : √3 : 2 (short leg : long leg : hypotenuse).`, `Short leg = ${2 * x} ÷ 2 = ${x}.`, `Long leg = short leg × √3 = <b>${x}√3</b>.`],
          tip: `30-60-90: short leg x, long leg x√3, hypotenuse 2x. The short leg is opposite the 30° angle.`,
          mistakes: [{ value: x, why: `That's the SHORT leg. The long leg is short × √3.` }, { value: 2 * x * Math.sqrt(3), why: `Multiply the SHORT leg (${x}) by √3, not the hypotenuse.` }],
        } : {
          q: `In a 30-60-90 triangle, the shorter leg is ${x}. What is the length of the hypotenuse?`, unit: 'units', answer: N(2 * x),
          steps: [`30-60-90 sides are x : x√3 : 2x.`, `Hypotenuse = 2 × ${x} = <b>${2 * x}</b>.`],
          tip: `30-60-90: short leg x, long leg x√3, hypotenuse 2x.`,
          mistakes: [{ value: x * Math.sqrt(3), why: `x√3 is the LONGER leg. The hypotenuse is 2x.` }],
        };
      },
    },
    {
      id: 'boxdiag', level: 3,
      gen(r) {
        const [a, b, c] = r.pick([[1, 2, 2], [2, 3, 6], [1, 4, 8], [2, 6, 9], [4, 4, 7], [2, 2, 1], [3, 4, 12], [2, 5, 14], [6, 6, 7], [3, 4, 5], [1, 1, 1], [2, 3, 4]]);
        const k = r.int(1, 3);
        const s = (a * a + b * b + c * c) * k * k;
        return {
          q: `A box measures ${a * k} by ${b * k} by ${c * k}. What is the length of the longest straight rod that fits inside (corner to opposite corner)?`, form: simplifyRadical(s).b === 1 ? null : 'simplest radical form', unit: 'units', answer: RAD(1, s),
          steps: [
            `Space diagonal = √(a² + b² + c²).`,
            `√(${(a * k) ** 2} + ${(b * k) ** 2} + ${(c * k) ** 2}) = √${s} = <b>${radStr(RAD(1, s))}</b>.`,
          ],
          tip: `It's the Pythagorean theorem twice: diagonal of the floor, then up to the opposite corner. Shortcut: √(a² + b² + c²).`,
          mistakes: [{ value: Math.sqrt(((a * k) ** 2) + ((b * k) ** 2)), why: `That's only the diagonal of one face. Include the third dimension: √(a² + b² + c²).` }],
        };
      },
    },
    {
      id: 'equiarea', level: 2,
      gen(r) {
        const s = r.int(2, 14);
        return {
          q: `What is the area of an equilateral triangle with side length ${s}?`, form: 'simplest radical form', unit: 'units²', answer: RAD(s * s, 3, 4),
          steps: [
            `The height splits it into two 30-60-90 triangles: height = ${fr(s, 2)}√3.`,
            `Area = ½ × ${s} × ${fr(s, 2)}√3 = ${fr(s * s, 4)}√3 → <b>${radStr(RAD(s * s, 3, 4))}</b>.`,
          ],
          tip: `Memorize: equilateral triangle area = (s²√3) ÷ 4, height = (s√3) ÷ 2.`,
          mistakes: [{ value: (s * s) / 2, why: `The height isn't ${s} — it's (${s}√3) ÷ 2. Area = s²√3 ÷ 4.` }],
        };
      },
    },
    {
      id: 'rectdiag', level: 1,
      gen(r) {
        const [a0, b0, c0] = r.pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [9, 40, 41], [20, 21, 29]]);
        const k = r.int(1, a0 > 7 ? 2 : 5);
        return {
          q: `A rectangular TV screen is ${a0 * k} inches tall and ${b0 * k} inches wide. How long is its diagonal?`, unit: 'inches', answer: N(c0 * k),
          steps: [`The diagonal makes a right triangle with the sides.`, `√(${(a0 * k) ** 2} + ${(b0 * k) ** 2}) = √${(c0 * k) ** 2} = <b>${c0 * k}</b>.`],
          tip: `Check for a known triple first: ${a0 * k}, ${b0 * k} is ${k > 1 ? `${k} × (${a0}, ${b0})` : `the ${a0}-${b0}-${c0} triple`}.`,
          mistakes: [{ value: (a0 + b0) * k, why: `The diagonal is shorter than going along two sides. Use a² + b² = c².` }],
        };
      },
    },
  ],

  // ───────────────────────────────── Angles
  angles: [
    {
      id: 'parallel', level: 1,
      gen(r) {
        const x = r.int(35, 145), kind = r.pick(['alternate interior', 'corresponding', 'same-side interior', 'alternate exterior']);
        if (x === 90) return null;
        const equal = kind !== 'same-side interior';
        const ans = equal ? x : 180 - x;
        return {
          q: `Two parallel lines are cut by a transversal. One angle measures ${x}°. What is the measure of the angle that forms a pair of ${kind} angles with it?`, unit: 'degrees', answer: N(ans),
          steps: equal ? [`${kind[0].toUpperCase() + kind.slice(1)} angles are congruent when lines are parallel.`, `So the angle is <b>${x}°</b>.`] : [`Same-side interior angles are supplementary (add to 180°) when lines are parallel.`, `180° − ${x}° = <b>${ans}°</b>.`],
          tip: `With parallel lines, every angle is either equal to x or 180° − x. Sketch it: if one angle looks acute and the other obtuse, they're supplementary.`,
          mistakes: [{ value: equal ? 180 - x : x, why: equal ? `${kind} angles are EQUAL, not supplementary.` : `Same-side interior angles add to 180°; they aren't equal.` }],
        };
      },
    },
    {
      id: 'isosceles', level: 1,
      gen(r) {
        const v = 2 * r.int(10, 80), askBase = r.chance(0.6);
        const b = (180 - v) / 2;
        return askBase ? {
          q: `An isosceles triangle has a vertex angle (the angle between the two equal sides) of ${v}°. What is the measure of each base angle?`, unit: 'degrees', answer: N(b),
          steps: [`The base angles are equal and the three angles add to 180°.`, `(180° − ${v}°) ÷ 2 = <b>${b}°</b>.`],
          tip: `Isosceles: the two angles opposite the equal sides are equal.`,
          mistakes: [{ value: 180 - v, why: `${180 - v}° is the two base angles together. Divide by 2.` }],
        } : {
          q: `Each base angle of an isosceles triangle measures ${b}°. What is the measure of the vertex angle?`, unit: 'degrees', answer: N(v),
          steps: [`Both base angles are ${b}°.`, `180° − 2 × ${b}° = <b>${v}°</b>.`],
          tip: `Isosceles: the two base angles are equal; the third angle takes what's left of 180°.`,
          mistakes: [{ value: 180 - b, why: `There are TWO base angles of ${b}°. Subtract both.` }],
        };
      },
    },
    {
      id: 'clock', level: 2,
      gen(r) {
        const h = r.int(1, 12), m = 2 * r.int(0, 29);
        const hourAng = (h % 12) * 30 + m / 2, minAng = m * 6;
        let ang = Math.abs(hourAng - minAng); if (ang > 180) ang = 360 - ang;
        let naive = Math.abs((h % 12) * 30 - minAng); if (naive > 180) naive = 360 - naive;
        return {
          q: `What is the measure of the smaller angle between the hour and minute hands of a clock at ${h}:${String(m).padStart(2, '0')}?`, unit: 'degrees', answer: N(ang),
          steps: [
            `Minute hand: ${m} × 6° = ${minAng}° from 12.`,
            `Hour hand: ${h % 12} × 30° = ${(h % 12) * 30}°, plus it moves ½° per minute: + ${m / 2}° = ${hourAng}°.`,
            `Difference: |${hourAng} − ${minAng}| = ${Math.abs(hourAng - minAng) > 180 ? `${Math.abs(hourAng - minAng)}°; the smaller angle is 360° − ${Math.abs(hourAng - minAng)}° = <b>${ang}°</b>` : `<b>${ang}°</b>`}.`,
          ],
          tip: `Minute hand: 6° per minute. Hour hand: 30° per hour PLUS 0.5° per minute. Shortcut: |30h − 5.5m|.`,
          mistakes: m > 0 && naive !== ang ? [{ value: naive, why: `The hour hand doesn't stay on the ${h} — it moves ½° every minute. At :${String(m).padStart(2, '0')} it has moved ${m / 2}° past.` }] : [],
        };
      },
    },
    {
      id: 'sidesfromangle', level: 2,
      gen(r) {
        const n = r.pick([5, 6, 8, 9, 10, 12, 15, 18, 20, 24, 30, 36, 40, 45, 60]);
        const x = 180 - 360 / n;
        return {
          q: `Each interior angle of a regular polygon measures ${x}°. How many sides does it have?`, unit: 'sides', answer: N(n),
          steps: [`Each exterior angle = 180° − ${x}° = ${360 / n}°.`, `Exterior angles add to 360°, so sides = 360 ÷ ${360 / n} = <b>${n}</b>.`],
          tip: `Going from angle → sides is easiest through the exterior angle: n = 360 ÷ (180 − interior).`,
          mistakes: [{ value: 360 / x, why: `Divide 360 by the EXTERIOR angle (${360 / n}°), not the interior one.` }],
        };
      },
    },
  ],

  // ───────────────────────────────── Statistics
  stats: [
    {
      id: 'evenmedian', level: 1,
      gen(r) {
        const vals = Array.from({ length: 6 }, () => r.int(1, 40)).sort((a, b) => a - b);
        const med = (vals[2] + vals[3]) / 2;
        return {
          q: `What is the median of these numbers: ${r.shuffle(vals).join(', ')}?`, answer: N(med),
          steps: [`Sort: ${vals.join(', ')}.`, `With 6 numbers, the median is the average of the 3rd and 4th: (${vals[2]} + ${vals[3]}) ÷ 2 = <b>${med}</b>.`],
          tip: `Even count → median is the average of the two middle numbers. Always sort first!`,
          mistakes: vals[2] !== vals[3] ? [{ value: vals[2], why: `With an even count there are two middle numbers (${vals[2]} and ${vals[3]}). Average them.` }, { value: vals[3], why: `With an even count there are two middle numbers (${vals[2]} and ${vals[3]}). Average them.` }] : [],
        };
      },
    },
    {
      id: 'remove', level: 2,
      gen(r) {
        // Pick the averages, then solve for the removed score: x = nA − (n − 1)B.
        const n = r.int(5, 10), B = r.int(65, 88), A = B + r.pick([-4, -3, -2, -1, 1, 2]);
        const x = n * A - (n - 1) * B;
        if (x < 30 || x > 100) return null;
        return {
          q: `The average of ${n} test scores is ${A}. When one score of ${x} is removed, what is the average of the remaining ${n - 1} scores?`, answer: N(B),
          steps: [`Total of ${n} scores: ${n} × ${A} = ${n * A}.`, `Remove ${x}: ${n * A} − ${x} = ${n * A - x}.`, `New average: ${n * A - x} ÷ ${n - 1} = <b>${B}</b>.`],
          tip: `Average problems → convert to totals, adjust the total, then divide by the new count.`,
          mistakes: [{ value: (n * A - x) / n, why: `After removing a score there are only ${n - 1} scores left. Divide by ${n - 1}.` }],
        };
      },
    },
    {
      id: 'weighted', level: 2,
      gen(r) {
        let a, b, p, q, avg;
        do { a = r.int(5, 20); b = r.int(5, 20); p = r.int(70, 95); q = r.int(70, 95); avg = (a * p + b * q) / (a + b); } while (a === b || p === q || !Number.isInteger(avg));
        return {
          q: `${a} boys in a class averaged ${p} on a test, and ${b} girls averaged ${q}. What was the average for the whole class?`, answer: N(avg),
          steps: [`Boys' total: ${a} × ${p} = ${a * p}. Girls' total: ${b} × ${q} = ${b * q}.`, `Class total: ${a * p + b * q} for ${a + b} students.`, `${a * p + b * q} ÷ ${a + b} = <b>${avg}</b>.`],
          tip: `Combining groups of different sizes → weighted average: add the totals, divide by the total number. The answer is closer to the bigger group's average.`,
          mistakes: [{ value: (p + q) / 2, why: `The groups are different sizes, so you can't just average ${p} and ${q}. Use totals.` }],
        };
      },
    },
  ],
};
