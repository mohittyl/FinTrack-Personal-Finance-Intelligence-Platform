const express = require("express");
const pool = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// GET DASHBOARD
// ==========================================

router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // ==========================================
    // TOTAL INCOME
    // ==========================================

    const incomeResult = await pool.query(
      `
      SELECT COALESCE(SUM(amount), 0) AS total_income
      FROM transactions
      WHERE user_id = $1
      AND type = 'income'
      `,
      [userId]
    );

    // ==========================================
    // TOTAL EXPENSES
    // ==========================================

    const expenseResult = await pool.query(
      `
      SELECT COALESCE(SUM(amount), 0) AS total_expenses
      FROM transactions
      WHERE user_id = $1
      AND type = 'expense'
      `,
      [userId]
    );

    // ==========================================
    // CURRENT MONTH INCOME
    // ==========================================

    const monthlyIncomeResult = await pool.query(
      `
      SELECT COALESCE(SUM(amount), 0) AS monthly_income
      FROM transactions
      WHERE user_id = $1
      AND type = 'income'
      AND DATE_TRUNC('month', transaction_date)
          = DATE_TRUNC('month', CURRENT_DATE)
      `,
      [userId]
    );

    // ==========================================
    // CURRENT MONTH EXPENSES
    // ==========================================

    const monthlyExpenseResult = await pool.query(
      `
      SELECT COALESCE(SUM(amount), 0) AS monthly_expenses
      FROM transactions
      WHERE user_id = $1
      AND type = 'expense'
      AND DATE_TRUNC('month', transaction_date)
          = DATE_TRUNC('month', CURRENT_DATE)
      `,
      [userId]
    );

    // ==========================================
    // RECENT TRANSACTIONS
    // ==========================================

    const recentResult = await pool.query(
      `
      SELECT
        id,
        title,
        category,
        type,
        amount,
        transaction_date
      FROM transactions
      WHERE user_id = $1
      ORDER BY transaction_date DESC, id DESC
      LIMIT 5
      `,
      [userId]
    );

    // ==========================================
    // SPENDING BY CATEGORY
    // ==========================================

    const categoryResult = await pool.query(
      `
      SELECT
        category,
        SUM(amount) AS total
      FROM transactions
      WHERE user_id = $1
      AND type = 'expense'
      GROUP BY category
      ORDER BY total DESC
      `,
      [userId]
    );

    // ==========================================
    // CURRENT MONTH BUDGETS
    // ==========================================

    const budgetResult = await pool.query(
      `
      SELECT
        b.id,
        b.category,
        b.amount AS budget_amount,

        COALESCE(
          SUM(
            CASE
              WHEN t.type = 'expense'
              THEN t.amount
              ELSE 0
            END
          ),
          0
        ) AS spent

      FROM budgets b

      
LEFT JOIN transactions t
  ON t.user_id = b.user_id
  AND t.category = b.category
  AND t.type = 'expense'
  AND DATE_PART(
    'month',
    t.transaction_date
  ) = b.month
  AND DATE_PART(
    'year',
    t.transaction_date
  ) = b.year


      WHERE b.user_id = $1

      AND b.month = EXTRACT(
        MONTH FROM CURRENT_DATE
      )

      AND b.year = EXTRACT(
        YEAR FROM CURRENT_DATE
      )

      GROUP BY
        b.id,
        b.category,
        b.amount

      ORDER BY b.category
      `,
      [userId]
    );

    // ==========================================
    // GOAL OVERVIEW
    // ==========================================

    const goalResult = await pool.query(
      `
      SELECT
        id,
        title,
        target_amount,
        saved_amount,
        target_date
      FROM goals
      WHERE user_id = $1
      ORDER BY
        target_date ASC NULLS LAST,
        id DESC
      LIMIT 3
      `,
      [userId]
    );

    // ==========================================
    // CALCULATE TOTALS
    // ==========================================

    const totalIncome = Number(incomeResult.rows[0].total_income);

    const totalExpenses = Number(expenseResult.rows[0].total_expenses);

    const balance = totalIncome - totalExpenses;

    // ==========================================
    // CALCULATE MONTHLY DATA
    // ==========================================

    const monthlyIncome = Number(monthlyIncomeResult.rows[0].monthly_income);

    const monthlyExpenses = Number(
      monthlyExpenseResult.rows[0].monthly_expenses
    );

    const monthlySavings = monthlyIncome - monthlyExpenses;

    // ==========================================
    // CALCULATE SAVINGS RATE
    // ==========================================

    let savingsRate = 0;

    if (monthlyIncome > 0) {
      savingsRate = (monthlySavings / monthlyIncome) * 100;
    }

    // ==========================================
    // FORMAT BUDGET DATA
    // ==========================================

    const budgetOverview = budgetResult.rows.map((budget) => {
      const budgetAmount = Number(budget.budget_amount);

      const spent = Number(budget.spent);

      const remaining = budgetAmount - spent;

      let percentage = 0;

      if (budgetAmount > 0) {
        percentage = (spent / budgetAmount) * 100;
      }

      return {
        id: budget.id,

        category: budget.category,

        budgetAmount,

        spent,

        remaining,

        percentage: Number(percentage.toFixed(2)),
      };
    });

    // ==========================================
    // FORMAT GOAL DATA
    // ==========================================

    const goalOverview = goalResult.rows.map((goal) => {
      const targetAmount = Number(goal.target_amount);

      const savedAmount = Number(goal.saved_amount);

      const remaining = Math.max(targetAmount - savedAmount, 0);

      let percentage = 0;

      if (targetAmount > 0) {
        percentage = (savedAmount / targetAmount) * 100;
      }

      return {
        id: goal.id,

        title: goal.title,

        targetAmount,

        savedAmount,

        remaining,

        percentage: Number(Math.min(percentage, 100).toFixed(2)),

        targetDate: goal.target_date,
      };
    });

    // ==========================================
    // FINANCIAL INSIGHTS
    // ==========================================

    const insights = [];

    // ------------------------------------------
    // MONTHLY SAVINGS INSIGHT
    // ------------------------------------------

    if (monthlyIncome > 0) {
      if (monthlySavings > 0) {
        insights.push({
          type: "positive",

          title: "You're saving money",

          message: `You saved ₹${monthlySavings.toFixed(0)} this month.`,
        });
      } else if (monthlySavings < 0) {
        insights.push({
          type: "warning",

          title: "Expenses are higher than income",

          message:
            "Your expenses are currently higher than your income this month.",
        });
      } else {
        insights.push({
          type: "info",

          title: "No savings this month",

          message: "Your income and expenses are currently equal this month.",
        });
      }
    }

    // ------------------------------------------
    // SAVINGS RATE INSIGHT
    // ------------------------------------------

    if (monthlyIncome > 0) {
      if (savingsRate >= 30) {
        insights.push({
          type: "positive",

          title: "Good savings rate",

          message: `Your current savings rate is ${savingsRate.toFixed(1)}%.`,
        });
      } else if (savingsRate > 0) {
        insights.push({
          type: "info",

          title: "Keep an eye on savings",

          message: `Your current savings rate is ${savingsRate.toFixed(1)}%.`,
        });
      }
    }

    // ------------------------------------------
    // BUDGET INSIGHTS
    // ------------------------------------------

    budgetOverview.forEach((budget) => {
      const percentage = Number(budget.percentage || 0);

      // Budget exceeded

      if (percentage >= 100) {
        insights.push({
          type: "warning",

          title: `${budget.category} budget exceeded`,

          message: `You have spent more than your ${budget.category} budget.`,
        });
      }

      // Budget almost used
      else if (percentage >= 80) {
        insights.push({
          type: "warning",

          title: `${budget.category} budget is almost used`,

          message: `You have used ${percentage.toFixed(0)}% of your ${
            budget.category
          } budget.`,
        });
      }
    });

    // ------------------------------------------
    // TOP SPENDING CATEGORY
    // ------------------------------------------

    if (categoryResult.rows.length > 0) {
      const topCategory = categoryResult.rows[0];

      insights.push({
        type: "info",

        title: "Top spending category",

        message: `${
          topCategory.category
        } is currently your highest expense category with ₹${Number(
          topCategory.total
        ).toFixed(0)} spent.`,
      });
    }

    // ------------------------------------------
    // GOAL INSIGHTS
    // ------------------------------------------

    goalOverview.forEach((goal) => {
      // Goal completed

      if (goal.percentage >= 100) {
        insights.push({
          type: "positive",

          title: `${goal.title} completed`,

          message: "You have reached your savings goal.",
        });
      }

      // Goal almost complete
      else if (goal.percentage >= 75) {
        insights.push({
          type: "positive",

          title: `${goal.title} is almost complete`,

          message: `You're ${goal.percentage.toFixed(
            0
          )}% of the way to this goal.`,
        });
      }
    });

    // ==========================================
    // SEND RESPONSE
    // ==========================================

    res.status(200).json({
      // ----------------------------------------
      // SUMMARY
      // ----------------------------------------

      summary: {
        totalIncome,

        totalExpenses,

        balance,

        monthlyIncome,

        monthlyExpenses,

        monthlySavings,

        savingsRate: Number(savingsRate.toFixed(2)),
      },

      // ----------------------------------------
      // RECENT TRANSACTIONS
      // ----------------------------------------

      recentTransactions: recentResult.rows,

      // ----------------------------------------
      // SPENDING BY CATEGORY
      // ----------------------------------------

      spendingByCategory: categoryResult.rows,

      // ----------------------------------------
      // BUDGET OVERVIEW
      // ----------------------------------------

      budgetOverview,

      // ----------------------------------------
      // GOAL OVERVIEW
      // ----------------------------------------

      goalOverview,

      // ----------------------------------------
      // FINANCIAL INSIGHTS
      // ----------------------------------------

      insights,
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    res.status(500).json({
      error: "Unable to load dashboard",
    });
  }
});

module.exports = router;
