// ============================================================
// MEMBER 4: Financial Dashboard & Reports
// APIs: Monthly Reports, Category-wise Analysis, 6-Month Trend, Dashboard Summary
// Protected by auth middleware
// ============================================================

var express = require("express");
var prisma = require("../lib/prisma");
var auth = require("../middleware/auth");
var dateUtils = require("../lib/dates");

var router = express.Router();
router.use(auth);

var MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
var MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

function formatMonthLabel(mStr, short) {
  if (!mStr || typeof mStr !== "string" || mStr.indexOf("-") === -1) return mStr || "";
  var parts = mStr.split("-").map(Number);
  var y = parts[0];
  var m = parts[1];
  if (m >= 1 && m <= 12) {
    var names = short ? MONTH_SHORT : MONTH_NAMES;
    return names[m - 1] + " " + y;
  }
  return mStr;
}

function sanitizeMonth(m) {
  if (m && typeof m === "string" && /^\d{4}-\d{2}$/.test(m.trim())) {
    return m.trim();
  }
  return dateUtils.currentMonth();
}

// ========== 1. MONTHLY REPORT (GET /api/reports/monthly?month=2026-11) ==========
router.get("/monthly", async function (req, res) {
  var month = sanitizeMonth(req.query.month);
  var range = dateUtils.monthRange(month);

  var results = await Promise.all([
    prisma.transaction.findMany({
      where: { userId: req.userId, date: { gte: range.start, lt: range.end } },
      orderBy: { date: "desc" }
    }),
    prisma.budget.findMany({
      where: { userId: req.userId, month: month }
    })
  ]);

  var list = results[0];
  var budgets = results[1];

  var budgetMap = {};
  for (var i = 0; i < budgets.length; i++) {
    budgetMap[budgets[i].category] = budgets[i].limit;
  }

  var income = 0;
  var expense = 0;
  var byCategory = {};
  var incomeByCategory = {};
  var categoryCounts = {};
  var largestExpense = null;

  for (var j = 0; j < list.length; j++) {
    var t = list[j];
    if (t.type === "income") {
      income += t.amount;
      incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount;
    } else {
      expense += t.amount;
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
      categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
      if (!largestExpense || t.amount > largestExpense.amount) {
        largestExpense = {
          id: t.id,
          title: t.title,
          amount: t.amount,
          category: t.category,
          date: t.date
        };
      }
    }
  }

  var balance = income - expense;
  var savingsRate = income > 0 ? Number((((income - expense) / income) * 100).toFixed(1)) : 0;

  // Category-wise Analysis
  var categoryKeys = Object.keys(byCategory);
  var categoryAnalysis = [];
  for (var k = 0; k < categoryKeys.length; k++) {
    var cat = categoryKeys[k];
    var amt = byCategory[cat];
    var count = categoryCounts[cat] || 1;
    var share = expense > 0 ? Number(((amt / expense) * 100).toFixed(1)) : 0;
    var avg = Number((amt / count).toFixed(2));
    var budget = budgetMap[cat] !== undefined ? budgetMap[cat] : null;
    var isOverBudget = budget !== null ? amt > budget : false;
    var remaining = budget !== null ? budget - amt : null;

    categoryAnalysis.push({
      category: cat,
      amount: amt,
      share: share,
      count: count,
      avg: avg,
      budget: budget,
      spent: amt,
      remaining: remaining,
      isOverBudget: isOverBudget
    });
  }

  categoryAnalysis.sort(function (a, b) {
    return b.amount - a.amount;
  });

  var topExpenseCategory = categoryAnalysis.length > 0 ? categoryAnalysis[0] : null;

  // Month-over-Month (MoM) comparison
  var monthParts = month.split("-").map(Number);
  var prevDate = new Date(monthParts[0], monthParts[1] - 2, 1);
  var prevMonthKey = dateUtils.monthKey(prevDate);
  var prevRange = dateUtils.monthRange(prevMonthKey);

  var prevList = await prisma.transaction.findMany({
    where: { userId: req.userId, date: { gte: prevRange.start, lt: prevRange.end } }
  });

  var prevIncome = 0;
  var prevExpense = 0;
  for (var p = 0; p < prevList.length; p++) {
    if (prevList[p].type === "income") prevIncome += prevList[p].amount;
    else prevExpense += prevList[p].amount;
  }
  var prevBalance = prevIncome - prevExpense;

  var incomeDiff = income - prevIncome;
  var expenseDiff = expense - prevExpense;
  var balanceDiff = balance - prevBalance;
  var incomeChangePct = prevIncome > 0 ? Number(((incomeDiff / prevIncome) * 100).toFixed(1)) : null;
  var expenseChangePct = prevExpense > 0 ? Number(((expenseDiff / prevExpense) * 100).toFixed(1)) : null;

  res.json({
    month: month,
    monthLabel: formatMonthLabel(month, false),
    income: income,
    expense: expense,
    balance: balance,
    savingsRate: savingsRate,
    byCategory: byCategory,
    incomeByCategory: incomeByCategory,
    categoryAnalysis: categoryAnalysis,
    topExpenseCategory: topExpenseCategory,
    largestExpense: largestExpense,
    count: list.length,
    expenseCount: list.filter(function (t) { return t.type === "expense"; }).length,
    incomeCount: list.filter(function (t) { return t.type === "income"; }).length,
    transactions: list,
    comparison: {
      prevMonth: prevMonthKey,
      prevMonthLabel: formatMonthLabel(prevMonthKey, false),
      prevIncome: prevIncome,
      prevExpense: prevExpense,
      prevBalance: prevBalance,
      incomeDiff: incomeDiff,
      expenseDiff: expenseDiff,
      balanceDiff: balanceDiff,
      incomeChangePct: incomeChangePct,
      expenseChangePct: expenseChangePct
    }
  });
});

