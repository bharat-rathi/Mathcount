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
  create table auth.users (id uuid primary key);
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema auth to authenticated, anon;
`);
await db.exec(fs.readFileSync(new URL('../supabase/schema.sql', import.meta.url), 'utf8'));
await db.exec(`grant usage on schema public to authenticated;
  grant all on all tables in schema public to authenticated;`);

const A = '00000000-0000-0000-0000-00000000000a', B = '00000000-0000-0000-0000-00000000000b';
await db.exec(`insert into auth.users values ('${A}'), ('${B}')`);
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

// Delete my family: everything of A's goes, B is untouched.
await as(B, `insert into kids (name) values ('Bea')`);
await as(A, 'select delete_my_family()');
assert.equal((await db.query(`select count(*)::int n from kids where parent_id = '${A}'`)).rows[0].n, 0);
assert.equal((await db.query(`select count(*)::int n from games where parent_id = '${A}'`)).rows[0].n, 0);
assert.equal((await db.query(`select count(*)::int n from auth.users where id = '${A}'`)).rows[0].n, 0);
assert.equal((await db.query(`select count(*)::int n from kids where parent_id = '${B}'`)).rows[0].n, 1);
console.log('OK — database rules');
