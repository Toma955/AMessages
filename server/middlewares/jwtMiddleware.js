const jwt = require("jsonwebtoken");

// Middleware za provjeru JWT tokena iz zaglavlja zahtjeva
const jwtMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"]; // Dohvati "Authorization" header
  if (!authHeader) {
    return res.status(401).json({ success: false, message: "Missing Authorization header" });
  }

  const token = authHeader.split(" ")[1]; // Izdvoji token iz "Bearer <token>"
  if (!token) {
    return res.status(401).json({ success: false, message: "Token not provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Provjera JWT tokena
    req.user = decoded; // Spremi podatke iz tokena u zahtjev
    next(); // Nastavi na sljedeći middleware
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

module.exports = jwtMiddleware;
