import { useEffect, useState } from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Target,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../services/api";

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [dashboard, setDashboard] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount || 0));
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  /*
    LOADING
  */

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">

        <Sidebar
          isOpen={sidebarOpen}
          onClose={() =>
            setSidebarOpen(false)
          }
        />

        <Navbar
          onMenuClick={() =>
            setSidebarOpen(true)
          }
        />

        <main
          className="
            p-4
            pt-20
            sm:p-6
            sm:pt-20
            lg:ml-64
            lg:p-8
            lg:pt-24
          "
        >

          <div
            className="
              flex
              min-h-[55vh]
              items-center
              justify-center
            "
          >

            <div className="text-center">

              <div
                className="
                  mx-auto
                  mb-3
                  h-8
                  w-8
                  animate-spin
                  rounded-full
                  border-4
                  border-gray-200
                  border-t-green-600
                "
              />

              <p className="text-sm text-gray-500">
                Loading dashboard...
              </p>

            </div>

          </div>

        </main>

      </div>
    );
  }

  /*
    ERROR
  */

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">

        <Sidebar
          isOpen={sidebarOpen}
          onClose={() =>
            setSidebarOpen(false)
          }
        />

        <Navbar
          onMenuClick={() =>
            setSidebarOpen(true)
          }
        />

        <main
          className="
            p-4
            pt-20
            sm:p-6
            sm:pt-20
            lg:ml-64
            lg:p-8
            lg:pt-24
          "
        >

          <div
            className="
              rounded-xl
              border
              border-red-200
              bg-red-50
              p-5
              text-sm
              text-red-700
            "
          >
            {error}
          </div>

        </main>

      </div>
    );
  }

  /*
    DATA
  */

  const summary =
    dashboard?.summary || {};

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

  const totalCategorySpending =
    spendingByCategory.reduce(
      (sum, category) =>
        sum +
        Number(category.total || 0),
      0
    );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* SIDEBAR */}

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() =>
          setSidebarOpen(false)
        }
      />

      {/* NAVBAR */}

      <Navbar
        onMenuClick={() =>
          setSidebarOpen(true)
        }
      />

      {/* MAIN */}

      <main
        className="
          p-4
          pt-20
          sm:p-6
          sm:pt-20
          lg:ml-64
          lg:p-8
          lg:pt-24
        "
      >

        {/* PAGE HEADER */}

        <div className="mb-6">

          <h1
            className="
              text-2xl
              font-bold
              tracking-tight
              text-gray-900
              sm:text-3xl
            "
          >
            Dashboard
          </h1>

          <p
            className="
              mt-1
              text-sm
              text-gray-500
            "
          >
            Here's a quick look at your finances.
          </p>

        </div>

        {/* =====================================================
            SUMMARY CARDS
        ====================================================== */}

        <div
          className="
            grid
            grid-cols-1
            gap-4
            sm:grid-cols-2
            xl:grid-cols-4
          "
        >

          {/* TOTAL INCOME */}

          <div
            className="
              rounded-xl
              border
              border-gray-200
              bg-white
              p-5
            "
          >

            <div
              className="
                flex
                items-start
                justify-between
                gap-3
              "
            >

              <div>

                <p
                  className="
                    text-sm
                    text-gray-500
                  "
                >
                  Total Income
                </p>

                <p
                  className="
                    mt-2
                    text-2xl
                    font-bold
                    text-gray-900
                  "
                >
                  {formatCurrency(
                    summary.totalIncome
                  )}
                </p>

              </div>

              <div
                className="
                  rounded-lg
                  bg-green-50
                  p-2
                "
              >

                <TrendingUp
                  size={20}
                  className="text-green-600"
                />

              </div>

            </div>

          </div>

          {/* TOTAL EXPENSES */}

          <div
            className="
              rounded-xl
              border
              border-gray-200
              bg-white
              p-5
            "
          >

            <div
              className="
                flex
                items-start
                justify-between
                gap-3
              "
            >

              <div>

                <p
                  className="
                    text-sm
                    text-gray-500
                  "
                >
                  Total Expenses
                </p>

                <p
                  className="
                    mt-2
                    text-2xl
                    font-bold
                    text-gray-900
                  "
                >
                  {formatCurrency(
                    summary.totalExpenses
                  )}
                </p>

              </div>

              <div
                className="
                  rounded-lg
                  bg-red-50
                  p-2
                "
              >

                <TrendingDown
                  size={20}
                  className="text-red-600"
                />

              </div>

            </div>

          </div>

          {/* BALANCE */}

          <div
            className="
              rounded-xl
              border
              border-gray-200
              bg-white
              p-5
            "
          >

            <div
              className="
                flex
                items-start
                justify-between
                gap-3
              "
            >

              <div>

                <p
                  className="
                    text-sm
                    text-gray-500
                  "
                >
                  Balance
                </p>

                <p
                  className={`
                    mt-2
                    text-2xl
                    font-bold
                    ${
                      Number(
                        summary.balance
                      ) >= 0
                        ? "text-gray-900"
                        : "text-red-600"
                    }
                  `}
                >
                  {formatCurrency(
                    summary.balance
                  )}
                </p>

              </div>

              <div
                className="
                  rounded-lg
                  bg-gray-100
                  p-2
                "
              >

                <Wallet
                  size={20}
                  className="text-gray-700"
                />

              </div>

            </div>

          </div>

          {/* MONTHLY SAVINGS */}

          <div
            className="
              rounded-xl
              border
              border-gray-200
              bg-white
              p-5
            "
          >

            <div
              className="
                flex
                items-start
                justify-between
                gap-3
              "
            >

              <div>

                <p
                  className="
                    text-sm
                    text-gray-500
                  "
                >
                  Monthly Savings
                </p>

                <p
                  className={`
                    mt-2
                    text-2xl
                    font-bold
                    ${
                      Number(
                        summary.monthlySavings
                      ) >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  `}
                >
                  {formatCurrency(
                    summary.monthlySavings
                  )}
                </p>

              </div>

              <div
                className="
                  rounded-lg
                  bg-green-50
                  p-2
                "
              >

                <PiggyBank
                  size={20}
                  className="text-green-600"
                />

              </div>

            </div>

          </div>

        </div>

        {/* =====================================================
            THIS MONTH
        ====================================================== */}

        <section className="mt-7">

          <div className="mb-4">

            <h2
              className="
                text-lg
                font-semibold
                text-gray-900
              "
            >
              This month
            </h2>

            <p
              className="
                mt-0.5
                text-sm
                text-gray-500
              "
            >
              Your current month's financial activity.
            </p>

          </div>

          <div
            className="
              grid
              grid-cols-1
              gap-4
              sm:grid-cols-3
            "
          >

            {/* MONTHLY INCOME */}

            <div
              className="
                rounded-xl
                border
                border-gray-200
                bg-white
                p-4
                sm:p-5
              "
            >

              <p
                className="
                  text-sm
                  text-gray-500
                "
              >
                Income
              </p>

              <p
                className="
                  mt-2
                  text-xl
                  font-semibold
                  text-gray-900
                "
              >
                {formatCurrency(
                  summary.monthlyIncome
                )}
              </p>

            </div>

            {/* MONTHLY EXPENSES */}

            <div
              className="
                rounded-xl
                border
                border-gray-200
                bg-white
                p-4
                sm:p-5
              "
            >

              <p
                className="
                  text-sm
                  text-gray-500
                "
              >
                Expenses
              </p>

              <p
                className="
                  mt-2
                  text-xl
                  font-semibold
                  text-gray-900
                "
              >
                {formatCurrency(
                  summary.monthlyExpenses
                )}
              </p>

            </div>

            {/* SAVINGS RATE */}

            <div
              className="
                rounded-xl
                border
                border-gray-200
                bg-white
                p-4
                sm:p-5
              "
            >

              <p
                className="
                  text-sm
                  text-gray-500
                "
              >
                Savings Rate
              </p>

              <p
                className="
                  mt-2
                  text-xl
                  font-semibold
                  text-gray-900
                "
              >
                {Number(
                  summary.savingsRate || 0
                ).toFixed(1)}
                %
              </p>

            </div>

          </div>

        </section>

        {/* =====================================================
            BUDGET + SPENDING
        ====================================================== */}

        <div
          className="
            mt-7
            grid
            grid-cols-1
            gap-5
            xl:grid-cols-2
          "
        >

          {/* BUDGET OVERVIEW */}

          <section
            className="
              overflow-hidden
              rounded-xl
              border
              border-gray-200
              bg-white
            "
          >

            <div
              className="
                border-b
                border-gray-200
                p-5
              "
            >

              <h2
                className="
                  font-semibold
                  text-gray-900
                "
              >
                Budget overview
              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  text-gray-500
                "
              >
                How you're doing against this month's budgets.
              </p>

            </div>

            <div className="p-5">

              {budgetOverview.length === 0 ? (

                <div
                  className="
                    flex
                    min-h-[150px]
                    flex-col
                    items-center
                    justify-center
                    text-center
                  "
                >

                  <p
                    className="
                      text-sm
                      text-gray-500
                    "
                  >
                    No budgets set for this month.
                  </p>

                  <button
                    onClick={() =>
                      (window.location.href =
                        "/budgets")
                    }
                    className="
                      mt-3
                      text-sm
                      font-medium
                      text-green-600
                      hover:text-green-700
                    "
                  >
                    Create a budget
                  </button>

                </div>

              ) : (

                <div className="space-y-5">

                  {budgetOverview.map(
                    (budget) => {

                      const percentage =
                        Math.min(
                          Number(
                            budget.percentage || 0
                          ),
                          100
                        );

                      const isOverBudget =
                        Number(
                          budget.spent
                        ) >
                        Number(
                          budget.budgetAmount
                        );

                      return (
                        <div
                          key={budget.id}
                        >

                          <div
                            className="
                              mb-2
                              flex
                              items-center
                              justify-between
                              gap-3
                            "
                          >

                            <div className="min-w-0">

                              <p
                                className="
                                  truncate
                                  text-sm
                                  font-medium
                                  text-gray-900
                                "
                              >
                                {budget.category}
                              </p>

                              <p
                                className="
                                  text-xs
                                  text-gray-500
                                "
                              >
                                {formatCurrency(
                                  budget.spent
                                )}{" "}
                                of{" "}
                                {formatCurrency(
                                  budget.budgetAmount
                                )}
                              </p>

                            </div>

                            <span
                              className={`
                                shrink-0
                                text-xs
                                font-medium
                                ${
                                  isOverBudget
                                    ? "text-red-600"
                                    : "text-gray-600"
                                }
                              `}
                            >
                              {Number(
                                budget.percentage ||
                                  0
                              ).toFixed(0)}
                              %
                            </span>

                          </div>

                          <div
                            className="
                              h-2
                              overflow-hidden
                              rounded-full
                              bg-gray-100
                            "
                          >

                            <div
                              className={`
                                h-full
                                rounded-full
                                ${
                                  isOverBudget
                                    ? "bg-red-500"
                                    : "bg-green-600"
                                }
                              `}
                              style={{
                                width: `${percentage}%`,
                              }}
                            />

                          </div>

                          <p
                            className={`
                              mt-1.5
                              text-xs
                              ${
                                isOverBudget
                                  ? "text-red-600"
                                  : "text-gray-500"
                              }
                            `}
                          >

                            {isOverBudget
                              ? `${formatCurrency(
                                  Math.abs(
                                    Number(
                                      budget.remaining
                                    )
                                  )
                                )} over budget`
                              : `${formatCurrency(
                                  budget.remaining
                                )} remaining`}

                          </p>

                        </div>
                      );
                    }
                  )}

                </div>

              )}

            </div>

          </section>

          {/* SPENDING BY CATEGORY */}

          <section
            className="
              overflow-hidden
              rounded-xl
              border
              border-gray-200
              bg-white
            "
          >

            <div
              className="
                border-b
                border-gray-200
                p-5
              "
            >

              <h2
                className="
                  font-semibold
                  text-gray-900
                "
              >
                Spending by category
              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  text-gray-500
                "
              >
                Where your money has been going.
              </p>

            </div>

            <div className="p-5">

              {spendingByCategory.length === 0 ? (

                <div
                  className="
                    flex
                    min-h-[150px]
                    items-center
                    justify-center
                    text-center
                  "
                >

                  <p
                    className="
                      text-sm
                      text-gray-500
                    "
                  >
                    No expense data available.
                  </p>

                </div>

              ) : (

                <div className="space-y-4">

                  {spendingByCategory
                    .slice(0, 6)
                    .map(
                      (item, index) => {

                        const percentage =
                          totalCategorySpending >
                          0
                            ? (Number(
                                item.total
                              ) /
                                totalCategorySpending) *
                              100
                            : 0;

                        return (
                          <div
                            key={`${item.category}-${index}`}
                          >

                            <div
                              className="
                                mb-2
                                flex
                                items-center
                                justify-between
                                gap-3
                              "
                            >

                              <span
                                className="
                                  truncate
                                  text-sm
                                  text-gray-700
                                "
                              >
                                {item.category}
                              </span>

                              <span
                                className="
                                  shrink-0
                                  text-sm
                                  font-medium
                                  text-gray-900
                                "
                              >
                                {formatCurrency(
                                  item.total
                                )}
                              </span>

                            </div>

                            <div
                              className="
                                h-2
                                overflow-hidden
                                rounded-full
                                bg-gray-100
                              "
                            >

                              <div
                                className="
                                  h-full
                                  rounded-full
                                  bg-gray-800
                                "
                                style={{
                                  width: `${percentage}%`,
                                }}
                              />

                            </div>

                          </div>
                        );
                      }
                    )}

                </div>

              )}

            </div>

          </section>

        </div>

        {/* =====================================================
            GOAL PROGRESS
        ====================================================== */}

        <section
          className="
            mt-7
            overflow-hidden
            rounded-xl
            border
            border-gray-200
            bg-white
          "
        >

          <div
            className="
              flex
              flex-col
              gap-3
              border-b
              border-gray-200
              p-5
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >

            <div>

              <h2
                className="
                  font-semibold
                  text-gray-900
                "
              >
                Goal progress
              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  text-gray-500
                "
              >
                Track how close you are to your savings goals.
              </p>

            </div>

            <button
              onClick={() =>
                (window.location.href =
                  "/goals")
              }
              className="
                self-start
                rounded-lg
                border
                border-gray-300
                px-3
                py-2
                text-sm
                font-medium
                text-gray-700
                transition
                hover:bg-gray-50
              "
            >
              View all goals
            </button>

          </div>

          <div className="p-5">

            {goalOverview.length === 0 ? (

              <div
                className="
                  flex
                  min-h-[140px]
                  flex-col
                  items-center
                  justify-center
                  text-center
                "
              >

                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-lg
                    bg-gray-100
                  "
                >

                  <Target
                    size={20}
                    className="text-gray-600"
                  />

                </div>

                <p
                  className="
                    mt-3
                    text-sm
                    text-gray-500
                  "
                >
                  You don't have any savings goals yet.
                </p>

                <button
                  onClick={() =>
                    (window.location.href =
                      "/goals")
                  }
                  className="
                    mt-2
                    text-sm
                    font-medium
                    text-green-600
                    hover:text-green-700
                  "
                >
                  Create your first goal
                </button>

              </div>

            ) : (

              <div
                className="
                  grid
                  grid-cols-1
                  gap-4
                  md:grid-cols-2
                  xl:grid-cols-3
                "
              >

                {goalOverview.map(
                  (goal) => {

                    const percentage =
                      Math.min(
                        Number(
                          goal.percentage || 0
                        ),
                        100
                      );

                    return (
                      <div
                        key={goal.id}
                        className="
                          rounded-lg
                          border
                          border-gray-200
                          p-4
                        "
                      >

                        <div
                          className="
                            flex
                            items-start
                            justify-between
                            gap-3
                          "
                        >

                          <div className="min-w-0">

                            <h3
                              className="
                                truncate
                                font-medium
                                text-gray-900
                              "
                            >
                              {goal.title}
                            </h3>

                            {goal.targetDate && (
                              <p
                                className="
                                  mt-1
                                  text-xs
                                  text-gray-500
                                "
                              >
                                Target:{" "}
                                {formatDate(
                                  goal.targetDate
                                )}
                              </p>
                            )}

                          </div>

                          <span
                            className="
                              shrink-0
                              text-sm
                              font-semibold
                              text-green-600
                            "
                          >
                            {percentage.toFixed(0)}%
                          </span>

                        </div>

                        <div
                          className="
                            mt-4
                            h-2
                            overflow-hidden
                            rounded-full
                            bg-gray-100
                          "
                        >

                          <div
                            className="
                              h-full
                              rounded-full
                              bg-green-600
                            "
                            style={{
                              width: `${percentage}%`,
                            }}
                          />

                        </div>

                        <div
                          className="
                            mt-3
                            flex
                            items-center
                            justify-between
                            gap-3
                          "
                        >

                          <div>

                            <p
                              className="
                                text-xs
                                text-gray-500
                              "
                            >
                              Saved
                            </p>

                            <p
                              className="
                                mt-0.5
                                text-sm
                                font-semibold
                                text-gray-900
                              "
                            >
                              {formatCurrency(
                                goal.savedAmount
                              )}
                            </p>

                          </div>

                          <div className="text-right">

                            <p
                              className="
                                text-xs
                                text-gray-500
                              "
                            >
                              Target
                            </p>

                            <p
                              className="
                                mt-0.5
                                text-sm
                                font-semibold
                                text-gray-900
                              "
                            >
                              {formatCurrency(
                                goal.targetAmount
                              )}
                            </p>

                          </div>

                        </div>

                        <div
                          className="
                            mt-3
                            border-t
                            border-gray-100
                            pt-3
                          "
                        >

                          {Number(
                            goal.remaining
                          ) > 0 ? (

                            <p
                              className="
                                text-xs
                                text-gray-500
                              "
                            >
                              {formatCurrency(
                                goal.remaining
                              )}{" "}
                              remaining
                            </p>

                          ) : (

                            <p
                              className="
                                text-xs
                                font-medium
                                text-green-600
                              "
                            >
                              Goal completed 🎉
                            </p>

                          )}

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            )}

          </div>

        </section>

        {/* =====================================================
            FINANCIAL INSIGHTS
        ====================================================== */}

        {insights.length > 0 && (
          <section
            className="
              mt-7
              overflow-hidden
              rounded-xl
              border
              border-gray-200
              bg-white
            "
          >

            <div
              className="
                border-b
                border-gray-200
                p-5
              "
            >

              <h2
                className="
                  font-semibold
                  text-gray-900
                "
              >
                Financial insights
              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  text-gray-500
                "
              >
                A few things worth knowing about your finances.
              </p>

            </div>

            <div
              className="
                grid
                grid-cols-1
                gap-4
                p-5
                md:grid-cols-2
                xl:grid-cols-3
              "
            >

              {insights
                .slice(0, 6)
                .map(
                  (insight, index) => {

                    const isPositive =
                      insight.type ===
                      "positive";

                    const isWarning =
                      insight.type ===
                      "warning";

                    return (
                      <div
                        key={`${insight.title}-${index}`}
                        className={`
                          rounded-lg
                          border
                          p-4
                          ${
                            isPositive
                              ? "border-green-200 bg-green-50"
                              : isWarning
                              ? "border-yellow-200 bg-yellow-50"
                              : "border-gray-200 bg-gray-50"
                          }
                        `}
                      >

                        <div
                          className="
                            flex
                            items-start
                            gap-3
                          "
                        >

                          <div
                            className={`
                              mt-0.5
                              h-2.5
                              w-2.5
                              shrink-0
                              rounded-full
                              ${
                                isPositive
                                  ? "bg-green-500"
                                  : isWarning
                                  ? "bg-yellow-500"
                                  : "bg-gray-500"
                              }
                            `}
                          />

                          <div className="min-w-0">

                            <h3
                              className={`
                                text-sm
                                font-semibold
                                ${
                                  isPositive
                                    ? "text-green-800"
                                    : isWarning
                                    ? "text-yellow-800"
                                    : "text-gray-800"
                                }
                              `}
                            >
                              {insight.title}
                            </h3>

                            <p
                              className="
                                mt-1.5
                                text-sm
                                leading-5
                                text-gray-600
                              "
                            >
                              {insight.message}
                            </p>

                          </div>

                        </div>

                      </div>
                    );
                  }
                )}

            </div>

          </section>
        )}

        {/* =====================================================
            RECENT TRANSACTIONS
        ====================================================== */}

        <section
          className="
            mt-7
            overflow-hidden
            rounded-xl
            border
            border-gray-200
            bg-white
          "
        >

          <div
            className="
              flex
              flex-col
              gap-3
              border-b
              border-gray-200
              p-5
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >

            <div>

              <h2
                className="
                  font-semibold
                  text-gray-900
                "
              >
                Recent transactions
              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  text-gray-500
                "
              >
                Your latest income and expenses.
              </p>

            </div>

            {recentTransactions.length > 0 && (
              <button
                onClick={() =>
                  (window.location.href =
                    "/transactions")
                }
                className="
                  self-start
                  rounded-lg
                  border
                  border-gray-300
                  px-3
                  py-2
                  text-sm
                  font-medium
                  text-gray-700
                  hover:bg-gray-50
                "
              >
                View all
              </button>
            )}

          </div>

          {recentTransactions.length === 0 ? (

            <div
              className="
                flex
                min-h-[150px]
                flex-col
                items-center
                justify-center
                p-5
                text-center
              "
            >

              <p
                className="
                  text-sm
                  text-gray-500
                "
              >
                No transactions yet.
              </p>

              <button
                onClick={() =>
                  (window.location.href =
                    "/transactions")
                }
                className="
                  mt-2
                  text-sm
                  font-medium
                  text-green-600
                  hover:text-green-700
                "
              >
                Add your first transaction
              </button>

            </div>

          ) : (

            <>

              {/* DESKTOP */}

              <div
                className="
                  hidden
                  overflow-x-auto
                  md:block
                "
              >

                <table className="w-full">

                  <thead
                    className="
                      border-b
                      border-gray-200
                      bg-gray-50
                    "
                  >

                    <tr>

                      <th
                        className="
                          px-5
                          py-3
                          text-left
                          text-xs
                          font-semibold
                          uppercase
                          tracking-wide
                          text-gray-500
                        "
                      >
                        Transaction
                      </th>

                      <th
                        className="
                          px-5
                          py-3
                          text-left
                          text-xs
                          font-semibold
                          uppercase
                          tracking-wide
                          text-gray-500
                        "
                      >
                        Category
                      </th>

                      <th
                        className="
                          px-5
                          py-3
                          text-left
                          text-xs
                          font-semibold
                          uppercase
                          tracking-wide
                          text-gray-500
                        "
                      >
                        Date
                      </th>

                      <th
                        className="
                          px-5
                          py-3
                          text-right
                          text-xs
                          font-semibold
                          uppercase
                          tracking-wide
                          text-gray-500
                        "
                      >
                        Amount
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {recentTransactions.map(
                      (transaction) => {

                        const isIncome =
                          transaction.type ===
                          "income";

                        return (
                          <tr
                            key={
                              transaction.id
                            }
                            className="
                              border-b
                              border-gray-100
                              last:border-0
                            "
                          >

                            <td
                              className="
                                px-5
                                py-4
                              "
                            >

                              <p
                                className="
                                  font-medium
                                  text-gray-900
                                "
                              >
                                {transaction.title}
                              </p>

                            </td>

                            <td
                              className="
                                px-5
                                py-4
                              "
                            >

                              <span
                                className="
                                  text-sm
                                  text-gray-600
                                "
                              >
                                {
                                  transaction.category
                                }
                              </span>

                            </td>

                            <td
                              className="
                                px-5
                                py-4
                              "
                            >

                              <span
                                className="
                                  text-sm
                                  text-gray-500
                                "
                              >
                                {formatDate(
                                  transaction.transaction_date
                                )}
                              </span>

                            </td>

                            <td
                              className={`
                                px-5
                                py-4
                                text-right
                                font-medium
                                ${
                                  isIncome
                                    ? "text-green-600"
                                    : "text-red-600"
                                }
                              `}
                            >

                              {isIncome
                                ? "+"
                                : "-"}

                              {formatCurrency(
                                transaction.amount
                              )}

                            </td>

                          </tr>
                        );
                      }
                    )}

                  </tbody>

                </table>

              </div>

              {/* MOBILE */}

              <div
                className="
                  divide-y
                  divide-gray-100
                  md:hidden
                "
              >

                {recentTransactions.map(
                  (transaction) => {

                    const isIncome =
                      transaction.type ===
                      "income";

                    return (
                      <div
                        key={
                          transaction.id
                        }
                        className="p-4"
                      >

                        <div
                          className="
                            flex
                            items-start
                            justify-between
                            gap-4
                          "
                        >

                          <div className="min-w-0">

                            <p
                              className="
                                truncate
                                font-medium
                                text-gray-900
                              "
                            >
                              {transaction.title}
                            </p>

                            <p
                              className="
                                mt-1
                                text-xs
                                text-gray-500
                              "
                            >
                              {
                                transaction.category
                              }
                            </p>

                            <p
                              className="
                                mt-1
                                text-xs
                                text-gray-400
                              "
                            >
                              {formatDate(
                                transaction.transaction_date
                              )}
                            </p>

                          </div>

                          <p
                            className={`
                              shrink-0
                              text-sm
                              font-semibold
                              ${
                                isIncome
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            `}
                          >

                            {isIncome
                              ? "+"
                              : "-"}

                            {formatCurrency(
                              transaction.amount
                            )}

                          </p>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            </>

          )}

        </section>

      </main>

    </div>
  );
}

export default Dashboard;