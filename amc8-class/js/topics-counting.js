// Counting & probability, part 2: the hardest area on the AMC 8 (2018–2026) and the most
// common topic in problems #18–25. Casework and listing, grid paths and sharing out, and
// complement / geometric probability. Lessons use the hands-on slide types (see topics-logic.js).
(function (root) {
  const { R, pick, frac, choose } = root.U;
  const V = root.V;
  const T = (root.TOPICS = root.TOPICS || []);

  // Ordered ways to reach n using steps from `parts` (stairs, coin stacks).
  const ways = (n, parts) => { const w = [1]; for (let i = 1; i <= n; i++) w[i] = parts.reduce((s, p) => s + (i >= p ? w[i - p] : 0), 0); return w[n]; };

  // An m×n grid with Pascal numbers at each corner (paths from the bottom-left).
  const pascalGrid = (m, n, d = 0) => {
    const s = 40, x0 = 40, y0 = 150;
    let out = '';
    for (let i = 0; i <= m; i++) out += V.line(x0 + i * s, y0, x0 + i * s, y0 - n * s, '', d);
    for (let j = 0; j <= n; j++) out += V.line(x0, y0 - j * s, x0 + m * s, y0 - j * s, '', d);
    for (let i = 0; i <= m; i++) for (let j = 0; j <= n; j++) {
      const v = choose(i + j, i), last = i === m && j === n;
      out += V.circ(x0 + i * s, y0 - j * s, 12, last ? 'c' : 'b', d + 0.5 + (i + j) * 0.35) + V.t(x0 + i * s - (v > 9 ? 8 : 4), y0 - j * s + 5, v, 'tiny', d + 0.5 + (i + j) * 0.35);
    }
    return out;
  };

  T.push({
    id: 'casework', name: 'Casework & Listing', emoji: '🗂️', color: '#f59f00',
    slides: [
      { type: 'predict', h: 'Split it into cases',
        ask: 'Gold coins are {g:1 mm} thick, silver coins {g:3 mm}. How many different stacks are exactly {g:6 mm} tall? (Order matters.) {f:How many?}',
        options: ['4', '5', '6', '8'], answer: '6',
        svg: V.svg([['0 silver', 'GGGGGG', '1 way'], ['1 silver', 'S + GGG', '4 ways'], ['2 silver', 'SS', '1 way']].map(([a, b, c], i) => V.rect(10 + i * 103, 30, 95, 110, ['a', 'b', 'c'][i], i * 0.6) + V.t(18 + i * 103, 55, a, 'tiny', i * 0.6) + V.t(18 + i * 103, 90, b, 'tiny', i * 0.6) + V.t(18 + i * 103, 125, c, 'small', i * 0.6)).join('') + V.t(20, 170, '1 + 4 + 1 = 6', 'small c-t', 2)),
        text: 'Count by {g:how many silver coins}. 0 silver: 1 way. 1 silver + 3 gold: the silver can go in 4 spots. 2 silver: 1 way. Total {a:6}.' },
      { type: 'steps', h: 'Build up from small cases',
        problem: 'You climb stairs {g:1 or 2 steps} at a time. How many ways to climb {f:6 stairs}?',
        steps: [
          { svg: V.svg([1, 2].map((n, i) => V.rect(30 + i * 70, 120 - n * 25, 55, n * 25, 'a', i * 0.4) + V.t(45 + i * 70, 150, n, 'small', i * 0.4) + V.t(40 + i * 70, 110 - n * 25, [1, 2][i], 'big', i * 0.4 + 0.2)).join('')), say: '1 stair: 1 way. 2 stairs: 2 ways (1+1 or 2).' },
          { svg: V.svg(V.t(20, 70, 'last move 1 → ways(n−1)', 'small', 0) + V.t(20, 110, 'last move 2 → ways(n−2)', 'small', 0.6) + V.t(20, 155, 'ways(n) = ways(n−1) + ways(n−2)', 'small b-t', 1.2)), say: 'Your {g:last move} was a 1 or a 2. So each answer is the {g:sum of the two before it}.' },
          { svg: V.svg([1, 2, 3, 5, 8, 13].map((v, i) => V.rect(15 + i * 50, 140 - v * 8, 40, v * 8, i === 5 ? 'c' : 'a', i * 0.3) + V.t(25 + i * 50, 165, v, 'small', i * 0.3)).join('')), say: '1, 2, 3, 5, 8, {a:13}. It is the Fibonacci pattern!' },
        ] },
      { type: 'predict', h: 'Make an organized list',
        ask: 'How many {g:2-digit numbers} have digits that {g:add up to 5}?',
        options: ['4', '5', '6', '9'], answer: '5',
        svg: V.svg(['14', '23', '32', '41', '50'].map((v, i) => V.rect(15 + i * 60, 60, 50, 50, 'b', i * 0.4) + V.t(25 + i * 60, 93, v, 'big', i * 0.4)).join('') + V.t(20, 160, 'tens digit 1, 2, 3, 4, 5: never skip one!', 'small', 2.2)),
        text: 'List in order of the {g:tens digit}: 14, 23, 32, 41, 50. That is {a:5}. (05 is not a 2-digit number!)' },
    ],
    tips: [
      { name: 'Split into cases', how: 'Pick one thing to split on (how many silver coins, what the first digit is). Count each case, then add.', ex: '1 + 4 + 1 = 6 stacks' },
      { name: 'Organized list', how: 'List in a fixed order (smallest first) so you never miss or repeat one.', ex: '14, 23, 32, 41, 50' },
      { name: 'Build up small', how: 'Solve n = 1, 2, 3 first. The pattern usually appears.', ex: 'stairs: 1, 2, 3, 5, 8…' },
    ],
    gens: [
      (lv) => { const n = R(4, 6 + 2 * lv), big = lv === 1 ? 2 : pick([2, 3]); const a = ways(n, [1, big]); return { q: `You climb stairs taking either 1 or ${big} steps at a time. In how many different ways can you climb ${n} stairs?`, a, wrong: [a - 1, a + 2, n, ways(n - 1, [1, big]), 2 ** (n - 2)], steps: [`Your last move is 1 or ${big}, so ways(n) = ways(n−1) + ways(n−${big}).`, `Build up from ways(0) = 1 to get ${a}.`] }; },
      (lv) => { const s = R(3, lv === 1 ? 9 : 14), dig = lv === 1 ? 2 : 3; let c = 0; for (let x = 10 ** (dig - 1); x < 10 ** dig; x++) if ([...String(x)].reduce((p, d) => p + +d, 0) === s) c++; return { q: `How many ${dig}-digit numbers have digits that add up to ${s}?`, a: c, wrong: [c + 1, c - 1, s, c + s, c * 2], steps: [`List by the first digit, which cannot be 0.`, `Count each case and add: ${c}.`] }; },
      (lv) => { const amt = pick(lv === 1 ? [20, 25, 30] : [35, 40, 45, 50]); let c = 0; for (let q = 0; q * 25 <= amt; q++) for (let d = 0; q * 25 + d * 10 <= amt; d++) if ((amt - q * 25 - d * 10) % 5 === 0) c++; return { q: `In how many ways can you make ${amt}¢ using nickels (5¢), dimes (10¢), and quarters (25¢)? (Any number of each, including none.)`, a: c, wrong: [c - 1, c + 1, c + 3, amt / 5, Math.floor(amt / 10)], steps: ['Case on the number of quarters, then on dimes; nickels fill the rest.', `Total: ${c} ways.`] }; },
      (lv) => { const n = R(5, 8 + 3 * lv); const a = ways(n, [1, 3]); return { q: `Gold coins are 1 mm thick and silver coins are 3 mm thick. How many different stacks (order matters) are exactly ${n} mm tall?`, a, wrong: [a - 1, a + 1, n, Math.floor(n / 3) + 1, ways(n, [1, 2])], steps: ['Split by the number of silver coins k; arrange k silver and n − 3k gold.', `Add the cases: ${a}.`] }; },
    ],
  });

  T.push({
    id: 'paths', name: 'Grid Paths & Sharing Out', emoji: '🧭', color: '#0b7285',
    slides: [
      { type: 'predict', h: 'How many routes?',
        ask: 'Moving only {g:right} or {g:up}, how many routes go from the bottom-left to the top-right of a {g:2 × 2} grid?',
        options: ['4', '6', '8', '9'], answer: '6',
        svg: V.svg(pascalGrid(2, 2)),
        text: 'Each corner = {g:paths from the left + paths from below}. The corners fill in 1, 1, 2, 3, 3, then {a:6}.' },
      { type: 'steps', h: 'The R-and-U word trick',
        problem: 'How many shortest paths cross a {g:4 × 3} grid ({g:4 right}, {g:3 up})?',
        steps: [
          { svg: V.svg(V.t(20, 80, 'R R U R U U R', 'huge', 0)), say: 'Every path is a {g:word} with 4 R\'s and 3 U\'s.' },
          { svg: V.svg(V.t(20, 70, '7 letters, choose where', 'small', 0) + V.t(20, 110, 'the 3 U\'s go', 'small', 0.5) + V.t(20, 160, 'C(7, 3) = 7·6·5 ÷ 3·2·1', 'small b-t', 1)), say: 'Choose which 3 of the 7 spots are U\'s.' },
          { svg: V.svg(pascalGrid(4, 3)), say: 'C(7, 3) = {a:35}. The Pascal grid agrees!' },
        ] },
      { type: 'steps', h: 'Stars and bars',
        problem: 'Share {g:7 identical candies} among {g:3 kids} (a kid may get none). {f:How many ways?}',
        steps: [
          { svg: V.svg([...Array(7)].map((_, i) => V.t(20 + i * 36, 90, '⭐', 'big', i * 0.15)).join('')), say: 'Line up the 7 candies as stars.' },
          { svg: V.svg(['⭐', '⭐', '|', '⭐', '⭐', '⭐', '|', '⭐', '⭐'].map((c, i) => V.t(14 + i * 33, 90, c, c === '|' ? 'huge' : 'big', i * 0.1)).join('') + V.t(20, 150, 'kid 1: 2  ·  kid 2: 3  ·  kid 3: 2', 'small', 1.2)), say: 'Drop in {g:2 bars} to split them into 3 groups.' },
          { svg: V.svg(V.t(20, 80, '9 spots, choose 2 for bars', 'small', 0) + V.t(20, 140, 'C(9, 2) = 36', 'big c-t', 0.8)), say: '9 symbols in a row; pick which 2 are bars: {a:36} ways.' },
        ] },
      { type: 'predict', h: 'Everyone gets at least one',
        ask: 'Now each of the 3 kids must get {g:at least 1} of the 7 candies. {f:How many ways?}',
        options: ['15', '21', '35', '36'], answer: '15',
        svg: V.svg(V.t(20, 70, 'hand out 1 each first → 4 left', 'small', 0) + V.t(20, 130, 'C(4 + 2, 2) = C(6, 2) = 15', 'big c-t', 1)),
        text: '{g:Give everyone their minimum first}. Then share the 4 left over freely: C(6, 2) = {a:15}.' },
    ],
    tips: [
      { name: 'R-and-U words', how: 'A path with r rights and u ups is a word of r + u letters: C(r + u, u) paths.', ex: '3 × 3 grid → C(6, 3) = 20' },
      { name: 'Pascal corners', how: 'Write at each corner how many ways reach it: the number from the left plus the number from below.', ex: 'great when some squares are blocked' },
      { name: 'Stars and bars', how: 'n identical things to k people: C(n + k − 1, k − 1).', ex: '7 candies, 3 kids → C(9, 2) = 36' },
      { name: 'Minimum first', how: '"At least" in sharing: hand out the minimums, then share the rest freely.', ex: 'each ≥ 1: 7 → 4 left' },
    ],
    gens: [
      (lv) => { const r = R(2, 3 + lv), u = R(2, 2 + lv); const a = choose(r + u, u); return { q: `Moving only right or up along grid lines, how many shortest paths go from (0, 0) to (${r}, ${u})?`, a, wrong: [r * u, a / 2 | 0 || a + 3, choose(r + u, u + 1) === a ? a + 2 : choose(r + u, u + 1), 2 ** (r + u - 1), r + u], steps: [`Each path is ${r} R's and ${u} U's in some order.`, `C(${r + u}, ${u}) = ${a}.`] }; },
      (lv) => { const a1 = R(1, 2 + lv), b1 = R(1, 2), a2 = R(1, 2 + lv), b2 = R(1, 2); const a = choose(a1 + b1, b1) * choose(a2 + b2, b2); return { q: `Moving only right or up, how many shortest paths go from (0, 0) to (${a1 + a2}, ${b1 + b2}) passing through (${a1}, ${b1})?`, a, wrong: [choose(a1 + b1, b1) + choose(a2 + b2, b2), choose(a1 + a2 + b1 + b2, b1 + b2), a * 2, a - 1], steps: [`To the middle point: C(${a1 + b1}, ${b1}) = ${choose(a1 + b1, b1)}. From there: C(${a2 + b2}, ${b2}) = ${choose(a2 + b2, b2)}.`, `Multiply: ${a}.`] }; },
      (lv) => { const n = R(4, 6 + 3 * lv), k = R(2, lv === 1 ? 3 : 4); const a = choose(n + k - 1, k - 1); return { q: `In how many ways can ${n} identical cookies be shared among ${k} friends, if a friend may get none?`, a, wrong: [choose(n - 1, k - 1), k ** n > 9999 ? n * k : k ** n, choose(n + k, k), n * k, a + n], steps: [`Stars and bars: ${n} stars and ${k - 1} bars.`, `C(${n + k - 1}, ${k - 1}) = ${a}.`] }; },
      (lv) => { const k = 3, m = lv === 1 ? 1 : 2, n = R(k * m + 2, k * m + 6 + 4 * lv); const left = n - k * m, a = choose(left + k - 1, k - 1); return { q: `${n} identical apples are shared among 3 friends so that each gets at least ${m}. How many ways are there?`, a, wrong: [choose(n + 2, 2), choose(n - 1, 2) === a ? a + 3 : choose(n - 1, 2), a + left, choose(left, 2) || a - 1], steps: [`Give each friend ${m} first: ${left} apples left.`, `Share them freely: C(${left} + 2, 2) = ${a}.`] }; },
    ],
  });

  T.push({
    id: 'probplus', name: 'Complement & Geometric Probability', emoji: '🎳', color: '#c2255c',
    slides: [
      { type: 'predict', h: 'At least one six',
        ask: 'You roll a die {g:3 times}. What is the chance of {f:at least one 6}?',
        options: ['1/2', '1/6', '91/216', '125/216'], answer: '91/216',
        svg: V.svg(V.t(20, 60, 'no 6 at all: (5/6)³ = 125/216', 'small', 0) + V.t(20, 110, 'at least one 6:', 'small', 1) + V.t(20, 150, '1 − 125/216 = 91/216', 'big c-t', 1.6)),
        text: '"At least one" has lots of cases. Its {g:opposite}, "none", has just one. So P = 1 − (5/6)³ = {a:91/216}.' },
      { type: 'steps', h: 'Probability with a picture',
        problem: 'A dart lands at a random spot on a {g:4 × 4 square}. What is the chance it lands {f:inside the circle} that touches all four sides?',
        steps: [
          { svg: V.svg(V.rect(90, 20, 140, 140, 'b', 0) + V.circ(160, 90, 70, 'a', 0.6)), say: 'Good area ÷ total area.' },
          { svg: V.svg(V.t(20, 70, 'circle: π × 2² = 4π', 'big', 0) + V.t(20, 130, 'square: 4 × 4 = 16', 'big b-t', 0.6)), say: 'The circle has radius {g:2}.' },
          { svg: V.svg(V.t(20, 100, '4π ÷ 16 = π/4 ≈ 0.785', 'big c-t', 0)), say: 'So the chance is {a:π/4}, about 79%.' },
        ] },
      { type: 'predict', h: 'Different numbers',
        ask: 'Two dice are rolled. What is the chance they show {f:different} numbers?',
        options: ['1/2', '2/3', '5/6', '11/12'], answer: '5/6',
        svg: V.svg([...Array(36)].map((_, i) => { const r = Math.floor(i / 6), c = i % 6; return V.rect(80 + c * 26, 15 + r * 26, 22, 22, r === c ? 'd' : 'c', (r + c) * 0.08); }).join('') + V.t(250, 95, '30/36', 'small', 1.5)),
        text: 'Only the {g:6 doubles} on the diagonal match. 36 − 6 = 30 out of 36 = {a:5/6}.' },
    ],
    tips: [
      { name: 'Flip it', how: 'P(at least one) = 1 − P(none). Use it whenever "at least" appears.', ex: 'at least one head in 4 flips: 1 − 1/16' },
      { name: 'Area = chance', how: 'For a random point, probability = good area ÷ total area (or good length ÷ total length).', ex: 'circle in square: π/4' },
      { name: 'Multiply down a path', how: 'For steps in a row, multiply the chances; for different ways it can happen, add them.', ex: 'red then red: 3/5 × 2/4' },
    ],
    gens: [
      (lv) => { const k = pick([2, 3, 4, 6]), n = R(2, lv === 1 ? 3 : 4); const num = k ** n - (k - 1) ** n, den = k ** n; const thing = { 2: 'a fair coin is flipped', 3: 'a spinner with 3 equal parts is spun', 4: 'a fair 4-sided die is rolled', 6: 'a fair die is rolled' }[k]; const hit = { 2: 'heads', 3: 'the red part', 4: 'a 4', 6: 'a 6' }[k]; return { q: `If ${thing} ${n} times, what is the probability of getting ${hit} at least once?`, a: frac(num, den), wrong: [frac(n, k), frac(1, k), frac((k - 1) ** n, den), frac(num - 1, den), frac(n, k + n)], steps: [`P(never) = (${k - 1}/${k})^${n} = ${frac((k - 1) ** n, den)}.`, `1 − ${frac((k - 1) ** n, den)} = ${frac(num, den)}.`] }; },
      (lv) => { const b = R(4, 10), a = R(1, b - 1); return { q: `A point is chosen at random inside a ${b} × ${b} square. A ${a} × ${a} square sits inside it. What is the probability the point lands in the small square?`, a: frac(a * a, b * b), wrong: [frac(a, b), frac(a * a, b), frac(b * b - a * a, b * b), frac(2 * a, b * b)], steps: [`Good area ${a * a}, total area ${b * b}.`, `${frac(a * a, b * b)}.`] }; },
      (lv) => { const n = lv === 1 ? 2 : 3; const diff = n === 2 ? 30 : 120, den = 6 ** n; const askMatch = lv === 3; return { q: askMatch ? `Three fair dice are rolled. What is the probability that at least two of them show the same number?` : `${n === 2 ? 'Two' : 'Three'} fair dice are rolled. What is the probability that all show different numbers?`, a: askMatch ? frac(den - diff, den) : frac(diff, den), wrong: askMatch ? [frac(diff, den), frac(1, 6), frac(1, 2), frac(1, 36)] : [frac(den - diff, den), frac(1, 6), frac(1, 2), frac(diff - 6, den)], steps: [`All different: ${n === 2 ? '6 × 5' : '6 × 5 × 4'} = ${diff} of ${den} outcomes.`, askMatch ? `At least two match = 1 − ${frac(diff, den)} = ${frac(den - diff, den)}.` : `${frac(diff, den)}.`] }; },
      (lv) => { const s = pick([2, 4, 6, 8, 10]); return { q: `A dart lands at a random point inside a ${s} × ${s} square. What is the probability it lands inside the circle that touches all four sides of the square?`, a: 'π/4', wrong: ['π/2', '1/4', '3/4', 'π/16', `π/${s}`], steps: [`Circle: π × ${s / 2}² = ${s * s / 4}π. Square: ${s * s}.`, 'Ratio: π/4 (the size of the square does not matter).'] }; },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
