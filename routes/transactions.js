// MEMBER 2: add, edit, delete, search, filter, sort, paginate, CSV export
const express = require("express");
const prisma = require("../lib/prisma");
const auth = require("../middleware/auth");

const router = express.Router();
router.use(auth);

function buildWhere(req) {
  const { q, type, category, from, to } = req.query;
  const where = { userId: req.userId };
  if (q) where.title = { contains: q };
  if (type) where.type = type;
  if (category) where.category = category;
  if (from || to) {
    where.date = {};
    if (from) where.date.gte = new Date(from);
    if (to) {
      const end = new Date(to);
      end.setDate(end.getDate() + 1); // include the "to" day
      where.date.lt = end;
    }
  }
  return where;
}

function validate(b) {
  if (!b.title || !b.amount || !b.type || !b.category) return "Fill all fields";
  if (Number(b.amount) <= 0) return "Amount must be more than 0";
  if (!["income", "expense"].includes(b.type)) return "Type must be income or expense";
  return null;
}

// GET /api/transactions?q=&type=&category=&from=&to=&sort=date_desc&page=1&limit=10
router.get("/", async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Number(req.query.limit) || 10);
  const [field, dir] = (req.query.sort || "date_desc").split("_");
  const orderBy = { [["date", "amount"].includes(field) ? field : "date"]: dir === "asc" ? "asc" : "desc" };
  const where = buildWhere(req);

  const [items, total] = await Promise.all([
    prisma.transaction.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit }),
    prisma.transaction.count({ where }),
  ]);
  res.json({ items, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
});

// GET /api/transactions/export  (same filters) -> CSV file
router.get("/export", async (req, res) => {
  const list = await prisma.transaction.findMany({ where: buildWhere(req), orderBy: { date: "desc" } });
  const q = (s) => `"${String(s).replace(/"/g, '""')}"`;
  const rows = list.map((t) =>
    [t.date.toISOString().slice(0, 10), q(t.title), t.type, q(t.category), t.amount].join(",")
  );
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=transactions.csv");
  res.send(["Date,Title,Type,Category,Amount", ...rows].join("\n"));
});

router.post("/", async (req, res) => {
  const err = validate(req.body);
  if (err) return res.status(400).json({ error: err });
  const { title, amount, type, category, date } = req.body;
  const t = await prisma.transaction.create({
    data: { title, amount: Number(amount), type, category, date: date ? new Date(date) : new Date(), userId: req.userId },
  });
  res.json(t);
});

router.put("/:id", async (req, res) => {
  const err = validate(req.body);
  if (err) return res.status(400).json({ error: err });
  const { title, amount, type, category, date } = req.body;
  const r = await prisma.transaction.updateMany({
    where: { id: Number(req.params.id), userId: req.userId },
    data: { title, amount: Number(amount), type, category, date: date ? new Date(date) : new Date() },
  });
  if (r.count === 0) return res.status(404).json({ error: "Not found" });
  res.json({ message: "Updated" });
});

router.delete("/:id", async (req, res) => {
  await prisma.transaction.deleteMany({ where: { id: Number(req.params.id), userId: req.userId } });
  res.json({ message: "Deleted" });
});

module.exports = router;
