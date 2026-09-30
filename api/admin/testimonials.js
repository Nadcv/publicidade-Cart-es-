var { getSupabaseAdmin } = require("../../lib/supabase");
var { requireAdmin } = require("../../lib/adminAuth");

module.exports = async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  var supabase = getSupabaseAdmin();

  try {
    if (req.method === "GET") {
      var result = await supabase.from("testimonials").select("*").order("created_at", { ascending: false });
      if (result.error) throw result.error;
      res.status(200).json({ testimonials: result.data || [] });
      return;
    }

    if (req.method === "POST") {
      var body = req.body || {};
      var authorName = String(body.authorName || "").trim().slice(0, 80);
      var quote = String(body.quote || "").trim().slice(0, 500);
      var company = String(body.company || "").trim().slice(0, 80);
      var rating = parseInt(body.rating, 10);

      if (!authorName || !quote) {
        res.status(400).json({ error: "Nome e depoimento são obrigatórios." });
        return;
      }

      var insertResult = await supabase
        .from("testimonials")
        .insert({
          author_name: authorName,
          company: company || null,
          quote: quote,
          rating: rating >= 1 && rating <= 5 ? rating : null,
          approved: true
        })
        .select()
        .single();

      if (insertResult.error) throw insertResult.error;
      res.status(200).json({ testimonial: insertResult.data });
      return;
    }

    if (req.method === "DELETE") {
      var id = req.query.id;
      if (!id) {
        res.status(400).json({ error: "id em falta." });
        return;
      }
      var delResult = await supabase.from("testimonials").delete().eq("id", id);
      if (delResult.error) throw delResult.error;
      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ error: "Método não permitido." });
  } catch (err) {
    console.error("admin/testimonials error:", err);
    res.status(500).json({ error: "Não foi possível processar o pedido." });
  }
};
