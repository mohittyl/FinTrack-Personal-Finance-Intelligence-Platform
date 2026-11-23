// ============================================================
// PROFILE PAGE SCRIPT (profile.html)
// Handles profile display, name update, password change, account deletion
// ============================================================

requireLogin();
renderNavbar();

// Load profile details on startup
async function loadProfile() {
  try {
    var me = await api("/api/auth/me");
    $("pName").value = me.name;

    var displayName = $("displayName");
    if (displayName) {
      displayName.textContent = me.name;
    }

    var joinDate = new Date(me.createdAt).toLocaleDateString();
    var roleBadge = '<span class="badge ' + me.role + '">' + me.role + '</span>';

    $("info").innerHTML =
      '<span>📧 ' + esc(me.email) + '</span> • ' +
      '<span>📅 Joined ' + joinDate + '</span> • ' +
      roleBadge;

    var avatar = $("avatarCircle");
    if (avatar) {
      avatar.textContent = getInitials(me.name);
    }
  } catch (err) {
    toast(err.message);
  }
}

// Update Name
$("saveName").onclick = async function () {
  try {
    var newName = $("pName").value.trim();
    if (!newName) {
      $("nameMsg").textContent = "Name cannot be empty";
      return;
    }

    var result = await api("/api/auth/me", "PUT", { name: newName });
    localStorage.setItem("name", result.name);
    $("nameMsg").textContent = "";
    toast("Profile name updated!");

    var displayName = $("displayName");
    if (displayName) {
      displayName.textContent = result.name;
    }

    var avatar = $("avatarCircle");
    if (avatar) {
      avatar.textContent = getInitials(result.name);
    }
  } catch (err) {
    $("nameMsg").textContent = err.message;
  }
};

// Change Password
$("savePass").onclick = async function () {
  try {
    var oldPass = $("oldPass").value;
    var newPass = $("newPass").value;

    if (!oldPass || !newPass) {
      $("passMsg").textContent = "Please fill both password fields";
      return;
    }

    await api("/api/auth/password", "PUT", {
      oldPassword: oldPass,
      newPassword: newPass
    });

    $("passMsg").textContent = "";
    $("oldPass").value = "";
    $("newPass").value = "";
    toast("Password updated successfully!");
  } catch (err) {
    $("passMsg").textContent = err.message;
  }
};

// Delete Own Account
$("delBtn").onclick = async function () {
  var password = $("delPass").value;
  if (!password) {
    $("delMsg").textContent = "Please enter your password to confirm deletion";
    return;
  }

  if (!confirm("Are you sure you want to permanently delete your account? This action cannot be undone.")) {
    return;
  }

  try {
    await api("/api/auth/me", "DELETE", { password: password });
    alert("Your account has been deleted.");
    logout();
  } catch (err) {
    $("delMsg").textContent = err.message;
  }
};

loadProfile();
