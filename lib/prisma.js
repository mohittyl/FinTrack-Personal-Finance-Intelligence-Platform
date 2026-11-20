const { PrismaClient } = require("@prisma/client");
module.exports = new PrismaClient(); // one shared database connection
