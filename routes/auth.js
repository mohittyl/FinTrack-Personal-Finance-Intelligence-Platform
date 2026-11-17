// ============================================================
// AUTH ROUTES - Register, Login, Profile, Update Name, Change Password, Delete Account
// ============================================================

var express = require("express");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var prisma = require("../lib/prisma");
var auth = require("../middleware/auth");

var router = express.Router();

// Helper 1: Simple email validation without regex
function isEmail(email) {
  if (!email) return false;
  var atPos = email.indexOf("@");
  var dotPos = email.lastIndexOf(".");
  var hasAt = atPos > 0;
  var hasDot = dotPos > atPos + 1;
  var hasEnd = dotPos < email.length - 1;
  var noSpaces = !email.includes(" ");
  return hasAt && hasDot && hasEnd && noSpaces;
}

// Helper 2: JWT token generate karna (7 days validity)
function makeToken(userId) {
  return jwt.sign({ userId: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

// ========== 1. REGISTER (POST /api/auth/register) ==========
router.post("/register", async function (req, res) {
  var name = (req.body.name || "").trim();
  var email = (req.body.email || "").trim().toLowerCase();
  var password = req.body.password || "";

  // Validation checks
  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }
  if (!isEmail(email)) {
    return res.status(400).json({ error: "Please enter a valid email address" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  // Check duplicate email
  var existing = await prisma.user.findUnique({ where: { email: email } });
  if (existing) {
    return res.status(400).json({ error: "Email already registered" });
  }

  // Pehla registered user automatic admin banega
  var totalUsers = await prisma.user.count();
  var role = (totalUsers === 0) ? "admin" : "user";

  // Password hashing
  var hashedPassword = await bcrypt.hash(password, 10);

  // User create in database
  var user = await prisma.user.create({
    data: {
      name: name,
      email: email,
      password: hashedPassword,
      role: role
    }
  });

  res.json({
    token: makeToken(user.id),
    name: user.name,
    role: user.role
  });
});

// ========== 2. LOGIN (POST /api/auth/login) ==========
router.post("/login", async function (req, res) {
  var email = (req.body.email || "").trim().toLowerCase();
  var password = req.body.password || "";

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  // User find by email
  var user = await prisma.user.findUnique({ where: { email: email } });
  if (!user) {
    return res.status(400).json({ error: "Wrong email or password" });
  }

  // Password compare with hashed password
  var isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ error: "Wrong email or password" });
  }

  res.json({
    token: makeToken(user.id),
    name: user.name,
    role: user.role
  });
});

// ========== 3. GET MY PROFILE (GET /api/auth/me) ==========
router.get("/me", auth, async function (req, res) {
  var user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) {
    return res.status(401).json({ error: "User not found" });
  }

  res.json({
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt
  });
});

// ========== 4. UPDATE NAME (PUT /api/auth/me) ==========
router.put("/me", auth, async function (req, res) {
  var name = (req.body.name || "").trim();
  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }

  var updated = await prisma.user.update({
    where: { id: req.userId },
    data: { name: name }
  });

  res.json({ name: updated.name });
});

// ========== 5. CHANGE PASSWORD (PUT /api/auth/password) ==========
router.put("/password", auth, async function (req, res) {
  var oldPassword = req.body.oldPassword || "";
  var newPassword = req.body.newPassword || "";

  var user = await prisma.user.findUnique({ where: { id: req.userId } });

  // Purana password verify karo
  var isOldCorrect = await bcrypt.compare(oldPassword, user.password);
  if (!isOldCorrect) {
    return res.status(400).json({ error: "Old password is wrong" });
  }

  // Naya password validation
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: "New password must be at least 6 characters" });
  }

  // Naya password hash karke update karo
  var hashedNew = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedNew }
  });

  res.json({ message: "Password changed successfully" });
});

// ========== 6. DELETE OWN ACCOUNT (DELETE /api/auth/me) ==========
router.delete("/me", auth, async function (req, res) {
  var password = req.body.password || "";
  var user = await prisma.user.findUnique({ where: { id: req.userId } });

  // Password confirmation check
  var isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ error: "Password is wrong" });
  }

  // Agar aakhri admin hai toh delete na ho sake
  if (user.role === "admin") {
    var adminCount = await prisma.user.count({ where: { role: "admin" } });
    if (adminCount === 1) {
      return res.status(400).json({ error: "You are the only admin. Assign someone else first." });
    }
  }

  await prisma.user.delete({ where: { id: user.id } });
  res.json({ message: "Account deleted successfully" });
});

module.exports = router;
