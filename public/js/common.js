// Shared helpers used by everyone
const $ = (id) => document.getElementById(id);
const token = localStorage.getItem("token");
if (!token) location.href = "index.html";

const CATEGORIES = ["Food", "Travel", "Shopping", "Bills", "Education", "Health", "Entertainment", "Salary", "Pocket Money", "Other"];
const money = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const thisMonth = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; };
const today = () => new Date().toISOString().slice(0, 10);

async function api(url, method = "GET", body) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401) { logout(); throw new Error("Please log in again"); }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data;
}

function logout() { localStorage.clear(); location.href = "index.html"; }

function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2500);
}

// each module registers a loader here: pages.budgets = loadBudgets
const pages = {};
function show(page) {
  document.querySelectorAll(".page").forEach((p) => (p.style.display = p.id === "page-" + page ? "block" : "none"));
  document.querySelectorAll(".nav button").forEach((b) => b.classList.toggle("active", b.dataset.page === page));
  if (pages[page]) pages[page]();
}

function fillCategories() {
  const opts = CATEGORIES.map((c) => `<option>${c}</option>`).join("");
  document.querySelectorAll("select.cat").forEach((s) => (s.innerHTML = opts));
  document.querySelectorAll("select.cat-filter").forEach((s) => (s.innerHTML = `<option value="">All categories</option>` + opts));
}