// ========== 2. INCOME VS EXPENSE TREND (GET /api/reports/trend?months=6) ==========
router.get("/trend", async function (req, res) {
  var count = Math.max(2, Math.min(24, Number(req.query.months) || 6));
  var now = new Date();
  var months = [];
  for (var i = count - 1; i >= 0; i--) {
    var d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    var key = dateUtils.monthKey(d);
    months.push({ key: key, label: formatMonthLabel(key, true) });
  }

  var fromDate = new Date(now.getFullYear(), now.getMonth() - (count - 1), 1);
  var list = await prisma.transaction.findMany({
    where: { userId: req.userId, date: { gte: fromDate } },
    orderBy: { date: "asc" }
  });

  var result = months.map(function (m) {
    return {
      month: m.key,
      label: m.label,
      income: 0,
      expense: 0,
      balance: 0,
      savingsRate: 0
    };
  });

  for (var j = 0; j < list.length; j++) {
    var t = list[j];
    var mKey = dateUtils.monthKey(t.date);
    for (var r = 0; r < result.length; r++) {
      if (result[r].month === mKey && (t.type === "income" || t.type === "expense")) {
        result[r][t.type] += t.amount;
        break;
      }
    }
  }

  for (var k = 0; k < result.length; k++) {
    var row = result[k];
    row.balance = row.income - row.expense;
    row.savingsRate = row.income > 0 ? Number((((row.income - row.expense) / row.income) * 100).toFixed(1)) : 0;
  }

  res.json(result);
});

// ========== 3. CONSOLIDATED FINANCIAL DASHBOARD (GET /api/reports/dashboard?month=2026-11) ==========
router.get("/dashboard", async function (req, res) {
  var month = sanitizeMonth(req.query.month);
  var range = dateUtils.monthRange(month);

  var results = await Promise.all([
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

  var monthTx = results[0];
  var recentTx = results[1];
  var budgets = results[2];
  var goals = results[3];

  var income = 0;
  var expense = 0;
  var byCategory = {};
  for (var i = 0; i < monthTx.length; i++) {
    var t = monthTx[i];
    if (t.type === "income") income += t.amount;
    else {
      expense += t.amount;
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    }
  }

  var budgetSummary = budgets.map(function (b) {
    var spent = byCategory[b.category] || 0;
    return {
      id: b.id,
      category: b.category,
      limit: b.limit,
      month: b.month,
      spent: spent,
      isOver: spent > b.limit
    };
  });

  var overBudgets = budgetSummary.filter(function (b) { return b.isOver; });

  var totalGoalTarget = goals.reduce(function (sum, g) { return sum + g.target; }, 0);
  var totalGoalSaved = goals.reduce(function (sum, g) { return sum + g.saved; }, 0);
  var goalProgress = totalGoalTarget > 0 ? Math.min(100, Math.round((totalGoalSaved / totalGoalTarget) * 100)) : 0;

  res.json({
    month: month,
    monthLabel: formatMonthLabel(month, false),
    summary: {
      income: income,
      expense: expense,
      balance: income - expense,
      savingsRate: income > 0 ? Number((((income - expense) / income) * 100).toFixed(1)) : 0,
      count: monthTx.length
    },
    byCategory: byCategory,
    recentTransactions: recentTx,
    budgetAlerts: overBudgets,
    budgets: budgetSummary,
    goals: {
      items: goals,
      totalTarget: totalGoalTarget,
      totalSaved: totalGoalSaved,
      overallProgress: goalProgress
    }
  });
});

module.exports = router;
