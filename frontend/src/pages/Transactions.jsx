
import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  X,
  Pencil,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../services/api";

const initialFormData = () => ({
  title: "",
  category: "",
  type: "expense",
  amount: "",
  transaction_date: new Date().toLocaleDateString("en-CA"),
});

function Transactions() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState(initialFormData);

  const incomeCategories = ["Salary", "Freelance", "Other"];

  const expenseCategories = [
    "Food",
    "Shopping",
    "Transport",
    "Education",
    "Entertainment",
    "Bills",
    "Healthcare",
    "Other",
  ];

  const categories =
    formData.type === "income"
      ? incomeCategories
      : expenseCategories;

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/transactions");

      setTransactions(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err) {
      console.error("Transactions error:", err);
      setError(
        err.response?.data?.error ||
          "Unable to load transactions"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));

  const formatDate = (date) => {
    if (!date) return "-";

    const dateString = String(date).slice(0, 10);
    const parts = dateString.split("-");

    if (parts.length !== 3) return dateString;

    return new Date(
      Date.UTC(
        Number(parts[0]),
        Number(parts[1]) - 1,
        Number(parts[2])
      )
    ).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleTypeChange = (type) => {
    setFormData((previous) => ({
      ...previous,
      type,
      category: "",
    }));
  };

  const openForm = () => {
    setEditingId(null);
    setFormData(initialFormData());
    setError("");
    setShowForm(true);
  };

  const openEditForm = (transaction) => {
    setEditingId(transaction.id);

    setFormData({
      title: transaction.title || "",
      category: transaction.category || "",
      type: transaction.type,
      amount: String(transaction.amount ?? ""),
      transaction_date: String(
        transaction.transaction_date
      ).slice(0, 10),
    });

    setError("");
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingId(null);
    setFormData(initialFormData());
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const amount = Number(formData.amount);

    if (!formData.title.trim()) {
      setError("Please enter a transaction title.");
      return;
    }

    if (!formData.category) {
      setError("Please select a category.");
      return;
    }

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      setError("Please enter a valid amount greater than zero.");
      return;
    }

    if (!formData.transaction_date) {
      setError("Please select a transaction date.");
      return;
    }

    const payload = {
      title: formData.title.trim(),
      category: formData.category,
      type: formData.type,
      amount,
      transaction_date: formData.transaction_date,
    };

    try {
      setSaving(true);

      if (editingId !== null) {
        await api.put(
          `/transactions/${editingId}`,
          payload
        );
      } else {
        await api.post("/transactions", payload);
      }

      setShowForm(false);
      setEditingId(null);
      setFormData(initialFormData());

      await fetchTransactions();
    } catch (err) {
      console.error("Save transaction error:", err);

      setError(
        err.response?.data?.error ||
          (editingId !== null
            ? "Unable to update transaction"
            : "Unable to create transaction")
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this transaction?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await api.delete(`/transactions/${id}`);

      setTransactions((previous) =>
        previous.filter(
          (transaction) => transaction.id !== id
        )
      );
    } catch (err) {
      console.error("Delete transaction error:", err);

      setError(
        err.response?.data?.error ||
          "Unable to delete transaction"
      );
    }
  };

  const filteredTransactions = transactions.filter(
    (transaction) => {
      const matchesType =
        filter === "all" || transaction.type === filter;

      const searchText = search.trim().toLowerCase();

      const matchesSearch =
        !searchText ||
        [
          transaction.title,
          transaction.category,
          transaction.type,
        ].some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(searchText)
        );

      return matchesType && matchesSearch;
    }
  );

  const totalIncome = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce(
      (sum, transaction) =>
        sum + Number(transaction.amount || 0),
      0
    );

  const totalExpenses = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce(
      (sum, transaction) =>
        sum + Number(transaction.amount || 0),
      0
    );

  const balance = totalIncome - totalExpenses;

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100";

  const actionButtonClass =
    "rounded-lg p-2 transition hover:bg-gray-100";

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <Navbar
        onMenuClick={() => setSidebarOpen(true)}
      />

      <main className="p-4 pt-20 sm:p-6 sm:pt-20 lg:ml-64 lg:p-8 lg:pt-24">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-sm font-medium text-green-600">
              Money activity
            </p>

            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Transactions
            </h1>

            <p className="mt-1.5 text-sm text-gray-500">
              Keep track of your income and expenses.
            </p>
          </div>

          <button
            onClick={openForm}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 sm:w-auto"
          >
            <Plus size={18} />
            Add Transaction
          </button>
        </div>

        {/* Error message */}
        {error && !showForm && (
          <div className="mb-5 flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>

            <button
              onClick={fetchTransactions}
              className="shrink-0 font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard
            title="Total Income"
            amount={formatCurrency(totalIncome)}
            icon={<ArrowDownLeft size={20} />}
            iconClass="bg-green-50 text-green-600"
          />

          <SummaryCard
            title="Total Expenses"
            amount={formatCurrency(totalExpenses)}
            icon={<ArrowUpRight size={20} />}
            iconClass="bg-red-50 text-red-600"
          />

          <SummaryCard
            title="Balance"
            amount={formatCurrency(balance)}
            icon={<Receipt size={20} />}
            iconClass="bg-gray-100 text-gray-700"
            amountClass={
              balance < 0 ? "text-red-600" : "text-gray-900"
            }
          />
        </div>

        {/* Filters and search */}
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Transaction history
            </h2>

            <p className="mt-0.5 text-sm text-gray-500">
              {filteredTransactions.length}{" "}
              {filteredTransactions.length === 1
                ? "transaction"
                : "transactions"}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search transactions..."
              aria-label="Search transactions"
              className={inputClass}
            />

            <div className="flex gap-2">
              {[
                { value: "all", label: "All" },
                { value: "income", label: "Income" },
                { value: "expense", label: "Expenses" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    filter === option.value
                      ? option.value === "income"
                        ? "bg-green-600 text-white"
                        : option.value === "expense"
                          ? "bg-red-600 text-white"
                          : "bg-gray-900 text-white"
                      : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Transaction list */}
        <section className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white">
          {loading ? (
            <div className="flex min-h-[260px] items-center justify-center">
              <p className="text-sm text-gray-500">
                Loading transactions...
              </p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center px-5 py-10 text-center">
              <Receipt size={28} className="text-gray-400" />

              <h3 className="mt-4 font-semibold text-gray-900">
                No transactions found
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                {search || filter !== "all"
                  ? "Try changing your search or filter."
                  : "Add your first transaction to start tracking your finances."}
              </p>

              {!search && filter === "all" && (
                <button
                  onClick={openForm}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
                >
                  <Plus size={18} />
                  Add Transaction
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full">
                  <thead className="border-b border-gray-200 bg-gray-50">
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
                          className={`px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 ${
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
                    {filteredTransactions.map((transaction) => {
                      const isIncome =
                        transaction.type === "income";

                      return (
                        <tr
                          key={transaction.id}
                          className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                        >
                          <td className="px-5 py-4 font-medium text-gray-900">
                            {transaction.title}
                          </td>

                          <td className="px-5 py-4 text-sm text-gray-600">
                            {transaction.category}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                isIncome
                                  ? "bg-green-50 text-green-700"
                                  : "bg-red-50 text-red-700"
                              }`}
                            >
                              {isIncome ? "Income" : "Expense"}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-sm text-gray-500">
                            {formatDate(
                              transaction.transaction_date
                            )}
                          </td>

                          <td
                            className={`px-5 py-4 text-right font-semibold ${
                              isIncome
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {isIncome ? "+" : "-"}
                            {formatCurrency(transaction.amount)}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() =>
                                  openEditForm(transaction)
                                }
                                className={`${actionButtonClass} text-gray-500 hover:text-green-700`}
                                title="Edit transaction"
                                aria-label={`Edit ${transaction.title}`}
                              >
                                <Pencil size={17} />
                              </button>

                              <button
                                onClick={() =>
                                  handleDelete(transaction.id)
                                }
                                className={`${actionButtonClass} text-gray-400 hover:bg-red-50 hover:text-red-600`}
                                title="Delete transaction"
                                aria-label={`Delete ${transaction.title}`}
                              >
                                <Trash2 size={17} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile list */}
              <div className="divide-y divide-gray-100 md:hidden">
                {filteredTransactions.map((transaction) => {
                  const isIncome =
                    transaction.type === "income";

                  return (
                    <div
                      key={transaction.id}
                      className="p-4 hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                              isIncome ? "bg-green-50" : "bg-red-50"
                            }`}
                          >
                            {isIncome ? (
                              <ArrowDownLeft
                                size={18}
                                className="text-green-600"
                              />
                            ) : (
                              <ArrowUpRight
                                size={18}
                                className="text-red-600"
                              />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-medium text-gray-900">
                              {transaction.title}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              {transaction.category} ·{" "}
                              {formatDate(
                                transaction.transaction_date
                              )}
                            </p>

                            <div className="mt-2 flex gap-2">
                              <button
                                onClick={() =>
                                  openEditForm(transaction)
                                }
                                className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100"
                              >
                                <Pencil size={13} />
                                Edit
                              </button>

                              <button
                                onClick={() =>
                                  handleDelete(transaction.id)
                                }
                                className="inline-flex items-center gap-1 rounded-md border border-red-100 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                              >
                                <Trash2 size={13} />
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>

                        <p
                          className={`shrink-0 text-sm font-semibold ${
                            isIncome
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {isIncome ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </main>

      {/* Add/Edit modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeForm();
          }}
        >
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white shadow-xl">
            <div className="flex items-start justify-between border-b border-gray-200 p-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingId !== null
                    ? "Edit Transaction"
                    : "Add Transaction"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {editingId !== null
                    ? "Update your transaction details."
                    : "Add your income or expense."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                aria-label="Close form"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5">
              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Type */}
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Transaction Type
              </label>

              <div className="grid grid-cols-2 gap-3">
                {["expense", "income"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleTypeChange(type)}
                    className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
                      formData.type === type
                        ? type === "income"
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-red-500 bg-red-50 text-red-700"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {type === "income" ? "Income" : "Expense"}
                  </button>
                ))}
              </div>

              {/* Title */}
              <div className="mt-4">
                <label
                  htmlFor="transaction-title"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Title
                </label>

                <input
                  id="transaction-title"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  maxLength={150}
                  required
                  placeholder={
                    formData.type === "income"
                      ? "e.g. Monthly salary"
                      : "e.g. Grocery shopping"
                  }
                  className={inputClass}
                />
              </div>

              {/* Category */}
              <div className="mt-4">
                <label
                  htmlFor="transaction-category"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Category
                </label>

                <select
                  id="transaction-category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className={inputClass}
                >
                  <option value="">Select category</option>

                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}

                  {/* Preserve existing categories while editing */}
                  {formData.category &&
                    !categories.includes(formData.category) && (
                      <option value={formData.category}>
                        {formData.category}
                      </option>
                    )}
                </select>
              </div>

              {/* Amount */}
              <div className="mt-4">
                <label
                  htmlFor="transaction-amount"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Amount (₹)
                </label>

                <input
                  id="transaction-amount"
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  min="0.01"
                  step="0.01"
                  max="9999999999.99"
                  required
                  placeholder="1000"
                  className={inputClass}
                />
              </div>

              {/* Date */}
              <div className="mt-4">
                <label
                  htmlFor="transaction-date"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Date
                </label>

                <input
                  id="transaction-date"
                  type="date"
                  name="transaction_date"
                  value={formData.transaction_date}
                  onChange={handleInputChange}
                  required
                  className={inputClass}
                />
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingId !== null
                      ? "Save Changes"
                      : "Add Transaction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  title,
  amount,
  icon,
  iconClass,
  amountClass = "text-gray-900",
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className={`mt-2 text-2xl font-bold ${amountClass}`}>
            {amount}
          </p>
        </div>

        <div className={`rounded-lg p-2 ${iconClass}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default Transactions;
