var Stripe = require("stripe");

// Nomes legíveis por formato, usados na linha de produto que aparece no checkout da
// Stripe. Mantido aqui (não em lib/formats.js) porque é só texto de apresentação.
var FORMAT_PRODUCT_NAME = {
  card: "Cartões de visita impressos",
  flyer: "Flyers A5 impressos",
  convite: "Convites impressos",
  "convite-digital": "Convite digital (entrega por e-mail)",
  nfc: "Chip NFC com cartão digital"
};

// Cria uma Stripe Checkout Session a partir de uma lista de itens já normalizada:
// [{ templateId, format, quantity, fields, amountCents }, ...]. Partilhado por
// api/create-checkout-session.js (compra inicial) e api/stripe-webhook.js (quando
// uma sessão anterior expira sem ser paga, recriamos uma nova para o e-mail de
// "carrinho abandonado" ter um link de pagamento válido).
async function createStripeSessionForOrder(opts) {
  var stripe = Stripe(process.env.STRIPE_SECRET_KEY);

  var lineItems = opts.items.map(function (it) {
    var productName = (FORMAT_PRODUCT_NAME[it.format] || "Impressos") +
      " (" + it.quantity + " un.) — " + it.templateId;
    return {
      quantity: 1,
      price_data: {
        currency: opts.currency,
        unit_amount: it.amountCents,
        product_data: {
          name: productName,
          description: (it.fields && (it.fields.empresa || it.fields.nome)) || "UniAds Studio"
        }
      }
    };
  });

  return stripe.checkout.sessions.create({
    mode: "payment",
    allow_promotion_codes: true,
    line_items: lineItems,
    customer_email: opts.email,
    metadata: { order_id: opts.orderId },
    success_url: opts.siteUrl + "/pedido-confirmado.html?session_id={CHECKOUT_SESSION_ID}",
    cancel_url: opts.siteUrl + "/index.html#editor"
  });
}

module.exports = { createStripeSessionForOrder: createStripeSessionForOrder };
