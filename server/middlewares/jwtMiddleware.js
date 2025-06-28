const jwt = require("jsonwebtoken");

// Middleware za provjeru JWT tokena iz zaglavlja zahtjeva
const jwtMiddleware = (req, res, next) => {
  console.log('🔐 JWT Middleware: START');
  console.log('🔐 JWT Middleware - Headers:', req.headers);
  console.log('🔐 JWT Middleware - Authorization header:', req.headers["authorization"]);
  
  const authHeader = req.headers["authorization"]; // Dohvati "Authorization" header
  if (!authHeader) {
    console.log('❌ JWT Middleware - Missing Authorization header');
    return res.status(401).json({ success: false, message: "Missing Authorization header" });
  }

  const token = authHeader.split(" ")[1]; // Izdvoji token iz "Bearer <token>"
  if (!token) {
    console.log('❌ JWT Middleware - Token not provided in Authorization header');
    return res.status(401).json({ success: false, message: "Token not provided" });
  }

  console.log('🔐 JWT Middleware - Token received:', token.substring(0, 20) + '...');
  console.log('🔐 JWT Middleware - JWT_SECRET exists:', !!process.env.JWT_SECRET);
  console.log('🔐 JWT Middleware - JWT_SECRET value:', process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 10) + '...' : 'undefined');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret'); 
    console.log('✅ JWT Middleware - Token verified successfully:', decoded);
    console.log('✅ JWT Middleware - Setting req.user =', decoded);
    req.user = decoded; 
    next(); 
  } catch (err) {
    console.log('❌ JWT Middleware - Token verification failed:', err.message);
    console.log('❌ JWT Middleware - Error details:', err);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

module.exports = jwtMiddleware;
