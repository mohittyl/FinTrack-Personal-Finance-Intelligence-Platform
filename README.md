# FinTrack

FinTrack is a full-stack personal finance management platform that helps users track income and expenses, manage monthly budgets, set savings goals, and monitor their financial activity.

## How the Project Works

1. The user opens the React frontend and signs in.
2. The frontend sends requests to the Express API.
3. The backend verifies the user's JWT and processes requests.
4. PostgreSQL stores and retrieves the user's financial data.
5. The API returns JSON responses, which the frontend displays.

The backend uses Express routes to handle API requests. PostgreSQL queries use the `pg` package. Passwords are hashed using `bcryptjs`, and JWTs are used for authentication and identifying logged-in users.

## Project Modules

### 1. Transactions
- Create, edit, and delete transactions.
- Record income and expenses.
- Search and filter transactions.
- Sort and paginate transaction records.
- Export transactions as CSV.
- Select existing categories or add new categories.

### 2. Budgets & Savings Goals
- Create and manage monthly budgets.
- Set separate spending limits for different categories.
- Track spending against each category's budget.
- Receive alerts when spending approaches or exceeds the budget.
- Create, edit, and delete savings goals.
- Add contributions towards savings goals.
- Track saved amounts, remaining amounts, and completion percentages.
- View visual progress bars for individual savings goals.

**Overspending alert conditions:**
- Below 80%: No alert.
- 80% to below 100%: Near-limit warning.
- Exactly 100%: Budget reached.
- Above 100%: Overspending alert.

### 3. Recurring Payments
- Record and manage repeating payments.

### 4. Dashboard & Analytics
- Review financial summaries and income/expense activity.
- View financial trends and account activity.

### 5. Settings
- Manage account details.

### 6. Reports & Financial Statements
- Monthly financial statements.
- Category-wise financial analysis.
- Six-month financial trends.
- Summary metrics.
- Interactive dashboard and printable/downloadable monthly statements using Chart.js and html2pdf.

## Main Project Folders

```text
FinTrack/
├── backend/
│   ├── config/          # PostgreSQL connection
│   ├── controllers/     # Request handling logic
│   ├── middleware/      # JWT authentication
│   ├── routes/          # Express API routes
│   ├── schema.sql       # Database table definitions
│   └── .env             # Local environment configuration
│
└── frontend/
    └── src/
        ├── pages/       # React application pages
        └── services/
            └── api.js   # API connection and JWT headers
```

The reports module also includes `routes/reports.js` and `public/dashboard.html` as part of the existing project structure.

## Technology Stack

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **Database Driver:** pg
- **Authentication:** JWT
- **Password Hashing:** bcryptjs
- **Charts and Reports:** Chart.js, html2pdf

## Requirements and Environment Setup

Install the following before running the project:

- Node.js and npm
- PostgreSQL

Start PostgreSQL and make sure you know your database username and password.

Create or update `backend/.env` with your local configuration:

```env
PORT=3000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=fintrack
DB_PASSWORD=your-local-postgres-password
DB_PORT=5432
JWT_SECRET=replace-this-with-a-long-private-value
```

Replace the example values with your local PostgreSQL credentials and a secure JWT secret.

**Important:** Keep `backend/.env` private. Never upload actual database passwords or JWT secrets to GitHub.

The database setup script uses these settings to create the `fintrack` database and its tables. The PostgreSQL user must have permission to create a database.

## Running the Project

Use two separate terminals: one for the backend and one for the frontend.

### 1. Prepare the Database and Start the Backend

```sh
cd backend
npm install
npm run db:setup
npm run dev
```

Run `npm run db:setup` when setting up the project for the first time or when you need to create the project tables.

Keep the backend server running while using the application.

### 2. Start the Frontend

Open a second terminal:

```sh
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, usually:

`http://localhost:5173`

Register a user and log in to access the application.

## Other Useful Commands

| Command | Purpose |
|---|---|
| `cd backend && npm start` | Start backend without automatic restart |
| `cd frontend && npm run build` | Build the frontend for production |
| `Ctrl + C` | Stop a running development server |

## Main Application Pages

