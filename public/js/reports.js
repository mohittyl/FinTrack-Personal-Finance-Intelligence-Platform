// ============================================================
// MEMBER 4: Financial Dashboard & Reports Script
// Features: Dashboard KPIs, Category Analysis, Charts, Monthly Reports, PDF Export
// ============================================================

requireLogin();
renderNavbar();

var CATEGORY_COLORS = {
  Food: "#f59e0b",
  Travel: "#3b82f6",
  Shopping: "#ec4899",
  Bills: "#ef4444",
  Education: "#8b5cf6",
  Health: "#10b981",
  Entertainment: "#f97316",
  Salary: "#14b8a6",
  "Pocket Money": "#06b6d4",
  Other: "#6b7280"
};

var FALLBACK_PALETTE = [
  "#4f46e5", "#06b6d4", "#f59e0b", "#ec4899", "#10b981",
  "#8b5cf6", "#f97316", "#3b82f6", "#ef4444", "#14b8a6"
];

function getCategoryColor(cat, idx) {
  return CATEGORY_COLORS[cat] || FALLBACK_PALETTE[(idx || 0) % FALLBACK_PALETTE.length];
}

function thisMonth() {
  var d = new Date();
  var y = d.getFullYear();
  var m = String(d.getMonth() + 1).padStart(2, "0");
  return y + "-" + m;
}

var charts = {};

function drawChart(id, config) {
  if (charts[id]) {
    try { charts[id].destroy(); } catch (e) {}
  }
  var canvas = $(id);
  if (!canvas) return;
  config.options = Object.assign({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { boxWidth: 12, padding: 10, font: { size: 12 } }
      }
    }
  }, config.options || {});
  charts[id] = new Chart(canvas, config);
}

function drawCategoryPie(id, byCategory) {
  var cats = Object.keys(byCategory || {});
  if (cats.length === 0) {
    drawChart(id, {
      type: "doughnut",
      data: {
        labels: ["No expenses recorded"],
        datasets: [{ data: [1], backgroundColor: ["#e2e8f0"], borderWidth: 0 }]
      },
      options: {
        cutout: "60%",
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function () { return " No expenses recorded for this month"; }
            }
          }
        }
      }
    });
    return;
  }

  var colors = cats.map(function (c, i) { return getCategoryColor(c, i); });
  var data = cats.map(function (c) { return byCategory[c]; });
  var total = data.reduce(function (a, b) { return a + b; }, 0);

  drawChart(id, {
    type: "doughnut",
    data: {
      labels: cats,
      datasets: [
        {
          data: data,
          backgroundColor: colors,
          hoverOffset: 4,
          borderWidth: 2,
          borderColor: "#ffffff"
        }
      ]
    },
    options: {
      cutout: "60%",
      plugins: {
        tooltip: {
          callbacks: {
            label: function (ctx) {
              var val = ctx.parsed || 0;
              var pct = total > 0 ? Math.round((val / total) * 100) : 0;
              return " " + ctx.label + ": " + money(val) + " (" + pct + "%)";
            }
          }
        }
      }
    }
  });
}

function drawTrendChart(id, trend) {
  var list = Array.isArray(trend) ? trend : [];
  drawChart(id, {
    type: "bar",
    data: {
      labels: list.map(function (x) { return x.label || x.month; }),
      datasets: [
        {
          label: "Income",
          data: list.map(function (x) { return x.income; }),
          backgroundColor: "#10b981",
          hoverBackgroundColor: "#059669",
          borderRadius: 4
        },
        {
          label: "Expense",
          data: list.map(function (x) { return x.expense; }),
          backgroundColor: "#ef4444",
          hoverBackgroundColor: "#dc2626",
          borderRadius: 4
        }
      ]
    },
    options: {
      scales: {
        x: { grid: { display: false } },
        y: {
          beginAtZero: true,
          grid: { color: "#f1f5f9" },
          ticks: {
            callback: function (v) { return money(v); }
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function (ctx) {
              return " " + ctx.dataset.label + ": " + money(ctx.parsed.y);
            }
          }
        }
      }
    }
  });
}

