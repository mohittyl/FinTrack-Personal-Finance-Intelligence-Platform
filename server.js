// ============================================================
// MAIN SERVER FILE - FinTrack Auth & Admin Module
// Yeh file app start karti hai aur routes connect karti hai
// ============================================================

// Step 1: Environment variables (.env file) load karo
var dotenv = require("dotenv");
dotenv.config();

// Step 2: Async error handler (express async errors ko catch karne ke liye)
require("express-async-errors");

// Step 3: Express aur path modules import karo
var express = require("express");
var path = require("path");

// Step 4: Express app initialize karo
var app = express();

// Step 5: JSON data read karne ke liye middleware
app.use(express.json());

// Step 6: Frontend files serve karo (public folder: HTML, CSS, JS)
var publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath));

// Step 7: Routes connect karo
// Auth routes: Login, Register, Profile, Change Password
app.use("/api/auth", require("./routes/auth"));

// Admin routes: Users list, search, role change, user delete
app.use("/api/admin", require("./routes/admin"));

// Step 8: Global Error Handler (agar koi unexpected error aaye)
app.use(function (err, req, res, next) {
  console.error("Server Error:", err);
  res.status(500).json({ error: "Server error occurred" });
});

// Step 9: Server start karo
var PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
  console.log("FinTrack chal raha hai: http://localhost:" + PORT);
});
