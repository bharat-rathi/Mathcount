// Concept Studio, chapter: Number theory. Same clip format as studio-counting.js.
(function (root) {
  const V = root.V;
  const C = (root.CLIPS = root.CLIPS || []);
  const S = V.svg;

  // Raised exponents drawn with tspans: some fonts draw the ⁰ character badly.
  const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  const X = (str) => str.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, (m) => `<tspan dy="-0.45em" font-size="65%">${[...m].map((c) => SUP.indexOf(c)).join('')}</tspan><tspan dy="0.45em">\u200b</tspan>`);

  // Digits in boxes, e.g. digits('4725').
  const digits = (str, cls = 'empty', d = 0) => str.split('').map((k, i) => V.rect(60 + i * 52, 50, 46, 56, cls, d + i * 0.15) + V.t(75 + i * 52, 88, k, 'big', d + i * 0.15)).join('');

  // Factor tree for 60.
  const tree = (d = 0, primes = true) => {
    const nodes = [[160, 30, '60', 'empty'], [100, 85, '6', 'empty'], [220, 85, '10', 'empty'], [70, 145, '2', 'c'], [130, 145, '3', 'c'], [190, 145, '2', 'c'], [250, 145, '5', 'c']];
    const edges = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]];
    return edges.map(([a, b], i) => V.line(nodes[a][0], nodes[a][1] + 14, nodes[b][0], nodes[b][1] - 14, '', d + 0.3 + i * 0.2)).join('')
      + nodes.map(([x, y, n, cls], i) => V.circ(x, y, 17, primes || i < 3 ? cls : 'empty', d + (i < 3 ? i * 0.3 : 1.2 + i * 0.1)) + V.t(x - (n.length > 1 ? 10 : 5), y + 6, n, '', d + (i < 3 ? i * 0.3 : 1.2 + i * 0.1))).join('');
  };

  // Venn diagram for 12 and 18.
  const venn = (shade, d = 0) => V.circ(125, 100, 62, shade === 'all' ? 'b op' : 'empty', d) + V.circ(195, 100, 62, shade === 'all' ? 'b op' : 'empty', d)
    + (shade === 'mid' ? V.poly('160,52 178,70 185,100 178,130 160,148 142,130 135,100 142,70', 'c', d + 0.2) : '')
    + V.t(95, 30, '12', 'small', d) + V.t(210, 30, '18', 'small', d) + V.t(88, 106, '2', 'big', d + 0.4) + V.t(140, 106, '2·3', 'big', d + 0.6) + V.t(220, 106, '3', 'big', d + 0.8);

  // A clock face, with numbers placed around a circle.
  const clock = (d = 0) => V.circ(160, 95, 75, 'empty', d) + [...Array(12)].map((_, i) => {
    const a = ((i + 1) * Math.PI) / 6;
    return V.t(160 + 58 * Math.sin(a) - (i + 1 > 9 ? 9 : 5), 101 - 58 * Math.cos(a), i + 1, 'small', d);
  }).join('');
  const hand = (h, cls, d) => V.line(160, 95, 160 + 40 * Math.sin((h * Math.PI) / 6), 95 - 40 * Math.cos((h * Math.PI) / 6), cls, d);

  C.push(
    {
      id: 'nt-rules', topic: 'divisibility', emoji: '🔍', title: 'Divisibility in one second',
      frames: [
        { svg: S(digits('4725') + V.t(60, 150, 'divisible by 3? by 9?', 'small', 1)),
          say: 'Is {g:4,725} divisible by 3? By 9? You don\'t need to divide!' },
        { svg: S(digits('4725', 'b') + V.t(60, 150, '4 + 7 + 2 + 5 = 18', 'big', 0.8)),
          say: 'Just {g:add the digits}: 4 + 7 + 2 + 5 = 18.' },
        { svg: S(V.t(40, 70, '18 ÷ 3 ✓   18 ÷ 9 ✓', 'big c-t', 0) + V.t(40, 130, 'so 4,725 ÷ 3 ✓ and ÷ 9 ✓', 'small', 0.8)),
          say: '18 is divisible by 3 and by 9, so {a:4,725 is too}!' },
        { svg: S([['2', 'last digit even'], ['3', 'digit sum ÷ 3'], ['4', 'last 2 digits ÷ 4'], ['5', 'ends in 0 or 5'], ['9', 'digit sum ÷ 9'], ['10', 'ends in 0']].map(([n, r], i) => V.t(30, 30 + i * 28, `÷ ${n}:`, 'small b-t', i * 0.3) + V.t(95, 30 + i * 28, r, 'small', i * 0.3)).join(''), 180),
          say: 'Here are the quick rules. Know these and every division check takes one second.' },
      ],
      check: { q: 'Which of these numbers is divisible by 9?', options: ['1,234', '3,421', '4,518', '7,250'], answer: '4,518', why: '4 + 5 + 1 + 8 = 18, which is divisible by 9.' },
      remember: '3 and 9: add the digits. 2, 5, 10: look at the last digit. 4: the last two digits.',
    },
    {
      id: 'nt-combo', topic: 'divisibility', emoji: '🔐', title: 'Two locks: divisible by 6',
      frames: [
        { svg: S(V.t(90, 60, '6 = 2 × 3', 'huge', 0) + V.t(60, 130, '🔒 ÷ 2     🔒 ÷ 3', 'big', 0.8)),
          say: 'Divisible by {g:6}? It must open {g:both locks}: divisible by 2 and divisible by 3.' },
        { svg: S(digits('2346') + V.t(20, 140, 'ends in 6 → ÷ 2 ✓', 'small', 0.6) + V.t(20, 165, '2+3+4+6 = 15 → ÷ 3 ✓', 'small', 1.2) + V.t(240, 155, '÷ 6 ✓', 'big c-t', 1.8), 180),
          say: '2,346 ends in 6, so it passes ÷2. Its digits add to 15, so it passes ÷3. Both locks open: {a:÷ 6 ✓}.' },
        { svg: S([['12', '3 and 4'], ['15', '3 and 5'], ['18', '2 and 9']].map(([n, r], i) => V.t(40, 50 + i * 40, `÷ ${n} → test ${r}`, 'big', i * 0.4)).join('') + V.t(40, 172, 'not 2 and 6 for 12! they share a 2', 'tiny red-t', 1.6), 180),
          say: 'Same trick for 12 (3 and 4), 15 (3 and 5), 18 (2 and 9). The two parts must {g:share no factor}.' },
      ],
      check: { q: 'Which of these numbers is divisible by 6?', options: ['1,112', '2,345', '2,346', '3,334'], answer: '2,346', why: 'It is even, and its digit sum 15 is divisible by 3.' },
      remember: 'Big divisor? Split it into parts that share no factor, then test each part.',
    },
    {
      id: 'nt-tree', topic: 'gcflcm', emoji: '🌳', title: 'Factor trees',
      frames: [
        { svg: S(V.circ(160, 30, 17, 'empty') + V.t(150, 36, '60', '') + V.t(90, 120, 'break it into', 'small', 0.5) + V.t(90, 145, 'smaller factors', 'small', 0.6)),
          say: 'Break {g:60} into a factor tree. Start with any two numbers that multiply to 60.' },
        { svg: S(tree()), say: '60 = 6 × 10. Keep splitting until every branch ends in a {g:prime} (the green circles).' },
        { svg: S(V.t(30, 80, '60 = 2 × 2 × 3 × 5', 'big', 0) + V.t(90, 130, '= 2² × 3 × 5', 'big c-t', 0.8)),
          say: 'Collect the primes: 60 = {a:2² × 3 × 5}. Start the tree any way you like and you always get the same primes!' },
      ],
      check: { q: 'What is the prime factorization of 72?', options: ['2² × 3³', '2³ × 3²', '2⁴ × 3', '2 × 6²'], answer: '2³ × 3²', why: '72 = 8 × 9 = (2 × 2 × 2) × (3 × 3).' },
      remember: 'Factor tree: split until every branch is a prime.',
    },
    {
      id: 'nt-venn', topic: 'gcflcm', emoji: '⭕', title: 'GCF and LCM with circles',
      frames: [
        { svg: S(V.t(40, 70, '12 = 2 × 2 × 3', 'big', 0) + V.t(40, 120, '18 = 2 × 3 × 3', 'big', 0.6)),
          say: 'Break both numbers into primes: 12 = 2 · 2 · 3 and 18 = 2 · 3 · 3.' },
        { svg: S(venn('none')), say: 'Put the primes they {g:share} in the middle: one 2 and one 3. The leftovers go on the outside.' },
        { svg: S(venn('mid') + V.t(110, 178, 'GCF = 2 × 3 = 6', 'small c-t', 0.6)), say: '{g:GCF} (greatest common factor) = the middle = 2 × 3 = {a:6}.' },
        { svg: S(venn('all') + V.t(80, 178, 'LCM = 2 × 2 × 3 × 3 = 36', 'small b-t', 0.6)), say: '{g:LCM} (least common multiple) = everything in the picture = 2 × 2 × 3 × 3 = {a:36}.' },
      ],
      check: { q: 'What is the greatest common factor (GCF) of 24 and 36?', options: ['4', '6', '12', '72'], answer: '12', why: '24 = 2·2·2·3 and 36 = 2·2·3·3 share 2·2·3 = 12.' },
      remember: 'GCF = the overlap. LCM = everything.',
    },
    {
      id: 'nt-buses', topic: 'gcflcm', emoji: '🚌', title: '"Together again" means LCM',
      frames: [
        { svg: S(V.t(30, 60, '🚌 A: every 12 min', 'big', 0) + V.t(30, 105, '🚌 B: every 18 min', 'big', 0.5) + V.t(30, 150, 'both leave at 8:00', 'small', 1)),
          say: 'Bus A leaves every {g:12} minutes and bus B every {g:18}. Both leave at 8:00. When do they {f:next leave together}?' },
        { svg: S(V.line(30, 70, 290, 70, 'thick', 0) + V.line(30, 130, 290, 130, 'thick', 0) + V.t(5, 75, 'A', 'small', 0) + V.t(5, 135, 'B', 'small', 0) + [0, 12, 24, 36].map((t, i) => V.circ(30 + t * 7, 70, 8, t === 36 ? 'c' : 'b', 0.3 + i * 0.3) + V.t(24 + t * 7, 55, t, 'tiny', 0.3 + i * 0.3)).join('') + [0, 18, 36].map((t, i) => V.circ(30 + t * 7, 130, 8, t === 36 ? 'c' : 'd', 0.5 + i * 0.4) + V.t(24 + t * 7, 158, t, 'tiny', 0.5 + i * 0.4)).join('')),
          say: 'List the times. A: 12, 24, 36… B: 18, 36… The first match is {g:36}.' },
        { svg: S(V.t(30, 80, 'LCM(12, 18) = 36', 'big', 0) + V.t(90, 130, '→ 8:36', 'big c-t', 0.8)),
          say: 'That\'s the {g:LCM}. They leave together again at {a:8:36}.' },
      ],
      check: { q: 'One light blinks every 4 seconds and another every 6 seconds. They blink together now. How many seconds until they blink together again?', options: ['2', '10', '12', '24'], answer: '12', why: 'LCM(4, 6) = 12.' },
      remember: '"Together again" problems → find the LCM.',
    },
    {
      id: 'nt-pairs', topic: 'divisors', emoji: '🧮', title: 'Divisors come in pairs',
      frames: [
        { svg: S(V.dots(1, 12, 30, 30, 22, 'b', 0) + V.dots(2, 6, 30, 80, 22, 'c', 0.8) + V.dots(3, 4, 200, 80, 22, 'd', 1.6) + V.t(30, 160, '1 × 12', 'small', 0.4) + V.t(110, 160, '2 × 6', 'small', 1.2) + V.t(220, 160, '3 × 4', 'small', 2), 175),
          say: 'Arrange {g:12} tiles into rectangles. Each rectangle shows a {g:pair} of divisors.' },
        { svg: S(V.t(30, 60, '1 × 12, 2 × 6, 3 × 4', 'big', 0) + V.t(30, 110, '1, 2, 3, 4, 6, 12', 'big c-t', 0.8) + V.t(30, 150, '3 pairs → 6 divisors', 'small', 1.4)),
          say: 'Three pairs: 1 × 12, 2 × 6, 3 × 4. That gives {a:6 divisors}.' },
        { svg: S(V.dots(4, 4, 40, 40, 24, 'b', 0) + V.t(160, 60, '1 × 16, 2 × 8,', 'small', 0.6) + V.t(160, 85, '4 × 4 (repeats!)', 'small red-t', 0.9) + V.t(160, 130, '5 divisors: odd', 'small c-t', 1.4)),
          say: 'A {g:perfect square} like 16 has a pair that repeats (4 × 4), so it has an {g:odd} number of divisors: 1, 2, 4, 8, 16.' },
      ],
      check: { q: 'How many positive divisors does 18 have?', options: ['4', '5', '6', '9'], answer: '6', why: '1 × 18, 2 × 9, 3 × 6: three pairs, so 6 divisors.' },
      remember: 'Count divisors in pairs. Perfect squares get an odd count.',
    },
    {
      id: 'nt-grid', topic: 'divisors', emoji: '🔲', title: 'Counting divisors with primes',
      frames: [
        { svg: S(V.t(60, 90, '72 = 2³ × 3²', 'huge', 0)),
          say: 'Big number? Use its primes: 72 = 2³ × 3².' },
        { svg: S(V.t(10, 30, '×', 'small', 0) + [1, 3, 9].map((n, c) => V.t(95 + c * 70, 30, n, 'small b-t', 0.2)).join('') + [1, 2, 4, 8].map((n, r) => V.t(30, 60 + r * 32, n, 'small d-t', 0.2) + [1, 3, 9].map((m, c) => V.rect(75 + c * 70, 40 + r * 32, 60, 28, 'c', 0.5 + (r * 3 + c) * 0.1) + V.t(95 + c * 70, 60 + r * 32, n * m, 'small', 0.5 + (r * 3 + c) * 0.1)).join('')).join(''), 175),
          say: 'Every divisor picks how many 2s (1, 2, 4 or 8: {g:4 choices}) and how many 3s (1, 3 or 9: {g:3 choices}).' },
        { svg: S(V.t(20, 80, '(3 + 1) × (2 + 1) = 12', 'big', 0) + V.t(20, 130, 'add 1 to each exponent, multiply', 'small', 0.8)),
          say: 'So 72 has 4 × 3 = {a:12} divisors. The rule: {g:add 1 to each exponent, then multiply}.' },
      ],
      check: { q: 'How many positive divisors does 2² × 5² (which is 100) have?', options: ['4', '6', '9', '10'], answer: '9', why: '(2 + 1) × (2 + 1) = 9.' },
      remember: 'Number of divisors: add 1 to each exponent, then multiply.',
    },
    {
      id: 'nt-clock', topic: 'remainders', emoji: '🕐', title: 'Clock math',
      frames: [
        { svg: S(clock() + hand(11, 'thick', 0.5), 180), say: 'It\'s {g:11 o\'clock}. What time will it be {f:5 hours} later?' },
        { svg: S(clock() + hand(11, 'thick') + V.path('M115 41 A70 70 0 0 1 222 128', 'red', 0.3) + hand(4, 'red', 1.2), 180),
          say: 'Count around: after 12 the clock {g:starts over}. 11 + 5 = 16, and 16 − 12 = {a:4 o\'clock}.' },
        { svg: S(V.t(20, 70, '50 hours = 2 days + 2 hours', 'small', 0) + V.t(20, 120, '50 ÷ 24 = 2 rest 2', 'big', 0.6) + V.t(20, 160, 'only the remainder matters', 'small c-t', 1.2)),
          say: 'Big jumps? Full days don\'t change the clock. 50 hours = 2 full days {g:+ 2 hours}. Only the {g:remainder} counts.' },
      ],
      check: { q: 'It is 9 a.m. What time will it be 50 hours from now?', options: ['9 a.m.', '11 a.m.', '1 p.m.', '11 p.m.'], answer: '11 a.m.', why: '50 = 2 × 24 + 2, so it is 2 hours after 9 a.m.' },
      remember: 'Clocks and calendars: throw away full cycles and keep the remainder.',
    },
    {
      id: 'nt-units', topic: 'remainders', emoji: '🔚', title: 'Last digit of a giant power',
      frames: [
        { svg: S([2, 4, 8, 16, 32, 64, 128, 256].map((n, i) => { const s2 = String(n); return V.t(20 + (i % 4) * 75, 70 + Math.floor(i / 4) * 55, s2.slice(0, -1), 'big', i * 0.2) + V.t(20 + (i % 4) * 75 + (s2.length - 1) * 13, 70 + Math.floor(i / 4) * 55, s2.slice(-1), 'big c-t', i * 0.2); }).join('')),
          say: 'Look only at the {g:last digit} of 2, 4, 8, 16, 32, 64, 128, 256…' },
        { svg: S([[160, 35, '2'], [230, 95, '4'], [160, 155, '8'], [90, 95, '6']].map(([x, y, n], i) => V.circ(x, y, 22, 'c', i * 0.3) + V.t(x - 6, y + 7, n, 'big', i * 0.3)).join('') + V.path('M182 45 Q215 55 222 72', 'red', 1.3) + V.path('M222 118 Q215 140 182 148', 'red', 1.5) + V.path('M138 148 Q105 140 98 118', 'red', 1.7) + V.path('M98 72 Q105 50 138 45', 'red', 1.9)),
          say: 'The last digits go round in a {g:cycle of 4}: 2, 4, 8, 6, 2, 4, 8, 6…' },
        { svg: S(V.t(20, 70, X('2⁵⁰: 50 ÷ 4 = 12 rest 2'), 'big', 0) + V.t(20, 125, '2nd in the cycle → 4', 'big c-t', 0.8)),
          say: 'For 2⁵⁰: 50 ÷ 4 leaves remainder 2, so it lands on the 2nd digit of the cycle: {a:4}.' },
      ],
      check: { q: 'What is the units (last) digit of 7²⁰? (Powers of 7 end in 7, 9, 3, 1, 7, 9, 3, 1, …)', options: ['1', '3', '7', '9'], answer: '1', why: '20 ÷ 4 leaves remainder 0, which means the last digit of the cycle: 1.' },
      remember: 'Last digit of a big power: find the cycle, then use the remainder.',
    },
    {
      id: 'nt-exprules', topic: 'exponents', emoji: '🚀', title: 'Exponent rules: count the copies',
      frames: [
        { svg: S(V.t(100, 50, '2³ × 2⁴', 'big', 0) + V.t(20, 110, '(2·2·2) × (2·2·2·2)', 'big', 0.8)),
          say: 'What is 2³ × 2⁴? Write out all the 2s.' },
        { svg: S(V.t(20, 70, '2·2·2·2·2·2·2', 'big', 0) + V.t(40, 130, '7 twos = 2⁷', 'big c-t', 0.8)),
          say: 'That\'s {g:7} twos in a row, so 2³ × 2⁴ = {a:2⁷}. Multiplying → {g:add} the exponents.' },
        { svg: S(V.t(20, 70, '2⁶ ÷ 2² = 2⁴', 'big', 0) + V.t(20, 130, '(2³)² = 2³ × 2³ = 2⁶', 'big', 0.8)),
          say: 'Dividing cancels copies, so {g:subtract}: 2⁶ ÷ 2² = 2⁴. A power of a power {g:multiplies}: (2³)² = 2⁶.' },
      ],
      check: { q: 'What is 3⁵ ÷ 3²?', options: ['3', '9', '27', '81'], answer: '27', why: '3⁵ ÷ 3² = 3³ = 27.' },
      remember: '× → add the exponents. ÷ → subtract. Power of a power → multiply.',
    },
    {
      id: 'nt-expcompare', topic: 'exponents', emoji: '⚔️', title: 'Comparing giant powers',
      frames: [
        { svg: S(V.t(70, 90, X('2³⁰ vs 3²⁰'), 'huge', 0) + V.t(90, 140, 'which is bigger?', 'small', 0.8)),
          say: 'Which is bigger: {g:2³⁰} or {g:3²⁰}? Far too big to work out!' },
        { svg: S(V.t(20, 70, X('2³⁰ = (2³)¹⁰ = 8¹⁰'), 'big', 0) + V.t(20, 125, X('3²⁰ = (3²)¹⁰ = 9¹⁰'), 'big', 0.8)),
          say: 'Make the {g:exponents match}: 2³⁰ = (2³)¹⁰ = 8¹⁰ and 3²⁰ = (3²)¹⁰ = 9¹⁰.' },
        { svg: S(V.t(40, 80, X('9¹⁰ > 8¹⁰'), 'huge', 0) + V.t(60, 140, X('3²⁰ is bigger'), 'big c-t', 0.8)),
          say: 'Same exponent, so just compare the bases: 9 > 8, so {a:3²⁰ is bigger}.' },
      ],
      check: { q: 'Which is bigger: 4¹⁰ or 2¹⁹?', options: ['4¹⁰', '2¹⁹', 'They are equal', 'You can\'t tell'], answer: '4¹⁰', why: '4¹⁰ = (2²)¹⁰ = 2²⁰, which is bigger than 2¹⁹.' },
      remember: 'Comparing powers: rewrite so the exponents (or the bases) match.',
    },
  );
})(typeof window !== 'undefined' ? window : globalThis);