// ---------------- 1. DASHBOARD CONTROLLER ----------------
async function loadDashboard() {
  try {
    var m = thisMonth();
    var results = await Promise.all([
      api("/api/reports/dashboard?month=" + m),
      api("/api/reports/trend?months=6")
    ]);
    var dash = results[0];
    var trend = results[1];

    $("dIncome").textContent = money(dash.summary.income);
    $("dExpense").textContent = money(dash.summary.expense);
    $("dBalance").textContent = money(dash.summary.balance);
    if ($("dSavingsRate")) $("dSavingsRate").textContent = (dash.summary.savingsRate || 0) + "%";
    if ($("dMonthLabel")) $("dMonthLabel").textContent = "Financial performance for " + (dash.monthLabel || m);

    // Alert for budget overruns
    var over = dash.budgetAlerts || [];
    if (over.length > 0) {
      $("dAlert").innerHTML = "⚠️ <strong>Budget Warning:</strong> Spending exceeded in " +
        over.map(function (x) { return esc(x.category) + " (" + money(x.spent) + " / limit " + money(x.limit) + ")"; }).join(", ");
      $("dAlert").style.display = "block";
    } else {
      $("dAlert").style.display = "none";
    }

    // Insights strip
    var catKeys = Object.keys(dash.byCategory || {});
    var topCatName = "-", topCatAmt = 0;
    for (var i = 0; i < catKeys.length; i++) {
      var c = catKeys[i];
      if (dash.byCategory[c] > topCatAmt) {
        topCatAmt = dash.byCategory[c];
        topCatName = c;
      }
    }
    if ($("dTopCat")) {
      $("dTopCat").textContent = topCatAmt > 0 ? topCatName + " (" + money(topCatAmt) + ")" : "None";
    }

    var expTxs = (dash.recentTransactions || []).filter(function (t) { return t.type === "expense"; });
    var largestTx = expTxs.sort(function (a, b) { return b.amount - a.amount; })[0];
    if ($("dLargestExp")) {
      $("dLargestExp").textContent = largestTx ? largestTx.title + " (" + money(largestTx.amount) + ")" : "None";
    }
    if ($("dTxCount")) {
      $("dTxCount").textContent = String(dash.summary.count || 0);
    }

    // Draw charts
    drawCategoryPie("dPie", dash.byCategory || {});
    drawTrendChart("dTrend", trend || []);

    // Recent Transactions Table
    if ($("dRecentList")) {
      var recents = dash.recentTransactions || [];
      $("dRecentList").innerHTML = recents.length
        ? recents.map(function (t) {
            var isInc = t.type === "income";
            var dateStr = (t.date || "").slice(0, 10);
            return (
              "<tr>" +
              "  <td>" + dateStr + "</td>" +
              "  <td><strong>" + esc(t.title) + "</strong></td>" +
              '  <td><span class="cat-dot" style="background:' + getCategoryColor(t.category) + '"></span>' + esc(t.category) + "</td>" +
              '  <td style="text-align:right;" class="' + (isInc ? "income-text" : "expense-text") + '">' +
                   (isInc ? "+" : "-") + money(t.amount) +
              "  </td>" +
              "</tr>"
            );
          }).join("")
        : '<tr><td colspan="4" class="muted" style="text-align:center;">No recent transactions. Add income or expenses to see them here!</td></tr>';
    }

  } catch (err) {
    toast(err.message);
  }
}

