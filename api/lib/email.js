// Envio de e-mail via API da Resend (https://resend.com). Best-effort: se
// RESEND_API_KEY não estiver configurada, simplesmente não envia (não rebenta o fluxo
// de pagamento/impressão por causa disto).

async function sendEmail(to, subject, html) {
  var apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !to) return;

  var from = process.env.EMAIL_FROM || "UniAds Studio <onboarding@resend.dev>";
  var res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + apiKey },
    body: JSON.stringify({ from: from, to: [to], subject: subject, html: html })
  });

  if (!res.ok) {
    var text = await res.text().catch(function () { return ""; });
    console.error("Falha ao enviar e-mail (" + res.status + "):", text);
  }
}

function formatMoney(amountCents, currency) {
  try {
    return (amountCents / 100).toLocaleString("pt-PT", { style: "currency", currency: currency.toUpperCase() });
  } catch (e) {
    return (amountCents / 100).toFixed(2) + " " + currency.toUpperCase();
  }
}

function orderConfirmationHtml(order) {
  var formatLabel = order.product_format === "flyer" ? "flyers A5" : "cartões de visita";
  var price = formatMoney(order.amount_cents, order.currency);
  var itemCount = order.item_count || 1;
  var itemsLine = itemCount > 1
    ? "Os teus <strong>" + itemCount + " itens</strong> (primeiro: " + order.quantity + " " + formatLabel + ") "
    : "Os teus <strong>" + order.quantity + " " + formatLabel + "</strong> ";

  var referralBlock = order.referral_code
    ? '<div style="margin:18px 0;padding:14px;border:1px dashed #b48a3f;border-radius:8px;text-align:center;">' +
      '<p style="margin:0 0 6px;font-size:13px;color:#666;">Partilha este código com amigos — eles ganham desconto na primeira compra:</p>' +
      '<p style="margin:0;font-size:20px;font-weight:700;letter-spacing:.04em;">' + order.referral_code + "</p>" +
      "</div>"
    : "";

  return (
    '<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:480px;margin:0 auto;color:#111;">' +
    "<h2 style=\"margin:0 0 12px;\">O teu pedido foi confirmado!</h2>" +
    "<p>Obrigado pela compra. " + itemsLine +
    "estão a ser preparados para impressão e vão ser enviados para a morada indicada.</p>" +
    '<table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;">' +
    "<tr><td style=\"padding:6px 0;color:#666;\">Total pago</td><td style=\"padding:6px 0;text-align:right;font-weight:600;\">" + price + "</td></tr>" +
    "<tr><td style=\"padding:6px 0;color:#666;\">Referência</td><td style=\"padding:6px 0;text-align:right;\">" + order.id + "</td></tr>" +
    "</table>" +
    referralBlock +
    '<p style="color:#666;font-size:13px;">Qualquer dúvida, responde a este e-mail com a referência acima.</p>' +
    "</div>"
  );
}

module.exports = { sendEmail, orderConfirmationHtml };
