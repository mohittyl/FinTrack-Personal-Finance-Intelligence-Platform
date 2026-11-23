const prisma = require("../lib/prisma");

module.exports = async function admin(req, res, next) {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user || user.role !== "admin") return res.status(403).json({ error: "Admin only" });
  next();
};
