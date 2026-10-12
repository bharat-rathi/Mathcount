# MATHCOUNTS Daily Coach (Chrome extension)

A Chrome extension that gives a Mathlete **10 MATHCOUNTS-style problems a day**, chosen
for the topics they most need to work on. It explains every miss and turns practice
into a streak game. While it's running, **Chrome is locked to the practice app**.

## What it does

**Daily set of 10 problems.** 19 topics in the MATHCOUNTS mix (Sprint/Target/Team
rounds): order of operations, fractions, percents, ratios, rates & work, divisors/GCF/LCM,
primes & units digits, arithmetic sequences, equations & word problems, exponents &
radicals, custom operations, counting, probability, Venn diagrams, area & perimeter,
circles, Pythagorean theorem, angles & polygons, and mean/median/mode. That's 150 problem
types. Each problem gets fresh numbers every time, so there's no running out and no memorizing answers.

**Adaptive to past performance.**
- Every topic has a mastery score based on recent results. The daily 10 are weighted
  toward weak topics (up to 2 per weak topic). They also include topics not seen for a while and
  topics never tried.
- **Redemption round:** problem types missed recently come back the next day with new numbers.
- **Levels ★☆☆ → ★★★ per topic:** 3 right in a row moves a topic up a level (harder problem
  types). 2 misses in a row moves it back down.
- Problems are ordered easiest to hardest, like a real Sprint Round.

**Every wrong answer is explained**, in three parts:
1. **🤔 What went wrong.** The app recognizes common mistakes for each problem type
   (e.g. "you used the diameter as the radius", "you added the tops and the bottoms",
   "fencepost error: from 7 to 21 is 15 numbers, not 14"). If the answer doesn't match a known
   mistake, it checks for sign errors, factor-of-2 slips and place-value slips.
2. **🪜 Simplest way to solve it:** short numbered steps.
3. **💡 Do it better next time:** a faster method or habit (complementary counting,
   "pretend it's $100", the 3-4-5 triples, etc.).

It also enforces the official **MATHCOUNTS Forms of Answers**: a right value in the wrong form
(6/8 instead of 3/4, 0.75 when a common fraction is asked, √75 instead of 5√3, or 50.27 instead
of 16π) is marked wrong, with an explanation of the rule.

**Gamified.**
- 🔥 Day streak (and best streak)
- 🎯 Correct-in-a-row streak that **carries across days**
- ⭐ XP and ranks: Rookie → Problem Solver → Mathlete → Sprint Star → … → MATHCOUNTS Legend
- 🥉🥈🥇 **Topic medals** (Bronze, Silver, Gold) for improving in each topic
- 🏅 Achievements: 3/7/14/30/100-day streaks, 10/25/50/100 correct in a row, Perfect 10,
  Sprint Ready (perfect and under 60 s per question), Comeback Kid (weak topic raised to 80%), Explorer, and more
- Confetti, level-up toasts, a 4-week calendar

**Locks the browser.**
- Every website is blocked and redirected to a "locked" page. The exceptions are sites you add to the
  allowlist (e.g. `classroom.google.com`).
- **Search is blocked**: Google/Bing/DuckDuckGo/YouTube search, AI chatbots (ChatGPT, Gemini,
  Claude, Copilot…) and answer sites (Photomath, Mathway, Symbolab, Wolfram|Alpha, Brainly, Chegg…).
  By default these stay blocked even during unlocked time.
- `chrome://` pages (extensions, settings…) are blocked too, so the extension can't be turned off from
  inside Chrome.
- The new-tab page is the practice app, and it opens whenever Chrome starts. While locked there's only ever
  one copy: tabs open from before the lock are closed, and extra new tabs switch back to the practice tab.
- **Parent area (PIN-protected):** unlock for 15 min to 3 h, lock again right away, progress report
  per topic and for the last 14 days, settings, export.
- **Finishing the daily 10 unlocks browsing** for the rest of the day (it locks again at midnight). In the
  Parent area you can change this to a set number of minutes, or to "stay locked until a parent unlocks".
- The locked page has a **Parent: unlock with PIN** button.

## Install (5 minutes, done by a parent)

1. Copy the `Mathcount` folder somewhere permanent on the laptop
   (e.g. `C:\MathCoach` or `~/MathCoach`). Chrome loads it from there, so don't delete it.
2. In Chrome, open `chrome://extensions` and turn on **Developer mode** (top right).
3. Click **Load unpacked** and choose the `Mathcount` folder.
   The extension ID should be `hnmanhjpcnfkocpbjblblnfldidholhc`.
