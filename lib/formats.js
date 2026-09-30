// Formatos vendáveis e como cada um é entregue. Fonte única partilhada por
// create-checkout-session.js e stripe-webhook.js para nunca ficarem dessincronizados.
//
// - DIGITAL_ONLY: entregue por e-mail (o ficheiro final, servido por
//   /api/order-image?item=<id>), sem passar pela Gelato e sem precisar de morada.
// - MANUAL_FULFILLMENT: precisa de morada de envio (é um produto físico), mas não
//   passa pela Gelato — é preparado à mão pelo dono do site (ex: chip NFC gravado
//   manualmente com o link de /api/digital-card) e depois marcado como enviado.
// - NO_IMAGE: não precisa de nenhuma arte/imagem gerada no editor (ex: um chip NFC
//   não tem nada impresso — só leva os dados de contacto).
var ALLOWED_FORMATS = ["card", "flyer", "convite", "convite-digital", "nfc"];
var DIGITAL_ONLY_FORMATS = ["convite-digital"];
var MANUAL_FULFILLMENT_FORMATS = ["nfc"];
var NO_IMAGE_FORMATS = ["nfc"];

function isAllowedFormat(format) {
  return ALLOWED_FORMATS.indexOf(format) !== -1;
}

function isDigitalOnly(format) {
  return DIGITAL_ONLY_FORMATS.indexOf(format) !== -1;
}

function isManualFulfillment(format) {
  return MANUAL_FULFILLMENT_FORMATS.indexOf(format) !== -1;
}

function needsImage(format) {
  return NO_IMAGE_FORMATS.indexOf(format) === -1;
}

module.exports = {
  ALLOWED_FORMATS: ALLOWED_FORMATS,
  isAllowedFormat: isAllowedFormat,
  isDigitalOnly: isDigitalOnly,
  isManualFulfillment: isManualFulfillment,
  needsImage: needsImage
};
