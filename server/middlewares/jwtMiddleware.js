import jwt from "jsonwebtoken";


const jwtMiddleware = (req, res, next) => {
 
  
  const authHeader = req.headers["authorization"]; 
  if (!authHeader) {
    console.log(' JWT Middleware - Missing Authorization header');
    return res.status(401).json({ success: false, message: "Missing Authorization header" });
  }

  const token = authHeader.split(" ")[1]; 
  if (!token) {
    console.log(' JWT Middleware - Token not provided in Authorization header');
    return res.status(401).json({ success: false, message: "Token not provided" });
  }

 

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret'); 

    req.user = decoded; 
    next(); 
  } catch (err) {
   
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

export default jwtMiddleware;
