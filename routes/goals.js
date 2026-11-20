// MEMBER 3: savings goals
const express = require("express");
const prisma = require("../lib/prisma");
const auth = require("../middleware/auth");

const router = express.Router();
router.use(auth);

router.get("/", async (req, res) => {
  res.json(await prisma.goal.findMany({ where: { userId: req.userId }, orderBy: { id: "desc" } }));
});

router.post("/", async (req, res) => {
  const { title, target } = req.body;
  if (!title || !target || Number(target) <= 0) return res.status(400).json({ error: "Title and target are required" });
  res.json(await prisma.goal.create({ data: { title, target: Number(target), userId: req.userId } }));
});

// PATCH /api/goals/5/add  { amount }  -> add savings to a goal
router.patch("/:id/add", async (req, res) => {
  const amount = Number(req.body.amount);
  if (!amount || amount <= 0) return res.status(400).json({ error: "Enter a valid amount" });
  const r = await prisma.goal.updateMany({
    where: { id: Number(req.params.id), userId: req.userId },
    data: { saved: { increment: amount } },
  });
  if (r.count === 0) return res.status(404).json({ error: "Not found" });
  res.json({ message: "Saved" });
});

router.delete("/:id", async (req, res) => {
  await prisma.goal.deleteMany({ where: { id: Number(req.params.id), userId: req.userId } });
  res.json({ message: "Deleted" });
});

module.exports = router;
