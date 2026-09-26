var { getSupabaseAdmin } = require("./lib/supabase");

// Serve a arte de impressão de uma encomenda diretamente a partir da base de dados
// (image_data, guardado em base64). É esta URL que é passada à Gelato para descarregar
// o ficheiro — evita depender de um bucket de Storage à parte.
module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Método não permitido." });
    return;
  }

  var id = req.query.id;
  if (!id) {
    res.status(400).json({ error: "id em falta." });
    return;
  }

  try {
    var supabase = getSupabaseAdmin();
    var result = await supabase.from("orders").select("image_data").eq("id", id).single();

    if (result.error || !result.data || !result.data.image_data) {
      res.status(404).json({ error: "Imagem não encontrada." });
      return;
    }

    var buffer = Buffer.from(result.data.image_data, "base64");
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.status(200).send(buffer);
  } catch (err) {
    console.error("order-image error:", err);
    res.status(500).json({ error: "Não foi possível carregar a imagem." });
  }
};
