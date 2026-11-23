
const express = require("express");
const pool = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const isValidAmount = (amount) => {
  const value = Number(amount);
  return Number.isFinite(value) && value > 0;
};

const isValidMonth = (month) => {
  const value = Number(month);
  return Number.isInteger(value) && value >= 1 && value <= 12;
};

const isValidYear = (year) => {
  const value = Number(year);
  return Number.isInteger(value) && value >= 2000 && value <= 9999;
};

const getBudgetDetails = (budget) => ({
  id: budget.id,
  category: budget.category,
  amount: Number(budget.amount),
  month: Number(budget.month),
  year: Number(budget.year),
  spent: Number(budget.spent || 0),
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        b.id,
        b.category,
        b.amount,
        b.month,
        b.year,
        COALESCE(SUM(t.amount), 0) AS spent
      FROM budgets b
      LEFT JOIN transactions t
        ON t.user_id = b.user_id
        AND t.category = b.category
        AND t.type = 'expense'
        AND t.transaction_date >= make_date(b.year, b.month, 1)
        AND t.transaction_date < make_date(b.year, b.month, 1) + INTERVAL '1 month'
      WHERE b.user_id = $1
      GROUP BY
        b.id,
        b.category,
        b.amount,
        b.month,
        b.year
      ORDER BY
        b.year DESC,
        b.month DESC,
        b.category ASC
      `,
      [req.user.id]
    );

    res.status(200).json(result.rows.map(getBudgetDetails));
  } catch (error) {
    console.error("Get budgets error:", error);
    res.status(500).json({
      error: "Unable to fetch budgets",
    });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, amount, month, year } = req.body;

    const cleanCategory =
      typeof category === "string" ? category.trim() : "";

    if (!cleanCategory) {
      return res.status(400).json({
        error: "Category is required",
      });
    }

    if (cleanCategory.length > 100) {
      return res.status(400).json({
        error: "Category cannot be longer than 100 characters",
      });
    }

    if (!isValidAmount(amount)) {
      return res.status(400).json({
        error: "Budget amount must be a valid number greater than 0",
      });
    }

    if (!isValidMonth(month)) {
      return res.status(400).json({
        error: "Month must be a whole number between 1 and 12",
      });
    }

    if (!isValidYear(year)) {
      return res.status(400).json({
        error: "Year must be a whole number between 2000 and 9999",
      });
    }

    const existingBudget = await pool.query(
      `
      SELECT id
      FROM budgets
      WHERE user_id = $1
        AND LOWER(category) = LOWER($2)
        AND month = $3
        AND year = $4
      `,
      [userId, cleanCategory, Number(month), Number(year)]
    );

    if (existingBudget.rows.length > 0) {
      return res.status(409).json({
        error: "A budget already exists for this category and month",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO budgets (user_id, category, amount, month, year)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, category, amount, month, year
      `,
      [
        userId,
        cleanCategory,
        Number(amount),
        Number(month),
        Number(year),
      ]
    );

    res.status(201).json({
      message: "Budget created successfully",
      budget: getBudgetDetails(result.rows[0]),
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        error: "A budget already exists for this category and month",
      });
    }

    console.error("Create budget error:", error);
    res.status(500).json({
      error: "Unable to create budget",
    });
  }
});

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const budgetId = Number(req.params.id);
    const { category, amount, month, year } = req.body;

    const cleanCategory =
      typeof category === "string" ? category.trim() : "";

    if (!Number.isInteger(budgetId) || budgetId <= 0) {
      return res.status(400).json({
        error: "Invalid budget id",
      });
    }

    if (!cleanCategory) {
      return res.status(400).json({
        error: "Category is required",
      });
    }

    if (cleanCategory.length > 100) {
      return res.status(400).json({
        error: "Category cannot be longer than 100 characters",
      });
    }

    if (!isValidAmount(amount)) {
      return res.status(400).json({
        error: "Budget amount must be a valid number greater than 0",
      });
    }

    if (!isValidMonth(month)) {
      return res.status(400).json({
        error: "Month must be a whole number between 1 and 12",
      });
    }

    if (!isValidYear(year)) {
      return res.status(400).json({
        error: "Year must be a whole number between 2000 and 9999",
      });
    }

    const existingBudget = await pool.query(
      `
      SELECT id
      FROM budgets
      WHERE user_id = $1
        AND LOWER(category) = LOWER($2)
        AND month = $3
        AND year = $4
        AND id != $5
      `,
      [
        userId,
        cleanCategory,
        Number(month),
        Number(year),
        budgetId,
      ]
    );

    if (existingBudget.rows.length > 0) {
      return res.status(409).json({
        error: "A budget already exists for this category and month",
      });
    }

    const result = await pool.query(
      `
      UPDATE budgets
      SET category = $1, amount = $2, month = $3, year = $4
      WHERE id = $5 AND user_id = $6
      RETURNING id, category, amount, month, year
      `,
      [
        cleanCategory,
        Number(amount),
        Number(month),
        Number(year),
        budgetId,
        userId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Budget not found",
      });
    }

    res.status(200).json({
      message: "Budget updated successfully",
      budget: getBudgetDetails(result.rows[0]),
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        error: "A budget already exists for this category and month",
      });
    }

    console.error("Update budget error:", error);
    res.status(500).json({
      error: "Unable to update budget",
    });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const budgetId = Number(req.params.id);

    if (!Number.isInteger(budgetId) || budgetId <= 0) {
      return res.status(400).json({
        error: "Invalid budget id",
      });
    }

    const result = await pool.query(
      `
      DELETE FROM budgets
      WHERE id = $1 AND user_id = $2
      RETURNING id
      `,
      [budgetId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Budget not found",
      });
    }

    res.status(200).json({
      message: "Budget deleted successfully",
    });
  } catch (error) {
    console.error("Delete budget error:", error);
    res.status(500).json({
      error: "Unable to delete budget",
    });
  }
});

module.exports = router;