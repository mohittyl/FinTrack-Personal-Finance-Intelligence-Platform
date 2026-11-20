// "2026-11" -> { start: 1 Nov, end: 1 Dec }
function monthRange(month) {
  const [y, m] = month.split("-").map(Number);
  return { start: new Date(y, m - 1, 1), end: new Date(y, m, 1) };
}
function monthKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function currentMonth() {
  return monthKey(new Date());
}
module.exports = { monthRange, monthKey, currentMonth };
