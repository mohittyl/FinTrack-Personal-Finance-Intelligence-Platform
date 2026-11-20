$("userName").textContent = "Hi, " + localStorage.getItem("name");
if (localStorage.getItem("role") !== "admin") $("navAdmin").style.display = "none";
$("logoutBtn").onclick = logout;
document.querySelectorAll(".nav button").forEach((b) => (b.onclick = () => show(b.dataset.page)));
fillCategories();
show("dashboard");