- **Dashboard:** Financial summaries and recent activity.
- **Transactions:** Transaction management, filtering, sorting, pagination, and CSV export.
- **Budgets:** Monthly category-wise budgets and spending alerts.
- **Goals:** Savings targets, contributions, and progress tracking.
- **Recurring Payments:** Repeating payment management.
- **Analytics:** Income and expense trends.
- **Settings:** Account and profile management.

## API Documentation

All protected API requests require a valid JWT in the following request header:

```http
Authorization: Bearer <token>
```

### Transactions API

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/transactions` | List transactions |
| GET | `/api/transactions/categories` | Retrieve transaction categories |
| POST | `/api/transactions` | Create a transaction |
| PUT | `/api/transactions/:id` | Update a transaction |
| DELETE | `/api/transactions/:id` | Delete a transaction |
| GET | `/api/transactions/export` | Export transactions as CSV |

The transactions endpoint supports the following query parameters:

- `search`
- `type`
- `category`
- `dateFrom`
- `dateTo`
- `sortBy`
- `order`
- `page`
- `limit`

The default page number is `1`, and the default page size is `10`. The maximum page size is `100`.

Example:

```http
GET /api/transactions?search=food&type=expense&category=Food&dateFrom=2026-01-01&dateTo=2026-01-31&sortBy=amount&order=desc&page=1&limit=10
```

Pagination information is returned through the following response headers:

- `X-Total-Count`
- `X-Page`
- `X-Limit`
- `X-Total-Pages`

The CSV export endpoint supports search, filtering, and sorting parameters and exports all matching transactions rather than only the current page.

### Budgets API

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/budgets` | Retrieve the user's budgets and spending information |
| POST | `/api/budgets` | Create a monthly category budget |
| PUT | `/api/budgets/:id` | Update an existing budget |
| DELETE | `/api/budgets/:id` | Delete a budget |

Budgets are associated with a user, category, month, and year. Each category can have its own spending limit for a particular month.

### Savings Goals API

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/goals` | Retrieve savings goals |
| POST | `/api/goals` | Create a savings goal |
| PUT | `/api/goals/:id` | Update a savings goal |
| DELETE | `/api/goals/:id` | Delete a savings goal |
| PATCH | `/api/goals/:id/add-money` | Add a contribution towards a goal |

Savings goals track:
- Goal title
- Target amount
- Saved amount
- Remaining amount
- Target date
- Completion percentage

Contributions are validated to prevent the saved amount from exceeding the target amount.

## Quick Transaction API Check

1. Log in and copy the returned JWT.
2. In Postman, set the request header:

```http
Authorization: Bearer <token>
```

3. Send a `POST /api/transactions` request with this JSON body:

```json
{
  "title": "Lunch",
  "category": "Food",
  "type": "expense",
  "amount": 250,
  "transaction_date": "2026-01-15"
}
```

4. Try the example GET request to retrieve transactions.
5. Use the ID returned by the POST request to test the PUT and DELETE endpoints.
6. Test the export endpoint to check the CSV response.

For a viva explanation:

- `req.query` contains search, filter, and pagination options.
- `$1`, `$2`, and other placeholders safely pass values to PostgreSQL.
- `LIMIT` and `OFFSET` are used to retrieve a particular page of records.

## Database and Security

- PostgreSQL stores application data.
- Passwords are hashed using bcryptjs.
- JWT middleware protects authenticated API routes.
- User-specific queries use the authenticated user's ID.
- Parameterized SQL queries are used to pass values safely.
- Transaction sorting is restricted to supported columns.

## Troubleshooting

| Problem | Possible Solution |
|---|---|
| Database connection refused | Start PostgreSQL and check `DB_HOST` and `DB_PORT`. |
| Database password error | Verify `DB_USER` and `DB_PASSWORD` in `backend/.env`. |
| Tables are missing | Stop the backend, run `npm run db:setup` from the backend folder, and restart it. |
| Port is already in use | Stop the process using that port or configure another backend port. |
| Invalid JWT token | Log in again and retry with the latest token. |
| Frontend cannot reach the API | Check that the backend is running on the configured API URL. |

---

**FinTrack: Making personal finance tracking, budgeting, and savings management simpler.**