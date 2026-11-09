
const express = require("express");
const pool = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// GET /api/transactions
// Get all transactions of logged-in user
// ==========================================
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT
        id,
        title,
        category,
        type,
        amount,
        transaction_date,
        created_at
      FROM transactions
      WHERE user_id = $1
      ORDER BY transaction_date DESC, id DESC
      `,
      [userId]
    );

    const transactions = result.rows.map((transaction) => ({
      ...transaction,
      amount: Number(transaction.amount),
    }));

    res.status(200).json(transactions);
  } catch (error) {
    console.error("Get transactions error:", error);

    res.status(500).json({
      error: "Unable to fetch transactions",
    });
  }
});

// ==========================================
// POST /api/transactions
// Create a new transaction
// ==========================================
router.post("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      title,
      category,
      type,
      amount,
      transaction_date,
    } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof category !== "string" ||
      !category.trim() ||
      !["income", "expense"].includes(type) ||
      amount === undefined ||
      amount === null ||
      amount === "" ||
      !Number.isFinite(Number(amount)) ||
      Number(amount) <= 0 ||
      typeof transaction_date !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(transaction_date) ||
      !isValidDate(transaction_date)
    ) {
      return res.status(400).json({
        error: "Please provide valid transaction details",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO transactions (
        user_id,
        title,
        category,
        type,
        amount,
        transaction_date
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id,
        title,
        category,
        type,
        amount,
        transaction_date,
        created_at
      `,
      [
        userId,
        title.trim(),
        category.trim(),
        type,
        Number(amount),
        transaction_date,
      ]
    );

    res.status(201).json({
      message: "Transaction created successfully",
      transaction: {
        ...result.rows[0],
        amount: Number(result.rows[0].amount),
      },
    });
  } catch (error) {
    console.error("Create transaction error:", error);

    res.status(500).json({
      error: "Unable to create transaction",
    });
  }
});

// ==========================================
// PUT /api/transactions/:id
// Update an existing transaction
// ==========================================
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const transactionId = Number(req.params.id);

    const {
      title,
      category,
      type,
      amount,
      transaction_date,
    } = req.body;

    if (
      !Number.isInteger(transactionId) ||
      transactionId <= 0
    ) {
      return res.status(400).json({
        error: "Invalid transaction id",
      });
    }

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof category !== "string" ||
      !category.trim() ||
      !["income", "expense"].includes(type) ||
      amount === undefined ||
      amount === null ||
      amount === "" ||
      !Number.isFinite(Number(amount)) ||
      Number(amount) <= 0 ||
      typeof transaction_date !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(transaction_date) ||
      !isValidDate(transaction_date)
    ) {
      return res.status(400).json({
        error: "Please provide valid transaction details",
      });
    }

    const result = await pool.query(
      `
      UPDATE transactions
      SET
        title = $1,
        category = $2,
        type = $3,
        amount = $4,
        transaction_date = $5
      WHERE id = $6
        AND user_id = $7
      RETURNING
        id,
        title,
        category,
        type,
        amount,
        transaction_date,
        created_at
      `,
      [
        title.trim(),
        category.trim(),
        type,
        Number(amount),
        transaction_date,
        transactionId,
        userId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Transaction not found",
      });
    }

    res.status(200).json({
      message: "Transaction updated successfully",
      transaction: {
        ...result.rows[0],
        amount: Number(result.rows[0].amount),
      },
    });
  } catch (error) {
    console.error("Update transaction error:", error);

    res.status(500).json({
      error: "Unable to update transaction",
    });
  }
});

// ==========================================
// DELETE /api/transactions/:id
// Delete a transaction owned by the user
// ==========================================
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const transactionId = Number(req.params.id);

    if (
      !Number.isInteger(transactionId) ||
      transactionId <= 0
    ) {
      return res.status(400).json({
        error: "Invalid transaction id",
      });
    }

    const result = await pool.query(
      `
      DELETE FROM transactions
      WHERE id = $1 AND user_id = $2
      RETURNING id
      `,
      [transactionId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Transaction not found",
      });
    }

    res.status(200).json({
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    console.error("Delete transaction error:", error);

    res.status(500).json({
      error: "Unable to delete transaction",
    });
  }
});

// ==========================================
// Helper: Validate YYYY-MM-DD dates
// ==========================================
function isValidDate(dateString) {
  const date = new Date(`${dateString}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === dateString
  );
}

module.exports = router;
