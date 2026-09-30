var { getSupabaseAdmin } = require("./lib/supabase");

// Consulta as encomendas de um cliente pelo e-mail (o mesmo usado na morada de envio).
// Não expõe dados sensíveis (sem image_data, sem morada completa, sem ids da Stripe/Gelato).
module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Método não permitido." });
    return;
  }

  var email = String(req.query.email || "").trim().toLowerCase();
  if (!email || email.indexOf("@") === -1) {
    res.status(400).json({ error: "E-mail inválido." });
    return;
  }

  try {
    var supabase = getSupabaseAdmin();
    var result = await supabase
      .from("orders")
      .select("id, status, product_format, template_id, quantity, item_count, amount_cents, currency, referral_code, created_at")
      .ilike("contact_email", email)
      .order("created_at", { ascending: false })
      .limit(20);

    if (result.error) throw result.error;

    res.status(200).json({ orders: result.data || [] });
  } catch (err) {
    console.error("my-orders error:", err);
    res.status(500).json({ error: "Não foi possível consultar as encomendas." });
  }
};
