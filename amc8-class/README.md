# AMC 8 Daily Class

A 20-minute daily class to get a middle-schooler ready for the AMC 8. It's built for a
student with ADHD: one idea on screen at a time, visuals that draw themselves, instant
feedback, a movement break halfway through, and a game layer (XP, streaks, combos,
badges, boss battles).

Open `index.html` in any browser (laptop or tablet). Nothing to install, and no account.
Progress is saved in that browser.

## A daily class

| Part | What happens |
|---|---|
| 🔁 Warm-up | 3 questions from earlier topics, picking the weakest or longest-unseen first (spaced review) |
| 🎨 Visual lesson | 3 animated slides. Tap a picture to replay it; 🔊 reads it aloud |
| 🪄 Trick of the day | One shortcut (complementary counting, the 25 trick, "pretend it's $100", …) |
| ✏️ Quiz round 1 | 5 AMC-style multiple-choice questions (A–E) |
| 🧠 Brain break | A 40-second movement challenge (jumping jacks, squats, deep breaths) |
| ✏️ Quiz round 2 | 5 harder questions |
| 🐉 Boss battle | One hard problem, styled like AMC problems #15–25 |

A wrong first answer gets one more try. After that, the worked solution appears step by step.

## The course

23 topics covering the AMC 8: mental math, fractions, percents, ratios, rates and work,
divisibility, primes/GCF/LCM, counting divisors, units digits, remainders, sequences,
equations, exponents and roots, counting, arrangements, probability, statistics, angles
and polygons, the Pythagorean theorem, area, circles, 3D solids and coordinate geometry.

- **Pass 1** teaches every topic.
- **Pass 2 ("Level Up")** comes back with harder problems and a new trick.
- **A practice contest** follows every 6 classes: 15 questions, 25 minutes, answers only at
  the end, then a full review.

That's 54 classes in all. If he misses a day, nothing is skipped: the next class just waits.

Questions are generated with fresh numbers each time, so there are no memorized answers.
The wrong choices are the classic mistakes (adding tops and bottoms, the fencepost +1,
averaging speeds, etc.).

## Parent page

The parent page shows mastery per topic (first-try accuracy over the last 20 questions),
weak topics, scores from practice contests, and recent classes. Its settings set the
contest date, sound and read-aloud mode. You can also jump to any class or reset progress.

## Development

```
node amc8-class/tests/test.mjs
```

The test runs every question generator thousands of times at each level. It checks each
question for 5 distinct choices, that the answer is among them, and that no text is broken.
It also checks the course plan and the streak/XP logic.
