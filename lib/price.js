// Fonte de verdade do preço: nunca confiar num valor vindo do cliente.
// PRICE_TABLE vem de uma env var tipo "card:100:2999,card:250:4999,flyer:50:1999"
// (formato:quantidade:cêntimos). Entradas sem o prefixo do formato ("100:2999") são
// tratadas como "card", por compatibilidade com a versão anterior desta variável.

var DEFAULT_TABLE =
  "card:5:699,card:10:999,card:20:1499,card:50:1999,card:100:2999,card:250:4999,card:500:7999," +
  "flyer:50:1999,flyer:100:3499,flyer:250:6999," +
  "convite:5:1499,convite:10:1999,convite:20:2999,convite:50:4999,convite:100:7999," +
  "convite-digital:1:990," +
  "nfc:1:1499,nfc:2:2499,nfc:5:4999";

function getPriceTable() {
  var raw = process.env.PRICE_TABLE || DEFAULT_TABLE;
  var table = {};
  raw.split(",").forEach(function (entry) {
    var parts = entry.trim().split(":");
    var format, qty, cents;
    if (parts.length === 3) {
      format = parts[0];
      qty = parseInt(parts[1], 10);
      cents = parseInt(parts[2], 10);
    } else if (parts.length === 2) {
      format = "card";
      qty = parseInt(parts[0], 10);
      cents = parseInt(parts[1], 10);
    } else {
      return;
    }
    if (!table[format]) table[format] = {};
    if (qty > 0 && cents > 0) table[format][qty] = cents;
  });
  return table;
}

function getAllowedQuantities(format) {
  var table = getPriceTable();
  var forFormat = table[format] || {};
  return Object.keys(forFormat).map(Number).sort(function (a, b) { return a - b; });
}

// Retorna o preço em cêntimos para um formato+quantidade, ou null se não for um
// escalão válido (o pedido deve ser recusado nesse caso).
function priceForQuantity(format, qty) {
  var table = getPriceTable();
  var forFormat = table[format];
  if (!forFormat) return null;
  return Object.prototype.hasOwnProperty.call(forFormat, qty) ? forFormat[qty] : null;
}

module.exports = { getPriceTable, getAllowedQuantities, priceForQuantity };
