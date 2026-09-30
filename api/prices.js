var { getPriceTable } = require("./lib/price");

// Tabela de preços pública (apenas para o carrinho mostrar subtotais). O preço
// realmente cobrado é sempre recalculado no servidor em create-checkout-session.
module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Método não permitido." });
    return;
  }

  res.status(200).json({
    currency: (process.env.CURRENCY || "eur").toLowerCase(),
    table: getPriceTable()
  });
};
