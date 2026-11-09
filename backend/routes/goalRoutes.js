const express = require("express");

const pool = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/*
=====================================================
GET ALL GOALS
GET /api/goals
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
        target_amount,
        saved_amount,
        target_date,
        created_at
      FROM goals
      WHERE user_id = $1
      ORDER BY
        target_date ASC NULLS LAST,
        id DESC
      `,
      [userId]
    );

    res.status(200).json(result.rows);

  } catch (error) {
    console.error("Get goals error:", error);

    res.status(500).json({
      error: "Unable to fetch goals",
    });
  }
});


/*
=====================================================
CREATE GOAL
POST /api/goals
=====================================================
*/

router.post("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      title,
      target_amount,
      saved_amount,
      target_date,
    } = req.body;

    // Validation

    if (!title || !title.trim()) {
      return res.status(400).json({
        error: "Goal title is required",
      });
    }

    if (
      target_amount === undefined ||
      Number(target_amount) <= 0
    ) {
      return res.status(400).json({
        error: "Valid target amount is required",
      });
    }

    const savedAmount =
      Number(saved_amount || 0);

    const targetAmount =
      Number(target_amount);

    if (savedAmount < 0) {
      return res.status(400).json({
        error: "Saved amount cannot be negative",
      });
    }

    if (savedAmount > targetAmount) {
      return res.status(400).json({
        error:
          "Saved amount cannot be greater than target amount",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO goals
      (
        user_id,
        title,
        target_amount,
        saved_amount,
        target_date
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id,
        title,
        target_amount,
        saved_amount,
        target_date,
        created_at
      `,
      [
        userId,
        title.trim(),
        targetAmount,
        savedAmount,
        target_date || null,
      ]
    );

    res.status(201).json({
      message: "Goal created successfully",
      goal: result.rows[0],
    });

  } catch (error) {
    console.error("Create goal error:", error);

    res.status(500).json({
      error: "Unable to create goal",
    });
  }
});


/*
=====================================================
UPDATE GOAL
PUT /api/goals/:id
=====================================================
*/

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const goalId = Number(req.params.id);

    const {
      title,
      target_amount,
      saved_amount,
      target_date,
    } = req.body;

    if (!Number.isInteger(goalId)) {
      return res.status(400).json({
        error: "Invalid goal id",
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        error: "Goal title is required",
      });
    }

    if (
      target_amount === undefined ||
      Number(target_amount) <= 0
    ) {
      return res.status(400).json({
        error: "Valid target amount is required",
      });
    }

    const targetAmount =
      Number(target_amount);

    const savedAmount =
      Number(saved_amount || 0);

    if (savedAmount < 0) {
      return res.status(400).json({
        error: "Saved amount cannot be negative",
      });
    }

    if (savedAmount > targetAmount) {
      return res.status(400).json({
        error:
          "Saved amount cannot be greater than target amount",
      });
    }

    const result = await pool.query(
      `
      UPDATE goals
      SET
        title = $1,
        target_amount = $2,
        saved_amount = $3,
        target_date = $4
      WHERE id = $5
      AND user_id = $6
      RETURNING
        id,
        title,
        target_amount,
        saved_amount,
        target_date,
        created_at
      `,
      [
        title.trim(),
        targetAmount,
        savedAmount,
        target_date || null,
        goalId,
        userId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Goal not found",
      });
    }

    res.status(200).json({
      message: "Goal updated successfully",
      goal: result.rows[0],
    });

  } catch (error) {
    console.error("Update goal error:", error);

    res.status(500).json({
      error: "Unable to update goal",
    });
  }
});


/*
=====================================================
ADD MONEY TO GOAL
PATCH /api/goals/:id/add-money
=====================================================
*/

router.patch(
  "/:id/add-money",
  authMiddleware,
  async (req, res) => {
    try {
      const userId = req.user.id;

      const goalId =
        Number(req.params.id);

      const { amount } = req.body;

      if (!Number.isInteger(goalId)) {
        return res.status(400).json({
          error: "Invalid goal id",
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

      const addAmount =
        Number(amount);

      /*
      Get current goal
      */

      const goalResult =
        await pool.query(
          `
          SELECT
            id,
            target_amount,
            saved_amount
          FROM goals
          WHERE id = $1
          AND user_id = $2
          `,
          [goalId, userId]
        );

      if (goalResult.rows.length === 0) {
        return res.status(404).json({
          error: "Goal not found",
        });
      }

      const goal =
        goalResult.rows[0];

      const targetAmount =
        Number(
          goal.target_amount
        );

      const currentSaved =
        Number(
          goal.saved_amount
        );

      const newSavedAmount =
        currentSaved + addAmount;

      if (
        newSavedAmount >
        targetAmount
      ) {
        return res.status(400).json({
          error:
            "Added amount would exceed the goal target",
        });
      }

      /*
      Update saved amount
      */

      const result =
        await pool.query(
          `
          UPDATE goals
          SET saved_amount = $1
          WHERE id = $2
          AND user_id = $3
          RETURNING
            id,
            title,
            target_amount,
            saved_amount,
            target_date,
            created_at
          `,
          [
            newSavedAmount,
            goalId,
            userId,
          ]
        );

      res.status(200).json({
        message:
          "Money added successfully",
        goal: result.rows[0],
      });

    } catch (error) {
      console.error(
        "Add money error:",
        error
      );

      res.status(500).json({
        error:
          "Unable to add money to goal",
      });
    }
  }
);


/*
=====================================================
DELETE GOAL
DELETE /api/goals/:id
=====================================================
*/

router.delete(
  "/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const userId = req.user.id;

      const goalId =
        Number(req.params.id);

      if (!Number.isInteger(goalId)) {
        return res.status(400).json({
          error: "Invalid goal id",
        });
      }

      const result =
        await pool.query(
          `
          DELETE FROM goals
          WHERE id = $1
          AND user_id = $2
          RETURNING id
          `,
          [
            goalId,
            userId,
          ]
        );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "Goal not found",
        });
      }

      res.status(200).json({
        message:
          "Goal deleted successfully",
      });

    } catch (error) {
      console.error(
        "Delete goal error:",
        error
      );

      res.status(500).json({
        error: "Unable to delete goal",
      });
    }
  }
);


module.exports = router;