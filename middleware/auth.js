// ============================================================
// AUTH MIDDLEWARE
// Yeh check karta hai ki user logged in hai ya nahi (Valid JWT Token)
// ============================================================

var jwt = require("jsonwebtoken");

function auth(req, res, next) {
  // Step 1: Request header se Authorization token nikalo
  // Format hota hai: "Bearer <token>"
  var authHeader = req.headers.authorization || "";
  var parts = authHeader.split(" ");
  var token = parts[1]; // Bearer ke baad wala token

  // Step 2: Agar token nahi mila toh 401 Unauthorized return karo
  if (!token) {
    return res.status(401).json({ error: "Please log in first" });
  }

  // Step 3: Token ko secret key se verify karo
  try {
    var decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Token ke payload se userId nikal kar request object mein attach karo
    req.userId = decoded.userId;
    next(); // Next function ya route handler pe jao
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = auth;
