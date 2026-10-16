# Chrome Web Store listing — copy and paste

Everything below goes into the Chrome Web Store Developer Dashboard
(https://chrome.google.com/webstore/devconsole). Text in [brackets] is for you to fill in.

---

## Store listing tab

**Name** (from the manifest): Mathlete Daily Coach

**Summary** (132 characters max — this one is 121):

> Daily math-competition practice that adapts to your child, explains every mistake, and locks the browser until it's done.

**Category:** Education
**Language:** English

**Description:**

```
Ten math problems a day, picked for what your child needs most — and the rest of the browser stays locked until they're done.

Built for middle-schoolers preparing for math competitions such as MATHCOUNTS®, Math Kangaroo and AMC 8.

DAILY PRACTICE THAT ADAPTS
• 150 problem types across 19 topics: fractions, percents, ratios and rates, number theory, sequences, equations, exponents and radicals, counting, probability, Venn diagrams, area, circles, right triangles, angles and statistics
• Fresh numbers every time — no running out, no memorizing answers
• Each day's 10 lean toward weak topics, bring back problem types missed yesterday, and run from easier to harder
• Each topic levels up after three right in a row

EVERY MISTAKE EXPLAINED
• What went wrong — it recognizes common slips like using the diameter as the radius, adding fractions top-and-bottom, or off-by-one counting
• The simplest way to solve it, step by step
• A tip for doing it faster next time
• Checks answer forms the way competitions do: fractions in lowest terms, simplified square roots, answers "in terms of π"

MOTIVATING
• Day streaks and correct-answer streaks that carry across days
• Points, ranks, topic medals (bronze, silver, gold) and achievement badges

FOCUSED
• While locked, websites, search engines, AI chatbots and answer sites are blocked
• Finishing the daily set unlocks browsing for the rest of the day (parents can change this)
• Parents can unlock any time with a PIN: for 30 minutes, an hour, until a set time, or until they lock it again

PARENT DASHBOARD
• Accuracy this week vs last week, streaks and daily sets completed
• Topics where your child is strong and where they need help, with real recent mistakes to talk through
• Charts of daily accuracy and every topic

PRIVATE BY DESIGN
• Everything stays on your computer. No accounts, no tracking, no ads, no data sent anywhere.

Note: the lock applies to Chrome. To restrict other browsers and apps, use your computer's parental controls alongside it.

Mathlete Daily Coach is an independent project and is not affiliated with or endorsed by MATHCOUNTS®.
```

**Graphics** (all in `store/images/`):
- Store icon 128×128: `store-icon-128.png` (96×96 artwork with transparent padding, as Google recommends)
- Screenshots 1280×800: `screenshot-1-question.png` … `screenshot-5-unlock.png` (upload in order)
- Small promo tile 440×280: `promo-small-440x280.png`

---

## Privacy tab

**Single purpose:**

> Daily math practice for children, with the browser locked to the practice page until the day's questions are done or a parent unlocks it.

**Permission justifications:**

| Permission | Justification to paste |
|---|---|
| `declarativeNetRequest` | Blocks websites, search engines and homework-answer sites while the browser is locked, and redirects them to the extension's "locked" page. This is the core of the extension's purpose. |
| Host permissions (`<all_urls>`) | Required so the blocking rules can apply to every website and redirect blocked pages to the extension's own page. No page content is read or collected. |
| `tabs` | Keeps a single practice tab open while locked: closes or redirects tabs showing blocked pages (including chrome:// pages, which network rules can't block) and focuses the practice tab. |
| `storage` | Saves the child's practice history, streaks, badges and parent settings locally on the device. |
| `alarms` | Re-locks the browser when a parent's unlock period or the after-practice unlock ends. |

**Remote code:** No, I am not using remote code. (All scripts are packaged with the extension.)

**Data usage:**
- Data collected: **none**. Leave every category unchecked: the extension stores the child's first name
  and practice history only on the device and never transmits them. The Web Store's "collect" means
  sending data off the device.
- Tick all three certifications (not sold, not used for unrelated purposes, not used for credit).

**Privacy policy URL:** [the URL where you host `docs/privacy.html` — see README "Publishing"]

---

## Distribution tab

- **Visibility:** Unlisted (only people with the link) to start; switch to Public later if you like.
- **Regions:** all regions.
- **Pricing:** free.

---

## Test instructions for the reviewer (Account / "Test instructions" field)

```
No login is needed. On first run the extension opens a setup page; nothing is blocked until setup is finished.
1. Enter any child name and a parent PIN (e.g. 1234), then click "Start coaching". Chrome is now locked: other tabs close and websites redirect to a "locked" page.
2. Click "Start today's 10" and answer the questions. Wrong answers show an explanation.
3. After the 10th question, browsing unlocks for the rest of the day.
4. To unlock at any time: click "Unlock" in the top bar (or on the locked page) and enter the PIN.
5. Parent dashboard: click "Parent" and enter the PIN.
Search engines and AI/answer sites stay blocked even when unlocked; this can be changed in Parent → Lock & settings.
```