4. The app opens. Nothing is locked yet. Enter your child's name and a **parent PIN**, then click Start.
   Chrome locks at that moment and **closes your other tabs**, so save your work first.
5. Apply the lockdown policy below. Without it, a curious kid can just turn the extension
   off at `chrome://extensions` when Chrome starts.

### Lockdown policy (strongly recommended)

The files in `parent-setup/` set Chrome policies that:
- turn off Incognito, Guest mode and adding new Chrome profiles
- block `chrome://extensions`, `chrome://settings`, `chrome://flags` and the Chrome Web Store
- turn off Developer Tools

| OS | How |
|---|---|
| Windows | Double-click `parent-setup/windows-lockdown.reg` (needs admin). Undo with `windows-undo.reg`. |
| macOS | `sudo bash parent-setup/mac-lockdown.sh` (undo: `sudo bash parent-setup/mac-lockdown.sh --undo`) |
| Linux | `sudo mkdir -p /etc/opt/chrome/policies/managed && sudo cp parent-setup/linux-policy.json /etc/opt/chrome/policies/managed/` |

Then **quit Chrome completely and reopen it**.

**Check it worked (10 seconds):** the practice app should open, and a site like
`example.com` should show the 🔒 page. If the app no longer shows up at all, your Chrome
version is disabling unpacked extensions while Developer Tools are off. Fix it by deleting the
`DeveloperToolsAvailability` line or entry and restarting Chrome. Everything else still applies.

**To update or remove the extension later:** run the undo file, restart Chrome, make your change at
`chrome://extensions`, then apply the lockdown again.

## About "block everything else on the laptop"

A Chrome extension can only control **Chrome**. It can't stop other browsers (Edge, Safari),
games or apps. To lock down the whole laptop, also use the free parental controls built into the OS:

- **Windows:** Microsoft Family Safety (family.microsoft.com). Make your child a family member
  with their own *standard* (non-admin) account, use **Allow only these apps** / app limits, and block
  Microsoft Edge and other browsers so Chrome is the only one.
- **macOS:** System Settings → **Screen Time** for your child's (standard) account →
  **App Limits** for everything, with Chrome under **Always Allowed**.
- **Chromebook:** Google Family Link: supervise the account, restrict apps.

Make sure your child's OS account is **not an administrator**. Otherwise they can undo all of this.

## How the adaptive engine works

- Per topic: attempts, correct, a mastery score (each new answer counts 20%), the last 20 results,
  level 1–3, and which problem types were missed.
- Daily selection weight = `0.15 + 4·(1 − mastery)² + 0.6·staleness + novelty`. A topic below
  about 55% mastery can appear twice in a day. Up to 2 slots go to redemption retries.
- Levels pick harder problem types. For example, Divisors goes from "GCF word problem" (★) to
  "count the divisors" (★★) to "count the odd divisors / sum of divisors" (★★★).

## Files

```
manifest.json        Manifest V3 (fixed "key" → stable extension ID for the policy files)
background.js        Lock: declarativeNetRequest rules + tab watchdog + relock alarm
app.html/.css/.js    The practice app (also replaces the new-tab page)
blocked.html/.js     Page shown in place of blocked sites
lib/topics.js        19 topics and their core problem generators (steps, tips, common mistakes)
lib/topics-more.js   66 more problem types, 3–4 per topic
lib/qhelpers.js      Shared answer/formatting helpers for the generators
lib/answers.js       Answer parsing and checking (MATHCOUNTS Forms of Answers)
lib/engine.js        Mastery, adaptive selection, streaks, XP, badges
lib/blocking.js      Allow/deny logic and network rules
lib/store.js         chrome.storage + salted SHA-256 parent PIN (with lockout after 5 wrong tries)
parent-setup/        Chrome policy files for Windows / macOS / Linux
tests/run-tests.mjs  node tests/run-tests.mjs: generates ~100k problems and checks every one
```

Everything runs offline. No accounts, no servers, no data leaves the laptop.

## Adding problems

Add a variant to a topic in `lib/topics.js` or `lib/topics-more.js`. `gen(rng, level)` returns `{ q, answer, steps, tip,
mistakes, unit?, form? }`, then run `node tests/run-tests.mjs`. The tests generate each variant 1,200 times
and check that the answer is accepted by the checker, the text has no `NaN`/`undefined`, and the
solution ends with the answer in bold.
