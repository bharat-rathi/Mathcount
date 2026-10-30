// Concept Studio, chapter: Algebra, patterns & data. Same clip format as studio-counting.js.
(function (root) {
  const V = root.V;
  const C = (root.CLIPS = root.CLIPS || []);
  const S = V.svg;

  // Balance scale: a beam on a triangle stand, with whatever sits in each pan.
  const scale = (left, right, d = 0) => V.poly('160,120 145,165 175,165', 'empty', d) + V.line(30, 120, 290, 120, 'thick', d) + left + right;
  const bag = (x, y, d) => V.rect(x, y, 26, 30, 'b', d) + V.t(x + 8, y + 21, 'x', 'small', d);
  const blk = (x, y, n, d) => V.rect(x, y, 40, 30, 'c', d) + V.t(x + (n > 9 ? 8 : 14), y + 21, n, 'small', d);

  // Bar chart for the "books read" clips: 12 px per book, origin (50, 160).
  const BOOKS = [['Mon', 4], ['Tue', 8], ['Wed', 6], ['Thu', 10]];
  const bars = (hl = () => 'b', d = 0) => {
    let s = '';
    for (let v = 0; v <= 10; v += 2) s += V.line(50, 160 - v * 12, 300, 160 - v * 12, 'gridl', d) + V.t(28, 165 - v * 12, v, 'tiny', d);
    BOOKS.forEach(([day, v], i) => { s += V.rect(70 + i * 60, 160 - v * 12, 40, v * 12, hl(i), d + 0.3 + i * 0.2) + V.t(74 + i * 60, 178, day, 'tiny', d); });
    return s + V.line(50, 160, 300, 160, 'thick', d);
  };

  // Distance–time graph for a bike ride: origin (50, 160), 44 px per hour, 1.3 px per km.
  const gx = (h) => 50 + h * 44, gy = (km) => 160 - km * 1.3;
  const ride = (hl = [], d = 0) => {
    let s = V.line(50, 160, 290, 160, 'thick', d) + V.line(50, 160, 50, 20, 'thick', d);
    for (let h = 0; h <= 5; h++) s += V.t(gx(h) - 4, 178, h, 'tiny', d);
    [0, 50, 100].forEach((km) => { s += V.t(14, gy(km) + 4, km, 'tiny', d) + V.line(50, gy(km), 290, gy(km), 'gridl', d); });
    s += V.t(250, 150, 'hours', 'tiny', d) + V.t(56, 22, 'km', 'tiny', d);
    [[0, 0, 2, 60], [2, 60, 3, 60], [3, 60, 5, 100]].forEach(([a, b, c, e], i) => { s += V.line(gx(a), gy(b), gx(c), gy(e), hl.includes(i) ? 'red' : 'thick', d + 0.5 + i * 0.5); });
    return s;
  };

  C.push(
    {
      id: 'alg-balance', topic: 'equations', emoji: '⚖️', title: 'An equation is a balance',
      frames: [
        { svg: S(scale(bag(40, 88, 0.3) + bag(70, 88, 0.4) + bag(100, 88, 0.5) + [0, 1, 2, 3].map((i) => V.circ(138 + (i % 2) * 12, 100 + Math.floor(i / 2) * 12, 5, 'd', 0.7)).join(''), blk(220, 88, 19, 1)) + V.t(80, 30, '3x + 4 = 19', 'big', 1.4)),
          say: 'An equation is a {g:balance}. Three bags of x plus 4 marbles weigh the same as {g:19} marbles.' },
        { svg: S(scale(bag(60, 88) + bag(90, 88) + bag(120, 88), blk(220, 88, 15, 0.5)) + V.t(40, 30, 'take 4 off both sides', 'small red-t', 0.3) + V.t(110, 60, '3x = 15', 'big', 1)),
          say: 'Take {g:4} off {g:both} sides. It\'s still balanced: 3x = 15.' },
        { svg: S(scale(bag(60, 88) + bag(90, 88) + bag(120, 88), [0, 1, 2].map((i) => V.rect(196 + i * 32, 88, 28, 30, 'c', 0.3 + i * 0.2) + V.t(205 + i * 32, 109, '5', 'small', 0.3 + i * 0.2)).join('')) + V.t(130, 50, 'x = 5', 'big c-t', 1.2)),
          say: '3 bags balance 3 fives, so each bag holds 15 ÷ 3 = {a:5}.' },
        { svg: S(V.t(40, 90, '3 × 5 + 4 = 19 ✓', 'big', 0)),
          say: 'Always check by putting it back in: 3 × 5 + 4 = 19 ✓.' },
      ],
      check: { q: 'Solve 4x − 3 = 21.', options: ['4', '5', '6', '7'], answer: '6', why: 'Add 3 to both sides: 4x = 24. Divide by 4: x = 6.' },
      remember: 'Do the same thing to both sides. Undo + and − first, then × and ÷.',
    },
    {
      id: 'alg-bars', topic: 'equations', emoji: '📊', title: 'Draw the word problem',
      frames: [
        { svg: S(V.t(20, 60, 'Ann has 3 times as many', 'small', 0) + V.t(20, 85, 'cards as Ben.', 'small', 0.3) + V.t(20, 125, 'Together: 32 cards.', 'small b-t', 0.8)),
          say: 'Ann has {g:3 times} as many cards as Ben. Together they have {g:32}. How many does {f:each} have?' },
        { svg: S(V.t(10, 60, 'Ben', 'small', 0) + V.rect(60, 40, 50, 30, 'd', 0.2) + V.t(10, 110, 'Ann', 'small', 0.4) + [0, 1, 2].map((i) => V.rect(60 + i * 52, 90, 50, 30, 'b', 0.6 + i * 0.2)).join('') + V.path('M60 135 Q130 160 216 135', '', 1.4) + V.t(100, 172, '4 boxes = 32', 'small', 1.6), 180),
          say: 'Draw it! Ben is {g:1 box}, Ann is {g:3 boxes}. That\'s 4 equal boxes making 32.' },
        { svg: S(V.t(10, 60, 'Ben', 'small') + V.rect(60, 40, 50, 30, 'd') + V.t(78, 61, '8', 'small', 0.5) + V.t(10, 110, 'Ann', 'small') + [0, 1, 2].map((i) => V.rect(60 + i * 52, 90, 50, 30, 'b') + V.t(78 + i * 52, 111, '8', 'small', 0.7 + i * 0.2)).join('') + V.t(240, 112, '= 24', 'small c-t', 1.5)),
          say: 'Each box is 32 ÷ 4 = 8. Ben has {a:8} and Ann has 3 × 8 = {a:24}.' },
      ],
      check: { q: 'Mia has 4 times as many stickers as Leo. Together they have 45. How many does Leo have?', options: ['9', '11', '15', '36'], answer: '9', why: '1 + 4 = 5 boxes = 45, so one box (Leo) is 9.' },
      remember: 'Word problem? Draw bars, count the boxes, then divide.',
    },
    {
      id: 'alg-undo', topic: 'equations', emoji: '🔙', title: 'Work backwards',
      frames: [
        { svg: S(V.rect(10, 70, 50, 40, 'empty', 0) + V.t(28, 97, '?', 'big', 0) + V.t(68, 96, '→', 'big', 0.3) + V.rect(95, 70, 55, 40, 'b', 0.4) + V.t(104, 97, '× 2', 'small', 0.4) + V.t(158, 96, '→', 'big', 0.7) + V.rect(185, 70, 55, 40, 'b', 0.8) + V.t(194, 97, '+ 6', 'small', 0.8) + V.t(248, 96, '→', 'big', 1.1) + V.t(275, 97, '20', 'big', 1.2)),
          say: 'I think of a number, {g:double} it, then {g:add 6}. I get {g:20}. What was my number?' },
        { svg: S(V.t(10, 97, '7', 'big c-t', 1.6) + V.t(36, 96, '←', 'big', 1.3) + V.rect(60, 70, 55, 40, 'd', 1.2) + V.t(69, 97, '÷ 2', 'small', 1.2) + V.t(122, 96, '← 14 ←', 'small', 0.6) + V.rect(190, 70, 55, 40, 'd', 0.3) + V.t(199, 97, '− 6', 'small', 0.3) + V.t(252, 96, '←', 'big', 0.1) + V.t(275, 97, '20', 'big', 0)),
          say: 'Walk {g:backwards} doing the {g:opposite}: 20 − 6 = 14, then 14 ÷ 2 = {a:7}.' },
        { svg: S(V.t(50, 80, '7 × 2 + 6 = 20 ✓', 'big', 0) + V.t(40, 140, 'shoes off first, then socks', 'small', 1)),
          say: 'Check it forwards: 7 × 2 + 6 = 20 ✓. Undo in {g:reverse order}, like taking off your shoes before your socks.' },
      ],
      check: { q: 'Triple a number, then subtract 5. The result is 16. What was the number?', options: ['5', '7', '9', '11'], answer: '7', why: '16 + 5 = 21, then 21 ÷ 3 = 7.' },
      remember: 'Work backwards: opposite operations, in reverse order.',
    },
    {
      id: 'seq-jumps', topic: 'sequences', emoji: '🦘', title: 'Jumping sequences',
      frames: [
        { svg: S([5, 8, 11, 14].map((n, i) => V.rect(20 + i * 70, 90, 50, 40, 'b', i * 0.3) + V.t(32 + i * 70 + (n < 10 ? 6 : 0), 117, n, 'big', i * 0.3)).join('') + [0, 1, 2].map((i) => V.path(`M${48 + i * 70} 86 Q${80 + i * 70} 50 ${112 + i * 70} 86`, '', 1.2 + i * 0.3) + V.t(72 + i * 70, 55, '+3', 'small c-t', 1.3 + i * 0.3)).join('') + V.t(290, 117, '…', 'big', 2.2)),
          say: '5, 8, 11, 14, … Each step {g:jumps by 3}. What is the {f:20th} number?' },
        { svg: S([0, 1, 2, 3].map((i) => V.rect(40 + i * 75, 70, 12, 70, 'd', i * 0.2)).join('') + [0, 1, 2].map((i) => V.line(52 + i * 75, 95, 115 + i * 75, 95, 'thick', 0.9 + i * 0.2)).join('') + V.t(30, 165, '4 posts, only 3 gaps', 'small', 1.6)),
          say: 'Going from the 1st term to the 4th takes {g:3 jumps}, not 4. Like fence posts and the gaps between them.' },
        { svg: S(V.t(20, 80, '20th = 5 + 19 × 3', 'big', 0) + V.t(90, 130, '= 62', 'big c-t', 1)),
          say: 'So the 20th term is 5 + {g:19} jumps of 3 = 5 + 57 = {a:62}.' },
      ],
      check: { q: 'The sequence 2, 7, 12, 17, … keeps adding 5. What is the 10th number?', options: ['45', '47', '50', '52'], answer: '47', why: '2 + 9 × 5 = 47 (9 jumps to get from the 1st to the 10th).' },
      remember: 'nth term = first + (n − 1) × jump.',
    },
    {
      id: 'seq-gauss', topic: 'sequences', emoji: '🧮', title: 'Adding 1 to 100 in seconds',
      frames: [
        { svg: S(V.t(20, 90, '1 + 2 + 3 + … + 100', 'big', 0) + V.t(130, 140, '= ?', 'big', 0.8)),
          say: 'Add up every number from {g:1 to 100}. Doing it one at a time takes forever!' },
        { svg: S([[1, 100], [2, 99], [3, 98]].map(([a, b], i) => V.t(30, 50 + i * 45, `${a} + ${b} = 101`, 'big', i * 0.5)).join('') + V.t(30, 175, '… every pair = 101', 'small c-t', 1.8)),
          say: 'Pair the ends: 1 + 100, 2 + 99, 3 + 98… {g:every pair makes 101}.' },
        { svg: S(V.t(20, 80, '50 pairs × 101', 'big', 0) + V.t(80, 130, '= 5050', 'big c-t', 1)),
          say: '100 numbers make {g:50 pairs}. 50 × 101 = {a:5050}.' },
        { svg: S(V.t(20, 80, '(first + last)', 'big', 0) + V.t(20, 125, '× how many ÷ 2', 'big', 0.6)),
          say: 'This works for {g:any evenly spaced list}: (first + last) × how many ÷ 2.' },
      ],
      check: { q: 'What is 1 + 2 + 3 + … + 20?', options: ['200', '210', '220', '400'], answer: '210', why: '(1 + 20) × 20 ÷ 2 = 21 × 10 = 210.' },
      remember: 'Sum of an evenly spaced list = (first + last) × count ÷ 2.',
    },
    {
      id: 'seq-cycle', topic: 'sequences', emoji: '🔁', title: 'Repeating patterns',
      frames: [
        { svg: S('ABCABCABC'.split('').map((k, i) => V.circ(25 + i * 32, 90, 14, { A: 'd', B: 'b', C: 'c' }[k], i * 0.15) + V.t(19 + i * 32, 96, k, 'small', i * 0.15)).join('') + V.t(295, 96, '…', 'big', 1.5)),
          say: 'The pattern A, B, C {g:repeats} forever. What is the {f:100th} letter?' },
        { svg: S('ABCABCABC'.split('').map((k, i) => V.circ(25 + i * 32, 90, 14, { A: 'd', B: 'b', C: 'c' }[k]) + V.t(19 + i * 32, 96, k, 'small')).join('') + [0, 1, 2].map((g) => V.path(`M${8 + g * 96} 70 h92 v40 h-92 Z`, 'red', 0.4 + g * 0.3)).join('') + V.t(40, 150, '100 ÷ 3 = 33 rest 1', 'big', 1.5)),
          say: 'It repeats every {g:3} letters, so only the {g:remainder} matters: 100 ÷ 3 = 33 rest {g:1}.' },
        { svg: S(V.t(20, 80, 'rest 1 → 1st letter → A', 'small', 0) + V.t(20, 120, 'rest 0 → last letter → C', 'small', 0.8) + V.circ(260, 75, 16, 'd', 0.4) + V.t(254, 81, 'A', 'small', 0.4)),
          say: 'Remainder 1 means the 1st letter of a block: {a:A}. (Remainder 0 would mean the {g:last} letter, C.)' },
      ],
      check: { q: 'Today is Monday. What day of the week will it be 100 days from today?', options: ['Tuesday', 'Wednesday', 'Thursday', 'Friday'], answer: 'Wednesday', why: '100 ÷ 7 = 14 weeks rest 2. Two days after Monday is Wednesday.' },
      remember: 'Repeating pattern? Divide by the cycle length; the remainder tells you where you land.',
    },
    {
      id: 'stat-mean', topic: 'stats', emoji: '🧱', title: 'Mean = level the towers',
      frames: [
        { svg: S([3, 5, 10].map((h, i) => [...Array(h)].map((_, k) => V.rect(60 + i * 80, 160 - (k + 1) * 14, 40, 13, ['d', 'b', 'c'][i], i * 0.3 + k * 0.05)).join('') + V.t(74 + i * 80, 178, h, 'small', i * 0.3)).join(''), 180),
          say: 'Three towers: {g:3, 5 and 10} blocks. What is the {f:mean} (the average)?' },
        { svg: S([0, 1, 2].map((i) => [...Array(6)].map((_, k) => V.rect(60 + i * 80, 160 - (k + 1) * 14, 40, 13, 'b', k * 0.08)).join('') + V.t(74 + i * 80, 178, 6, 'small c-t', 0.8)).join('') + V.t(20, 40, '18 blocks ÷ 3 towers = 6', 'small', 1), 180),
          say: 'Move blocks until all the towers are {g:level}. 18 blocks ÷ 3 towers = {a:6} each.' },
        { svg: S(V.t(30, 80, 'mean = total ÷ how many', 'big', 0) + V.t(30, 130, 'total = mean × how many', 'small b-t', 1)),
          say: '{g:Mean = total ÷ how many}. Flip it around too: total = mean × how many.' },
      ],
      check: { q: 'The mean of three numbers is 7. Two of them are 5 and 9. What is the third?', options: ['6', '7', '8', '9'], answer: '7', why: 'Total = 3 × 7 = 21. 21 − 5 − 9 = 7.' },
      remember: 'Mean = total ÷ count. Total = mean × count.',
    },
    {
      id: 'stat-median', topic: 'stats', emoji: '🎯', title: 'Median, mode and range',
      frames: [
        { svg: S([9, 3, 9, 4, 5].map((n, i) => V.rect(25 + i * 58, 70, 46, 50, 'empty', i * 0.2) + V.t(42 + i * 58, 103, n, 'big', i * 0.2)).join('')),
          say: 'Test scores: 9, 3, 9, 4, 5. Find the {f:median}, the {f:mode} and the {f:range}.' },
        { svg: S([3, 4, 5, 9, 9].map((n, i) => V.rect(25 + i * 58, 70, 46, 50, i === 2 ? 'c' : 'empty', i * 0.2) + V.t(42 + i * 58, 103, n, 'big', i * 0.2)).join('') + V.t(110, 150, 'middle', 'small c-t', 1.2)),
          say: '{g:Sort them first}: 3, 4, 5, 9, 9. The middle one is the {a:median: 5}.' },
        { svg: S([3, 4, 5, 9, 9].map((n, i) => V.rect(25 + i * 58, 50, 46, 50, n === 9 ? 'b' : 'empty') + V.t(42 + i * 58, 83, n, 'big')).join('') + V.t(220, 125, 'mode = 9', 'small b-t', 0.4) + V.t(20, 160, 'range = 9 − 3 = 6', 'small', 1)),
          say: '{g:Mode} = the most common one = 9. {g:Range} = biggest − smallest = 9 − 3 = 6.' },
        { svg: S([2, 4, 6, 8].map((n, i) => V.rect(40 + i * 62, 60, 50, 50, i === 1 || i === 2 ? 'c' : 'empty', i * 0.2) + V.t(58 + i * 62, 93, n, 'big', i * 0.2)).join('') + V.t(70, 150, 'median = (4 + 6) ÷ 2 = 5', 'small', 1)),
          say: 'An {g:even} number of values? The median is halfway between the two middle ones: 4 and 6 → 5.' },
      ],
      check: { q: 'What is the median of 8, 2, 6, 3, 10?', options: ['3', '5.8', '6', '8'], answer: '6', why: 'Sorted: 2, 3, 6, 8, 10. The middle one is 6.' },
      remember: 'Median: sort first, then take the middle.',
    },
    {
      id: 'stat-totals', topic: 'stats', emoji: '➕', title: 'Average problems? Use totals',
      frames: [
        { svg: S([0, 1, 2, 3].map((i) => V.rect(20 + i * 60, 60, 50, 50, 'b', i * 0.2) + V.t(30 + i * 60, 92, '80', 'small', i * 0.2)).join('') + V.rect(260, 60, 50, 50, 'c', 1) + V.t(270, 92, '90', 'small', 1) + V.t(60, 150, 'new average?', 'big', 1.4)),
          say: 'Your first {g:4 tests} average {g:80}. You score {g:90} on the 5th. What is the {f:new average}?' },
        { svg: S(V.t(60, 80, '4 × 80 = 320', 'big', 0) + V.t(80, 140, 'points so far', 'small', 0.8)),
          say: 'Think in {g:totals}: 4 tests averaging 80 means 4 × 80 = 320 points.' },
        { svg: S(V.t(20, 70, '320 + 90 = 410', 'big', 0) + V.t(20, 120, '410 ÷ 5 = 82', 'big c-t', 0.8)),
          say: 'Add the new test: 320 + 90 = 410 points over 5 tests. 410 ÷ 5 = {a:82}.' },
      ],
      check: { q: 'Four numbers have an average of 10. A fifth number, 20, is added. What is the new average?', options: ['11', '12', '15', '30'], answer: '12', why: 'Total 40 + 20 = 60, and 60 ÷ 5 = 12.' },
      remember: 'Average problems: switch to totals (average × count).',
    },
    {
      id: 'graph-bars', topic: 'graphs', emoji: '📊', title: 'Read the axis first',
      frames: [
        { svg: S(bars() + V.t(110, 18, 'Books read', 'small', 0), 185),
          say: 'This chart shows {g:books read} each day. Read the {g:axis} first: every line is 2 books.' },
        { svg: S(bars((i) => (i === 0 || i === 3 ? 'd' : 'empty')) + V.t(110, 18, '10 − 4 = 6', 'small c-t', 0.8), 185),
          say: 'How many {f:more} books on Thursday than Monday? 10 − 4 = {a:6}.' },
        { svg: S(V.t(20, 80, '4 + 8 + 6 + 10 = 28', 'big', 0) + V.t(20, 130, 'check the scale!', 'small red-t', 1)),
          say: 'The week\'s total: add the bars, 4 + 8 + 6 + 10 = {a:28}. Always check the scale: some axes skip numbers or don\'t start at 0!' },
      ],
      check: { q: 'Using that chart (Mon 4, Tue 8, Wed 6, Thu 10), what was the average number of books per day?', options: ['6', '7', '8', '28'], answer: '7', why: 'Total 28 ÷ 4 days = 7.' },
      remember: 'Graphs: read the title and the axis scale before anything else.',
    },
    {
      id: 'graph-speed', topic: 'graphs', emoji: '🚲', title: 'Steeper means faster',
      frames: [
        { svg: S(ride(), 185), say: 'A bike ride. {g:Distance} goes up the side, {g:time} goes across.' },
        { svg: S(ride([1]) + V.t(gx(2) - 6, gy(60) - 10, 'stopped', 'tiny red-t', 1.6), 185), say: 'A {g:flat} part means the distance isn\'t changing: the rider {a:stopped} for an hour.' },
        { svg: S(ride([0, 2]) + V.t(gx(0.2), gy(40), '30 km/h', 'tiny', 1.5) + V.t(gx(3.1), gy(90), '20 km/h', 'tiny', 1.7), 185),
          say: '{g:Steeper = faster}. First part: 60 km in 2 hours = 30 km/h. Last part: 40 km in 2 hours = 20 km/h.' },
      ],
      check: { q: 'On that graph, how far did the rider go during the last 2 hours (from hour 3 to hour 5)?', options: ['20 km', '40 km', '60 km', '100 km'], answer: '40 km', why: 'The distance went from 60 km to 100 km: 100 − 60 = 40.' },
      remember: 'Distance–time graph: steeper = faster, flat = stopped.',
    },
  );
})(typeof window !== 'undefined' ? window : globalThis);
