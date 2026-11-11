const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const budgetRoutes = require("./routes/budgetRoutes");
const goalRoutes = require("./routes/goalRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const recurringPaymentRoutes = require("./routes/recurringPaymentRoutes");
const profileRoutes =require("./routes/profileRoutes");

const app = express();


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors({
  exposedHeaders: [
    "X-Total-Count",
    "X-Page",
    "X-Limit",
    "X-Total-Pages",
  ],
}));

app.use(express.json());


// ==========================================
// ROOT ROUTE
// ==========================================

app.get("/", (req, res) => {
  res.json({
    message: "FinTrack API is running",
  });
});


// ==========================================
// API ROUTES
// ==========================================

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/transactions",
  transactionRoutes
);

app.use(
  "/api/dashboard",
  dashboardRoutes
);

app.use(
  "/api/budgets",
  budgetRoutes
);

app.use(
  "/api/goals",
  goalRoutes
);

app.use(
  "/api/analytics",
  analyticsRoutes
);

app.use(
  "/api/recurring-payments",
  recurringPaymentRoutes
);
app.use(
  "/api/profile",
  profileRoutes
);


// ==========================================
// EXPORT APP
// ==========================================

module.exports = app;
