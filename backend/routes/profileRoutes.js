const express = require("express");
const bcrypt = require("bcryptjs");

const pool = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/*
=====================================================
GET PROFILE
GET /api/profile
=====================================================
*/

router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT
        id,
        name,
        email,
        created_at
      FROM users
      WHERE id = $1
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.status(200).json({
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Get profile error:", error);

    res.status(500).json({
      error: "Unable to fetch profile",
    });
  }
});


/*
=====================================================
UPDATE PROFILE
PUT /api/profile
=====================================================
*/

router.put("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const { name, email } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        error: "Name is required",
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        error: "Email is required",
      });
    }

    const existingUser = await pool.query(
      `
      SELECT id
      FROM users
      WHERE email = $1
      AND id != $2
      `,
      [email.trim(), userId]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        error: "Email is already in use",
      });
    }

    const result = await pool.query(
      `
      UPDATE users
      SET
        name = $1,
        email = $2
      WHERE id = $3
      RETURNING
        id,
        name,
        email,
        created_at
      `,
      [
        name.trim(),
        email.trim(),
        userId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Update profile error:",
      error
    );

    res.status(500).json({
      error: "Unable to update profile",
    });
  }
});


/*
=====================================================
CHANGE PASSWORD
PATCH /api/profile/password
=====================================================
*/

router.patch(
  "/password",
  authMiddleware,
  async (req, res) => {
    try {
      const userId = req.user.id;

      const {
        currentPassword,
        newPassword,
      } = req.body;

      if (
        !currentPassword ||
        !newPassword
      ) {
        return res.status(400).json({
          error:
            "Current password and new password are required",
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          error:
            "New password must be at least 6 characters",
        });
      }

      const result = await pool.query(
        `
        SELECT password_hash
        FROM users
        WHERE id = $1
        `,
        [userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "User not found",
        });
      }

      const user = result.rows[0];

      const passwordCorrect =
        await bcrypt.compare(
          currentPassword,
          user.password_hash
        );

      if (!passwordCorrect) {
        return res.status(401).json({
          error: "Current password is incorrect",
        });
      }

      const newPasswordHash =
        await bcrypt.hash(
          newPassword,
          10
        );

      await pool.query(
        `
        UPDATE users
        SET password_hash = $1
        WHERE id = $2
        `,
        [
          newPasswordHash,
          userId,
        ]
      );

      res.status(200).json({
        message:
          "Password changed successfully",
      });
    } catch (error) {
      console.error(
        "Change password error:",
        error
      );

      res.status(500).json({
        error:
          "Unable to change password",
      });
    }
  }
);

module.exports = router;