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

Paste only the text inside the box. It avoids lists of topic names and competition names,
which the Web Store treats as keyword spam.

```
Mathlete Daily Coach gives your child ten math problems a day, chosen for what they most need to practice. The rest of the browser stays locked until the day's set is done.

How it works
Each day's problems lean toward the topics your child finds hardest, bring back the kinds of problems they missed recently, and start easy before getting harder. Every problem has fresh numbers, so there is nothing to memorize.

When an answer is wrong, the coach explains what went wrong, shows the simplest way to solve it step by step, and gives a tip for doing it faster next time.

Staying motivated
Day streaks, points, ranks and badges reward steady practice and improvement.

Focus
While the browser is locked, websites and search are blocked. Finishing the daily problems unlocks browsing for the rest of the day, and a parent can unlock it any time with a PIN.

For parents
A dashboard shows how your child is doing this week, where they are strong, where they need help, and recent mistakes worth talking through together.

Private
Everything stays on your computer. There are no accounts, ads or tracking, and no data is sent anywhere.

The lock applies to Chrome only. Use your computer's parental controls to limit other browsers and apps.
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
| `tabs` | Keeps the practice tab in focus while locked: switches tabs showing blocked pages (including chrome:// pages, which network rules can't block) to the extension's "locked" page, and closes an extra duplicate practice tab opened in the same window. |
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
1. Enter any child name and a parent PIN (e.g. 1234), then click "Start coaching". Chrome is now locked: websites and open pages switch to a "locked" page.
2. Click "Start today's 10" and answer the questions. Wrong answers show an explanation.
3. After the 10th question, browsing unlocks for the rest of the day.
4. To unlock at any time: click "Unlock" in the top bar (or on the locked page) and enter the PIN.
5. Parent dashboard: click "Parent" and enter the PIN. To uninstall: Parent → Lock & settings → Remove this extension.
Search engines and AI/answer sites stay blocked even when unlocked; this can be changed in Parent → Lock & settings.
```
