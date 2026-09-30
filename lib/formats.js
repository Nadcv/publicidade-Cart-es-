// Formatos vendáveis e quais deles são "só digital": entregues por e-mail (o
// ficheiro final, servido por /api/order-image?item=<id>), sem passar pela Gelato
// e sem precisar de morada de envio. Fonte única partilhada por
// create-checkout-session.js e stripe-webhook.js para nunca ficarem dessincronizados.
var ALLOWED_FORMATS = ["card", "flyer", "convite", "convite-digital"];
var DIGITAL_ONLY_FORMATS = ["convite-digital"];

function isAllowedFormat(format) {
  return ALLOWED_FORMATS.indexOf(format) !== -1;
}

function isDigitalOnly(format) {
  return DIGITAL_ONLY_FORMATS.indexOf(format) !== -1;
}

module.exports = { ALLOWED_FORMATS: ALLOWED_FORMATS, isAllowedFormat: isAllowedFormat, isDigitalOnly: isDigitalOnly };
