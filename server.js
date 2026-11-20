require("dotenv").config();
require("express-async-errors"); // lets async routes send errors to the handler below
const express = require("express");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/auth", require("./routes/auth"));               // Member 1
app.use("/api/admin", require("./routes/admin"));             // Member 1
app.use("/api/transactions", require("./routes/transactions")); // Member 2
app.use("/api/budgets", require("./routes/budgets"));         // Member 3
app.use("/api/goals", require("./routes/goals"));             // Member 3
app.use("/api/reports", require("./routes/reports"));         // Member 4

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Server error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`FinTrack running at http://localhost:${PORT}`));
