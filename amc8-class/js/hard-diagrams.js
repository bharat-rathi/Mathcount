// Clutch problems with diagrams, AMC 8 #16–25 level. All original. Answers were checked by
// brute force or by computing coordinates when written. Appended to HARD.problems from hard.js.
(function (root) {
  const D = (inner) => `<svg viewBox="0 0 320 180" class="viz chart" role="img">${inner}</svg>`;
  const t = (x, y, s, cls = 'small', anchor = 'middle') => `<text x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}">${s}</text>`;
  const rect = (x, y, w, h, cls = 'empty') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" class="${cls}"/>`;
  const poly = (pts, cls = 'a') => `<polygon points="${pts}" class="${cls}"/>`;
  const line = (x1, y1, x2, y2, cls = '') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}"/>`;
  const circ = (cx, cy, r, cls = 'empty') => `<circle cx="${cx}" cy="${cy}" r="${r}" class="${cls}"/>`;
  const grid = (x0, y0, cols, rows, s, cls = 'empty') => { let o = ''; for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) o += rect(x0 + i * s, y0 + j * s, s, s, cls); return o; };
  // Pie chart from [label, percent] parts.
  const pie = (parts, cx = 110, cy = 90, r = 75) => {
    let a0 = -Math.PI / 2, o = '';
    parts.forEach(([lab, p], i) => {
      const a1 = a0 + (p / 100) * 2 * Math.PI, big = p > 50 ? 1 : 0;
      const [x0, y0, x1, y1] = [cx + r * Math.cos(a0), cy + r * Math.sin(a0), cx + r * Math.cos(a1), cy + r * Math.sin(a1)];
      const m = (a0 + a1) / 2;
      o += `<path d="M${cx},${cy} L${x0.toFixed(1)},${y0.toFixed(1)} A${r},${r} 0 ${big} 1 ${x1.toFixed(1)},${y1.toFixed(1)} Z" class="${['a', 'b', 'c', 'd'][i % 4]}"/>`;
      o += t(cx + r * 0.6 * Math.cos(m), cy + r * 0.6 * Math.sin(m) + 5, `${p}%`, 'tiny');
      o += rect(210, 30 + i * 30, 16, 16, ['a', 'b', 'c', 'd'][i % 4]) + t(234, 43 + i * 30, lab, 'tiny', 'start');
      a0 = a1;
    });
    return o;
  };
  // Clock face with hour and minute hands.
  const clock = (h, m) => {
    const ha = ((h % 12) * 30 + m / 2 - 90) * Math.PI / 180, ma = (m * 6 - 90) * Math.PI / 180;
    let o = circ(160, 90, 75);
    for (let k = 1; k <= 12; k++) { const a = (k * 30 - 90) * Math.PI / 180; o += t(160 + 62 * Math.cos(a), 95 + 62 * Math.sin(a), k, 'tiny'); }
    o += line(160, 90, 160 + 38 * Math.cos(ha), 90 + 38 * Math.sin(ha), 'thick') + line(160, 90, 160 + 55 * Math.cos(ma), 90 + 55 * Math.sin(ma)) + circ(160, 90, 4, 'b');
    return o;
  };

  const P = [
    // ── Area & geometry
    { id: 'd01', topic: 'area', q: 'Square ABCD has side length 8. Point P is anywhere on the top side DC. What is the area of the shaded triangle ABP?', choices: ['16', '24', '32', '40', '48'], a: '32',
      svg: D(rect(80, 10, 160, 160) + poly('80,170 240,170 200,10', 'a') + t(70, 178, 'A') + t(250, 178, 'B') + t(250, 12, 'C') + t(70, 12, 'D') + t(212, 24, 'P', 'tiny') + t(160, 166, '8', 'tiny')),
      hints: ['Does it matter where P is on the top side?', 'The base is AB = 8, and the height is always the side of the square.'],
      steps: ['Base AB = 8. P is on the top side, so the height is always 8.', 'Area = ½ × 8 × 8 = 32, wherever P is.'], key: 'Same base, same height, same area' },
    { id: 'd02', topic: 'area', q: 'A 4 × 4 square has one corner at the exact center of a 6 × 6 square, with sides parallel as shown. What is the total area covered by the two squares?', choices: ['40', '43', '46', '49', '52'], a: '43',
      svg: D(rect(60, 30, 120, 120, 'a op') + rect(120, 90, 80, 80, 'b op') + rect(120, 90, 60, 60, 'd') + t(120, 24, '6', 'tiny') + t(206, 132, '4', 'tiny', 'start')),
      hints: ['Add the two areas, then subtract the overlap (counted twice).', 'The overlap is a 3 × 3 square.'],
      steps: ['The overlap runs from the center of the big square to its corner: 3 × 3 = 9.', '36 + 16 − 9 = 43.'], key: 'Add both, subtract the overlap' },
    { id: 'd03', topic: 'circles', q: 'A right triangle with legs 6 and 8 has all three corners on a circle. What is the area of the shaded part of the circle outside the triangle?', choices: ['25π − 24', '25π − 48', '100π − 24', '16π − 24', '50π − 24'], a: '25π − 24',
      svg: D(circ(160, 90, 75, 'b') + poly('85,90 235,90 139,18', 'empty') + t(102, 50, '6', 'tiny') + t(196, 50, '8', 'tiny')),
      hints: ['When a right triangle sits in a circle, its hypotenuse is a diameter.', 'Hypotenuse = 10, so the radius is 5.'],
      steps: ['Hypotenuse √(36 + 64) = 10 is a diameter, so r = 5 and the circle has area 25π.', 'Triangle area: ½ × 6 × 8 = 24. Shaded: 25π − 24.'], key: 'Hypotenuse = diameter' },
    { id: 'd04', topic: 'circles', q: 'A quarter circle of radius 6 is drawn inside a 6 × 6 square, centered at one corner. What is the area of the shaded region outside the quarter circle?', choices: ['36 − 9π', '36 − 6π', '36 − 36π', '9π − 18', '36 − 3π'], a: '36 − 9π',
      svg: D(rect(100, 20, 140, 140, 'b') + '<path d="M100,160 L240,160 A140,140 0 0 0 100,20 Z" class="empty"/>' + t(170, 175, '6', 'tiny')),
      hints: ['Square area minus quarter-circle area.', 'A quarter of π × 6².'],
      steps: ['Quarter circle: ¼ × π × 36 = 9π.', 'Shaded: 36 − 9π.'], key: 'Shaded = big minus pieces' },
    { id: 'd05', topic: 'circles', q: 'Semicircles are drawn outward on the two legs (6 and 8) of a right triangle. What is the total area of the two semicircles?', choices: ['7π', '12π', '25π/2', '25π', '50π'], a: '25π/2',
      svg: D(poly('120,30 120,102 216,102', 'empty') + '<path d="M120,30 A36,36 0 0 0 120,102 Z" class="a"/>' + '<path d="M120,102 A48,48 0 0 0 216,102 Z" class="b"/>' + t(130, 70, '6', 'tiny') + t(168, 96, '8', 'tiny')),
      hints: ['Semicircle area = ½ π r², where r is half the leg.', 'Radii 3 and 4.'],
      steps: ['½π(3²) + ½π(4²) = 9π/2 + 8π.', '= 25π/2. (It equals the semicircle on the hypotenuse, a Pythagoras surprise!)'], key: 'Lengths ×k → areas ×k²' },
    { id: 'd06', topic: 'coords', q: 'The dots are 1 unit apart. What is the area of the shaded pentagon?', choices: ['11', '12', '13', '14', '16'], a: '13',
      svg: D((() => { let o = ''; for (let x = 0; x <= 4; x++) for (let y = 0; y <= 4; y++) o += circ(90 + 30 * x, 160 - 30 * y, 2.5, 'b'); return poly('90,160 210,160 210,100 150,40 90,70', 'a op') + o; })()),
      hints: ['Draw the 4 × 4 box around the shape.', 'Subtract the two corner triangles at the top.'],
      steps: ['Box: 4 × 4 = 16.', 'Top-left triangle cut off: ½ × 2 × 1 = 1. Top-right: ½ × 2 × 2 = 2.', '16 − 1 − 2 = 13.'], key: 'Box method: big minus the pieces' },
    { id: 'd07', topic: 'similar', q: 'In triangle ABC, segment DE is parallel to BC. AD = 4 and DB = 2. Triangle ADE has area 16. What is the area of the shaded trapezoid DECB?', choices: ['8', '16', '20', '24', '36'], a: '20',
      svg: D(poly('160,15 40,165 280,165', 'b') + poly('160,15 80,115 240,115', 'empty') + t(160, 10, 'A', 'tiny') + t(30, 170, 'B', 'tiny') + t(290, 170, 'C', 'tiny') + t(70, 115, 'D', 'tiny') + t(250, 115, 'E', 'tiny') + t(110, 62, '4', 'tiny') + t(52, 142, '2', 'tiny')),
      hints: ['Triangle ADE is similar to ABC. What is the scale factor?', 'AB = 6, so lengths scale 4 : 6. Square it for areas.'],
      steps: ['AD : AB = 4 : 6 = 2 : 3, so areas are 4 : 9.', 'ABC = 16 × 9/4 = 36. Trapezoid = 36 − 16 = 20.'], key: 'Lengths ×k → areas ×k²' },
    { id: 'd08', topic: 'pythag', q: 'A rectangle is 12 by 9. A segment is drawn from one corner perpendicular to the diagonal. What is its length h?', choices: ['6', '36/5', '7.5', '8', '54/5'], a: '36/5',
      svg: D(rect(64, 18, 192, 144) + line(64, 162, 256, 18) + `<line x1="256" y1="162" x2="187" y2="70" class="red"/>` + t(160, 176, '12', 'tiny') + t(270, 92, '9', 'tiny') + t(232, 110, 'h', 'tiny')),
      hints: ['The diagonal is 15 (a 9-12-15 triangle).', 'Find the triangle\'s area two ways: ½ × 12 × 9 and ½ × 15 × h.'],
      steps: ['Diagonal = 15. Triangle area = ½ × 12 × 9 = 54.', '½ × 15 × h = 54, so h = 108/15 = 36/5.'], key: 'Compute the same area two ways' },
    { id: 'd09', topic: 'similar', q: 'Two poles, 6 m and 12 m tall, stand on flat ground. Ropes run from the top of each pole to the bottom of the other. How high above the ground do the ropes cross?', choices: ['3 m', '4 m', '4.5 m', '6 m', '9 m'], a: '4 m',
      svg: D(line(60, 160, 60, 88, 'thick') + line(260, 160, 260, 16, 'thick') + line(60, 88, 260, 160) + line(260, 16, 60, 160) + line(20, 160, 300, 160) + `<line x1="127" y1="112" x2="127" y2="160" class="red"/>` + t(46, 128, '6', 'tiny') + t(276, 92, '12', 'tiny') + t(140, 140, '?', 'tiny')),
      hints: ['Surprise: the distance between the poles does not matter!', 'The answer is (6 × 12) ÷ (6 + 12).'],
      steps: ['Similar triangles give h = (a × b)/(a + b) for poles a and b.', '(6 × 12)/18 = 4 m.'], key: 'Same angles, same shape' },
    { id: 'd10', topic: 'area', q: 'Triangle ABC has area 48. Point D on BC splits it so that BD : DC = 3 : 5. What is the area of the larger piece, triangle ADC?', choices: ['18', '24', '28', '30', '32'], a: '30',
      svg: D(poly('170,20 40,160 280,160', 'empty') + poly('170,20 130,160 280,160', 'b') + t(170, 15, 'A', 'tiny') + t(32, 172, 'B', 'tiny') + t(130, 175, 'D', 'tiny') + t(290, 172, 'C', 'tiny') + t(85, 175, '3', 'tiny') + t(205, 175, '5', 'tiny')),
      hints: ['Both triangles have the same height from A.', 'So their areas are in the ratio of their bases, 3 : 5.'],
      steps: ['Same height, so areas split 3 : 5.', '48 × 5/8 = 30.'], key: 'Same base, same height, same area' },
    { id: 'd11', topic: 'circles', q: 'A square fits exactly inside a big circle, and a small circle fits exactly inside the square. What fraction of the big circle\'s area is the small circle?', choices: ['1/4', '1/3', '1/2', '2/3', '3/4'], a: '1/2',
      svg: D(circ(160, 90, 80, 'empty') + rect(103.4, 33.4, 113.2, 113.2, 'empty') + circ(160, 90, 56.6, 'b') + line(160, 90, 216.6, 146.6, 'red') + line(160, 90, 216.6, 90)),
      hints: ['Let the small circle have radius 1. How big is the square?', 'The big circle\'s radius is half the square\'s diagonal: √2.'],
      steps: ['Small radius 1 → square side 2 → square diagonal 2√2 → big radius √2.', 'Areas: π × 1 vs π × 2. The fraction is 1/2.'], key: 'Pick a friendly number' },
    { id: 'd12', topic: 'angles', q: 'The two horizontal lines are parallel. What is the measure of angle x?', choices: ['100°', '110°', '120°', '130°', '140°'], a: '120°',
      svg: D(line(30, 40, 290, 40) + line(30, 140, 290, 140) + line(100, 40, 200, 90, 'thick') + line(200, 90, 100, 140, 'thick') + t(142, 54, '50°', 'tiny') + t(142, 134, '70°', 'tiny') + t(172, 95, 'x', 'small') + t(250, 172, '(not to scale)', 'tiny')),
      hints: ['Draw a third line through the bend, parallel to the other two.', 'It splits x into two pieces: one matches 50°, one matches 70° (Z shapes).'],
      steps: ['A parallel line through the bend makes two Z shapes.', 'x = 50° + 70° = 120°.'], key: 'Draw an extra line' },
    // ── 3D & spatial
    { id: 'd14', topic: 'solids', q: 'A 3 × 3 × 3 cube made of 27 small cubes has a square tunnel drilled straight through the center of each face, all the way to the other side. How many small cubes are left?', choices: ['18', '19', '20', '21', '24'], a: '20',
      svg: D(grid(100, 50, 3, 3, 30, 'a') + rect(130, 80, 30, 30, 'd') + poly('100,50 130,25 220,25 190,50', 'b') + poly('190,50 220,25 220,115 190,140', 'c') + rect(160, 30, 22, 14, 'd') + poly('199,80 211,70 211,95 199,105', 'd')),
      hints: ['Each tunnel removes the 3 cubes in a line through the center.', 'All three tunnels share the very center cube. Do not count it three times!'],
      steps: ['3 tunnels × 3 cubes = 9, but the center cube is counted 3 times: 9 − 2 = 7 removed.', '27 − 7 = 20.'], key: 'Watch for double counting' },
    { id: 'd16', topic: 'spatial', q: 'This staircase-shaped net folds into a cube. Which number ends up opposite 2?', choices: ['1', '3', '4', '5', '6'], a: '5',
      svg: D([[0, 0], [1, 0], [1, 1], [2, 1], [2, 2], [3, 2]].map(([c, r], i) => rect(60 + c * 48, 20 + r * 48, 46, 46, i === 1 ? 'b' : 'c') + t(83 + c * 48, 50 + r * 48, i + 1, 'big')).join('')),
      hints: ['Imagine 2 flat on the table and fold the rest up around it.', 'Fold 1 and 3 up first, then keep folding square by square and track where 5 lands.'],
      steps: ['Folding up around 2: squares 1, 3, 4 and 6 become the four sides, and 5 lands on top.', 'So 5 is opposite 2. (The pairs are 1–4, 2–5, 3–6.)'], key: 'Act it out' },
    // ── Graphs
    { id: 'd17', topic: 'graphs', q: 'Ava starts running at 6 mph. One hour later Ben starts from the same spot at 10 mph. The graph shows their distances. After how many hours (from Ava\'s start) does Ben catch up?', choices: ['1.5', '2', '2.5', '3', '3.5'], a: '2.5',
      svg: D(line(40, 150, 305, 150, 'axis') + line(40, 20, 40, 150, 'axis') + [0, 1, 2, 3].map((x) => t(40 + x * 86, 166, x, 'tiny')).join('') + `<polyline points="40,150 298,42" class="plot"/>` + `<polyline points="126,150 298,30" style="stroke:var(--accent2);stroke-width:3;fill:none"/>` + t(196, 70, 'Ava', 'tiny') + t(236, 118, 'Ben', 'tiny') + t(300, 144, 'hours', 'tiny', 'end') + t(44, 16, 'miles', 'tiny', 'start')),
      hints: ['After t hours, Ava has run 6t miles. Ben has run 10(t − 1).', 'Set them equal.'],
      steps: ['6t = 10(t − 1) → 6t = 10t − 10 → t = 2.5.', 'Check: Ava 15 miles; Ben 10 × 1.5 = 15 ✓.'], key: 'Name it with a letter' },
    { id: 'd18', topic: 'graphs', q: 'The chart shows how many players got each score on a free-throw test. What is the mean score?', choices: ['78', '80', '82', '84', '85'], a: '82',
      svg: D((() => { const c = [1, 3, 5, 4, 2], s = [60, 70, 80, 90, 100]; let o = line(46, 150, 310, 150, 'axis'); for (let g = 0; g <= 6; g++) o += line(46, 150 - g * 20, 310, 150 - g * 20, 'grid') + t(38, 154 - g * 20, g, 'tiny', 'end'); c.forEach((v, i) => { o += rect(60 + i * 50, 150 - v * 20, 36, v * 20, 'a') + t(78 + i * 50, 166, s[i], 'tiny'); }); return o + t(50, 10, 'players', 'tiny', 'start'); })()),
      hints: ['Total points ÷ number of players.', 'Players: 1 + 3 + 5 + 4 + 2 = 15.'],
      steps: ['Points: 60 + 3·70 + 5·80 + 4·90 + 2·100 = 1230.', '1230 ÷ 15 = 82.'], key: 'Mean = total ÷ count' },
    { id: 'd19', topic: 'graphs', q: '300 students voted for their favorite sport. How many more chose basketball than swimming?', choices: ['15', '45', '60', '75', '120'], a: '60',
      svg: D(pie([['Basketball', 40], ['Soccer', 25], ['Swimming', 20], ['Other', 15]])),
      hints: ['The difference in percent is 40% − 20%.', '20% of 300.'],
      steps: ['40% − 20% = 20% of the students.', '20% of 300 = 60.'], key: 'Pretend it is 100' },
    // ── Counting
    { id: 'd21', topic: 'paths', q: 'Moving only right or up along the grid lines, how many paths go from A to B without passing through either point marked ✕?', choices: ['2', '4', '6', '8', '10'], a: '4',
      svg: D((() => { let o = ''; for (let i = 0; i <= 3; i++) o += line(100 + i * 40, 30, 100 + i * 40, 150) + line(100, 30 + i * 40, 220, 30 + i * 40); return o + t(140, 116, '✕', 'small') + t(180, 76, '✕', 'small') + t(92, 165, 'A', 'tiny') + t(228, 26, 'B', 'tiny'); })()),
      hints: ['Write the number of ways to reach each corner (left + below), with 0 at each ✕.', 'Start from A with 1s along the edges.'],
      steps: ['Fill each corner with (from the left) + (from below), writing 0 at the ✕ points.', 'The corner at B gets 4.'], key: 'Pascal corners' },
    { id: 'd22', topic: 'counting', q: 'How many rectangles of any size (squares included) are in this 3-by-4 grid?', choices: ['12', '30', '48', '60', '72'], a: '60',
      svg: D(grid(80, 30, 4, 3, 40, 'a op')),
      hints: ['A rectangle is chosen by 2 vertical lines and 2 horizontal lines.', 'There are 5 vertical lines and 4 horizontal lines.'],
      steps: ['Choose 2 of 5 vertical lines: 10. Choose 2 of 4 horizontal lines: 6.', '10 × 6 = 60.'], key: 'A choice of lines = one shape' },
    { id: 'd23', topic: 'counting', q: 'How many squares of any size are in this 4-by-4 grid?', choices: ['16', '20', '25', '30', '36'], a: '30',
      svg: D(grid(90, 10, 4, 4, 40, 'a op')),
      hints: ['Count 1×1, 2×2, 3×3 and 4×4 squares separately.', '1×1: 16. 2×2: 9.'],
      steps: ['1×1: 16, 2×2: 9, 3×3: 4, 4×4: 1.', '16 + 9 + 4 + 1 = 30.'], key: 'Split into cases' },
    { id: 'd24', topic: 'counting', q: 'Three lines are drawn from the top corner of a triangle to its base, as shown. How many triangles are in the figure?', choices: ['6', '8', '10', '12', '15'], a: '10',
      svg: D(poly('160,15 30,165 290,165', 'a op') + line(160, 15, 95, 165) + line(160, 15, 160, 165) + line(160, 15, 225, 165)),
      hints: ['Every triangle uses the top corner and two points on the base.', 'There are 5 points on the base.'],
      steps: ['Pick any 2 of the 5 base points: C(5, 2) = 10.', 'Each pair, with the top corner, makes one triangle.'], key: 'A choice of lines = one shape' },
    { id: 'd25', topic: 'paths', q: 'An ant walks along the edges of a cube from corner A to the opposite corner G, using the fewest possible edges. How many different routes can it take?', choices: ['3', '4', '6', '8', '9'], a: '6',
      svg: D(['80,60,180,60', '180,60,180,160', '180,160,80,160', '80,160,80,60', '130,20,230,20', '230,20,230,120', '230,120,130,120', '130,120,130,20'].map((c) => line(...c.split(',').map(Number))).join('') + line(80, 60, 130, 20) + line(180, 60, 230, 20) + line(80, 160, 130, 120) + line(180, 160, 230, 120) + t(70, 172, 'A', 'tiny') + t(240, 16, 'G', 'tiny') + circ(80, 160, 4, 'b') + circ(230, 20, 4, 'c')),
      hints: ['The shortest route uses 3 edges: one in each direction (across, up, back).', 'In how many orders can you do 3 different moves?'],
      steps: ['Every shortest route uses one move in each of 3 directions.', 'They can come in 3! = 6 orders.'], key: 'R-and-U words' },
    { id: 'd26', topic: 'counting', q: 'Each of the 4 sections of this banner is painted red, gold, or purple. Sections that touch must be different colors. How many ways are there?', choices: ['12', '18', '24', '36', '81'], a: '24',
      svg: D(rect(30, 60, 65, 60, 'd') + rect(95, 60, 65, 60, 'b') + rect(160, 60, 65, 60, 'a') + rect(225, 60, 65, 60, 'c') + ['1', '2', '3', '4'].map((s, i) => t(62 + i * 65, 96, s, 'big')).join('')),
      hints: ['Paint from left to right.', 'The first section has 3 choices; each next one just must differ from its left neighbor.'],
      steps: ['3 choices for section 1, then 2 for each of sections 2, 3, 4.', '3 × 2 × 2 × 2 = 24.'], key: 'Fill the fussy slot first' },
    // ── Probability
    { id: 'd27', topic: 'probability', q: 'Both spinners are spun, and the two numbers are multiplied. What is the probability the product is even?', choices: ['1/3', '1/2', '7/12', '2/3', '3/4'], a: '2/3',
      svg: D(circ(90, 90, 60, 'a op') + line(30, 90, 150, 90) + line(90, 30, 90, 150) + t(68, 70, '1', 'small') + t(112, 70, '2', 'small') + t(68, 120, '3', 'small') + t(112, 120, '4', 'small') + circ(230, 90, 60, 'b op') + line(230, 90, 230, 30) + line(230, 90, 282, 120) + line(230, 90, 178, 120) + t(258, 80, '1', 'small') + t(202, 80, '2', 'small') + t(230, 135, '3', 'small')),
      hints: ['A product is odd only when BOTH numbers are odd.', 'P(odd on the first) = 2/4, P(odd on the second) = 2/3.'],
      steps: ['P(both odd) = 2/4 × 2/3 = 1/3.', 'P(even) = 1 − 1/3 = 2/3.'], key: 'Flip it: count the opposite' },
    { id: 'd28', topic: 'probplus', q: 'A dartboard has circles of radius 1, 2, and 3. A dart lands at a random spot on the board. What is the probability it lands in the middle ring (shaded)?', choices: ['1/9', '2/9', '1/3', '4/9', '1/2'], a: '1/3',
      svg: D(circ(160, 90, 75, 'empty') + circ(160, 90, 50, 'b') + circ(160, 90, 25, 'empty') + line(160, 90, 235, 90) + t(178, 86, '1', 'tiny') + t(203, 86, '2', 'tiny') + t(228, 86, '3', 'tiny')),
      hints: ['Ring area = big circle − small circle.', 'Middle ring: 4π − π = 3π. Whole board: 9π.'],
      steps: ['Middle ring: π(2²) − π(1²) = 3π.', 'Board: 9π. Probability: 3π/9π = 1/3.'], key: 'Area = chance' },
    { id: 'd29', topic: 'probplus', q: 'A point is picked at random inside the 4 × 4 square. What is the probability that it lies above the line shown, which goes from one corner to the middle of the opposite side?', choices: ['1/2', '5/8', '2/3', '3/4', '7/8'], a: '3/4',
      svg: D(rect(100, 20, 140, 140, 'b') + poly('100,160 240,160 240,90', 'empty') + line(100, 160, 240, 90, 'red') + t(170, 176, '4', 'tiny') + t(254, 130, '2', 'tiny')),
      hints: ['Find the area BELOW the line first: it is a right triangle.', 'Triangle with legs 4 and 2.'],
      steps: ['Below the line: ½ × 4 × 2 = 4 out of 16.', 'Above: 12/16 = 3/4.'], key: 'Area = chance' },
    // ── Logic
    { id: 'd30', topic: 'logic', q: 'Place 1 to 6 in the circles (each once) so that every side of the triangle has the same sum. What is the largest possible side sum?', choices: ['9', '10', '11', '12', '13'], a: '12',
      svg: D([[160, 20], [55, 160], [265, 160], [108, 90], [212, 90], [160, 160]].map(([x, y], i) => circ(x, y, 18, i < 3 ? 'b' : 'empty')).join('') + line(160, 38, 117, 75) + line(98, 106, 66, 145) + line(203, 106, 254, 145) + line(222, 74, 172, 34) + line(73, 160, 142, 160) + line(178, 160, 247, 160)),
      hints: ['Add the three side sums: every corner number gets counted twice.', '3 × (side sum) = 21 + (sum of the corners).'],
      steps: ['3S = 1 + 2 + … + 6 + corners = 21 + corners.', 'Biggest corners: 4 + 5 + 6 = 15, so 3S = 36 and S = 12. (Example sides: 4-3-5, 5-1-6, 6-2-4.)'], key: 'Add everything' },
    { id: 'd31', topic: 'logic', q: 'The numbers 1 to 9 go in the grid, one per square, so that every row, column, and diagonal has the same sum. Some are filled in. What number goes in the center?', choices: ['3', '4', '5', '6', '7'], a: '5',
      svg: D(grid(100, 20, 3, 3, 46, 'empty') + t(123, 50, '2', 'big') + t(215, 50, '6', 'big') + t(123, 142, '4', 'big') + t(169, 96, '?', 'big')),
      hints: ['The total of 1 to 9 is 45, so each row sums to 15.', 'Add the middle row, middle column and both diagonals: the center is counted 4 times.'],
      steps: ['Those 4 lines add to 4 × 15 = 60 = 45 + 3 × center.', 'So the center is 5. (Check: 2 + 5 + 8 and 6 + 5 + 4 both make 15.)'], key: 'Add everything' },
    { id: 'd32', topic: 'logic', q: 'Nine coins look the same, but one is heavier. With a balance scale, what is the fewest weighings that always finds the heavy coin?', choices: ['1', '2', '3', '4', '8'], a: '2',
      svg: D(line(160, 40, 160, 150, 'thick') + line(70, 60, 250, 60, 'thick') + poly('130,150 190,150 160,135', 'b') + line(85, 60, 70, 100) + line(85, 60, 100, 100) + line(235, 60, 220, 100) + line(235, 60, 250, 100) + line(62, 100, 108, 100, 'thick') + line(212, 100, 258, 100, 'thick') + [0, 1, 2].map((i) => circ(73 + i * 12, 92, 6, 'c') + circ(223 + i * 12, 92, 6, 'c')).join('') + [0, 1, 2].map((i) => circ(135 + i * 15, 170, 6, 'c')).join('')),
      hints: ['Each weighing has 3 outcomes: left heavy, right heavy, or balanced.', 'Split the 9 coins into 3 groups of 3.'],
      steps: ['Weigh 3 vs 3. The heavy coin is in the heavier pan, or in the unweighed 3 if they balance.', 'From those 3, weigh 1 vs 1 the same way. Two weighings.'], key: 'Each test has 3 outcomes' },
    { id: 'd33', topic: 'logic', q: 'Two opposite corner squares are cut off a checkerboard. What is the greatest number of 1×2 dominoes that can be placed on the remaining 62 squares without overlapping?', choices: ['28', '29', '30', '31', '32'], a: '30',
      svg: D((() => { let o = ''; for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { const cut = (i === 0 && j === 0) || (i === 7 && j === 7); o += rect(100 + i * 19, 14 + j * 19, 19, 19, cut ? 'empty' : (i + j) % 2 ? 'a' : 'empty'); if (cut) o += t(109.5 + i * 19, 28 + j * 19, '✕', 'tiny'); } return o; })()),
      hints: ['Every domino covers one dark and one light square.', 'The two cut corners are the same color.'],
      steps: ['After the cut: 32 squares of one color, 30 of the other.', 'Each domino needs one of each, so at most 30 fit (and 30 is possible).'], key: 'Color it in: parity' },
    // ── Patterns
    { id: 'd34', topic: 'sequences', q: 'The dot triangles grow as shown: 1, 3, 6, 10 dots, and so on. How many dots are in the 20th triangle?', choices: ['190', '200', '210', '220', '400'], a: '210',
      svg: D([1, 2, 3, 4].map((n, k) => { let o = ''; const x0 = [30, 80, 145, 225][k]; for (let r = 0; r < n; r++) for (let c = 0; c <= r; c++) o += circ(x0 + c * 14 - r * 7 + 20, 50 + r * 14, 5, 'b'); return o + t(x0 + 20, 130, n * (n + 1) / 2, 'small'); }).join('')),
      hints: ['The nth triangle has 1 + 2 + … + n dots.', 'Use Gauss: n(n + 1)/2.'],
      steps: ['20th: 1 + 2 + … + 20.', '20 × 21 ÷ 2 = 210.'], key: 'Build up small' },
    { id: 'd35', topic: 'sequences', q: 'A row of squares is made from toothpicks, as shown. What is the greatest number of squares that can be made in one row with 100 toothpicks?', choices: ['24', '25', '32', '33', '34'], a: '33',
      svg: D([1, 2, 3].map((n, k) => { let o = ''; const x0 = [20, 90, 190][k]; for (let i = 0; i < n; i++) o += rect(x0 + i * 30, 70, 30, 30, 'empty'); return o + t(x0 + n * 15, 125, `${3 * n + 1}`, 'tiny'); }).join('')),
      hints: ['1 square: 4 toothpicks. 2: 7. 3: 10.', 'Each new square adds 3. So n squares need 3n + 1.'],
      steps: ['3n + 1 ≤ 100 → n ≤ 33.', '33 squares use exactly 100 toothpicks.'], key: 'Build up small' },
    // ── Algebra & misc
    { id: 'd37', topic: 'equations', q: 'Both scales balance. How much does one ● weigh?', choices: ['4', '5', '6', '7', '8'], a: '6',
      svg: D(line(20, 70, 140, 70, 'thick') + poly('70,95 90,95 80,72', 'b') + t(45, 62, '● ●', 'small') + t(115, 62, '▲▲▲', 'small') + line(180, 70, 300, 70, 'thick') + poly('230,95 250,95 240,72', 'b') + t(205, 62, '● ▲', 'small') + t(275, 62, '10', 'small')),
      hints: ['From the first scale: 2● = 3▲.', 'So ● = 1.5▲. Put that into ● + ▲ = 10.'],
      steps: ['2● = 3▲, so ● = 1.5▲. Then 1.5▲ + ▲ = 10 → ▲ = 4.', '● = 6.'], key: 'Name it with a letter' },
    { id: 'd38', topic: 'angles', q: 'What is the smaller angle between the hands of a clock at 3:40?', choices: ['110°', '120°', '130°', '140°', '150°'], a: '130°',
      svg: D(clock(3, 40)),
      hints: ['The minute hand moves 6° per minute. The hour hand moves 0.5° per minute.', 'At 3:40: minute hand 240°, hour hand 90° + 20° = 110°.'],
      steps: ['Minute hand: 40 × 6 = 240°. Hour hand: 3 × 30 + 40 × 0.5 = 110°.', 'Difference: 130°.'], key: 'The hour hand moves too!' },
    { id: 'd39', topic: 'counting', q: 'In a class of 30, 18 play basketball, 15 play soccer, and 4 play neither. How many play both?', choices: ['3', '5', '7', '9', '11'], a: '7',
      svg: D(rect(20, 15, 280, 150, 'empty') + `<circle cx="125" cy="90" r="60" class="a op"/>` + `<circle cx="195" cy="90" r="60" class="b op"/>` + t(95, 60, 'Basketball', 'tiny') + t(225, 60, 'Soccer', 'tiny') + t(160, 95, '?', 'big') + t(50, 155, '4', 'small')),
      hints: ['30 − 4 = 26 play at least one sport.', '18 + 15 counts the "both" group twice.'],
      steps: ['At least one sport: 26. But 18 + 15 = 33.', 'The extra 33 − 26 = 7 is the overlap, counted twice.'], key: 'Add both, subtract the overlap' },
  ];

  root.HARD.problems.push(...P);
})(typeof window !== 'undefined' ? window : globalThis);
