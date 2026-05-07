const SUPABASE_URL = "https://bygrocbckwjcatrgdook.supabase.co/rest/v1/";
const SUPABASE_ANON_KEY = "sb_publishable_5vZ4w9Y40QDAthZIbrWJqg_9s7Fv5Vb";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
