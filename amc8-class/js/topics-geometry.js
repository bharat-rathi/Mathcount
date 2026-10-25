// Geometry topics.
(function (root) {
  const { R, pick, frac, piStr, gcd } = root.U;
  const V = root.V;
  const T = (root.TOPICS = root.TOPICS || []);

  T.push({
    id: 'angles', name: 'Angles & Polygons', emoji: '📐', color: '#339af0',
    slides: [
      { h: 'Triangle angles add to 180°',
        svg: V.svg(V.poly('40,150 280,150 120,30', 'a', 0) + V.t(55, 143, 'a', 'big', 1) + V.t(250, 143, 'b', 'big', 1.3) + V.t(117, 62, 'c', 'big', 1.6) + V.t(190, 50, 'a+b+c = 180°', 'small', 2.2)),
        text: 'Tear off the three corners of any paper triangle: they line up into a straight line, 180°.' },
      { h: 'Polygon angle sum: cut into triangles',
        svg: V.svg(V.poly('160,20 270,80 230,165 90,165 50,80', 'a', 0) + V.line(160, 20, 230, 165, 'thick', 1) + V.line(160, 20, 90, 165, 'thick', 1.4) + V.t(20, 178, '5 sides → 3 triangles → 540°', 'small', 2)),
        text: 'From one corner, an n-gon splits into n − 2 triangles. Angle sum = (n − 2) × 180°.' },
      { h: 'Exterior angles always total 360°',
        svg: V.svg(V.poly('100,40 220,40 260,140 60,140', 'empty', 0) + V.path('M60,140 L20,140', 'red', 1) + V.path('M260,140 L300,140', 'red', 1.3) + V.t(60, 175, 'walk around: one full turn = 360°', 'small', 2)),
        text: 'Walking around any polygon you turn a full circle. A regular n-gon has exterior angle 360° ÷ n.' },
    ],
    tips: [
      { name: 'Exterior first', how: 'For a regular polygon\'s interior angle, do 180° − 360°/n. Much faster than (n−2)×180 ÷ n.', ex: 'octagon: 180 − 45 = 135°' },
      { name: 'Parallel lines: Z and F shapes', how: 'Alternate angles (Z shape) are equal; corresponding angles (F shape) are equal; co-interior (C shape) add to 180°.', ex: 'look for the Z!' },
    ],
    gens: [
      (lv) => { const n = pick([5, 6, 8, 9, 10, 12, 15, 18, 20]); return { q: `What is the measure, in degrees, of each interior angle of a regular polygon with ${n} sides?`, a: 180 - 360 / n, wrong: [360 / n, (n * 180) / n - 360 / n + 10, ((n - 1) * 180) / n, 180 - 180 / n].map((v) => Math.round(v * 10) / 10), steps: [`Exterior angle = 360 ÷ ${n} = ${360 / n}°.`, `Interior = 180 − ${360 / n} = ${180 - 360 / n}°.`] }; },
      (lv) => { const n = R(5, 14); return { q: `What is the sum of the interior angles of a polygon with ${n} sides, in degrees?`, a: (n - 2) * 180, wrong: [n * 180, (n - 1) * 180, 360 * n / 2, (n - 3) * 180], steps: [`${n}-gon → ${n - 2} triangles.`, `${n - 2} × 180 = ${(n - 2) * 180}°.`] }; },
      (lv) => { const n = R(5, 15 + 5 * lv); return { q: `How many diagonals does a convex polygon with ${n} sides have?`, a: (n * (n - 3)) / 2, wrong: [n * (n - 3), (n * (n - 1)) / 2, n * (n - 2) / 2 | 0, n], steps: [`Each vertex connects to ${n} − 3 others by a diagonal.`, `${n} × ${n - 3} ÷ 2 (each counted twice) = ${(n * (n - 3)) / 2}.`] }; },
      (lv) => { const a = R(30, 80), b = R(30, 80); return { q: `In triangle ABC, angle A = ${a}° and angle B = ${b}°. What is the exterior angle at C, in degrees?`, a: a + b, wrong: [180 - a - b, 360 - a - b, 180 - a, 90 + a - b > 0 ? 90 + Math.abs(a - b) : 100], steps: ['The exterior angle equals the sum of the two far interior angles.', `${a} + ${b} = ${a + b}°.`] }; },
    ],
  });

  T.push({
    id: 'pythag', name: 'Pythagorean Theorem', emoji: '📏', color: '#f76707',
    slides: [
      { h: 'a² + b² = c²',
        svg: V.svg(V.poly('100,130 160,130 100,90', 'd', 0) + V.rect(100, 130, 60, 45, 'a op', 0.8) + V.rect(55, 90, 45, 40, 'b op', 1.2) + V.poly('100,90 160,130 200,70 140,30', 'c op', 1.6) + V.t(120, 160, '9', 'small', 0.8) + V.t(65, 117, '16', 'small', 1.2) + V.t(145, 85, '25', 'small', 1.6) + V.t(220, 160, '9 + 16 = 25', 'small', 2.2)),
        text: 'In a right triangle, the squares on the two legs add up to the square on the hypotenuse.' },
      { h: 'Triples to know by heart',
        svg: V.svg(['3-4-5', '5-12-13', '8-15-17', '7-24-25'].map((s, i) => V.rect(20 + (i % 2) * 145, 30 + Math.floor(i / 2) * 70, 130, 55, ['a', 'b', 'c', 'd'][i], i * 0.5) + V.t(40 + (i % 2) * 145, 65 + Math.floor(i / 2) * 70, s, 'big', i * 0.5)).join('')),
        text: 'Multiples work too: 6-8-10, 9-12-15, 15-20-25. Spotting a triple saves the whole calculation.' },
      { h: 'Special right triangles',
        svg: V.svg(V.poly('20,150 120,150 20,50', 'a', 0) + V.t(25, 170, '45-45-90: x, x, x√2', 'tiny', 0.5) + V.poly('170,150 300,150 170,75', 'b', 1) + V.t(170, 170, '30-60-90: x, x√3, 2x', 'tiny', 1.5)),
        text: 'Half a square → 45-45-90. Half an equilateral triangle → 30-60-90.' },
    ],
    tips: [
      { name: 'Scale down first', how: 'Legs 30 and 40? Divide by 10: 3-4-5, so the hypotenuse is 50.', ex: '18, 24 → ÷6 → 3, 4 → 30' },
      { name: 'Draw the height', how: 'For isosceles or trapezoid problems, drop a perpendicular to create a right triangle.', ex: 'isosceles 10-10-12 → height 8' },
    ],
    gens: [
      (lv) => { const [a, b, c] = pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]]); const k = R(1, 2 + lv); return { q: `A right triangle has legs ${a * k} and ${b * k}. How long is the hypotenuse?`, a: c * k, wrong: [(a + b) * k, c * k + k, b * k + 1, (c + 1) * k], steps: [`Scale down by ${k}: ${a}-${b}-? → ${c}.`, `Scale back up: ${c * k}.`] }; },
      (lv) => { const [a, b, c] = pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41]]); const k = R(1, 3); return { q: `A ladder ${c * k} feet long leans against a wall. Its foot is ${a * k} feet from the wall. How high up the wall does it reach, in feet?`, a: b * k, wrong: [c * k - a * k, c * k + a * k, b * k + k, a * k], steps: [`(${c * k})² − (${a * k})² = ${(c * k) ** 2 - (a * k) ** 2}.`, `√${(b * k) ** 2} = ${b * k}.`] }; },
      (lv) => { const b = pick([6, 8, 10, 16, 24]), h = pick([4, 6, 8, 12, 15].filter((x) => Number.isInteger(Math.sqrt((b / 2) ** 2 + x * x)))); const legs = Math.sqrt((b / 2) ** 2 + h * h); return Number.isInteger(legs) ? { q: `An isosceles triangle has base ${b} and two equal sides of length ${legs}. What is its area?`, a: (b * h) / 2, wrong: [b * h, b * legs / 2, (b * legs) / 4 | 0, (b * h) / 2 + b], steps: [`The height splits the base into ${b / 2} and ${b / 2}.`, `Height = √(${legs}² − ${b / 2}²) = ${h}.`, `Area = ½ × ${b} × ${h} = ${(b * h) / 2}.`] } : { q: 'A square has side 5. What is the length of its diagonal?', a: '5√2', wrong: ['10', '5', '25', '5√3'], steps: ['Diagonal of a square = side × √2.', '5√2.'] }; },
      (lv) => { const s = pick([2, 4, 6, 8, 10]); return { q: `What is the area of an equilateral triangle with side ${s}?`, a: `${(s * s) / 4 === 1 ? '' : (s * s) / 4}√3`, wrong: [`${(s * s) / 2}√3`, `${(s * s) / 2}`, `${s * s}√3`, `${(s * s) / 4}√2`], steps: [`Height = (${s}/2)√3 = ${s / 2 === 1 ? '' : s / 2}√3.`, `Area = ½ × ${s} × height = ${(s * s) / 4 === 1 ? '' : (s * s) / 4}√3.`] }; },
    ],
  });

  T.push({
    id: 'area', name: 'Area & Perimeter', emoji: '🟪', color: '#ae3ec9',
    slides: [
      { h: 'The area formulas',
        svg: V.svg(V.rect(15, 40, 80, 60, 'a', 0) + V.t(15, 125, 'rect: l×w', 'tiny', 0) + V.poly('115,100 195,100 155,40', 'b', 0.8) + V.t(115, 125, 'tri: ½ b×h', 'tiny', 0.8) + V.poly('225,100 305,100 285,40 245,40', 'c', 1.6) + V.t(220, 125, 'trap: ½(a+b)h', 'tiny', 1.6) + V.t(15, 165, 'height is always ⟂ to the base', 'small', 2.4)),
        text: 'A triangle is half a rectangle. A trapezoid is the average of its parallel sides times the height.' },
      { h: 'Shaded area = big − small',
        svg: V.svg(V.rect(60, 20, 140, 140, 'a', 0) + V.rect(100, 60, 60, 60, 'empty', 1) + V.t(215, 90, '14² − 6²', 'small', 1.5) + V.t(215, 120, '= 160', 'small c-t', 2)),
        text: 'Most AMC shaded regions are "whole shape minus the unshaded parts". Never measure the weird shape directly.' },
      { h: 'Midpoint square = half',
        svg: V.svg(V.rect(80, 20, 140, 140, 'empty', 0) + V.poly('150,20 220,90 150,160 80,90', 'b', 1) + V.line(80, 90, 220, 90, 'red', 2) + V.line(150, 20, 150, 160, 'red', 2.2)),
        text: 'Join the midpoints of a square: the four corner triangles fold in exactly onto the inside. The inner square is half the area.' },
    ],
    tips: [
      { name: 'Same base, same height', how: 'Triangles with the same base whose tops lie on a line parallel to it all have the same area. Slide the tip!', ex: 'shearing keeps area' },
      { name: 'Grid problems: Pick or box', how: 'For a shape on dot paper, draw the bounding rectangle and subtract the right triangles at the corners.', ex: 'box − 3 triangles' },
    ],
    gens: [
      (lv) => { const a = R(4, 12), b = a + R(2, 10), h = R(3, 10) * 2; return { q: `A trapezoid has parallel sides ${a} and ${b} and height ${h}. What is its area?`, a: ((a + b) * h) / 2, wrong: [(a + b) * h, a * b, ((a + b) * h) / 2 + h, a * h], steps: [`Average of parallel sides: (${a} + ${b}) ÷ 2 = ${(a + b) / 2}.`, `× height ${h} = ${((a + b) * h) / 2}.`] }; },
      (lv) => { const S = R(8, 16), s = R(2, S - 4); return { q: `A ${s}×${s} square is cut out of the middle of a ${S}×${S} square. What is the area of what is left?`, a: S * S - s * s, wrong: [(S - s) ** 2, 4 * S - 4 * s, S * S, S * S - s], steps: [`Big: ${S * S}. Small: ${s * s}.`, `${S * S} − ${s * s} = ${S * S - s * s}.`] }; },
      (lv) => { const s = R(2, 10) * 2; return { q: `The midpoints of the sides of a square with side ${s} are joined to form a smaller square. What is the area of the smaller square?`, a: (s * s) / 2, wrong: [(s * s) / 4, s * s, s * 2, (s * s * 3) / 4], steps: [`The big square has area ${s * s}.`, `The midpoint square is exactly half: ${(s * s) / 2}.`] }; },
      (lv) => { const w = R(3, 12), l = w + R(1, 10); const P = 2 * (l + w); return { q: `A rectangle has perimeter ${P} and length ${l}. What is its area?`, a: l * w, wrong: [P * l / 4 | 0, l * (P / 2), (P / 2 - l) * (P / 2), l * l], steps: [`Length + width = ${P} ÷ 2 = ${P / 2}, so width = ${w}.`, `Area = ${l} × ${w} = ${l * w}.`] }; },
    ],
  });

  T.push({
    id: 'circles', name: 'Circles', emoji: '⭕', color: '#0ca678',
    slides: [
      { h: 'Two formulas, one radius',
        svg: V.svg(V.circ(100, 90, 65, 'a', 0) + V.line(100, 90, 165, 90, 'thick', 1) + V.t(118, 82, 'r', 'big', 1) + V.t(190, 70, 'C = 2πr', 'big', 1.5) + V.t(190, 120, 'A = πr²', 'big', 2)),
        text: 'Circumference is the distance around (2πr). Area is the space inside (πr²). Find r first!' },
      { h: 'Square around a circle',
        svg: V.svg(V.rect(80, 20, 140, 140, 'b', 0) + V.circ(150, 90, 70, 'a', 1) + V.t(232, 95, '4r² − πr²', 'small', 2)),
        text: 'A circle of radius r fits in a 2r × 2r square. The corners left over have area 4r² − πr².' },
      { h: 'Double the radius → 4× the area',
        svg: V.svg(V.circ(80, 100, 30, 'a', 0) + V.circ(210, 100, 60, 'b', 1) + V.t(60, 170, 'r', 'small', 0) + V.t(195, 175, '2r → 4×', 'small', 1.5)),
        text: 'Area grows with the square of the scale. Triple the radius → 9× the area.' },
    ],
    tips: [
      { name: 'Leave π alone', how: 'AMC answers keep π as a symbol, like 16π. Do not convert to 3.14 unless the problem asks.', ex: 'r = 4 → A = 16π' },
      { name: 'Quarter circles and semicircles', how: 'Many shaded shapes are just ½ or ¼ of a circle. Find the full circle area, then take the fraction.', ex: 'quarter circle r=6 → 9π' },
    ],
    gens: [
      (lv) => { const r = R(2, 12); return { q: `A circle has circumference ${piStr(2 * r)}. What is its area?`, a: piStr(r * r), wrong: [piStr(4 * r * r), piStr(2 * r * r), piStr(r), piStr(2 * r)], steps: [`2πr = ${piStr(2 * r)} → r = ${r}.`, `Area = π × ${r}² = ${piStr(r * r)}.`] }; },
      (lv) => { const r = R(1, 8); return { q: `A circle of radius ${r} is drawn inside a square so it touches all four sides. What is the area inside the square but outside the circle?`, a: `${4 * r * r} − ${piStr(r * r)}`, wrong: [`${2 * r * r} − ${piStr(r * r)}`, `${4 * r * r} − ${piStr(2 * r)}`, `${r * r} − ${piStr(r * r)}`, `${piStr(4 * r * r)} − ${r * r}`], steps: [`Square side = 2r = ${2 * r}, area ${4 * r * r}.`, `Circle area ${piStr(r * r)}; subtract.`] }; },
      (lv) => { const k = pick([2, 3, 4, 5]); return { q: `If the radius of a circle is multiplied by ${k}, its area is multiplied by…`, a: k * k, wrong: [k, 2 * k, k * k * k, k + 1], steps: ['Area scales with the square of the length.', `${k}² = ${k * k}.`] }; },
      (lv) => { const r = pick([2, 4, 6, 8, 10]); return { q: `What is the area of a quarter circle with radius ${r}?`, a: piStr((r * r) / 4), wrong: [piStr(r * r), piStr((r * r) / 2), piStr(r / 2), piStr(r)], steps: [`Full circle: ${piStr(r * r)}.`, `A quarter: ${piStr((r * r) / 4)}.`] }; },
    ],
  });

  T.push({
    id: 'solids', name: '3D: Cubes & Boxes', emoji: '🧊', color: '#1098ad',
    slides: [
      { h: 'Volume = l × w × h',
        svg: V.svg(V.poly('60,70 200,70 200,160 60,160', 'a', 0) + V.poly('60,70 110,30 250,30 200,70', 'b', 0.6) + V.poly('200,70 250,30 250,120 200,160', 'c', 1.2) + V.t(110, 120, 'l·w·h', 'big', 2)),
        text: 'Volume counts the little unit cubes inside. Surface area adds the 6 faces: 2(lw + lh + wh).' },
      { h: 'The painted cube',
        svg: V.svg([...Array(9)].map((_, i) => { const r = Math.floor(i / 3), c = i % 3; const corner = (r !== 1 && c !== 1), center = r === 1 && c === 1; return V.rect(90 + c * 46, 30 + r * 46, 42, 42, center ? 'd' : corner ? 'b' : 'a', i * 0.15); }).join('') + V.t(240, 60, '3 faces: corners', 'tiny', 1.5) + V.t(240, 95, '2 faces: edges', 'tiny', 1.8) + V.t(240, 130, '1 face: centers', 'tiny', 2.1)),
        text: 'Paint an n×n×n cube, then cut it up: 8 corners have 3 painted faces, 12(n−2) edge cubes have 2, 6(n−2)² face cubes have 1, and (n−2)³ inside cubes have none.' },
      { h: 'Scale a solid → cube the factor',
        svg: V.svg(V.rect(40, 100, 40, 40, 'a', 0) + V.rect(160, 60, 80, 80, 'b', 1) + V.t(30, 165, 'side ×2', 'small', 1) + V.t(160, 165, 'volume ×8', 'small', 1.5)),
        text: 'Lengths ×k → areas ×k² → volumes ×k³.' },
    ],
    tips: [
      { name: 'Hidden cubes', how: 'For "how many cubes can\'t be seen", the invisible inner block is (n−2)³ or a smaller box.', ex: '5×5×5 → 27 hidden' },
      { name: 'Unfold it', how: 'For shortest paths on a box surface, unfold the faces flat and draw a straight line.', ex: 'ant on a box' },
    ],
    gens: [
      (lv) => { const n = R(3, 5 + 3 * lv); const which = pick([3, 2, 1, 0]); const val = { 3: 8, 2: 12 * (n - 2), 1: 6 * (n - 2) ** 2, 0: (n - 2) ** 3 }[which]; const others = [8, 12 * (n - 2), 6 * (n - 2) ** 2, (n - 2) ** 3, 12 * n, 6 * n * n].filter((v) => v !== val); return { q: `A ${n}×${n}×${n} cube is painted on the outside, then cut into 1×1×1 cubes. How many small cubes have exactly ${which} painted face${which === 1 ? '' : 's'}?`, a: val, wrong: others, steps: [which === 3 ? 'Only the 8 corners have 3 painted faces.' : which === 2 ? `Edge cubes, not corners: 12 edges × (${n} − 2).` : which === 1 ? `Face centers: 6 faces × (${n} − 2)².` : `The hidden inner cube: (${n} − 2)³.`, `= ${val}.`] }; },
      (lv) => { const l = R(2, 9), w = R(2, 9), h = R(2, 9); return { q: `What is the surface area of a box that is ${l} by ${w} by ${h}?`, a: 2 * (l * w + l * h + w * h), wrong: [l * w * h, l * w + l * h + w * h, 6 * l * w, 2 * (l * w + l * h + w * h) - l * w], steps: [`Faces come in pairs: 2(${l * w} + ${l * h} + ${w * h}).`, `= ${2 * (l * w + l * h + w * h)}.`] }; },
      (lv) => { const k = pick([2, 3, 4]); return { q: `Every edge of a cube is multiplied by ${k}. Its volume is multiplied by…`, a: k ** 3, wrong: [k, k * k, 3 * k, 6 * k], steps: ['Volume uses three lengths.', `${k}³ = ${k ** 3}.`] }; },
      (lv) => { const s = R(2, 6), S = s * pick([2, 3, 4]); return { q: `How many ${s}×${s}×${s} cubes fit exactly inside a ${S}×${S}×${S} box?`, a: (S / s) ** 3, wrong: [S / s, (S / s) ** 2, ((S / s) ** 3) * 2, S * S * S], steps: [`Along each edge: ${S} ÷ ${s} = ${S / s}.`, `${S / s}³ = ${(S / s) ** 3}.`] }; },
    ],
  });

  T.push({
    id: 'coords', name: 'Coordinate Geometry', emoji: '📍', color: '#e8590c',
    slides: [
      { h: 'Distance = Pythagoras on a grid',
        svg: V.svg(V.line(40, 160, 300, 160, '', 0) + V.line(40, 10, 40, 160, '', 0) + V.circ(70, 140, 6, 'b', 0.5) + V.circ(190, 50, 6, 'b', 0.5) + V.line(70, 140, 190, 140, 'red', 1) + V.line(190, 140, 190, 50, 'red', 1.3) + V.line(70, 140, 190, 50, 'thick', 2) + V.t(110, 158, 'run 4', 'tiny', 1) + V.t(198, 100, 'rise 3', 'tiny', 1.3) + V.t(100, 85, '5', 'big', 2.3)),
        text: 'Draw the run and the rise; the distance is the hypotenuse.' },
      { h: 'Slope = rise ÷ run',
        svg: V.svg(V.line(30, 160, 290, 30, 'thick', 0) + V.line(110, 120, 190, 120, 'red', 1) + V.line(190, 120, 190, 80, 'red', 1.3) + V.t(200, 105, '+2', 'small', 1.3) + V.t(140, 140, '+4', 'small', 1) + V.t(30, 30, 'slope = 2/4 = 1/2', 'small', 2)),
        text: 'Going right, how much does it go up? Up is positive, down is negative.' },
      { h: 'Midpoint = average of coordinates',
        svg: V.svg(V.circ(50, 140, 6, 'b', 0) + V.circ(270, 40, 6, 'b', 0) + V.line(50, 140, 270, 40, '', 0.5) + V.circ(160, 90, 9, 'c', 1.5) + V.t(25, 165, '(1, 2)', 'tiny', 0) + V.t(240, 30, '(9, 8)', 'tiny', 0) + V.t(170, 115, '(5, 5)', 'small', 1.8)),
        text: 'Average the x\'s, average the y\'s.' },
    ],
    tips: [
      { name: 'Box method for area', how: 'For a triangle with corners on the grid, draw the smallest rectangle around it and subtract the corner triangles.', ex: 'rectangle − 3 right triangles' },
      { name: 'Triangle on the axes', how: 'A line crossing the axes at (a, 0) and (0, b) cuts off a triangle of area ab/2.', ex: 'x/4 + y/6 = 1 → area 12' },
    ],
    gens: [
      (lv) => { const [a, b, c] = pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15]]); const x = R(-5, 5), y = R(-5, 5); return { q: `What is the distance between (${x}, ${y}) and (${x + a}, ${y + b})?`, a: c, wrong: [a + b, c + 1, b, c * c], steps: [`Run ${a}, rise ${b}.`, `√(${a * a} + ${b * b}) = ${c}.`] }; },
      (lv) => { const x1 = R(-6, 6), y1 = R(-6, 6), dx = R(1, 6), dy = R(-6, 6); return { q: `What is the slope of the line through (${x1}, ${y1}) and (${x1 + dx}, ${y1 + dy})?`, a: frac(dy, dx), wrong: [frac(dx, dy || 1), frac(-dy, dx), String(dy), frac(dy + 1, dx)], steps: [`Rise ${dy}, run ${dx}.`, `${dy}/${dx} = ${frac(dy, dx)}.`] }; },
      (lv) => { const a = R(2, 10), b = R(2, 10) * 2; return { q: `The line through (${a}, 0) and (0, ${b}) and the two axes form a triangle. What is its area?`, a: (a * b) / 2, wrong: [a * b, a + b, (a * b) / 4, (a * a + b * b) / 2], steps: ['It is a right triangle with legs on the axes.', `½ × ${a} × ${b} = ${(a * b) / 2}.`] }; },
      (lv) => { const x1 = R(-8, 8), y1 = R(-8, 8), x2 = x1 + 2 * R(1, 6), y2 = y1 + 2 * R(-6, 6); return { q: `What is the midpoint of (${x1}, ${y1}) and (${x2}, ${y2})?`, a: `(${(x1 + x2) / 2}, ${(y1 + y2) / 2})`, wrong: [`(${x2 - x1}, ${y2 - y1})`, `(${(x2 - x1) / 2}, ${(y2 - y1) / 2})`, `(${x1 + x2}, ${y1 + y2})`, `(${(y1 + y2) / 2}, ${(x1 + x2) / 2})`], steps: ['Average each coordinate.', `((${x1} + ${x2})/2, (${y1} + ${y2})/2) = (${(x1 + x2) / 2}, ${(y1 + y2) / 2}).`] }; },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
