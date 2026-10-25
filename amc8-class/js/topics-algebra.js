// Algebra, sequences, counting, probability and statistics topics.
(function (root) {
  const { R, pick, frac, choose, fact, surd } = root.U;
  const V = root.V;
  const T = (root.TOPICS = root.TOPICS || []);

  T.push({
    id: 'sequences', name: 'Patterns & Sequences', emoji: '🪜', color: '#f06595',
    slides: [
      { type: 'predict', h: 'Arithmetic sequences add the same step', ask: '5, 8, 11, 14, … What is the {f:20th} term?', options: ['60', '62', '65', '68'], answer: '62',
        svg: V.svg([5, 8, 11, 14, 17].map((v, i) => V.rect(15 + i * 60, 140 - v * 6, 45, v * 6, 'a', i * 0.4) + V.t(25 + i * 60, 160, v, 'small', i * 0.4)).join('') + V.t(20, 25, '+3 every time', 'small b-t', 2)),
        text: 'nth term = first + (n − 1) × step. The 20th term of 5, 8, 11, … is 5 + 19 × 3 = 62.' },
      { type: 'predict', h: 'Counting terms: fenceposts', ask: 'How many numbers are in the list {g:2, 4, 6, …, 50}?', options: ['24', '25', '26', '50'], answer: '25',
        svg: V.svg(V.numline(0, 10, [2, 4, 6, 8, 10], 0) + V.t(20, 50, '2 to 10 by 2s: (10−2)/2 + 1 = 5', 'small', 2)),
        text: 'Number of terms = (last − first) ÷ step + 1. Forgetting the "+1" is the most common AMC trap.' },
      { type: 'steps', h: 'Gauss: pair the ends', problem: 'What is {f:1 + 2 + 3 + … + 100}?',
        svg: V.svg(V.t(20, 50, '1 + 2 + … + 99 + 100', 'big', 0) + V.path('M30,60 Q160,120 290,60', 'red', 1) + V.path('M60,60 Q160,105 255,60', 'red', 1.4) + V.t(20, 150, '50 pairs × 101 = 5050', 'big c-t', 2.2)),
        steps: [{ say: 'Pair the ends: 1 + 100 = {g:101}, 2 + 99 = 101, and so on.' }, { say: 'There are {g:50} pairs.' }, { say: '50 × 101 = {a:5050}.' }] },
    ],
    tips: [
      { name: 'Average × count', how: 'Sum of an arithmetic list = middle value × how many. The middle is (first + last)/2.', ex: '10+11+…+20: 15 × 11 = 165' },
      { name: 'Write out the first few', how: 'For any strange pattern, list 5–6 terms. A cycle or rule almost always appears.', ex: '1, 1, 2, 3, 5, 8… Fibonacci!' },
    ],
    gens: [
      (lv) => { const a = R(-5, 12), d = R(2, 9), n = R(15, 30 + 30 * lv); const t = a + (n - 1) * d; return { q: `What is the ${root.U.ordinal(n)} term of the sequence ${a}, ${a + d}, ${a + 2 * d}, ${a + 3 * d}, …?`, a: t, wrong: [a + n * d, n * d, t - d + 1, t + d], steps: [`Step is ${d}.`, `Term ${n} = ${a} + (${n} − 1) × ${d} = ${t}.`] }; },
      (lv) => { const a = R(2, 20), d = R(2, 7), n = R(15, 60); const L = a + (n - 1) * d; return { q: `How many numbers are in the list ${a}, ${a + d}, ${a + 2 * d}, …, ${L}?`, a: n, wrong: [n - 1, n + 1, Math.floor(L / d), Math.floor((L - a) / d) + 2], steps: [`(${L} − ${a}) ÷ ${d} + 1.`, `= ${(L - a) / d} + 1 = ${n}.`] }; },
      (lv) => { const a = R(1, 30), n = R(10, 40) * (lv > 1 ? 2 : 1), d = lv === 1 ? 1 : R(1, 3); const L = a + (n - 1) * d; return { q: `What is ${a} + ${a + d} + ${a + 2 * d} + … + ${L}?`, a: (n * (a + L)) / 2, wrong: [((n - 1) * (a + L)) / 2, n * (a + L), (n * (a + L)) / 2 + L, ((n + 1) * (a + L)) / 2], steps: [`There are (${L} − ${a}) ÷ ${d} + 1 = ${n} terms.`, `Sum = ${n} × (${a} + ${L}) ÷ 2 = ${(n * (a + L)) / 2}.`] }; },
    ],
  });

  T.push({
    id: 'equations', name: 'Equations & Word Problems', emoji: '🧩', color: '#5c7cfa',
    slides: [
      { type: 'predict', h: 'An equation is a balance', ask: '{g:x + 3 = 11}. What is {f:x}?', options: ['3', '8', '11', '14'], answer: '8',
        svg: V.svg(V.line(40, 100, 280, 100, 'thick', 0) + V.poly('160,100 145,140 175,140', 'd', 0) + V.rect(60, 60, 40, 40, 'a', 1) + V.t(72, 87, 'x', 'big', 1) + V.rect(105, 70, 25, 30, 'b', 1.3) + V.t(110, 92, '3', 'small', 1.3) + V.rect(200, 50, 50, 50, 'c', 1.6) + V.t(210, 82, '11', 'big', 1.6)),
        text: 'Whatever you do to one side, do to the other. Take 3 off both: x = 8.' },
      { type: 'predict', h: 'Turn words into symbols', ask: '{g:5 more than twice a number} is {g:17}. {f:The number}?', options: ['6', '11', '12', '22'], answer: '6',
        svg: V.svg(V.t(15, 40, '"5 more than twice a number"', 'small', 0) + V.t(60, 80, '→ 2n + 5', 'big b-t', 1) + V.t(15, 125, '"is"  → =', 'small', 2) + V.t(15, 160, '"of" → ×', 'small', 2.5)),
        text: 'Name the unknown with a letter, then translate the sentence piece by piece.' },
      { type: 'steps', h: 'Consecutive numbers: use the middle', problem: 'Five consecutive numbers add up to {g:90}. What is the {f:largest}?',
        svg: V.svg([16, 17, 18, 19, 20].map((v, i) => V.rect(20 + i * 58, 70, 50, 50, i === 2 ? 'b' : 'a', i * 0.3) + V.t(33 + i * 58, 103, v, 'big', i * 0.3)).join('') + V.t(20, 160, 'sum 90 ÷ 5 = 18 = middle', 'small c-t', 2)),
        steps: [{ say: 'The middle one is the average: 90 ÷ 5 = {g:18}.' }, { say: 'So the numbers are 16, 17, 18, 19, 20.' }, { say: 'Largest: {a:20}.' }] },
    ],
    tips: [
      { name: 'Plug in the choices', how: 'AMC is multiple choice! If setting up an equation is slow, test the answers, starting with C (the middle one).', ex: 'too big → try smaller choices' },
      { name: 'Age problems: the gap never changes', how: 'Two people\'s age difference stays the same forever. Write both ages with one letter.', ex: 'Mom 30 older: m = k + 30' },
    ],
    gens: [
      (lv) => { const x = R(-9, 15), a = R(2, 9), b = R(-20, 20); const c = a * x + b; return { q: `If ${a}x ${b < 0 ? '−' : '+'} ${Math.abs(b)} = ${c}, what is x?`, a: x, wrong: [c - b, x + 1, x - 1, -x], steps: [`Move the ${b}: ${a}x = ${c - b}.`, `Divide by ${a}: x = ${x}.`] }; },
      (lv) => { const n = pick([3, 5, 7]), m = R(10, 40); const s = n * m; return { q: `The sum of ${n} consecutive integers is ${s}. What is the largest of them?`, a: m + (n - 1) / 2, wrong: [m, m + (n - 1) / 2 + 1, m - (n - 1) / 2, s / (n - 1) | 0], steps: [`Middle = ${s} ÷ ${n} = ${m}.`, `Largest is ${(n - 1) / 2} above the middle: ${m + (n - 1) / 2}.`] }; },
      (lv) => { const k2 = R(4, 10), m = pick([3, 4, 5]), y2 = R(2, 8); const mom = m * k2 + (m - 1) * y2; return { q: `Today Dad is ${mom} years old and Sam is ${k2}. In how many years will Dad be exactly ${m} times as old as Sam?`, a: y2, wrong: [y2 + 1, y2 - 1 || y2 + 3, mom - m * k2, y2 * 2], steps: [`In y years: ${mom} + y = ${m}(${k2} + y).`, `${mom} + y = ${m * k2} + ${m}y → ${mom - m * k2} = ${m - 1}y → y = ${y2}.`] }; },
      (lv) => { const c = R(4, 12), r = R(3, 9), tot = c + r; const legs = 2 * c + 4 * r; return { q: `A farm has chickens and rabbits: ${tot} heads and ${legs} legs. How many rabbits?`, a: r, wrong: [c, legs / 4 | 0, tot - 1 - r, r + 2], steps: [`If all ${tot} were chickens: ${2 * tot} legs.`, `Extra legs: ${legs - 2 * tot}. Each rabbit adds 2 → ${r} rabbits.`] }; },
    ],
  });

  T.push({
    id: 'exponents', name: 'Exponents & Roots', emoji: '🚀', color: '#845ef7',
    slides: [
      { type: 'predict', h: 'Exponents are repeated multiplying', ask: '{g:2³ × 2⁴} = ?', options: ['2⁷', '2¹²', '4⁷', '2⁶⁴'], answer: '2⁷',
        svg: V.svg(V.dots(1, 2, 30, 50, 22, 'a', 0) + V.dots(2, 2, 100, 40, 22, 'a', 0.6) + V.dots(2, 4, 180, 40, 22, 'a', 1.2) + V.t(25, 130, '2¹', 'big', 0) + V.t(100, 130, '2²', 'big', 0.6) + V.t(200, 130, '2³', 'big', 1.2) + V.t(20, 170, 'each step doubles', 'small', 2)),
        text: '2³ = 2 × 2 × 2. Multiplying powers of the same base: add the exponents. 2³ × 2⁴ = 2⁷.' },
      { type: 'steps', h: 'Same base first', problem: 'Which is bigger: {g:4⁵} or {g:8³}?',
        svg: V.svg(V.t(20, 50, '4⁵ = (2²)⁵ = 2¹⁰', 'big', 0) + V.t(20, 100, '8³ = (2³)³ = 2⁹', 'big b-t', 1) + V.t(20, 150, '2ⁿ + 2ⁿ = 2ⁿ⁺¹', 'big c-t', 2)),
        steps: [{ say: 'Use base 2: 4⁵ = (2²)⁵ = {g:2¹⁰}.' }, { say: '8³ = (2³)³ = {g:2⁹}.' }, { say: '2¹⁰ is bigger, so {a:4⁵ wins}.' }] },
      { type: 'predict', h: 'Simplify square roots', ask: 'Write {g:√72} in {f:simplest form}.', options: ['6√2', '3√8', '2√18', '8√3'], answer: '6√2',
        svg: V.svg(V.t(20, 60, '√72 = √(36 × 2)', 'big', 0) + V.t(20, 120, '= 6√2', 'big c-t', 1) + V.rect(200, 30, 90, 90, 'a', 1.5) + V.t(225, 85, '36', 'big', 1.5)),
        text: 'Pull out the biggest perfect square factor: 4, 9, 16, 25, 36, 49, 64, 81, 100.' },
    ],
    tips: [
      { name: 'Zero and negative powers', how: 'Anything (except 0) to the power 0 is 1. A negative power flips: 2⁻³ = 1/8.', ex: '5⁰ + 5⁻¹ = 1 + 1/5' },
      { name: 'Compare with a common power', how: 'Which is bigger, 2¹⁰⁰ or 3⁶⁰? Write both as (something)²⁰: 32²⁰ vs 27²⁰.', ex: '2¹⁰⁰ is bigger' },
    ],
    gens: [
      (lv) => { const a = R(2, 8), b = R(2, 6), c = R(1, 4); const e = a + 2 * b + 3 * c; return { q: `If 2^${a} × 4^${b} × 8^${c} = 2^n, what is n?`, a: e, wrong: [a + b + c, a * 2 * b * 3 * c, a + 4 * b + 8 * c, e - 1], steps: [`4^${b} = 2^${2 * b}, 8^${c} = 2^${3 * c}.`, `Add exponents: ${a} + ${2 * b} + ${3 * c} = ${e}.`] }; },
      (lv) => { const n = R(5, 30), k = pick([2, 4, 8]); const add = { 2: 1, 4: 2, 8: 3 }[k]; return { q: `${k} copies of 2^${n} are added together: 2^${n} + 2^${n} + … + 2^${n}. The sum equals 2^m. What is m?`, a: n + add, wrong: [n * k, n + k, 2 * n, n + add + 1], steps: [`Adding ${k} copies = ${k} × 2^${n}.`, `${k} = 2^${add}, so the sum is 2^${n + add}.`] }; },
      (lv) => { const s = pick([2, 3, 5, 6, 7]), o = pick([2, 3, 4, 5, 6]); const n = o * o * s; return { q: `Which is equal to √${n}?`, a: surd(n), wrong: [`${s}√${o * o}`, `${o * s}√${o}`, `${o}√${s * o}`, `${o + 1}√${s}`, `${n / 2}`], steps: [`${n} = ${o * o} × ${s}.`, `√${n} = √${o * o} × √${s} = ${o}√${s}.`] }; },
      (lv) => { const a = R(2, 9); return { q: `What is (${a}^0 + ${a}^1 + ${a}^2) ÷ (${a}^-1 + ${a}^-2 + ${a}^-3)?`, a: a ** 3, wrong: [a * a, a, 1, a ** 4], steps: ['Multiply the bottom by ' + a + '³: it becomes ' + a + '² + ' + a + ' + 1, the same as the top.', `So the bottom = top ÷ ${a}³, and the answer is ${a}³ = ${a ** 3}.`] }; },
    ],
  });

  T.push({
    id: 'counting', name: 'Counting: Multiply the Choices', emoji: '🎲', color: '#fab005',
    slides: [
      { type: 'predict', h: 'Outfit check', ask: 'You have {g:2 shirts} and {g:3 pairs of pants}. How many {f:outfits}?', options: ['5', '6', '8', '9'], answer: '6',
        svg: V.svg(V.circ(30, 90, 10, 'd', 0) + [40, 140].map((y, i) => V.line(40, 90, 120, y, '', 0.5) + V.circ(130, y, 12, 'a', 0.8) + [y - 25, y, y + 25].map((yy, j) => V.line(142, y, 230, yy, '', 1.3) + V.circ(240, yy, 9, 'b', 1.6 + j * 0.2)).join('')).join('') + V.t(260, 95, '2×3=6', 'small', 2.5)),
        text: 'Each shirt branches into 3 outfits: {g:2 × 3} = {a:6}. Independent choices {g:multiply}, they do not add.' },
      { h: 'Slots: fill one at a time',
        svg: V.svg(['10', '9', '8'].map((s, i) => V.rect(30 + i * 90, 60, 70, 70, ['a', 'b', 'c'][i], i * 0.6) + V.t(52 + i * 90, 105, s, 'big', i * 0.6)).join('') + V.t(20, 165, 'no repeats → 10 × 9 × 8 = 720', 'small', 2.2)),
        text: 'Draw a slot for each position. Write how many options are left, then multiply.' },
      { h: 'Start with the fussy slot',
        svg: V.svg(V.t(20, 40, '3-digit even numbers', 'small', 0) + ['9', '10', '5'].map((s, i) => V.rect(30 + i * 90, 60, 70, 70, i === 2 ? 'b' : 'a', i * 0.5) + V.t(50 + i * 90, 105, s, 'big', i * 0.5)).join('') + V.t(20, 165, 'first ≠ 0; last ∈ {0,2,4,6,8} → 450', 'small', 2)),
        text: 'Fill the slot with a restriction first (no leading zero, must be even …), then the free ones.' },
    ],
    tips: [
      { name: 'Complement counting', how: '"At least one" is usually easier as total − none.', ex: '3-digit numbers with at least one 7: 900 − 648 = 252' },
      { name: 'Casework, then add', how: 'If choices depend on each other, split into cases that do not overlap, count each, and add.', ex: 'case 1 + case 2' },
    ],
    gens: [
      (lv) => { const a = R(3, 7), b = R(2, 6), c = R(2, 5); return { q: `Lia has ${a} shirts, ${b} pairs of pants, and ${c} hats. An outfit is one of each. How many outfits are possible?`, a: a * b * c, wrong: [a + b + c, a * b + c, a * b, a * b * c * 2], steps: ['Independent choices multiply.', `${a} × ${b} × ${c} = ${a * b * c}.`] }; },
      (lv) => { const L = R(2, 3), D = R(2, 3); const ways = 26 * 25 * (L === 3 ? 24 : 1) * (10 * 9 * (D === 3 ? 8 : 1)); return { q: `A code is ${L} different letters followed by ${D} different digits. How many codes are possible?`, a: ways, wrong: [26 ** L * 10 ** D, 26 * L + 10 * D, ways / 2, (26 * 25 * (L === 3 ? 24 : 1)) + (10 * 9 * (D === 3 ? 8 : 1))], steps: [`Letters: ${L === 3 ? '26 × 25 × 24' : '26 × 25'}. Digits: ${D === 3 ? '10 × 9 × 8' : '10 × 9'}.`, `Multiply: ${ways}.`] }; },
      (lv) => { const kind = pick(['odd', 'even']); const ans = kind === 'odd' ? 125 : 4 * 5 * 5; return { q: `How many three-digit numbers have all ${kind} digits?`, a: ans, wrong: kind === 'odd' ? [100, 150, 75, 25] : [125, 75, 150, 64], steps: [kind === 'odd' ? 'Each digit can be 1, 3, 5, 7, or 9: 5 choices.' : 'First digit: 2, 4, 6, 8 (not 0): 4 choices. Other digits: 0, 2, 4, 6, 8: 5 each.', `${kind === 'odd' ? '5 × 5 × 5' : '4 × 5 × 5'} = ${ans}.`] }; },
      (lv) => { const d = pick([7, 3, 5]); const ans = 900 - 8 * 9 * 9; return { q: `How many three-digit numbers have at least one digit equal to ${d}?`, a: ans, wrong: [900 - 9 * 9 * 9, 3 * 100, 271, 225], steps: ['Complement: count those with NO ' + d + '.', `First digit: 8 choices (not 0, not ${d}); others 9 each: 8 × 9 × 9 = 648.`, `900 − 648 = ${ans}.`] }; },
    ],
  });

  T.push({
    id: 'combos', name: 'Arrangements & Choosing', emoji: '🎟️', color: '#e64980',
    slides: [
      { type: 'predict', h: 'Handshakes', ask: '{g:5 players} high-five each other once after the game. How many {f:high-fives}?', options: ['5', '10', '20', '25'], answer: '10',
        svg: V.svg([0, 1, 2, 3, 4].map((i) => [i + 1, i + 2, i + 3, i + 4].filter((j) => j < 5).map((j) => V.line(160 + 70 * Math.cos(i * 1.2566), 90 + 70 * Math.sin(i * 1.2566), 160 + 70 * Math.cos(j * 1.2566), 90 + 70 * Math.sin(j * 1.2566), '', 0.5 + i * 0.3)).join('') + V.circ(160 + 70 * Math.cos(i * 1.2566), 90 + 70 * Math.sin(i * 1.2566), 12, 'b', 0)).join('')),
        text: 'Each player high-fives 4 others: 5 × 4 = 20, but every high-five got {g:counted twice}. 20 ÷ 2 = {a:10}.' },
      { h: 'Order matters → arrange',
        svg: V.svg(['A', 'B', 'C'].map((s, i) => V.circ(70 + i * 90, 70, 28, ['a', 'b', 'c'][i], i * 0.4) + V.t(62 + i * 90, 78, s, 'big', i * 0.4)).join('') + V.t(20, 150, '3! = 3 × 2 × 1 = 6 lineups', 'big', 1.8)),
        text: 'n different things in a row: n! ways. Gold/silver/bronze from 8 runners: 8 × 7 × 6.' },
      { h: 'Order does not matter → divide',
        svg: V.svg(V.t(20, 50, 'pick 2 of 5 friends', 'small', 0) + V.t(20, 100, '5 × 4 = 20 ordered', 'big', 1) + V.t(20, 150, '÷ 2 = 10 pairs', 'big c-t', 2)),
        text: 'A team of 2 is the same as its reverse, so divide by 2! (and by 3! for teams of 3). That is "n choose k".' },
    ],
    tips: [
      { name: 'Repeated letters', how: 'Arrange letters with repeats: total! ÷ (repeat count)! for each repeat.', ex: 'BOOK: 4! ÷ 2! = 12' },
      { name: 'Circle seating', how: 'n people around a round table: (n − 1)! — rotating everyone is the same seating.', ex: '5 people → 24 ways' },
    ],
    gens: [
      (lv) => { const n = R(6, 12 + 8 * lv); return { q: `At a party, ${n} people each shake hands with every other person exactly once. How many handshakes are there?`, a: (n * (n - 1)) / 2, wrong: [n * (n - 1), n * n, (n * (n + 1)) / 2, n * 2], steps: ['Each handshake is a pair of people.', `${n} × ${n - 1} ÷ 2 = ${(n * (n - 1)) / 2}.`] }; },
      (lv) => { const n = R(6, 10), k = R(2, 4); return { q: `A club with ${n} members chooses a committee of ${k}. How many different committees are possible?`, a: choose(n, k), wrong: [fact(n) / fact(n - k), n * k, choose(n, k - 1), choose(n, k) * 2], steps: [`Ordered: ${[...Array(k)].map((_, i) => n - i).join(' × ')} = ${fact(n) / fact(n - k)}.`, `Order doesn't matter: ÷ ${k}! = ${choose(n, k)}.`] }; },
      (lv) => { const [w, ans] = pick([['BOOK', 12], ['LEVEL', 30], ['APPLE', 60], ['BANANA', 60], ['SEES', 6], ['TOOTH', 30], ['COOKIE', 360]]); return { q: `How many different arrangements of the letters in ${w} are there?`, a: ans, wrong: [fact(w.length), ans * 2, ans / 2, fact(w.length - 1)], steps: [`${w.length} letters: ${w.length}! = ${fact(w.length)}.`, `Divide by the repeats to get ${ans}.`] }; },
      (lv) => { const n = R(5, 8); return { q: `In how many ways can ${n} friends sit around a round table? (Rotations count as the same.)`, a: fact(n - 1), wrong: [fact(n), fact(n - 1) / 2, n * (n - 1), fact(n - 2)], steps: ['Fix one person\'s seat to remove rotations.', `Arrange the other ${n - 1}: ${n - 1}! = ${fact(n - 1)}.`] }; },
    ],
  });

  T.push({
    id: 'probability', name: 'Probability', emoji: '🎯', color: '#12b886',
    slides: [
      { type: 'predict', h: 'Two dice: the best sum', ask: 'Roll {g:two dice}. Which {f:sum} comes up most often?', options: ['6', '7', '8', '12'], answer: '7',
        svg: V.svg([...Array(36)].map((_, i) => { const r = Math.floor(i / 6), c = i % 6; return V.rect(80 + c * 26, 15 + r * 26, 22, 22, r + c + 2 === 7 ? 'b' : 'empty', (r + c) * 0.1); }).join('') + V.t(250, 95, '7: 6/36', 'small', 1.5)),
        text: '36 equally likely pairs. A sum of {a:7} happens 6 ways (the diagonal), more than any other: P = 6/36 = 1/6.' },
      { h: 'Probability = good ÷ total',
        svg: V.svg(V.dots(2, 5, 60, 60, 40, 'a', 0) + V.dots(1, 3, 60, 60, 40, 'b', 1) + V.t(20, 165, '3 blue of 10 → P = 3/10', 'small', 2)),
        text: 'Count the outcomes you want and divide by all the equally likely outcomes.' },
      { h: 'Without replacement',
        svg: V.svg(V.t(20, 50, '3 red, 2 blue — draw 2', 'small', 0) + V.t(20, 100, 'both red: 3/5 × 2/4', 'big', 1) + V.t(20, 150, '= 3/10', 'big c-t', 2)),
        text: 'After the first draw, there is one fewer marble. Multiply the chances step by step.' },
    ],
    tips: [
      { name: 'At least one = 1 − none', how: 'P(at least one head in 4 flips) = 1 − P(no heads) = 1 − 1/16 = 15/16.', ex: '1 − (5/6)³ for at least one six in 3 rolls' },
      { name: 'Geometry probability', how: 'For "a random point lands in…", probability = good area ÷ total area.', ex: 'circle in square: π/4' },
    ],
    gens: [
      (lv) => { const s = R(3, 11); const ways = 6 - Math.abs(7 - s); return { q: `Two fair dice are rolled. What is the probability that the sum is ${s}?`, a: frac(ways, 36), wrong: [frac(1, 11), frac(ways, 12), frac(ways + 1, 36), frac(1, 6) === frac(ways, 36) ? frac(1, 12) : frac(1, 6)], steps: [`List pairs that sum to ${s}: ${ways} of them.`, `${ways}/36 = ${frac(ways, 36)}.`] }; },
      (lv) => { const r = R(2, 6), b = R(2, 6); const t = r + b; return { q: `A bag has ${r} red and ${b} blue marbles. Two are drawn without replacement. What is the probability both are red?`, a: frac(r * (r - 1), t * (t - 1)), wrong: [frac(r * r, t * t), frac(r, t), frac(r - 1, t - 1), frac(2 * r, t * (t - 1))], steps: [`First red: ${r}/${t}. Then ${r - 1}/${t - 1}.`, `Multiply: ${frac(r * (r - 1), t * (t - 1))}.`] }; },
      (lv) => { const n = R(2, 6); return { q: `A fair coin is flipped ${n} times. What is the probability of getting at least one head?`, a: frac(2 ** n - 1, 2 ** n), wrong: [frac(1, 2), frac(n, 2 ** n), frac(1, 2 ** n), frac(n - 1, n)], steps: [`P(no heads) = (1/2)^${n} = 1/${2 ** n}.`, `1 − 1/${2 ** n} = ${frac(2 ** n - 1, 2 ** n)}.`] }; },
      (lv) => { const n = pick([10, 20, 30, 50]); const k = pick([3, 4, 5, 6]); return { q: `A number is chosen at random from 1 to ${n}. What is the probability that it is a multiple of ${k}?`, a: frac(Math.floor(n / k), n), wrong: [frac(1, k + 1), frac(Math.floor(n / k) + 1, n), frac(k, n), frac(1, k) === frac(Math.floor(n / k), n) ? frac(2, k) : frac(1, k)], steps: [`Multiples of ${k} up to ${n}: ${Math.floor(n / k)}.`, `${Math.floor(n / k)}/${n} = ${frac(Math.floor(n / k), n)}.`] }; },
    ],
  });

  T.push({
    id: 'stats', name: 'Mean, Median & Mode', emoji: '📊', color: '#4dabf7',
    slides: [
      { type: 'predict', h: 'Mean = level the towers', ask: 'What is the {f:mean} of {g:3, 7, 5, 1, 9}?', options: ['4', '5', '6', '7'], answer: '5',
        svg: V.svg([3, 7, 5, 1, 9].map((v, i) => V.rect(30 + i * 55, 150 - v * 13, 40, v * 13, 'a', i * 0.3)).join('') + V.line(20, 85, 300, 85, 'red', 2) + V.t(240, 78, 'mean 5', 'small red-t', 2.3)),
        text: 'Mean = total ÷ count. Imagine moving blocks from tall towers to short ones until all are equal.' },
      { type: 'steps', h: 'Work with the total', problem: '4 tests average {g:85}. What score on test 5 makes the average {f:87}?',
        svg: V.svg(V.t(20, 50, '4 tests, mean 85', 'small', 0) + V.t(20, 90, 'total = 340', 'big b-t', 1) + V.t(20, 135, 'want mean 87 on 5 → 435', 'small', 2) + V.t(20, 170, 'need 95', 'big c-t', 3)),
        steps: [{ say: 'Total now: 4 × 85 = {g:340}.' }, { say: 'Total needed: 5 × 87 = {g:435}.' }, { say: 'Score needed: 435 − 340 = {a:95}.' }] },
      { type: 'predict', h: 'Median = the middle, mode = the most', ask: 'What is the {f:median} of {g:9, 2, 6, 3, 12, 3, 8}?', options: ['3', '6', '8', '9'], answer: '6',
        svg: V.svg([2, 3, 3, 6, 8, 9, 12].map((v, i) => V.rect(20 + i * 42, 70, 36, 40, i === 3 ? 'b' : v === 3 ? 'c' : 'empty', i * 0.25) + V.t(30 + i * 42, 97, v, 'small', i * 0.25)).join('') + V.t(20, 150, 'median 6, mode 3', 'small', 2.2)),
        text: 'Sort first! With an even count, the median is the average of the two middle numbers.' },
    ],
    tips: [
      { name: 'Deviations from a guess', how: 'Mean of 87, 92, 85, 96: guess 90. Differences −3, +2, −5, +6 → sum 0 → mean 90.', ex: 'saves big additions' },
      { name: 'Adding a value', how: 'New mean = old mean + (new value − old mean) ÷ new count.', ex: 'mean 80 of 4, add 100 → 80 + 20/5 = 84' },
    ],
    gens: [
      (lv) => { let n, m, want, need; do { n = R(3, 6); m = R(70, 88); want = m + R(1, 3); need = want * (n + 1) - m * n; } while (need > 100); return { q: `Jo's average on ${n} tests is ${m}. What score does Jo need on the next test to raise the average to ${want}?`, a: need, wrong: [want, need - (want - m), want + (want - m), m + n], steps: [`Current total: ${m} × ${n} = ${m * n}.`, `Needed total: ${want} × ${n + 1} = ${want * (n + 1)}.`, `Score: ${need}.`] }; },
      (lv) => { const xs = [...Array(pick([6, 7, 8]))].map(() => R(1, 30)); const s = xs.slice().sort((a, b) => a - b); const L = s.length; const med = L % 2 ? s[(L - 1) / 2] : (s[L / 2 - 1] + s[L / 2]) / 2; return { q: `What is the median of: ${xs.join(', ')}?`, a: med, wrong: [xs[Math.floor(L / 2)], Math.round(xs.reduce((a, b) => a + b, 0) / L), s[L / 2 | 0] + 1, s[Math.floor(L / 2) - 1]], steps: [`Sorted: ${s.join(', ')}.`, `Middle ${L % 2 ? 'value' : 'two average'}: ${med}.`] }; },
      (lv) => { const n = R(4, 8), m = R(10, 30), k = R(2, 3); return { q: `The mean of ${n} numbers is ${m}. When one number is removed, the mean of the rest is ${m - k}. What number was removed?`, a: m * n - (m - k) * (n - 1), wrong: [m + k, m, (m - k) * (n - 1), k * n], steps: [`Total before: ${m * n}. Total after: ${(m - k) * (n - 1)}.`, `Removed: ${m * n - (m - k) * (n - 1)}.`] }; },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
