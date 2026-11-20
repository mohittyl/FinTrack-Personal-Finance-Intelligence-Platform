// MEMBER 4: monthly report + 6 month trend
const express = require("express");
const prisma = require("../lib/prisma");
const auth = require("../middleware/auth");
const { monthRange, monthKey, currentMonth } = require("../lib/dates");

const router = express.Router();
router.use(auth);

// GET /api/reports/monthly?month=2026-11
router.get("/monthly", async (req, res) => {
  const month = req.query.month || currentMonth();
  const { start, end } = monthRange(month);
  const list = await prisma.transaction.findMany({
    where: { userId: req.userId, date: { gte: start, lt: end } },
  });

  let income = 0, expense = 0;
  const byCategory = {};
  for (const t of list) {
    if (t.type === "income") income += t.amount;
    else {
      expense += t.amount;
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    }
  }
  res.json({ month, income, expense, balance: income - expense, byCategory, count: list.length });
});

// GET /api/reports/trend -> last 6 months income vs expense
router.get("/trend", async (req, res) => {
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) months.push(monthKey(new Date(now.getFullYear(), now.getMonth() - i, 1)));

  const from = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const list = await prisma.transaction.findMany({ where: { userId: req.userId, date: { gte: from } } });

  const result = months.map((m) => ({ month: m, income: 0, expense: 0 }));
  for (const t of list) {
    const row = result.find((r) => r.month === monthKey(t.date));
    if (row) row[t.type] += t.amount;
  }
  res.json(result);
});

module.exports = router;
