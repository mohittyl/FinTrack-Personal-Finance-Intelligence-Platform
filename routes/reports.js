const express = require("express");
const prisma = require("../lib/prisma");
const auth = require("../middleware/auth");

const router = express.Router();
router.use(auth);

// Mahino ke naam (Simple Array)
const monthsFull = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const monthsShort = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

// 1. "2026-11" ko "November 2026" ya "Nov 2026" me convert karna
function formatMonth(str, isShort = false) {
  if (!str) return "";
  const parts = str.split("-");
  const year = parts[0];
  const monthNum = parseInt(parts[1], 10);
  const list = isShort ? monthsShort : monthsFull;
  return list[monthNum - 1] ? list[monthNum - 1] + " " + year : str;
}

// 2. Aaj ka current month nikalna jaise "2026-11"
function getCurrentMonth() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return y + "-" + m;
}

// 3. Kisi date ko "YYYY-MM" string me convert karna
function toMonthKey(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return y + "-" + m;
}

// 4. Mahine ki start date aur end date nikalna
function getMonthRange(monthStr) {
  const parts = monthStr.split("-");
  const year = parseInt(parts[0], 10);
  const mon = parseInt(parts[1], 10);
  return {
    start: new Date(year, mon - 1, 1),
    end: new Date(year, mon, 1)
  };
}

// 5. Pichla mahina nikalna (e.g. "2026-11" -> "2026-10")
function getPrevMonth(monthStr) {
  const parts = monthStr.split("-");
  const year = parseInt(parts[0], 10);
  const mon = parseInt(parts[1], 10);
  const d = new Date(year, mon - 2, 1);
  return toMonthKey(d);
}

// 6. Savings rate percentage me calculate karna
function calcRate(income, expense) {
  if (income <= 0) return 0;
  return Number((((income - expense) / income) * 100).toFixed(1));
}

// ============================================================
// API 1: MONTHLY REPORT (GET /api/reports/monthly?month=YYYY-MM)
// ============================================================
router.get("/monthly", async (req, res) => {
  const month = req.query.month || getCurrentMonth();
  const range = getMonthRange(month);

  const prevMonth = getPrevMonth(month);
  const prevRange = getMonthRange(prevMonth);

  // Database se current aur previous month ka data ek sath fetch karna
  const [transactions, budgets, prevTransactions] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId: req.userId, date: { gte: range.start, lt: range.end } },
      orderBy: { date: "desc" }
    }),
    prisma.budget.findMany({
      where: { userId: req.userId, month: month }
    }),
    prisma.transaction.findMany({
      where: { userId: req.userId, date: { gte: prevRange.start, lt: prevRange.end } }
    })
  ]);

  // Budget category-wise mapping
  const budgetMap = {};
  for (const b of budgets) {
    budgetMap[b.category] = b.limit;
  }

  // Transactions ka total calculate karna
  let income = 0;
  let expense = 0;
  let incomeCount = 0;
  let expenseCount = 0;
  const byCategory = {};
  const incomeByCategory = {};
  const categoryCounts = {};
  let largestExpense = null;

  for (const t of transactions) {
    if (t.type === "income") {
      income += t.amount;
      incomeCount++;
      incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount;
    } else {
      expense += t.amount;
      expenseCount++;
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
      categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
      if (!largestExpense || t.amount > largestExpense.amount) {
        largestExpense = { id: t.id, title: t.title, amount: t.amount, category: t.category, date: t.date };
      }
    }
  }

  // Category analysis tayyar karna
  const categoryAnalysis = [];
  for (const cat in byCategory) {
    const amt = byCategory[cat];
    const count = categoryCounts[cat] || 1;
    const budget = budgetMap[cat] !== undefined ? budgetMap[cat] : null;

    categoryAnalysis.push({
      category: cat,
      amount: amt,
      share: expense > 0 ? Number(((amt / expense) * 100).toFixed(1)) : 0,
      count: count,
      avg: Number((amt / count).toFixed(2)),
      budget: budget,
      spent: amt,
      remaining: budget !== null ? budget - amt : null,
      isOverBudget: budget !== null ? amt > budget : false
    });
  }

  categoryAnalysis.sort((a, b) => b.amount - a.amount);

  // Pichle mahine ka total
  let prevIncome = 0;
  let prevExpense = 0;
  for (const t of prevTransactions) {
    if (t.type === "income") prevIncome += t.amount;
    else prevExpense += t.amount;
  }

  const balance = income - expense;
  const prevBalance = prevIncome - prevExpense;
  const incomeDiff = income - prevIncome;
  const expenseDiff = expense - prevExpense;

  res.json({
    month: month,
    monthLabel: formatMonth(month),
    income: income,
    expense: expense,
    balance: balance,
    savingsRate: calcRate(income, expense),
    byCategory: byCategory,
    incomeByCategory: incomeByCategory,
    categoryAnalysis: categoryAnalysis,
    topExpenseCategory: categoryAnalysis[0] || null,
    largestExpense: largestExpense,
    count: transactions.length,
    expenseCount: expenseCount,
    incomeCount: incomeCount,
    transactions: transactions,
    comparison: {
      prevMonth: prevMonth,
      prevMonthLabel: formatMonth(prevMonth),
      prevIncome: prevIncome,
      prevExpense: prevExpense,
      prevBalance: prevBalance,
      incomeDiff: incomeDiff,
      expenseDiff: expenseDiff,
      balanceDiff: balance - prevBalance,
      incomeChangePct: prevIncome > 0 ? Number(((incomeDiff / prevIncome) * 100).toFixed(1)) : null,
      expenseChangePct: prevExpense > 0 ? Number(((expenseDiff / prevExpense) * 100).toFixed(1)) : null
    }
  });
});

