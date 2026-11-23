
import { useEffect, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Wallet,
  BarChart3,
  RefreshCw,
  CalendarDays,
  Sparkles,
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
  "#78866B",
  "#D58B70",
  "#D9B77E",
  "#A5B5A0",
  "#B6A4C7",
  "#D5A5A0",
  "#8FA7B0",
  "#B5A994",
];

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

function MetricCard({
  title,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  description,
  valueColor = "text-[#343A32]",
}) {
  return (
    <div className="rounded-2xl border border-[#EAE7DD] bg-white p-5 shadow-[0_3px_14px_rgba(60,65,45,0.03)] transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#85877C]">{title}</p>
          <p className={`mt-3 break-words text-2xl font-semibold tracking-tight ${valueColor}`}>
            {value}
          </p>
          <p className="mt-2 text-xs text-[#99998F]">{description}</p>
        </div>

        <div className={`rounded-xl p-3 ${iconBg} ${iconColor}`}>
          <Icon size={20} strokeWidth={1.8} />
        </div>
      </div>
    </div>
  );
}

function CurrencyTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-[#EAE7DD] bg-white px-4 py-3 shadow-lg">
      {label && (
        <p className="mb-2 text-xs font-medium text-[#929387]">{label}</p>
      )}

      {payload.map((item, index) => (
        <p
          key={`${item.dataKey || item.name}-${index}`}
          className="text-sm font-semibold text-[#41463C]"
        >
          <span style={{ color: item.color }}>● </span>
          {item.name}: {formatCurrency(item.value)}
        </p>
      ))}
    </div>
  );
}

function SectionHeading({ title, description }) {
  return (
    <div>
      <h2 className="text-base font-semibold text-[#343A32]">{title}</h2>
      <p className="mt-1 text-sm text-[#929387]">{description}</p>
    </div>
  );
}

