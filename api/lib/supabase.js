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

// Nome do bucket de Storage onde ficam os PNGs de impressão. Configurável via
// STORAGE_BUCKET_NAME para o caso de o bucket ter sido criado com outro nome
// (ex: o Chrome traduziu "print-files" para "arquivos de impressão" ao criar o bucket).
var BUCKET_NAME = process.env.STORAGE_BUCKET_NAME || "print-files";

// Faz upload de uma imagem (Buffer) para o bucket de impressão e devolve a URL pública.
async function uploadPrintFile(orderId, buffer, contentType) {
  var supabase = getSupabaseAdmin();
  var path = orderId + ".png";
  var upload = await supabase.storage.from(BUCKET_NAME).upload(path, buffer, {
    contentType: contentType || "image/png",
    upsert: true
  });
  if (upload.error) throw upload.error;
  var pub = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
  return pub.data.publicUrl;
}

module.exports = { getSupabaseAdmin, uploadPrintFile };
