var Stripe = require("stripe");
var { getSupabaseAdmin } = require("../lib/supabase");
var { createGelatoOrder } = require("../lib/gelato");
var { sendEmail, orderConfirmationHtml, abandonedCartHtml } = require("../lib/email");
var { createReferralCode } = require("../lib/referral");
var { isDigitalOnly, isManualFulfillment } = require("../lib/formats");
var { createStripeSessionForOrder } = require("../lib/checkout");

function readRawBody(req) {
  return new Promise(function (resolve, reject) {
    var chunks = [];
    req.on("data", function (c) { chunks.push(c); });
    req.on("end", function () { resolve(Buffer.concat(chunks)); });
    req.on("error", reject);
  });
}

// Carrinho abandonado: a Stripe expira sozinha uma Checkout Session não paga (24h por
// omissão) e dispara "checkout.session.expired" — reaproveitamos isso para o e-mail de
// lembrete, sem precisar de nenhum endpoint/cron novo. Requer que este evento esteja
// subscrito no webhook do dashboard da Stripe (Developers → Webhooks → o teu endpoint).
async function handleCheckoutExpired(req, res, supabase, stripe, expiredSession) {
  var orderId = expiredSession.metadata && expiredSession.metadata.order_id;
  if (!orderId) { res.status(200).json({ received: true }); return; }

  try {
    var orderResult = await supabase.from("orders").select("*").eq("id", orderId).single();
    if (orderResult.error || !orderResult.data) { res.status(200).json({ received: true }); return; }
    var order = orderResult.data;

    // Só reage se ainda não foi pago E ainda não processámos esta expiração antes
    // (idempotência: stripe_session_id já teria mudado se já tivéssemos recriado a sessão).
    if (order.status !== "pending_payment" || order.stripe_session_id !== expiredSession.id) {
      res.status(200).json({ received: true });
      return;
    }

    var itemsResult = await supabase.from("order_items").select("*").eq("order_id", orderId);
    var rows = (itemsResult.data && itemsResult.data.length) ? itemsResult.data : [
      { template_id: order.template_id, product_format: order.product_format, quantity: order.quantity, fields: order.fields, amount_cents: order.amount_cents }
    ];
    var normalizedItems = rows.map(function (it) {
      return { templateId: it.template_id, format: it.product_format, quantity: it.quantity, fields: it.fields || {}, amountCents: it.amount_cents };
    });

    var siteUrl = process.env.PUBLIC_SITE_URL || ("https://" + req.headers.host);
    var newSession = await createStripeSessionForOrder({
      orderId: order.id,
      items: normalizedItems,
      currency: order.currency,
      email: order.contact_email,
      siteUrl: siteUrl
    });

    await supabase
      .from("orders")
      .update({ stripe_session_id: newSession.id, abandoned_email_sent: true, updated_at: new Date().toISOString() })
      .eq("id", orderId);

    if (!order.abandoned_email_sent) {
      try {
        await sendEmail(order.contact_email, "Ainda tens itens no carrinho — UniAds Studio", abandonedCartHtml(order, newSession.url));
      } catch (emailErr) {
        console.error("Falha ao enviar e-mail de carrinho abandonado (order_id=" + orderId + "):", emailErr);
      }
    }
  } catch (err) {
    console.error("Falha ao processar carrinho abandonado (order_id=" + orderId + "):", err);
  }

  res.status(200).json({ received: true });
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

  if (event.type === "checkout.session.expired") {
    await handleCheckoutExpired(req, res, getSupabaseAdmin(), stripe, event.data.object);
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
    var hasManualItem = false;

    for (var i = 0; i < lineItems.length; i++) {
      var item = lineItems[i];

      // "convite-digital" nunca vai para impressão — é entregue por e-mail com o
      // ficheiro já hospedado em /api/order-image?item=<id>.
      if (isDigitalOnly(item.product_format)) {
        digitalDeliveries.push({ templateId: item.template_id, downloadUrl: item.image_url });
        continue;
      }

      // "nfc" (chip NFC) também não passa pela Gelato — é um produto físico preparado
      // à mão pelo dono do site (grava-se o link de /api/digital-card?order=<id> no
      // chip e envia-se por correio normal, fora deste fluxo automático).
      if (isManualFulfillment(item.product_format)) {
        hasManualItem = true;
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
    var finalStatus = hasPhysicalItem ? "sent_to_print" : (hasManualItem ? "manual_pending" : "delivered");

    await supabase
      .from("orders")
      .update({
        status: finalStatus,
        gelato_order_id: firstGelatoId,
        referral_code: referralCode,
        updated_at: new Date().toISOString()
      })
      .eq("id", orderId);
    order.referral_code = referralCode;
    order.status = finalStatus;

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
