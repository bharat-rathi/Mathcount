// Concept Studio, chapter: Logic. Same clip format as studio-counting.js.
(function (root) {
  const V = root.V;
  const C = (root.CLIPS = root.CLIPS || []);
  const S = V.svg;

  // A 3 × 3 logic grid: kids down the side, sports across the top. marks[r][c] is '✓', '✗' or ''.
  const KIDS = ['Ali', 'Bo', 'Cy'], SPORTS = ['🏀', '⚽', '🎾'];
  const lgrid = (marks, d = 0) => {
    let s = SPORTS.map((sp, c) => V.t(118 + c * 60, 30, sp, 'big', d)).join('');
    KIDS.forEach((k, r) => {
      s += V.t(20, 68 + r * 38, k, 'small', d);
      SPORTS.forEach((_, c) => {
        const m = marks[r][c];
        s += V.rect(105 + c * 60, 45 + r * 38, 56, 34, m === '✓' ? 'c' : 'empty', d);
        if (m) s += V.t(124 + c * 60, 70 + r * 38, m, m === '✓' ? 'big' : 'big red-t', d + 0.3 + (r * 3 + c) * 0.1);
      });
    });
    return s;
  };

  // A chessboard, cells 18 px, with optional removed corners.
  const board = (cut, d = 0) => {
    let s = '';
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
      const gone = cut && ((r === 0 && c === 0) || (r === 7 && c === 7));
      s += gone ? V.t(18 + c * 18, 32 + r * 18, '✗', 'small red-t', d + 0.5) : V.rect(16 + c * 18, 18 + r * 18, 17, 17, (r + c) % 2 ? 'empty' : 'b', d);
    }
    return s;
  };

  C.push(
    {
      id: 'lg-cases', topic: 'logic', emoji: '🕵️', title: 'Who\'s telling the truth?',
      frames: [
        { svg: S(V.t(10, 40, 'Someone broke a vase.', 'small', 0) + V.t(10, 75, 'Ann: "Ben did it."', 'small', 0.4) + V.t(10, 105, 'Ben: "I didn\'t."', 'small', 0.7) + V.t(10, 135, 'Cara: "Ann didn\'t."', 'small', 1) + V.t(10, 170, 'Only ONE is telling the truth.', 'small b-t', 1.4), 180),
          say: 'Someone broke a vase. Ann, Ben and Cara each say something, but {g:only one of them} is telling the truth. Who did it?' },
        { svg: S(V.t(10, 30, 'if … did it:', 'tiny', 0) + ['Ann', 'Ben', 'Cara'].map((k, i) => V.t(95 + i * 50, 30, k, 'tiny', 0)).join('') + [['Ann', ['✗', '✓', '✗'], '1 true: fits'], ['Ben', ['✓', '✗', '✓'], '2 true: no'], ['Cara', ['✗', '✓', '✓'], '2 true: no']].map(([who, row, res], r) => V.t(10, 70 + r * 40, who, 'small', 0.4 + r * 0.6) + row.map((m, c) => V.t(100 + c * 50, 70 + r * 40, m, m === '✓' ? 'small c-t' : 'small red-t', 0.5 + r * 0.6)).join('') + V.t(250, 70 + r * 40, res, res.endsWith('fits') ? 'tiny c-t' : 'tiny red-t', 0.8 + r * 0.6)).join(''), 180),
          say: 'Try {g:each case}. If Ann did it, only Ben\'s statement is true: exactly 1 ✓. Ben or Cara would make 2 true statements ✗.' },
        { svg: S(V.t(90, 95, 'Ann did it!', 'big c-t', 0)),
          say: 'Only one case fits every clue, so {a:Ann did it}. When you\'re stuck, {g:test every case} and cross out the ones that break a rule.' },
      ],
      check: { q: 'Dan says: "Eve is lying." Eve says: "We are both telling the truth." Who is telling the truth?', options: ['Dan only', 'Eve only', 'Both', 'Neither'], answer: 'Dan only', why: 'If Eve were truthful, Dan would be too, but Dan says Eve lies: impossible. So Eve lies, which makes Dan\'s statement true.' },
      remember: 'Logic puzzle? Test each case and cross out the ones that break a clue.',
    },
    {
      id: 'lg-grid', topic: 'logic', emoji: '🔲', title: 'The logic grid',
      frames: [
        { svg: S(lgrid([['', '', ''], ['', '', ''], ['', '', '']]) + V.t(10, 182, 'Each kid plays a different sport.', 'tiny', 0.5), 190),
          say: 'Ali, Bo and Cy each play a {g:different} sport: basketball, soccer or tennis. Make a grid of every kid and sport.' },
        { svg: S(lgrid([['', '✗', '✗'], ['', '', '✗'], ['', '', '']]) + V.t(10, 182, 'Ali: not ⚽, not 🎾.  Bo: not 🎾.', 'tiny', 0.2), 190),
          say: 'Clues: "Ali doesn\'t play soccer or tennis." "Bo doesn\'t play tennis." Put an {g:✗} for every "not".' },
        { svg: S(lgrid([['✓', '✗', '✗'], ['✗', '✓', '✗'], ['✗', '✗', '✓']]), 190),
          say: 'Ali\'s row has one gap left: {a:basketball} ✓. That rules out basketball for the others, so Bo gets {a:soccer} and Cy gets {a:tennis}.' },
      ],
      check: { q: 'Three friends own a cat, a dog and a fish (one each). Mia doesn\'t own the dog. Leo owns the fish. Who owns the dog?', options: ['Mia', 'Leo', 'Zoe', 'Nobody'], answer: 'Zoe', why: 'Leo has the fish, and Mia doesn\'t have the dog, so the dog is Zoe\'s.' },
      remember: 'Logic grid: ✗ every "not", then look for a row or column with only one gap.',
    },
    {
      id: 'lg-pigeon', topic: 'logic', emoji: '🐦', title: 'The pigeonhole principle',
      frames: [
        { svg: S(['d', 'b', 'c'].map((cl, i) => V.rect(30 + i * 95, 90, 75, 60, 'empty', i * 0.2) + V.circ(67 + i * 95, 75, 12, cl, i * 0.2)).join('') + V.t(30, 30, 'red, purple, green socks', 'small', 0.6)),
          say: 'A dark drawer has {g:red, purple and green} socks. How many must you grab to be {f:sure} of a matching pair?' },
        { svg: S(['d', 'b', 'c'].map((cl, i) => V.rect(30 + i * 95, 90, 75, 60, 'empty') + V.circ(67 + i * 95, 120, 14, cl, 0.3 + i * 0.4)).join('') + V.t(30, 40, 'Unlucky: 3 socks, all different', 'small', 1.4)),
          say: 'Picture the {g:unluckiest} grabs: 3 socks could all be different colors, one in each box.' },
        { svg: S(['d', 'b', 'c'].map((cl, i) => V.rect(30 + i * 95, 90, 75, 60, 'empty') + V.circ(67 + i * 95, 120, 14, cl)).join('') + V.circ(82, 105, 14, 'd', 0.5) + V.t(30, 40, '4th sock must land in a full box', 'small', 0.8) + V.t(110, 178, '4 socks', 'big c-t', 1.4), 190),
          say: 'The {g:4th} sock has nowhere new to go: it must match one. So {a:4} socks guarantee a pair. More pigeons than holes → two share a hole.' },
      ],
      check: { q: 'A drawer has red, blue, green and yellow socks. How many must you grab (without looking) to be sure of a matching pair?', options: ['2', '4', '5', '8'], answer: '5', why: 'The worst luck is 4 different colors; the 5th sock must match one.' },
      remember: 'More pigeons than holes → some hole gets two. "Be sure" means plan for the worst luck.',
    },
    {
      id: 'lg-worst', topic: 'logic', emoji: '😈', title: '"Guarantee" means worst case',
      frames: [
        { svg: S(V.t(20, 50, 'Bag: 5 red, 5 blue', 'big', 0) + V.t(20, 110, 'How many to be SURE', 'small', 0.6) + V.t(20, 135, 'of getting 2 red?', 'small', 0.6)),
          say: 'A bag has {g:5 red} and {g:5 blue} marbles. How many must you pull out to be {f:sure} of getting 2 red?' },
        { svg: S([0, 1, 2, 3, 4].map((i) => V.circ(40 + i * 40, 80, 15, 'b', i * 0.3)).join('') + V.t(20, 140, 'Worst luck: all 5 blues first', 'small', 1.6)),
          say: 'Imagine the {g:worst luck}: a sneaky opponent hands you {g:all 5 blues} first.' },
        { svg: S([0, 1, 2, 3, 4].map((i) => V.circ(40 + i * 40, 80, 15, 'b')).join('') + [0, 1].map((i) => V.circ(240 + i * 40, 80, 15, 'd', 0.4 + i * 0.3)).join('') + V.t(20, 140, '5 + 2 = 7', 'big c-t', 1.2)),
          say: 'After that, every marble is red. You need 2 more: 5 + 2 = {a:7} marbles.' },
      ],
      check: { q: 'A bag has 4 red and 6 blue marbles. How many must you take to be sure of getting 3 blue?', options: ['3', '5', '7', '9'], answer: '7', why: 'Worst case: all 4 reds first, then 3 blues: 4 + 3 = 7.' },
      remember: '"Be sure" / "guarantee" → count the worst luck first, then add what you need.',
    },
    {
      id: 'lg-color', topic: 'logic', emoji: '♟️', title: 'Color it to prove it',
      frames: [
        { svg: S(board(false) + V.t(170, 70, 'Cover with', 'small', 0.6) + V.t(170, 95, 'dominoes ▭?', 'small', 0.6), 175),
          say: 'Each domino covers {g:2 squares} side by side. A chessboard is easy to cover.' },
        { svg: S(board(true) + V.t(170, 70, '2 corners cut:', 'small', 0.3) + V.t(170, 95, 'can you still', 'small', 0.3) + V.t(170, 120, 'cover it?', 'small', 0.3), 175),
          say: 'Now cut off {g:two opposite corners}. Can 31 dominoes still cover the 62 squares that are left?' },
        { svg: S(board(true) + V.t(170, 60, 'each domino:', 'tiny', 0.2) + V.t(170, 80, '1 purple + 1 white', 'tiny', 0.3) + V.t(170, 115, 'left: 30 purple', 'tiny b-t', 0.6) + V.t(170, 135, '         32 white', 'tiny', 0.7) + V.t(170, 165, 'impossible!', 'small red-t', 1.2), 175),
          say: 'Every domino covers {g:one purple and one white}. Both cut corners were purple, leaving 30 purple and 32 white. They can\'t pair up, so it\'s {a:impossible}!' },
      ],
      check: { q: 'Can a 3 × 3 board be completely covered by dominoes (each covering 2 squares)?', options: ['Yes, with 4 dominoes', 'Yes, with 5 dominoes', 'No: 9 squares is odd', 'No: the board is too small'], answer: 'No: 9 squares is odd', why: 'Each domino covers 2 squares, so the total covered is always even. 9 is odd.' },
      remember: 'Stuck proving "impossible"? Try coloring or odd/even counting.',
    },
  );
})(typeof window !== 'undefined' ? window : globalThis);
