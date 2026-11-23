
import { useEffect, useState } from "react";
import {
  Download,
  Pencil,
  Plus,
  Trash2,
  X,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  Receipt,
  CalendarDays,
  SlidersHorizontal,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../services/api";

const pageSize = 10;

const DEFAULT_CATEGORIES = [
  "Bills",
  "Education",
  "Entertainment",
  "Food",
  "Freelance",
  "Groceries",
  "Health",
  "Other",
  "Rent",
  "Salary",
  "Shopping",
  "Transport",
  "Travel",
];

function emptyForm() {
  return {
    title: "",
    category: "",
    type: "expense",
    amount: "",
    transaction_date: new Date().toLocaleDateString("en-CA"),
  };
}

function Transactions() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [category, setCategory] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  // ==========================================
  // QUERY PARAMETERS
  // ==========================================

  function queryParams() {
    let sortColumn = "date";
    let order = "desc";

    if (sortBy === "date-asc") {
      order = "asc";
    } else if (sortBy === "amount-high") {
      sortColumn = "amount";
    } else if (sortBy === "amount-low") {
      sortColumn = "amount";
      order = "asc";
    } else if (sortBy === "title-az") {
      sortColumn = "title";
      order = "asc";
    } else if (sortBy === "title-za") {
      sortColumn = "title";
    }

    return {
      search,
      type,
      category,
      dateFrom,
      dateTo,
      sortBy: sortColumn,
      order,
    };
  }

  // ==========================================
  // FETCH TRANSACTIONS
  // ==========================================

  async function loadTransactions() {
    try {
      setLoading(true);
      setError("");

      const params = queryParams();

      params.page = page;
      params.limit = pageSize;

      const response = await api.get("/transactions", {
        params,
      });

      setTransactions(response.data);

      setTotal(
        Number(response.headers["x-total-count"] || 0)
      );
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Unable to load transactions"
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    try {
      const response = await api.get("/transactions/categories");
      const backendCategories = Array.isArray(response.data)
        ? response.data
        : [];

      // Keep useful filter choices available even for a new account.
      // Backend categories are retained and merged without duplicates.
      const combinedCategories = [
        ...new Set([...DEFAULT_CATEGORIES, ...backendCategories]),
      ].sort((a, b) => String(a).localeCompare(String(b)));

      setCategories(combinedCategories);
    } catch (err) {
      console.error("Unable to load categories:", err);
      setCategories(DEFAULT_CATEGORIES);
    }
  }

  useEffect(() => {
    loadTransactions();
  }, [
    search,
    type,
    category,
    dateFrom,
    dateTo,
    sortBy,
    page,
  ]);

  useEffect(() => {
    loadCategories();
  }, []);

  // ==========================================
  // FILTERS
  // ==========================================

  function changeFilter(setter, value) {
    setter(value);
    setPage(1);
  }

  function clearFilters() {
    setSearch("");
    setType("all");
    setCategory("all");
    setDateFrom("");
    setDateTo("");
    setSortBy("date-desc");
    setPage(1);
  }

  // ==========================================
  // FORMAT HELPERS
  // ==========================================

  function money(value) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(value || 0));
  }

  function dateText(value) {
    const parts = String(value).slice(0, 10).split("-");

    if (parts.length !== 3) {
      return value || "-";
    }

    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  // ==========================================
  // ADD / EDIT FORM
  // ==========================================

  function addForm() {
    setEditingId(null);
    setFormData(emptyForm());
    setError("");
    setShowForm(true);
  }

  function editForm(item) {
    setEditingId(item.id);

    setFormData({
      title: item.title,
      category: item.category,
      type: item.type,
      amount: String(item.amount),
      transaction_date: String(
        item.transaction_date
      ).slice(0, 10),
    });

    setError("");
    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setEditingId(null);
    setFormData(emptyForm());
    setError("");
  }

  // ==========================================
  // SAVE TRANSACTION
  // ==========================================

  async function saveTransaction(event) {
    event.preventDefault();

    const amount = Number(formData.amount);

    if (
      !formData.title.trim() ||
      !formData.category.trim() ||
      isNaN(amount) ||
      amount <= 0 ||
      amount > 9999999999.99 ||
      !formData.transaction_date
    ) {
      setError(
        "Enter a title, category, valid amount and date."
      );

      return;
    }

    const isEditing = editingId !== null;

    const item = {
      title: formData.title.trim(),
      category: formData.category.trim(),
      type: formData.type,
      amount,
      transaction_date: formData.transaction_date,
    };

    try {
      setSaving(true);
      setError("");

      if (isEditing) {
        await api.put(
          "/transactions/" + editingId,
          item
        );
      } else {
        await api.post("/transactions", item);
      }

      setShowForm(false);
      setEditingId(null);

      await loadCategories();

      // New transactions are sorted newest first.
      if (!isEditing && page > 1) {
        setPage(1);
      } else {
        await loadTransactions();
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Unable to save transaction"
      );
    } finally {
      setSaving(false);
    }
  }

  // ==========================================
  // DELETE TRANSACTION
  // ==========================================

  async function deleteTransaction(id) {
    if (!window.confirm("Delete this transaction?")) {
      return;
    }

    try {
      setError("");

      await api.delete("/transactions/" + id);

      if (transactions.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        await loadTransactions();
      }

      await loadCategories();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Unable to delete transaction"
      );
    }
  }

  // ==========================================
  // EXPORT CSV
  // ==========================================

  async function exportCSV() {
    try {
      const response = await api.get(
        "/transactions/export",
        {
          params: queryParams(),
          responseType: "blob",
        }
      );

      const fileUrl = URL.createObjectURL(
        new Blob([response.data], {
          type: "text/csv;charset=utf-8",
        })
      );

      const link = document.createElement("a");

      link.href = fileUrl;
      link.download = "transactions.csv";
      link.click();

      URL.revokeObjectURL(fileUrl);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Unable to export transactions"
      );
    }
  }

  // ==========================================
  // SUMMARY
  // ==========================================

  let income = 0;
  let expenses = 0;

  for (let i = 0; i < transactions.length; i += 1) {
    if (transactions[i].type === "income") {
      income += Number(transactions[i].amount);
    } else {
      expenses += Number(transactions[i].amount);
    }
  }

  let totalPages = Math.ceil(total / pageSize);

  if (totalPages < 1) {
    totalPages = 1;
  }

  const inputClass =
    "w-full rounded-xl border border-[#E5E3D9] bg-white px-3 py-2.5 text-sm text-[#454C41] outline-none transition placeholder:text-[#B4B4A9] focus:border-[#819A7A] focus:ring-2 focus:ring-[#DCE7DA]";

  const labelClass =
    "mb-2 block text-xs font-semibold text-[#596152]";

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-screen bg-[#E9EDE5]">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <Navbar
        onMenuClick={() => setSidebarOpen(true)}
      />

      <main className="px-4 pb-10 pt-[96px] sm:px-6 lg:ml-[260px] lg:px-8 lg:pt-[104px]">
        <div className="mx-auto max-w-[1500px] rounded-[24px] border border-white/70 bg-[#FFFDF9] p-5 shadow-[0_12px_45px_rgba(50,65,45,0.08)] sm:p-7 lg:p-9">

          {/* PAGE HEADER */}
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[2px] text-[#87917F]">
                MONEY ACTIVITY
              </p>

              <h1 className="text-3xl font-semibold tracking-tight text-[#343A32]">
                Transactions
              </h1>

              <p className="mt-2 text-sm text-[#8B8C81]">
                Every inflow and outflow, in one place.
              </p>
            </div>

            <button
              onClick={addForm}
              className="inline-flex items-center gap-2 rounded-xl bg-[#526B50] px-5 py-3 text-sm font-medium text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-[#405B43]"
            >
              <Plus size={17} />
              Add transaction
            </button>
          </div>

          {/* ERROR MESSAGE */}
          {error && !showForm && (
            <div className="mb-5 rounded-xl border border-[#F0D8CC] bg-[#F9E5DC] px-4 py-3 text-sm text-[#956F60]">
              {error}
            </div>
          )}

          {/* SUMMARY CARDS */}
          <section className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#454B40]">
                Transaction overview
              </h2>

              <span className="text-[11px] text-[#9B9B90]">
                Current page · {transactions.length} records
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

              <div className="rounded-[20px] border border-[#CFE4D5] bg-[#DDF0E4] p-5 transition duration-200 hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-[#637C68]">
                    Income on this page
                  </p>

                  <div className="rounded-xl bg-[#C7E5D0] p-2.5">
                    <ArrowDownLeft
                      size={19}
                      className="text-[#527B60]"
                    />
                  </div>
                </div>

                <p className="mt-5 text-[26px] font-semibold tracking-tight text-[#344B39]">
                  {money(income)}
                </p>

                <p className="mt-1 text-[11px] text-[#738B76]">
                  Money coming in
                </p>
              </div>

              <div className="rounded-[20px] border border-[#F0D8CC] bg-[#F9E5DC] p-5 transition duration-200 hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-[#956F60]">
                    Expenses on this page
                  </p>

                  <div className="rounded-xl bg-[#F2D2C5] p-2.5">
                    <ArrowUpRight
                      size={19}
                      className="text-[#B87965]"
                    />
                  </div>
                </div>

                <p className="mt-5 text-[26px] font-semibold tracking-tight text-[#65483D]">
                  {money(expenses)}
                </p>

                <p className="mt-1 text-[11px] text-[#A17C6E]">
                  Money going out
                </p>
              </div>

              <div className="rounded-[20px] border border-[#DCD9F0] bg-[#E9E5F8] p-5 transition duration-200 hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-[#797198]">
                    Page balance
                  </p>

                  <div className="rounded-xl bg-[#D9D2F0] p-2.5">
                    <Wallet
                      size={19}
                      className="text-[#8174AD]"
                    />
                  </div>
                </div>

                <p className="mt-5 text-[26px] font-semibold tracking-tight text-[#51466E]">
                  {money(income - expenses)}
                </p>

                <p className="mt-1 text-[11px] text-[#9288B2]">
                  Income minus expenses
                </p>
              </div>
            </div>
          </section>

          {/* TRANSACTION HISTORY */}
          <section className="overflow-hidden rounded-[20px] border border-[#EAE8DF] bg-white">

            {/* SECTION HEADER */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F0EEE8] p-5 sm:px-6">
              <div>
                <h2 className="text-sm font-semibold text-[#444A40]">
                  Transaction history
                </h2>

                <p className="mt-1 text-xs text-[#96958A]">
                  {total} transaction(s) found
                </p>
              </div>

              <button
                onClick={exportCSV}
                disabled={!total}
                className="inline-flex items-center gap-2 rounded-xl border border-[#E5E3D9] bg-white px-4 py-2.5 text-xs font-semibold text-[#64745F] transition hover:bg-[#F5F3EC] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Download size={15} />
                Export CSV
              </button>
            </div>

            {/* FILTERS */}
            <div className="border-b border-[#F0EEE8] bg-[#FCFBF8] p-5 sm:p-6">
              <div className="mb-4 flex items-center gap-2">
                <SlidersHorizontal
                  size={15}
                  className="text-[#87917F]"
                />

                <h3 className="text-xs font-semibold text-[#596152]">
                  Find a transaction
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

                <div className="relative sm:col-span-2 xl:col-span-2">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A092]"
                  />

                  <input
                    type="search"
                    aria-label="Search title or category"
                    placeholder="Search title or category..."
                    value={search}
                    onChange={(e) =>
                      changeFilter(setSearch, e.target.value)
                    }
                    className={`${inputClass} pl-10`}
                  />
                </div>

                <select
                  aria-label="Filter by type"
                  value={type}
                  onChange={(e) =>
                    changeFilter(setType, e.target.value)
                  }
                  className={inputClass}
                >
                  <option value="all">All types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>

                <select
                  aria-label="Filter by category"
                  value={category}
                  onChange={(e) =>
                    changeFilter(setCategory, e.target.value)
                  }
                  className={inputClass}
                >
                  <option value="all">All categories</option>

                  {categories.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>

                <div>
                  <label className={labelClass}>From date</label>

                  <input
                    type="date"
                    aria-label="Start date"
                    max={dateTo || undefined}
                    value={dateFrom}
                    onChange={(e) =>
                      changeFilter(setDateFrom, e.target.value)
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>To date</label>

                  <input
                    type="date"
                    aria-label="End date"
                    min={dateFrom || undefined}
                    value={dateTo}
                    onChange={(e) =>
                      changeFilter(setDateTo, e.target.value)
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <select
                    aria-label="Sort transactions"
                    value={sortBy}
                    onChange={(e) =>
                      changeFilter(setSortBy, e.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="date-desc">Newest first</option>
                    <option value="date-asc">Oldest first</option>
                    <option value="amount-high">
                      Amount: high to low
                    </option>
                    <option value="amount-low">
                      Amount: low to high
                    </option>
                    <option value="title-az">Title: A to Z</option>
                    <option value="title-za">Title: Z to A</option>
                  </select>
                </div>

                <button
                  onClick={clearFilters}
                  className="h-[44px] self-end rounded-xl border border-[#E5E3D9] bg-white px-4 text-xs font-semibold text-[#777F70] transition hover:bg-[#F2F0E9]"
                >
                  Clear filters
                </button>
              </div>
            </div>

            {/* TRANSACTION TABLE */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex min-h-[220px] flex-col items-center justify-center">
                  <div className="mb-4 h-9 w-9 animate-spin rounded-full border-[3px] border-[#DCE7DA] border-t-[#526B50]" />

                  <p className="text-sm text-[#899184]">
                    Loading transactions...
                  </p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="flex min-h-[240px] flex-col items-center justify-center px-5 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F2F0E4]">
                    <Receipt
                      size={25}
                      className="text-[#817B5D]"
                    />
                  </div>

                  <h3 className="mt-4 text-sm font-semibold text-[#454C41]">
                    No transactions found
                  </h3>

                  <p className="mt-2 max-w-sm text-xs leading-5 text-[#929387]">
                    Try changing your filters or add a new transaction.
                  </p>

                  <button
                    onClick={clearFilters}
                    className="mt-4 text-xs font-semibold text-[#647C5E] hover:text-[#405B43]"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                <>
                  {/* DESKTOP TABLE */}
                  <table className="hidden w-full min-w-[750px] md:table">
                    <thead className="bg-[#FAF9F5]">
                      <tr>
                        {[
                          "Transaction",
                          "Category",
                          "Type",
                          "Date",
                          "Amount",
                          "Actions",
                        ].map((heading) => (
                          <th
                            key={heading}
                            className={`px-5 py-4 text-[10px] font-semibold uppercase tracking-wider text-[#929387] ${
                              heading === "Amount" ||
                              heading === "Actions"
                                ? "text-right"
                                : "text-left"
                            }`}
                          >
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {transactions.map((item) => {
                        const isIncome = item.type === "income";

                        return (
                          <tr
                            key={item.id}
                            className="border-t border-[#F1EFE9] transition hover:bg-[#FCFBF8]"
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                                    isIncome
                                      ? "bg-[#DDF0E4]"
                                      : "bg-[#F9E5DC]"
                                  }`}
                                >
                                  {isIncome ? (
                                    <ArrowDownLeft
                                      size={17}
                                      className="text-[#527B60]"
                                    />
                                  ) : (
                                    <ArrowUpRight
                                      size={17}
                                      className="text-[#B87965]"
                                    />
                                  )}
                                </div>

                                <span className="max-w-[190px] truncate text-sm font-medium text-[#454C41]">
                                  {item.title}
                                </span>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <span className="rounded-lg bg-[#F3F1EA] px-2.5 py-1.5 text-[11px] text-[#70786C]">
                                {item.category}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`rounded-full px-3 py-1 text-[10px] font-semibold capitalize ${
                                  isIncome
                                    ? "bg-[#DDF0E4] text-[#527B60]"
                                    : "bg-[#F9E5DC] text-[#A66C5B]"
                                }`}
                              >
                                {item.type}
                              </span>
                            </td>

                            <td className="px-5 py-4 text-xs text-[#929387]">
                              {dateText(item.transaction_date)}
                            </td>

                            <td
                              className={`px-5 py-4 text-right text-sm font-semibold ${
                                isIncome
                                  ? "text-[#628365]"
                                  : "text-[#BB806D]"
                              }`}
                            >
                              {isIncome ? "+" : "-"}
                              {money(item.amount)}
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex justify-end gap-1">
                                <button
                                  title="Edit"
                                  aria-label="Edit transaction"
                                  onClick={() => editForm(item)}
                                  className="rounded-lg p-2 text-[#858A7D] transition hover:bg-[#F2F0E9] hover:text-[#526B50]"
                                >
                                  <Pencil size={15} />
                                </button>

                                <button
                                  title="Delete"
                                  aria-label="Delete transaction"
                                  onClick={() =>
                                    deleteTransaction(item.id)
                                  }
                                  className="rounded-lg p-2 text-[#A17C70] transition hover:bg-[#F9E5DC] hover:text-[#B45F4F]"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* MOBILE TRANSACTION LIST */}
                  <div className="divide-y divide-[#F0EEE8] md:hidden">
                    {transactions.map((item) => {
                      const isIncome = item.type === "income";

                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-3 p-4"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                isIncome
                                  ? "bg-[#DDF0E4]"
                                  : "bg-[#F9E5DC]"
                              }`}
                            >
                              {isIncome ? (
                                <ArrowDownLeft
                                  size={18}
                                  className="text-[#527B60]"
                                />
                              ) : (
                                <ArrowUpRight
                                  size={18}
                                  className="text-[#B87965]"
                                />
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-[#454C41]">
                                {item.title}
                              </p>

                              <p className="mt-1 truncate text-[11px] text-[#929387]">
                                {item.category} ·{" "}
                                {dateText(item.transaction_date)}
                              </p>
                            </div>
                          </div>

                          <div className="flex shrink-0 flex-col items-end gap-2">
                            <p
                              className={`text-sm font-semibold ${
                                isIncome
                                  ? "text-[#628365]"
                                  : "text-[#BB806D]"
                              }`}
                            >
                              {isIncome ? "+" : "-"}
                              {money(item.amount)}
                            </p>

                            <div className="flex gap-2">
                              <button
                                onClick={() => editForm(item)}
                                className="text-[#858A7D]"
                                aria-label="Edit transaction"
                              >
                                <Pencil size={14} />
                              </button>

                              <button
                                onClick={() =>
                                  deleteTransaction(item.id)
                                }
                                className="text-[#A17C70]"
                                aria-label="Delete transaction"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* PAGINATION */}
            {!loading && total > 0 && (
              <div className="flex flex-col gap-3 border-t border-[#F0EEE8] bg-[#FCFBF8] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs text-[#929387]">
                  Showing {(page - 1) * pageSize + 1}–
                  {Math.min(page * pageSize, total)} of {total}
                </span>

                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="rounded-lg border border-[#E5E3D9] bg-white px-3 py-2 text-xs font-medium text-[#73796B] transition hover:bg-[#F2F0E9] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <span className="text-xs text-[#777F70]">
                    Page {page} of {totalPages}
                  </span>

                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                    className="rounded-lg border border-[#E5E3D9] bg-white px-3 py-2 text-xs font-medium text-[#73796B] transition hover:bg-[#F2F0E9] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </section>

          <footer className="mt-7 flex flex-col items-center justify-between gap-2 border-t border-[#EAE8DF] pt-5 text-[10px] text-[#A0A092] sm:flex-row">
            <p>FinTrack · Personal Finance Intelligence</p>
            <p>Every transaction tells a story.</p>
          </footer>
        </div>
      </main>

      {/* ADD / EDIT TRANSACTION MODAL */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#30372F]/40 p-4 backdrop-blur-[3px]"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeForm();
            }
          }}
        >
          <section className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[24px] border border-white/70 bg-[#FFFDF9] shadow-[0_20px_60px_rgba(30,40,30,0.18)]">

            {/* MODAL HEADER */}
            <div className="flex items-start justify-between border-b border-[#EAE8DF] p-6">
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[2px] text-[#87917F]">
                  MONEY ACTIVITY
                </p>

                <h2 className="text-xl font-semibold text-[#343A32]">
                  {editingId
                    ? "Edit transaction"
                    : "Add transaction"}
                </h2>

                <p className="mt-1 text-xs text-[#929387]">
                  Enter the details of your transaction.
                </p>
              </div>

              <button
                className="rounded-xl bg-[#F1F0E9] p-2 text-[#73796B] transition hover:bg-[#E7E6DD]"
                onClick={closeForm}
                disabled={saving}
                aria-label="Close form"
              >
                <X size={18} />
              </button>
            </div>

            {/* FORM */}
            <form onSubmit={saveTransaction} className="p-6">
              {error && (
                <div className="mb-5 rounded-xl border border-[#F0D8CC] bg-[#F9E5DC] px-4 py-3 text-sm text-[#956F60]">
                  {error}
                </div>
              )}

              {/* TYPE */}
              <div>
                <label className={labelClass}>
                  Transaction type
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        type: "expense",
                      })
                    }
                    className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                      formData.type === "expense"
                        ? "border-[#E6BFB0] bg-[#F9E5DC] text-[#A66C5B]"
                        : "border-[#E5E3D9] bg-white text-[#85877B]"
                    }`}
                  >
                    <ArrowUpRight size={16} />
                    Expense
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        type: "income",
                      })
                    }
                    className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                      formData.type === "income"
                        ? "border-[#BFD8C3] bg-[#DDF0E4] text-[#527B60]"
                        : "border-[#E5E3D9] bg-white text-[#85877B]"
                    }`}
                  >
                    <ArrowDownLeft size={16} />
                    Income
                  </button>
                </div>
              </div>

              {/* TITLE */}
              <div className="mt-5">
                <label className={labelClass}>Title</label>

                <input
                  maxLength={150}
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      title: e.target.value,
                    })
                  }
                  placeholder="e.g. Grocery shopping"
                  className={inputClass}
                />
              </div>

              {/* CATEGORY */}
              <div className="mt-5">
                <label className={labelClass}>Category</label>

                <input
                  maxLength={100}
                  required
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value,
                    })
                  }
                  placeholder="e.g. Food"
                  className={inputClass}
                />
              </div>

              {/* AMOUNT */}
              <div className="mt-5">
                <label className={labelClass}>Amount</label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#929387]">
                    ₹
                  </span>

                  <input
                    type="number"
                    min="0.01"
                    max="9999999999.99"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        amount: e.target.value,
                      })
                    }
                    placeholder="2500"
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </div>

              {/* DATE */}
              <div className="mt-5">
                <label className={labelClass}>Date</label>

                <input
                  type="date"
                  required
                  value={formData.transaction_date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      transaction_date: e.target.value,
                    })
                  }
                  className={inputClass}
                />
              </div>

              {/* ACTIONS */}
              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  className="rounded-xl border border-[#E5E3D9] bg-white px-5 py-3 text-sm font-medium text-[#73796B] transition hover:bg-[#F5F3EC]"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-[#526B50] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#405B43] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save changes"
                      : "Add transaction"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default Transactions;
