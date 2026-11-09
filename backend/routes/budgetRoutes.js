const express = require("express");
const pool = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/*
  GET /api/budgets

  Get all budgets of logged-in user
*/
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT
        b.id,
        b.category,
        b.amount,
        b.month,
        b.year,

        COALESCE(
          (
            SELECT SUM(t.amount)
            FROM transactions t
            WHERE t.user_id = b.user_id
              AND t.category = b.category
              AND t.type = 'expense'
              AND EXTRACT(
                MONTH FROM t.transaction_date
              ) = b.month
              AND EXTRACT(
                YEAR FROM t.transaction_date
              ) = b.year
          ),
          0
        ) AS spent

      FROM budgets b

      WHERE b.user_id = $1

      ORDER BY
        b.year DESC,
        b.month DESC,
        b.category ASC
      `,
      [userId]
    );

    const budgets = result.rows.map((budget) => ({
      id: budget.id,
      category: budget.category,
      amount: Number(budget.amount),
      month: Number(budget.month),
      year: Number(budget.year),
      spent: Number(budget.spent),
    }));

    res.status(200).json(budgets);

  } catch (error) {
    console.error("Get budgets error:", error);

    res.status(500).json({
      error: "Unable to fetch budgets",
    });
  }
});


/*
  POST /api/budgets

  Create a new budget
*/
router.post("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      category,
      amount,
      month,
      year,
    } = req.body;

    // Validation
    if (!category || !amount || !month || !year) {
      return res.status(400).json({
        error:
          "Category, amount, month and year are required",
      });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({
        error: "Budget amount must be greater than 0",
      });
    }

    if (
      Number(month) < 1 ||
      Number(month) > 12
    ) {
      return res.status(400).json({
        error: "Month must be between 1 and 12",
      });
    }

    // Check duplicate budget
    const existingBudget = await pool.query(
      `
      SELECT id
      FROM budgets
      WHERE user_id = $1
        AND category = $2
        AND month = $3
        AND year = $4
      `,
      [
        userId,
        category,
        Number(month),
        Number(year),
      ]
    );

    if (existingBudget.rows.length > 0) {
      return res.status(409).json({
        error:
          "A budget already exists for this category and month",
      });
    }

    // Create budget
    const result = await pool.query(
      `
      INSERT INTO budgets
      (
        user_id,
        category,
        amount,
        month,
        year
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id,
        category,
        amount,
        month,
        year
      `,
      [
        userId,
        category,
        Number(amount),
        Number(month),
        Number(year),
      ]
    );

    res.status(201).json({
      message: "Budget created successfully",
      budget: {
        ...result.rows[0],
        amount: Number(
          result.rows[0].amount
        ),
        month: Number(
          result.rows[0].month
        ),
        year: Number(
          result.rows[0].year
        ),
        spent: 0,
      },
    });

  } catch (error) {
    console.error(
      "Create budget error:",
      error
    );

    res.status(500).json({
      error: "Unable to create budget",
    });
  }
});


/*
  PUT /api/budgets/:id

  Update budget
*/
router.put(
  "/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const userId = req.user.id;

      const budgetId =
        Number(req.params.id);

      const {
        category,
        amount,
        month,
        year,
      } = req.body;

      if (!budgetId) {
        return res.status(400).json({
          error: "Invalid budget id",
        });
      }

      if (
        !category ||
        !amount ||
        !month ||
        !year
      ) {
        return res.status(400).json({
          error:
            "Category, amount, month and year are required",
        });
      }

      if (Number(amount) <= 0) {
        return res.status(400).json({
          error:
            "Budget amount must be greater than 0",
        });
      }

      if (
        Number(month) < 1 ||
        Number(month) > 12
      ) {
        return res.status(400).json({
          error:
            "Month must be between 1 and 12",
        });
      }

      // Check budget exists
      const existingBudget =
        await pool.query(
          `
          SELECT id
          FROM budgets
          WHERE id = $1
            AND user_id = $2
          `,
          [
            budgetId,
            userId,
          ]
        );

      if (
        existingBudget.rows.length === 0
      ) {
        return res.status(404).json({
          error: "Budget not found",
        });
      }

      // Check duplicate
      const duplicateBudget =
        await pool.query(
          `
          SELECT id
          FROM budgets
          WHERE user_id = $1
            AND category = $2
            AND month = $3
            AND year = $4
            AND id != $5
          `,
          [
            userId,
            category,
            Number(month),
            Number(year),
            budgetId,
          ]
        );

      if (
        duplicateBudget.rows.length > 0
      ) {
        return res.status(409).json({
          error:
            "A budget already exists for this category and month",
        });
      }

      const result =
        await pool.query(
          `
          UPDATE budgets
          SET
            category = $1,
            amount = $2,
            month = $3,
            year = $4
          WHERE id = $5
            AND user_id = $6
          RETURNING
            id,
            category,
            amount,
            month,
            year
          `,
          [
            category,
            Number(amount),
            Number(month),
            Number(year),
            budgetId,
            userId,
          ]
        );

      res.status(200).json({
        message:
          "Budget updated successfully",
        budget: {
          ...result.rows[0],
          amount: Number(
            result.rows[0].amount
          ),
          month: Number(
            result.rows[0].month
          ),
          year: Number(
            result.rows[0].year
          ),
        },
      });

    } catch (error) {
      console.error(
        "Update budget error:",
        error
      );

      res.status(500).json({
        error: "Unable to update budget",
      });
    }
  }
);


/*
  DELETE /api/budgets/:id

  Delete budget
*/
router.delete(
  "/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const userId = req.user.id;

      const budgetId =
        Number(req.params.id);

      if (!budgetId) {
        return res.status(400).json({
          error: "Invalid budget id",
        });
      }

      const result =
        await pool.query(
          `
          DELETE FROM budgets
          WHERE id = $1
            AND user_id = $2
          RETURNING id
          `,
          [
            budgetId,
            userId,
          ]
        );

      if (
        result.rows.length === 0
      ) {
        return res.status(404).json({
          error: "Budget not found",
        });
      }

      res.status(200).json({
        message:
          "Budget deleted successfully",
      });

    } catch (error) {
      console.error(
        "Delete budget error:",
        error
      );

      res.status(500).json({
        error: "Unable to delete budget",
      });
    }
  }
);

module.exports = router;