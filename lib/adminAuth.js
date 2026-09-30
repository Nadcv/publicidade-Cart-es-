var crypto = require("crypto");

function passwordMatches(given, expected) {
  var a = Buffer.from(String(given || ""));
  var b = Buffer.from(String(expected || ""));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// Devolve true e deixa a função continuar se a password for válida; caso contrário já
// responde com o erro adequado (503 sem ADMIN_PASSWORD configurada, 401 se for errada).
function requireAdmin(req, res) {
  var expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    res.status(503).json({ error: "Painel de administração não configurado (falta ADMIN_PASSWORD)." });
    return false;
  }
  if (!passwordMatches(req.headers["x-admin-password"], expected)) {
    res.status(401).json({ error: "Palavra-passe incorreta." });
    return false;
  }
  return true;
}

module.exports = { requireAdmin };
