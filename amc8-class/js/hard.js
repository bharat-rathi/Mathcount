// Hand-written clutch problems at AMC 8 #16–25 level. All original (not copied from any
// contest). Each answer was checked by brute force when the problems were written.
// Fields: topic (app topic id), q, choices (A–E in order), a (the right choice),
// hints [small, big], steps (full solution), key (the deciding idea, for the "key idea" check).
(function (root) {
  const H = [
    // ── Counting & casework
    { id: 'h01', topic: 'combos', q: 'How many three-digit numbers have digits in strictly increasing order (like 147) and contain the digit 5?', choices: ['21', '24', '28', '36', '84'], a: '28',
      hints: ['Increasing digits are decided just by WHICH three digits you pick.', 'Count the cases where 5 is the smallest, middle, or largest digit.'],
      steps: ['Picking 3 different digits from 1–9 gives exactly one increasing number.', '5 smallest: pick 2 from {6,7,8,9} = 6. 5 middle: 4 × 4 = 16. 5 largest: pick 2 from {1,2,3,4} = 6.', '6 + 16 + 6 = 28.'], key: 'A choice of digits = one number' },
    { id: 'h02', topic: 'paths', q: 'Moving only right or up on grid lines, how many shortest paths go from (0, 0) to (4, 4) WITHOUT passing through the point (2, 2)?', choices: ['34', '36', '40', '64', '70'], a: '34',
      hints: ['Count all paths, then take away the bad ones.', 'Bad paths go (0,0)→(2,2)→(4,4).'],
      steps: ['All paths: C(8, 4) = 70.', 'Through (2,2): C(4, 2) × C(4, 2) = 6 × 6 = 36.', '70 − 36 = 34.'], key: 'Total minus the bad ones' },
    { id: 'h03', topic: 'combos', q: 'In how many ways can the letters of BASKET be arranged so that B and K are NOT next to each other?', choices: ['240', '360', '480', '600', '720'], a: '480',
      hints: ['It is easier to count arrangements where B and K ARE together.', 'Glue B and K into one block: 5 items, and the block can be BK or KB.'],
      steps: ['All arrangements: 6! = 720.', 'B and K together: 5! × 2 = 240.', '720 − 240 = 480.'], key: 'Total minus the bad ones' },
    { id: 'h04', topic: 'paths', q: '10 identical basketballs go into 4 bins labeled A, B, C, D. Every bin gets at least 1 ball, and bin A gets at most 3. How many ways are there?', choices: ['48', '56', '64', '72', '84'], a: '64',
      hints: ['Split into cases by how many balls bin A gets: 1, 2, or 3.', 'For each case, share the rest among B, C, D with each getting at least 1.'],
      steps: ['A = 1: share 9 among 3 bins, each ≥ 1: C(8, 2) = 28.', 'A = 2: share 8: C(7, 2) = 21. A = 3: share 7: C(6, 2) = 15.', '28 + 21 + 15 = 64.'], key: 'Split into cases' },
    { id: 'h05', topic: 'counting', q: 'How many positive integers less than 1000 have digits that are all odd or all even?', choices: ['155', '224', '250', '279', '300'], a: '279',
      hints: ['Count all-odd and all-even separately, by number of digits.', 'An all-even number cannot start with 0.'],
      steps: ['All odd: 5 + 25 + 125 = 155.', 'All even: 4 (one digit) + 4 × 5 + 4 × 25 = 124.', '155 + 124 = 279.'], key: 'Fill the fussy slot first' },
    { id: 'h06', topic: 'casework', q: 'A team scores exactly 10 points using only 2-point and 3-point baskets. If the ORDER of the baskets matters, how many different scoring sequences are there?', choices: ['4', '5', '6', '7', '9'], a: '7',
      hints: ['Case on how many 3-pointers there are.', '10 = 2+2+2+2+2 or 3+3+2+2. Count orders of each.'],
      steps: ['Zero 3s: five 2s, 1 order. Two 3s and two 2s: C(4, 2) = 6 orders.', '(One or three 3s leave an odd remainder, which 2s cannot make.)', '1 + 6 = 7.'], key: 'Split into cases' },
    { id: 'h07', topic: 'counting', q: 'How many four-digit numbers have at least two digits that are the same?', choices: ['4464', '4536', '4500', '5040', '5464'], a: '4464',
      hints: ['"At least two the same" is the opposite of "all different".', 'All different: 9 × 9 × 8 × 7.'],
      steps: ['Four-digit numbers: 9000.', 'All digits different: 9 × 9 × 8 × 7 = 4536.', '9000 − 4536 = 4464.'], key: 'Flip it: count the opposite' },
    { id: 'h08', topic: 'combos', q: 'In a league, every team plays every other team exactly once. There were 66 games in all. How many teams are in the league?', choices: ['11', '12', '13', '22', '33'], a: '12',
      hints: ['n teams play n(n − 1) ÷ 2 games.', 'Find n with n(n − 1) = 132.'],
      steps: ['Games = n(n − 1)/2 = 66, so n(n − 1) = 132.', '12 × 11 = 132, so n = 12.'], key: 'Each game is a pair' },
    { id: 'h09', topic: 'casework', q: 'How many different triangles have whole-number side lengths and a perimeter of 15? (Triangles with the same three side lengths count once.)', choices: ['5', '6', '7', '8', '12'], a: '7',
      hints: ['List sides a ≤ b ≤ c with a + b + c = 15.', 'Triangle rule: a + b > c, so the longest side c is at most 7.'],
      steps: ['c = 7: (1,7,7), (2,6,7), (3,5,7), (4,4,7). c = 6: (3,6,6), (4,5,6). c = 5: (5,5,5).', 'That is 7 triangles.'], key: 'Organized list' },
    // ── Probability
    { id: 'h10', topic: 'probability', q: 'A player makes each free throw with probability 2/3. She shoots 3 free throws. What is the probability she makes exactly 2?', choices: ['2/9', '1/3', '4/9', '2/3', '8/27'], a: '4/9',
      hints: ['One way: make, make, miss. What is its probability?', 'The miss can be in any of 3 spots.'],
      steps: ['Make, make, miss: (2/3)(2/3)(1/3) = 4/27.', 'The miss can be 1st, 2nd or 3rd: 3 × 4/27 = 12/27 = 4/9.'], key: 'Multiply down a path, add the paths' },
    { id: 'h11', topic: 'probability', q: 'Two fair dice are rolled. What is the probability that the sum is a prime number?', choices: ['1/3', '5/12', '1/2', '7/18', '4/9'], a: '5/12',
      hints: ['Prime sums possible: 2, 3, 5, 7, 11.', 'Count the ways for each: 1, 2, 4, 6, 2.'],
      steps: ['Ways: sum 2: 1, sum 3: 2, sum 5: 4, sum 7: 6, sum 11: 2. Total 15.', '15/36 = 5/12.'], key: 'Organized list' },
    { id: 'h12', topic: 'probability', q: 'A coach picks 2 players at random from 4 boys and 3 girls. What is the probability of picking one boy and one girl?', choices: ['2/7', '3/7', '4/7', '12/49', '1/2'], a: '4/7',
      hints: ['Count all pairs: C(7, 2).', 'Boy-girl pairs: 4 × 3.'],
      steps: ['All pairs: C(7, 2) = 21. Boy-girl pairs: 4 × 3 = 12.', '12/21 = 4/7.'], key: 'Good outcomes ÷ total outcomes' },
    { id: 'h13', topic: 'probplus', q: 'A point is chosen at random inside a 4 × 4 square. What is the probability that it is within 1 unit of some corner of the square?', choices: ['π/16', 'π/8', 'π/4', '1/4', '1/16'], a: 'π/16',
      hints: ['Points within 1 of a corner form a quarter circle of radius 1.', 'Four quarter circles make one whole circle.'],
      steps: ['Four quarter circles of radius 1 = one circle of area π.', 'Square area: 16. Probability: π/16.'], key: 'Area = chance' },
    { id: 'h14', topic: 'probplus', q: 'A coin is flipped 5 times. What is the probability that no two heads come up in a row?', choices: ['11/32', '13/32', '1/2', '5/16', '15/32'], a: '13/32',
      hints: ['Count good sequences for 1, 2, 3 flips first and look for a pattern.', 'Good sequences: 2, 3, 5, 8, …'],
      steps: ['Good sequences of length n: 2, 3, 5, 8, 13 (each = the two before added).', '13 good out of 2⁵ = 32: 13/32.'], key: 'Build up small' },
    // ── Logic
    { id: 'h15', topic: 'logic', q: 'A drawer has 6 red, 8 blue, and 10 green socks. In the dark, what is the fewest you must take to be SURE you have 3 green socks?', choices: ['3', '7', '13', '17', '21'], a: '17',
      hints: ['Imagine the unluckiest grabs.', 'Unlucky: every red and every blue sock first.'],
      steps: ['Worst case: all 6 red and all 8 blue = 14 socks, no green yet.', 'Then 3 more must be green: 14 + 3 = 17.'], key: 'Worst case first' },
    { id: 'h16', topic: 'logic', q: 'Five different positive whole numbers have an average of 10. What is the largest possible value of the biggest one?', choices: ['30', '36', '40', '45', '46'], a: '40',
      hints: ['The total is fixed. To make one number big, make the others tiny.', 'The others must be different: 1, 2, 3, 4.'],
      steps: ['Total = 5 × 10 = 50.', 'Smallest possible others: 1 + 2 + 3 + 4 = 10.', 'Biggest: 50 − 10 = 40.'], key: 'Push to the extreme' },
    { id: 'h17', topic: 'logic', q: 'Seven different positive whole numbers have a median of 10. What is the smallest possible average of the seven numbers?', choices: ['52/7', '7', '8', '55/7', '10'], a: '52/7',
      hints: ['Make every number as small as it is allowed to be.', 'The three numbers above 10 must be at least 11, 12, 13.'],
      steps: ['Smallest choice: 1, 2, 3, 10, 11, 12, 13.', 'Sum: 52. Average: 52/7.'], key: 'Push to the extreme' },
    { id: 'h18', topic: 'logic', q: 'Jay spent half of his money plus $2 at the snack bar. Then he did it again at the gift shop, and again at the arcade. He had $1 left. How much did he start with?', choices: ['$24', '$30', '$36', '$40', '$48'], a: '$36',
      hints: ['Work backwards from $1.', 'Undo "spent half plus $2": add $2, then double.'],
      steps: ['Before the arcade: (1 + 2) × 2 = $6.', 'Before the gift shop: (6 + 2) × 2 = $16. Before the snack bar: (16 + 2) × 2 = $36.'], key: 'Work backwards' },
    { id: 'h19', topic: 'logic', q: 'At a team party, each player high-fives exactly 3 other players. Which of these could be the number of players?', choices: ['5', '7', '9', '10', '11'], a: '10',
      hints: ['Count high-five "hands": each player gives 3.', 'Every high-five uses two hands, so the total of hands must be even.'],
      steps: ['Total hands = 3 × (players). Each high-five uses 2, so 3 × players must be even.', 'So the number of players is even: only 10 works.'], key: 'Parity: count in two ways' },
    { id: 'h20', topic: 'logic', q: 'Ava says, "Ben is lying." Ben says, "Cruz is lying." Cruz says, "Ava and Ben are both lying." Who is telling the truth?', choices: ['Only Ava', 'Only Ben', 'Only Cruz', 'Ava and Cruz', 'Nobody'], a: 'Only Ben',
      hints: ['Suppose Cruz is truthful. What does that say about Ava and Ben?', 'If Cruz is lying, Ben told the truth.'],
      steps: ['If Cruz told the truth, Ava lies, so Ben is truthful. But Cruz said Ben lies: contradiction. So Cruz lies.', 'Then Ben ("Cruz is lying") is truthful, and Ava ("Ben is lying") is lying. Only Ben.'], key: 'Assume, then look for a contradiction' },
    // ── Geometry
    { id: 'h21', topic: 'area', q: 'A triangle has area 54. A line parallel to its base cuts off a small triangle at the top whose height is 1/3 of the whole triangle\'s height. What is the area of the trapezoid left below the line?', choices: ['18', '36', '42', '48', '50'], a: '48',
      hints: ['The small triangle is similar to the big one, scaled by 1/3.', 'Areas scale by the SQUARE of the length factor.'],
      steps: ['Scale factor 1/3, so area factor 1/9: the small triangle has area 54/9 = 6.', 'Trapezoid: 54 − 6 = 48.'], key: 'Lengths ×k → areas ×k²' },
    { id: 'h22', topic: 'area', q: 'Square ABCD has side 12. E is the midpoint of side CD, and F is the midpoint of side BC. What is the area of triangle AEF?', choices: ['36', '48', '54', '60', '72'], a: '54',
      hints: ['Do not find the triangle directly. Start with the whole square.', 'Subtract the three right triangles around triangle AEF.'],
      steps: ['Square: 144. Corner triangles: ADE = 36, ABF = 36, ECF = 18.', '144 − 36 − 36 − 18 = 54.'], key: 'Box method: big minus the pieces' },
    { id: 'h23', topic: 'pythag', q: 'A right triangle has legs 20 and 21. What is the length of the altitude drawn to the hypotenuse?', choices: ['420/29', '14', '29/2', '210/29', '15'], a: '420/29',
      hints: ['Find the hypotenuse first: 20-21-? is a Pythagorean triple.', 'Compute the area two ways: (20 × 21)/2 and (29 × h)/2.'],
      steps: ['Hypotenuse = √(400 + 441) = √841 = 29.', 'Area: 20 × 21 = 29 × h, so h = 420/29.'], key: 'Compute the same area two ways' },
    { id: 'h24', topic: 'circles', q: 'A circle fits snugly inside a right triangle with sides 6, 8, and 10, touching all three sides. What is the area of the circle?', choices: ['π', '2π', '4π', '9π', '16π'], a: '4π',
      hints: ['For a right triangle, the inside circle\'s radius is (leg + leg − hypotenuse) ÷ 2.', '(6 + 8 − 10) ÷ 2 = 2.'],
      steps: ['Radius = (6 + 8 − 10)/2 = 2. (Or: area 24 = radius × half-perimeter 12.)', 'Area = π × 2² = 4π.'], key: 'Compute the same area two ways' },
    { id: 'h25', topic: 'circles', q: 'A 10 × 10 square has a quarter circle of radius 5 drawn at each corner, inside the square. What is the area of the part of the square NOT covered by the quarter circles?', choices: ['100 − 25π', '100 − 50π', '100 − 5π', '25π − 50', '100 − 100π'], a: '100 − 25π',
      hints: ['Four quarter circles make one whole circle.', 'Radius 5: area 25π.'],
      steps: ['Four quarters of radius 5 = one circle of area 25π.', 'Uncovered: 100 − 25π.'], key: 'Shaded = big minus pieces' },
    { id: 'h26', topic: 'solids', q: 'A 3 × 3 × 3 cube is built from 27 small cubes. All 8 corner cubes are removed. What is the surface area of the shape that is left?', choices: ['36', '42', '48', '54', '60'], a: '54',
      hints: ['When you pull out a corner cube, which faces disappear and which appear?', '3 outside faces vanish, 3 new inside faces show up.'],
      steps: ['Removing a corner cube removes 3 outer unit faces but exposes 3 new ones.', 'So the surface area does not change: 6 × 9 = 54.'], key: 'Look for what does not change' },
    { id: 'h27', topic: 'coords', q: 'What is the area of the triangle with corners at (1, 1), (7, 3), and (4, 9)?', choices: ['18', '21', '24', '27', '30'], a: '21',
      hints: ['Draw the smallest rectangle around the triangle.', 'Rectangle 6 × 8 = 48; subtract three right triangles.'],
      steps: ['Box: x from 1 to 7, y from 1 to 9 → 48.', 'Corner triangles: 6, 9, 12 (total 27).', '48 − 27 = 21.'], key: 'Box method: big minus the pieces' },
    { id: 'h28', topic: 'angles', q: 'A regular hexagon and a square share one side and do not overlap. At one end of the shared side, what is the angle in the gap between the hexagon and the square?', choices: ['120°', '135°', '140°', '150°', '160°'], a: '150°',
      hints: ['Angles around a point add to 360°.', 'Hexagon angle: 120°. Square angle: 90°.'],
      steps: ['360° − 120° − 90° = 150°.'], key: 'Angles around a point = 360°' },
    { id: 'h29', topic: 'area', q: 'A rectangle has whole-number sides and perimeter 30. What is its largest possible area?', choices: ['50', '54', '56', '60', '64'], a: '56',
      hints: ['Length + width = 15.', 'Make the sides as close as possible.'],
      steps: ['l + w = 15; the closest whole numbers are 7 and 8.', 'Area 7 × 8 = 56.'], key: 'Push to the extreme' },
    // ── Number theory
    { id: 'h30', topic: 'divisors', q: 'What is the smallest positive integer that has exactly 10 positive divisors?', choices: ['36', '48', '60', '80', '512'], a: '48',
      hints: ['Divisor count = product of (exponent + 1). 10 = 10 or 5 × 2.', 'Try 2⁹, then 2⁴ × 3.'],
      steps: ['10 = 10 → p⁹: smallest 2⁹ = 512.', '10 = 5 × 2 → p⁴q: smallest 2⁴ × 3 = 48.', '48 is smaller.'], key: 'Divisors from exponents' },
    { id: 'h31', topic: 'units', q: 'What is the units digit of 7²⁰²⁷ + 3²⁰²⁷?', choices: ['0', '2', '4', '6', '8'], a: '0',
      hints: ['Powers of 7 end in 7, 9, 3, 1; powers of 3 end in 3, 9, 7, 1.', '2027 leaves remainder 3 when divided by 4.'],
      steps: ['7²⁰²⁷ ends like 7³: 3. 3²⁰²⁷ ends like 3³: 7.', '3 + 7 = 10: units digit 0.'], key: 'Units digits cycle' },
    { id: 'h32', topic: 'remainders', q: 'What is the remainder when 2¹⁰⁰ is divided by 7?', choices: ['1', '2', '3', '4', '6'], a: '2',
      hints: ['Find a small power of 2 that leaves remainder 1 when divided by 7.', '2³ = 8 = 7 + 1.'],
      steps: ['2³ leaves remainder 1, so 2⁹⁹ = (2³)³³ leaves 1.', '2¹⁰⁰ = 2⁹⁹ × 2 leaves 2.'], key: 'Units digits cycle' },
    { id: 'h33', topic: 'units', q: 'How many zeros are at the end of 100! (the product 1 × 2 × 3 × … × 100)?', choices: ['20', '21', '24', '25', '30'], a: '24',
      hints: ['Each zero needs a factor 2 × 5; there are plenty of 2s, so count 5s.', 'Multiples of 25 give an extra 5.'],
      steps: ['Multiples of 5: 20. Multiples of 25: 4 more.', '20 + 4 = 24.'], key: 'Count the 5s' },
    { id: 'h34', topic: 'mental', q: 'What is the sum of the digits of 10²⁵ − 25?', choices: ['207', '210', '216', '219', '225'], a: '219',
      hints: ['Try a small version: 10⁴ − 25 = 9975.', 'The pattern: lots of 9s, then 7 and 5.'],
      steps: ['10ⁿ − 25 = 99…975 with (n − 2) nines.', 'Here: 23 nines + 7 + 5 = 207 + 12 = 219.'], key: 'Build up small' },
    { id: 'h35', topic: 'gcflcm', q: 'Two positive integers add up to 60 and their greatest common factor is 12. How many such pairs are there? (Order does not matter.)', choices: ['1', '2', '3', '4', '5'], a: '2',
      hints: ['Write the numbers as 12a and 12b.', 'a + b = 5, and a and b share no common factor.'],
      steps: ['12a + 12b = 60 → a + b = 5 with gcd(a, b) = 1.', 'Pairs: (1, 4) and (2, 3) → (12, 48) and (24, 36). That is 2.'], key: 'Pull out the common factor' },
    { id: 'h36', topic: 'gcflcm', q: 'For how many positive integers n are n, n + 2, and n + 4 all prime?', choices: ['0', '1', '2', '3', 'infinitely many'], a: '1',
      hints: ['Look at remainders when dividing by 3.', 'One of n, n + 2, n + 4 is always a multiple of 3.'],
      steps: ['n, n + 2, n + 4 cover all three remainders mod 3, so one is divisible by 3.', 'That one must be 3 itself: n = 3 gives 3, 5, 7. Only 1 value.'], key: 'Remainders split numbers into groups' },
    // ── Algebra & sequences
    { id: 'h37', topic: 'sequences', q: 'What is 1 − 2 + 3 − 4 + 5 − 6 + … + 99 − 100?', choices: ['−100', '−50', '0', '50', '100'], a: '−50',
      hints: ['Pair the terms: (1 − 2), (3 − 4), …', 'Each pair is −1. How many pairs?'],
      steps: ['50 pairs, each equal to −1.', 'Total: −50.'], key: 'Pair things up' },
    { id: 'h38', topic: 'equations', q: 'In 6 years, Ava will be twice as old as she was 4 years ago. How old is Ava now?', choices: ['10', '12', '14', '16', '18'], a: '14',
      hints: ['Let her age now be x.', 'x + 6 = 2(x − 4).'],
      steps: ['x + 6 = 2x − 8, so x = 14.', 'Check: in 6 years 20; 4 years ago 10. 20 = 2 × 10 ✓.'], key: 'Name it with a letter' },
    { id: 'h39', topic: 'sequences', q: 'In an arithmetic sequence, the 3rd term is 11 and the 8th term is 31. What is the 20th term?', choices: ['75', '79', '83', '87', '91'], a: '79',
      hints: ['From term 3 to term 8 is 5 steps.', 'Each step is (31 − 11) ÷ 5 = 4.'],
      steps: ['Step d = 20 ÷ 5 = 4.', 'From term 8 to term 20 is 12 steps: 31 + 48 = 79.'], key: 'Count the steps between terms' },
    { id: 'h40', topic: 'rates', q: 'A player jogs to the gym at 3 mph and runs home along the same route at 6 mph. What is her average speed for the whole trip?', choices: ['4 mph', '4.5 mph', '5 mph', '4.2 mph', '3.5 mph'], a: '4 mph',
      hints: ['Pick a distance, like 6 miles each way.', 'Average speed = total distance ÷ total time.'],
      steps: ['6 miles at 3 mph: 2 h. 6 miles at 6 mph: 1 h.', '12 miles ÷ 3 h = 4 mph.'], key: 'Pick a friendly number' },
    { id: 'h41', topic: 'percents', q: 'A jersey\'s price is raised by 25%. By what percent must the new price be lowered to get back to the original price?', choices: ['20%', '25%', '30%', '15%', '22.5%'], a: '20%',
      hints: ['Pretend the original price is $100.', 'New price $125. You need to remove $25 out of $125.'],
      steps: ['$100 → $125. To get back: lower by $25.', '25/125 = 20%.'], key: 'Pretend it is 100' },
    { id: 'h42', topic: 'counting', q: 'A 3-digit number is called "bouncy" if its middle digit is larger than both of its other digits (like 172 or 391). How many bouncy numbers are there?', choices: ['204', '240', '285', '330', '360'], a: '240',
      hints: ['Case on the middle digit m.', 'First digit: 1 to m − 1. Last digit: 0 to m − 1.'],
      steps: ['Middle digit m gives (m − 1) × m numbers.', 'Add m = 2 to 9: 2 + 6 + 12 + 20 + 30 + 42 + 56 + 72 = 240.'], key: 'Split into cases' },
    { id: 'h43', topic: 'stats', q: 'Five test scores have a mean of 80 and a median of 85. All scores are whole numbers from 0 to 100. What is the lowest possible score?', choices: ['15', '25', '30', '40', '55'], a: '30',
      hints: ['Total = 400. To make one score small, make the others as big as allowed.', 'The top two can be 100; the 2nd-lowest can be at most 85.'],
      steps: ['Total = 5 × 80 = 400. Sorted: a ≤ b ≤ 85 ≤ d ≤ e.', 'Make b = 85, d = e = 100: a = 400 − 85 − 85 − 200 = 30.'], key: 'Push to the extreme' },
  ];

  // Which topics count as "nearby" when today's topic has no clutch problem left.
  const AREAS = [
    ['counting', 'combos', 'casework', 'paths', 'probability', 'probplus'], ['logic'],
    ['area', 'pythag', 'circles', 'solids', 'coords', 'angles'], ['divisors', 'units', 'remainders', 'gcflcm', 'divisibility'],
    ['sequences', 'equations', 'exponents', 'rates', 'percents', 'stats', 'mental', 'fractions', 'ratios'],
  ];

  // Pick an unseen clutch problem: today's topic first, then its area, then anything.
  function pickHard(topic, seen = []) {
    const fresh = H.filter((p) => !seen.includes(p.id));
    const pool = fresh.length ? fresh : H;
    const area = AREAS.find((a) => a.includes(topic)) || [];
    const tiers = [pool.filter((p) => p.topic === topic), pool.filter((p) => area.includes(p.topic)), pool];
    const tier = tiers.find((t) => t.length);
    return tier[Math.floor(Math.random() * tier.length)];
  }

  // Three options for "what was the key idea?": the right one plus two others.
  function keyOptions(p) {
    const others = [...new Set(H.map((x) => x.key))].filter((k) => k !== p.key);
    const pick2 = root.U.shuffle(others).slice(0, 2);
    return root.U.shuffle([p.key, ...pick2]);
  }

  root.HARD = { problems: H, pickHard, keyOptions };
})(typeof window !== 'undefined' ? window : globalThis);
