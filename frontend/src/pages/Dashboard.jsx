
import { useEffect, useState } from "react";

import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Target,
  ArrowRight,
  Plus,
  Receipt,
  Sparkles,
  CalendarDays,
  CircleDollarSign,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../services/api";

function Dashboard() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH DASHBOARD DATA
  // ==========================================

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/dashboard");
      setDashboard(response.data);
    } catch (err) {
      console.error("Dashboard error:", err);

      setError(
        err.response?.data?.error ||
          "Unable to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FORMAT HELPERS
  // ==========================================

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount || 0));
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const currentMonth = new Date().toLocaleDateString(
    "en-IN",
    {
      month: "long",
      year: "numeric",
    }
  );

  // ==========================================
  // DASHBOARD DATA
  // ==========================================

  const summary = dashboard?.summary || {};

  const recentTransactions =
    dashboard?.recentTransactions || [];

  const spendingByCategory =
    dashboard?.spendingByCategory || [];

  const budgetOverview =
    dashboard?.budgetOverview || [];

  const goalOverview =
    dashboard?.goalOverview || [];

  const insights =
    dashboard?.insights || [];

  const totalCategorySpending = spendingByCategory.reduce(
    (sum, category) =>
      sum + Number(category.total || 0),
    0
  );

  // ==========================================
  // LAYOUT
  // ==========================================

  const mainWrapper = "min-h-screen bg-[#E9EDE5]";

  const mainContent =
    "px-4 pb-10 pt-[96px] sm:px-6 lg:ml-[260px] lg:px-8 lg:pt-[104px]";

  // ==========================================
  // LOADING STATE
  // ==========================================

  if (loading) {
    return (
      <div className={mainWrapper}>
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <Navbar
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className={mainContent}>
          <div className="flex min-h-[65vh] flex-col items-center justify-center">
            <div className="mb-4 h-9 w-9 animate-spin rounded-full border-[3px] border-[#DCE7DA] border-t-[#526B50]" />

            <p className="text-sm text-[#899184]">
              Preparing your financial overview...
            </p>
          </div>
        </main>
      </div>
    );
  }

  // ==========================================
  // ERROR STATE
  // ==========================================

  if (error) {
    return (
      <div className={mainWrapper}>
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <Navbar
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className={mainContent}>
          <div className="rounded-2xl border border-[#F0D8CC] bg-white p-8 text-center">
            <p className="font-semibold text-[#A66C5B]">
              Couldn't load your dashboard
            </p>

            <p className="mt-2 text-sm text-[#899184]">
              {error}
            </p>

            <button
              onClick={fetchDashboard}
              className="mt-5 rounded-xl bg-[#526B50] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#405B43]"
            >
              Try again
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ==========================================
  // MAIN DASHBOARD
  // ==========================================

  return (
    <div className={mainWrapper}>

      {/* SIDEBAR */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* NAVBAR */}
      <Navbar
        onMenuClick={() => setSidebarOpen(true)}
      />

      {/* MAIN CONTENT */}
      <main className={mainContent}>
        <div className="mx-auto max-w-[1500px] rounded-[24px] border border-white/70 bg-[#FFFDF9] p-5 shadow-[0_12px_45px_rgba(50,65,45,0.08)] sm:p-7 lg:p-9">

          {/* ==========================================
              HEADER
          ========================================== */}

          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[2px] text-[#87917F]">
                YOUR FINANCIAL SPACE
              </p>

              <h1 className="text-3xl font-semibold tracking-tight text-[#343A32]">
                Your money, in perspective.
              </h1>

              <p className="mt-2 text-sm text-[#8B8C81]">
                A little clarity goes a long way.
              </p>
            </div>

            <div className="rounded-xl border border-[#EAE8DF] bg-white px-4 py-2.5 text-sm text-[#646D5E]">
              <CalendarDays
                size={15}
                className="mr-2 inline-block"
              />

              {currentMonth}
            </div>
          </div>

          {/* ==========================================
              FINANCIAL SUMMARY
          ========================================== */}

          <section className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#454B40]">
                Financial overview
              </h2>

              <span className="text-[11px] text-[#9B9B90]">
                All-time summary
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

              {/* INCOME */}
              <div className="rounded-[20px] border border-[#CFE4D5] bg-[#DDF0E4] p-5 transition duration-200 hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-[#637C68]">
                    Total income
                  </p>

                  <TrendingUp
                    size={19}
                    className="text-[#527B60]"
                  />
                </div>

                <p className="mt-5 text-[26px] font-semibold tracking-tight text-[#344B39]">
                  {formatCurrency(summary.totalIncome)}
                </p>

                <p className="mt-1 text-[11px] text-[#738B76]">
                  Overall income
                </p>
              </div>

              {/* EXPENSES */}
              <div className="rounded-[20px] border border-[#F0D8CC] bg-[#F9E5DC] p-5 transition duration-200 hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-[#956F60]">
                    Total expenses
                  </p>

                  <TrendingDown
                    size={19}
                    className="text-[#BD806C]"
                  />
                </div>

                <p className="mt-5 text-[26px] font-semibold tracking-tight text-[#65483D]">
                  {formatCurrency(summary.totalExpenses)}
                </p>

                <p className="mt-1 text-[11px] text-[#A17C6E]">
                  Overall spending
                </p>
              </div>

              {/* BALANCE */}
              <div className="rounded-[20px] border border-[#E6E2D3] bg-[#F2F0E4] p-5 transition duration-200 hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-[#817D68]">
                    Available balance
                  </p>

                  <Wallet
                    size={19}
                    className="text-[#817B5D]"
                  />
                </div>

                <p className="mt-5 text-[26px] font-semibold tracking-tight text-[#494936]">
                  {formatCurrency(summary.balance)}
                </p>

                <p className="mt-1 text-[11px] text-[#97927A]">
                  Current balance
                </p>
              </div>

              {/* SAVINGS */}
              <div className="rounded-[20px] border border-[#DCD9F0] bg-[#E9E5F8] p-5 transition duration-200 hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-[#797198]">
                    Monthly savings
                  </p>

                  <PiggyBank
                    size={19}
                    className="text-[#8174AD]"
                  />
                </div>

                <p className="mt-5 text-[26px] font-semibold tracking-tight text-[#51466E]">
                  {formatCurrency(summary.monthlySavings)}
                </p>

                <p className="mt-1 text-[11px] text-[#9288B2]">
                  This month's savings
                </p>
              </div>
            </div>
          </section>

          {/* ==========================================
              MONTHLY ACTIVITY
          ========================================== */}

          <section className="mb-8 grid grid-cols-1 gap-5 xl:grid-cols-[1.5fr_1fr]">

            {/* INCOME AND EXPENSES */}
            <div className="rounded-[20px] border border-[#EAE8DF] bg-white p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-[#444A40]">
                    Income & expenses
                  </h2>

                  <p className="mt-1 text-xs text-[#96958A]">
                    Your financial activity this month
                  </p>
                </div>

                <span className="rounded-lg bg-[#F5F3EC] px-3 py-1.5 text-[11px] text-[#777C6E]">
                  {currentMonth}
                </span>
              </div>

              <div className="mt-7 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-[#E4F0E5] p-4">
                  <p className="text-xs text-[#738875]">
                    Income
                  </p>

                  <p className="mt-2 text-xl font-semibold text-[#48664B]">
                    {formatCurrency(summary.monthlyIncome)}
                  </p>
                </div>

                <div className="rounded-xl bg-[#F9E8E0] p-4">
                  <p className="text-xs text-[#A17D6E]">
                    Expenses
                  </p>

                  <p className="mt-2 text-xl font-semibold text-[#885B4D]">
                    {formatCurrency(summary.monthlyExpenses)}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-[#F0EEE8] pt-4">
                <span className="text-xs text-[#898B80]">
                  Monthly savings rate
                </span>

                <span className="text-sm font-semibold text-[#667B5F]">
                  {Number(summary.savingsRate || 0).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* SPENDING BY CATEGORY */}
            <div className="rounded-[20px] border border-[#EAE8DF] bg-white p-5 sm:p-6">
              <h2 className="text-sm font-semibold text-[#444A40]">
                Spending by category
              </h2>

              <p className="mt-1 text-xs text-[#96958A]">
                Where your money goes
              </p>

              {spendingByCategory.length === 0 ? (
                <div className="flex min-h-[190px] flex-col items-center justify-center text-center">
                  <CircleDollarSign
                    size={30}
                    className="text-[#B1B5A7]"
                  />

                  <p className="mt-3 text-sm text-[#777D70]">
                    No spending data yet
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {spendingByCategory.slice(0, 5).map((item, index) => {
                    const total = Number(item.total || 0);

                    const percentage =
                      totalCategorySpending > 0
                        ? (total / totalCategorySpending) * 100
                        : 0;

                    const colors = [
                      "bg-[#9EBDA1]",
                      "bg-[#E5B29C]",
                      "bg-[#B6ACD8]",
                      "bg-[#D7C58D]",
                      "bg-[#A6BEC0]",
                    ];

                    return (
                      <div key={`${item.category}-${index}`}>
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <span className="truncate text-xs text-[#666E61]">
                            {item.category}
                          </span>

                          <span className="text-xs font-semibold text-[#444A40]">
                            {formatCurrency(total)}
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-[#F0EFE9]">
                          <div
                            className={`h-full rounded-full ${colors[index % colors.length]}`}
                            style={{
                              width: `${Math.min(percentage, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* ==========================================
              MONTHLY BUDGETS
          ========================================== */}

          <section className="mb-8 rounded-[20px] border border-[#EAE8DF] bg-white p-5 sm:p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-[#444A40]">
                  Monthly budgets
                </h2>

                <p className="mt-1 text-xs text-[#96958A]">
                  Keep your spending within your plans.
                </p>
              </div>

              <button
                onClick={() => navigate("/budgets")}
                className="flex items-center gap-1 text-xs font-medium text-[#647C5E] transition hover:text-[#405C43]"
              >
                View budgets
                <ArrowRight size={14} />
              </button>
            </div>

            {budgetOverview.length === 0 ? (
              <div className="flex min-h-[150px] flex-col items-center justify-center text-center">
                <Wallet
                  size={28}
                  className="text-[#9BAD96]"
                />

                <p className="mt-3 text-sm text-[#687466]">
                  No budgets created yet
                </p>

                <button
                  onClick={() => navigate("/budgets")}
                  className="mt-3 rounded-lg bg-[#526B50] px-4 py-2 text-xs font-medium text-white transition hover:bg-[#405B43]"
                >
                  Create a budget
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {budgetOverview.map((budget, index) => {
                  const percentage = Number(budget.percentage || 0);

                  const overBudget =
                    Number(budget.spent || 0) >
                    Number(budget.budgetAmount || 0);

                  const backgrounds = [
                    "bg-[#E4F0E5]",
                    "bg-[#F9E8E0]",
                    "bg-[#EAE7F7]",
                  ];

                  return (
                    <div
                      key={budget.id}
                      className={`rounded-2xl border border-black/[0.03] p-4 ${backgrounds[index % backgrounds.length]}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="truncate text-sm font-semibold text-[#454C41]">
                          {budget.category}
                        </h3>

                        <span className="text-xs font-semibold text-[#586B55]">
                          {percentage.toFixed(0)}%
                        </span>
                      </div>

                      <p className="mt-3 text-lg font-semibold text-[#454C41]">
                        {formatCurrency(budget.spent)}
                      </p>

                      <p className="mt-1 text-[11px] text-[#777F70]">
                        of {formatCurrency(budget.budgetAmount)}
                      </p>

                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/70">
                        <div
                          className={`h-full rounded-full ${
                            overBudget
                              ? "bg-[#C98770]"
                              : "bg-[#789675]"
                          }`}
                          style={{
                            width: `${Math.min(Math.max(percentage, 0), 100)}%`,
                          }}
                        />
                      </div>

                      <p className="mt-3 text-[11px] text-[#70796D]">
                        {overBudget
                          ? `${formatCurrency(Math.abs(Number(budget.remaining || 0)))} over budget`
                          : `${formatCurrency(budget.remaining)} remaining`}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ==========================================
              SAVINGS GOALS
          ========================================== */}

          <section className="mb-8 rounded-[20px] border border-[#EAE8DF] bg-white p-5 sm:p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-[#444A40]">
                  Savings goals
                </h2>

                <p className="mt-1 text-xs text-[#96958A]">
                  A little progress every day.
                </p>
              </div>

              <button
                onClick={() => navigate("/goals")}
                className="flex items-center gap-1 text-xs font-medium text-[#647C5E] transition hover:text-[#405C43]"
              >
                View goals
                <ArrowRight size={14} />
              </button>
            </div>

            {goalOverview.length === 0 ? (
              <div className="flex min-h-[150px] flex-col items-center justify-center text-center">
                <Target
                  size={28}
                  className="text-[#B2A7D3]"
                />

                <p className="mt-3 text-sm text-[#687466]">
                  No savings goals yet
                </p>

                <button
                  onClick={() => navigate("/goals")}
                  className="mt-3 rounded-lg bg-[#526B50] px-4 py-2 text-xs font-medium text-white transition hover:bg-[#405B43]"
                >
                  Create a goal
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {goalOverview.map((goal, index) => {
                  const percentage = Math.min(
                    Math.max(Number(goal.percentage || 0), 0),
                    100
                  );

                  const backgrounds = [
                    "bg-[#E4F0E5]",
                    "bg-[#F9E8E0]",
                    "bg-[#EAE7F7]",
                  ];

                  const ringColors = [
                    "#779B79",
                    "#C98770",
                    "#9486BB",
                  ];

                  return (
                    <div
                      key={goal.id}
                      className={`flex items-center gap-4 rounded-2xl border border-black/[0.03] p-4 ${backgrounds[index % backgrounds.length]}`}
                    >
                      <div
                        className="flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-full"
                        style={{
                          background: `conic-gradient(${ringColors[index % ringColors.length]} ${percentage}%, rgba(255,255,255,0.8) ${percentage}% 100%)`,
                        }}
                      >
                        <div className="flex h-[57px] w-[57px] items-center justify-center rounded-full bg-white text-xs font-semibold text-[#495345]">
                          {percentage.toFixed(0)}%
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-semibold text-[#454C41]">
                          {goal.title}
                        </h3>

                        <p className="mt-2 text-[11px] text-[#777F70]">
                          Saved {formatCurrency(goal.savedAmount)}
                        </p>

                        <p className="mt-1 text-[11px] text-[#777F70]">
                          Target {formatCurrency(goal.targetAmount)}
                        </p>

                        {goal.targetDate && (
                          <p className="mt-2 text-[10px] text-[#909488]">
                            By {formatDate(goal.targetDate)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ==========================================
              FINANCIAL INSIGHTS
          ========================================== */}

          {insights.length > 0 && (
            <section className="mb-8">
              <div className="mb-4 flex items-center gap-2">
                <Sparkles
                  size={17}
                  className="text-[#B89566]"
                />

                <h2 className="text-sm font-semibold text-[#444A40]">
                  Financial insights
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {insights.slice(0, 6).map((insight, index) => (
                  <div
                    key={`${insight.title}-${index}`}
                    className="rounded-2xl border border-[#EAE8DF] bg-white p-4 transition hover:shadow-sm"
                  >
                    <h3 className="text-xs font-semibold text-[#4D584B]">
                      {insight.title}
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-[#85877B]">
                      {insight.message}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ==========================================
              RECENT TRANSACTIONS
          ========================================== */}

          <section className="overflow-hidden rounded-[20px] border border-[#EAE8DF] bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F0EEE8] p-5 sm:px-6">
              <div>
                <h2 className="text-sm font-semibold text-[#444A40]">
                  Recent transactions
                </h2>

                <p className="mt-1 text-xs text-[#96958A]">
                  Your latest financial activity.
                </p>
              </div>

              <button
                onClick={() => navigate("/transactions")}
                className="flex items-center gap-1 text-xs font-medium text-[#647C5E] transition hover:text-[#405C43]"
              >
                View all
                <ArrowRight size={14} />
              </button>
            </div>

            {recentTransactions.length === 0 ? (
              <div className="flex min-h-[150px] flex-col items-center justify-center text-center">
                <Receipt
                  size={28}
                  className="text-[#A4AA9A]"
                />

                <p className="mt-3 text-sm text-[#687466]">
                  No transactions yet
                </p>
              </div>
            ) : (
              <>
                {/* DESKTOP TABLE */}
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full">
                    <thead className="bg-[#FAF9F5]">
                      <tr>
                        {[
                          "Transaction",
                          "Category",
                          "Date",
                          "Amount",
                        ].map((heading) => (
                          <th
                            key={heading}
                            className={`px-5 py-4 text-[10px] font-semibold uppercase tracking-wider text-[#929387] ${
                              heading === "Amount"
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
                      {recentTransactions.map((transaction) => {
                        const isIncome =
                          transaction.type === "income";

                        return (
                          <tr
                            key={transaction.id}
                            className="border-t border-[#F1EFE9] transition hover:bg-[#FCFBF8]"
                          >
                            <td className="px-5 py-4 text-sm font-medium text-[#454C41]">
                              {transaction.title}
                            </td>

                            <td className="px-5 py-4">
                              <span className="rounded-lg bg-[#F3F1EA] px-2.5 py-1 text-[11px] text-[#70786C]">
                                {transaction.category}
                              </span>
                            </td>

                            <td className="px-5 py-4 text-xs text-[#929387]">
                              {formatDate(
                                transaction.transaction_date
                              )}
                            </td>

                            <td
                              className={`px-5 py-4 text-right text-sm font-semibold ${
                                isIncome
                                  ? "text-[#628365]"
                                  : "text-[#BB806D]"
                              }`}
                            >
                              {isIncome ? "+" : "-"}
                              {formatCurrency(transaction.amount)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* MOBILE LIST */}
                <div className="divide-y divide-[#F0EEE8] md:hidden">
                  {recentTransactions.map((transaction) => {
                    const isIncome =
                      transaction.type === "income";

                    return (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between gap-3 p-4"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-[#454C41]">
                            {transaction.title}
                          </p>

                          <p className="mt-1 text-[11px] text-[#929387]">
                            {transaction.category} ·{" "}
                            {formatDate(
                              transaction.transaction_date
                            )}
                          </p>
                        </div>

                        <p
                          className={`shrink-0 text-sm font-semibold ${
                            isIncome
                              ? "text-[#628365]"
                              : "text-[#BB806D]"
                          }`}
                        >
                          {isIncome ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </section>

          {/* FOOTER */}
          <footer className="mt-7 flex flex-col items-center justify-between gap-2 border-t border-[#EAE8DF] pt-5 text-[10px] text-[#A0A092] sm:flex-row">
            <p>FinTrack · Personal Finance Intelligence</p>
            <p>Make every rupee count.</p>
          </footer>

        </div>
      </main>
    </div>
  );
}

export default Dashboard;
