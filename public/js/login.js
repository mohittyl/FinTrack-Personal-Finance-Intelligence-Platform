let mode = "login";
const $ = (id) => document.getElementById(id);
if (localStorage.getItem("token")) location.href = "dashboard.html";

function setMode(m) {
  mode = m;
  $("name").style.display = m === "register" ? "block" : "none";
  $("submitBtn").textContent = m === "register" ? "Register" : "Login";
  $("tabLogin").classList.toggle("active", m === "login");
  $("tabRegister").classList.toggle("active", m === "register");
  $("msg").textContent = "";
}
$("tabLogin").onclick = () => setMode("login");
$("tabRegister").onclick = () => setMode("register");

$("submitBtn").onclick = async () => {
  const body = { email: $("email").value, password: $("password").value };
  if (mode === "register") body.name = $("name").value;
  const res = await fetch(`/api/auth/${mode}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) return ($("msg").textContent = data.error);
  localStorage.setItem("token", data.token);
  localStorage.setItem("name", data.name);
  localStorage.setItem("role", data.role);
  location.href = "dashboard.html";
};
