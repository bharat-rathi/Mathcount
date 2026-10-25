# Setting up Math Hoops on GitHub Pages + a Google Sheet

Two parts, about 10 minutes in total. Afterwards:

- **The app** lives at <https://bharat-rathi.github.io/Mathcount/amc8-class/> and works on
  any device, with no account.
- **Your Google Sheet** gets a row after every game he plays, a summary of his topics and
  mistakes, and a backup of his progress.
- **A daily email** goes to both of you at about 8 PM, sent from your own Gmail.

## Part 1: Turn on GitHub Pages (once)

1. Open <https://github.com/bharat-rathi/Mathcount> → **Settings** → **Pages** (left menu).
2. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
3. Set **Branch** to `main` and the folder to `/ (root)`, then click **Save**.
4. Wait 1–2 minutes, then open <https://bharat-rathi.github.io/Mathcount/amc8-class/>.

Any change merged into `main` goes live a minute or two later.

## Part 2: Connect a Google Sheet (once)

1. Go to <https://sheets.new> (signed in as bharat.r04@gmail.com) and name the sheet
   **Math Hoops progress**.
2. In the sheet, open **Extensions → Apps Script**.
3. Delete what's in the editor, paste in all of [`Code.gs`](Code.gs), and click **Save** (💾).
4. Click **⚙️ Project Settings** (left menu) and set **Time zone** to
   `(GMT-05:00) Eastern Time – New York`. The daily email uses this time zone.
5. Back in the editor, choose **setup** in the function menu at the top and click **Run**.
   Google will ask for permission. Choose your account, then **Advanced → Go to project
   (unsafe) → Allow**. The script is your own, so this warning is expected. It creates the
   tabs and schedules the 8 PM email.
6. Click **Deploy → New deployment**, click the ⚙️ next to "Select type" and choose
   **Web app**, then set:
   - **Execute as:** Me
   - **Who has access:** Anyone

   Click **Deploy** and copy the **Web app URL**. It looks like
   `https://script.google.com/macros/s/…/exec`.
7. On his Chromebook, open the app → **👪 Parent page** → paste the URL into
   **Google Sheet sync URL** → **Save**.

After his next game, a row appears in the **Games** tab. To test the email right away,
choose **sendDailyReport** in the Apps Script editor and click **Run**.

## Using it on another device

On a new device, open the app. On the welcome screen, open **"Already playing on another
device?"**, paste the same sync URL, and tap **Restore my progress**.

## Privacy and changes

- **Keep the web app URL private.** Anyone who has it can read or overwrite his saved
  progress. The URL is long and random, so it can't be guessed, but don't post it anywhere.
- **The app's code is public** (the repository is public). His progress lives only in your
  Sheet and his browser.
- **To change who gets the email,** edit `RECIPIENTS` at the top of the script and save.
  There's no need to redeploy for email changes.
- **If you ever change the script's other code,** use **Deploy → Manage deployments → ✏️ →
  Version: New version** so the same URL keeps working.
