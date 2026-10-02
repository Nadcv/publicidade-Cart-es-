var { getSupabaseAdmin } = require("../lib/supabase");

// Cartão digital público: devolve os dados de contacto (não sensíveis) de um pedido,
// para a página cartao-digital.html mostrar. É isto que um chip NFC ou um QR code
// abre automaticamente ao ser lido. O id do pedido é um UUID v4 imprevisível — mesmo
// modelo de confiança já usado em /api/order-image?id=<id>.
module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Método não permitido." });
    return;
  }

  var orderId = req.query.order;
  if (!orderId) {
    res.status(400).json({ error: "order em falta." });
    return;
  }

  try {
    var supabase = getSupabaseAdmin();

    var itemsResult = await supabase
      .from("order_items")
      .select("fields, product_format")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true });
    if (itemsResult.error) throw itemsResult.error;
    var items = itemsResult.data || [];

    var chosen = items.find(function (it) { return it.product_format === "nfc"; }) || items[0];

    if (!chosen) {
      // Compatibilidade: pedidos sem linhas em order_items (anteriores a essa tabela).
      var orderResult = await supabase.from("orders").select("fields").eq("id", orderId).single();
      if (orderResult.error || !orderResult.data) {
        res.status(404).json({ error: "Cartão não encontrado." });
        return;
      }
      chosen = orderResult.data;
    }

    var f = chosen.fields || {};
    res.status(200).json({
      nome: f.nome || "",
      cargo: f.cargo || "",
      empresa: f.empresa || "",
      slogan: f.slogan || "",
      telefone: f.telefone || "",
      email: f.email || "",
      site: f.site || "",
      instagram: f.instagram || "",
      endereco: f.endereco || ""
    });

    // Analytics do Cartão Digital, best-effort (nunca deve impedir a resposta acima —
    // por isso vem depois do res.status().json() e tem o seu próprio try/catch).
    // País/cidade vêm dos cabeçalhos de geo-IP da Vercel, só existem em produção.
    try {
      await supabase.from("card_scans").insert({
        order_id: orderId,
        country: req.headers["x-vercel-ip-country"] || null,
        city: req.headers["x-vercel-ip-city"] ? decodeURIComponent(req.headers["x-vercel-ip-city"]) : null
      });
    } catch (scanErr) {
      console.error("Falha ao registar leitura do cartão digital (order=" + orderId + "):", scanErr);
    }
  } catch (err) {
    console.error("digital-card error:", err);
    res.status(500).json({ error: "Não foi possível carregar o cartão." });
  }
};
