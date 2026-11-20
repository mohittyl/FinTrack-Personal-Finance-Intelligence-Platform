// MEMBER 4: dashboard + monthly report + charts
const charts = {};
function drawChart(id, config) {
  if (charts[id]) charts[id].destroy();
  config.options = { maintainAspectRatio: false, ...(config.options || {}) };
  charts[id] = new Chart($(id), config);
}

function drawCharts(report, trend, p) {
  const cats = Object.keys(report.byCategory);
  drawChart(p + "Pie", {
    type: "doughnut",
    data: { labels: cats, datasets: [{ data: cats.map((c) => report.byCategory[c]) }] },
  });
  drawChart(p + "Trend", {
    type: "bar",
    data: {
      labels: trend.map((x) => x.month),
      datasets: [
        { label: "Income", data: trend.map((x) => x.income), backgroundColor: "#16a34a" },
        { label: "Expense", data: trend.map((x) => x.expense), backgroundColor: "#dc2626" },
      ],
    },
  });
}

pages.dashboard = async function () {
  try {
    const m = thisMonth();
    const [r, t, b] = await Promise.all([
      api("/api/reports/monthly?month=" + m),
      api("/api/reports/trend"),
      api("/api/budgets?month=" + m),
    ]);
    $("dIncome").textContent = money(r.income);
    $("dExpense").textContent = money(r.expense);
    $("dBalance").textContent = money(r.balance);
    const over = b.filter((x) => x.spent > x.limit);
    $("dAlert").innerHTML = over.length ? "⚠️ Budget cross ho gaya: " + over.map((x) => esc(x.category)).join(", ") : "";
    $("dAlert").style.display = over.length ? "block" : "none";
    drawCharts(r, t, "d");
  } catch (e) { toast(e.message); }
};

async function loadReport() {
  try {
    const month = $("rMonth").value || thisMonth();
    const [r, t] = await Promise.all([api("/api/reports/monthly?month=" + month), api("/api/reports/trend")]);
    $("rIncome").textContent = money(r.income);
    $("rExpense").textContent = money(r.expense);
    $("rBalance").textContent = money(r.balance);
    const rows = Object.entries(r.byCategory).sort((a, b) => b[1] - a[1]);
    $("rTable").innerHTML = rows.length
      ? rows.map(([c, a]) => `<tr><td>${esc(c)}</td><td>${money(a)}</td><td>${Math.round((a / r.expense) * 100)}%</td></tr>`).join("")
      : `<tr><td colspan="3">No expenses this month</td></tr>`;
    drawCharts(r, t, "r");
  } catch (e) { toast(e.message); }
}

pages.reports = () => { if (!$("rMonth").value) $("rMonth").value = thisMonth(); loadReport(); };
$("rLoad").onclick = loadReport;
$("rPrint").onclick = () => window.print(); // choose "Save as PDF" in the print window
