var { getSupabaseAdmin } = require("../lib/supabase");

// Recebe atualizações de estado/rastreio da Gelato quando um pedido é expedido.
//
// AVISO: a Gelato não publica um esquema fixo e garantido para este payload — este
// endpoint faz o melhor possível com os nomes de campo mais comuns observados em
// integrações deste tipo (id/orderId, items[].fulfillments[].trackingCode/trackingUrl).
// Na primeira entrega real, confirma nos logs desta função (Vercel → Deployments →
// Functions → gelato-webhook) se os campos batem certo e ajusta a extração abaixo
// se for preciso — por isso o payload bruto fica sempre registado.
//
// Configura o URL deste endpoint no dashboard da Gelato (Settings → Webhooks), com
// "?secret=<GELATO_WEBHOOK_SECRET>" na query se quiseres validação simples (opcional).
module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }

  var expectedSecret = process.env.GELATO_WEBHOOK_SECRET;
  if (expectedSecret && req.query.secret !== expectedSecret) {
    res.status(401).json({ error: "Secret inválido." });
    return;
  }

  var body = req.body || {};
  console.log("Gelato webhook payload:", JSON.stringify(body));

  try {
    var gelatoOrderId = body.id || body.orderId || (body.order && body.order.id);
    if (!gelatoOrderId) {
      res.status(200).json({ received: true });
      return;
    }

    var supabase = getSupabaseAdmin();
    var itemsArray = Array.isArray(body.items) ? body.items : [body];

    for (var i = 0; i < itemsArray.length; i++) {
      var it = itemsArray[i] || {};
      var fulfillment = (Array.isArray(it.fulfillments) && it.fulfillments[0]) || it.fulfillment || it;
      var trackingCode = fulfillment.trackingCode || fulfillment.tracking_code || null;
      var trackingUrl = fulfillment.trackingUrl || fulfillment.tracking_url || null;
      var carrierName = fulfillment.shipmentMethodName || fulfillment.carrierName || fulfillment.carrier || null;

      if (!trackingCode && !trackingUrl) continue;

      var itemUpdate = await supabase
        .from("order_items")
        .update({ tracking_code: trackingCode, tracking_url: trackingUrl, carrier_name: carrierName })
        .eq("gelato_order_id", gelatoOrderId)
        .select();

      if (itemUpdate.data && itemUpdate.data.length) {
        await supabase
          .from("orders")
          .update({ tracking_code: trackingCode, tracking_url: trackingUrl, carrier_name: carrierName })
          .eq("id", itemUpdate.data[0].order_id);
      } else {
        // Compatibilidade: pedidos antigos sem linhas em order_items.
        await supabase
          .from("orders")
          .update({ tracking_code: trackingCode, tracking_url: trackingUrl, carrier_name: carrierName })
          .eq("gelato_order_id", gelatoOrderId);
      }
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error("gelato-webhook error:", err);
    // 200 sempre: isto é best-effort, não queremos que a Gelato fique a tentar
    // reenviar o mesmo evento indefinidamente por causa de um erro do nosso lado.
    res.status(200).json({ received: true });
  }
};
