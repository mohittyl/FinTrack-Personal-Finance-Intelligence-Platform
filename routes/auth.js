const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const auth = require("../middleware/auth");
const router = express.Router();

// Token banao (7 din valid)
const makeToken = (id) => jwt.sign({ userId: id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// REGISTER
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: "All fields required" });
  if (password.length < 6) return res.status(400).json({ error: "Password min 6 chars" });

  const cleanEmail = email.trim().toLowerCase();
  if (await prisma.user.findUnique({ where: { email: cleanEmail } }))
    return res.status(400).json({ error: "Email already registered" });

  const isFirst = (await prisma.user.count()) === 0;
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name: name.trim(), email: cleanEmail, password: hashed, role: isFirst ? "admin" : "user" },
  });
  res.status(201).json({ message: "Registered", token: makeToken(user.id), name: user.name, role: user.role });
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email & password required" });

  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(400).json({ error: "Wrong email or password" });

  res.json({ message: "Login successful", token: makeToken(user.id), name: user.name, role: user.role });
});

// GET PROFILE
router.get("/me", auth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ name: user.name, email: user.email, role: user.role, createdAt: user.createdAt });
});

// UPDATE PROFILE
router.put("/me", auth, async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: "Name required" });
  const updated = await prisma.user.update({ where: { id: req.userId }, data: { name: name.trim() } });
  res.json({ message: "Profile updated", name: updated.name });
});

// CHANGE PASSWORD
router.put("/password", auth, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) return res.status(400).json({ error: "Both passwords required" });
  if (newPassword.length < 6) return res.status(400).json({ error: "Min 6 chars" });

  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) return res.status(404).json({ error: "User not found" });

  if (!(await bcrypt.compare(oldPassword, user.password)))
    return res.status(400).json({ error: "Old password incorrect" });

  await prisma.user.update({ where: { id: user.id }, data: { password: await bcrypt.hash(newPassword, 10) } });
  res.json({ message: "Password changed" });
});

module.exports = router;
