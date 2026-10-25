-- Runs the daily-report function every hour (it emails the parents whose chosen hour is now).
-- Before running: enable the pg_cron and pg_net extensions (Database → Extensions), then
-- replace YOUR-PROJECT-REF and YOUR-CRON-SECRET below. Run in the SQL Editor.
select cron.unschedule('math-hoops-daily-report') where exists (select 1 from cron.job where jobname = 'math-hoops-daily-report');
select cron.schedule(
  'math-hoops-daily-report',
  '1 * * * *',
  $$ select net.http_post(
       url := 'https://YOUR-PROJECT-REF.supabase.co/functions/v1/daily-report',
       headers := '{"Content-Type": "application/json", "x-cron-secret": "YOUR-CRON-SECRET"}'::jsonb,
       body := '{}'::jsonb) $$
);
