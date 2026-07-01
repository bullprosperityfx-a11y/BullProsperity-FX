window.SUPABASE_URL = "https://bygrocbckwjcatrgdook.supabase.co";

window.SUPABASE_ANON_KEY =
  "sb_publishable_5vZ4w9Y40QDAthZIbrWJqg_9s7Fv5Vb";

window.supabaseClient = supabase.createClient(
  window.SUPABASE_URL,
  window.SUPABASE_ANON_KEY
);

console.log("Supabase Client geladen");