// ============================================================
// API 2: 6-MONTH TREND (GET /api/reports/trend?months=6)
// ============================================================
router.get("/trend", async (req, res) => {
  const count = parseInt(req.query.months, 10) || 6;
  const now = new Date();

  // Last N mahino ki list banate hain
  const trend = [];
  const trendMap = {};

  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = toMonthKey(d);
    const item = {
      month: key,
      label: formatMonth(key, true),
      income: 0,
      expense: 0,
      balance: 0,
      savingsRate: 0
    };
    trend.push(item);
    trendMap[key] = item;
  }

  // Database se transactions laate hain
  const fromDate = new Date(now.getFullYear(), now.getMonth() - (count - 1), 1);
  const list = await prisma.transaction.findMany({
    where: { userId: req.userId, date: { gte: fromDate } },
    orderBy: { date: "asc" }
  });

  // Har transaction ko uske month me add karte hain
  for (const t of list) {
    const key = toMonthKey(t.date);
    if (trendMap[key]) {
      if (t.type === "income") trendMap[key].income += t.amount;
      if (t.type === "expense") trendMap[key].expense += t.amount;
    }
  }

  // Balance aur savings rate calculate karte hain
  for (const row of trend) {
    row.balance = row.income - row.expense;
    row.savingsRate = calcRate(row.income, row.expense);
  }

  res.json(trend);
});

// ============================================================
// API 3: DASHBOARD SUMMARY (GET /api/reports/dashboard?month=YYYY-MM)
// ============================================================
router.get("/dashboard", async (req, res) => {
  const month = req.query.month || getCurrentMonth();
  const range = getMonthRange(month);

  const [monthTx, recentTx, budgets, goals] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId: req.userId, date: { gte: range.start, lt: range.end } },
      orderBy: { date: "desc" }
    }),
    prisma.transaction.findMany({
      where: { userId: req.userId },
      orderBy: { date: "desc" },
      take: 5
    }),
    prisma.budget.findMany({
      where: { userId: req.userId, month: month }
    }),
    prisma.goal.findMany({
      where: { userId: req.userId },
      orderBy: { id: "desc" }
    })
  ]);

  let income = 0;
  let expense = 0;
  const byCategory = {};

  for (const t of monthTx) {
    if (t.type === "income") {
      income += t.amount;
    } else {
      expense += t.amount;
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    }
  }

  // Budget vs Spent
  const budgetSummary = [];
  const budgetAlerts = [];

  for (const b of budgets) {
    const spent = byCategory[b.category] || 0;
    const isOver = spent > b.limit;
    const item = {
      id: b.id,
      category: b.category,
      limit: b.limit,
      month: b.month,
      spent: spent,
      isOver: isOver
    };
    budgetSummary.push(item);
    if (isOver) {
      budgetAlerts.push(item);
    }
  }

  // Goals progress
  let totalTarget = 0;
  let totalSaved = 0;
  for (const g of goals) {
    totalTarget += g.target;
    totalSaved += g.saved;
  }
  const overallProgress = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0;

  res.json({
    month: month,
    monthLabel: formatMonth(month),
    summary: {
      income: income,
      expense: expense,
      balance: income - expense,
      savingsRate: calcRate(income, expense),
      count: monthTx.length
    },
    byCategory: byCategory,
    recentTransactions: recentTx,
    budgetAlerts: budgetAlerts,
    budgets: budgetSummary,
    goals: {
      items: goals,
      totalTarget: totalTarget,
      totalSaved: totalSaved,
      overallProgress: overallProgress
    }
  });
});

module.exports = router;
