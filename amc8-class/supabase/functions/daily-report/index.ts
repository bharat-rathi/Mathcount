// Supabase Edge Function: sends each parent their daily Math Hoops email.
// Called once an hour by the cron job in supabase/schedule.sql; it emails the parents whose
// chosen hour (in their own time zone) is now. Email goes out through Resend.
//
// Secrets (Supabase → Edge Functions → Secrets): RESEND_API_KEY, EMAIL_FROM, CRON_SECRET.
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided automatically.
import { createClient } from 'npm:@supabase/supabase-js@2.45.4';
import { buildEmail, localNow } from './email.js';

Deno.serve(async (req) => {
  if (req.headers.get('x-cron-secret') !== Deno.env.get('CRON_SECRET')) return new Response('forbidden', { status: 403 });
  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: settings, error } = await db.from('parent_settings').select('*').eq('email_enabled', true);
  if (error) return new Response(error.message, { status: 500 });

  const sent: string[] = [];
  for (const s of settings ?? []) {
    const { date, hour } = localNow(s.timezone || 'America/New_York');
    if (hour !== s.send_hour || !s.email_to?.length) continue;
    const { data: kids } = await db.from('kids').select('report').eq('parent_id', s.parent_id);
    const mail = buildEmail((kids ?? []).map((k) => k.report), date);
    if (!mail) continue;
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: Deno.env.get('EMAIL_FROM'), to: s.email_to, subject: mail.subject, text: mail.text }),
    });
    if (res.ok) sent.push(s.parent_id);
  }
  return Response.json({ sent: sent.length });
});
