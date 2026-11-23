
import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Wallet,
  X,
  ArrowRight,
  TrendingUp,
  CircleDollarSign,
  CalendarDays,
  ShoppingBag,
  Utensils,
  Car,
  GraduationCap,
  HeartPulse,
  Receipt,
  Sparkles,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../services/api";

function Budgets() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  const categories = [
    "Food",
    "Shopping",
    "Transport",
    "Education",
    "Entertainment",
    "Bills",
    "Healthcare",
    "Other",
  ];

  const categoryStyles = {
    Food: {
      background: "bg-[#DDF0E4]",
      iconBackground: "bg-[#C7E5D0]",
      icon: Utensils,
      iconColor: "text-[#527B60]",
      progress: "bg-[#789B7B]",
    },
    Shopping: {
      background: "bg-[#F9E5DC]",
      iconBackground: "bg-[#F2D2C5]",
      icon: ShoppingBag,
      iconColor: "text-[#B87965]",
      progress: "bg-[#CE9078]",
    },
    Transport: {
      background: "bg-[#E9E5F8]",
      iconBackground: "bg-[#D9D2F0]",
      icon: Car,
      iconColor: "text-[#8174AD]",
      progress: "bg-[#9A8CC7]",
    },
    Education: {
      background: "bg-[#F2F0E4]",
      iconBackground: "bg-[#E5E1CA]",
      icon: GraduationCap,
      iconColor: "text-[#817B5D]",
      progress: "bg-[#A69B70]",
    },
    Entertainment: {
      background: "bg-[#E6EDF0]",
      iconBackground: "bg-[#D2E0E5]",
      icon: Sparkles,
      iconColor: "text-[#668A99]",
      progress: "bg-[#80A5B2]",
    },
    Bills: {
      background: "bg-[#F5E9DF]",
      iconBackground: "bg-[#ECD9C9]",
      icon: Receipt,
      iconColor: "text-[#A77D5F]",
      progress: "bg-[#C49A79]",
    },
    Healthcare: {
      background: "bg-[#E4F0E5]",
      iconBackground: "bg-[#CFE5D1]",
      icon: HeartPulse,
      iconColor: "text-[#648B6A]",
      progress: "bg-[#82A98A]",
    },
    Other: {
      background: "bg-[#EFEDE7]",
      iconBackground: "bg-[#E0DDD2]",
      icon: Wallet,
      iconColor: "text-[#777968]",
      progress: "bg-[#9B9D87]",
    },
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/budgets");
      setBudgets(response.data);
    } catch (err) {
      console.error("Budgets error:", err);

      setError(
        err.response?.data?.error ||
          "Unable to load budgets"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount || 0));
  };

  const getMonthName = (month) => {
    return new Date(
      2000,
      Number(month) - 1,
      1
    ).toLocaleString("en-IN", {
      month: "long",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openCreateForm = () => {
    setEditingBudget(null);

    setFormData({
      category: "",
      amount: "",
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    });

    setError("");
    setShowForm(true);
  };

  const openEditForm = (budget) => {
    setEditingBudget(budget);

    setFormData({
      category: budget.category,
      amount: budget.amount,
      month: budget.month,
      year: budget.year,
    });

    setError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingBudget(null);

    setFormData({
      category: "",
      amount: "",
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      if (!formData.category) {
        setError("Please select a category.");
        return;
      }

      if (
        !formData.amount ||
        Number(formData.amount) <= 0
      ) {
        setError(
          "Please enter a valid budget amount."
        );
        return;
      }

      const payload = {
        category: formData.category,
        amount: Number(formData.amount),
        month: Number(formData.month),
        year: Number(formData.year),
      };

      if (editingBudget) {
        await api.put(
          `/budgets/${editingBudget.id}`,
          payload
        );
      } else {
        await api.post("/budgets", payload);
      }

      closeForm();
      await fetchBudgets();
    } catch (err) {
      console.error("Save budget error:", err);

      setError(
        err.response?.data?.error ||
          "Unable to save budget"
      );
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this budget?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await api.delete(`/budgets/${id}`);

      await fetchBudgets();
    } catch (err) {
      console.error("Delete budget error:", err);

      setError(
        err.response?.data?.error ||
          "Unable to delete budget"
      );
    }
  };

  const calculatePercentage = (spent, amount) => {
    if (Number(amount) <= 0) return 0;

    return (
      (Number(spent || 0) / Number(amount)) * 100
    );
  };

  const totalBudget = budgets.reduce(
    (sum, budget) =>
      sum + Number(budget.amount || 0),
    0
  );

  const totalSpent = budgets.reduce(
    (sum, budget) =>
      sum + Number(budget.spent || 0),
    0
  );

  const totalRemaining = totalBudget - totalSpent;

  const overallPercentage =
    totalBudget > 0
      ? (totalSpent / totalBudget) * 100
      : 0;

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
                SPENDING PLAN
              </p>

              <h1 className="text-3xl font-semibold tracking-tight text-[#343A32]">
                Monthly budgets
              </h1>

              <p className="mt-2 max-w-xl text-sm text-[#8B8C81]">
                Give every rupee a purpose. Keep your
                spending aligned with your plans.
              </p>
            </div>

            <button
              onClick={openCreateForm}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#526B50] px-5 py-3 text-sm font-medium text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-[#405B43]"
            >
              <Plus size={17} />
              Add budget
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
                Your budget overview
              </h2>

              <span className="text-[11px] text-[#9B9B90]">
                {budgets.length}{" "}
                {budgets.length === 1
                  ? "active budget"
                  : "active budgets"}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

              {/* TOTAL BUDGET */}
              <div className="rounded-[20px] border border-[#CFE4D5] bg-[#DDF0E4] p-5 transition duration-200 hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-[#637C68]">
                    Total budget
                  </p>

                  <div className="rounded-xl bg-[#C7E5D0] p-2.5">
                    <Wallet
                      size={19}
                      className="text-[#527B60]"
                    />
                  </div>
                </div>

                <p className="mt-5 text-[26px] font-semibold tracking-tight text-[#344B39]">
                  {formatCurrency(totalBudget)}
                </p>

                <p className="mt-1 text-[11px] text-[#738B76]">
                  Your planned spending limit
                </p>
              </div>

              {/* TOTAL SPENT */}
              <div className="rounded-[20px] border border-[#F0D8CC] bg-[#F9E5DC] p-5 transition duration-200 hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-[#956F60]">
                    Total spent
                  </p>

                  <div className="rounded-xl bg-[#F2D2C5] p-2.5">
                    <TrendingUp
                      size={19}
                      className="text-[#B87965]"
                    />
                  </div>
                </div>

                <p className="mt-5 text-[26px] font-semibold tracking-tight text-[#65483D]">
                  {formatCurrency(totalSpent)}
                </p>

                <p className="mt-1 text-[11px] text-[#A17C6E]">
                  Money spent across budgets
                </p>
              </div>

              {/* REMAINING */}
              <div
                className={`rounded-[20px] border p-5 transition duration-200 hover:-translate-y-1 ${
                  totalRemaining >= 0
                    ? "border-[#DCD9F0] bg-[#E9E5F8]"
                    : "border-[#F0D8CC] bg-[#F9E5DC]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-[#797198]">
                    Remaining balance
                  </p>

                  <div className="rounded-xl bg-white/60 p-2.5">
                    <CircleDollarSign
                      size={19}
                      className={
                        totalRemaining >= 0
                          ? "text-[#8174AD]"
                          : "text-[#B87965]"
                      }
                    />
                  </div>
                </div>

                <p
                  className={`mt-5 text-[26px] font-semibold tracking-tight ${
                    totalRemaining >= 0
                      ? "text-[#51466E]"
                      : "text-[#885B4D]"
                  }`}
                >
                  {formatCurrency(totalRemaining)}
                </p>

                <p className="mt-1 text-[11px] text-[#9288B2]">
                  {totalRemaining >= 0
                    ? "Available across your budgets"
                    : "You have exceeded your total limit"}
                </p>
              </div>
            </div>
          </section>

          {/* OVERALL PROGRESS */}
          {budgets.length > 0 && (
            <section className="mb-8 rounded-[20px] border border-[#EAE8DF] bg-white p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-[#444A40]">
                    Overall spending progress
                  </h2>

                  <p className="mt-1 text-xs text-[#96958A]">
                    How much of your planned budget has been used?
                  </p>
                </div>

                <span className="rounded-lg bg-[#F2F0E4] px-3 py-1.5 text-xs font-semibold text-[#817D68]">
                  {overallPercentage.toFixed(0)}% used
                </span>
              </div>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#F0EFE9]">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    overallPercentage > 100
                      ? "bg-[#C98770]"
                      : "bg-[#789B7B]"
                  }`}
                  style={{
                    width: `${Math.min(overallPercentage, 100)}%`,
                  }}
                />
              </div>

              <div className="mt-3 flex justify-between text-xs text-[#929387]">
                <span>{formatCurrency(totalSpent)} spent</span>
                <span>{formatCurrency(totalBudget)} planned</span>
              </div>
            </section>
          )}

          {/* BUDGET LIST */}
          <section>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-[#444A40]">
                  Your budgets
                </h2>

                <p className="mt-1 text-xs text-[#96958A]">
                  Manage your category-wise spending limits.
                </p>
              </div>
            </div>

            {/* LOADING */}
            {loading ? (
              <div className="flex min-h-[250px] flex-col items-center justify-center rounded-[20px] border border-[#EAE8DF] bg-white">
                <div className="mb-4 h-9 w-9 animate-spin rounded-full border-[3px] border-[#DCE7DA] border-t-[#526B50]" />

                <p className="text-sm text-[#899184]">
                  Loading your budgets...
                </p>
              </div>
            ) : budgets.length === 0 ? (
              /* EMPTY STATE */
              <div className="rounded-[20px] border border-dashed border-[#D9DED3] bg-white px-6 py-14 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#DDF0E4]">
                  <Wallet
                    size={27}
                    className="text-[#527B60]"
                  />
                </div>

                <h3 className="mt-5 text-lg font-semibold text-[#343A32]">
                  No budgets yet
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#8B8C81]">
                  Start planning your spending by creating
                  your first category budget.
                </p>

                <button
                  onClick={openCreateForm}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#526B50] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#405B43]"
                >
                  <Plus size={17} />
                  Create your first budget
                </button>
              </div>
            ) : (
              /* BUDGET CARDS */
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {budgets.map((budget) => {
                  const amount = Number(budget.amount || 0);
                  const spent = Number(budget.spent || 0);
                  const remaining = amount - spent;

                  const percentage = calculatePercentage(
                    spent,
                    amount
                  );

                  const isOverBudget = spent > amount;

                  const progress = Math.min(
                    Math.max(percentage, 0),
                    100
                  );

                  const style =
                    categoryStyles[budget.category] ||
                    categoryStyles.Other;

                  const CategoryIcon = style.icon;

                  return (
                    <article
                      key={budget.id}
                      className={`rounded-[20px] border border-black/[0.04] p-5 transition duration-200 hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(50,65,45,0.07)] ${style.background}`}
                    >
                      {/* CARD HEADER */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className={`rounded-xl p-3 ${style.iconBackground}`}>
                            <CategoryIcon
                              size={20}
                              className={style.iconColor}
                            />
                          </div>

                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold text-[#454C41]">
                              {budget.category}
                            </h3>

                            <p className="mt-1 text-[11px] text-[#85877B]">
                              {getMonthName(budget.month)}{" "}
                              {budget.year}
                            </p>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            onClick={() =>
                              openEditForm(budget)
                            }
                            className="rounded-lg bg-white/60 p-2 text-[#697466] transition hover:bg-white hover:text-[#405B43]"
                            title="Edit budget"
                            aria-label="Edit budget"
                          >
                            <Pencil size={15} />
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(budget.id)
                            }
                            className="rounded-lg bg-white/60 p-2 text-[#9B7468] transition hover:bg-white hover:text-[#B45F4F]"
                            title="Delete budget"
                            aria-label="Delete budget"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      {/* SPENDING AMOUNTS */}
                      <div className="mt-7 flex items-end justify-between gap-3">
                        <div>
                          <p className="text-[11px] text-[#777F70]">
                            Spent so far
                          </p>

                          <p className="mt-1 text-2xl font-semibold tracking-tight text-[#454C41]">
                            {formatCurrency(spent)}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-[11px] text-[#777F70]">
                            Budget limit
                          </p>

                          <p className="mt-1 text-sm font-semibold text-[#596152]">
                            {formatCurrency(amount)}
                          </p>
                        </div>
                      </div>

                      {/* PROGRESS */}
                      <div className="mt-6">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <span
                            className={`text-xs font-semibold ${
                              isOverBudget
                                ? "text-[#B45F4F]"
                                : "text-[#596F58]"
                            }`}
                          >
                            {percentage.toFixed(0)}% used
                          </span>

                          <span
                            className={`text-xs font-medium ${
                              isOverBudget
                                ? "text-[#B45F4F]"
                                : "text-[#777F70]"
                            }`}
                          >
                            {isOverBudget
                              ? `${formatCurrency(Math.abs(remaining))} over`
                              : `${formatCurrency(remaining)} left`}
                          </span>
                        </div>

                        <div className="h-2.5 overflow-hidden rounded-full bg-white/70">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isOverBudget
                                ? "bg-[#C98770]"
                                : style.progress
                            }`}
                            style={{
                              width: `${progress}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* STATUS */}
                      <div className="mt-5 flex items-center justify-between border-t border-black/[0.05] pt-4">
                        <span className="text-[11px] text-[#777F70]">
                          {isOverBudget
                            ? "Budget exceeded"
                            : "Available to spend"}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-[10px] font-semibold ${
                            isOverBudget
                              ? "bg-[#F4D5CA] text-[#A45F4F]"
                              : percentage >= 80
                                ? "bg-[#F1E6CF] text-[#967849]"
                                : "bg-white/70 text-[#647C5E]"
                          }`}
                        >
                          {isOverBudget
                            ? "Over budget"
                            : percentage >= 80
                              ? "Near limit"
                              : "On track"}
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/* FOOTER */}
          <footer className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-[#EAE8DF] pt-5 text-[10px] text-[#A0A092] sm:flex-row">
            <p>FinTrack · Personal Finance Intelligence</p>
            <p>Plan better. Spend smarter.</p>
          </footer>
        </div>
      </main>

      {/* ADD / EDIT BUDGET MODAL */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#30372F]/40 p-4 backdrop-blur-[3px]"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeForm();
            }
          }}
        >
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[24px] border border-white/70 bg-[#FFFDF9] shadow-[0_20px_60px_rgba(30,40,30,0.18)]">

            {/* MODAL HEADER */}
            <div className="flex items-start justify-between border-b border-[#EAE8DF] p-6">
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[2px] text-[#87917F]">
                  SPENDING PLAN
                </p>

                <h2 className="text-xl font-semibold text-[#343A32]">
                  {editingBudget
                    ? "Edit budget"
                    : "Create a budget"}
                </h2>

                <p className="mt-1 text-xs text-[#929387]">
                  Set a spending limit for a category.
                </p>
              </div>

              <button
                onClick={closeForm}
                className="rounded-xl bg-[#F1F0E9] p-2 text-[#73796B] transition hover:bg-[#E7E6DD]"
                aria-label="Close form"
              >
                <X size={18} />
              </button>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="p-6">
              {error && (
                <div className="mb-5 rounded-xl border border-[#F0D8CC] bg-[#F9E5DC] px-4 py-3 text-sm text-[#956F60]">
                  {error}
                </div>
              )}

              {/* CATEGORY */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-[#596152]">
                  Category
                </label>

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-[#E5E3D9] bg-white px-4 py-3 text-sm text-[#454C41] outline-none transition focus:border-[#819A7A] focus:ring-2 focus:ring-[#DCE7DA]"
                >
                  <option value="">
                    Select category
                  </option>

                  {categories.map((category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* AMOUNT */}
              <div className="mt-5">
                <label className="mb-2 block text-xs font-semibold text-[#596152]">
                  Budget amount
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#929387]">
                    ₹
                  </span>

                  <input
                    type="number"
                    name="amount"
                    min="1"
                    step="0.01"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="5000"
                    className="w-full rounded-xl border border-[#E5E3D9] bg-white py-3 pl-9 pr-4 text-sm text-[#454C41] outline-none transition placeholder:text-[#B4B4A9] focus:border-[#819A7A] focus:ring-2 focus:ring-[#DCE7DA]"
                  />
                </div>
              </div>

              {/* MONTH AND YEAR */}
              <div className="mt-5 grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-xs font-semibold text-[#596152]">
                    Month
                  </label>

                  <select
                    name="month"
                    value={formData.month}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-[#E5E3D9] bg-white px-3 py-3 text-sm text-[#454C41] outline-none transition focus:border-[#819A7A] focus:ring-2 focus:ring-[#DCE7DA]"
                  >
                    {Array.from(
                      { length: 12 },
                      (_, index) => (
                        <option
                          key={index + 1}
                          value={index + 1}
                        >
                          {getMonthName(index + 1)}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-[#596152]">
                    Year
                  </label>

                  <input
                    type="number"
                    name="year"
                    min="2020"
                    max="2100"
                    value={formData.year}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-[#E5E3D9] bg-white px-3 py-3 text-sm text-[#454C41] outline-none transition focus:border-[#819A7A] focus:ring-2 focus:ring-[#DCE7DA]"
                  />
                </div>
              </div>

              {/* FORM ACTIONS */}
              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-xl border border-[#E5E3D9] bg-white px-5 py-3 text-sm font-medium text-[#73796B] transition hover:bg-[#F5F3EC]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-[#526B50] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#405B43]"
                >
                  {editingBudget
                    ? "Update budget"
                    : "Create budget"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Budgets;
