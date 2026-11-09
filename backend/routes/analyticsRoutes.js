
const express = require("express");
const pool = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const PERIODS = {
  "7d": {
    days: 7,
    label: "Last 7 days",
    daily: true,
  },
  "30d": {
    days: 30,
    label: "Last 30 days",
    daily: true,
  },
  "3m": {
    days: 90,
    label: "Last 3 months",
    daily: false,
  },
  "6m": {
    days: 180,
    label: "Last 6 months",
    daily: false,
  },
  "1y": {
    days: 365,
    label: "Last 1 year",
    daily: false,
  },
};

router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const period = req.query.period || "6m";
    const config = PERIODS[period];

    if (!config) {
      return res.status(400).json({
        error: "Invalid period. Use 7d, 30d, 3m, 6m or 1y.",
      });
    }

    const days = config.days;
    const isDaily = config.daily;

    /*
     * Range includes today and the preceding days.
     * For 30d, for example, this covers today + 29 previous days.
     */
    const startOffset = days - 1;

    // 1. Summary: income and expenses
    const summaryResult = await pool.query(
      `
      SELECT
        COALESCE(
          SUM(amount) FILTER (WHERE type = 'income'),
          0
        ) AS total_income,

        COALESCE(
          SUM(amount) FILTER (WHERE type = 'expense'),
          0
        ) AS total_expenses

      FROM transactions

      WHERE user_id = $1
        AND transaction_date >=
          CURRENT_DATE - ($2 * INTERVAL '1 day')
        AND transaction_date <
          CURRENT_DATE + INTERVAL '1 day'
      `,
      [userId, startOffset]
    );

    const totalIncome = Number(
      summaryResult.rows[0].total_income
    );

    const totalExpenses = Number(
      summaryResult.rows[0].total_expenses
    );

    const totalSavings = totalIncome - totalExpenses;

    const savingsRate =
      totalIncome > 0
        ? (totalSavings / totalIncome) * 100
        : 0;

    // 2. Generate every day/month bucket, including empty ones
    const trendResult = await pool.query(
      `
      WITH date_buckets AS (
        SELECT generate_series(
          DATE_TRUNC(
            CASE WHEN $3::boolean THEN 'day' ELSE 'month' END,
            CURRENT_DATE - ($2 * INTERVAL '1 day')
          ),
          DATE_TRUNC(
            CASE WHEN $3::boolean THEN 'day' ELSE 'month' END,
            CURRENT_DATE
          ),
          CASE WHEN $3::boolean
            THEN INTERVAL '1 day'
            ELSE INTERVAL '1 month'
          END
        ) AS bucket_date
      ),

      transaction_totals AS (
        SELECT
          DATE_TRUNC(
            CASE WHEN $3::boolean THEN 'day' ELSE 'month' END,
            transaction_date
          ) AS bucket_date,

          COALESCE(
            SUM(amount) FILTER (WHERE type = 'income'),
            0
          ) AS income,

          COALESCE(
            SUM(amount) FILTER (WHERE type = 'expense'),
            0
          ) AS expenses

        FROM transactions

        WHERE user_id = $1
          AND transaction_date >=
            CURRENT_DATE - ($2 * INTERVAL '1 day')
          AND transaction_date <
            CURRENT_DATE + INTERVAL '1 day'

        GROUP BY 1
      )

      SELECT
        TO_CHAR(
          d.bucket_date,
          CASE
            WHEN $3::boolean THEN 'DD Mon'
            ELSE 'Mon YYYY'
          END
        ) AS month,

        COALESCE(t.income, 0) AS income,
        COALESCE(t.expenses, 0) AS expenses

      FROM date_buckets d

      LEFT JOIN transaction_totals t
        ON t.bucket_date = d.bucket_date

      ORDER BY d.bucket_date ASC
      `,
      [userId, startOffset, isDaily]
    );

    // 3. Spending by category (expenses only)
    const categoryResult = await pool.query(
      `
      SELECT
        category,
        COALESCE(SUM(amount), 0) AS total

      FROM transactions

      WHERE user_id = $1
        AND type = 'expense'
        AND transaction_date >=
          CURRENT_DATE - ($2 * INTERVAL '1 day')
        AND transaction_date <
          CURRENT_DATE + INTERVAL '1 day'

      GROUP BY category
      ORDER BY SUM(amount) DESC
      `,
      [userId, startOffset]
    );

    // 4. Convert PostgreSQL numeric values to JS numbers
    const monthlyData = trendResult.rows.map((row) => ({
      month: row.month,
      income: Number(row.income),
      expenses: Number(row.expenses),
    }));

    const spendingByCategory = categoryResult.rows.map((row) => ({
      category: row.category || "Other",
      total: Number(row.total),
    }));

    // 5. Send analytics response
    return res.status(200).json({
      period,
      periodLabel: config.label,

      summary: {
        totalIncome,
        totalExpenses,
        totalSavings,
        savingsRate: Number(savingsRate.toFixed(2)),
      },

      monthlyData,
      spendingByCategory,
      topCategories: spendingByCategory.slice(0, 5),
    });
  } catch (error) {
    console.error("Analytics error:", error.message);
    console.error("SQL error code:", error.code);

    return res.status(500).json({
      error: "Unable to load analytics",
    });
  }
});

module.exports = router;
