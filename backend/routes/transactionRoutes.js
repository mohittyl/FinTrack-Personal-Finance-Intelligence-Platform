const express = require("express");
const pool = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// JWT check ke baad req.user.id milta hai, isliye user sirf apne records dekhega.
router.get("/", authMiddleware, async (req, res) => {
  try {
    const filters = getFilters(req.query, req.user.id);
    if (filters.error) {
      return res.status(400).json({ error: filters.error });
    }

    // URL se page aur limit text ke form mein aate hain, Number unhe number banata hai.
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);

    // Page aur limit poore numbers hone chahiye, decimal nahi.
    if (
      page < 1 ||
      page % 1 !== 0 ||
      limit < 1 ||
      limit > 100 ||
      limit % 1 !== 0
    ) {
      return res.status(400).json({
        error: "Page must be positive and limit must be between 1 and 100",
      });
    }

    const sort = getSort(req.query);
    if (sort.error) {
      return res.status(400).json({ error: sort.error });
    }

    // Pehle matching rows count karte hain, total pages dikhane ke liye.
    const countResult = await pool.query(
      `
        SELECT COUNT(*) AS total
        FROM transactions
        WHERE ${filters.where}
      `,
      filters.values
    );
    const total = Number(countResult.rows[0].total);
    // Page 1 ka offset 0, page 2 ka offset 10 hota hai (default limit 10).
    const offset = (page - 1) * limit;

    // Filter values ke baad SQL mein limit aur offset ke number aate hain.
    const limitNumber = filters.values.length + 1;
    const offsetNumber = filters.values.length + 2;
    const values = filters.values.slice();
    values.push(limit);
    values.push(offset);

    const result = await pool.query(
      `
        SELECT
          id,
          title,
          category,
          type,
          amount,
          transaction_date,
          created_at
        FROM transactions
        WHERE ${filters.where}
        ORDER BY ${sort.column} ${sort.order}, id DESC
        LIMIT $${limitNumber}
        OFFSET $${offsetNumber}
      `,
      values
    );

    // Ye headers frontend ko total count aur current page batate hain.
    res.set("X-Total-Count", String(total));
    res.set("X-Page", String(page));
    res.set("X-Limit", String(limit));
    res.set("X-Total-Pages", String(Math.ceil(total / limit)));

    // PostgreSQL amount ko text bhejta hai; API response mein number bana rahe hain.
    const transactions = [];
    for (let i = 0; i < result.rows.length; i += 1) {
      const transaction = result.rows[i];
      transaction.amount = Number(transaction.amount);
      transactions.push(transaction);
    }

    return res.status(200).json(transactions);
  } catch (error) {
    console.error("Get transactions error:", error);
    return res.status(500).json({ error: "Unable to fetch transactions" });
  }
});

