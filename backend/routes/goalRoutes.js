
const express = require("express");
const pool = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const MAX_AMOUNT = 9999999999.99;

const isValidId = (id) => {
  return Number.isInteger(id) && id > 0;
};

const isValidAmount = (value, allowZero = false) => {
  if (value === undefined || value === null || value === "") {
    return false;
  }

  const amount = Number(value);

  if (!Number.isFinite(amount) || amount > MAX_AMOUNT) {
    return false;
  }

  if (allowZero ? amount < 0 : amount <= 0) {
    return false;
  }

  return Math.round(amount * 100) === amount * 100;
};

const isValidDate = (date) => {
  if (date === null || date === undefined || date === "") {
    return true;
  }

  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }

  const parsedDate = new Date(`${date}T00:00:00.000Z`);

  return (
    !Number.isNaN(parsedDate.getTime()) &&
    parsedDate.toISOString().slice(0, 10) === date
  );
};

const validateGoal = (title, targetAmount, savedAmount, targetDate) => {
  if (
    typeof title !== "string" ||
    !title.trim() ||
    title.trim().length > 150
  ) {
    return "Goal title must contain between 1 and 150 characters";
  }

  if (!isValidAmount(targetAmount)) {
    return "Please enter a valid target amount";
  }

  if (!isValidAmount(savedAmount, true)) {
    return "Please enter a valid saved amount";
  }

  if (Number(savedAmount) > Number(targetAmount)) {
    return "Saved amount cannot be greater than target amount";
  }

  if (!isValidDate(targetDate)) {
    return "Please enter a valid target date";
  }

  return null;
};

/*
GET ALL GOALS
GET /api/goals
*/

router.get("/", authMiddleware, async (req, res) => {
  try {
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
      ORDER BY target_date ASC NULLS LAST, id DESC
      `,
      [req.user.id]
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
CREATE GOAL
POST /api/goals
*/

router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      title,
      target_amount,
      saved_amount = 0,
      target_date,
    } = req.body;

    const validationError = validateGoal(
      title,
      target_amount,
      saved_amount,
      target_date
    );

    if (validationError) {
      return res.status(400).json({
        error: validationError,
      });
    }

    const result = await pool.query(
      `
      INSERT INTO goals (
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
        req.user.id,
        title.trim(),
        Number(target_amount),
        Number(saved_amount),
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
UPDATE GOAL
PUT /api/goals/:id
*/

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const goalId = Number(req.params.id);

    if (!isValidId(goalId)) {
      return res.status(400).json({
        error: "Invalid goal id",
      });
    }

    const {
      title,
      target_amount,
      saved_amount = 0,
      target_date,
    } = req.body;

    const validationError = validateGoal(
      title,
      target_amount,
      saved_amount,
      target_date
    );

    if (validationError) {
      return res.status(400).json({
        error: validationError,
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
        Number(target_amount),
        Number(saved_amount),
        target_date || null,
        goalId,
        req.user.id,
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
ADD MONEY TO GOAL
PATCH /api/goals/:id/add-money
*/

router.patch("/:id/add-money", authMiddleware, async (req, res) => {
  try {
    const goalId = Number(req.params.id);
    const { amount } = req.body;

    if (!isValidId(goalId)) {
      return res.status(400).json({
        error: "Invalid goal id",
      });
    }

    if (!isValidAmount(amount)) {
      return res.status(400).json({
        error: "Please enter a valid amount",
      });
    }

    const result = await pool.query(
      `
      UPDATE goals
      SET saved_amount = saved_amount + $1
      WHERE id = $2
      AND user_id = $3
      AND saved_amount + $1 <= target_amount
      RETURNING
        id,
        title,
        target_amount,
        saved_amount,
        target_date,
        created_at
      `,
      [Number(amount), goalId, req.user.id]
    );

    if (result.rows.length === 0) {
      const goalExists = await pool.query(
        `
        SELECT id
        FROM goals
        WHERE id = $1
        AND user_id = $2
        `,
        [goalId, req.user.id]
      );

      if (goalExists.rows.length === 0) {
        return res.status(404).json({
          error: "Goal not found",
        });
      }

      return res.status(400).json({
        error: "Added amount would exceed the goal target",
      });
    }

    res.status(200).json({
      message: "Money added successfully",
      goal: result.rows[0],
    });
  } catch (error) {
    console.error("Add money error:", error);

    res.status(500).json({
      error: "Unable to add money to goal",
    });
  }
});

/*
DELETE GOAL
DELETE /api/goals/:id
*/

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const goalId = Number(req.params.id);

    if (!isValidId(goalId)) {
      return res.status(400).json({
        error: "Invalid goal id",
      });
    }

    const result = await pool.query(
      `
      DELETE FROM goals
      WHERE id = $1
      AND user_id = $2
      RETURNING id
      `,
      [goalId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Goal not found",
      });
    }

    res.status(200).json({
      message: "Goal deleted successfully",
    });
  } catch (error) {
    console.error("Delete goal error:", error);

    res.status(500).json({
      error: "Unable to delete goal",
    });
  }
});

module.exports = router;
