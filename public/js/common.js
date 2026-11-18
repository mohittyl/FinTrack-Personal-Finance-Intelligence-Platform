// ============================================================
// COMMON JAVASCRIPT HELPERS (Used across Profile and Admin pages)
// ============================================================

// Shortcut function for document.getElementById
function $(id) {
  return document.getElementById(id);
}

// XSS safety: escape HTML characters
function esc(text) {
  var div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Logout user: clear storage and redirect to login page
function logout() {
  localStorage.clear();
  location.href = "index.html";
}

// API request helper with JWT Authorization token
async function api(url, method, body) {
  if (!method) {
    method = "GET";
  }

  var token = localStorage.getItem("token");

  var res = await fetch(url, {
    method: method,
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: body ? JSON.stringify(body) : undefined
  });

  // Agar 401 Unauthorized aaye toh logout kar do
  if (res.status === 401) {
    logout();
    throw new Error("Session expired. Please log in again.");
  }

  var data = {};
  try {
    data = await res.json();
  } catch (err) {
    data = {};
  }

  if (!res.ok) {
    throw new Error(data.error || "An error occurred");
  }

  return data;
}

// Toast notification pop-up
function toast(msg) {
  var t = $("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(function () {
    t.classList.remove("show");
  }, 2600);
}

// Protected page guard: agar token nahi hai toh index.html pe bhejo
function requireLogin() {
  if (!localStorage.getItem("token")) {
    location.href = "index.html";
  }
}

// Modern SaaS Navbar render helper
function renderNavbar() {
  var navbar = $("navbar");
  if (!navbar) return;

  var isAdmin = localStorage.getItem("role") === "admin";
  var currentPath = window.location.pathname;

  var isDashboard = currentPath.indexOf("dashboard") !== -1;
  var isProfile = currentPath.indexOf("profile") !== -1;
  var isAdminPage = currentPath.indexOf("admin") !== -1;

  var dashboardClass = isDashboard ? "nav-link active" : "nav-link";
  var profileClass = isProfile ? "nav-link active" : "nav-link";
  var adminClass = isAdminPage ? "nav-link active" : "nav-link";

  var adminLink = isAdmin
    ? '<a href="admin.html" class="' + adminClass + '"><span>🛡️</span> Admin</a>'
    : "";

  navbar.innerHTML =
    '<div class="navbar-brand">' +
    '  <div class="brand-icon">💰</div>' +
    '  <span>FinTrack</span>' +
    '</div>' +
    '<div class="navbar-menu">' +
    '  <a href="dashboard.html" class="' + dashboardClass + '"><span>📊</span> Dashboard</a>' +
    '  <a href="profile.html" class="' + profileClass + '"><span>👤</span> Profile</a>' +
    "  " + adminLink +
    '  <div class="navbar-divider"></div>' +
    '  <button class="btn small gray" onclick="logout()">🚪 Sign Out</button>' +
    '</div>';
}

// Indian Rupee currency formatter
function money(n) {
  return "₹" + Number(n || 0).toLocaleString("en-IN");
}

// Initials generation for user avatar circle
function getInitials(name) {
  if (!name) return "?";
  var parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
}
