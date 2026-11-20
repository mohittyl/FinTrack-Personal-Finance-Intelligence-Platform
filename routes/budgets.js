// MEMBER 3: monthly category budgets
const express = require("express");
const prisma = require("../lib/prisma");
const auth = require("../middleware/auth");
const { monthRange, currentMonth } = require("../lib/dates");

const router = express.Router();
router.use(auth);

// GET /api/budgets?month=2026-11 -> budgets with how much is already spent
router.get("/", async (req, res) => {
  const month = req.query.month || currentMonth();
  const { start, end } = monthRange(month);

  const budgets = await prisma.budget.findMany({ where: { userId: req.userId, month } });
  const spent = await prisma.transaction.groupBy({
    by: ["category"],
    where: { userId: req.userId, type: "expense", date: { gte: start, lt: end } },
    _sum: { amount: true },
  });
  const spentMap = Object.fromEntries(spent.map((s) => [s.category, s._sum.amount]));

  res.json(budgets.map((b) => ({ ...b, spent: spentMap[b.category] || 0 })));
});

// PUT /api/budgets  { category, limit, month }  (create or update)
router.put("/", async (req, res) => {
  const { category, limit, month } = req.body;
  if (!category || !limit || Number(limit) <= 0) return res.status(400).json({ error: "Category and limit are required" });
  const m = month || currentMonth();
  const b = await prisma.budget.upsert({
    where: { userId_category_month: { userId: req.userId, category, month: m } },
    update: { limit: Number(limit) },
    create: { userId: req.userId, category, month: m, limit: Number(limit) },
  });
  res.json(b);
});

router.delete("/:id", async (req, res) => {
  await prisma.budget.deleteMany({ where: { id: Number(req.params.id), userId: req.userId } });
  res.json({ message: "Deleted" });
});

module.exports = router;
