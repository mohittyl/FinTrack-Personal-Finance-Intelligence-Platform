// MEMBER 1: profile, change password, admin panel
pages.profile = async () => {
  try {
    const me = await api("/api/auth/me");
    $("pName").value = me.name;
    $("pEmail").textContent = me.email + " • " + me.role;
  } catch (e) { toast(e.message); }
};

$("pSave").onclick = async () => {
  try {
    const r = await api("/api/auth/me", "PUT", { name: $("pName").value });
    localStorage.setItem("name", r.name);
    $("userName").textContent = "Hi, " + r.name;
    $("pMsg").textContent = ""; toast("Name updated");
  } catch (e) { $("pMsg").textContent = e.message; }
};

$("passSave").onclick = async () => {
  try {
    await api("/api/auth/password", "PUT", { oldPassword: $("oldPass").value, newPassword: $("newPass").value });
    $("passMsg").textContent = ""; $("oldPass").value = ""; $("newPass").value = ""; toast("Password changed");
  } catch (e) { $("passMsg").textContent = e.message; }
};

pages.admin = async () => {
  try {
    const users = await api("/api/admin/users");
    $("aList").innerHTML = users.map((u) => `
      <tr><td>${u.id}</td><td>${esc(u.name)}</td><td>${esc(u.email)}</td><td>${u.role}</td>
      <td>${u._count.transactions}</td>
      <td>${u.role === "admin" ? "" : `<button class="del" onclick="deleteUser(${u.id})">🗑️</button>`}</td></tr>`).join("");
  } catch (e) { toast(e.message); }
};

async function deleteUser(id) {
  if (!confirm("Delete this user and all their data?")) return;
  try { await api("/api/admin/users/" + id, "DELETE"); pages.admin(); } catch (e) { toast(e.message); }
}
