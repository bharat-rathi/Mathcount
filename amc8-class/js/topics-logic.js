// Logic & puzzles: about 11% of AMC 8 problems (2018–2026), and many of the hardest ones.
// Lessons use the hands-on slide types: predict (guess, then see why), steps (a worked
// example revealed one tap at a time) and order (tap items into the right order).
// Color code in text: {g:given} blue, {f:what we find} orange, {a:answer} green.
(function (root) {
  const { R, pick, shuffle } = root.U;
  const V = root.V;
  const T = (root.TOPICS = root.TOPICS || []);
  const NAMES = ['Ava', 'Ben', 'Cruz', 'Dev', 'Eli', 'Fay', 'Gus', 'Hana', 'Ivy', 'Jay', 'Kai', 'Leo', 'Mia', 'Nia', 'Omar', 'Pia'];

  // Runners on a number line: minutes behind the leader.
  const line = (pts, d = 0) => {
    const x = (v) => 25 + v * 22;
    return V.line(20, 110, 300, 110, 'thick', d) +
      pts.map(([v, n], i) => V.circ(x(v), 110, 9, ['a', 'b', 'c', 'd'][i % 4], d + 0.6 + i * 0.4) + V.t(x(v) - 10, 92 - (i % 2) * 20, n, 'small', d + 0.6 + i * 0.4) + V.t(x(v) - 4, 138, v, 'tiny', d + 0.6 + i * 0.4)).join('') +
      V.t(20, 168, 'minutes behind the leader →', 'tiny', d);
  };

  T.push({
    id: 'logic', name: 'Logic & Puzzles', emoji: '🧠', color: '#7950f2',
    slides: [
      { type: 'predict', h: 'Who finished last?',
        ask: '{g:Pia} beat {g:Omar} by 3 min. {g:Leo} was 6 min behind Omar. {g:Nia} was 11 min behind Pia. Who was {f:last}?',
        options: ['Pia', 'Omar', 'Leo', 'Nia'], answer: 'Nia',
        svg: V.svg(line([[0, 'Pia'], [3, 'Omar'], [9, 'Leo'], [11, 'Nia']])),
        text: 'Make one person {g:zero}, then put everyone on a number line. Pia = 0, Omar = 3, Leo = 9, Nia = 11, so {a:Nia} is last.' },
      { type: 'order', h: 'Your turn: tap them in finishing order',
        text: '{g:Cruz} beat Ben. {g:Ben} beat Ava. {g:Dev} was last.',
        items: ['Ava', 'Ben', 'Cruz', 'Dev'], answer: ['Cruz', 'Ben', 'Ava', 'Dev'],
        explain: 'Chain the clues: Cruz → Ben → Ava, and Dev goes at the end.' },
      { type: 'steps', h: 'Add everything',
        problem: '{g:A + B = 9}, {g:B + C = 13}, {g:A + C = 10}. Find {f:B}.',
        steps: [
          { svg: V.svg(['A+B=9', 'B+C=13', 'A+C=10'].map((s, i) => V.rect(15 + i * 100, 40, 90, 50, ['a', 'b', 'c'][i], i * 0.3) + V.t(25 + i * 100, 72, s, 'small', i * 0.3)).join('')), say: 'Each letter shows up in exactly two of the boxes.' },
          { svg: V.svg(V.t(20, 70, '9 + 13 + 10 = 32', 'big', 0) + V.t(20, 120, '= 2 × (A + B + C)', 'big b-t', 1)), say: 'Add all three: you counted every letter twice.' },
          { svg: V.svg(V.t(20, 70, 'A + B + C = 16', 'big', 0) + V.t(20, 130, 'B = 16 − (A+C) = 16 − 10 = 6', 'small c-t', 1)), say: 'So the total is 16. Take away A + C and only {a:B = 6} is left.' },
        ] },
      { type: 'predict', h: 'Worst-case thinking',
        ask: 'A dark drawer has {g:10 red} and {g:10 blue} socks. What is the {f:fewest} you must grab to be SURE you have a matching pair?',
        options: ['2', '3', '11', '20'], answer: '3',
        svg: V.svg(V.rect(40, 50, 40, 70, 'd', 0) + V.rect(120, 50, 40, 70, 'a', 0.8) + V.t(175, 95, '+', 'big', 1.4) + V.rect(220, 50, 40, 70, 'empty', 1.6) + V.t(232, 95, '?', 'big', 1.8) + V.t(20, 165, 'unlucky: red, blue… the 3rd MUST match', 'small', 2.2)),
        text: 'Imagine the unluckiest grabs: one red, one blue. The next sock has to match one of them, so {a:3}.' },
      { type: 'steps', h: 'Work backwards',
        problem: 'Kai picked a number, {g:tripled it}, {g:subtracted 4}, then {g:halved it}, and got {g:10}. What was his {f:number}?',
        steps: [
          { svg: V.svg(['?', '×3', '−4', '÷2', '10'].map((s, i) => V.rect(8 + i * 62, 60, 54, 50, i === 4 ? 'c' : i ? 'a' : 'b', i * 0.2) + V.t(22 + i * 62, 92, s, 'small', i * 0.2)).join('')), say: 'Draw the machine from start to finish.' },
          { svg: V.svg(['8', '÷3', '+4', '×2', '10'].map((s, i) => V.rect(8 + i * 62, 60, 54, 50, i === 0 ? 'c' : i === 4 ? 'b' : 'd', (4 - i) * 0.3) + V.t(22 + i * 62, 92, s, 'small', (4 - i) * 0.3)).join('') + V.t(20, 150, '← run it backwards, undoing each step', 'small', 1.5)), say: 'Start at 10 and undo each step in reverse: ×2, +4, ÷3.' },
          { svg: V.svg(V.t(20, 80, '10 × 2 = 20 → 20 + 4 = 24', 'small', 0) + V.t(20, 130, '24 ÷ 3 = 8', 'big c-t', 1)), say: 'His number was {a:8}. Check: 8 × 3 = 24, minus 4 = 20, halved = 10 ✓.' },
        ] },
      { type: 'predict', h: 'Push it to the extreme',
        ask: '4 tests, each scored {g:out of 100}. The {g:average is 85}. What is the {f:lowest possible} score on one test?',
        options: ['40', '55', '60', '85'], answer: '40',
        svg: V.svg([100, 100, 100, 40].map((v, i) => V.rect(30 + i * 70, 150 - v * 1.2, 50, v * 1.2, i === 3 ? 'd' : 'a', i * 0.4) + V.t(40 + i * 70, 170, v, 'small', i * 0.4)).join('')),
        text: 'Total = 4 × 85 = 340. To make one score tiny, make the others as BIG as possible: 3 × 100 = 300. The last one is {a:40}.' },
    ],
    tips: [
      { name: 'Pick a zero', how: 'For "ahead/behind" clues, call one person 0 and place everyone else on a number line.', ex: 'P = 0, O = +3, L = +9' },
      { name: 'Worst case first', how: 'For "to be SURE…", imagine the unluckiest possible picks, then add one.', ex: '3 colors → 4 socks guarantee a pair' },
      { name: 'Work backwards', how: 'If you know the end result, undo each step in reverse order: × becomes ÷, + becomes −.', ex: 'end 10, undo ÷2 → 20' },
      { name: 'Add everything', how: 'When each unknown appears the same number of times in the clues, add all the clues together.', ex: 'pair sums 9, 13, 10 → total 16' },
      { name: 'Push to the extreme', how: 'For "least/greatest possible", make everything else as big (or small) as allowed.', ex: 'others all 100 → lowest one' },
    ],
    gens: [
      // Ordering clues: finish times as minutes behind the leader, revealed as relative clues.
      (lv) => {
        const n = lv === 1 ? 4 : 5, who = shuffle(NAMES).slice(0, n);
        const times = shuffle([...Array(15).keys()]).slice(0, n);
        const clues = who.slice(1).map((p, i) => {
          const ref = who[R(0, i)], d = times[i + 1] - times[who.indexOf(ref)];
          return d > 0 ? `${p} finished ${d} min behind ${ref}.` : `${p} finished ${-d} min ahead of ${ref}.`;
        });
        const order = who.slice().sort((a, b) => times[who.indexOf(a)] - times[who.indexOf(b)]);
        const k = R(2, n - 1), ans = order[k - 1];
        return { q: `${clues.join(' ')} Who finished ${root.U.ordinal(k)}?`, a: ans, wrong: who.filter((p) => p !== ans),
          steps: ['Call one runner 0 and place the rest on a number line.', `Order: ${order.join(', ')}.`, `${root.U.ordinal(k)} place: ${ans}.`] };
      },
      // Pair sums: add everything, then subtract.
      (lv) => {
        const top = lv === 1 ? 12 : 40, [A, B, C] = [R(1, top), R(1, top), R(1, top)];
        const want = pick(['A', 'B', 'C']), val = { A, B, C }[want], tot = A + B + C;
        return { q: `A + B = ${A + B}, B + C = ${B + C}, and A + C = ${A + C}. What is ${want}?`, a: val,
          wrong: [tot, 2 * tot, val + 1, { A: B + C, B: A + C, C: A + B }[want], Math.abs(val - 2)],
          steps: [`Add all three: ${2 * tot} = 2(A + B + C), so A + B + C = ${tot}.`, `${want} = ${tot} − (the pair without ${want}) = ${val}.`] };
      },
      // Pigeonhole: guarantee a match, or k of the same color.
      (lv) => {
        const colors = R(2, lv === 1 ? 3 : 5), k = lv === 1 ? 2 : R(2, 4), each = R(k + 2, 12);
        const names = ['red', 'blue', 'green', 'yellow', 'black'].slice(0, colors);
        const ans = (k - 1) * colors + 1;
        return { q: `A bag has ${each} marbles of each color: ${names.join(', ')}. Without looking, what is the fewest you must take to be sure you have ${k} of the same color?`, a: ans,
          wrong: [k * colors, k, ans - 1, each * (colors - 1) + 1, colors + k],
          steps: [`Worst case: ${k - 1} of every color first = ${(k - 1) * colors} marbles, with no color reaching ${k}.`, `The next one must make ${k} of some color: ${ans}.`] };
      },
      // Work backwards through a short machine.
      (lv) => {
        const steps = lv === 1 ? 2 : lv === 2 ? 3 : 4;
        let x = R(2, 15), v = x; const ops = [];
        for (let i = 0; i < steps; i++) {
          const kind = pick(v % 2 === 0 ? ['+', '−', '×', '÷'] : ['+', '−', '×']);
          const m = kind === '×' ? R(2, 4) : kind === '÷' ? 2 : R(2, 9);
          if (kind === '−' && v - m < 1) { ops.push(['+', m]); v += m; continue; }
          ops.push([kind, m]); v = kind === '+' ? v + m : kind === '−' ? v - m : kind === '×' ? v * m : v / m;
        }
        const say = { '+': 'adds', '−': 'subtracts', '×': 'multiplies by', '÷': 'divides by' };
        const undo = { '+': '−', '−': '+', '×': '÷', '÷': '×' };
        let fwd = v; for (const [k, m] of ops) fwd = k === '+' ? fwd + m : k === '−' ? fwd - m : k === '×' ? fwd * m : fwd / m;
        return { q: `Mia picks a number, then ${ops.map(([k, m]) => `${say[k]} ${m}`).join(', then ')}. She ends with ${v}. What number did she pick?`, a: x,
          wrong: [Number.isInteger(fwd) ? fwd : v + 1, x + 1, x - 1 || x + 3, v, x * 2],
          steps: [`Start at ${v} and undo each step in reverse: ${ops.slice().reverse().map(([k, m]) => `${undo[k]}${m}`).join(', ')}.`, `That gives ${x}.`] };
      },
      // Extremal: lowest possible score given an average and a 100-point cap.
      (lv) => {
        const n = R(3, lv === 1 ? 4 : 6), lo = R(30, 80), avg = Math.ceil((lo + (n - 1) * 100) / n);
        const low = n * avg - (n - 1) * 100;
        return { q: `On ${n} tests, each scored out of 100, Zoe's average is ${avg}. What is the lowest score she could have gotten on any one test?`, a: low,
          wrong: [avg - 15, n * avg - (n - 2) * 100 > 100 ? low + 10 : n * avg - (n - 2) * 100, avg, low + 5, 100 - avg],
          steps: [`Total points: ${n} × ${avg} = ${n * avg}.`, `Make the other ${n - 1} tests perfect: ${(n - 1) * 100}.`, `Lowest possible: ${n * avg} − ${(n - 1) * 100} = ${low}.`] };
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