function Analytics() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [period, setPeriod] = useState("6m");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

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
  }, [period, retryCount]);

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

  const PageShell = ({ children }) => (
    <div className="min-h-screen bg-[#F8F7F1]">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <Navbar onMenuClick={() => setSidebarOpen(true)} />

      <main className="min-h-screen p-4 pt-20 sm:p-6 sm:pt-20 lg:ml-64 lg:p-8 lg:pt-24">
        <div className="mx-auto max-w-[1500px]">{children}</div>
      </main>
    </div>
  );

  if (loading && !analytics) {
    return (
      <PageShell>
        <div className="flex min-h-[60vh] flex-col items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#E6E5D9] border-t-[#78866B]" />
          <p className="mt-4 text-sm font-medium text-[#777A6E]">
            Preparing your financial insights...
          </p>
        </div>
      </PageShell>
    );
  }

  if (error && !analytics) {
    return (
      <PageShell>
        <div className="mx-auto mt-12 max-w-lg rounded-2xl border border-[#EADBD3] bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F8EDE8] text-[#B66F56]">
            <BarChart3 size={25} />
          </div>

          <h2 className="mt-5 text-lg font-semibold text-[#343A32]">
            Unable to load analytics
          </h2>

          <p className="mt-2 text-sm text-[#898B80]">{error}</p>

          <button
            onClick={() => setRetryCount((count) => count + 1)}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#78866B] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#657458]"
          >
            <RefreshCw size={15} />
            Try again
          </button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      {/* Page heading */}
      <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#78866B]">
            <Sparkles size={15} />
            Your financial overview
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-[#343A32]">
            Analytics
          </h1>

          <p className="mt-2 max-w-xl text-sm text-[#898B80]">
            A clearer picture of where your money comes from, where it goes,
            and how much you save.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start rounded-xl border border-[#EAE7DD] bg-white px-4 py-2.5 text-sm text-[#777A6E] sm:self-auto">
          <CalendarDays size={16} className="text-[#78866B]" />
          <span>
            {analytics?.periodLabel ||
              PERIODS.find((item) => item.value === period)?.label}
          </span>
        </div>
      </div>

      {/* Period selector */}
      <section className="mb-7 rounded-2xl border border-[#EAE7DD] bg-white p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-[#41463C]">
              Select time period
            </h2>
            <p className="mt-1 text-xs text-[#99998F]">
              Explore how your finances have changed.
            </p>
          </div>

          {loading && (
            <RefreshCw size={16} className="animate-spin text-[#78866B]" />
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {PERIODS.map((option) => (
            <button
              key={option.value}
              onClick={() => setPeriod(option.value)}
              disabled={loading}
              aria-pressed={period === option.value}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition disabled:cursor-wait disabled:opacity-60 ${
                period === option.value
                  ? "bg-[#78866B] text-white shadow-sm"
                  : "bg-[#F5F4EE] text-[#777A6E] hover:bg-[#EDEDE3]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {error && (
          <p className="mt-3 text-sm text-[#B66F56]" role="alert">
            {error}
          </p>
        )}
      </section>

      {/* Summary cards */}
      <section
        aria-label="Financial summary"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <MetricCard
          title="Total income"
          value={formatCurrency(totalIncome)}
          icon={TrendingUp}
          iconBg="bg-[#EEF2E9]"
          iconColor="text-[#78866B]"
          description="Income in selected period"
          valueColor="text-[#657858]"
        />

        <MetricCard
          title="Total expenses"
          value={formatCurrency(totalExpenses)}
          icon={TrendingDown}
          iconBg="bg-[#F8EDE8]"
          iconColor="text-[#C17D62]"
          description="Expenses in selected period"
          valueColor="text-[#B66F56]"
        />

        <MetricCard
          title="Net savings"
          value={formatCurrency(totalSavings)}
          icon={PiggyBank}
          iconBg="bg-[#F1EDF5]"
          iconColor="text-[#9882A9]"
          description="Income minus expenses"
          valueColor={totalSavings >= 0 ? "text-[#657858]" : "text-[#B66F56]"}
        />

        <MetricCard
          title="Savings rate"
          value={`${savingsRate.toFixed(1)}%`}
          icon={Wallet}
          iconBg="bg-[#F7F0E3]"
          iconColor="text-[#B18D54]"
          description="Net savings as a share of income"
          valueColor={savingsRate < 0 ? "text-[#B66F56]" : "text-[#343A32]"}
        />
      </section>

      {/* Income and expenses */}
      <section className="mt-6 rounded-2xl border border-[#EAE7DD] bg-white p-5 sm:p-6">
        <SectionHeading
          title="Income vs expenses"
          description="Compare the money coming in with the money going out."
        />

        <div className="mt-6">
          {monthlyData.length === 0 ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F1F2EA] text-[#78866B]">
                <BarChart3 size={23} />
              </div>
              <p className="mt-3 text-sm font-medium text-[#55594E]">
                No transaction data yet
              </p>
              <p className="mt-1 text-xs text-[#99998F]">
                Add transactions to see your financial trends.
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
                    stroke="#EFEEE8"
                    strokeDasharray="4 4"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "#929387" }}
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    tick={{ fontSize: 11, fill: "#929387" }}
                    tickFormatter={formatShortCurrency}
                    tickLine={false}
                    axisLine={false}
                    width={58}
                  />

                  <Tooltip content={<CurrencyTooltip />} />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />

                  <Line
                    type="monotone"
                    dataKey="income"
                    name="Income"
                    stroke="#78866B"
                    strokeWidth={3}
                    dot={{ r: 3, fill: "#78866B", strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />

                  <Line
                    type="monotone"
                    dataKey="expenses"
                    name="Expenses"
                    stroke="#D58B70"
                    strokeWidth={3}
                    dot={{ r: 3, fill: "#D58B70", strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </section>

      {/* Category and spending charts */}
      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
        {/* Spending by category */}
        <section className="min-w-0 rounded-2xl border border-[#EAE7DD] bg-white p-5 sm:p-6">
          <SectionHeading
            title="Spending by category"
            description="Understand how your expenses are distributed."
          />

          {pieData.length === 0 ? (
            <div className="flex min-h-[280px] items-center justify-center text-center">
              <p className="text-sm text-[#99998F]">
                No expense data for this period.
              </p>
            </div>
          ) : (
            <>
              <div className="mt-4 h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={62}
                      outerRadius={100}
                      paddingAngle={3}
                    >
                      {pieData.map((item, index) => (
                        <Cell
                          key={item.name}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                          stroke="white"
                          strokeWidth={3}
                        />
                      ))}
                    </Pie>

                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                    />

                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 space-y-4">
                {pieData.slice(0, 5).map((item, index) => {
                  const percentage =
                    totalExpenses > 0
                      ? (item.value / totalExpenses) * 100
                      : 0;

                  return (
                    <div key={item.name}>
                      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                        <div className="flex min-w-0 items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{
                              backgroundColor:
                                CHART_COLORS[index % CHART_COLORS.length],
                            }}
                          />
                          <span className="truncate text-[#66695E]">
                            {item.name}
                          </span>
                        </div>

                        <span className="shrink-0 font-semibold text-[#41463C]">
                          {formatCurrency(item.value)}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-[#F1F0E9]">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(percentage, 100)}%`,
                            backgroundColor:
                              CHART_COLORS[index % CHART_COLORS.length],
                          }}
                        />
                      </div>

                      <p className="mt-1 text-right text-xs text-[#99998F]">
                        {percentage.toFixed(1)}% of expenses
                      </p>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>

        {/* Spending trend */}
        <section className="min-w-0 rounded-2xl border border-[#EAE7DD] bg-white p-5 sm:p-6">
          <SectionHeading
            title="Spending trend"
            description="Track how your expenses change over time."
          />

          {monthlyData.length === 0 ? (
            <div className="flex min-h-[280px] items-center justify-center text-center">
              <p className="text-sm text-[#99998F]">
                No spending data available yet.
              </p>
            </div>
          ) : (
            <div className="mt-5 h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyData}
                  margin={{ top: 10, right: 8, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    stroke="#EFEEE8"
                    strokeDasharray="4 4"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: "#929387" }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />

                  <YAxis
                    tick={{ fontSize: 11, fill: "#929387" }}
                    tickFormatter={formatShortCurrency}
                    tickLine={false}
                    axisLine={false}
                    width={58}
                  />

                  <Tooltip content={<CurrencyTooltip />} />

                  <Bar
                    dataKey="expenses"
                    name="Expenses"
                    fill="#D58B70"
                    radius={[7, 7, 0, 0]}
                    maxBarSize={38}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </div>

      {/* Top categories */}
      <section className="mt-6 rounded-2xl border border-[#EAE7DD] bg-white p-5 sm:p-6">
        <SectionHeading
          title="Top spending categories"
          description="Your five biggest expense categories during this period."
        />

        {topCategories.length === 0 ? (
          <p className="py-10 text-center text-sm text-[#99998F]">
            No spending data available for this period.
          </p>
        ) : (
          <div className="mt-6 space-y-5">
            {topCategories.slice(0, 5).map((item, index) => {
              const amount = Number(item.total || 0);

              const percentage =
                totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;

              return (
                <div key={`${item.category}-${index}`}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#F1F2EA] text-xs font-semibold text-[#78866B]">
                        {index + 1}
                      </div>

                      <span className="truncate text-sm font-medium text-[#55594E]">
                        {item.category || "Other"}
                      </span>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold text-[#41463C]">
                        {formatCurrency(amount)}
                      </p>
                      <p className="text-xs text-[#99998F]">
                        {percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  <div className="ml-11 h-2 overflow-hidden rounded-full bg-[#F1F0E9]">
                    <div
                      className="h-full rounded-full bg-[#78866B]"
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
      </section>

      {/* Financial insight */}
      <section className="mt-6 rounded-2xl border border-[#E4E7D9] bg-[#EFF1E9] p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="shrink-0 rounded-xl bg-white p-3 text-[#78866B] shadow-sm">
            <PiggyBank size={22} strokeWidth={1.8} />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#78866B]">
              Your financial snapshot
            </p>

            <h2 className="mt-1 text-lg font-semibold text-[#343A32]">
              A little perspective on your money
            </h2>

            {totalIncome === 0 && totalExpenses === 0 ? (
              <p className="mt-2 text-sm leading-relaxed text-[#74786B]">
                Add income and expense transactions to start getting useful
                financial insights.
              </p>
            ) : totalSavings < 0 ? (
              <p className="mt-2 text-sm leading-relaxed text-[#74786B]">
                Your expenses exceed your income by{" "}
                <strong className="text-[#B66F56]">
                  {formatCurrency(Math.abs(totalSavings))}
                </strong>{" "}
                during this period. Review your largest expense categories to
                find possible savings.
              </p>
            ) : (
              <p className="mt-2 text-sm leading-relaxed text-[#74786B]">
                You kept{" "}
                <strong className="text-[#657858]">
                  {savingsRate.toFixed(1)}%
                </strong>{" "}
                of your recorded income after expenses in this period.
                {highestCategory && (
                  <>
                    {" "}
                    Your largest expense category is{" "}
                    <strong className="text-[#343A32]">
                      {highestCategory.category}
                    </strong>
                    , at{" "}
                    <strong className="text-[#343A32]">
                      {formatCurrency(highestCategory.total)}
                    </strong>
                    .
                  </>
                )}
              </p>
            )}

            <p className="mt-3 text-xs text-[#929387]">
              Based on recorded transactions only.
            </p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

export default Analytics;
