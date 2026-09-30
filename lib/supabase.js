var { createClient } = require("@supabase/supabase-js");

var client = null;

// Cliente com a service role key — só é usado no servidor (funções /api), nunca no browser.
function getSupabaseAdmin() {
  if (!client) {
    var url = process.env.SUPABASE_URL;
    var key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY em falta nas variáveis de ambiente.");
    }
    client = createClient(url, key, { auth: { persistSession: false } });
  }
  return client;
}

module.exports = { getSupabaseAdmin };
