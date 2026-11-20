# 💰 FinTrack — Personal Finance Intelligence Platform (Team Project)

Track income & expenses, set budgets and savings goals, and see reports.

**Stack:** HTML, CSS, JavaScript • Node.js + Express • Prisma ORM • SQL (SQLite; PostgreSQL ready)

## How to run
1. Install Node.js (v18+)
2. In this folder:
   npm install
   npx prisma migrate dev --name init
   npm start
3. Open http://localhost:3000
   (The FIRST user who registers becomes the admin.)

## Team work split
| Member | Module | Backend files | Frontend files |
|---|---|---|---|
| 1 | Auth, Profile, Admin | routes/auth.js, routes/admin.js, middleware/ | js/login.js, js/profile.js, index.html |
| 2 | Transactions | routes/transactions.js | js/transactions.js |
| 3 | Budgets & Goals | routes/budgets.js, routes/goals.js | js/budgets.js |
| 4 | Dashboard & Reports | routes/reports.js | js/reports.js |

Shared: prisma/schema.prisma, js/common.js, css/style.css, server.js
(Agree before editing shared files; use Git branches, one per member.)

## Features
- Register/Login (JWT + bcrypt), profile, change password, admin user list
- Add / edit / delete transactions, search, filter, sort, pagination, CSV export
- Monthly category budgets with progress bars and overspend warning
- Savings goals with progress
- Dashboard with charts, monthly report, PDF download (Print -> Save as PDF)

## Switch to PostgreSQL
1. In prisma/schema.prisma change provider to "postgresql"
2. In .env: DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/fintrack"
3. Delete the prisma/migrations folder (if present), then run: npx prisma migrate dev --name init

## API overview
POST /api/auth/register | login   GET/PUT /api/auth/me   PUT /api/auth/password
GET /api/admin/users              DELETE /api/admin/users/:id
GET/POST /api/transactions        PUT/DELETE /api/transactions/:id   GET /api/transactions/export
GET /api/budgets?month=           PUT /api/budgets   DELETE /api/budgets/:id
GET/POST /api/goals               PATCH /api/goals/:id/add   DELETE /api/goals/:id
GET /api/reports/monthly?month=   GET /api/reports/trend

## Future ideas
Recurring transactions, forgot-password by email, multiple currencies, mobile app.
