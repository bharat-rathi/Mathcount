# Math Hoops: AMC 8 Daily Class

A 20-minute daily class to get a middle-schooler ready for the AMC 8. It's built for a
student with ADHD: one idea on screen at a time, visuals that draw themselves, instant
feedback, a movement break halfway through, and a game layer (XP, streaks, combos,
badges, boss battles).

Open `index.html` in any browser (laptop or tablet). Nothing to install, and no account.
Progress is saved in that browser.

## Basketball theme

Every class is a "game" against an invented team, and the whole season builds to the
AMC 8 "Finals". He has a custom jersey with his name and number. There's a season
win–loss record (a game is a win at 70% or better), and ranks run from Rookie to GOAT.

- **Packs:** wins open surprise post-game packs more often than losses. Packs unlock
  jersey colors, court themes and extra timeouts.
- **Timeouts** cover one missed day so the streak survives. He starts with 2 and earns
  one for every 7-day streak, up to 3.
- **Playbook:** every trick he unlocks becomes a collectible trading card.
- **Shootaround:** each class opens with 60 seconds of rapid mental math typed on a
  keypad (squares, cubes, powers of 2, ×11, ×25, fraction→percent, Pythagorean triples
  and more), with a personal best to beat. Missed facts come back sooner (spaced
  repetition).

## A daily class

| Part | What happens |
|---|---|
| 🏀 Shootaround | 60-second mental-math speed drill |
| 🔁 Warm-up | 3 questions from earlier topics, picking the weakest or longest-unseen first (spaced review) |
| 🎨 Visual lesson | 3 animated slides. Tap a picture to replay it; 🔊 reads it aloud |
| 🪄 Trick of the day | One shortcut (complementary counting, the 25 trick, "pretend it's $100", …) |
| ✏️ Quiz round 1 | 5 AMC-style multiple-choice questions (A–E) |
| 🧠 Brain break | A 40-second movement challenge (jumping jacks, squats, deep breaths) |
| ✏️ Quiz round 2 | 5 harder questions |
| 🐉 Clutch shot | One hand-written AMC #16–25 level problem with optional hints |

Lessons use hands-on slides: **predict** (he guesses first, then the picture explains),
**steps** (a worked example revealed one tap at a time, newest step highlighted) and
**order** (tap items into the right order). Every lesson uses the same color code:
blue = given, orange = what we're finding, green = the answer.

A wrong first answer gets one more try. After that, the worked solution appears step by step.

## The course

27 topics covering the AMC 8: logic & puzzles, casework & listing, grid paths & sharing out, complement & geometric probability, mental math, fractions, percents, ratios, rates and work,
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

## Clutch problems

`js/hard.js` holds 43 original hard problems (AMC #16–25 level). Their answers were
checked by brute force. Each one has:
- **two hints**, each costing 10 points
- **a full solution**
- **a "key idea"**, which he identifies after solving

Clutch shots pick an unseen problem from today's topic first, then from the same area.
The last 3 questions of every practice contest are also hard problems.

After any answer that wasn't right first try, he taps what happened: careless slip,
didn't know how, forgot the trick, or ran out of time. The parent page and the daily
report show the breakdown.

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
