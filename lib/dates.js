// ============================================================
// DATE HELPERS (Used for Monthly Reports & Trends)
// ============================================================

// "2026-11" -> { start: 1 Nov 00:00:00, end: 1 Dec 00:00:00 }
function monthRange(month) {
  var parts = (month || "").split("-").map(Number);
  var y = parts[0] || new Date().getFullYear();
  var m = parts[1] || (new Date().getMonth() + 1);
  return {
    start: new Date(y, m - 1, 1),
    end: new Date(y, m, 1)
  };
}

function monthKey(d) {
  var dateObj = d instanceof Date ? d : new Date(d);
  var y = dateObj.getFullYear();
  var m = String(dateObj.getMonth() + 1).padStart(2, "0");
  return y + "-" + m;
}

function currentMonth() {
  return monthKey(new Date());
}

module.exports = {
  monthRange: monthRange,
  monthKey: monthKey,
  currentMonth: currentMonth
};
