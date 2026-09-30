// Códigos de referência: depois de um pedido ser pago com sucesso, geramos um
// código de desconto Stripe único (Promotion Code) para o cliente partilhar com
// amigos. Reaproveita o sistema de cupões nativo da Stripe — os descontos e as
// contagens de utilização já ficam visíveis no dashboard da Stripe (Coupons →
// Promotion codes), sem precisarmos de construir esse rastreio nós próprios.
//
// Requer um cupão previamente criado no dashboard da Stripe (Product catalog →
// Coupons) com o desconto que quiseres dar (ex: 10% off), cujo ID vai na variável
// REFERRAL_COUPON_ID. Sem essa variável, a função simplesmente não gera código
// (best-effort — nunca deve impedir a confirmação do pedido).

function randomCode(orderId) {
  var alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  var out = "AMIGO-";
  var seed = orderId.replace(/-/g, "");
  for (var i = 0; i < 6; i++) {
    var idx = parseInt(seed.substr((i * 2) % seed.length, 2), 16) % alphabet.length;
    out += alphabet[isNaN(idx) ? i % alphabet.length : idx];
  }
  return out;
}

async function createReferralCode(stripe, orderId) {
  var couponId = process.env.REFERRAL_COUPON_ID;
  if (!couponId) return null;

  try {
    var promo = await stripe.promotionCodes.create({
      coupon: couponId,
      code: randomCode(orderId),
      metadata: { source_order_id: orderId }
    });
    return promo.code;
  } catch (err) {
    // Colisão de código (muito raro) — deixa a Stripe gerar um código automaticamente.
    if (err && err.code === "resource_already_exists") {
      try {
        var retryPromo = await stripe.promotionCodes.create({
          coupon: couponId,
          metadata: { source_order_id: orderId }
        });
        return retryPromo.code;
      } catch (retryErr) {
        console.error("Falha ao gerar código de referência, 2ª tentativa (order_id=" + orderId + "):", retryErr.message || retryErr);
        return null;
      }
    }
    console.error("Falha ao gerar código de referência (order_id=" + orderId + "):", err.message || err);
    return null;
  }
}

module.exports = { createReferralCode };
