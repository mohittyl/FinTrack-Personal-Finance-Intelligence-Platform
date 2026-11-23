// ============================================================
// ADMIN ROUTES - User Management & Dashboard Stats
// Protected by auth and admin middleware
// ============================================================

var express = require("express");
var prisma = require("../lib/prisma");
var auth = require("../middleware/auth");
var admin = require("../middleware/admin");

var router = express.Router();

// Saare routes pe auth + admin check lagega
router.use(auth, admin);

// ========== 1. GET ALL USERS WITH SEARCH (GET /api/admin/users?q=name) ==========
router.get("/users", async function (req, res) {
  var searchQuery = req.query.q;

  var filter = {};
  if (searchQuery) {
    filter = {
      OR: [
        { name: { contains: searchQuery } },
        { email: { contains: searchQuery } }
      ]
    };
  }

  var users = await prisma.user.findMany({
    where: filter,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true
      // Password field security ke liye exclude kiya hai
    },
    orderBy: { id: "asc" }
  });

  res.json(users);
});

// ========== 2. GET STATS (GET /api/admin/stats) ==========
router.get("/stats", async function (req, res) {
  var total = await prisma.user.count();
  var admins = await prisma.user.count({ where: { role: "admin" } });
  var regularUsers = total - admins;

  res.json({
    total: total,
    admins: admins,
    users: regularUsers
  });
});

// ========== 3. CHANGE USER ROLE (PUT /api/admin/users/:id/role) ==========
router.put("/users/:id/role", async function (req, res) {
  var targetId = Number(req.params.id);
  var newRole = req.body.role;

  if (newRole !== "admin" && newRole !== "user") {
    return res.status(400).json({ error: "Role must be 'admin' or 'user'" });
  }

  // Admin apna role khud change nahi kar sakta
  if (targetId === req.userId) {
    return res.status(400).json({ error: "You cannot change your own role" });
  }

  await prisma.user.update({
    where: { id: targetId },
    data: { role: newRole }
  });

  res.json({ message: "Role updated successfully" });
});

// ========== 4. DELETE USER (DELETE /api/admin/users/:id) ==========
router.delete("/users/:id", async function (req, res) {
  var targetId = Number(req.params.id);

  // Admin apne aap ko delete nahi kar sakta
  if (targetId === req.userId) {
    return res.status(400).json({ error: "You cannot delete yourself" });
  }

  await prisma.user.delete({
    where: { id: targetId }
  });

  res.json({ message: "User deleted successfully" });
});

module.exports = router;
