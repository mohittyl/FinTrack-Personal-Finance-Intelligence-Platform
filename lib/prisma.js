// ============================================================
// DATABASE CONNECTION (PRISMA CLIENT)
// Yeh file SQLite database se connection banati hai
// ============================================================

var PrismaClient = require("@prisma/client").PrismaClient;
var prisma = new PrismaClient();

module.exports = prisma;
