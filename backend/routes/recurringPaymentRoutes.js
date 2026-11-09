const express = require("express");

const pool = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/*
=====================================================
GET ALL RECURRING PAYMENTS
GET /api/recurring-payments
=====================================================
*/

router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT
        id,
        title,
        category,
        amount,
        frequency,
        next_payment_date,
        status,
        created_at
      FROM recurring_payments
      WHERE user_id = $1
      ORDER BY next_payment_date ASC, id DESC
      `,
      [userId]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(
      "Get recurring payments error:",
      error
    );

    res.status(500).json({
      error: "Unable to fetch recurring payments",
    });
  }
});


/*
=====================================================
CREATE RECURRING PAYMENT
POST /api/recurring-payments
=====================================================
*/

router.post("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      title,
      category,
      amount,
      frequency,
      next_payment_date,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        error: "Payment title is required",
      });
    }

    if (!category || !category.trim()) {
      return res.status(400).json({
        error: "Category is required",
      });
    }

    if (
      amount === undefined ||
      Number(amount) <= 0
    ) {
      return res.status(400).json({
        error: "Valid amount is required",
      });
    }

    if (
      ![
        "daily",
        "weekly",
        "monthly",
        "yearly",
      ].includes(frequency)
    ) {
      return res.status(400).json({
        error: "Invalid payment frequency",
      });
    }

    if (!next_payment_date) {
      return res.status(400).json({
        error: "Next payment date is required",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO recurring_payments
      (
        user_id,
        title,
        category,
        amount,
        frequency,
        next_payment_date
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id,
        title,
        category,
        amount,
        frequency,
        next_payment_date,
        status,
        created_at
      `,
      [
        userId,
        title.trim(),
        category.trim(),
        Number(amount),
        frequency,
        next_payment_date,
      ]
    );

    res.status(201).json({
      message:
        "Recurring payment created successfully",
      payment: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Create recurring payment error:",
      error
    );

    res.status(500).json({
      error:
        "Unable to create recurring payment",
    });
  }
});


/*
=====================================================
UPDATE RECURRING PAYMENT
PUT /api/recurring-payments/:id
=====================================================
*/

router.put(
  "/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const userId = req.user.id;

      const paymentId =
        Number(req.params.id);

      const {
        title,
        category,
        amount,
        frequency,
        next_payment_date,
        status,
      } = req.body;

      if (!Number.isInteger(paymentId)) {
        return res.status(400).json({
          error: "Invalid payment id",
        });
      }

      if (!title || !title.trim()) {
        return res.status(400).json({
          error: "Payment title is required",
        });
      }

      if (!category || !category.trim()) {
        return res.status(400).json({
          error: "Category is required",
        });
      }

      if (
        amount === undefined ||
        Number(amount) <= 0
      ) {
        return res.status(400).json({
          error: "Valid amount is required",
        });
      }

      if (
        ![
          "daily",
          "weekly",
          "monthly",
          "yearly",
        ].includes(frequency)
      ) {
        return res.status(400).json({
          error: "Invalid payment frequency",
        });
      }

      if (!next_payment_date) {
        return res.status(400).json({
          error:
            "Next payment date is required",
        });
      }

      if (
        status !== undefined &&
        !["active", "paused"].includes(status)
      ) {
        return res.status(400).json({
          error: "Invalid payment status",
        });
      }

      const result = await pool.query(
        `
        UPDATE recurring_payments
        SET
          title = $1,
          category = $2,
          amount = $3,
          frequency = $4,
          next_payment_date = $5,
          status = $6
        WHERE id = $7
        AND user_id = $8
        RETURNING
          id,
          title,
          category,
          amount,
          frequency,
          next_payment_date,
          status,
          created_at
        `,
        [
          title.trim(),
          category.trim(),
          Number(amount),
          frequency,
          next_payment_date,
          status || "active",
          paymentId,
          userId,
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error:
            "Recurring payment not found",
        });
      }

      res.status(200).json({
        message:
          "Recurring payment updated successfully",
        payment: result.rows[0],
      });
    } catch (error) {
      console.error(
        "Update recurring payment error:",
        error
      );

      res.status(500).json({
        error:
          "Unable to update recurring payment",
      });
    }
  }
);


/*
=====================================================
TOGGLE ACTIVE / PAUSED
PATCH /api/recurring-payments/:id/toggle
=====================================================
*/

router.patch(
  "/:id/toggle",
  authMiddleware,
  async (req, res) => {
    try {
      const userId = req.user.id;

      const paymentId =
        Number(req.params.id);

      if (!Number.isInteger(paymentId)) {
        return res.status(400).json({
          error: "Invalid payment id",
        });
      }

      const result = await pool.query(
        `
        UPDATE recurring_payments
        SET
          status =
            CASE
              WHEN status = 'active'
              THEN 'paused'
              ELSE 'active'
            END
        WHERE id = $1
        AND user_id = $2
        RETURNING
          id,
          title,
          category,
          amount,
          frequency,
          next_payment_date,
          status
        `,
        [paymentId, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error:
            "Recurring payment not found",
        });
      }

      res.status(200).json({
        message:
          "Payment status updated",
        payment: result.rows[0],
      });
    } catch (error) {
      console.error(
        "Toggle recurring payment error:",
        error
      );

      res.status(500).json({
        error:
          "Unable to update payment status",
      });
    }
  }
);


/*
=====================================================
DELETE RECURRING PAYMENT
DELETE /api/recurring-payments/:id
=====================================================
*/

router.delete(
  "/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const userId = req.user.id;

      const paymentId =
        Number(req.params.id);

      if (!Number.isInteger(paymentId)) {
        return res.status(400).json({
          error: "Invalid payment id",
        });
      }

      const result = await pool.query(
        `
        DELETE FROM recurring_payments
        WHERE id = $1
        AND user_id = $2
        RETURNING id
        `,
        [paymentId, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error:
            "Recurring payment not found",
        });
      }

      res.status(200).json({
        message:
          "Recurring payment deleted successfully",
      });
    } catch (error) {
      console.error(
        "Delete recurring payment error:",
        error
      );

      res.status(500).json({
        error:
          "Unable to delete recurring payment",
      });
    }
  }
);


module.exports = router; 