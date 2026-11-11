# FinTrack

FinTrack is a full-stack personal finance project. A user can record income and expenses, set budgets and savings goals, and review their activity.

## How the project works

1. The user opens the React frontend and signs in.
2. The frontend sends requests to the Express API.
3. The API checks the user's JWT and reads or saves data in PostgreSQL.
4. The API returns data as JSON. The frontend displays it in the app.

The backend uses Express routes to handle API requests. PostgreSQL queries use the `pg` package. Passwords are hashed with `bcryptjs`, and JWTs are used to identify the logged-in user.

## Project modules

- **Transactions:** create, edit, delete, search, filter, sort, paginate, and export transactions as CSV.
- **Budgets:** set spending limits by category and month.
- **Goals:** track savings targets.
- **Recurring payments:** record repeating payments.
- **Dashboard and analytics:** review totals and income/expense activity.
- **Settings:** update account details.

## Main folders

- `backend/routes/` contains Express API routes.
- `backend/controllers/` contains request handling code such as login and registration.
- `backend/middleware/` contains JWT authentication checks.
- `backend/config/` contains the PostgreSQL connection.
- `backend/schema.sql` contains the database tables.
- `frontend/src/pages/` contains the React pages.
- `frontend/src/services/api.js` contains the frontend API connection and JWT header setup.

## Tech used

- React and Vite for the frontend
- Node.js and Express for the API
- PostgreSQL with the `pg` database driver
- JWT for login sessions and `bcryptjs` for password hashing

## Requirements and environment

Install Node.js with npm and PostgreSQL before running the app. Start the PostgreSQL server and make sure you know the database user's name and password.

Create or update `backend/.env` on your own computer with the settings below. Replace the example values with your local PostgreSQL details and a private JWT secret:

```env
PORT=3000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=fintrack
DB_PASSWORD=your-local-postgres-password
DB_PORT=5432
JWT_SECRET=replace-this-with-a-long-private-value
```

Keep `backend/.env` private and do not upload real passwords or JWT secrets to GitHub. The setup script uses the database connection settings to create `DB_NAME` and its tables. The PostgreSQL user must have permission to create a database.

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

- `GET /api/transactions` — list the logged-in user's transactions. It supports `search`, `type`, `category`, `dateFrom`, `dateTo`, `sortBy`, `order`, `page`, and `limit` query parameters.
- Page number defaults to `1` and page size defaults to `10`. Example: `/api/transactions?search=food&type=expense&category=Food&dateFrom=2026-01-01&dateTo=2026-01-31&sortBy=amount&order=desc&page=1&limit=10`.
- The response is a JSON array. Pagination information is returned in the `X-Total-Count`, `X-Page`, `X-Limit`, and `X-Total-Pages` headers. The maximum page size is 100.
- `GET /api/transactions/categories` — list the logged-in user's categories for the category dropdown.
- `POST /api/transactions` — add a transaction.
- `PUT /api/transactions/:id` — edit a transaction.
- `DELETE /api/transactions/:id` — delete a transaction.
- `GET /api/transactions/export?type=expense` — download all matching transactions as a CSV file. It supports the same search, filter, and sorting parameters and exports all matches, not only the current page.

The route uses parameterized SQL for filters and only allows known sort columns, so query values cannot be used to inject SQL.

### Quick API check

1. Log in and copy the returned token.
2. In Postman, set the request header to `Authorization: Bearer <token>`.
3. Send a `POST /api/transactions` request with JSON fields `title`, `category`, `type`, `amount`, and `transaction_date`.
4. Try the example `GET` request above, then use the `PUT` and `DELETE` routes with the created transaction ID.
5. Open the export route in Postman to check the CSV response.

For a viva explanation: `req.query` contains search/filter/page options, `$1` placeholders safely pass values to PostgreSQL, and `LIMIT`/`OFFSET` select one page of records.
