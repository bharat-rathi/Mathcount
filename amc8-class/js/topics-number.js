// Number sense & number theory topics.
// Each topic: slides (visual mini-lesson), tips (tricks), gens (random AMC-style questions).
// A generator takes a level (1 easy … 3 AMC #15-25 style) and returns
// { q, a, wrong: [classic mistakes], steps: [worked solution] }.
(function (root) {
  const { R, pick, gcd, lcm, frac, divisors, isPrime } = root.U;
  const V = root.V;
  const T = (root.TOPICS = root.TOPICS || []);

  T.push({
    id: 'mental', name: 'Mental Math Tricks', emoji: '⚡', color: '#ff8a00',
    slides: [
      { h: 'Times 25 = times 100, then ÷ 4',
        svg: V.svg(V.t(20, 50, '36 × 25', 'big', 0) + V.t(20, 100, '= 3600 ÷ 4', 'big b-t', 1) + V.t(20, 150, '= 900', 'big c-t', 2) + V.t(200, 100, '💯 ÷ 4', 'big', 1.5)),
        text: '25 is a quarter of 100. So multiply by 100 (add two zeros), then take a quarter.' },
      { h: 'Difference of squares',
        svg: V.svg(V.rect(20, 20, 140, 140, 'a', 0) + V.rect(120, 120, 40, 40, 'empty', 1) + V.t(60, 95, 'a²', 'big', 0.5) + V.t(128, 147, 'b²', 'small', 1.2) + V.t(185, 70, 'a² − b²', 'big', 2) + V.t(185, 120, '=(a−b)(a+b)', 'big c-t', 3)),
        text: 'Cut a small square from a big one: what is left rearranges into a rectangle (a−b) by (a+b). 53² − 47² = 6 × 100 = 600.' },
      { h: 'Order of operations: PEMDAS',
        svg: V.svg(['( )', 'xⁿ', '× ÷', '+ −'].map((s, i) => V.rect(20 + i * 75, 60, 65, 60, ['a', 'b', 'c', 'd'][i], i * 0.6) + V.t(32 + i * 75, 100, s, 'big', i * 0.6)).join('') + V.t(20, 160, '× and ÷ go left to right, as do + and −', 'small', 3)),
        text: 'Brackets first, then powers, then × and ÷ left to right, then + and − left to right.' },
    ],
    tips: [
      { name: 'Round and fix', how: 'To do 99 × 37, do 100 × 37 = 3700, then subtract one 37: 3663.', ex: '49 × 8 = 50 × 8 − 8 = 392' },
      { name: 'Times 11 shortcut', how: 'For a two-digit number, put the sum of its digits in the middle: 11 × 43 → 4 (4+3) 3 = 473.', ex: '11 × 72 = 7 (9) 2 = 792' },
      { name: 'Look before you calculate', how: 'AMC loves problems that look huge but cancel. Scan for common factors before multiplying anything.', ex: '(2023 × 2022 − 2022²) = 2022 × (2023 − 2022) = 2022' },
    ],
    gens: [
      (lv) => { const n = R(2, 6 * lv) * 4; return { q: `What is ${n} × 25?`, a: n * 25, wrong: [n * 20, n * 30, n * 25 + 25, n * 25 - 25], steps: [`Times 100: ${n * 100}.`, `Divide by 4: ${n * 25}.`] }; },
      (lv) => { const m = pick([50, 60, 70, 100]), k = R(1, 3 + lv); const a = m + k, b = m - k; return { q: `What is ${a}² − ${b}²?`, a: a * a - b * b, wrong: [(a - b) ** 2, a * a - b * b + 100, 2 * k * m / 2, (a - b) * m], steps: [`a² − b² = (a − b)(a + b).`, `(${a} − ${b})(${a} + ${b}) = ${a - b} × ${a + b} = ${a * a - b * b}.`] }; },
      (lv) => {
        const b = R(2, 9), c = R(2, 9), e = R(2, 5), dv = e * R(2, 6), a = R(1, 20);
        const ans = a + b * c - dv / e, ltr = ((a + b) * c - dv) / e;
        return { q: `What is ${a} + ${b} × ${c} − ${dv} ÷ ${e}?`, a: ans, wrong: [Number.isInteger(ltr) ? ltr : (a + b) * c - dv / e, (a + b) * c - dv / e, a + b * c - dv, a + b * (c - dv / e)], steps: [`× and ÷ first: ${b} × ${c} = ${b * c} and ${dv} ÷ ${e} = ${dv / e}.`, `Then left to right: ${a} + ${b * c} − ${dv / e} = ${ans}.`] };
      },
      (lv) => { const n = lv === 1 ? R(2, 9) : R(11, 49); const x = R(10, 99); const y = 100 * n - 1; return { q: `What is ${y} × ${x} + ${x}?`, a: 100 * n * x, wrong: [y * x, 100 * n * x - x, 100 * n * x + x, 10 * n * x], steps: [`Factor out ${x}: ${x} × (${y} + 1).`, `= ${x} × ${100 * n} = ${100 * n * x}.`] }; },
    ],
  });

  T.push({
    id: 'fractions', name: 'Fractions & Decimals', emoji: '🍕', color: '#e83e8c',
    slides: [
      { h: 'Same-size pieces before adding',
        svg: V.svg(V.bar(20, 30, 120, 30, 2, 1, 'a', 0, '1/2') + V.bar(20, 80, 120, 30, 3, 1, 'b', 1, '1/3') + V.bar(20, 135, 240, 30, 6, 5, 'c', 2.5, '= 5/6')),
        text: 'You cannot add halves and thirds directly. Cut both into sixths: 3/6 + 2/6 = 5/6.' },
      { h: '"Of" means multiply',
        svg: V.svg(V.bar(20, 40, 280, 34, 4, 3, 'a', 0) + V.t(20, 30, '3/4 of 48 = 36', 'small', 0) + V.bar(20, 110, 210, 34, 3, 2, 'b', 1.5) + V.t(20, 100, '2/3 of that = 24', 'small', 1.5)),
        text: '2/3 of 3/4 of 48: multiply 2/3 × 3/4 = 1/2 first. Half of 48 is 24.' },
      { h: 'Telescoping: the middle cancels',
        svg: V.svg(V.t(10, 70, '1/2 × 2/3 × 3/4 × 4/5', 'big', 0) + V.line(70, 60, 90, 45, 'red', 1) + V.line(115, 60, 135, 45, 'red', 1.3) + V.line(165, 60, 185, 45, 'red', 1.6) + V.t(100, 140, '= 1/5', 'big c-t', 2.5)),
        text: 'Each top cancels the bottom before it. Only the first top and the last bottom survive.' },
    ],
    tips: [
      { name: 'Cross-multiply to compare', how: 'Which is bigger, 5/8 or 7/11? Compare 5×11 = 55 with 7×8 = 56. 56 wins, so 7/11 is bigger.', ex: '3/7 vs 4/9: 27 < 28 so 4/9' },
      { name: 'Know your eighths', how: '1/8 = 0.125, 3/8 = 0.375, 5/8 = 0.625, 7/8 = 0.875. They show up everywhere.', ex: '0.375 × 16 = 3/8 × 16 = 6' },
      { name: 'Turn decimals into fractions', how: '0.25 × 0.4 ÷ 0.05 is ugly. 1/4 × 2/5 ÷ 1/20 = 1/10 × 20 = 2.', ex: '0.2 × 0.5 = 1/5 × 1/2 = 1/10' },
    ],
    gens: [
      (lv) => {
        const b = pick([2, 3, 4, 5, 6]), d = pick([3, 4, 5, 7, 8].filter((x) => x !== b));
        const a = R(1, b - 1), c = R(1, d - 1);
        return { q: `What is ${a}/${b} + ${c}/${d}? (simplest form)`, a: frac(a * d + c * b, b * d), wrong: [frac(a + c, b + d), frac(a + c, b * d), frac(a * c, b * d), frac(a * d + c * b + b * d, b * d)], steps: [`Common denominator ${b * d}: ${a * d}/${b * d} + ${c * b}/${b * d}.`, `= ${a * d + c * b}/${b * d} = ${frac(a * d + c * b, b * d)}.`] };
      },
      (lv) => {
        const [p, q] = pick([[2, 3], [3, 4], [3, 5], [4, 5], [5, 6]]), [r, s] = pick([[1, 2], [2, 3], [3, 4], [1, 4]]);
        const n = q * s * R(1, 3 * lv);
        const ans = (p * r * n) / (q * s);
        return { q: `What is ${r}/${s} of ${p}/${q} of ${n}?`, a: ans, wrong: [(p * n) / q, (r * n) / s, n - ans, ans * 2], steps: [`Multiply the fractions: ${r}/${s} × ${p}/${q} = ${frac(p * r, q * s)}.`, `${frac(p * r, q * s)} of ${n} = ${ans}.`] };
      },
      (lv) => {
        const n = R(5, 10 + 10 * lv);
        return { q: `What is (1 − 1/2)(1 − 1/3)(1 − 1/4)···(1 − 1/${n})?`, a: frac(1, n), wrong: [frac(1, n - 1), frac(n - 1, n), frac(1, 2 * n), frac(1, 2)], steps: ['Each bracket is (k−1)/k: 1/2 × 2/3 × 3/4 × … ', `Everything cancels except the first top (1) and the last bottom (${n}): 1/${n}.`] };
      },
      (lv) => {
        const pairs = [[3, 8, 0.375], [5, 8, 0.625], [1, 8, 0.125], [7, 8, 0.875], [3, 4, 0.75], [2, 5, 0.4]];
        const [a, b, dec] = pick(pairs); const k = b * R(2, 5 * lv);
        return { q: `What is ${dec} × ${k}?`, a: (a * k) / b, wrong: [k / b, (a * k) / b + a, k * a, (a * k) / b - 1], steps: [`${dec} = ${a}/${b}.`, `${a}/${b} × ${k} = ${a} × ${k / b} = ${(a * k) / b}.`] };
      },
    ],
  });

  T.push({
    id: 'percents', name: 'Percents', emoji: '💯', color: '#20c997',
    slides: [
      { h: 'Percent = "out of 100"',
        svg: V.svg(V.dots(5, 10, 40, 30, 24, 'a', 0) + V.dots(2, 10, 40, 30, 24, 'b', 1) + V.t(40, 170, '20 out of 100 = 20%', 'small', 2)),
        text: '20% of anything means: split it into 100 equal parts, take 20 of them. Or just ÷ 5.' },
      { h: 'Up 20%, then down 20% ≠ the start',
        svg: V.svg(V.rect(20, 80, 60, 80, 'a', 0) + V.t(30, 70, '100', 'small', 0) + V.rect(120, 64, 60, 96, 'b', 1) + V.t(130, 55, '120', 'small', 1) + V.rect(220, 84, 60, 76, 'c', 2) + V.t(230, 75, '96', 'small', 2)),
        text: 'The 20% off is taken from the bigger number (120), so you end up 4% lower. Up p% then down p% is always a loss of p²/100 %.' },
      { h: 'Multiply by the multiplier',
        svg: V.svg(V.t(20, 50, '+15%  →  × 1.15', 'big', 0) + V.t(20, 100, '−30%  →  × 0.70', 'big b-t', 1) + V.t(20, 150, 'both  →  × 1.15 × 0.7', 'big c-t', 2)),
        text: 'Every percent change is one multiplication. Chain them to do several changes at once.' },
    ],
    tips: [
      { name: 'Swap trick', how: 'x% of y = y% of x. 16% of 25 is hard; 25% of 16 is 4.', ex: '8% of 50 = 50% of 8 = 4' },
      { name: 'Pretend it is 100', how: 'If no price is given, start at $100. Percents become plain dollars.', ex: '+25% then −20%: 100 → 125 → 100. No change!' },
      { name: '10% then build', how: 'Find 10% (move the decimal), then build any percent: 35% = 3 × 10% + half of 10%.', ex: '35% of 80 = 24 + 4 = 28' },
    ],
    gens: [
      (lv) => { const p = pick([10, 20, 30, 40, 50]); return { q: `A price goes up ${p}%, then the new price goes down ${p}%. Overall, the price…`, a: `decreases by ${(p * p) / 100}%`, wrong: ['does not change', `decreases by ${p}%`, `increases by ${(p * p) / 100}%`, `decreases by ${2 * p}%`], steps: [`Start at 100. Up ${p}%: ${100 + p}.`, `Down ${p}% of ${100 + p} = ${((100 + p) * p) / 100}: ${100 + p - ((100 + p) * p) / 100}.`, `That is ${(p * p) / 100}% less than 100.`] }; },
      (lv) => { const [x, y] = pick([[16, 25], [8, 50], [12, 25], [36, 25], [4, 75], [24, 50], [44, 25]]); return { q: `What is ${x}% of ${y}?`, a: (x * y) / 100, wrong: [(x * y) / 10, x * y, (x * y) / 100 + 1, y - x], steps: [`Swap: ${x}% of ${y} = ${y}% of ${x}.`, `${y}% of ${x} = ${(x * y) / 100}.`] }; },
      (lv) => { const P = R(2, 8) * 20, d = pick([10, 15, 20, 25, 30, 40]); const s = P * (100 - d) / 100; return { q: `A jacket costs $${P}. It is on sale for ${d}% off. What is the sale price in dollars?`, a: s, wrong: [P - d, (P * d) / 100, P + (P * d) / 100, s - 5], steps: [`${d}% off means you pay ${100 - d}%.`, `${100 - d}% of ${P} = ${s}.`] }; },
      (lv) => { const [up, dn, res] = pick([[25, 20, 'no change'], [50, 20, 'increase of 20%'], [20, 25, 'decrease of 10%'], [10, 10, 'decrease of 1%'], [50, 50, 'decrease of 25%']]); const opts = ['no change', 'increase of 20%', 'decrease of 10%', 'decrease of 1%', 'decrease of 25%', `increase of ${up - dn}%`, `decrease of ${dn}%`].filter((s) => s !== res); return { q: `A number is increased by ${up}%, then the result is decreased by ${dn}%. What is the overall change?`, a: res, wrong: opts, steps: [`Use multipliers: ${(100 + up) / 100} × ${(100 - dn) / 100} = ${((100 + up) * (100 - dn)) / 10000}.`, `So the result is ${res}.`] }; },
    ],
  });

  T.push({
    id: 'ratios', name: 'Ratios & Proportions', emoji: '⚖️', color: '#6f42c1',
    slides: [
      { h: 'A ratio is a recipe of parts',
        svg: V.svg(V.bar(20, 50, 120, 40, 2, 2, 'a', 0) + V.bar(150, 50, 180, 40, 3, 3, 'b', 1) + V.t(20, 40, 'boys : girls = 2 : 3', 'small', 0) + V.t(20, 130, '5 parts = 30 kids → 1 part = 6', 'small', 2) + V.t(20, 160, 'boys 12, girls 18', 'small c-t', 3)),
        text: 'Add the ratio numbers to get total parts. Divide the total by the parts to get one part.' },
      { h: 'Link ratios with a common middle',
        svg: V.svg(V.t(20, 50, 'a : b = 2 : 3', 'big', 0) + V.t(20, 90, 'b : c = 4 : 5', 'big', 1) + V.t(20, 140, 'make b = 12:  8 : 12 : 15', 'big c-t', 2)),
        text: 'Scale both ratios so the shared letter matches (LCM of 3 and 4 is 12). Then read a : c = 8 : 15.' },
      { h: 'The difference is parts too',
        svg: V.svg(V.bar(20, 50, 160, 36, 4, 4, 'a', 0, '4') + V.bar(20, 100, 280, 36, 7, 7, 'b', 1, '7') + V.t(20, 165, 'difference = 3 parts', 'small c-t', 2.5)),
        text: 'If the ratio is 4 : 7 and there are 15 more girls, then 3 parts = 15, so 1 part = 5.' },
    ],
    tips: [
      { name: 'Unit first', how: 'Always find the value of ONE part first. Everything else is multiplying.', ex: '3:5, total 64 → one part 8' },
      { name: 'Check divisibility', how: 'The total must be a multiple of the sum of the ratio. It is a great way to rule out answer choices fast.', ex: 'ratio 3:4 → total divisible by 7' },
    ],
    gens: [
      (lv) => { const a = R(1, 5), b = R(a + 1, 8), k = R(2, 4 + 3 * lv); return { q: `The ratio of cats to dogs at a shelter is ${a} : ${b}. There are ${(a + b) * k} animals. How many are dogs?`, a: b * k, wrong: [a * k, (b * (a + b) * k) / a | 0, (a + b) * k - a, b * k + a], steps: [`Total parts: ${a} + ${b} = ${a + b}.`, `One part = ${(a + b) * k} ÷ ${a + b} = ${k}.`, `Dogs = ${b} × ${k} = ${b * k}.`] }; },
      (lv) => { const a = R(2, 5), b = a + R(1, 4), k = R(3, 6 * lv); return { q: `The ratio of boys to girls is ${a} : ${b}. There are ${(b - a) * k} more girls than boys. How many students are there in total?`, a: (a + b) * k, wrong: [b * k, (b - a) * k * 2, (a + b) * (b - a), a * k], steps: [`The difference is ${b - a} parts = ${(b - a) * k}, so one part = ${k}.`, `Total = ${a + b} parts = ${(a + b) * k}.`] }; },
      (lv) => { const [a, b] = pick([[2, 3], [3, 4], [1, 2], [3, 5], [5, 6]]), [c, d] = pick([[4, 5], [2, 3], [5, 7], [3, 2]]); const m = lcm(b, c); const A = a * (m / b), C = d * (m / c), g = gcd(A, C); return { q: `If a : b = ${a} : ${b} and b : c = ${c} : ${d}, what is a : c?`, a: `${A / g} : ${C / g}`, wrong: [[a, d], [a * c, b * d], [d, a], [C, A], [a + c, b + d]].map(([x, y]) => `${x / gcd(x, y)} : ${y / gcd(x, y)}`), steps: [`Make b match: LCM(${b}, ${c}) = ${m}.`, `a : b : c = ${A} : ${m} : ${C}.`, `a : c = ${A / g} : ${C / g}.`] }; },
    ],
  });

  T.push({
    id: 'rates', name: 'Speed, Rates & Work', emoji: '🏎️', color: '#fd7e14',
    slides: [
      { h: 'D = R × T triangle',
        svg: V.svg(V.poly('160,20 60,160 260,160', 'a', 0) + V.line(90, 110, 230, 110, 'thick', 1) + V.line(160, 110, 160, 160, 'thick', 1) + V.t(148, 85, 'D', 'big', 1.5) + V.t(100, 145, 'R', 'big', 2) + V.t(190, 145, 'T', 'big', 2)),
        text: 'Cover the one you want: D = R × T, R = D ÷ T, T = D ÷ R. Watch the units: minutes vs hours!' },
      { h: 'Average speed is NOT the average of speeds',
        svg: V.svg(V.t(20, 40, 'Go 60 mi at 30 mph → 2 h', 'small', 0) + V.t(20, 75, 'Back 60 mi at 60 mph → 1 h', 'small', 1) + V.t(20, 120, '120 mi ÷ 3 h = 40 mph', 'big c-t', 2) + V.t(20, 160, 'not 45!', 'big red-t', 3)),
        text: 'Average speed = total distance ÷ total time. You spend longer at the slow speed, so the average is pulled down.' },
      { h: 'Work: add the rates',
        svg: V.svg(V.bar(20, 40, 240, 30, 6, 2, 'a', 0, 'A: 1/3 per h') + V.bar(20, 90, 240, 30, 6, 1, 'b', 1, 'B: 1/6 per h') + V.bar(20, 140, 240, 30, 6, 3, 'c', 2, 'both: 1/2 → 2 h')),
        text: 'If A paints a fence in 3 hours, A does 1/3 of it each hour. Rates add: 1/3 + 1/6 = 1/2 per hour, so 2 hours together.' },
    ],
    tips: [
      { name: 'Product over sum', how: 'Two workers (or two speeds over the same distance): together time = ab ÷ (a + b). Average speed for equal distances = 2ab ÷ (a + b).', ex: '3 h and 6 h → 18 ÷ 9 = 2 h' },
      { name: 'Minutes ↔ hours', how: '20 min = 1/3 h, 15 min = 1/4 h, 45 min = 3/4 h. Convert before using D = RT.', ex: '48 mph for 15 min = 12 mi' },
    ],
    gens: [
      (lv) => { const [v1, v2] = pick([[30, 60], [40, 60], [20, 30], [60, 90], [12, 24], [30, 70]]); const avg = (2 * v1 * v2) / (v1 + v2); return { q: `Maya rides to her friend's house at ${v1} mph and back the same way at ${v2} mph. What is her average speed for the whole trip, in mph?`, a: avg, wrong: [(v1 + v2) / 2, v2 - v1, avg + 2, v1], steps: [`Pick a distance, say ${v1 * v2 / gcd(v1, v2)} miles each way.`, `Times: ${v2 / gcd(v1, v2)} h and ${v1 / gcd(v1, v2)} h, total ${(v1 + v2) / gcd(v1, v2)} h.`, `Average = ${2 * v1 * v2 / gcd(v1, v2)} ÷ ${(v1 + v2) / gcd(v1, v2)} = ${avg} mph.`] }; },
      (lv) => { const [a, b] = pick([[3, 6], [4, 12], [6, 12], [10, 15], [12, 24], [6, 3], [20, 30]]); const t = (a * b) / (a + b); return { q: `Ann can mow the lawn in ${a} hours. Ben can mow it in ${b} hours. Working together, how many hours does it take?`, a: t, wrong: [(a + b) / 2, a + b, Math.abs(a - b), t + 1], steps: [`Rates: 1/${a} + 1/${b} of the lawn per hour.`, `= ${frac(a + b, a * b)} per hour, so time = ${a * b} ÷ ${a + b} = ${t} h.`] }; },
      (lv) => { const v = pick([36, 48, 60, 72, 40, 90]), m = pick([15, 20, 30, 45, 40, 10].filter((x) => (v * x) % 60 === 0)); const d = (v * m) / 60; return { q: `A train travels at ${v} miles per hour. How many miles does it go in ${m} minutes?`, a: d, wrong: [v * m, d * 2, v - m, d + v / 6], steps: [`${m} min = ${frac(m, 60)} hour.`, `${v} × ${frac(m, 60)} = ${d} miles.`] }; },
    ],
  });

  T.push({
    id: 'divisibility', name: 'Divisibility Rules', emoji: '🔍', color: '#17a2b8',
    slides: [
      { h: 'The quick tests',
        svg: V.svg([['2', 'last digit even'], ['3', 'digit sum ÷ 3'], ['4', 'last 2 digits ÷ 4'], ['5', 'ends 0 or 5'], ['9', 'digit sum ÷ 9'], ['11', 'alternating sum ÷ 11']].map(([n, r], i) => V.rect(10 + (i % 2) * 155, 10 + Math.floor(i / 2) * 56, 145, 48, ['a', 'b', 'c'][i % 3], i * 0.5) + V.t(20 + (i % 2) * 155, 42 + Math.floor(i / 2) * 56, `${n}: ${r}`, 'small', i * 0.5)).join('')),
        text: 'You never need to divide to test these. 6 = test 2 and 3; 12 = test 3 and 4.' },
      { h: 'Find the missing digit',
        svg: V.svg(V.t(40, 70, '4 _ 7 2', 'huge', 0) + V.t(40, 120, '4 + ? + 7 + 2 = 13 + ?', 'small', 1) + V.t(40, 160, 'divisible by 9 → ? = 5', 'small c-t', 2)),
        text: 'For 9: the digit sum must be a multiple of 9. 13 + ? = 18 means ? = 5.' },
      { h: 'Counting multiples',
        svg: V.svg(V.numline(0, 12, [3, 6, 9, 12], 0) + V.t(40, 50, 'multiples of 3 up to 12: 12 ÷ 3 = 4', 'small', 2)),
        text: 'Up to N there are ⌊N ÷ k⌋ multiples of k. Multiples of both 3 and 4 = multiples of 12.' },
    ],
    tips: [
      { name: 'Divisible by both → LCM', how: 'A number divisible by 4 and by 6 is divisible by LCM 12, not by 24.', ex: '1–100: multiples of 4 and 6 → ⌊100/12⌋ = 8' },
      { name: 'Between a and b', how: 'Count multiples of k from a to b: ⌊b/k⌋ − ⌊(a−1)/k⌋.', ex: 'multiples of 7 from 50 to 100: 14 − 7 = 7' },
    ],
    gens: [
      (lv) => { const d = [R(1, 9), R(0, 9), R(0, 9)]; const s = d.reduce((x, y) => x + y, 0); const miss = (9 - (s % 9)) % 9; return { q: `The four-digit number ${d[0]}${d[1]}?${d[2]} is divisible by 9. What digit is "?" (the smallest one that works)?`, a: miss, wrong: [(miss + 3) % 10, (miss + 1) % 10, (miss + 6) % 10, 9 - miss === miss ? 1 : 9 - miss], steps: [`Digit sum: ${d[0]} + ${d[1]} + ? + ${d[2]} = ${s} + ?.`, `The next multiple of 9 at or above ${s} is ${s + miss}, so ? = ${miss}.`] }; },
      (lv) => { const [a, b] = pick([[3, 4], [4, 6], [6, 8], [2, 5], [6, 9], [4, 10]]); const N = R(5, 20) * 10 * lv; const L = lcm(a, b); return { q: `How many whole numbers from 1 to ${N} are divisible by both ${a} and ${b}?`, a: Math.floor(N / L), wrong: [Math.floor(N / (a * b)), Math.floor(N / a) + Math.floor(N / b), Math.floor(N / a), Math.floor(N / L) + 1], steps: [`Divisible by both ${a} and ${b} means divisible by LCM = ${L}.`, `⌊${N} ÷ ${L}⌋ = ${Math.floor(N / L)}.`] }; },
      (lv) => { const k = R(3, 9), a = R(20, 60), b = a + R(40, 100); const c = Math.floor(b / k) - Math.floor((a - 1) / k); return { q: `How many multiples of ${k} are between ${a} and ${b}, inclusive?`, a: c, wrong: [c + 1, c - 1, Math.floor((b - a) / k) === c ? c + 2 : Math.floor((b - a) / k), Math.floor(b / k)], steps: [`Multiples up to ${b}: ⌊${b}/${k}⌋ = ${Math.floor(b / k)}.`, `Multiples below ${a}: ⌊${a - 1}/${k}⌋ = ${Math.floor((a - 1) / k)}.`, `Difference: ${c}.`] }; },
    ],
  });

  T.push({
    id: 'gcflcm', name: 'Primes, GCF & LCM', emoji: '🌳', color: '#28a745',
    slides: [
      { h: 'Factor trees',
        svg: V.svg(V.t(145, 25, '60', 'big', 0) + V.line(155, 32, 105, 70, '', 0.5) + V.line(165, 32, 215, 70, '', 0.5) + V.t(95, 88, '6', 'big', 1) + V.t(205, 88, '10', 'big', 1) + V.line(100, 95, 75, 130, '', 1.5) + V.line(105, 95, 130, 130, '', 1.5) + V.line(210, 95, 185, 130, '', 1.5) + V.line(215, 95, 240, 130, '', 1.5) + ['2', '3', '2', '5'].map((s, i) => V.circ([70, 135, 180, 245][i], 150, 16, 'b', 2) + V.t([64, 129, 174, 239][i], 157, s, 'small', 2)).join('')),
        text: 'Break a number down until every branch ends in a prime. 60 = 2² × 3 × 5.' },
      { h: 'GCF takes the overlap, LCM takes everything',
        svg: V.svg(V.circ(115, 95, 70, 'a op', 0) + V.circ(205, 95, 70, 'b op', 0.5) + V.t(65, 100, '2', 'big', 1) + V.t(150, 90, '2·3', 'big', 1.5) + V.t(235, 100, '5', 'big', 1) + V.t(20, 175, '12 = 2·2·3   30 = 2·3·5', 'small', 2)),
        text: 'GCF(12, 30) = the middle = 6. LCM(12, 30) = everything = 2·2·3·5 = 60.' },
      { h: 'GCF × LCM = product',
        svg: V.svg(V.t(20, 70, '6 × 60 = 360', 'big', 0) + V.t(20, 120, '12 × 30 = 360', 'big b-t', 1) + V.t(150, 165, '✨', 'huge', 2)),
        text: 'For any two numbers, GCF × LCM = the two numbers multiplied together. A fast way to find a missing number.' },
    ],
    tips: [
      { name: 'Repeat-together = LCM', how: '"Next time they happen together" (buses, blinking lights, laps) is always an LCM question.', ex: 'every 12 and 18 min → together every 36 min' },
      { name: 'Prime check up to √n', how: 'To test if n is prime, only try primes up to √n. For 97, try 2, 3, 5, 7. None work, so it is prime.', ex: '91 = 7 × 13 (not prime!)' },
    ],
    gens: [
      (lv) => { const g = pick([2, 3, 4, 5, 6, 8]); let x = R(2, 7), y = R(2, 9); while (gcd(x, y) !== 1 || x === y) y = R(2, 9); const a = g * x, b = g * y, L = g * x * y; return { q: `Two numbers have GCF ${g} and LCM ${L}. One of them is ${a}. What is the other?`, a: b, wrong: [L / g, (L * g) / a + g, L - a, g * y * 2], steps: [`GCF × LCM = product: ${g} × ${L} = ${g * L}.`, `Other = ${g * L} ÷ ${a} = ${b}.`] }; },
      (lv) => { const [a, b] = pick([[12, 18], [8, 12], [15, 20], [10, 25], [6, 15], [14, 21], [16, 24]]); const h = R(6, 8); return { q: `One bus leaves the station every ${a} minutes, another every ${b} minutes. Both leave at ${h}:00 AM. After how many minutes do they next leave together?`, a: lcm(a, b), wrong: [a * b, a + b, gcd(a, b), lcm(a, b) * 2], steps: [`"Together again" = LCM(${a}, ${b}).`, `LCM = ${lcm(a, b)} minutes.`] }; },
      (lv) => { const g = pick([6, 8, 9, 12, 14, 15]); const a = g * pick([2, 3, 5]), b = g * pick([7, 4, 11].filter((x) => gcd(x, a / g) === 1)); return { q: `What is the greatest common factor of ${a} and ${b}?`, a: gcd(a, b), wrong: [lcm(a, b), gcd(a, b) / 2 | 0 || 1, gcd(a, b) * 2, b - a], steps: [`List factors or use prime factorizations.`, `Both share ${gcd(a, b)}, and nothing larger.`] }; },
      (lv) => { const lo = R(20, 60), hi = lo + 20; const ps = []; for (let i = lo; i <= hi; i++) if (isPrime(i)) ps.push(i); return { q: `How many prime numbers are between ${lo} and ${hi}, inclusive?`, a: ps.length, wrong: [ps.length + 1, ps.length - 1, ps.length + 2, 10], steps: [`Check odd numbers, ruling out multiples of 3, 5, 7.`, `Primes: ${ps.join(', ')}. That's ${ps.length}.`] }; },
    ],
  });

  T.push({
    id: 'divisors', name: 'Counting Divisors', emoji: '🧮', color: '#007bff',
    slides: [
      { h: 'Divisors come in pairs',
        svg: V.svg([[1, 36], [2, 18], [3, 12], [4, 9]].map(([a, b], i) => V.t(30 + i * 70, 60, `${a}×${b}`, 'small', i * 0.5)).join('') + V.t(130, 120, '6×6', 'big c-t', 2.5) + V.t(20, 165, 'a square has one unpaired divisor', 'small', 3)),
        text: 'Pair each divisor with its partner. Only a perfect square has a divisor paired with itself, so only squares have an odd number of divisors.' },
      { h: 'The exponent formula',
        svg: V.svg(V.t(20, 50, '72 = 2³ × 3²', 'big', 0) + V.t(20, 100, '(3+1) × (2+1)', 'big b-t', 1) + V.t(20, 150, '= 12 divisors', 'big c-t', 2)),
        text: 'Each divisor picks 0–3 twos (4 ways) and 0–2 threes (3 ways). Multiply: 4 × 3 = 12.' },
      { h: 'Grid of choices',
        svg: V.svg(V.dots(3, 4, 60, 40, 50, 'a', 0) + V.t(40, 20, '2⁰  2¹  2²  2³', 'small', 0.5) + V.t(5, 45, '3⁰', 'tiny', 0.5) + V.t(5, 95, '3¹', 'tiny', 0.5) + V.t(5, 145, '3²', 'tiny', 0.5)),
        text: 'Every dot is one divisor of 72: a row (power of 3) times a column (power of 2).' },
    ],
    tips: [
      { name: 'Odd divisors = squares', how: 'How many numbers 1–N have an odd number of divisors? Count perfect squares: ⌊√N⌋.', ex: '1–100: 10 numbers' },
      { name: 'Light switches / lockers', how: 'The famous locker problem: lockers left open are exactly the perfect squares.', ex: '1000 lockers → 31 open' },
    ],
    gens: [
      (lv) => { const [p, q] = pick([[2, 3], [2, 5], [3, 5], [2, 7]]); const a = R(1, 2 + lv), b = R(1, 2); const n = p ** a * q ** b; return { q: `How many positive divisors does ${n} have?`, a: (a + 1) * (b + 1), wrong: [a * b, a + b + 2, (a + 1) * (b + 1) - 2, (a + 1) * (b + 1) + 1], steps: [`${n} = ${p}^${a} × ${q}^${b}.`, `(${a}+1)(${b}+1) = ${(a + 1) * (b + 1)}.`] }; },
      (lv) => { const N = pick([50, 100, 150, 200, 300, 500]); const s = Math.floor(Math.sqrt(N)); return { q: `How many whole numbers from 1 to ${N} have an odd number of positive divisors?`, a: s, wrong: [Math.floor(N / 2), s + 1, s - 1, Math.floor(N / 3)], steps: ['Divisors pair up, except in perfect squares.', `Squares up to ${N}: 1² … ${s}², so ${s}.`] }; },
      (lv) => { const n = pick([24, 30, 36, 48, 60, 18]); const ds = divisors(n); return { q: `What is the sum of all positive divisors of ${n}?`, a: ds.reduce((x, y) => x + y, 0), wrong: [ds.reduce((x, y) => x + y, 0) - n, ds.reduce((x, y) => x + y, 0) - 1, 2 * n, ds.length], steps: [`Divisors: ${ds.join(', ')}.`, `Sum: ${ds.reduce((x, y) => x + y, 0)}.`] }; },
    ],
  });

  T.push({
    id: 'units', name: 'Units Digits & Cycles', emoji: '🔁', color: '#dc3545',
    slides: [
      { h: 'Units digits repeat',
        svg: V.svg(['2', '4', '8', '6'].map((s, i) => V.circ(160 + 70 * Math.cos((i * Math.PI) / 2 - Math.PI / 2), 95 + 65 * Math.sin((i * Math.PI) / 2 - Math.PI / 2), 22, ['a', 'b', 'c', 'd'][i], i * 0.5) + V.t(153 + 70 * Math.cos((i * Math.PI) / 2 - Math.PI / 2), 102 + 65 * Math.sin((i * Math.PI) / 2 - Math.PI / 2), s, 'big', i * 0.5)).join('') + V.t(130, 103, '2ⁿ', 'big', 2)),
        text: 'Powers of 2 end in 2, 4, 8, 6, 2, 4, 8, 6… The cycle length is 4.' },
      { h: 'Use the remainder',
        svg: V.svg(V.t(20, 50, '2¹⁰⁰ → 100 ÷ 4', 'big', 0) + V.t(20, 100, 'remainder 0 → last in cycle', 'small', 1) + V.t(20, 150, 'ends in 6', 'big c-t', 2)),
        text: 'Divide the exponent by the cycle length. Remainder 1 = first in the cycle, …, remainder 0 = last.' },
      { h: 'Only units digits matter',
        svg: V.svg(V.t(20, 60, '1237 × 4568', 'big', 0) + V.t(20, 110, '7 × 8 = 56', 'big b-t', 1) + V.t(20, 160, 'ends in 6', 'big c-t', 2)),
        text: 'For the last digit of a sum or product, throw away everything except the last digits.' },
    ],
    tips: [
      { name: 'Cycles to memorize', how: '0,1,5,6 never change. 4 and 9 cycle every 2. 2,3,7,8 cycle every 4.', ex: '9 odd power → 9, even → 1' },
      { name: 'Ends in zero = factors of 10', how: 'Count trailing zeros by counting pairs of 2 × 5 (usually just count the 5s).', ex: '25! has 6 zeros (5,10,15,20,25 → 25 gives two)' },
    ],
    gens: [
      (lv) => { const b = pick([2, 3, 7, 8, 4, 9]), n = R(20, 99 + 900 * (lv - 1)); const cyc = []; let x = b % 10; do { cyc.push(x); x = (x * b) % 10; } while (x !== cyc[0]); const ans = cyc[(n - 1) % cyc.length]; return { q: `What is the units digit of ${b}^${n}?`, a: ans, wrong: cyc.filter((c) => c !== ans).concat([(b * n) % 10, 0, 5].filter((c) => !cyc.includes(c))), steps: [`Units digits of ${b}^n cycle: ${cyc.join(', ')} (length ${cyc.length}).`, `${n} ÷ ${cyc.length} has remainder ${n % cyc.length || cyc.length} → ${ans}.`] }; },
      (lv) => { const a = R(100, 999), b = R(100, 999), c = R(10, 99); const ans = (a * b + c) % 10; return { q: `What is the units digit of ${a} × ${b} + ${c}?`, a: ans, wrong: [(a + b + c) % 10, (ans + 1) % 10, (ans + 5) % 10, (a * b) % 10 === ans ? (ans + 2) % 10 : (a * b) % 10], steps: [`Only units digits: ${a % 10} × ${b % 10} + ${c % 10} = ${(a % 10) * (b % 10) + (c % 10)}.`, `Units digit: ${ans}.`] }; },
      (lv) => { const n = pick([10, 15, 20, 25, 30, 50, 100]); let z = 0; for (let p = 5; p <= n; p *= 5) z += Math.floor(n / p); return { q: `How many zeros are at the end of ${n}! (that is, 1 × 2 × 3 × … × ${n})?`, a: z, wrong: [Math.floor(n / 5), Math.floor(n / 10), z + 1, Math.floor(n / 2)].filter((v) => v !== z), steps: ['Each trailing zero needs a 2 × 5; there are plenty of 2s, so count the 5s.', `⌊${n}/5⌋${n >= 25 ? ` + ⌊${n}/25⌋` : ''} = ${z}.`] }; },
    ],
  });

  T.push({
    id: 'remainders', name: 'Remainders & Clock Math', emoji: '🕐', color: '#795548',
    slides: [
      { h: 'Remainders wrap around like a clock',
        svg: V.svg(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((s, i) => V.circ(160 + 70 * Math.cos((i * 2 * Math.PI) / 7 - Math.PI / 2), 95 + 70 * Math.sin((i * 2 * Math.PI) / 7 - Math.PI / 2), 20, i ? 'empty' : 'b', i * 0.2) + V.t(148 + 70 * Math.cos((i * 2 * Math.PI) / 7 - Math.PI / 2), 100 + 70 * Math.sin((i * 2 * Math.PI) / 7 - Math.PI / 2), s, 'tiny', i * 0.2)).join('') + V.t(125, 100, '÷ 7', 'big', 2)),
        text: '100 days after Monday: 100 = 14 × 7 + 2. Full weeks do nothing, so move 2 days → Wednesday.' },
      { h: 'Remainders multiply and add',
        svg: V.svg(V.t(20, 50, '47 × 53 ÷ 5 → ?', 'big', 0) + V.t(20, 100, 'remainders 2 × 3 = 6', 'big b-t', 1) + V.t(20, 150, '6 ÷ 5 → remainder 1', 'big c-t', 2)),
        text: 'Replace each number by its remainder first. The answer\'s remainder is the same.' },
      { h: 'Same remainder → LCM + r',
        svg: V.svg(V.t(20, 60, 'leaves 1 when ÷ by 2, 3, 4', 'small', 0) + V.t(20, 110, 'n − 1 is a multiple of 12', 'big b-t', 1) + V.t(20, 160, 'smallest n > 1: 13', 'big c-t', 2)),
        text: 'If n leaves the same remainder r for several divisors, n − r is a multiple of their LCM.' },
    ],
    tips: [
      { name: 'Negative remainders', how: '99 ÷ 10 leaves remainder 9, or think of it as −1. Then 99² leaves (−1)² = 1.', ex: '29³ mod 10: 29 ≡ −1 → ends in 9' },
      { name: 'Units digit = remainder ÷ 10', how: 'A units-digit problem is a remainder-by-10 problem in disguise.', ex: '7²³ mod 10 = 3' },
    ],
    gens: [
      (lv) => { const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']; const s = R(0, 6), n = R(30, 120 * lv); const e = days[(s + n) % 7]; return { q: `Today is ${days[s]}. What day of the week will it be ${n} days from today?`, a: e, wrong: days.filter((d) => d !== e), steps: [`${n} = ${Math.floor(n / 7)} × 7 + ${n % 7}.`, `Full weeks change nothing; move ${n % 7} days from ${days[s]} → ${e}.`] }; },
      (lv) => { const m = pick([5, 6, 7, 9, 11]), a = R(20, 99), b = R(20, 99); const ans = (a * b) % m; return { q: `What is the remainder when ${a} × ${b} is divided by ${m}?`, a: ans, wrong: [((a % m) + (b % m)) % m, (ans + 1) % m, (ans + 2) % m, (ans + m - 1) % m, m].filter((v) => v !== ans), steps: [`${a} leaves ${a % m}, ${b} leaves ${b % m}.`, `${a % m} × ${b % m} = ${(a % m) * (b % m)}, which leaves ${ans}.`] }; },
      (lv) => { const set = pick([[2, 3, 4], [3, 4, 5], [2, 3, 5], [4, 6], [3, 5, 7]]); const r = R(1, Math.min(...set) - 1); const L = set.reduce(lcm); return { q: `What is the smallest whole number greater than ${r} that leaves remainder ${r} when divided by each of ${set.join(', ')}?`, a: L + r, wrong: [L, L - r, set.reduce((x, y) => x * y) + r, L + r + L], steps: [`n − ${r} must be a multiple of LCM(${set.join(', ')}) = ${L}.`, `Smallest: ${L} + ${r} = ${L + r}.`] }; },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
