# FinTrack

FinTrack is a personal finance app for tracking income, expenses, budgets, savings goals, and recurring payments.

## Tech used

- React and Vite for the frontend
- Node.js and Express for the API
- PostgreSQL with the `pg` database driver
- JWT for login sessions and `bcryptjs` for password hashing

## Run the project

1. Start PostgreSQL.
2. Set the PostgreSQL password and JWT secret in `backend/.env`. Keep this file private.
3. Install backend dependencies and create the app database and tables:

   ```sh
   cd backend
   npm install
   npm run db:setup
   npm run dev
   ```

4. In another terminal, start the frontend:

   ```sh
   cd frontend
   npm install
   npm run dev
   ```

Open the Vite URL shown in the terminal. Register a user, then log in. The database setup creates the `fintrack` database and the tables used by the API. It does not delete or modify other databases.

## Main pages

- Dashboard: account summaries and recent activity
- Transactions: add, edit, delete, search, filter, sort, paginate, and export CSV
- Budgets and goals: create and track monthly limits and savings targets
- Recurring payments: record and manage scheduled payments
- Analytics: review income and expense trends
- Settings: update the user profile and password

## Transaction API

After logging in, send the returned JWT as `Authorization: Bearer <token>`.

- `GET /api/transactions` — list transactions; supports `search`, `type`, `category`, `dateFrom`, `dateTo`, `sortBy`, and `order` query parameters.
- Add `page` and `limit` to paginate, for example: `/api/transactions?type=expense&sortBy=amount&order=desc&page=1&limit=10`. The response is still a JSON array. Pagination details are returned in the `X-Total-Count`, `X-Page`, `X-Limit`, and `X-Total-Pages` headers. The maximum page size is 100.
- `POST /api/transactions` — add a transaction.
- `PUT /api/transactions/:id` — edit a transaction.
- `DELETE /api/transactions/:id` — delete a transaction.
- `GET /api/transactions/export?type=expense` — download all matching transactions as a CSV file. It supports the same search, filter, and sorting parameters.

The route uses parameterized SQL for filters and only allows known sort columns, so query values cannot be used to inject SQL.
