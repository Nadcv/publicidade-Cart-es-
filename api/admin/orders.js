var { getSupabaseAdmin } = require("../../lib/supabase");
var { requireAdmin } = require("../../lib/adminAuth");

// Lista todas as encomendas para o painel de administração. Protegido por uma
// palavra-passe simples (header X-Admin-Password), definida em ADMIN_PASSWORD.
module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Método não permitido." });
    return;
  }

  if (!requireAdmin(req, res)) return;

  try {
    var supabase = getSupabaseAdmin();

    // Modo alternativo: leituras do Cartão Digital de um pedido específico (analytics),
    // reaproveitando este endpoint em vez de criar uma função nova (ver lib/formats.js —
    // o plano gratuito da Vercel está perto do limite de 12 Serverless Functions).
    if (req.query.scansFor) {
      var scansResult = await supabase
        .from("card_scans")
        .select("scanned_at, country, city")
        .eq("order_id", req.query.scansFor)
        .order("scanned_at", { ascending: false })
        .limit(200);
      if (scansResult.error) throw scansResult.error;
      res.status(200).json({ scans: scansResult.data || [], total: (scansResult.data || []).length });
      return;
    }

    var page = Math.max(1, parseInt(req.query.page, 10) || 1);
    var pageSize = 50;
    var from = (page - 1) * pageSize;
    var to = from + pageSize - 1;

    var result = await supabase
      .from("orders")
      .select(
        "id, status, product_format, template_id, quantity, item_count, amount_cents, currency, " +
          "shipping_name, shipping_address, contact_email, gelato_order_id, referral_code, " +
          "tracking_code, tracking_url, carrier_name, error_message, created_at",
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(from, to);

    if (result.error) throw result.error;

    // Resumo: receita e contagem por estado, calculados sobre até 2000 encomendas mais
    // recentes (suficiente para um pequeno negócio; evita paginar tudo só para somar).
    var statsResult = await supabase
      .from("orders")
      .select("status, amount_cents, currency, created_at")
      .order("created_at", { ascending: false })
      .limit(2000);
    if (statsResult.error) throw statsResult.error;

    var now = new Date();
    var monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    var summary = {
      pendingCount: 0,
      totalOrders: statsResult.data.length,
      revenueCentsTotal: 0,
      revenueCentsMonth: 0,
      currency: (statsResult.data[0] && statsResult.data[0].currency) || (process.env.CURRENCY || "eur")
    };
    statsResult.data.forEach(function (o) {
      if (o.status === "pending_payment") summary.pendingCount++;
      if (o.status === "paid" || o.status === "sent_to_print") {
        summary.revenueCentsTotal += o.amount_cents;
        if (new Date(o.created_at).getTime() >= monthStart) summary.revenueCentsMonth += o.amount_cents;
      }
    });

    res.status(200).json({ orders: result.data || [], total: result.count || 0, page: page, pageSize: pageSize, summary: summary });
  } catch (err) {
    console.error("admin/orders error:", err);
    res.status(500).json({ error: "Não foi possível consultar as encomendas." });
  }
};
