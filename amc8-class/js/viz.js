// Tiny SVG builders for lesson visuals. Every shape takes a delay `d` (in steps) so the
// picture builds itself piece by piece — one idea at a time keeps attention on the screen.
(function (root) {
  const st = (d) => (d == null ? '' : ` style="--d:${d}"`);
  const V = {
    svg: (inner, h = 180) => `<svg viewBox="0 0 320 ${h}" class="viz" role="img">${inner}</svg>`,
    t: (x, y, s, cls = '', d) => `<text x="${x}" y="${y}" class="pop ${cls}"${st(d)}>${s}</text>`,
    rect: (x, y, w, h, cls = 'a', d) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" class="pop ${cls}"${st(d)}/>`,
    line: (x1, y1, x2, y2, cls = '', d) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" pathLength="1" class="draw ${cls}"${st(d)}/>`,
    circ: (cx, cy, r, cls = 'a', d) => `<circle cx="${cx}" cy="${cy}" r="${r}" class="pop ${cls}"${st(d)}/>`,
    ring: (cx, cy, r, cls = '', d) => `<circle cx="${cx}" cy="${cy}" r="${r}" pathLength="1" class="draw ${cls}"${st(d)}/>`,
    poly: (pts, cls = 'a', d) => `<polygon points="${pts}" class="pop ${cls}"${st(d)}/>`,
    path: (dd, cls = '', d) => `<path d="${dd}" pathLength="1" class="draw ${cls}"${st(d)}/>`,
    // A row of n equal boxes, the first `shade` of them coloured — the classic bar model.
    bar(x, y, w, h, n, shade, cls = 'a', d = 0, label) {
      let s = '';
      for (let i = 0; i < n; i++) s += V.rect(x + (i * w) / n, y, w / n - 2, h, i < shade ? cls : 'empty', d + i * 0.15);
      if (label) s += V.t(x + w + 8, y + h / 2 + 5, label, 'small', d + n * 0.15);
      return s;
    },
    // Number line from a to b with optional highlighted points.
    numline(a, b, marks = [], d = 0) {
      const x0 = 20, x1 = 300, y = 110, sx = (v) => x0 + ((v - a) / (b - a)) * (x1 - x0);
      let s = V.line(x0, y, x1, y, 'thick', d);
      for (let v = a; v <= b; v++) s += V.line(sx(v), y - 6, sx(v), y + 6, '', d) + V.t(sx(v) - 4, y + 24, v, 'tiny', d);
      marks.forEach((m, i) => { s += V.circ(sx(m), y, 7, 'b', d + 1 + i * 0.4); });
      return s;
    },
    // Dot array (rows × cols) — great for multiplication, factors and counting.
    dots(rows, cols, x = 40, y = 30, gap = 22, cls = 'a', d = 0) {
      let s = '';
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) s += V.circ(x + c * gap, y + r * gap, 7, cls, d + (r * cols + c) * 0.05);
      return s;
    },
  };
  root.V = V;
})(typeof window !== 'undefined' ? window : globalThis);
