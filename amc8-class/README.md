# Math Hoops: AMC 8 Daily Class

A 20-minute daily class to get a middle-schooler ready for the AMC 8. It's built for a
student with ADHD: one idea on screen at a time, visuals that draw themselves, instant
feedback, a movement break halfway through, and a game layer (XP, streaks, combos,
badges, boss battles).

**Play it:** <https://bharat-rathi.github.io/Mathcount/amc8-class/> (GitHub Pages, published
from `main`). Opening `index.html` from disk works too. Nothing to install, and no account.

Progress is saved in the browser. For family accounts, follow
[`supabase/SETUP.md`](supabase/SETUP.md). Parents sign in with an emailed link and add a nickname
profile for each kid. Progress follows the kid to any device, and parents get a daily email.
See [`PRIVACY.md`](PRIVACY.md) for what's stored.

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
  keypad (24 kinds of fact: squares, cubes, powers of 2, ×9, ×11, ×25, ×101, percents,
  fractions of a number, square roots, Pythagorean triples, polygon angles and more), with
  a personal best to beat. Missed facts come back sooner (spaced repetition), but never
  seconds after he just saw the answer, and a session never repeats a fact or asks the same
  kind twice in a row.

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

30 topics covering the AMC 8: similar triangles & area ratios, spatial reasoning (nets, hidden cubes, folding), reading graphs & charts, logic & puzzles, casework & listing, grid paths & sharing out, complement & geometric probability, mental math, fractions, percents, ratios, rates and work,
divisibility, primes/GCF/LCM, counting divisors, units digits, remainders, sequences,
equations, exponents and roots, counting, arrangements, probability, statistics, angles
and polygons, the Pythagorean theorem, area, circles, 3D solids and coordinate geometry.

### Questions that don't repeat

Every topic has **9 to 14 question types** (321 in all), and each type draws fresh numbers.
Three things keep quizzes from feeling repetitive:

- **More kinds of question.** Each topic has its own types (`topics-*.js`, `topics-extra.js`)
  plus the MATHCOUNTS coach's problem types from `../lib`, added through `js/mc-bridge.js`
  (it converts them to AMC format with the coach's list of classic mistakes as the wrong
  choices). The bridge needs the page served over http(s), as on GitHub Pages, because it is
  an ES module.
- **Rotation.** `Engine.fresh()` picks the question types he has used least recently, and
  within one game avoids reusing a type until the topic's types are used up.
- **Memory.** The last 500 questions he answered are remembered (as short fingerprints in
  `state.seenQ`), and new questions are re-drawn until they are new to him.

Question types that carry a `chk` field compute their answer a second, independent way (a
brute-force count, a loop, a different formula); the tests fail if the two ever disagree.

The season has 56 games, weighted by what the real test asks, based on 200 problems from
2018–2026 (see `analysis/`):

- **30 first games**, one per topic, alternating areas so no two days feel the same.
- **15 "Level Up" games**, with harder problems and a new trick. They go only to the heavy
  hitters: logic, the counting & probability chapters, area, Pythagoras, similar triangles, circles, ratios,
  sequences, equations, rates and stats. Number theory and easy arithmetic get one game
  each; arithmetic speed is trained daily in the Shootaround instead.
- **A practice contest after every 6 games**: 15 questions, 25 minutes, answers only at
  the end, then a full review. The last 3 questions are hand-written hard problems.
- **The Finals:** the last 4 games are the real 2023–2026 AMC 8 papers, taken timed on
  LIVE by Po-Shen Loh (which hosts them with MAA permission). He enters his score afterwards.

If he misses a day, nothing is skipped: the next game just waits.

Questions are generated with fresh numbers each time, so there are no memorized answers.
The wrong choices are the classic mistakes (adding tops and bottoms, the fencepost +1,
averaging speeds, etc.).

## Clutch problems

`js/hard.js` and `js/hard-diagrams.js` hold 78 original hard problems (AMC #16–25 level), 35 of them with drawn diagrams
(shaded regions, nets, grids, charts, spinners, a clock, a Venn diagram). Their answers
were checked by brute force or by computing coordinates. Each one has:
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
cd amc8-class && npm install && npm test
# tests/test.mjs        questions, plan, engine
# tests/email-test.mjs  the daily email builder
# tests/db-test.mjs     database rules (schema.sql in an in-memory Postgres)
```

The test runs every question generator thousands of times at each level. It checks each
question for 5 distinct choices, that the answer is among them, and that no text is broken,
and it compares every `chk` field with the answer. It simulates whole seasons and fails if
a game repeats a question, a topic has fewer than 8 question types, quizzes are less than
85% different types, or the Shootaround repeats itself. It also checks the course plan and
the streak/XP logic.
