// Family accounts on Supabase. Parents sign in with an emailed link; kids are profiles the
// parent creates (nickname only, no kid accounts or emails). Every call runs as the signed-in
// parent, and row-level security limits it to their own family's rows.
(function (root) {
  const cfg = root.MH_CONFIG || {};
  const lib = root.supabase;
  const enabled = !!(cfg.supabaseUrl && cfg.supabaseAnonKey && lib && lib.createClient);
  // An old sign-in link left in the address (a bookmark or app shortcut made right after signing
  // in, or a link that was already used) makes supabase-js drop the saved sign-in. Strip it first.
  if (enabled && /(access_token|error_code|error)=/.test(location.hash)) {
    const p = new URLSearchParams(location.hash.slice(1));
    if (p.has('error') || p.has('error_code') || +p.get('expires_at') * 1000 < Date.now()) history.replaceState(null, '', location.pathname + location.search);
  }
  const db = enabled ? lib.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }) : null;
  const must = ({ data, error }) => { if (error) throw error; return data; };
  let queue = Promise.resolve(), userId = null;

  root.Cloud = {
    enabled,
    // The signed-in parent's session (a sign-in link in the URL is picked up automatically).
    async session() {
      if (!enabled) return null;
      const s = must(await db.auth.getSession()).session;
      userId = s ? s.user.id : null;
      if (s && location.hash) history.replaceState(null, '', location.pathname + location.search);
      return s;
    },
    signIn: async (email) => must(await db.auth.signInWithOtp({ email, options: { emailRedirectTo: location.href.split(/[?#]/)[0] } })),
    signOut: async () => { await db.auth.signOut(); userId = null; },
    listKids: async () => must(await db.from('kids').select('id,name,state,report,updated_at').order('created_at')),
    addKid: async (name) => must(await db.from('kids').insert({ name }).select('id,name,state,report').single()),
    // Saves run one at a time so an older state can never land after a newer one.
    saveKid(id, state, report, game) {
      queue = queue.then(async () => {
        must(await db.from('kids').update({ state, report }).eq('id', id));
        if (game) must(await db.from('games').insert({ kid_id: id, day: game.day, title: game.title, kind: game.kind, right: game.right, total: game.total, points: game.xp || 0 }));
      }).catch((e) => console.warn('Cloud save failed; the browser copy is kept.', e));
      return queue;
    },
    loadSettings: async () => must(await db.from('parent_settings').select('*').maybeSingle()),
    saveSettings: async (s) => must(await db.from('parent_settings').upsert({ ...s, parent_id: userId })),
    deleteFamily: async () => must(await db.rpc('delete_my_family')),
  };
})(window);
