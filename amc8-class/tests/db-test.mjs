// Run with: node amc8-class/tests/db-test.mjs  (needs: npm i @electric-sql/pglite in this folder or above)
// Loads supabase/schema.sql into PGlite with a minimal stand-in for Supabase's auth schema,
// then checks the row-level security: families can only ever see and change their own data.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { PGlite } from '@electric-sql/pglite';

const db = new PGlite();
await db.exec(`
  create role authenticated nologin; create role anon nologin;
  create schema auth;
  create table auth.users (id uuid primary key, email text, created_at timestamptz default now(), last_sign_in_at timestamptz);
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema auth to authenticated, anon;
`);
await db.exec(fs.readFileSync(new URL('../supabase/schema.sql', import.meta.url), 'utf8'));
await db.exec(`grant usage on schema public to authenticated;
  grant all on all tables in schema public to authenticated;`);

const A = '00000000-0000-0000-0000-00000000000a', B = '00000000-0000-0000-0000-00000000000b';
await db.exec(`insert into auth.users (id, email) values ('${A}', 'a@example.com'), ('${B}', 'b@example.com')`);
// Run a query as a signed-in parent (role authenticated, auth.uid() = who).
async function as(who, sql, params) {
  await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub', '${who}', false);`);
  try { return await db.query(sql, params); } finally { await db.exec('reset role;'); }
}
const fails = async (p, why) => { await assert.rejects(p, undefined, why); };

const kid = (await as(A, `insert into kids (name) values ('Arjun') returning id, parent_id`)).rows[0];
assert.equal(kid.parent_id, A, 'parent_id defaults to the signed-in parent');
await as(A, `insert into games (kid_id, day, title, kind, "right", total) values ($1, '2026-11-02', 'Logic', 'lesson', 9, 11)`, [kid.id]);
await as(A, `insert into parent_settings (email_to) values ('{a@example.com}')`);

// Parent B sees nothing of A's family.
assert.equal((await as(B, 'select * from kids')).rows.length, 0, 'B cannot see A kids');
assert.equal((await as(B, 'select * from games')).rows.length, 0, 'B cannot see A games');
assert.equal((await as(B, 'select * from parent_settings')).rows.length, 0, 'B cannot see A settings');
// ...and cannot change it.
assert.equal((await as(B, `update kids set name = 'hacked' where id = $1 returning id`, [kid.id])).rows.length, 0, 'B cannot update A kid');
assert.equal((await as(B, `delete from kids where id = $1 returning id`, [kid.id])).rows.length, 0, 'B cannot delete A kid');
await fails(as(B, `insert into games (kid_id, day, title, kind, "right", total) values ($1, '2026-11-02', 'x', 'lesson', 1, 1)`, [kid.id]), 'B cannot add games to A kid');
await fails(as(B, `insert into kids (parent_id, name) values ($1, 'sneaky')`, [A]), 'B cannot create a kid in A family');
// Signed-out visitors see nothing.
await db.exec(`set role anon;`);
await fails(db.query('select * from kids'), 'anon has no access');
await db.exec('reset role;');

// A sees their own data; the 7th player is refused.
assert.equal((await as(A, 'select * from kids')).rows.length, 1);
for (let i = 2; i <= 6; i++) await as(A, `insert into kids (name) values ('Kid ${i}')`);
await fails(as(A, `insert into kids (name) values ('Kid 7')`), 'max 6 players');

// Analytics: only an admin may read the overview, and nobody can read or edit the admin list.
await as(A, `insert into games (kid_id, day, title, kind, "right", total, seconds) values ($1, '2026-11-03', 'Angles', 'lesson', 8, 10, 900)`, [kid.id]);
await fails(as(A, 'select admin_overview()'), 'non-admin cannot read analytics');
assert.equal((await as(A, 'select is_admin() ok')).rows[0].ok, false);
await fails(as(A, `insert into admins values ('a@example.com')`), 'parents cannot make themselves admin');
assert.equal((await as(A, 'select * from admins')).rows.length, 0, 'admin list is hidden');
await db.exec(`insert into admins values ('B@example.com')`);
const ov = (await as(B, 'select admin_overview() o')).rows[0].o;
const fa = ov.find((f) => f.email === 'a@example.com');
assert.ok(fa && ov.length === 2, 'admin sees every family');
const ak = fa.kids.find((k) => k.name === 'Arjun');
assert.equal(ak.games, 2); assert.equal(ak.game_seconds, 900); assert.equal(ak.right, 17); assert.equal(ak.days_active, 2);

// Question reports: parents add and see only their own; the owner reads them all; 500 per family.
const rep = (who, extra = '') => as(who, `insert into question_reports (kid_id, topic, tpl, game, reason, question, answer, choices) values (${extra || 'null'}, 'percents', 'percents#4', 'amc8', 'Wrong answer', 'What is 20% of 120?', '24', '22|24|26') returning id`);
await rep(A, `'${kid.id}'`);
await rep(B);
assert.equal((await as(A, 'select * from question_reports')).rows.length, 1, 'A sees only their own reports');
assert.equal((await as(B, 'select * from question_reports')).rows.length, 1, 'B sees only their own reports');
await fails(as(B, `insert into question_reports (kid_id, reason, question) values ('${kid.id}', 'x', 'y')`), 'B cannot report against A kid');
await fails(as(A, `insert into question_reports (reason, question) values ('${'r'.repeat(41)}', 'y')`), 'reason is length limited');
await fails(as(A, `insert into question_reports (reason, question) values ('ok', '${'q'.repeat(1001)}')`), 'question is length limited');
await db.exec(`set role anon;`);
await fails(db.query('select * from question_reports'), 'anon cannot read reports');
await db.exec('reset role;');
await fails(as(A, 'select admin_reports()'), 'non-admin cannot read all reports');
const all = (await as(B, 'select admin_reports() r')).rows[0].r;   // B is the admin (see above)
assert.equal(all.length, 2, 'admin sees every family\'s reports');
assert.ok(all.some((r) => r.email === 'a@example.com' && r.kid === 'Arjun' && r.tpl === 'percents#4'), 'report carries the parent, kid and type');
for (let i = 0; i < 499; i++) await db.exec(`insert into question_reports (parent_id, reason, question) values ('${B}', 'bulk', 'q')`);
await fails(rep(B), '500 reports per family');

// Delete my family: everything of A's goes, B is untouched.
await as(B, `insert into kids (name) values ('Bea')`);
await as(A, 'select delete_my_family()');
assert.equal((await db.query(`select count(*)::int n from kids where parent_id = '${A}'`)).rows[0].n, 0);
assert.equal((await db.query(`select count(*)::int n from games where parent_id = '${A}'`)).rows[0].n, 0);
assert.equal((await db.query(`select count(*)::int n from auth.users where id = '${A}'`)).rows[0].n, 0);
assert.equal((await db.query(`select count(*)::int n from question_reports where parent_id = '${A}'`)).rows[0].n, 0, 'reports go with the family');
assert.equal((await db.query(`select count(*)::int n from kids where parent_id = '${B}'`)).rows[0].n, 1);
console.log('OK — database rules');