// ---------------- 2. MONTHLY REPORTS CONTROLLER ----------------
async function loadReport() {
  try {
    var month = $("rMonth").value || thisMonth();
    var results = await Promise.all([
      api("/api/reports/monthly?month=" + month),
      api("/api/reports/trend?months=6")
    ]);
    var r = results[0];
    var trend = results[1];

    $("rIncome").textContent = money(r.income);
    $("rExpense").textContent = money(r.expense);
    $("rBalance").textContent = money(r.balance);
    if ($("rSavingsRate")) $("rSavingsRate").textContent = (r.savingsRate || 0) + "%";
    if ($("rIncomeCount")) $("rIncomeCount").textContent = (r.incomeCount || 0) + " entries";
    if ($("rExpenseCount")) $("rExpenseCount").textContent = (r.expenseCount || 0) + " entries";
    if ($("rBalanceLabel")) $("rBalanceLabel").textContent = r.balance >= 0 ? "Net Surplus" : "Net Deficit";
    if ($("rSavingsBadge")) $("rSavingsBadge").textContent = r.savingsRate >= 20 ? "Target met (≥20%)" : "Below target (<20%)";

    // Executive Summary narrative
    if ($("rSummaryHeading")) $("rSummaryHeading").textContent = "Financial Statement — " + r.monthLabel;
    if ($("rSummaryText")) {
      var narrative = "In <strong>" + esc(r.monthLabel) + "</strong>, you earned <strong>" + money(r.income) +
        "</strong> and spent <strong>" + money(r.expense) + "</strong>, generating a net savings balance of <strong>" +
        money(r.balance) + "</strong> with an overall savings rate of <strong>" + r.savingsRate + "%</strong>. ";

      if (r.topExpenseCategory) {
        narrative += "Your primary expenditure category was <strong>" + esc(r.topExpenseCategory.category) +
          "</strong> (" + money(r.topExpenseCategory.amount) + ", accounting for " + r.topExpenseCategory.share + "% of total spend). ";
      }
      if (r.largestExpense) {
        narrative += 'The single largest expense was "' + esc(r.largestExpense.title) + '" at <strong>' + money(r.largestExpense.amount) + "</strong>. ";
      }
      if (r.balance >= 0 && r.savingsRate >= 20) {
        narrative += '<br><span style="color:#065f46; font-weight:600;">✨ Excellent financial health: Positive cash flow achieved and recommended savings target met.</span>';
      } else if (r.balance >= 0) {
        narrative += '<br><span style="color:#92400e; font-weight:600;">💡 Positive cash flow achieved, though savings rate is below the 20% benchmark.</span>';
      } else {
        narrative += '<br><span style="color:#991b1b; font-weight:600;">⚠️ Deficit warning: Spending exceeded monthly income by ' + money(Math.abs(r.balance)) + ".</span>";
      }
      $("rSummaryText").innerHTML = narrative;
    }

    // Comparison tags
    if ($("rComparisonTags")) {
      var tagsHtml = "";
      if (r.comparison && r.comparison.prevExpense > 0) {
        var signE = r.comparison.expenseDiff >= 0 ? "+" : "";
        var iconE = r.comparison.expenseDiff >= 0 ? "🔺" : "🔻";
        tagsHtml += '<span class="comp-tag">' + iconE + " Spending: " + signE + money(r.comparison.expenseDiff) +
          " (" + signE + (r.comparison.expenseChangePct || 0) + "%) vs " + esc(r.comparison.prevMonthLabel) + "</span>";
      }
      if (r.comparison && r.comparison.prevIncome > 0) {
        var signI = r.comparison.incomeDiff >= 0 ? "+" : "";
        var iconI = r.comparison.incomeDiff >= 0 ? "🔺" : "🔻";
        tagsHtml += '<span class="comp-tag">' + iconI + " Income: " + signI + money(r.comparison.incomeDiff) +
          " (" + signI + (r.comparison.incomeChangePct || 0) + "%) vs " + esc(r.comparison.prevMonthLabel) + "</span>";
      }
      $("rComparisonTags").innerHTML = tagsHtml;
    }

    // Draw Report Charts
    drawCategoryPie("rPie", r.byCategory || {});
    drawTrendChart("rTrend", trend || []);

    // Category-wise Expense Analysis Table
    var cats = r.categoryAnalysis || [];
    if ($("rTotalCategories")) $("rTotalCategories").textContent = cats.length + " categories";
    if ($("rTable")) {
      $("rTable").innerHTML = cats.length
        ? cats.map(function (c, i) {
            var color = getCategoryColor(c.category, i);
            var budgetBadge = '<span class="badge badge-gray">No budget</span>';
            if (c.budget !== null) {
              if (c.isOverBudget) {
                budgetBadge = '<span class="badge badge-red">⚠️ Over by ' + money(c.amount - c.budget) + "</span>";
              } else {
                budgetBadge = '<span class="badge badge-green">✓ Under (' + money(c.remaining) + " left)</span>";
              }
            }
            return (
              "<tr>" +
              '  <td><span class="cat-dot" style="background:' + color + '"></span><strong>' + esc(c.category) + "</strong></td>" +
              "  <td><strong>" + money(c.amount) + "</strong></td>" +
              "  <td>" +
              '    <div class="progress-cell">' +
              '      <div class="progress-track"><div class="progress-fill" style="width:' + c.share + "%; background:" + color + ';"></div></div>' +
              '      <span style="font-size:12px; font-weight:700; min-width:38px;">' + c.share + "%</span>" +
              "    </div>" +
              "  </td>" +
              "  <td>" + c.count + "</td>" +
              "  <td>" + money(c.avg) + "</td>" +
              "  <td>" + budgetBadge + "</td>" +
              "</tr>"
            );
          }).join("")
        : '<tr><td colspan="6" class="muted" style="text-align:center;">No expenses recorded for this month.</td></tr>';
    }

    // Income Sources Table
    if ($("rIncomeTable")) {
      var incEntries = Object.entries(r.incomeByCategory || {}).sort(function (a, b) { return b[1] - a[1]; });
      $("rIncomeTable").innerHTML = incEntries.length
        ? incEntries.map(function (entry, i) {
            var source = entry[0];
            var amt = entry[1];
            var share = r.income > 0 ? Number(((amt / r.income) * 100).toFixed(1)) : 0;
            var color = getCategoryColor(source, i);
            return (
              "<tr>" +
              '  <td><span class="cat-dot" style="background:' + color + '"></span><strong>' + esc(source) + "</strong></td>" +
              "  <td><strong>" + money(amt) + "</strong></td>" +
              "  <td>" +
              '    <div class="progress-cell">' +
              '      <div class="progress-track"><div class="progress-fill" style="width:' + share + '%; background:#10b981;"></div></div>' +
              '      <span style="font-size:12px; font-weight:700; min-width:38px;">' + share + "%</span>" +
              "    </div>" +
              "  </td>" +
              "</tr>"
            );
          }).join("")
        : '<tr><td colspan="3" class="muted" style="text-align:center;">No income recorded for this month.</td></tr>';
    }

    // Monthly Transaction Ledger Table
    if ($("rLedgerTable")) {
      var txs = r.transactions || [];
      if ($("rLedgerCount")) $("rLedgerCount").textContent = txs.length + " transactions";
      $("rLedgerTable").innerHTML = txs.length
        ? txs.map(function (t) {
            var isInc = t.type === "income";
            var dateStr = (t.date || "").slice(0, 10);
            return (
              "<tr>" +
              "  <td>" + dateStr + "</td>" +
              "  <td><strong>" + esc(t.title) + "</strong></td>" +
              '  <td><span class="cat-dot" style="background:' + getCategoryColor(t.category) + '"></span>' + esc(t.category) + "</td>" +
              '  <td><span class="badge ' + (isInc ? "badge-green" : "badge-red") + '">' + t.type + "</span></td>" +
              '  <td style="text-align:right;" class="' + (isInc ? "income-text" : "expense-text") + '">' +
                   (isInc ? "+" : "-") + money(t.amount) +
              "  </td>" +
              "</tr>"
            );
          }).join("")
        : '<tr><td colspan="5" class="muted" style="text-align:center;">No transactions recorded for this month.</td></tr>';
    }

    // Print Metadata
    if ($("printReportTitle")) $("printReportTitle").textContent = "Financial Statement — " + r.monthLabel;
    if ($("printPreparedFor")) $("printPreparedFor").textContent = "Prepared for: " + (localStorage.getItem("name") || "Account Holder");
    if ($("printGeneratedDate")) $("printGeneratedDate").textContent = "Generated on: " + new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });

  } catch (err) {
    toast(err.message);
  }
}

