// ============================================================
// LOGIN & REGISTER SCRIPT (index.html)
// ============================================================

var mode = "login"; // "login" ya "register"

// Agar pehle se logged in hai toh seedha profile.html pe redirect karo
if (localStorage.getItem("token")) {
  location.href = "profile.html";
}

function $(id) {
  return document.getElementById(id);
}

// Tab toggle (Login <-> Register)
function setMode(newMode) {
  mode = newMode;

  var nameWrapper = $("nameWrapper");

  if (mode === "register") {
    if (nameWrapper) {
      nameWrapper.style.display = "block";
    }
    $("name").style.display = "block";
    $("submitBtn").innerHTML = "Create Account <span>→</span>";
    $("tabRegister").classList.add("active");
    $("tabLogin").classList.remove("active");
  } else {
    if (nameWrapper) {
      nameWrapper.style.display = "none";
    }
    $("name").style.display = "none";
    $("submitBtn").innerHTML = "Sign In <span>→</span>";
    $("tabLogin").classList.add("active");
    $("tabRegister").classList.remove("active");
  }

  $("msg").textContent = "";
}

$("tabLogin").onclick = function () {
  setMode("login");
};

$("tabRegister").onclick = function () {
  setMode("register");
};

// Form submit function
async function submit() {
  var email = $("email").value.trim();
  var password = $("password").value;

  var body = {
    email: email,
    password: password
  };

  if (mode === "register") {
    body.name = $("name").value.trim();
  }

  try {
    var res = await fetch("/api/auth/" + mode, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    var data = await res.json();

    if (!res.ok) {
      $("msg").textContent = data.error || "An error occurred";
      return;
    }

    // Token aur details save karo
    localStorage.setItem("token", data.token);
    localStorage.setItem("name", data.name);
    localStorage.setItem("role", data.role);

    // Profile page pe redirect karo
    location.href = "profile.html";
  } catch (err) {
    $("msg").textContent = "Unable to connect to server";
  }
}

$("submitBtn").onclick = submit;

// Password box mein Enter dabane par submit ho
$("password").onkeydown = function (e) {
  if (e.key === "Enter") {
    submit();
  }
};
