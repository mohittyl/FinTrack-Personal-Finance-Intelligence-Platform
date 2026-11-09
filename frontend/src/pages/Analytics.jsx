import { useEffect, useState } from "react";

import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Wallet,
  BarChart3,
  RefreshCw,
  CalendarDays,
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../services/api";

const PERIODS = [
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "3 Months", value: "3m" },
  { label: "6 Months", value: "6m" },
  { label: "1 Year", value: "1y" },
];

const CHART_COLORS = [
  "#16a34a",
  "#2563eb",
  "#f59e0b",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
  "#db2777",
  "#4b5563",
];

function Analytics() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [period, setPeriod] = useState("6m");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/analytics", {
          params: { period },
        });

        if (!cancelled) {
          setAnalytics(response.data);
        }
      } catch (err) {
        console.error("Analytics error:", err);

        if (!cancelled) {
          setError(
            err.response?.data?.error ||
              "Unable to load analytics. Please try again."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchAnalytics();

    return () => {
      cancelled = true;
    };
  }, [period]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount || 0));

  const formatShortCurrency = (amount) => {
    const value = Number(amount || 0);

    if (Math.abs(value) >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    }

    if (Math.abs(value) >= 1000) {
      return `₹${(value / 1000).toFixed(1)}K`;
    }

    return `₹${value}`;
  };

  const summary = analytics?.summary || {};
  const monthlyData = analytics?.monthlyData || [];
  const spendingByCategory = analytics?.spendingByCategory || [];
  const topCategories = analytics?.topCategories || [];

  const totalIncome = Number(summary.totalIncome || 0);
  const totalExpenses = Number(summary.totalExpenses || 0);

  const totalSavings = Number(
    summary.totalSavings ?? totalIncome - totalExpenses
  );

  const savingsRate = Number(summary.savingsRate || 0);

  const pieData = spendingByCategory
    .map((item) => ({
      name: item.category || "Other",
      value: Number(item.total || 0),
    }))
    .filter((item) => item.value > 0);

  const highestCategory = topCategories[0];

  const MetricCard = ({
    title,
    value,
    icon: Icon,
    iconClass,
    description,
    valueClass = "text-gray-900",
  }) => (
    <div className="min-w-0 border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-gray-500">{title}</p>

          <p className={`mt-2 break-words text-2xl font-bold ${valueClass}`}>
            {value}
          </p>

          {description && (
            <p className="mt-2 text-xs text-gray-500">{description}</p>
          )}
        </div>

        <div className={`shrink-0 rounded-lg p-2 ${iconClass}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );

  const CurrencyTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) {
      return null;
    }

    return (
      <div className="border border-gray-200 bg-white px-3 py-2 shadow-sm">
        {label && (
          <p className="mb-1 text-xs font-medium text-gray-500">{label}</p>
        )}

        {payload.map((item, index) => (
          <p
            key={`${item.dataKey || item.name}-${index}`}
            className="text-sm font-medium text-gray-900"
          >
            {item.name}: {formatCurrency(item.value)}
          </p>
        ))}
      </div>
    );
  };

  const PageShell = ({ children }) => (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <Navbar onMenuClick={() => setSidebarOpen(true)} />

      <main className="p-4 pt-20 sm:p-6 sm:pt-20 lg:ml-64 lg:p-8 lg:pt-24">
        {children}
      </main>
    </div>
  );

  if (loading && !analytics) {
    return (
      <PageShell>
        <div className="flex min-h-[55vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-green-600" />
            <p className="text-sm text-gray-500">Loading analytics...</p>
          </div>
        </div>
      </PageShell>
    );
  }

  if (error && !analytics) {
    return (
      <PageShell>
        <div className="border border-red-200 bg-red-50 p-5">
          <h2 className="font-semibold text-red-800">
            Unable to load analytics
          </h2>

          <p className="mt-1 text-sm text-red-700">{error}</p>

          <button
            onClick={() => {
              setAnalytics(null);
              setError("");
              setLoading(true);
              // Trigger a new request even when the period is unchanged.
              setPeriod((current) => current);
            }}
            className="mt-4 border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
          >
            Try again
          </button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1 text-sm font-medium text-green-700">
            Your money, at a glance
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Analytics
          </h1>

          <p className="mt-1.5 text-sm text-gray-500">
            Understand your income, spending and savings patterns.
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <CalendarDays size={17} />
          <span>
            {analytics?.periodLabel ||
              PERIODS.find((item) => item.value === period)?.label}
          </span>
        </div>
      </div>

      {/* Date filters */}
      <div className="mb-6">
        <p className="mb-2 text-sm font-medium text-gray-700">Time period</p>

        <div className="flex flex-wrap gap-2">
          {PERIODS.map((option) => (
            <button
              key={option.value}
              onClick={() => setPeriod(option.value)}
              disabled={loading}
              aria-pressed={period === option.value}
              className={`border px-4 py-2 text-sm font-medium transition disabled:cursor-wait disabled:opacity-60 ${
                period === option.value
                  ? "border-green-700 bg-green-700 text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {error && (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        {loading && analytics && (
          <p className="mt-2 flex items-center gap-2 text-xs text-gray-500">
            <RefreshCw size={13} className="animate-spin" />
            Updating analytics...
          </p>
        )}
      </div>

      {/* Summary cards */}
      <section
        aria-label="Financial summary"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <MetricCard
          title="Total income"
          value={formatCurrency(totalIncome)}
          icon={TrendingUp}
          iconClass="bg-green-50 text-green-700"
          description="Income in selected period"
        />

        <MetricCard
          title="Total expenses"
          value={formatCurrency(totalExpenses)}
          icon={TrendingDown}
          iconClass="bg-red-50 text-red-600"
          description="Expenses in selected period"
        />

        <MetricCard
          title="Net savings"
          value={formatCurrency(totalSavings)}
          icon={PiggyBank}
          iconClass="bg-blue-50 text-blue-700"
          valueClass={totalSavings >= 0 ? "text-green-700" : "text-red-600"}
          description="Income minus expenses"
        />

        <MetricCard
          title="Savings rate"
          value={`${savingsRate.toFixed(1)}%`}
          icon={Wallet}
          iconClass="bg-gray-100 text-gray-700"
          description="Net savings as a share of income"
          valueClass={savingsRate < 0 ? "text-red-600" : "text-gray-900"}
        />
      </section>

      {/* Income vs expenses */}
      <section className="mt-7 border border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900">Income vs expenses</h2>

          <p className="mt-1 text-sm text-gray-500">
            Compare money coming in with money going out.
          </p>
        </div>

        <div className="p-4 sm:p-5">
          {monthlyData.length === 0 ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
              <BarChart3 size={30} className="text-gray-400" />
              <p className="mt-3 text-sm text-gray-600">
                No transaction data for this period.
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Add transactions to see your trends.
              </p>
            </div>
          ) : (
            <div className="h-[300px] w-full sm:h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyData}
                  margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    stroke="#e5e7eb"
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={formatShortCurrency}
                    tickLine={false}
                    axisLine={false}
                    width={58}
                  />

                  <Tooltip content={<CurrencyTooltip />} />
                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="income"
                    name="Income"
                    stroke="#16a34a"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />

                  <Line
                    type="monotone"
                    dataKey="expenses"
                    name="Expenses"
                    stroke="#dc2626"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </section>

      {/* Spending charts */}
      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <section className="min-w-0 border border-gray-200 bg-white">
          <div className="border-b border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900">
              Spending by category
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              See how your expenses are distributed.
            </p>
          </div>

          <div className="p-4 sm:p-5">
            {pieData.length === 0 ? (
              <div className="flex min-h-[260px] items-center justify-center text-center">
                <p className="text-sm text-gray-500">
                  No expense data for this period.
                </p>
              </div>
            ) : (
              <>
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={58}
                        outerRadius={95}
                        paddingAngle={2}
                      >
                        {pieData.map((item, index) => (
                          <Cell
                            key={item.name}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>

                      <Tooltip formatter={(value) => formatCurrency(value)} />

                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-3 space-y-3">
                  {pieData.slice(0, 5).map((item, index) => {
                    const percentage =
                      totalExpenses > 0
                        ? (item.value / totalExpenses) * 100
                        : 0;

                    return (
                      <div key={item.name}>
                        <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                          <span className="truncate text-gray-700">
                            {item.name}
                          </span>

                          <span className="shrink-0 font-medium text-gray-900">
                            {formatCurrency(item.value)}
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden bg-gray-100">
                          <div
                            className="h-full"
                            style={{
                              width: `${Math.min(percentage, 100)}%`,
                              backgroundColor:
                                CHART_COLORS[index % CHART_COLORS.length],
                            }}
                          />
                        </div>

                        <p className="mt-1 text-right text-xs text-gray-500">
                          {percentage.toFixed(1)}% of total income-period
                          expenses
                        </p>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </section>

        {/* Monthly spending */}
        <section className="min-w-0 border border-gray-200 bg-white">
          <div className="border-b border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900">Spending trend</h2>

            <p className="mt-1 text-sm text-gray-500">
              See how your expenses change over the selected period.
            </p>
          </div>

          <div className="p-4 sm:p-5">
            {monthlyData.length === 0 ? (
              <div className="flex min-h-[260px] items-center justify-center text-center">
                <p className="text-sm text-gray-500">
                  No spending data available yet.
                </p>
              </div>
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyData}
                    margin={{ top: 10, right: 8, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      stroke="#e5e7eb"
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      interval="preserveStartEnd"
                    />

                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={formatShortCurrency}
                      tickLine={false}
                      axisLine={false}
                      width={58}
                    />

                    <Tooltip content={<CurrencyTooltip />} />

                    <Bar
                      dataKey="expenses"
                      name="Expenses"
                      fill="#374151"
                      maxBarSize={36}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Top categories */}
      <section className="mt-5 border border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900">
            Top spending categories
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Your five biggest expense categories for this period.
          </p>
        </div>

        <div className="p-5">
          {topCategories.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              No spending data available for this period.
            </p>
          ) : (
            <div className="space-y-5">
              {topCategories.slice(0, 5).map((item, index) => {
                const amount = Number(item.total || 0);

                const percentage =
                  totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;

                return (
                  <div key={`${item.category}-${index}`}>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center bg-gray-100 text-xs font-semibold text-gray-600">
                          {index + 1}
                        </div>

                        <span className="truncate text-sm font-medium text-gray-800">
                          {item.category || "Other"}
                        </span>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          {formatCurrency(amount)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {percentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    <div className="ml-10 h-2 overflow-hidden bg-gray-100">
                      <div
                        className="h-full bg-gray-800"
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

      {/* Basic insight */}
      <section className="mt-5 border border-gray-200 bg-white p-5">
        <div className="flex items-start gap-3">
          <div className="shrink-0 bg-green-50 p-2 text-green-700">
            <PiggyBank size={20} />
          </div>

          <div>
            <h2 className="font-semibold text-gray-900">
              Your spending snapshot
            </h2>

            {totalIncome === 0 && totalExpenses === 0 ? (
              <p className="mt-2 text-sm text-gray-600">
                Add income and expense transactions to start getting useful
                financial insights.
              </p>
            ) : totalSavings < 0 ? (
              <p className="mt-2 text-sm text-gray-600">
                Your expenses exceed your income by{" "}
                <strong>{formatCurrency(Math.abs(totalSavings))}</strong> during
                this period. Review your largest expense categories to find
                possible savings.
              </p>
            ) : (
              <p className="mt-2 text-sm text-gray-600">
                You kept <strong>{savingsRate.toFixed(1)}%</strong> of your
                recorded income after expenses in this period.
                {highestCategory && (
                  <>
                    {" "}
                    Your largest expense category is{" "}
                    <strong>{highestCategory.category}</strong>, at{" "}
                    <strong>{formatCurrency(highestCategory.total)}</strong>.
                  </>
                )}
              </p>
            )}

            <p className="mt-2 text-xs text-gray-500">
              Based on recorded transactions only.
            </p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

export default Analytics;
