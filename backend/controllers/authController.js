
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

// =========================
// VALIDATION HELPERS
// =========================

const normalizeEmail = (email) => email.trim().toLowerCase();

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret || !secret.trim()) {
    throw new Error("JWT_SECRET is not configured");
  }

  return secret;
};

// =========================
// REGISTER USER
// =========================

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    // Validate required fields
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        error: "Name, email and password are required",
      });
    }

    const normalizedName = name.trim();
    const normalizedEmail = normalizeEmail(email);

    // Validate name
    if (normalizedName.length > 100) {
      return res.status(400).json({
        error: "Name must not exceed 100 characters",
      });
    }

    // Validate email
    if (
      normalizedEmail.length > 254 ||
      !isValidEmail(normalizedEmail)
    ) {
      return res.status(400).json({
        error: "Please provide a valid email address",
      });
    }

    // Validate password
    // bcrypt only considers the first 72 bytes of a password.
    if (
      Buffer.byteLength(password, "utf8") < 8 ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      return res.status(400).json({
        error: "Password must be at least 8 bytes and at most 72 bytes",
      });
    }

    // Hash password before saving
    const passwordHash = await bcrypt.hash(password, 12);

    // Insert directly; the database UNIQUE constraint handles
    // duplicate registrations safely, including concurrent requests.
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
      [normalizedName, normalizedEmail, passwordHash]
    );

    return res.status(201).json({
      message: "User registered successfully",
      user: result.rows[0],
    });
  } catch (error) {
    // PostgreSQL unique-constraint violation
    if (error.code === "23505") {
      return res.status(409).json({
        error: "Email already registered",
      });
    }

    console.error("Register error:", error.message);

    if (error.message === "JWT_SECRET is not configured") {
      return res.status(500).json({
        error: "Authentication service is not configured",
      });
    }

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

// =========================
// LOGIN USER
// =========================

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    const normalizedEmail = normalizeEmail(email);

    if (
      normalizedEmail.length > 254 ||
      !isValidEmail(normalizedEmail) ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    // Find user
    const result = await pool.query(
      `SELECT id, name, email, password_hash
       FROM users
       WHERE email = $1`,
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const user = result.rows[0];

    // Compare submitted password with stored hash
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const secret = getJwtSecret();

    // Create signed token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      secret,
      {
        algorithm: "HS256",
        expiresIn: "1d",
      }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
};