// ---------------- 3. VIEW SWITCHER & PDF/PRINT ACTIONS ----------------
function switchView(viewName) {
  var isDash = viewName === "dashboard";
  $("viewDashboard").style.display = isDash ? "block" : "none";
  $("viewReports").style.display = isDash ? "none" : "block";

  $("tabDashView").classList.toggle("active", isDash);
  $("tabRepView").classList.toggle("active", !isDash);

  if (isDash) {
    loadDashboard();
  } else {
    if (!$("rMonth").value) $("rMonth").value = thisMonth();
    loadReport();
  }
}

if ($("rLoad")) {
  $("rLoad").onclick = loadReport;
}

// Print / Save as PDF
if ($("rPrint")) {
  $("rPrint").onclick = function () {
    window.print();
  };
}

// Download PDF button (html2pdf direct download with fallback to print)
if ($("rDownloadPdf")) {
  $("rDownloadPdf").onclick = async function () {
    var month = $("rMonth").value || thisMonth();
    var fileName = "FinTrack_Statement_" + month + ".pdf";

    if (window.html2pdf) {
      toast("Generating PDF report...");
      var element = $("reportPrintArea");
      var opt = {
        margin: [10, 10, 10, 10],
        filename: fileName,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] }
      };
      try {
        await html2pdf().set(opt).from(element).save();
        toast("PDF downloaded successfully!");
        return;
      } catch (err) {
        console.warn("html2pdf error, fallback to print:", err);
      }
    }

    toast("Opening print dialog. Select 'Save as PDF' to save.");
    window.print();
  };
}

// Initial view load
if ($("currentMonthBadge")) {
  $("currentMonthBadge").textContent = "📅 " + thisMonth();
}
switchView("dashboard");
