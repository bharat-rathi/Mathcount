// Concept Studio, chapter: Geometry. Same clip format as studio-counting.js.
(function (root) {
  const V = root.V;
  const C = (root.CLIPS = root.CLIPS || []);
  const S = V.svg;

  // A small coordinate grid: 0..n on both axes, 24 px per unit, origin at (40, 170).
  const OX = 40, OY = 170, U = 22;
  const px = (x) => OX + x * U, py = (y) => OY - y * U;
  const axes = (n = 6, d = 0) => {
    let s = '';
    for (let i = 0; i <= n; i++) s += V.line(px(i), py(0), px(i), py(n), 'gridl', d) + V.line(px(0), py(i), px(n), py(i), 'gridl', d);
    for (let i = 0; i <= n; i++) s += V.t(px(i) - 4, OY + 16, i, 'tiny', d) + (i ? V.t(OX - 16, py(i) + 4, i, 'tiny', d) : '');
    return s;
  };
  const tri = (pts, cls, d) => V.poly(pts.map(([x, y]) => `${px(x)},${py(y)}`).join(' '), cls, d);

  C.push(
    {
      id: 'geo-line', topic: 'angles', emoji: '📏', title: 'Straight line = 180°',
      frames: [
        { svg: S(V.line(20, 130, 300, 130, 'thick', 0) + V.line(160, 130, 230, 40, 'thick', 0.5) + V.t(200, 120, '55°', 'b-t', 1) + V.t(110, 115, '?', 'big', 1.2)),
          say: 'Two angles sit side by side on a {g:straight line}. One is {g:55°}. Find the {f:other} one.' },
        { svg: S(V.line(20, 130, 300, 130, 'thick') + V.line(160, 130, 230, 40, 'thick') + V.path('M110 130 A50 50 0 0 1 210 130', 'red', 0.3) + V.t(135, 70, '180°', 'big red-t', 1)),
          say: 'A straight line is half a turn: the angles on it always add to {g:180°}.' },
        { svg: S(V.t(40, 90, '? = 180 − 55', 'big', 0) + V.t(90, 140, '= 125°', 'big c-t', 1)),
          say: 'So ? = 180 − 55 = {a:125°}.' },
        { svg: S(V.line(160, 90, 280, 90, 'thick', 0) + V.line(160, 90, 160, 10, 'thick', 0.2) + V.line(160, 90, 60, 150, 'thick', 0.4) + V.line(160, 90, 220, 170, 'thick', 0.6) + V.ring(160, 90, 30, 'red', 1) + V.t(10, 40, 'all the way', 'small', 1.5) + V.t(10, 62, 'around = 360°', 'small red-t', 1.5), 180),
          say: 'All the way around a point is a full turn: the angles add to {g:360°}.' },
      ],
      check: { q: 'Three angles fill the space around a point: 90°, 120° and x°. What is x?', options: ['90', '120', '150', '180'], answer: '150', why: '360 − 90 − 120 = 150.' },
      remember: 'Straight line = 180°. Full turn = 360°.',
    },
    {
      id: 'geo-tri180', topic: 'angles', emoji: '🔺', title: 'Triangle angles add to 180°',
      frames: [
        { svg: S(V.poly('50,150 270,150 150,30', 'empty', 0) + V.circ(50, 150, 12, 'd', 0.5) + V.circ(270, 150, 12, 'b', 0.7) + V.circ(150, 30, 12, 'c', 0.9) + V.t(45, 175, 'a', 'small', 1) + V.t(270, 175, 'b', 'small', 1) + V.t(165, 30, 'c', 'small', 1)),
          say: 'Every triangle hides a secret about its {g:3 angles}: a, b and c.' },
        { svg: S(V.line(20, 120, 300, 120, 'thick', 0) + V.poly('160,120 90,120 115,70', 'd', 0.5) + V.poly('160,120 115,70 205,70', 'c', 1) + V.poly('160,120 205,70 230,120', 'b', 1.5) + V.t(100, 110, 'a', 'small', 0.8) + V.t(155, 88, 'c', 'small', 1.3) + V.t(208, 110, 'b', 'small', 1.8)),
          say: 'Tear off the 3 corners and put them side by side. They fill a {g:straight line} exactly!' },
        { svg: S(V.t(30, 100, 'a + b + c = 180°', 'big', 0)),
          say: 'So the angles of {g:every} triangle add up to {a:180°}.' },
      ],
      check: { q: 'A triangle has angles of 50° and 60°. What is the third angle?', options: ['60°', '70°', '80°', '110°'], answer: '70°', why: '180 − 50 − 60 = 70.' },
      remember: 'Triangle angles add to 180°.',
    },
    {
      id: 'geo-triarea', topic: 'area', emoji: '📐', title: 'A triangle is half a rectangle',
      frames: [
        { svg: S(V.rect(60, 40, 200, 100, 'empty', 0) + V.poly('60,140 260,140 140,40', 'b', 0.5) + V.t(145, 162, 'base', 'small', 1) + V.t(268, 95, 'height', 'small', 1)),
          say: 'A triangle sits inside a {g:rectangle} with the same base and the same height.' },
        { svg: S(V.poly('60,40 140,40 60,140', 'd', 0) + V.poly('60,140 140,40 140,140', 'b', 0.3) + V.poly('140,40 260,40 260,140', 'd', 0.6) + V.poly('140,40 140,140 260,140', 'b', 0.9) + V.line(140, 40, 140, 140, 'red', 1.2)),
          say: 'Cut along the red line. Each pink piece outside is an exact copy of a purple piece inside.' },
        { svg: S(V.t(20, 80, 'triangle = ½ × base × height', 'small', 0) + V.t(60, 140, '½ of the rectangle', 'big c-t', 1)),
          say: 'So the triangle is exactly {g:half} the rectangle: {a:½ × base × height}.' },
      ],
      check: { q: 'A triangle has a base of 10 and a height of 6. What is its area?', options: ['16', '30', '32', '60'], answer: '30', why: '½ × 10 × 6 = 30.' },
      remember: 'Triangle = half the rectangle around it: ½ × base × height.',
    },
    {
      id: 'geo-subtract', topic: 'area', emoji: '✂️', title: 'Whole minus the hole',
      frames: [
        { svg: S(V.rect(90, 20, 140, 140, 'a', 0) + V.rect(135, 65, 56, 56, 'empty', 0.6) + V.t(150, 178, '10', 'small', 1) + V.t(155, 98, '4', 'small', 1.2)),
          say: 'Find the {f:shaded area}: a 10 × 10 square with a 4 × 4 hole cut out.' },
        { svg: S(V.rect(90, 20, 140, 140, 'a', 0) + V.t(110, 98, '10×10=100', 'big', 0.5)),
          say: 'First the whole thing, as if there were no hole: 10 × 10 = {g:100}.' },
        { svg: S(V.rect(90, 20, 140, 140, 'a') + V.rect(135, 65, 56, 56, 'empty', 0.3) + V.t(10, 178, '100 − 4 × 4 = 100 − 16 = 84', 'small c-t', 1)),
          say: 'Then take away the hole: 4 × 4 = 16. Shaded = 100 − 16 = {a:84}.' },
        { svg: S(V.t(40, 80, 'big shape', 'big', 0) + V.t(40, 130, '− unshaded parts', 'big red-t', 0.8)),
          say: 'Weird shape? Find an {g:easy big shape} around it, then subtract the parts that aren\'t shaded.' },
      ],
      check: { q: 'An 8 × 6 rectangle has a triangle cut out of it. The triangle has base 8 and height 6. What area is left?', options: ['14', '20', '24', '48'], answer: '24', why: '8 × 6 = 48, the triangle is ½ × 8 × 6 = 24, and 48 − 24 = 24.' },
      remember: 'Weird shaded shape? Whole − the unshaded parts.',
    },
    {
      id: 'geo-pythag', topic: 'pythag', emoji: '📐', title: 'a² + b² = c²',
      frames: [
        { svg: S(V.poly('110,170 190,170 110,110', 'empty', 0) + V.rect(110, 160, 10, 10, 'empty', 0.3) + V.t(140, 190, '4', 'big', 0.6) + V.t(90, 148, '3', 'big', 0.6) + V.t(155, 132, '?', 'big red-t', 1), 200),
          say: 'A {g:right triangle} with legs {g:3} and {g:4}. How long is the {f:long side}?' },
        { svg: S(V.poly('110,170 190,170 110,110', 'empty') + V.rect(50, 110, 60, 60, 'd', 0.3) + V.rect(110, 170, 80, 80, 'b', 0.6) + V.poly('110,110 190,170 250,90 170,30', 'c', 1) + V.t(70, 147, '9', 'big', 0.5) + V.t(140, 218, '16', 'big', 0.8) + V.t(170, 110, '25', 'big', 1.3), 260),
          say: 'Build a square on each side. The small ones hold {g:9} and {g:16} little squares.' },
        { svg: S(V.t(50, 80, '9 + 16 = 25', 'huge', 0) + V.t(60, 140, 'long side = 5', 'big c-t', 1)),
          say: 'Together they exactly fill the big square: 9 + 16 = 25 = 5 × 5. So the long side is {a:5}.' },
        { svg: S(V.t(40, 100, 'a² + b² = c²', 'huge', 0) + V.t(40, 150, 'right triangles only!', 'small red-t', 1)),
          say: '{g:Leg² + leg² = long side²}. It only works when there is a right angle.' },
      ],
      check: { q: 'A right triangle has legs 6 and 8. How long is the long side?', options: ['10', '12', '14', '48'], answer: '10', why: '36 + 64 = 100, and 10 × 10 = 100.' },
      remember: 'Right triangle: a² + b² = c².',
    },
    {
      id: 'geo-triples', topic: 'pythag', emoji: '🔢', title: 'Famous triples',
      frames: [
        { svg: S(['3 - 4 - 5', '5 - 12 - 13', '8 - 15 - 17', '7 - 24 - 25'].map((w, i) => V.t(60, 45 + i * 38, w, 'big', i * 0.4)).join('')),
          say: 'Some right triangles have {g:whole-number} sides. Memorize these {g:famous triples}.' },
        { svg: S(V.poly('30,150 90,150 30,105', 'b', 0) + V.t(40, 170, '3-4-5', 'small', 0.2) + V.poly('140,150 260,150 140,60', 'c', 0.8) + V.t(170, 170, '6-8-10 (× 2)', 'small', 1)),
          say: 'Zoom one and it still works: 3-4-5 × 2 = 6-8-10, × 3 = 9-12-15, × 10 = 30-40-50.' },
        { svg: S(V.t(20, 70, 'legs 15 and 20', 'big', 0) + V.t(20, 110, '= 3-4-5 × 5', 'big', 0.8) + V.t(20, 150, 'long side = 25', 'big c-t', 1.6)),
          say: 'On the test, {g:spot the triple} and skip the squaring: legs 15 and 20 are 3-4-5 × 5, so the long side is {a:25}.' },
      ],
      check: { q: 'A right triangle has legs 9 and 12. How long is the long side?', options: ['13', '15', '18', '21'], answer: '15', why: '9-12-15 is 3-4-5 × 3.' },
      remember: 'Know 3-4-5, 5-12-13, 8-15-17, 7-24-25 and their multiples.',
    },
    {
      id: 'geo-similar', topic: 'similar', emoji: '🔍', title: 'Same shape? Find the zoom',
      frames: [
        { svg: S(V.poly('20,150 100,150 20,90', 'b', 0) + V.t(50, 170, '4', 'small', 0.3) + V.t(5, 125, '3', 'small', 0.3) + V.poly('140,150 300,150 140,30', 'c', 0.8) + V.t(210, 170, '8', 'small', 1) + V.t(120, 95, '?', 'big red-t', 1.2)),
          say: 'Two triangles with the {g:same angles} are the same shape, just zoomed. Small base {g:4}, big base {g:8}.' },
        { svg: S(V.t(40, 70, '4 → 8', 'huge', 0) + V.t(60, 130, 'zoom × 2', 'big c-t', 0.8)),
          say: 'The big one is the small one zoomed {g:× 2}. Every length doubles.' },
        { svg: S(V.poly('20,150 100,150 20,90', 'b') + V.t(5, 125, '3', 'small') + V.poly('140,150 300,150 140,30', 'c') + V.t(10, 40, 'big height', 'small c-t', 0.5) + V.t(10, 62, '= 3 × 2 = 6', 'small c-t', 0.5)),
          say: 'So the big height is 3 × 2 = {a:6}.' },
        { svg: S(V.t(28, 110, '🧒', 'big', 0) + V.line(40, 150, 40, 120, 'thick', 0) + V.line(40, 150, 58, 150, 'thick', 0.3) + V.line(40, 120, 58, 150, 'red', 0.5) + V.t(5, 140, '5 ft', 'tiny', 0.3) + V.t(38, 170, '3 ft', 'tiny', 0.3) + V.line(180, 150, 180, 30, 'thick', 0.8) + V.line(180, 150, 252, 150, 'thick', 1) + V.line(180, 30, 252, 150, 'red', 1.2) + V.t(185, 170, '12 ft (× 4)', 'tiny', 1) + V.t(100, 90, '? = 20 ft', 'small c-t', 1.6), 180),
          say: 'Shadows at the same time make similar triangles. A 5 ft kid casts a 3 ft shadow. A pole\'s shadow is 12 ft (× 4), so the pole is 5 × 4 = {a:20 ft}.' },
      ],
      check: { q: 'A 6 ft person casts a 4 ft shadow. At the same time, a tree casts a 20 ft shadow. How tall is the tree?', options: ['24 ft', '26 ft', '30 ft', '120 ft'], answer: '30 ft', why: 'The tree\'s shadow is 4 × 5, so zoom × 5: 6 × 5 = 30.' },
      remember: 'Same shape → find the zoom factor, then multiply every length by it.',
    },
    {
      id: 'geo-areascale', topic: 'similar', emoji: '🔲', title: 'Zoom ×2, area ×4',
      frames: [
        { svg: S(V.rect(40, 100, 40, 40, 'b', 0) + V.t(45, 160, '1 × 1', 'small', 0.2) + V.rect(160, 60, 80, 80, 'empty', 0.6) + V.t(170, 160, 'zoom × 2', 'small', 0.8) + V.t(190, 108, '?', 'big', 1)),
          say: 'Zoom a square {g:× 2}. Does its {f:area} just double?' },
        { svg: S(V.rect(40, 100, 40, 40, 'b') + [[160, 60], [200, 60], [160, 100], [200, 100]].map(([x, y], i) => V.rect(x, y, 38, 38, 'b', 0.3 + i * 0.3)).join('') + V.t(150, 165, '2 × 2 = 4', 'big c-t', 1.6)),
          say: 'No! It\'s 2 times as wide {g:and} 2 times as tall, so it holds 2 × 2 = {a:4} copies.' },
        { svg: S([0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => V.rect(40 + c * 40, 30 + r * 40, 38, 38, 'c', (r * 3 + c) * 0.15))).join('') + V.t(180, 90, '× 3 → × 9', 'big', 1.5) + V.t(180, 130, 'area × k²', 'small', 2)),
          say: 'Zoom {g:× 3} and the area is 3 × 3 = 9 times bigger. Lengths × k → area × {a:k²}.' },
      ],
      check: { q: 'Every side of a triangle is tripled. Its area is multiplied by…', options: ['3', '6', '9', '27'], answer: '9', why: 'Lengths × 3 → area × 3² = 9.' },
      remember: 'Lengths × k → area × k² (and volume × k³).',
    },
    {
      id: 'geo-circum', topic: 'circles', emoji: '🛞', title: 'Circumference = π × d',
      frames: [
        { svg: S(V.ring(70, 90, 50, 'thick', 0) + V.line(20, 90, 120, 90, 'red', 0.6) + V.t(62, 82, 'd', 'big red-t', 0.8)),
          say: 'Roll a wheel through one full turn. How far does it go? That distance is the {f:circumference}.' },
        { svg: S(V.line(10, 150, 310, 150, 'thick', 0) + [0, 1, 2].map((i) => V.rect(10 + i * 90, 135, 88, 12, ['d', 'b', 'c'][i], 0.4 + i * 0.4)).join('') + V.rect(280, 135, 13, 12, 'a', 1.8) + V.t(20, 120, 'd', 'small', 0.5) + V.t(110, 120, 'd', 'small', 0.9) + V.t(200, 120, 'd', 'small', 1.3) + V.t(270, 120, '+ a bit', 'tiny', 1.9) + V.t(60, 50, 'about 3.14 diameters', 'small', 2.2)),
          say: 'It rolls a bit more than {g:3 diameters}: exactly π diameters, where π ≈ 3.14.' },
        { svg: S(V.t(40, 80, 'C = π × d', 'huge', 0) + V.t(70, 140, '= 2 × π × r', 'big', 1)),
          say: '{a:Circumference = π × diameter}. The radius is half the diameter, so it\'s also 2 × π × radius.' },
      ],
      check: { q: 'A wheel has a diameter of 10. What is its circumference?', options: ['5π', '10π', '20π', '100π'], answer: '10π', why: 'C = π × d = π × 10.' },
      remember: 'Circumference = π × diameter.',
    },
    {
      id: 'geo-circarea', topic: 'circles', emoji: '⭕', title: 'Circle area = π r²',
      frames: [
        { svg: S(V.circ(110, 95, 70, 'b', 0) + V.line(110, 95, 180, 95, 'red', 0.5) + V.t(138, 88, 'r', 'big red-t', 0.7) + V.rect(110, 25, 70, 70, 'd op', 1.2) + V.t(205, 70, 'r × r', 'small', 1.4)),
          say: 'How much space is inside a circle with radius {g:r}? Compare it with a square that is {g:r × r}.' },
        { svg: S([0, 1, 2].map((i) => V.rect(20 + i * 75, 60, 70, 70, 'd', i * 0.4)).join('') + V.rect(245, 60, 10, 70, 'd', 1.4) + V.t(30, 160, '3 squares + a bit ≈ 3.14', 'small', 1.8)),
          say: 'The circle holds about {g:3.14} of those r × r squares. That number is π again!' },
        { svg: S(V.t(50, 80, 'Area = π r²', 'huge', 0) + V.t(40, 140, 'r = 3 → 9π', 'big c-t', 1)),
          say: '{a:Area = π × r × r}. Radius 3 → 3 × 3 = 9, so the area is 9π. Square the radius {g:first}.' },
      ],
      check: { q: 'A circle has a radius of 5. What is its area?', options: ['5π', '10π', '25π', '100π'], answer: '25π', why: 'π × 5 × 5 = 25π.' },
      remember: 'Area = π r². Square the radius first!',
    },
    {
      id: 'geo-coords', topic: 'coords', emoji: '📍', title: 'Points and distances on a grid',
      frames: [
        { svg: S(axes() + V.line(px(0), py(0), px(4), py(0), 'red', 0.8) + V.line(px(4), py(0), px(4), py(3), 'red', 1.6) + V.circ(px(4), py(3), 7, 'd', 2.2) + V.t(px(4) + 10, py(3) - 6, '(4, 3)', 'small', 2.2), 200),
          say: '(4, 3) means go {g:4 across}, then {g:3 up}. Across always comes first.' },
        { svg: S(axes() + tri([[0, 0], [4, 0], [4, 3]], 'b op', 0.3) + V.circ(px(0), py(0), 6, 'd') + V.circ(px(4), py(3), 6, 'd') + V.line(px(0), py(0), px(4), py(3), 'red', 1) + V.t(px(2) - 4, OY - 6, '4', 'small', 0.5) + V.t(px(4) + 6, py(1.5), '3', 'small', 0.5), 200),
          say: 'How far is (4, 3) from (0, 0)? Draw a {g:right triangle}: across 4, up 3.' },
        { svg: S(V.t(40, 90, 'legs 3 and 4', 'big', 0) + V.t(40, 140, 'distance = 5', 'big c-t', 1)),
          say: 'It\'s the 3-4-5 triangle, so the distance is {a:5}. Distance = Pythagoras on the across and up.' },
      ],
      check: { q: 'How far is the point (1, 1) from the point (7, 9)?', options: ['8', '10', '12', '14'], answer: '10', why: 'Across 6, up 8: that is 6-8-10.' },
      remember: 'Distance = across and up, then Pythagoras.',
    },
    {
      id: 'geo-boxit', topic: 'coords', emoji: '📦', title: 'Tilted shape? Box it',
      frames: [
        { svg: S(axes() + tri([[1, 1], [5, 2], [2, 5]], 'c', 0.5), 200),
          say: 'Find the {f:area} of this tilted triangle with corners (1, 1), (5, 2) and (2, 5).' },
        { svg: S(axes() + V.rect(px(1), py(5), 4 * U, 4 * U, 'empty', 0) + tri([[1, 1], [5, 2], [2, 5]], 'c', 0.3) + V.t(px(5) + 8, py(3), '4 × 4 = 16', 'small', 0.8), 200),
          say: 'Draw a {g:box} around it: 4 by 4, so the box is 16.' },
        { svg: S(axes() + V.rect(px(1), py(5), 4 * U, 4 * U, 'empty') + tri([[1, 1], [5, 2], [2, 5]], 'c') + tri([[1, 1], [5, 1], [5, 2]], 'd', 0.3) + tri([[5, 2], [5, 5], [2, 5]], 'd', 0.6) + tri([[2, 5], [1, 5], [1, 1]], 'd', 0.9) + V.t(px(5) + 6, py(4), '2 + 4.5 + 2', 'tiny', 1.2) + V.t(px(5) + 6, py(3), '= 8.5', 'tiny', 1.3), 200),
          say: 'The 3 pink corners are right triangles: 2 + 4.5 + 2 = 8.5. Area = 16 − 8.5 = {a:7.5}.' },
      ],
      check: { q: 'A triangle has corners (0, 0), (6, 2) and (2, 6). Box it in a 6 × 6 square and subtract the corners. What is its area?', options: ['12', '16', '18', '20'], answer: '16', why: 'Box 36; corners 6 + 8 + 6 = 20; 36 − 20 = 16.' },
      remember: 'Tilted shape? Box it, then subtract the corner pieces.',
    },
    {
      id: 'geo-volume', topic: 'solids', emoji: '🧊', title: 'Volume: layers of cubes',
      frames: [
        { svg: S(V.t(20, 90, 'box: 4 long, 3 wide, 2 tall', 'small', 0) + V.t(40, 140, 'how many cubes?', 'big', 0.8)),
          say: 'A box is {g:4 long}, {g:3 wide} and {g:2 tall}. How many {f:1 × 1 × 1 cubes} fill it?' },
        { svg: S([0, 1, 2].flatMap((r) => [0, 1, 2, 3].map((c) => V.rect(40 + c * 34, 40 + r * 34, 32, 32, 'b', (r * 4 + c) * 0.1))).join('') + V.t(190, 95, '4 × 3 = 12', 'big', 1.4) + V.t(190, 120, 'per layer', 'small', 1.5)),
          say: 'Look from the top: the bottom layer is 4 × 3 = {g:12} cubes.' },
        { svg: S([0, 1].map((L) => [0, 1, 2].flatMap((r) => [0, 1, 2, 3].map((c) => V.rect(20 + L * 130 + c * 26, 40 + r * 26, 24, 24, L ? 'c' : 'b', L * 0.6 + (r * 4 + c) * 0.04))).join('') + V.t(30 + L * 130, 135, `layer ${L + 1}: 12`, 'small', L * 0.6)).join('') + V.t(60, 172, '12 × 2 = 24 cubes', 'big c-t', 1.4)),
          say: '2 layers → 12 × 2 = {a:24} cubes. Volume = length × width × height.' },
      ],
      check: { q: 'What is the volume of a box that is 5 long, 2 wide and 3 tall?', options: ['10', '25', '30', '60'], answer: '30', why: '5 × 2 = 10 per layer, × 3 layers = 30.' },
      remember: 'Volume = length × width × height (cubes per layer × layers).',
    },
    {
      id: 'geo-surface', topic: 'solids', emoji: '🎁', title: 'Surface area: unfold it',
      frames: [
        { svg: S([[120, 10], [60, 60], [120, 60], [180, 60], [240, 60], [120, 110]].map(([x, y], i) => V.rect(x, y, 50, 50, ['d', 'b', 'c', 'a', 'b', 'd'][i], i * 0.3)).join(''), 180),
          say: 'Unfold a cube and it lies flat as {g:6 squares}. This is called its {g:net}.' },
        { svg: S([[120, 10], [60, 60], [120, 60], [180, 60], [240, 60], [120, 110]].map(([x, y], i) => V.rect(x, y, 50, 50, ['d', 'b', 'c', 'a', 'b', 'd'][i]) + V.t(x + 18, y + 32, '9', '', 0.3 + i * 0.2)).join(''), 180),
          say: 'If each edge is {g:3}, every face is 3 × 3 = 9.' },
        { svg: S(V.t(70, 90, '6 × 9 = 54', 'huge', 0)),
          say: 'Surface area = 6 faces × 9 = {a:54}. It\'s the wrapping paper you\'d need.' },
      ],
      check: { q: 'A cube has edges of length 2. What is its surface area?', options: ['8', '12', '24', '36'], answer: '24', why: 'Each face is 2 × 2 = 4, and 6 × 4 = 24.' },
      remember: 'Surface area = add up all the faces (a cube: 6 × side²).',
    },
    {
      id: 'geo-paint', topic: 'spatial', emoji: '🎨', title: 'The painted cube',
      frames: [
        { svg: S([0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => V.rect(100 + c * 42, 30 + r * 42, 40, 40, 'a', (r * 3 + c) * 0.1))).join('') + V.t(70, 175, '3 × 3 × 3 = 27 small cubes', 'small', 1.2)),
          say: 'A 3 × 3 × 3 cube is {g:painted on the outside}, then cut into {g:27} small cubes. Here is one face.' },
        { svg: S([0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => { const k = (r === 1) + (c === 1); return V.rect(30 + c * 42, 30 + r * 42, 40, 40, k === 0 ? 'd' : k === 1 ? 'b' : 'c', 0.3); })).join('') + V.t(170, 50, 'corner: 3 faces', 'small d-t', 0.8) + V.t(170, 90, 'edge: 2 faces', 'small b-t', 1.1) + V.t(170, 130, 'center: 1 face', 'small c-t', 1.4)),
          say: '{g:Corners} (pink) show 3 painted faces, {g:edges} (purple) show 2, {g:face centers} (green) show 1.' },
        { svg: S(V.t(20, 50, '8 corners → 3 faces', 'small', 0) + V.t(20, 80, '12 edges → 2 faces', 'small', 0.4) + V.t(20, 110, '6 face centers → 1 face', 'small', 0.8) + V.t(20, 140, '1 hidden middle → 0', 'small', 1.2) + V.t(20, 172, '8 + 12 + 6 + 1 = 27 ✓', 'small c-t', 1.8)),
          say: 'A cube has 8 corners, 12 edges and 6 faces, plus {g:1 hidden} cube in the middle: 8 + 12 + 6 + 1 = {a:27}. ✓' },
      ],
      check: { q: 'A 3 × 3 × 3 painted cube is cut into 27 small cubes. How many small cubes have exactly 2 painted faces?', options: ['6', '8', '12', '24'], answer: '12', why: 'One per edge, and a cube has 12 edges.' },
      remember: 'Painted cube: corners 3 faces, edges 2, face centers 1, inside 0.',
    },
  );
})(typeof window !== 'undefined' ? window : globalThis);
