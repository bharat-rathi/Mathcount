// Basketball theme: ranks, opponents, rewards, halftime drills, and the Shootaround fact bank.
(function (root) {
  const { R, pick, isPrime } = root.U;

  const RANKS = ['Rookie', 'Rookie', 'Starter', 'Starter', 'All-Star', 'All-Star', 'MVP', 'MVP', 'Champion', 'Hall of Famer', 'GOAT'];
  const rankOf = (lvl) => RANKS[Math.min(lvl - 1, RANKS.length - 1)];

  // Invented opponents, one per topic, so every class is "a game".
  const TEAMS = ['Fraction Falcons', 'Prime Pythons', 'Ratio Raptors', 'Angle Alligators', 'Probability Panthers',
    'Circle Cyclones', 'Divisor Dragons', 'Percent Pelicans', 'Sequence Sharks', 'Counting Cobras', 'Exponent Eagles',
    'Remainder Rhinos', 'Median Mustangs', 'Pythagoras Pumas', 'Cube Crushers', 'Logic Lynx', 'Graph Gorillas'];
  const opponent = (idx) => TEAMS[((idx % TEAMS.length) + TEAMS.length) % TEAMS.length];

  // Rewards from post-game packs. Jerseys recolor his avatar; courts recolor the whole app.
  const JERSEYS = [
    { id: 'gold', name: 'Gold', main: '#fdb927', trim: '#552583' }, { id: 'wine', name: 'Wine', main: '#860038', trim: '#fdbb30' },
    { id: 'royal', name: 'Royal', main: '#1d428a', trim: '#ffc72c' }, { id: 'red', name: 'Fire Red', main: '#ce1141', trim: '#111111' },
    { id: 'teal', name: 'Teal', main: '#00788c', trim: '#f9a01b' }, { id: 'black', name: 'Blackout', main: '#111111', trim: '#e5e5e5' },
    { id: 'green', name: 'Emerald', main: '#007a33', trim: '#ffffff' }, { id: 'purple', name: 'Purple Reign', main: '#552583', trim: '#fdb927' },
  ];
  const COURTS = [
    { id: 'hardwood', name: 'Classic Hardwood', accent: '#e8590c', accent2: '#7048e8' },
    { id: 'night', name: 'Night Game', accent: '#4263eb', accent2: '#f59f00' },
    { id: 'street', name: 'Street Court', accent: '#d6336c', accent2: '#0ca678' },
    { id: 'finals', name: 'Finals Gold', accent: '#c99700', accent2: '#552583' },
    { id: 'ice', name: 'Ice Arena', accent: '#1098ad', accent2: '#e64980' },
  ];

  const HALFTIME = ['Dribble in place: 20 bounces each hand 🏀', 'Defensive slides: 10 each way 🦵', 'Jump-shot form: 10 air shots 🎯',
    'Crossover moves: 20 fast fake-outs ↔️', 'Calf raises × 15, like you are going up for a dunk ⬆️', 'Pivot drill: 10 pivots each foot 🔄',
    'Wall sit for 20 seconds: you are boxing out 🧱', 'Slow deep breaths × 5: you are at the free-throw line 🌬️'];

  // ── Shootaround: one-line facts a "calculation machine" should know instantly.
  // Each generator returns {key, q, a} where a is a whole number (typed on a keypad).
  const FACTS = [
    () => { const n = R(11, 30); return { key: `sq${n}`, q: `${n}²`, a: n * n }; },
    () => { const n = R(2, 10); return { key: `cu${n}`, q: `${n}³`, a: n ** 3 }; },
    () => { const n = R(5, 12); return { key: `p2${n}`, q: `2^${n}`, a: 2 ** n }; },
    () => { const n = R(12, 98); return { key: `x11-${n}`, q: `11 × ${n}`, a: 11 * n }; },
    () => { const n = R(3, 40); return { key: `x25-${n}`, q: `25 × ${n}`, a: 25 * n }; },
    () => { const n = R(12, 49); return { key: `x5-${n}`, q: `5 × ${n * 2 + 1}`, a: 5 * (n * 2 + 1) }; },
    () => { const [d, n] = pick([[8, 1], [8, 3], [8, 5], [8, 7], [5, 2], [5, 3], [4, 3], [20, 3], [25, 4], [40, 3]]); return { key: `pct${n}/${d}`, q: `${n}/${d} = ?%`, a: (100 * n) / d }; },
    () => { const m = pick([50, 60, 100]), k = R(1, 4); return { key: `dsq${m}${k}`, q: `${m + k} × ${m - k}`, a: m * m - k * k }; },
    () => { const [a, b, c] = pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [6, 8, 10], [9, 12, 15], [20, 21, 29], [9, 40, 41]]); return { key: `tri${a}${b}`, q: `legs ${a}, ${b} → hypotenuse`, a: c }; },
    () => { const n = R(10, 40); return { key: `gauss${n}`, q: `1 + 2 + … + ${n}`, a: (n * (n + 1)) / 2 }; },
    () => { const lo = R(30, 95); let n = lo; while (isPrime(n)) n++; let f = 2; while (n % f) f++; return { key: `sm${n}`, q: `smallest prime factor of ${n}`, a: f }; },
    () => { const p = pick([2, 3, 4, 5, 6, 7, 8, 9]), n = R(20, 99); return { key: `u${p}`, q: `units digit of ${p}^${n}`, a: Number(String(p ** (((n - 1) % 4) + 1)).slice(-1)) }; },
  ];

  // Spaced repetition: facts missed recently come back first; a fact answered fast and right
  // moves up a box and shows up less often.
  function nextFact(state) {
    const facts = state.facts || (state.facts = {});
    const weak = Object.entries(facts).filter(([, f]) => f.box < 2 && f.q);
    if (weak.length && Math.random() < 0.4) {
      const [key, f] = pick(weak);
      return { key, q: f.q, a: f.a };
    }
    return pick(FACTS)();
  }
  function recordFact(state, fact, ok, ms) {
    const facts = state.facts || (state.facts = {});
    const f = facts[fact.key] || (facts[fact.key] = { box: 0, q: fact.q, a: fact.a });
    f.box = ok && ms < 5000 ? Math.min(5, f.box + 1) : 0;
  }

  root.Hoops = { rankOf, opponent, JERSEYS, COURTS, HALFTIME, FACTS, nextFact, recordFact };
})(typeof window !== 'undefined' ? window : globalThis);