// Logged-in user ki categories bhejte hain, dropdown bharne ke liye.
router.get("/categories", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT DISTINCT category
        FROM transactions
        WHERE user_id = $1
        ORDER BY category
      `,
      [req.user.id]
    );
    const categories = [];

    for (let i = 0; i < result.rows.length; i += 1) {
      categories.push(result.rows[i].category);
    }
    return res.status(200).json(categories);
  } catch (error) {
    console.error("Get categories error:", error);
    return res.status(500).json({ error: "Unable to fetch categories" });
  }
});

// Same filters ke matching transactions ko CSV file mein download karte hain.
router.get("/export", authMiddleware, async (req, res) => {
  try {
    const filters = getFilters(req.query, req.user.id);
    if (filters.error) {
      return res.status(400).json({ error: filters.error });
    }

    const sort = getSort(req.query);
    if (sort.error) {
      return res.status(400).json({ error: sort.error });
    }

    const result = await pool.query(
      `
        SELECT
          title,
          category,
          type,
          amount,
          transaction_date
        FROM transactions
        WHERE ${filters.where}
        ORDER BY ${sort.column} ${sort.order}, id DESC
      `,
      filters.values
    );

    let csv = "Title,Category,Type,Amount,Date\r\n";
    for (let i = 0; i < result.rows.length; i += 1) {
      const transaction = result.rows[i];
      csv += csvCell(transaction.title) + ",";
      csv += csvCell(transaction.category) + ",";
      csv += csvCell(transaction.type) + ",";
      csv += csvCell(transaction.amount) + ",";
      csv += csvCell(String(transaction.transaction_date).slice(0, 10));
      if (i < result.rows.length - 1) {
        csv += "\r\n";
      }
    }

    res.set("Content-Type", "text/csv; charset=utf-8");
    res.set(
      "Content-Disposition",
      'attachment; filename="transactions.csv"'
    );

    return res.status(200).send("\uFEFF" + csv);
  } catch (error) {
    console.error("Export transactions error:", error);
    return res.status(500).json({ error: "Unable to export transactions" });
  }
});

// Nayi transaction add karte hain. User ID JWT se lete hain, body se nahi.
router.post("/", authMiddleware, async (req, res) => {
  try {
    const body = req.body || {};
    const title = String(body.title || "").trim();
    const category = String(body.category || "").trim();
    const type = body.type;
    const amount = Number(body.amount);
    const date = body.transaction_date;

    if (
      !title ||
      !category ||
      (type !== "income" && type !== "expense")
    ) {
      return res.status(400).json({
        error: "Enter title, category and a valid type",
      });
    }
    // Ye limits database ke title aur category columns ke size ke barabar hain.
    if (title.length > 150) {
      return res.status(400).json({
        error: "Title cannot be longer than 150 characters",
      });
    }
    if (category.length > 100) {
      return res.status(400).json({
        error: "Category cannot be longer than 100 characters",
      });
    }
    // Amount positive ho aur database ki NUMERIC(12, 2) limit mein rahe.
    if (isNaN(amount) || amount <= 0 || amount > 9999999999.99) {
      return res.status(400).json({
        error: "Amount must be greater than zero and within the allowed limit",
      });
    }
    if (!isValidDate(date)) {
      return res.status(400).json({ error: "Enter a valid transaction date" });
    }


    // API mein amount number ke roop mein return karte hain.
    result.rows[0].amount = Number(result.rows[0].amount);

    return res.status(201).json({
      message: "Transaction created successfully",
      transaction: result.rows[0],
    });
  } catch (error) {
    console.error("Create transaction error:", error);
    return res.status(500).json({ error: "Unable to create transaction" });
  }
});

// Transaction tabhi edit hogi jab uski ID aur logged-in user dono match karein.
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = req.body || {};
    const title = String(body.title || "").trim();
    const category = String(body.category || "").trim();
    const type = body.type;
    const amount = Number(body.amount);
    const date = body.transaction_date;

    if (id < 1 || id % 1 !== 0) {
      return res.status(400).json({ error: "Invalid transaction id" });
    }
    if (
      !title ||
      !category ||
      (type !== "income" && type !== "expense")
    ) {
      return res.status(400).json({
        error: "Enter title, category and a valid type",
      });
    }
    if (title.length > 150) {
      return res.status(400).json({
        error: "Title cannot be longer than 150 characters",
      });
    }
    if (category.length > 100) {
      return res.status(400).json({
        error: "Category cannot be longer than 100 characters",
      });
    }
    if (isNaN(amount) || amount <= 0 || amount > 9999999999.99) {
      return res.status(400).json({
        error: "Amount must be greater than zero and within the allowed limit",
      });
    }
    if (!isValidDate(date)) {
      return res.status(400).json({ error: "Enter a valid transaction date" });
    }

    const result = await pool.query(
      `
        UPDATE transactions
        SET
          title = $1,
          category = $2,
          type = $3,
          amount = $4,
          transaction_date = $5
        WHERE id = $6 AND user_id = $7
        RETURNING
          id,
          title,
          category,
          type,
          amount,
          transaction_date,
          created_at
      `,
      [title, category, type, amount, date, id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    // GET, POST aur PUT sab mein amount number hi milega.
    result.rows[0].amount = Number(result.rows[0].amount);

    return res.status(200).json({
      message: "Transaction updated successfully",
      transaction: result.rows[0],
    });
  } catch (error) {
    console.error("Update transaction error:", error);
    return res.status(500).json({ error: "Unable to update transaction" });
  }
});

// Sirf logged-in user ki transaction delete hoti hai.
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (id < 1 || id % 1 !== 0) {
      return res.status(400).json({ error: "Invalid transaction id" });
    }

    const result = await pool.query(
      `
        DELETE FROM transactions
        WHERE id = $1 AND user_id = $2
        RETURNING id
      `,
      [id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    return res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Delete transaction error:", error);
    return res.status(500).json({ error: "Unable to delete transaction" });
  }
});

// Search/filter ke liye WHERE SQL aur uski values banate hain.
function getFilters(query, userId) {
  // Pehli value hamesha logged-in user ID hai.
  const values = [userId];
  let where = "user_id = $1";
  const search = String(query.search || "").trim();

  if (search) {
    values.push("%" + search + "%");
    // Values ki ginti se SQL placeholder number milta hai ($2, $3...).
    const searchNumber = values.length;
    where += " AND (title ILIKE $" + searchNumber;
    where += " OR category ILIKE $" + searchNumber + ")";
  }

  if (query.type && query.type !== "all") {
    if (query.type !== "income" && query.type !== "expense") {
      return { error: "Type must be income or expense" };
    }
    values.push(query.type);
    // $1, $2 jaise placeholders user input ko SQL se alag rakhte hain.
    where += " AND type = $" + values.length;
  }

  const category = String(query.category || "").trim();

  if (category && category !== "all") {
    values.push(category);
    where += " AND category = $" + values.length;
  }

  if (query.dateFrom) {
    if (!isValidDate(query.dateFrom)) {
      return { error: "Enter a valid start date" };
    }
    values.push(query.dateFrom);
    where += " AND transaction_date >= $" + values.length;
  }

  if (query.dateTo) {
    if (!isValidDate(query.dateTo)) {
      return { error: "Enter a valid end date" };
    }
    if (query.dateFrom && query.dateTo < query.dateFrom) {
      return { error: "End date must be after start date" };
    }
    values.push(query.dateTo);
    where += " AND transaction_date <= $" + values.length;
  }

  return { where: where, values: values };
}

// SQL mein column name direct aata hai, isliye sirf fixed safe options rakhte hain.
function getSort(query) {
  let column = "transaction_date";
  if (query.sortBy === "amount") {
    column = "amount";
  } else if (query.sortBy === "title") {
    column = "title";
  } else if (query.sortBy && query.sortBy !== "date") {
    return { error: "Sort by date, amount or title" };
  }

  let order = "DESC";
  if (query.order === "asc") {
    order = "ASC";
  } else if (query.order && query.order !== "desc") {
    return { error: "Order must be asc or desc" };
  }

  return { column: column, order: order };
}

// CSV mein comma ho sakta hai, isliye value quotes mein rakhte hain.
// Value ke andar quote ho to CSV rule ke hisaab se usse double karte hain.
function csvCell(value) {
  const text = String(value || "");
  let safeText = "";

  for (let i = 0; i < text.length; i += 1) {
    if (text[i] === '"') {
      safeText += '""';
    } else {
      safeText += text[i];
    }
  }

  return '"' + safeText + '"';
}

// Simple date check: date ban pa rahi ho aur same date wapas mile.
// Isse Feb 30 jaisi invalid date bhi reject hoti hai.
function isValidDate(value) {
  if (!value) {
    return false;
  }

  const dateText = String(value);
  if (dateText.length !== 10) {
    return false;
  }

  const date = new Date(dateText);
  if (isNaN(date.getTime())) {
    return false;
  }

  return date.toISOString().slice(0, 10) === dateText;
}

module.exports = router;
