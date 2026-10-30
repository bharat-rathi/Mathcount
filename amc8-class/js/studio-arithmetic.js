// Concept Studio, chapter: Numbers & arithmetic. Same clip format as studio-counting.js.
(function (root) {
  const V = root.V;
  const C = (root.CLIPS = root.CLIPS || []);
  const S = V.svg;

  // A fraction bar: n equal pieces, the first k shaded, at height y.
  const fbar = (y, n, k, cls, d = 0, label) => V.bar(30, y, 220, 36, n, k, cls, d, label);

  C.push(
    {
      id: 'ar-x25', topic: 'mental', emoji: '⚡', title: '× 25 is ÷ 4 in disguise',
      frames: [
        { svg: S(V.t(70, 80, '48 × 25', 'huge', 0) + V.t(60, 140, 'in your head?', 'small', 0.8)),
          say: 'Work out {g:48 × 25} in your head, in about 3 seconds.' },
        { svg: S(['💯', '💯', '💯', '💯'].map((e, i) => V.rect(20 + i * 72, 50, 66, 60, ['d', 'b', 'c', 'a'][i], i * 0.3) + V.t(36 + i * 72, 90, '25', 'big', i * 0.3)).join('') + V.t(70, 150, '4 quarters = 100', 'big', 1.4)),
          say: '25 is a {g:quarter} of 100. So × 25 is the same as × 100, then ÷ 4.' },
        { svg: S(V.t(20, 70, '48 × 100 = 4800', 'big', 0) + V.t(20, 120, '4800 ÷ 4 = 1200', 'big c-t', 0.8)),
          say: '48 × 100 = 4800, then 4800 ÷ 4 = {a:1200}. No long multiplication!' },
        { svg: S(V.t(20, 60, '× 5 = × 10 ÷ 2', 'big', 0) + V.t(20, 105, '× 25 = × 100 ÷ 4', 'big', 0.5) + V.t(20, 150, '× 50 = × 100 ÷ 2', 'big', 1)),
          say: 'The same trick works for {g:× 5} and {g:× 50} too.' },
      ],
      check: { q: 'What is 36 × 25?', options: ['750', '800', '900', '960'], answer: '900', why: '36 × 100 = 3600, then 3600 ÷ 4 = 900.' },
      remember: '× 25 → × 100 ÷ 4.   × 5 → × 10 ÷ 2.',
    },
    {
      id: 'ar-squares', topic: 'mental', emoji: '🟪', title: 'Near-twin products',
      frames: [
        { svg: S(V.t(70, 80, '98 × 102', 'huge', 0) + V.t(60, 140, 'both are 2 away from 100', 'small', 0.8)),
          say: 'What is {g:98 × 102}? Notice both numbers are {g:2 away from 100}.' },
        { svg: S(V.rect(30, 20, 140, 140, 'b', 0) + V.rect(140, 130, 30, 30, 'empty', 0.6) + V.t(70, 95, '100²', 'big', 0.3) + V.t(144, 151, '2²', 'tiny', 0.8) + V.t(190, 70, 'big square', 'small', 1) + V.t(190, 95, 'minus a tiny one', 'small', 1.2)),
          say: 'Picture a 100 × 100 square with a tiny {g:2 × 2} corner cut off. That shape rearranges into a 98 × 102 rectangle.' },
        { svg: S(V.t(20, 70, '98 × 102 = 100² − 2²', 'big', 0) + V.t(40, 125, '= 10000 − 4 = 9996', 'big c-t', 0.8)),
          say: 'So 98 × 102 = 100² − 2² = 10000 − 4 = {a:9996}.' },
        { svg: S(V.t(20, 80, '(a − b)(a + b) = a² − b²', 'big', 0) + V.t(20, 135, '47 × 53 = 50² − 3²', 'small b-t', 0.8)),
          say: 'Any two numbers the {g:same distance} from a round number: square the middle, subtract the distance squared.' },
      ],
      check: { q: 'What is 47 × 53?', options: ['2491', '2500', '2509', '2591'], answer: '2491', why: '47 and 53 are 3 away from 50: 50² − 3² = 2500 − 9 = 2491.' },
      remember: 'Twins around a middle: middle² − distance².',
    },
    {
      id: 'ar-addfrac', topic: 'fractions', emoji: '🍕', title: 'Adding fractions: same-size pieces',
      frames: [
        { svg: S(fbar(30, 2, 1, 'd', 0, '½') + fbar(100, 3, 1, 'b', 0.6, '⅓')),
          say: '{g:½ + ⅓}? You can\'t just add the pieces: they are {g:different sizes}.' },
        { svg: S(fbar(30, 6, 3, 'd', 0, '3/6') + fbar(100, 6, 2, 'b', 0.6, '2/6')),
          say: 'Cut both bars into {g:sixths}. Now ½ = 3/6 and ⅓ = 2/6: same-size pieces.' },
        { svg: S(V.bar(30, 60, 220, 36, 6, 5, 'c', 0, '5/6') + V.t(40, 150, '3/6 + 2/6 = 5/6', 'big c-t', 1)),
          say: 'Now just count pieces: 3 + 2 = 5 sixths. ½ + ⅓ = {a:5/6}.' },
      ],
      check: { q: 'What is 1/4 + 1/3?', options: ['2/7', '5/12', '7/12', '1/12'], answer: '7/12', why: 'Twelfths: 3/12 + 4/12 = 7/12.' },
      remember: 'Add fractions only when the pieces are the same size: find a common denominator first.',
    },
    {
      id: 'ar-fracof', topic: 'fractions', emoji: '🍪', title: '"¾ of" means split, then take',
      frames: [
        { svg: S(V.dots(4, 5, 60, 30, 26, 'a', 0) + V.t(200, 90, '20 cookies', 'small', 1)),
          say: 'What is {g:¾ of 20} cookies?' },
        { svg: S([0, 1, 2, 3].map((r) => V.rect(45, 17 + r * 26, 132, 26, r < 3 ? 'b op' : 'empty', 0.2 + r * 0.2)).join('') + V.dots(4, 5, 60, 30, 26, 'a') + V.t(200, 80, '4 groups', 'small', 1) + V.t(200, 105, 'of 5', 'small', 1)),
          say: 'The bottom number says {g:split into 4} equal groups: 20 ÷ 4 = 5 in each.' },
        { svg: S(V.t(40, 80, '3 groups × 5 = 15', 'big', 0) + V.t(40, 130, '¾ of 20 = 15', 'big c-t', 0.8)),
          say: 'The top number says {g:take 3} groups: 3 × 5 = {a:15}.' },
      ],
      check: { q: 'What is 2/5 of 35?', options: ['7', '10', '14', '21'], answer: '14', why: '35 ÷ 5 = 7, then 2 × 7 = 14.' },
      remember: 'Fraction of a number: ÷ by the bottom, × by the top.',
    },
    {
      id: 'ar-pct', topic: 'percents', emoji: '💯', title: 'Percents from 10%',
      frames: [
        { svg: S(V.t(60, 90, '35% of 80', 'huge', 0)),
          say: 'Find {g:35% of 80} in your head.' },
        { svg: S(V.t(20, 50, '10% of 80 = 8', 'big', 0) + V.t(20, 95, '5% = half of that = 4', 'big', 0.6) + V.t(20, 140, '30% = 3 × 8 = 24', 'big', 1.2)),
          say: '{g:10%} is easy: move the decimal one place, 8. Half of that is {g:5%}: 4. Three 10%s make {g:30%}: 24.' },
        { svg: S(V.t(40, 80, '35% = 30% + 5%', 'big', 0) + V.t(40, 130, '= 24 + 4 = 28', 'big c-t', 0.8)),
          say: 'Build it from blocks: 35% = 30% + 5% = 24 + 4 = {a:28}.' },
        { svg: S(V.t(20, 80, '8% of 50 = 50% of 8', 'big', 0) + V.t(90, 130, '= 4', 'big c-t', 0.8)),
          say: 'Bonus: {g:x% of y = y% of x}. 8% of 50 is the same as 50% of 8, which is 4.' },
      ],
      check: { q: 'What is 15% of 60?', options: ['6', '9', '12', '15'], answer: '9', why: '10% = 6 and 5% = 3, so 15% = 9.' },
      remember: 'Start from 10% (move the decimal), then build: 5% is half, 20% is double.',
    },
    {
      id: 'ar-pctchange', topic: 'percents', emoji: '🎢', title: 'Up 20%, down 20% ≠ back',
      frames: [
        { svg: S(V.t(20, 70, '$100 → up 20% → down 20%', 'small', 0) + V.t(90, 130, '= $100?', 'big', 0.8)),
          say: 'A price goes {g:up 20%}, then {g:down 20%}. Is it back where it started?' },
        { svg: S(V.rect(40, 60, 60, 100, 'b', 0) + V.t(50, 180, '$100', 'tiny', 0) + V.rect(130, 40, 60, 120, 'c', 0.6) + V.t(140, 180, '$120', 'tiny', 0.6) + V.rect(220, 64, 60, 96, 'd', 1.2) + V.t(232, 180, '$96', 'tiny', 1.2), 190),
          say: 'Up 20%: 100 → {g:120}. Down 20% of 120 is 24, so 120 → {a:96}. Not 100!' },
        { svg: S(V.t(20, 70, 'up 20% → × 1.2', 'big', 0) + V.t(20, 115, 'down 20% → × 0.8', 'big', 0.6) + V.t(20, 160, '1.2 × 0.8 = 0.96', 'big c-t', 1.2)),
          say: 'Use {g:multipliers}: up 20% is × 1.2, down 20% is × 0.8. Together × 0.96: a 4% drop.' },
      ],
      check: { q: 'A $50 game goes up 10%, then that new price goes down 10%. What is the final price?', options: ['$45', '$49.50', '$50', '$55'], answer: '$49.50', why: '50 × 1.1 = 55, then 55 × 0.9 = 49.50.' },
      remember: 'Percent change → multiply: up r% is × (1 + r/100), down r% is × (1 − r/100).',
    },
    {
      id: 'ar-ratio', topic: 'ratios', emoji: '⚖️', title: 'Ratios are parts',
      frames: [
        { svg: S(V.t(20, 70, 'boys : girls = 2 : 3', 'big', 0) + V.t(20, 125, '30 kids in all', 'big b-t', 0.6)),
          say: 'In a class, {g:boys : girls = 2 : 3}, and there are {g:30 kids}. How many {f:girls}?' },
        { svg: S(V.t(10, 60, 'boys', 'small', 0) + [0, 1].map((i) => V.rect(70 + i * 46, 40, 44, 30, 'b', 0.2 + i * 0.2)).join('') + V.t(10, 110, 'girls', 'small', 0.6) + [0, 1, 2].map((i) => V.rect(70 + i * 46, 90, 44, 30, 'd', 0.8 + i * 0.2)).join('') + V.t(70, 160, '5 parts = 30 kids', 'big', 1.6)),
          say: 'Draw {g:2 parts} for boys and {g:3 parts} for girls. That\'s 5 equal parts making 30.' },
        { svg: S(V.t(10, 60, 'boys', 'small') + [0, 1].map((i) => V.rect(70 + i * 46, 40, 44, 30, 'b') + V.t(84 + i * 46, 61, '6', 'small', 0.4)).join('') + V.t(10, 110, 'girls', 'small') + [0, 1, 2].map((i) => V.rect(70 + i * 46, 90, 44, 30, 'd') + V.t(84 + i * 46, 111, '6', 'small', 0.6)).join('') + V.t(220, 111, '= 18', 'big c-t', 1.2)),
          say: 'Each part is 30 ÷ 5 = 6. Girls: 3 × 6 = {a:18}. (Boys: 12.)' },
      ],
      check: { q: 'Red : blue marbles = 3 : 5. There are 40 marbles in all. How many are red?', options: ['8', '15', '24', '25'], answer: '15', why: '8 parts = 40, so 1 part = 5. Red = 3 × 5 = 15.' },
      remember: 'Ratio a : b → a + b equal parts. Find one part, then multiply.',
    },
    {
      id: 'ar-recipe', topic: 'ratios', emoji: '🧁', title: 'Scaling a recipe',
      frames: [
        { svg: S(V.t(20, 70, '2 cups flour → 6 muffins', 'big', 0) + V.t(20, 130, '? cups → 18 muffins', 'big', 0.8)),
          say: '{g:2 cups} of flour make {g:6 muffins}. How much flour for {f:18 muffins}?' },
        { svg: S(V.t(40, 70, '6 → 18 is × 3', 'big', 0) + [0, 1, 2].map((i) => V.t(40 + i * 80, 130, '🧁🧁', 'big', 0.5 + i * 0.3)).join('')),
          say: '18 is {g:3 times} 6, so you need 3 batches.' },
        { svg: S(V.t(40, 90, '2 cups × 3 = 6 cups', 'big c-t', 0)),
          say: 'Everything in the recipe scales by the same factor: 2 × 3 = {a:6 cups}.' },
      ],
      check: { q: '3 eggs make 12 pancakes. How many eggs for 20 pancakes?', options: ['4', '5', '6', '8'], answer: '5', why: '1 egg makes 4 pancakes, so 20 pancakes need 20 ÷ 4 = 5 eggs.' },
      remember: 'Same ratio → find the scale factor (or the amount for 1), then multiply.',
    },
    {
      id: 'ar-dst', topic: 'rates', emoji: '🚗', title: 'Distance = speed × time',
      frames: [
        { svg: S(V.poly('160,20 60,160 260,160', 'empty', 0) + V.line(95, 110, 225, 110, '', 0.4) + V.line(160, 110, 160, 160, '', 0.4) + V.t(150, 90, 'D', 'big', 0.7) + V.t(100, 145, 'S', 'big', 0.9) + V.t(195, 145, 'T', 'big', 1.1)),
          say: 'The magic triangle: {g:D}istance on top, {g:S}peed and {g:T}ime below.' },
        { svg: S(V.t(20, 50, 'D = S × T', 'big', 0) + V.t(20, 95, 'S = D ÷ T', 'big', 0.5) + V.t(20, 140, 'T = D ÷ S', 'big', 1)),
          say: 'Cover the one you want: {g:D = S × T}, S = D ÷ T, T = D ÷ S.' },
        { svg: S(V.t(20, 70, '60 mph for 2½ hours', 'big', 0) + V.t(20, 125, 'D = 60 × 2.5 = 150', 'big c-t', 0.8)),
          say: 'A car drives 60 miles per hour for 2½ hours: D = 60 × 2.5 = {a:150 miles}.' },
      ],
      check: { q: 'A bus travels 180 miles at 45 miles per hour. How long does the trip take?', options: ['3 hours', '4 hours', '4.5 hours', '5 hours'], answer: '4 hours', why: 'T = D ÷ S = 180 ÷ 45 = 4.' },
      remember: 'D = S × T. Cover what you want in the triangle.',
    },
    {
      id: 'ar-avgspeed', topic: 'rates', emoji: '🔁', title: 'The average-speed trap',
      frames: [
        { svg: S(V.t(20, 60, 'there: 60 mph', 'big', 0) + V.t(20, 105, 'back: 30 mph', 'big', 0.5) + V.t(20, 155, 'average = 45?', 'big red-t', 1)),
          say: 'Drive {g:60 miles} to a game at 60 mph and back at 30 mph. Is the average speed 45? {f:Careful!}' },
        { svg: S(V.t(20, 60, 'there: 60 mi ÷ 60 = 1 h', 'small', 0) + V.t(20, 100, 'back: 60 mi ÷ 30 = 2 h', 'small', 0.6) + V.t(20, 145, '120 miles in 3 hours', 'big', 1.2)),
          say: 'Find the {g:times}: 1 hour there, 2 hours back. That\'s 120 miles in 3 hours.' },
        { svg: S(V.t(20, 80, '120 ÷ 3 = 40 mph', 'big c-t', 0) + V.t(20, 135, 'total distance ÷ total time', 'small', 0.8)),
          say: 'Average speed = {g:total distance ÷ total time} = 120 ÷ 3 = {a:40 mph}. You spend longer going slowly, so it pulls the average down.' },
      ],
      check: { q: 'You bike 12 miles to a park at 12 mph and back at 6 mph. What is your average speed for the whole trip?', options: ['8 mph', '9 mph', '10 mph', '18 mph'], answer: '8 mph', why: '1 hour there + 2 hours back = 24 miles in 3 hours = 8 mph.' },
      remember: 'Average speed = total distance ÷ total time. Never just average the speeds.',
    },
    {
      id: 'ar-work', topic: 'rates', emoji: '🎨', title: 'Working together',
      frames: [
        { svg: S(V.t(20, 70, 'Ann paints a fence in 3 h', 'small', 0) + V.t(20, 105, 'Ben paints it in 6 h', 'small', 0.5) + V.t(20, 150, 'together?', 'big', 1)),
          say: 'Ann paints a fence in {g:3 hours}. Ben takes {g:6 hours}. How long {f:together}?' },
        { svg: S(V.bar(20, 40, 180, 34, 6, 2, 'd', 0, 'Ann: 1/3') + V.bar(20, 100, 180, 34, 6, 1, 'b', 0.6, 'Ben: 1/6')),
          say: 'Think {g:per hour}: Ann does 1/3 of the fence each hour, Ben does 1/6.' },
        { svg: S(V.bar(20, 50, 180, 34, 6, 3, 'c', 0, 'both: 1/2') + V.t(40, 150, '1/2 per hour → 2 hours', 'big c-t', 1)),
          say: 'Together: 1/3 + 1/6 = {g:1/2} of the fence per hour, so the whole fence takes {a:2 hours}.' },
      ],
      check: { q: 'One hose fills a pool in 4 hours, another in 12 hours. How long do they take together?', options: ['3 hours', '6 hours', '8 hours', '16 hours'], answer: '3 hours', why: '1/4 + 1/12 = 4/12 = 1/3 of the pool per hour → 3 hours.' },
      remember: 'Work problems: add the amounts done per hour, then flip.',
    },
    {
      id: 'ar-units', topic: 'units', emoji: '⏱️', title: 'Converting units',
      frames: [
        { svg: S(V.t(40, 90, '3 hours = ? seconds', 'big', 0)),
          say: 'How many {f:seconds} are in {g:3 hours}?' },
        { svg: S(V.t(20, 60, '3 h × 60 min/h = 180 min', 'small', 0) + V.t(20, 105, '180 min × 60 s/min = 10800 s', 'small', 0.8) + V.t(20, 150, 'hours and minutes cancel out', 'small c-t', 1.6)),
          say: 'Chain the conversions and let the units {g:cancel}: 3 × 60 = 180 minutes, × 60 = {a:10,800 seconds}.' },
        { svg: S(V.rect(30, 30, 120, 120, 'b op', 0) + [1, 2].map((i) => V.line(30 + i * 40, 30, 30 + i * 40, 150, '', 0.3) + V.line(30, 30 + i * 40, 150, 30 + i * 40, '', 0.3)).join('') + V.t(70, 172, '1 yd = 3 ft', 'tiny', 0.5) + V.t(170, 80, '1 yd² = 3 × 3', 'small', 0.9) + V.t(170, 105, '= 9 ft²', 'small c-t', 1.1), 180),
          say: 'Careful with {g:area}: 1 yard = 3 feet, but 1 square yard = 3 × 3 = {a:9} square feet.' },
      ],
      check: { q: 'How many minutes are in 2 days?', options: ['120', '1440', '2880', '172800'], answer: '2880', why: '2 × 24 = 48 hours, and 48 × 60 = 2880 minutes.' },
      remember: 'Chain conversions so units cancel. Area units convert twice (squared).',
    },
  );
})(typeof window !== 'undefined' ? window : globalThis);
