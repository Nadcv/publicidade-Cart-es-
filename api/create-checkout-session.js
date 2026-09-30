var Stripe = require("stripe");
var { getSupabaseAdmin } = require("../lib/supabase");
var { priceForQuantity, getAllowedQuantities } = require("../lib/price");
var { isAllowedFormat, isDigitalOnly, needsImage } = require("../lib/formats");

var ALWAYS_REQUIRED_FIELDS = ["firstName", "lastName", "email"];
var PHYSICAL_ONLY_FIELDS = ["addressLine1", "city", "postCode", "country"];
var MAX_ITEMS = 10;

function validateItem(raw, index) {
  var templateId = String((raw && raw.templateId) || "").slice(0, 60);
  var format = isAllowedFormat(raw && raw.format) ? raw.format : "card";
  var quantity = parseInt(raw && raw.quantity, 10);
  var fields = raw && raw.fields && typeof raw.fields === "object" ? raw.fields : {};
  var imageBase64 = raw && raw.imageBase64;

  if (!templateId) throw new Error("Item " + (index + 1) + ": templateId em falta.");

  var amountCents = priceForQuantity(format, quantity);
  if (amountCents === null) {
    throw new Error(
      "Item " + (index + 1) + ": quantidade inválida. Opções: " + getAllowedQuantities(format).join(", ") + "."
    );
  }

  // Alguns formatos (ex: "nfc") não têm nenhuma arte impressa — só levam os dados de
  // contacto (fields), por isso não exigimos imagem nesse caso.
  var base64Data = null;
  if (needsImage(format)) {
    if (!imageBase64 || typeof imageBase64 !== "string" || !imageBase64.startsWith("data:image/")) {
      throw new Error("Item " + (index + 1) + ": imagem do cartão em falta ou inválida.");
    }
    base64Data = imageBase64.split(",")[1];
    var buffer = Buffer.from(base64Data, "base64");
    if (buffer.length > 8 * 1024 * 1024) {
      throw new Error("Item " + (index + 1) + ": imagem demasiado grande (máx. 8MB).");
    }
  }

  return { templateId: templateId, format: format, quantity: quantity, fields: fields, base64Data: base64Data, amountCents: amountCents };
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Método não permitido." });
    return;
  }

  try {
    var body = req.body || {};
    var rawItems = Array.isArray(body.items) ? body.items : [];
    var shipping = body.shipping && typeof body.shipping === "object" ? body.shipping : {};

    if (!rawItems.length) {
      res.status(400).json({ error: "Carrinho vazio." });
      return;
    }
    if (rawItems.length > MAX_ITEMS) {
      res.status(400).json({ error: "Máximo de " + MAX_ITEMS + " itens por pedido." });
      return;
    }

    var items;
    try {
      items = rawItems.map(validateItem);
    } catch (validationErr) {
      res.status(400).json({ error: validationErr.message });
      return;
    }

    // Morada de envio só é obrigatória se houver pelo menos um item físico no carrinho —
    // um pedido 100% "convite-digital" é entregue por e-mail, sem impressão nem envio.
    var hasPhysicalItem = items.some(function (it) { return !isDigitalOnly(it.format); });
    var requiredFields = ALWAYS_REQUIRED_FIELDS.concat(hasPhysicalItem ? PHYSICAL_ONLY_FIELDS : []);

    for (var i = 0; i < requiredFields.length; i++) {
      var key = requiredFields[i];
      if (!shipping[key] || !String(shipping[key]).trim()) {
        res.status(400).json({ error: "Dados de contacto/envio incompletos (campo em falta: " + key + ")." });
        return;
      }
    }
    if (hasPhysicalItem && !/^[A-Za-z]{2}$/.test(String(shipping.country || "").trim())) {
      res.status(400).json({ error: "Código do país deve ter 2 letras (ex: PT, BR, ES)." });
      return;
    }

    var currency = (process.env.CURRENCY || "eur").toLowerCase();
    var totalCents = items.reduce(function (sum, it) { return sum + it.amountCents; }, 0);
    var supabase = getSupabaseAdmin();
    var siteUrl = process.env.PUBLIC_SITE_URL || ("https://" + req.headers.host);
    var first = items[0];

    // 1. Cria o pedido "pai" (encomenda). Os campos template_id/product_format/quantity/
    //    image_data espelham o primeiro item, por compatibilidade com código que só lê orders.
    var insertResult = await supabase
      .from("orders")
      .insert({
        status: "pending_payment",
        template_id: first.templateId,
        product_format: first.format,
        quantity: first.quantity,
        fields: first.fields,
        image_data: first.base64Data,
        item_count: items.length,
        shipping_name: shipping.firstName + " " + shipping.lastName,
        shipping_address: shipping,
        contact_email: shipping.email,
        amount_cents: totalCents,
        currency: currency
      })
      .select()
      .single();

    if (insertResult.error) throw insertResult.error;
    var order = insertResult.data;

    // 2. A URL pública da imagem do item principal é o nosso próprio endpoint
    //    (só faz sentido se esse item tiver mesmo uma imagem — ver needsImage()).
    if (first.base64Data) {
      var imageUrl = siteUrl + "/api/order-image?id=" + order.id;
      await supabase.from("orders").update({ image_url: imageUrl }).eq("id", order.id);
    }

    // 3. Cria uma linha em order_items por item do carrinho (incluindo o primeiro, para
    //    que order_items seja sempre a lista completa e autoritativa dos itens).
    var itemRows = items.map(function (it) {
      return {
        order_id: order.id,
        template_id: it.templateId,
        product_format: it.format,
        quantity: it.quantity,
        fields: it.fields,
        image_data: it.base64Data,
        amount_cents: it.amountCents
      };
    });
    var itemsInsertResult = await supabase.from("order_items").insert(itemRows).select();
    if (itemsInsertResult.error) throw itemsInsertResult.error;

    var itemUrlUpdates = itemsInsertResult.data
      .filter(function (row) { return row.image_data; })
      .map(function (row) {
        return supabase
          .from("order_items")
          .update({ image_url: siteUrl + "/api/order-image?item=" + row.id })
          .eq("id", row.id);
      });
    await Promise.all(itemUrlUpdates);

    // 4. Cria a sessão de pagamento Stripe, um line_item por item do carrinho.
    var FORMAT_PRODUCT_NAME = {
      card: "Cartões de visita impressos",
      flyer: "Flyers A5 impressos",
      convite: "Convites impressos",
      "convite-digital": "Convite digital (entrega por e-mail)",
      nfc: "Chip NFC com cartão digital"
    };
    var lineItems = items.map(function (it) {
      var productName = (FORMAT_PRODUCT_NAME[it.format] || "Impressos") +
        " (" + it.quantity + " un.) — " + it.templateId;
      return {
        quantity: 1,
        price_data: {
          currency: currency,
          unit_amount: it.amountCents,
          product_data: {
            name: productName,
            description: (it.fields.empresa || it.fields.nome || "UniAds Studio")
          }
        }
      };
    });

    var stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    var session = await stripe.checkout.sessions.create({
      mode: "payment",
      allow_promotion_codes: true,
      line_items: lineItems,
      customer_email: shipping.email,
      metadata: { order_id: order.id },
      success_url: siteUrl + "/pedido-confirmado.html?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: siteUrl + "/index.html#editor"
    });

    await supabase.from("orders").update({ stripe_session_id: session.id }).eq("id", order.id);

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("create-checkout-session error:", err);
    res.status(500).json({ error: "Não foi possível iniciar o pagamento. Tenta novamente." });
  }
};

module.exports.config = { api: { bodyParser: { sizeLimit: "40mb" } } };
