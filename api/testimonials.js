var { getSupabaseAdmin } = require("../lib/supabase");

// Lista pública dos depoimentos aprovados (adicionados manualmente pelo dono do site).
module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Método não permitido." });
    return;
  }

  try {
    var supabase = getSupabaseAdmin();
    var result = await supabase
      .from("testimonials")
      .select("id, author_name, company, quote, rating, created_at")
      .eq("approved", true)
      .order("created_at", { ascending: false })
      .limit(12);

    if (result.error) throw result.error;
    res.status(200).json({ testimonials: result.data || [] });
  } catch (err) {
    console.error("testimonials error:", err);
    res.status(500).json({ error: "Não foi possível carregar os depoimentos." });
  }
};
