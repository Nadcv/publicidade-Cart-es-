var crypto = require("crypto");
var { getSupabaseAdmin } = require("../lib/supabase");

function passwordMatches(given, expected) {
  var a = Buffer.from(String(given || ""));
  var b = Buffer.from(String(expected || ""));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// Lista todas as encomendas para o painel de administração. Protegido por uma
// palavra-passe simples (header X-Admin-Password), definida em ADMIN_PASSWORD.
module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Método não permitido." });
    return;
  }

  var expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    res.status(503).json({ error: "Painel de administração não configurado (falta ADMIN_PASSWORD)." });
    return;
  }

  var given = req.headers["x-admin-password"];
  if (!passwordMatches(given, expected)) {
    res.status(401).json({ error: "Palavra-passe incorreta." });
    return;
  }

  try {
    var supabase = getSupabaseAdmin();
    var page = Math.max(1, parseInt(req.query.page, 10) || 1);
    var pageSize = 50;
    var from = (page - 1) * pageSize;
    var to = from + pageSize - 1;

    var result = await supabase
      .from("orders")
      .select(
        "id, status, product_format, template_id, quantity, amount_cents, currency, " +
          "shipping_name, shipping_address, contact_email, gelato_order_id, error_message, created_at",
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(from, to);

    if (result.error) throw result.error;

    res.status(200).json({ orders: result.data || [], total: result.count || 0, page: page, pageSize: pageSize });
  } catch (err) {
    console.error("admin/orders error:", err);
    res.status(500).json({ error: "Não foi possível consultar as encomendas." });
  }
};
