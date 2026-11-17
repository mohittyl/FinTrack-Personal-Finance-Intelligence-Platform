// ============================================================
// ADMIN PANEL SCRIPT (admin.html)
// Handles stats loading, user list, search, role toggle, user delete
// ============================================================

requireLogin();

// Check if user has admin role; if not, redirect to profile
if (localStorage.getItem("role") !== "admin") {
  location.href = "profile.html";
}

renderNavbar();

// Load dashboard stats
async function loadStats() {
  try {
    var stats = await api("/api/admin/stats");
    $("sTotal").textContent = stats.total;
    $("sAdmins").textContent = stats.admins;
    $("sUsers").textContent = stats.users;
  } catch (err) {
    console.error("Stats error:", err);
  }
}

// Load all users into the table
async function loadUsers() {
  try {
    var searchText = $("search").value || "";
    var users = await api("/api/admin/users?q=" + encodeURIComponent(searchText));

    if (!users || users.length === 0) {
      $("list").innerHTML = '<tr><td colspan="6" style="text-align:center; color:#64748b; padding:28px;">No users match your search query</td></tr>';
      loadStats();
      return;
    }

    var rows = "";
    for (var i = 0; i < users.length; i++) {
      var u = users[i];
      var joinDate = new Date(u.createdAt).toLocaleDateString();
      var roleText = u.role === "admin" ? "Make User" : "Make Admin";
      var userInitials = getInitials(u.name);

      rows += "<tr>" +
        '<td style="color:#64748b; font-weight:600;">#' + u.id + "</td>" +
        "<td>" +
        '  <div style="display:flex; align-items:center; gap:10px;">' +
        '    <div style="width:32px; height:32px; border-radius:50%; background:#e0e7ff; color:#4338ca; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700;">' + userInitials + "</div>" +
        '    <span style="font-weight:600; color:#0f172a;">' + esc(u.name) + "</span>" +
        "  </div>" +
        "</td>" +
        '<td style="color:#475569;">' + esc(u.email) + "</td>" +
        '<td><span class="badge ' + u.role + '">' + u.role + "</span></td>" +
        '<td style="color:#64748b; font-size:13px;">' + joinDate + "</td>" +
        '<td style="text-align:right;">' +
        '  <button class="btn small gray" onclick="toggleRole(' + u.id + ", '" + u.role + '\')">' + roleText + "</button> " +
        '  <button class="btn small danger" onclick="removeUser(' + u.id + ')">Delete</button>' +
        "</td>" +
        "</tr>";
    }

    $("list").innerHTML = rows;
    loadStats();
  } catch (err) {
    toast(err.message);
  }
}

// Toggle role: admin <-> user
async function toggleRole(id, currentRole) {
  try {
    var newRole = currentRole === "admin" ? "user" : "admin";
    await api("/api/admin/users/" + id + "/role", "PUT", { role: newRole });
    toast("User role changed to " + newRole);
    loadUsers();
  } catch (err) {
    toast(err.message);
  }
}

// Delete a user
async function removeUser(id) {
  if (!confirm("Are you sure you want to permanently delete this user?")) {
    return;
  }

  try {
    await api("/api/admin/users/" + id, "DELETE");
    toast("User deleted successfully");
    loadUsers();
  } catch (err) {
    toast(err.message);
  }
}

// Search button click & Enter key
$("searchBtn").onclick = loadUsers;
$("search").onkeydown = function (e) {
  if (e.key === "Enter") {
    loadUsers();
  }
};

// Initial load
loadUsers();
