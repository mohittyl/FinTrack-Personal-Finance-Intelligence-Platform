// ============================================================
// ADMIN MIDDLEWARE
// Yeh check karta hai ki user ka role "admin" hai ya nahi
// Yeh hamesha auth middleware ke baad chalega
// ============================================================

var prisma = require("../lib/prisma");

async function admin(req, res, next) {
  // Step 1: Database se logged-in user ki details nikalo
  var user = await prisma.user.findUnique({
    where: { id: req.userId }
  });

  // Step 2: Check karo ki user exist karta hai aur uska role "admin" hai
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admin only." });
  }

  // Step 3: Admin hai, aage jaane do
  next();
}

module.exports = admin;
