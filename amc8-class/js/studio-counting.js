// Concept Studio, chapter: Counting & Probability.
// A clip teaches ONE idea in 3–5 frames. Each frame is a picture that builds itself plus one
// short sentence, then a "your turn" check and a one-line takeaway to remember.
// Color code as in the lessons: {g:given} blue, {f:find} orange, {a:answer} green.
(function (root) {
  const V = root.V;
  const C = (root.CLIPS = root.CLIPS || []);
  const S = V.svg;

  // A die-results grid: 6 × 6 cells, die 1 across the top, die 2 down the side.
  const GX = 110, GY = 40, GC = 22;
  const grid = (fill, d = 0) => {
    let s = V.t(GX + 30, 14, 'die 1 →', 'tiny', d) + V.t(20, GY + 70, 'die 2 ↓', 'tiny', d);
    for (let i = 1; i <= 6; i++) s += V.t(GX + (i - 1) * GC + 6, GY - 6, i, 'tiny', d) + V.t(GX - 14, GY + (i - 1) * GC + 15, i, 'tiny', d);
    for (let r = 1; r <= 6; r++) for (let c = 1; c <= 6; c++) {
      const cls = fill(c, r);
      s += V.rect(GX + (c - 1) * GC, GY + (r - 1) * GC, GC - 2, GC - 2, cls || 'empty', cls ? d + 0.6 + (r + c) * 0.05 : d);
    }
    return s;
  };

  C.push(
    {
      id: 'cnt-multiply', topic: 'counting', emoji: '👕', title: 'Multiply the choices',
      frames: [
        { svg: S(['d', 'b', 'c'].map((cl, i) => V.circ(50 + i * 55, 70, 22, cl, i * 0.3) + V.t(39 + i * 55, 78, '👕', 'small', i * 0.3)).join('') + V.t(40, 120, '3 shirts', 'small', 1) + V.t(220, 80, '👖', 'huge', 1.4) + V.t(270, 80, '🩳', 'huge', 1.6) + V.t(225, 120, '2 pants', 'small', 2)),
          say: '{g:3 shirts} and {g:2 pants}. How many {f:different outfits} can you make?' },
        { svg: S([35, 90, 145].map((y, i) => V.circ(50, y, 14, ['d', 'b', 'c'][i], i * 0.3) + V.line(64, y, 196, y - 15, '', 1 + i * 0.3) + V.line(64, y, 196, y + 15, '', 1.1 + i * 0.3) + V.t(204, y - 10, 'jeans', 'tiny', 1.5 + i * 0.3) + V.t(204, y + 20, 'shorts', 'tiny', 1.6 + i * 0.3)).join('')),
          say: 'Each shirt can go with {g:either} pants. Draw a branch for every choice.' },
        { svg: S([35, 90, 145].map((y, i) => V.circ(50, y, 14, ['d', 'b', 'c'][i]) + V.line(64, y, 196, y - 15) + V.line(64, y, 196, y + 15) + V.t(260, y - 10, 2 * i + 1, 'c-t', 0.5 + i * 0.5) + V.t(260, y + 20, 2 * i + 2, 'c-t', 0.7 + i * 0.5)).join('')),
          say: 'Count the ends of the branches: {a:6 outfits}. That is just 3 × 2!' },
        { svg: S(V.t(50, 80, '3 × 2 = 6', 'huge', 0) + V.t(50, 130, 'shirts × pants', 'small', 1)),
          say: 'So skip the drawing: {g:multiply the number of choices} at each step.' },
        { svg: S(V.t(10, 80, '🍞3 × 🥩4 × 🥫2', 'big', 0) + V.t(90, 140, '= 24 burgers', 'big c-t', 1.5)),
          say: 'It works for any number of steps: 3 breads × 4 fillings × 2 sauces = {a:24} burgers.' },
      ],
      check: { q: 'An ice-cream shop has 4 flavors, 3 toppings and 2 kinds of cone. You pick one of each. How many different ice creams?', options: ['9', '12', '24', '36'], answer: '24', why: '4 × 3 × 2 = 24. Steps in a row → multiply.' },
      remember: 'Steps in a row? Multiply the choices at each step.',
    },
    {
      id: 'cnt-or-and', topic: 'counting', emoji: '🍎', title: 'OR adds, AND multiplies',
      frames: [
        { svg: S(V.rect(10, 40, 130, 70, 'c', 0) + V.t(25, 85, '🍎🍌🍇', 'big', 0.3) + V.t(30, 135, '3 fruits', 'small', 0.5) + V.rect(170, 40, 140, 70, 'b', 1) + V.t(180, 85, '🥨🍿🍪🧀', 'big', 1.3) + V.t(185, 135, '4 crunchy snacks', 'small', 1.5)),
          say: 'A lunchbox menu: {g:3 fruits} and {g:4 crunchy snacks}.' },
        { svg: S(V.t(20, 40, 'Pick ONE snack:', 'small', 0) + V.t(15, 95, '🍎🍌🍇 🥨🍿🍪🧀', 'big', 0.5) + V.t(60, 150, '3 + 4 = 7', 'big c-t', 1.5)),
          say: 'Pick {g:one} snack, a fruit {g:OR} a crunchy one: you choose from one group or the other, so {a:add}. 3 + 4 = 7.' },
        { svg: S(V.t(10, 16, 'Pick a fruit AND a crunchy snack:', 'tiny', 0) + ['🍎', '🍌', '🍇'].map((e, r) => V.t(40, 108 + r * 34, e, 'big', 0.3 + r * 0.2)).join('') + ['🥨', '🍿', '🍪', '🧀'].map((e, c) => V.t(90 + c * 40, 60, e, 'big', 0.6)).join('') + V.dots(3, 4, 102, 100, 34, 'c', 1) + V.t(260, 140, '= 12', 'big c-t', 2.5), 200),
          say: 'Now a fruit {g:AND} a crunchy snack: every fruit pairs with every crunchy snack. That is a 3 × 4 grid, so {a:multiply}: 12.' },
        { svg: S(V.t(40, 75, 'OR  →  +', 'huge', 0) + V.t(40, 140, 'AND →  ×', 'huge', 1)),
          say: 'Listen for the little words: {g:OR} means add, {g:AND} means multiply.' },
      ],
      check: { q: 'A café has 5 kinds of pizza and 3 kinds of pasta. You order ONE main dish. How many choices do you have?', options: ['8', '15', '2', '53'], answer: '8', why: 'One dish: a pizza OR a pasta → 5 + 3 = 8.' },
      remember: 'OR → add. AND → multiply.',
    },
    {
      id: 'cnt-lineup', topic: 'combos', emoji: '📸', title: 'Line-ups: n × (n − 1) × …',
      frames: [
        { svg: S(['A', 'B', 'C'].map((k, i) => V.circ(80 + i * 80, 50, 20, ['d', 'b', 'c'][i], i * 0.3) + V.t(73 + i * 80, 57, k, '', i * 0.3)).join('') + [0, 1, 2].map((i) => V.rect(55 + i * 80, 110, 50, 40, 'empty', 1 + i * 0.2)).join('') + [0, 1, 2].map((i) => V.t(58 + i * 80, 172, `seat ${i + 1}`, 'tiny', 1.6)).join('')),
          say: '{g:3 friends} line up for a photo. In how many {f:orders} can they stand?' },
        { svg: S([0, 1, 2].map((i) => V.rect(55 + i * 80, 110, 50, 40, i === 0 ? 'a' : 'empty')).join('') + V.t(72, 138, '3', 'big', 0.3) + V.t(40, 70, 'A, B or C', 'small', 0.6)),
          say: 'Seat 1: any of the {g:3} can go first.' },
        { svg: S([0, 1, 2].map((i) => V.rect(55 + i * 80, 110, 50, 40, i < 2 ? 'a' : 'empty')).join('') + V.t(72, 138, '3', 'big') + V.t(152, 138, '2', 'big', 0.3) + V.t(120, 70, '2 left', 'small', 0.6)),
          say: 'Seat 2: someone already sat down, so only {g:2} are left.' },
        { svg: S([0, 1, 2].map((i) => V.rect(55 + i * 80, 110, 50, 40, 'a')).join('') + V.t(72, 138, '3', 'big') + V.t(152, 138, '2', 'big') + V.t(232, 138, '1', 'big', 0.3) + V.t(60, 70, '3 × 2 × 1 = 6', 'big c-t', 0.8)),
          say: 'Seat 3: just {g:1} left. Multiply: 3 × 2 × 1 = {a:6} orders.' },
        { svg: S(['ABC', 'ACB', 'BAC', 'BCA', 'CAB', 'CBA'].map((w, i) => V.t(40 + (i % 3) * 95, 60 + Math.floor(i / 3) * 50, w, 'big', i * 0.25)).join('') + V.t(70, 165, '3 × 2 × 1 is called 3!', 'small', 2)),
          say: 'Here they all are: 6. Mathematicians write 3 × 2 × 1 as {g:3!}, said "3 factorial".' },
      ],
      check: { q: 'In how many different orders can 4 books stand on a shelf?', options: ['4', '12', '16', '24'], answer: '24', why: '4 × 3 × 2 × 1 = 24.' },
      remember: 'Lining up n things: n × (n − 1) × … × 1.',
    },
    {
      id: 'cnt-choose', topic: 'combos', emoji: '🤝', title: 'Choosing a team: order doesn\'t matter',
      frames: [
        { svg: S(['A', 'B', 'C', 'D'].map((k, i) => V.circ(55 + i * 70, 90, 22, ['d', 'b', 'c', 'a'][i], i * 0.3) + V.t(48 + i * 70, 97, k, '', i * 0.3)).join('')),
          say: 'The coach picks {g:2 of these 4 players} for a drill. How many {f:different pairs}?' },
        { svg: S(['AB', 'AC', 'AD', 'BA', 'BC', 'BD', 'CA', 'CB', 'CD', 'DA', 'DB', 'DC'].map((w, i) => V.t(30 + (i % 3) * 100, 40 + Math.floor(i / 3) * 38, w, 'big', i * 0.1)).join('')),
          say: 'If order mattered (first pick, second pick), there would be 4 × 3 = {g:12}.' },
        { svg: S(['AB', 'AC', 'AD', 'BA', 'BC', 'BD', 'CA', 'CB', 'CD', 'DA', 'DB', 'DC'].map((w, i) => V.t(30 + (i % 3) * 100, 40 + Math.floor(i / 3) * 38, w, w[0] > w[1] ? 'big red-t' : 'big', w[0] > w[1] ? 0.3 : null)).join('')),
          say: 'But {g:AB} and {g:BA} are the same pair! Every pair got counted {f:twice} (the red ones are repeats).' },
        { svg: S(V.t(60, 60, '12 ÷ 2 = 6', 'huge', 0) + ['AB', 'AC', 'AD', 'BC', 'BD', 'CD'].map((w, i) => V.t(20 + i * 50, 130, w, 'big c-t', 1 + i * 0.2)).join('')),
          say: 'So divide by 2: 12 ÷ 2 = {a:6} pairs.' },
        { svg: S([[90, 40], [230, 40], [230, 150], [90, 150]].map(([x, y], i, a) => a.slice(i + 1).map(([x2, y2], j) => V.line(x, y, x2, y2, '', 0.5 + (i + j) * 0.3)).join('')).join('') + [[90, 40], [230, 40], [230, 150], [90, 150]].map(([x, y], i) => V.circ(x, y, 16, ['d', 'b', 'c', 'a'][i])).join('') + V.t(250, 100, '6', 'big c-t', 2.5)),
          say: 'Same idea: 4 people shaking hands make {a:6} handshakes, one line for each pair.' },
      ],
      check: { q: '5 players each high-five every other player once. How many high-fives?', options: ['5', '10', '20', '25'], answer: '10', why: '5 × 4 = 20 counts each high-five twice, so 20 ÷ 2 = 10.' },
      remember: 'Order doesn\'t matter? Count as if it did, then divide out the repeats.',
    },
    {
      id: 'cnt-cases', topic: 'casework', emoji: '🗂️', title: 'Split it into cases',
      frames: [
        { svg: S(V.rect(90, 50, 60, 70, 'empty', 0) + V.rect(170, 50, 60, 70, 'empty', 0.2) + V.t(110, 95, '?', 'big', 0.4) + V.t(190, 95, '?', 'big', 0.5) + V.t(85, 155, 'digits add up to 5', 'small', 1)),
          say: 'How many {f:two-digit numbers} have digits that add up to {g:5}?' },
        { svg: S(V.t(20, 25, 'tens', 'tiny') + V.t(110, 25, 'ones', 'tiny') + V.t(200, 25, 'number', 'tiny') + [1, 2, 3, 4, 5].map((t, i) => V.t(30, 50 + i * 28, t, 'b-t', i * 0.4) + V.t(120, 50 + i * 28, 5 - t, '', i * 0.4 + 0.2) + V.t(210, 50 + i * 28, `${t}${5 - t}`, 'c-t', i * 0.4 + 0.3)).join('')),
          say: '{g:Split into cases} by the tens digit: 1, 2, 3, 4 or 5 (it can\'t be 0). Each case has exactly one ones digit.' },
        { svg: S(['14', '23', '32', '41', '50'].map((w, i) => V.t(25 + i * 60, 80, w, 'big c-t', i * 0.3)).join('') + V.t(70, 145, '1+1+1+1+1 = 5', 'big', 1.8)),
          say: 'Add up the cases: 14, 23, 32, 41, 50. That is {a:5} numbers.' },
        { svg: S(V.rect(20, 50, 80, 50, 'b', 0) + V.t(35, 82, 'case 1', 'small', 0) + V.rect(120, 50, 80, 50, 'c', 0.4) + V.t(135, 82, 'case 2', 'small', 0.4) + V.rect(220, 50, 80, 50, 'd', 0.8) + V.t(235, 82, 'case 3', 'small', 0.8) + V.t(90, 145, 'add them up', 'big', 1.4)),
          say: 'Casework: split the problem, count each case, add. Make sure {g:no case is missing} and {g:none is counted twice}.' },
      ],
      check: { q: 'How many two-digit numbers have digits that add up to 4?', options: ['3', '4', '5', '6'], answer: '4', why: 'Cases by tens digit: 13, 22, 31, 40. That makes 4.' },
      remember: 'Too messy? Split into cases, count each one, add.',
    },
    {
      id: 'cnt-opposite', topic: 'casework', emoji: '🪙', title: 'Count the opposite',
      frames: [
        { svg: S([0, 1, 2].map((i) => V.circ(90 + i * 70, 80, 26, 'a', i * 0.3) + V.t(82 + i * 70, 88, '?', 'big', i * 0.3)).join('') + V.t(70, 150, 'at least one head?', 'small', 1.2)),
          say: 'Flip {g:3 coins}. How many results have {f:at least one head}?' },
        { svg: S(['HHH', 'HHT', 'HTH', 'THH', 'HTT', 'THT', 'TTH', 'TTT'].map((w, i) => V.t(20 + (i % 4) * 75, 70 + Math.floor(i / 4) * 60, w, 'big', i * 0.15)).join('')),
          say: 'Each coin has 2 sides, so there are 2 × 2 × 2 = {g:8} results.' },
        { svg: S(['HHH', 'HHT', 'HTH', 'THH', 'HTT', 'THT', 'TTH', 'TTT'].map((w, i) => V.t(20 + (i % 4) * 75, 70 + Math.floor(i / 4) * 60, w, w === 'TTT' ? 'big red-t' : 'big c-t', w === 'TTT' ? 0.4 : null)).join('') + V.line(240, 125, 300, 125, 'red', 1)),
          say: 'Only {g:TTT} has no heads. Every other result works!' },
        { svg: S(V.t(70, 80, '8 − 1 = 7', 'huge', 0) + V.t(40, 140, 'all − the ones you don\'t want', 'small', 1)),
          say: 'So the answer is 8 − 1 = {a:7}. When "at least one" is hard, count the {g:opposite} and subtract.' },
      ],
      check: { q: 'Flip 4 coins. How many results have at least one tail?', options: ['4', '8', '15', '16'], answer: '15', why: '2⁴ = 16 results; only HHHH has no tail, so 16 − 1 = 15.' },
      remember: '"At least one"? Count all, subtract the "none" results.',
    },
    {
      id: 'cnt-grid', topic: 'paths', emoji: '🧭', title: 'Grid paths: add from the corner',
      frames: [
        { svg: S([60, 140, 220].map((x, i) => V.line(x, 30, x, 150, 'thick', i * 0.2)).join('') + [30, 90, 150].map((y, i) => V.line(60, y, 220, y, 'thick', i * 0.2)).join('') + V.circ(60, 150, 9, 'b', 1) + V.t(35, 172, 'A', 'b-t', 1) + V.circ(220, 30, 9, 'c', 1.2) + V.t(232, 26, 'B', 'c-t', 1.2) + V.t(250, 110, '↑ →', 'big', 1.6)),
          say: 'Walk from {g:A} to {g:B}, moving only {g:up} or {g:right}. How many {f:different paths}?' },
        { svg: S([60, 140, 220].map((x) => V.line(x, 30, x, 150, 'thick')).join('') + [30, 90, 150].map((y) => V.line(60, y, 220, y, 'thick')).join('') + [[140, 150], [220, 150], [60, 90], [60, 30]].map(([x, y], i) => V.circ(x, y, 13, 'b', i * 0.3) + V.t(x - 5, y + 6, '1', '', i * 0.3)).join('')),
          say: 'Along the bottom and the left edge there is only {g:1 way} to reach each corner: straight there.' },
        { svg: S([60, 140, 220].map((x) => V.line(x, 30, x, 150, 'thick')).join('') + [30, 90, 150].map((y) => V.line(60, y, 220, y, 'thick')).join('') + [[140, 150], [220, 150], [60, 90], [60, 30]].map(([x, y]) => V.circ(x, y, 13, 'b') + V.t(x - 5, y + 6, '1')).join('') + V.circ(140, 90, 13, 'c', 0.5) + V.t(135, 96, '2', '', 0.5) + V.t(160, 125, '1 + 1', 'tiny', 0.8)),
          say: 'Every other corner: {g:add} the number below it and the number to its left. 1 + 1 = 2.' },
        { svg: S([60, 140, 220].map((x) => V.line(x, 30, x, 150, 'thick')).join('') + [30, 90, 150].map((y) => V.line(60, y, 220, y, 'thick')).join('') + [[140, 150, 1], [220, 150, 1], [60, 90, 1], [60, 30, 1], [140, 90, 2]].map(([x, y, n]) => V.circ(x, y, 13, n > 1 ? 'c' : 'b') + V.t(x - 5, y + 6, n)).join('') + [[220, 90, 3, 0.3], [140, 30, 3, 0.8], [220, 30, 6, 1.4]].map(([x, y, n, d]) => V.circ(x, y, 13, n === 6 ? 'a' : 'c', d) + V.t(x - 5, y + 6, n, '', d)).join('')),
          say: 'Keep going: 2 + 1 = 3, 1 + 2 = 3, then 3 + 3 = {a:6} paths to B.' },
      ],
      check: { q: 'Using the same rule, how many up/right paths cross a grid that is 3 blocks wide and 2 blocks tall?', options: ['6', '8', '10', '12'], answer: '10', why: 'Fill the corners: the top row ends 1, 3, 6, 10. So 10 paths.' },
      remember: 'Each corner = the number below + the number to the left.',
    },
    {
      id: 'cnt-share', topic: 'paths', emoji: '🍬', title: 'Sharing out: candies and dividers',
      frames: [
        { svg: S(V.t(40, 70, '🍬🍬🍬🍬🍬', 'huge', 0) + V.t(60, 140, '🧒 🧒 🧒', 'huge', 1)),
          say: 'Share {g:5 identical candies} among {g:3 kids}. A kid may get none. How many {f:ways}?' },
        { svg: S(['🍬', '🍬', '|', '🍬', '🍬', '🍬', '|'].map((c, i) => V.t(30 + i * 38, 90, c, c === '|' ? 'huge red-t' : 'big', i * 0.2)).join('') + V.t(30, 150, 'kid 1: 2 · kid 2: 3 · kid 3: 0', 'small', 1.8)),
          say: 'Line up the candies and drop in {g:2 dividers}. They split the line into 3 groups: one per kid.' },
        { svg: S(['|', '🍬', '🍬', '🍬', '🍬', '🍬', '|'].map((c, i) => V.t(30 + i * 38, 90, c, c === '|' ? 'huge red-t' : 'big', i * 0.2)).join('') + V.t(30, 150, 'kid 1: 0 · kid 2: 5 · kid 3: 0', 'small', 1.8)),
          say: 'Move the dividers and you get a different sharing. {g:Every way to place them is one way to share.}' },
        { svg: S([0, 1, 2, 3, 4, 5, 6].map((i) => V.rect(15 + i * 42, 50, 36, 40, i === 1 || i === 4 ? 'd' : 'empty', i * 0.1)).join('') + V.t(30, 125, '5 candies + 2 dividers = 7 spots', 'small', 1) + V.t(40, 165, 'pick 2: 7 × 6 ÷ 2 = 21', 'big c-t', 1.8)),
          say: '5 candies + 2 dividers = 7 spots. Choose which 2 spots hold dividers: 7 × 6 ÷ 2 = {a:21} ways.' },
      ],
      check: { q: 'Share 4 identical candies between 2 kids (a kid may get none). How many ways?', options: ['4', '5', '6', '8'], answer: '5', why: '4 candies + 1 divider = 5 spots; choose 1 for the divider → 5 (4-0, 3-1, 2-2, 1-3, 0-4).' },
      remember: 'Sharing identical things: things + dividers, then choose the divider spots.',
    },
    {
      id: 'prob-basic', topic: 'probability', emoji: '🎯', title: 'Probability = good ÷ total',
      frames: [
        { svg: S(V.path('M60 40 Q60 160 160 160 Q260 160 260 40', '', 0) + [[110, 120, 'd'], [150, 135, 'd'], [190, 120, 'd'], [130, 95, 'b'], [175, 92, 'b']].map(([x, y, c], i) => V.circ(x, y, 16, c, 0.6 + i * 0.2)).join('')),
          say: 'A bag has {g:3 red} and {g:2 blue} marbles. You grab one without looking.' },
        { svg: S(V.bar(30, 60, 250, 50, 5, 3, 'd', 0) + V.t(50, 150, 'P(red) = 3/5', 'big c-t', 1.2)),
          say: 'Probability = {g:good outcomes ÷ all outcomes}. 3 red out of 5 marbles: P(red) = {a:3/5}.' },
        { svg: S(V.line(20, 100, 300, 100, 'thick', 0) + V.t(10, 135, '0', 'big', 0.3) + V.t(5, 160, 'never', 'tiny', 0.3) + V.t(150, 135, '½', 'big', 0.5) + V.t(290, 135, '1', 'big', 0.7) + V.t(272, 160, 'always', 'tiny', 0.7) + V.circ(188, 100, 10, 'd', 1.2) + V.t(172, 75, '3/5', 'b-t', 1.4)),
          say: 'Probabilities are always between {g:0} (never) and {g:1} (always). 3/5 is a bit more likely than not.' },
      ],
      check: { q: 'Roll one die. What is the probability of rolling an even number?', options: ['1/6', '1/3', '1/2', '2/3'], answer: '1/2', why: 'Evens are 2, 4 and 6: 3 good out of 6, so 3/6 = 1/2.' },
      remember: 'Probability = good outcomes ÷ all outcomes.',
    },
    {
      id: 'prob-dice', topic: 'probability', emoji: '🎲', title: 'Two dice? Draw the grid',
      frames: [
        { svg: S(grid(() => null), 190), say: 'Roll {g:two dice}. This 6 × 6 grid shows every result: {g:36} squares.' },
        { svg: S(grid((c, r) => (c + r === 7 ? 'c' : null)), 190), say: 'Which squares add up to {f:7}? They make a diagonal: 1+6, 2+5, 3+4, 4+3, 5+2, 6+1. That is 6 squares.' },
        { svg: S(V.t(40, 80, '6/36 = 1/6', 'huge', 0) + V.t(50, 140, '7 is the most likely sum!', 'small', 1)), say: 'So P(sum is 7) = 6/36 = {a:1/6}. No other sum has as many squares.' },
      ],
      check: { q: 'Roll two dice. What is the probability that the sum is 11?', options: ['1/36', '1/18', '1/12', '1/6'], answer: '1/18', why: 'Only 5+6 and 6+5: 2 of 36 squares = 1/18.' },
      remember: 'Two dice → picture the 6 × 6 grid and shade the squares you want.',
    },
    {
      id: 'prob-none', topic: 'probplus', emoji: '🔄', title: '1 − the chance it doesn\'t happen',
      frames: [
        { svg: S(grid(() => null), 190), say: 'Roll two dice. What is the chance of {f:at least one 6}?' },
        { svg: S(grid((c, r) => (c < 6 && r < 6 ? 'b' : null)), 190), say: 'Easier: count results with {g:no 6 at all}. Each die has 5 choices, so 5 × 5 = {g:25} squares.' },
        { svg: S(grid((c, r) => (c < 6 && r < 6 ? 'b' : 'c')), 190), say: 'Everything else has a 6: 36 − 25 = 11 squares. P = {a:11/36}.' },
        { svg: S(V.t(20, 80, 'P(yes) = 1 − P(no)', 'big', 0) + V.t(40, 140, '1 − 25/36 = 11/36', 'big c-t', 1)), say: 'The shortcut: P(at least one) = {g:1 − P(none)}.' },
      ],
      check: { q: 'Flip 2 coins. What is the probability of at least one head?', options: ['1/4', '1/2', '3/4', '1'], answer: '3/4', why: 'P(no heads) = P(TT) = 1/4, so 1 − 1/4 = 3/4.' },
      remember: '"At least one" → 1 − P(none).',
    },
    {
      id: 'prob-and', topic: 'probplus', emoji: '✖️', title: 'Both happen? Multiply',
      frames: [
        { svg: S(V.t(60, 90, '🪙  +  🎲', 'huge', 0) + V.t(60, 150, 'heads AND a 6?', 'big', 1)), say: 'Flip a coin {g:and} roll a die. What is the chance of {f:heads AND a 6}?' },
        { svg: S(V.rect(40, 30, 120, 120, 'b', 0) + V.rect(160, 30, 120, 120, 'empty', 0) + V.t(85, 172, 'H', 'big', 0.3) + V.t(205, 172, 'T', 'big', 0.3) + [0, 1, 2, 3, 4, 5].map((i) => V.line(40, 30 + i * 20, 160, 30 + i * 20, '', 0.8 + i * 0.1)).join('') + V.rect(40, 30, 120, 20, 'd', 1.6) + V.t(70, 45, 'rolled 6', 'tiny', 1.8)),
          say: 'Half the time it is {g:heads} (blue half). Of those, only {g:1 in 6} is also a six (the pink strip).' },
        { svg: S(V.t(50, 80, '1/2 × 1/6 = 1/12', 'big', 0) + V.t(50, 140, 'separate events → multiply', 'small', 1)), say: 'The pink strip is 1/2 × 1/6 = {a:1/12} of the whole square. Separate events that {g:both} happen → multiply.' },
      ],
      check: { q: 'Flip a coin and roll a die. What is the probability of heads AND an even number?', options: ['1/12', '1/4', '1/2', '2/3'], answer: '1/4', why: 'P(heads) = 1/2 and P(even) = 1/2, so 1/2 × 1/2 = 1/4.' },
      remember: 'Separate events that both happen → multiply the probabilities.',
    },
  );
})(typeof window !== 'undefined' ? window : globalThis);
