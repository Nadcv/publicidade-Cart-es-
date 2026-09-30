var Stripe = require("stripe");
var { getSupabaseAdmin } = require("./lib/supabase");
var { createGelatoOrder } = require("./lib/gelato");
var { sendEmail, orderConfirmationHtml } = require("./lib/email");
var { createReferralCode } = require("./lib/referral");
var { isDigitalOnly } = require("./lib/formats");

function readRawBody(req) {
  return new Promise(function (resolve, reject) {
    var chunks = [];
    req.on("data", function (c) { chunks.push(c); });
    req.on("end", function () { resolve(Buffer.concat(chunks)); });
    req.on("error", reject);
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }

  var stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  var rawBody = await readRawBody(req);
  var event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, req.headers["stripe-signature"], process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Assinatura do webhook inválida:", err.message);
    res.status(400).send("Webhook Error: " + err.message);
    return;
  }

  if (event.type !== "checkout.session.completed") {
    res.status(200).json({ received: true });
    return;
  }

  var session = event.data.object;
  var orderId = session.metadata && session.metadata.order_id;
  if (!orderId) {
    console.error("checkout.session.completed sem order_id nos metadata.");
    res.status(200).json({ received: true });
    return;
  }

  var supabase = getSupabaseAdmin();

  try {
    var fetchResult = await supabase.from("orders").select("*").eq("id", orderId).single();
    if (fetchResult.error) throw fetchResult.error;
    var order = fetchResult.data;

    if (order.status !== "pending_payment") {
      // Evento repetido (Stripe reenvia webhooks) — já processado, não duplicar a encomenda na Gelato.
      res.status(200).json({ received: true });
      return;
    }

    await supabase.from("orders").update({ status: "paid", updated_at: new Date().toISOString() }).eq("id", orderId);

    var itemsResult = await supabase.from("order_items").select("*").eq("order_id", orderId);
    if (itemsResult.error) throw itemsResult.error;
    var lineItems = itemsResult.data;

    // Compatibilidade: pedidos criados antes da tabela order_items existir não têm
    // nenhuma linha lá — tratamos o próprio pedido como um único item.
    if (!lineItems.length) {
      lineItems = [
        {
          id: null,
          product_format: order.product_format,
          quantity: order.quantity,
          image_url: order.image_url
        }
      ];
    }

    var addr = order.shipping_address;
    var failures = [];
    var firstGelatoId = null;
    var digitalDeliveries = [];
    var hasPhysicalItem = false;

    for (var i = 0; i < lineItems.length; i++) {
      var item = lineItems[i];

      // "convite-digital" nunca vai para impressão — é entregue por e-mail com o
      // ficheiro já hospedado em /api/order-image?item=<id>.
      if (isDigitalOnly(item.product_format)) {
        digitalDeliveries.push({ templateId: item.template_id, downloadUrl: item.image_url });
        continue;
      }

      hasPhysicalItem = true;
      try {
        var gelatoOrder = await createGelatoOrder({
          orderId: order.id,
          referenceSuffix: item.id || String(i),
          format: item.product_format,
          currency: order.currency,
          quantity: item.quantity,
          imageUrl: item.image_url,
          shipping: addr
        });
        if (!firstGelatoId) firstGelatoId = gelatoOrder.id;
        if (item.id) {
          await supabase.from("order_items").update({ gelato_order_id: gelatoOrder.id }).eq("id", item.id);
        }
      } catch (itemErr) {
        console.error("Falha ao enviar item para a Gelato (order_id=" + orderId + ", item=" + (item.id || i) + "):", itemErr);
        failures.push((item.id || "item " + (i + 1)) + ": " + (itemErr.message || itemErr));
        if (item.id) {
          await supabase.from("order_items").update({ error_message: String(itemErr.message || itemErr) }).eq("id", item.id);
        }
      }
    }

    if (failures.length) {
      await supabase
        .from("orders")
        .update({
          status: "failed",
          gelato_order_id: firstGelatoId,
          error_message: failures.join(" | "),
          updated_at: new Date().toISOString()
        })
        .eq("id", orderId);
      // Pagamento já foi cobrado — falha parcial/total no envio à Gelato precisa de
      // reconciliação manual (ver order_items.error_message), não de retry automático.
      res.status(200).json({ received: true });
      return;
    }

    var referralCode = await createReferralCode(stripe, order.id);

    await supabase
      .from("orders")
      .update({
        status: hasPhysicalItem ? "sent_to_print" : "delivered",
        gelato_order_id: firstGelatoId,
        referral_code: referralCode,
        updated_at: new Date().toISOString()
      })
      .eq("id", orderId);
    order.referral_code = referralCode;
    order.status = hasPhysicalItem ? "sent_to_print" : "delivered";

    // E-mail de confirmação é best-effort: uma falha aqui não deve marcar a encomenda
    // como falhada, já foi paga (e enviada para impressão e/ou entregue por e-mail) com sucesso.
    try {
      await sendEmail(
        order.contact_email,
        "O teu pedido UniAds Studio foi confirmado",
        orderConfirmationHtml(order, digitalDeliveries)
      );
    } catch (emailErr) {
      console.error("Falha ao enviar e-mail de confirmação (order_id=" + orderId + "):", emailErr);
    }
  } catch (err) {
    console.error("Falha ao processar encomenda paga (order_id=" + orderId + "):", err);
    await supabase
      .from("orders")
      .update({ status: "failed", error_message: String(err.message || err), updated_at: new Date().toISOString() })
      .eq("id", orderId);
    // Responde 200 na mesma: o pagamento já foi cobrado, uma falha aqui precisa de
    // reconciliação manual (ver coluna error_message na tabela orders), não de retry automático
    // do Stripe reenviando o mesmo evento indefinidamente.
  }

  res.status(200).json({ received: true });
};

module.exports.config = { api: { bodyParser: false } };
