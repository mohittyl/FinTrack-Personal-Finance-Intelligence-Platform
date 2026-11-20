const express = require("express");
const prisma = require("../lib/prisma");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const router = express.Router();

router.use(auth, admin); // dono middleware har route pe

// GET ALL USERS
router.get("/users", async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true, _count: { select: { transactions: true } } },
    orderBy: { id: "asc" },
  });
  res.json(users);
});

// DELETE USER
router.delete("/users/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (id === req.userId) return res.status(400).json({ error: "Cannot delete yourself" });
  await prisma.$transaction([
    prisma.transaction.deleteMany({ where: { userId: id } }),
    prisma.budget.deleteMany({ where: { userId: id } }),
    prisma.goal.deleteMany({ where: { userId: id } }),
    prisma.user.delete({ where: { id } }),
  ]);
  res.json({ message: "User deleted" });
});

module.exports = router;
