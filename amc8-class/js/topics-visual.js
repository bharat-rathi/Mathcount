// Visual chapters: similar triangles & area ratios, spatial reasoning, and reading graphs.
// About 9% of AMC 8 problems (2018–2026). Similar-triangle problems all sat in the hard band.
// Questions here can carry a picture (`svg`), drawn above the answer choices.
(function (root) {
  const { R, pick, shuffle, frac } = root.U;
  const V = root.V;
  const T = (root.TOPICS = root.TOPICS || []);

  // Bar chart with a labelled y-axis. Values are read from gridlines, not printed on bars.
  function bars(vals, labels, step = 2, title = '') {
    const top = Math.ceil(Math.max(...vals) / step) * step + step, h = 120, y0 = 150, x0 = 46;
    const w = (300 - x0) / vals.length, y = (v) => y0 - (v / top) * h;
    let s = '';
    for (let g = 0; g <= top; g += step) s += `<line x1="${x0}" y1="${y(g)}" x2="310" y2="${y(g)}" class="grid"/><text x="${x0 - 6}" y="${y(g) + 4}" class="tiny" text-anchor="end">${g}</text>`;
    vals.forEach((v, i) => { s += `<rect x="${x0 + i * w + 6}" y="${y(v)}" width="${w - 12}" height="${y0 - y(v)}" rx="2" class="a"/><text x="${x0 + i * w + w / 2}" y="${y0 + 16}" class="tiny" text-anchor="middle">${labels[i]}</text>`; });
    if (title) s += `<text x="${x0}" y="14" class="tiny">${title}</text>`;
    return `<svg viewBox="0 0 320 172" class="viz chart" role="img">${s}</svg>`;
  }
  // Distance–time line graph through integer points.
  function lineGraph(pts, xLab = 'hours', yLab = 'miles') {
    const xm = Math.max(...pts.map((p) => p[0])), ym = Math.max(...pts.map((p) => p[1]));
    const X = (x) => 40 + (x / xm) * 260, Y = (v) => 150 - (v / ym) * 125;
    let s = `<line x1="40" y1="150" x2="305" y2="150" class="axis"/><line x1="40" y1="20" x2="40" y2="150" class="axis"/>`;
    for (let x = 0; x <= xm; x++) s += `<text x="${X(x)}" y="166" class="tiny" text-anchor="middle">${x}</text>`;
    const ys = [...new Set(pts.map((p) => p[1]))].sort((a, b) => a - b);
    ys.forEach((v) => { s += `<line x1="40" y1="${Y(v)}" x2="305" y2="${Y(v)}" class="grid"/><text x="34" y="${Y(v) + 4}" class="tiny" text-anchor="end">${v}</text>`; });
    s += `<polyline points="${pts.map(([x, v]) => `${X(x)},${Y(v)}`).join(' ')}" class="plot"/>`;
    pts.forEach(([x, v]) => { s += `<circle cx="${X(x)}" cy="${Y(v)}" r="4" class="b"/>`; });
    s += `<text x="300" y="144" class="tiny" text-anchor="end">${xLab}</text><text x="44" y="16" class="tiny">${yLab}</text>`;
    return `<svg viewBox="0 0 320 172" class="viz chart" role="img">${s}</svg>`;
  }
  // A cross-shaped cube net: row A B C D, with E above B and F below B.
  const NET = { A: [0, 1], B: [1, 1], C: [2, 1], D: [3, 1], E: [1, 0], F: [1, 2] };
  const OPP = { A: 'C', C: 'A', B: 'D', D: 'B', E: 'F', F: 'E' };
  function netSvg(lab) {
    return `<svg viewBox="0 0 320 172" class="viz chart" role="img">${Object.entries(NET).map(([k, [c, r]]) =>
      `<rect x="${60 + c * 52}" y="${10 + r * 52}" width="50" height="50" class="${k === 'B' ? 'b' : 'c'}"/><text x="${85 + c * 52}" y="${42 + r * 52}" class="big" text-anchor="middle">${lab[k]}</text>`).join('')}</svg>`;
  }

  T.push({
    id: 'similar', name: 'Similar Triangles & Area Ratios', emoji: '🔺', color: '#d9480f',
    slides: [
      { type: 'predict', h: 'Double the size',
        ask: 'A triangle\'s sides are all {g:doubled}. Its area is multiplied by…',
        options: ['2', '3', '4', '8'], answer: '4',
        svg: V.svg(V.poly('40,150 100,150 70,110', 'a', 0) + V.poly('160,150 280,150 220,70', 'b', 0.8) + ['160,150 220,150 190,110', '220,150 280,150 250,110', '190,110 250,110 220,70', '190,110 250,110 220,150'].map((pts, i) => V.poly(pts, 'empty op', 1.6 + i * 0.3)).join('') + V.t(170, 172, '4 copies fit inside!', 'small', 2.8)),
        text: 'Lengths × {g:2} → areas × {g:2²} = {a:4}. Four copies of the small triangle tile the big one. Lengths × k always means areas × k².' },
      { type: 'steps', h: 'The shadow trick',
        problem: 'A {g:6 ft} player casts a {g:4 ft} shadow. At the same time the hoop pole casts a {g:8 ft} shadow. How {f:tall is the pole}?',
        steps: [
          { svg: V.svg(V.poly('40,150 40,90 100,150', 'a', 0) + V.t(16, 125, '6', 'small', 0.3) + V.t(62, 168, '4', 'small', 0.3) + V.poly('170,150 170,30 290,150', 'b', 0.8) + V.t(150, 95, '?', 'big', 1) + V.t(222, 168, '8', 'small', 1)), say: 'The sun hits both at the same angle, so the two triangles are {g:similar} (same shape).' },
          { svg: V.svg(V.t(20, 80, 'shadow 4 → 8: ×2', 'big', 0) + V.t(20, 140, 'height 6 → 12', 'big c-t', 0.8)), say: 'The shadow doubled, so the height doubles too: the pole is {a:12 ft}.' },
        ] },
      { type: 'predict', h: 'Cut off the top',
        ask: 'A line {g:parallel to the base} cuts a triangle halfway up its height. What fraction of the area is the {f:small top triangle}?',
        options: ['1/2', '1/3', '1/4', '1/8'], answer: '1/4',
        svg: V.svg(V.poly('30,160 290,160 160,20', 'b', 0) + V.poly('95,90 225,90 160,20', 'a', 0.8) + V.line(95, 90, 225, 90, 'red', 0.8)),
        text: 'The top triangle is similar with sides × {g:1/2}, so its area is × {g:(1/2)²} = {a:1/4}. The trapezoid below is the other 3/4.' },
    ],
    tips: [
      { name: 'Square the scale', how: 'If lengths scale by k, areas scale by k² (and volumes by k³).', ex: 'sides ×3 → area ×9' },
      { name: 'Hunt for parallel lines', how: 'A line parallel to a side of a triangle cuts off a smaller similar triangle. Look for it!', ex: 'halfway up → 1/4 of the area' },
      { name: 'Same angles, same shape', how: 'Two triangles with matching angles are similar: match up the sides in order and set up the ratio.', ex: 'shadows: 6/4 = h/8' },
    ],
    gens: [
      (lv) => { const n = pick([2, 3, 4, 5]), k = R(1, n - 1), unit = R(1, 4) * (lv === 1 ? 1 : 2); const big = n * n * unit, small = k * k * unit; const askTrap = lv > 1 && Math.random() < 0.6; return { q: `A triangle has area ${big}. A line parallel to its base cuts off a small triangle at the top whose height is ${frac(k, n)} of the whole height. What is the area of the ${askTrap ? 'trapezoid below the line' : 'small triangle'}?`, a: askTrap ? big - small : small, wrong: askTrap ? [big - (big * k) / n, small, big / 2, big - small + unit] : [(big * k) / n, big - small, small * 2, small + unit], steps: [`Lengths scale by ${frac(k, n)}, so areas scale by ${frac(k * k, n * n)}.`, `Small triangle: ${big} × ${frac(k * k, n * n)} = ${small}.${askTrap ? ` Trapezoid: ${big} − ${small} = ${big - small}.` : ''}`] }; },
      (lv) => { const [a, b] = pick([[2, 3], [3, 4], [3, 5], [2, 5], [4, 5]]), u = R(1, 3); const A = a * a * u * (lv === 1 ? 1 : 2); return { q: `Two similar triangles have sides in the ratio ${a} : ${b}. The smaller one has area ${A}. What is the area of the larger one?`, a: (A * b * b) / (a * a), wrong: [(A * b) / a, A + b - a, (A * b * b * b) / (a * a * a), (A * b * b) / (a * a) - A], steps: [`Area ratio = ${a}² : ${b}² = ${a * a} : ${b * b}.`, `${A} × ${b * b}/${a * a} = ${(A * b * b) / (a * a)}.`] }; },
      (lv) => { const h = R(4, 7), s = R(2, 5), k = R(2, 4 + lv); return { q: `A ${h}-foot player casts a ${s}-foot shadow. At the same moment, a flagpole casts a ${s * k}-foot shadow. How tall is the flagpole, in feet?`, a: h * k, wrong: [h + s * k - s, s * k, h * k + k, (s * k * s) / h | 0], steps: [`The shadow is ${k} times as long, so the pole is ${k} times as tall.`, `${h} × ${k} = ${h * k} feet.`] }; },
      (lv) => { const A = R(2, 10) * 4 * (lv > 1 ? 2 : 1); return { q: `The midpoints of the three sides of a triangle with area ${A} are joined to make a smaller triangle. What is the area of the smaller triangle?`, a: A / 4, wrong: [A / 2, A / 3, (3 * A) / 4, A / 8], steps: ['Joining midpoints splits the triangle into 4 identical triangles.', `${A} ÷ 4 = ${A / 4}.`] }; },
    ],
  });

  T.push({
    id: 'spatial', name: 'Spatial Reasoning', emoji: '🧊', color: '#1c7ed6',
    slides: [
      { type: 'predict', h: 'Fold the net',
        ask: 'This net folds into a cube. Which face ends up {f:opposite} the {g:blue} face?',
        options: ['A', 'C', 'E', 'D'], answer: 'D',
        svg: netSvg({ A: 'A', B: '★', C: 'C', D: 'D', E: 'E', F: 'F' }),
        text: 'In a row of squares, faces {g:two apart} become opposites. The ★ face and {a:D} are two apart in the long row, so they end up opposite. Same for A and C, and for E and F.' },
      { type: 'steps', h: 'Cubes you can see',
        problem: 'A {g:4 × 4 × 4} cube is built from small cubes. From one corner you can see three faces. How many small cubes {f:can you see}?',
        steps: [
          { svg: V.svg(V.t(20, 80, 'all cubes: 4³ = 64', 'big', 0)), say: 'Count all the cubes first.' },
          { svg: V.svg(V.t(20, 80, 'hidden: 3³ = 27', 'big', 0) + V.t(20, 130, 'the 3 × 3 × 3 block in the back', 'small', 0.6)), say: 'The cubes you {g:cannot} see form a 3 × 3 × 3 block tucked in the back corner.' },
          { svg: V.svg(V.t(20, 100, '64 − 27 = 37', 'big c-t', 0)), say: 'Visible: {a:37}. (Counting face by face, 16 + 16 + 16, would count the edges twice!)' },
        ] },
      { type: 'predict', h: 'Fold and cut',
        ask: 'A paper strip is folded in half {g:3 times}, then cut once straight across the middle. How many {f:pieces}?',
        options: ['4', '6', '8', '9'], answer: '9',
        svg: V.svg([1, 2, 3].map((k) => V.t(20, 40 + k * 35, `${k} fold${k > 1 ? 's' : ''} → ${2 ** k + 1} pieces`, 'small', k * 0.6)).join('') + V.t(20, 168, 'pattern: 2ⁿ + 1', 'small c-t', 2.5)),
        text: '3 folds make {g:8 layers}. One cut makes 8 cuts in the strip, and 8 cuts make {a:9} pieces. Try it with real paper!' },
    ],
    tips: [
      { name: 'Two apart = opposite', how: 'In a straight row of squares on a cube net, squares two apart end up on opposite faces.', ex: 'A B C D → A/C and B/D' },
      { name: 'Count the hidden part', how: 'For "how many can you see", count all, then subtract the hidden block.', ex: 'n³ − (n−1)³' },
      { name: 'Act it out', how: 'For folding and cutting, try a smaller case (1 fold, 2 folds) and find the pattern.', ex: '3, 5, 9 pieces' },
    ],
    gens: [
      (lv) => { const labs = shuffle(['1', '2', '3', '4', '5', '6']); const lab = Object.fromEntries(Object.keys(NET).map((k, i) => [k, labs[i]])); const face = pick(Object.keys(NET)); return { q: `The net below folds into a cube. Which number ends up on the face opposite ${lab[face]}?`, svg: netSvg(lab), a: lab[OPP[face]], wrong: labs.filter((x) => x !== lab[OPP[face]] && x !== lab[face]), steps: ['In the row of four, squares two apart are opposite. The squares above and below the row are opposite each other.', `Opposite ${lab[face]} is ${lab[OPP[face]]}.`] }; },
      (lv) => { const n = R(3, 4 + 2 * lv); return { q: `A ${n} × ${n} × ${n} cube is made of small cubes. Standing at one corner, you can see three faces of the big cube. How many small cubes can you see?`, a: n ** 3 - (n - 1) ** 3, wrong: [3 * n * n, 3 * n * n - 3 * n, n ** 3 - (n - 2) ** 3, 3 * n * n - 3 * n + 2], steps: [`All: ${n}³ = ${n ** 3}. Hidden: the ${n - 1} × ${n - 1} × ${n - 1} block = ${(n - 1) ** 3}.`, `Visible: ${n ** 3 - (n - 1) ** 3}.`] }; },
      (lv) => { const k = R(1, 2 + lv); return { q: `A paper strip is folded in half ${k} time${k > 1 ? 's' : ''} (each fold doubles the layers), then cut once straight across. How many pieces are there?`, a: 2 ** k + 1, wrong: [2 ** k, 2 * k + 1, 2 ** (k + 1), k + 2], steps: [`${k} folds make ${2 ** k} layers, so the cut makes ${2 ** k} cuts in the strip.`, `${2 ** k} cuts → ${2 ** k + 1} pieces.`] }; },
      (lv) => { const n = pick([3, 4, 5, 6, 8, 10, 12]); const shape = { 3: 'equilateral triangle', 4: 'square', 5: 'regular pentagon', 6: 'regular hexagon', 8: 'regular octagon', 10: 'regular decagon', 12: 'regular 12-gon' }[n]; return { q: `How many lines of symmetry does a ${shape} have?`, a: n, wrong: [n / 2, 2 * n, n - 1, n + 2].map((v) => Math.round(v)), steps: [`A regular polygon with ${n} sides has ${n} lines of symmetry.`, `${n % 2 ? 'Each one goes from a corner to the middle of the opposite side.' : 'Half go corner to corner, half go side-middle to side-middle.'}`] }; },
    ],
  });

  T.push({
    id: 'graphs', name: 'Reading Graphs & Charts', emoji: '📈', color: '#5f3dc4',
    slides: [
      { type: 'predict', h: 'Read the chart',
        ask: 'Points scored each game are shown. What was the {f:total} for the week?',
        options: ['24', '26', '28', '30'], answer: '28',
        svg: bars([6, 4, 8, 10], ['Mon', 'Tue', 'Wed', 'Thu'], 2, 'points'),
        text: 'Read each bar against the gridlines: 6 + 4 + 8 + 10 = {a:28}. Always check the {g:scale} on the side first.' },
      { type: 'steps', h: 'Speed from a line graph',
        problem: 'The graph shows a bike ride. What was the {f:average speed} for the whole ride?',
        steps: [
          { svg: lineGraph([[0, 0], [1, 12], [2, 12], [3, 24]]), say: 'Distance goes up the side, time along the bottom.' },
          { svg: lineGraph([[0, 0], [1, 12], [2, 12], [3, 24]]), say: 'The flat part (hour 1 to 2) is a {g:rest stop}: time passes, distance stays the same.' },
          { svg: V.svg(V.t(20, 80, '24 miles ÷ 3 hours', 'big', 0) + V.t(20, 140, '= 8 mph', 'big c-t', 0.8)), say: 'Average speed = total distance ÷ total time, rest included: {a:8 mph}.' },
        ] },
      { type: 'predict', h: 'Watch the scale!',
        ask: 'In this chart, the Lakeside bar looks about twice as tall as the Hilltop bar. Does Lakeside really have twice as many fans?',
        options: ['Yes', 'No'], answer: 'No',
        svg: `<svg viewBox="0 0 320 172" class="viz chart" role="img"><line x1="50" y1="150" x2="300" y2="150" class="grid"/><line x1="50" y1="30" x2="300" y2="30" class="grid"/><line x1="50" y1="90" x2="300" y2="90" class="grid"/><text x="44" y="154" class="tiny" text-anchor="end">90</text><text x="44" y="94" class="tiny" text-anchor="end">95</text><text x="44" y="34" class="tiny" text-anchor="end">100</text><rect x="80" y="90" width="70" height="60" class="a"/><rect x="190" y="30" width="70" height="120" class="b"/><text x="115" y="166" class="tiny" text-anchor="middle">Hilltop</text><text x="225" y="166" class="tiny" text-anchor="middle">Lakeside</text></svg>`,
        text: 'The scale starts at {g:90}, not 0! Hilltop has 95 and Lakeside 100: only about 5% more. AMC charts love this trap.' },
    ],
    tips: [
      { name: 'Scale first', how: 'Before reading any bar, check what each gridline is worth and where the axis starts.', ex: 'gridlines every 2, starting at 0' },
      { name: 'Flat means stopped', how: 'On a distance–time graph, steeper = faster, and flat = not moving.', ex: 'a flat part is a rest stop' },
      { name: 'Total ÷ total', how: 'Average speed is total distance ÷ total time, including stops.', ex: '24 miles ÷ 3 h = 8 mph' },
    ],
    // Bike speed v is a multiple of t, so the average (t − 1)·v ÷ t is a whole number.
    gens: [
      (lv) => { const n = lv === 1 ? 4 : 5, step = pick([1, 2, 5]), vals = [...Array(n)].map(() => step * R(1, 8)); const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].slice(0, n); const kind = pick(lv === 1 ? ['total', 'range'] : ['mean', 'range', 'total']); const tot = vals.reduce((a, b) => a + b, 0); let a, ask, steps; if (kind === 'total') { a = tot; ask = 'What is the total number of points over all the games?'; steps = [`Read each bar: ${vals.join(', ')}.`, `Total: ${tot}.`]; } else if (kind === 'range') { a = Math.max(...vals) - Math.min(...vals); ask = 'How many more points were scored in the best game than in the worst game?'; steps = [`Highest bar ${Math.max(...vals)}, lowest ${Math.min(...vals)}.`, `Difference: ${a}.`]; } else { let fix = 0; while ((tot + fix) % n) fix += step; vals[0] += fix; const t2 = tot + fix; a = t2 / n; ask = 'What is the mean (average) number of points per game?'; steps = [`Read each bar: ${vals.join(', ')}, total ${t2}.`, `${t2} ÷ ${n} = ${a}.`]; } const T2 = vals.reduce((x, y) => x + y, 0); return { q: `The bar chart shows points scored in each game. ${ask}`, svg: bars(vals, labels, step, 'points'), a, wrong: [a + step, a - step > 0 ? a - step : a + 3 * step, Math.max(...vals), T2 === a ? a + 2 * step : T2, Math.min(...vals)], steps }; },
      (lv) => { const t = lv === 1 ? 3 : 4, rest = R(1, t - 2), v = t * R(2, 4); const pts = [[0, 0]]; let d = 0; for (let h = 1; h <= t; h++) { if (h !== rest + 1) d += v; pts.push([h, d]); } const avg = d / t; return { q: 'The graph shows a bike ride. What was the average speed for the whole ride, in miles per hour?', svg: lineGraph(pts), a: Number.isInteger(avg) ? avg : `${frac(d, t)}`, wrong: [v, d, d / (t - 1), v / 2, v * 2].map((x) => (Number.isInteger(x) ? x : frac(Math.round(x * t), t))), steps: [`Total distance ${d} miles in ${t} hours (one hour was a rest stop).`, `Average speed: ${d} ÷ ${t} = ${Number.isInteger(avg) ? avg : frac(d, t)} mph.`] }; },
      (lv) => { const vals = [...Array(5)].map(() => R(1, 9)); const tot = vals.reduce((a, b) => a + b, 0), i = R(0, 4); const labels = ['A', 'B', 'C', 'D', 'E']; const pct = (100 * vals[i]) / tot; return Number.isInteger(pct) ? { q: `The chart shows votes for five team names. What percent of all the votes did name ${labels[i]} get?`, svg: bars(vals, labels, 1, 'votes'), a: `${pct}%`, wrong: [`${vals[i]}%`, `${Math.round(100 / 5)}%` === `${pct}%` ? `${pct + 5}%` : `${Math.round(100 / 5)}%`, `${Math.round((100 * vals[i]) / (tot - vals[i]))}%`, `${pct + 10}%`, `${Math.max(1, pct - 10)}%`], steps: [`Total votes: ${tot}. Name ${labels[i]}: ${vals[i]}.`, `${vals[i]}/${tot} = ${pct}%.`] } : { q: `The chart shows votes for five team names. How many votes were cast in all?`, svg: bars(vals, labels, 1, 'votes'), a: tot, wrong: [tot + 1, tot - 1, tot + 2, Math.max(...vals) * 5], steps: [`Read each bar: ${vals.join(' + ')}.`, `Total ${tot}.`] }; },
      (lv) => { const vals = [...Array(lv === 1 ? 5 : 6)].map(() => R(1, 9)); const sorted = vals.slice().sort((a, b) => a - b), n = vals.length; const med = n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2; const labels = ['G1', 'G2', 'G3', 'G4', 'G5', 'G6'].slice(0, n); return { q: 'The chart shows rebounds in each game. What is the median number of rebounds?', svg: bars(vals, labels, 1, 'rebounds'), a: med, wrong: [vals[Math.floor(n / 2)], Math.round(vals.reduce((a, b) => a + b, 0) / n), sorted[n - 1], sorted[0] + 1, med + 1], steps: [`Read and sort: ${sorted.join(', ')}.`, `Middle ${n % 2 ? 'value' : 'two averaged'}: ${med}.`] }; },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
