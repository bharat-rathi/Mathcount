# Setting up Math Hoops with family accounts (Supabase)

Afterwards:

- **The app** runs at <https://bharat-rathi.github.io/Mathcount/amc8-class/>.
- **Parents** sign in with an emailed link (no passwords) and add kid profiles.
- **Progress** follows each kid to any device.
- **Each parent** gets a daily email at the time they choose.

Allow about 20 minutes. Everything here fits in the free plans.

## 1. GitHub Pages (once)

1. In GitHub, open <https://github.com/bharat-rathi/Mathcount> → **Settings** → **Pages**.
2. Set **Source** to **Deploy from a branch**, set the branch to `main` and the folder to
   `/ (root)`, then click **Save**.

## 2. Create the database

1. Sign up at <https://supabase.com> and click **New project**. Use the name `math-hoops`,
   a strong database password (save it somewhere), and a US East region.
2. Open **SQL Editor** → **New query**. Paste all of [`schema.sql`](schema.sql) → **Run**.
   This creates the tables and the rules that keep every family's data private.
3. Open **Authentication** → **URL Configuration**:
   - **Site URL:** `https://bharat-rathi.github.io/Mathcount/amc8-class/`
   - **Redirect URLs:** add the same address.
4. Open **Project Settings** → **API** and copy the **Project URL** and the **anon public**
   key. Both are meant to be public; the database rules are what protect the data.
5. Paste them into [`js/config.js`](../js/config.js) on GitHub (the ✏️ button), then commit
   to `main`:

   ```js
   window.MH_CONFIG = {
     supabaseUrl: 'https://YOUR-PROJECT-REF.supabase.co',
     supabaseAnonKey: 'eyJ…',
   };
   ```

6. Open the app, sign in with your email, click the link in your inbox, and add your son
   as a player.

> **Sign-in emails:** Supabase's built-in email sender only allows a few emails per hour.
> That's fine for one family, but before inviting others, connect your own sender. Go to
> **Authentication → Emails → SMTP Settings** and use Resend's SMTP details (step 3a).

## 3. The daily parent email

1. **Resend**, which sends the emails:
   1. Sign up at <https://resend.com> and create an **API key**.
   2. At first, Resend can only send to your own sign-up email, from
      `onboarding@resend.dev`. To email other families, add and verify a domain you own
      under **Domains**.
2. **The function:**
   1. In Supabase, open **Edge Functions** → **Deploy a new function** → **Via editor**.
      Name it `daily-report`.
   2. Create two files there, pasting in [`functions/daily-report/index.ts`](functions/daily-report/index.ts)
      and [`functions/daily-report/email.js`](functions/daily-report/email.js), then click **Deploy**.
   3. Open the function's **Details** and turn **off** "Enforce JWT verification". It's
      protected by `CRON_SECRET` instead.

   If you prefer the command line, run this from the `amc8-class` folder:
   `npx supabase functions deploy daily-report --no-verify-jwt --project-ref YOUR-PROJECT-REF`
3. **Secrets:** under **Edge Functions → Secrets**, add:
   - `RESEND_API_KEY`: the key from step 3a
   - `EMAIL_FROM`: `Math Hoops <onboarding@resend.dev>`, or an address on your verified domain
   - `CRON_SECRET`: any long random string
4. **Schedule:**
   1. Under **Database → Extensions**, enable `pg_cron` and `pg_net`.
   2. Open [`schedule.sql`](schedule.sql), replace `YOUR-PROJECT-REF` and `YOUR-CRON-SECRET`,
      and run it in the SQL Editor. The function then runs every hour and emails each
      parent at the hour they picked.
5. **In the app:** tap **🔄 Switch player / Family**, then under **Daily email**
   enter the addresses and the time, and click **Save email settings**.

**Test the email:** set the time to the current hour, save, and wait until a few minutes
past the hour. Supabase shows each run under **Edge Functions → daily-report → Logs**.

## How the data is protected

- Only parents have accounts. Kids are nickname profiles inside a parent's account.
- Row-level security means a parent can only ever read or change their own family's rows.
  `tests/db-test.mjs` checks this against the real schema.
- **Delete my family's data**, on the Family screen, removes the parent's players, games,
  settings and account.
- See [`../PRIVACY.md`](../PRIVACY.md).
