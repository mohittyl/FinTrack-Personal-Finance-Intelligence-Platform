
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "A valid Bearer token is required",
    });
  }

  const token = authHeader.slice(7).trim();

  if (!token || token.split(".").length !== 3) {
    return res.status(401).json({
      error: "Invalid authorization token",
    });
  }

  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not configured");

    return res.status(500).json({
      error: "Authentication service is not configured",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
      { algorithms: ["HS256"] }
    );

    // Confirm the token contains a usable user ID.
    const userId = decoded.id ?? decoded.userId ?? decoded.user_id;

    if (
      userId === undefined ||
      userId === null ||
      !/^[1-9]\d*$/.test(String(userId))
    ) {
      return res.status(401).json({
        error: "Invalid token user",
      });
    }

    req.user = {
      ...decoded,
      id: userId,
    };

    return next();
  } catch (error) {
    if (
      error.name !== "TokenExpiredError" &&
      error.name !== "JsonWebTokenError" &&
      error.name !== "NotBeforeError"
    ) {
      console.error("Authentication verification failed");
    }

    return res.status(401).json({
      error: "Invalid or expired token",
    });
  }
};

module.exports = authMiddleware;
