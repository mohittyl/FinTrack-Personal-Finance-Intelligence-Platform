import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Lock,
  LogOut,
  Save,
  ShieldCheck,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../services/api";

const inputClass =
  "w-full rounded-xl border border-[#E5E3D9] bg-white px-4 py-3 text-sm text-[#454C41] outline-none transition placeholder:text-[#B4B4A9] focus:border-[#819A7A] focus:ring-2 focus:ring-[#DCE7DA]";

const labelClass = "mb-2 block text-xs font-semibold text-[#596152]";

function Settings() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/profile");
      const user = response.data.user;

      setProfile(user);
      setProfileForm({
        name: user.name || "",
        email: user.email || "",
      });
    } catch (err) {
      console.error("Profile error:", err);
      setError(err.response?.data?.error || "Unable to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((previous) => ({ ...previous, [name]: value }));
    setMessage("");
    setError("");
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm((previous) => ({ ...previous, [name]: value }));
    setMessage("");
    setError("");
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!profileForm.name.trim()) {
      setError("Name is required.");
      return;
    }

    if (!profileForm.email.trim()) {
      setError("Email is required.");
      return;
    }

    try {
      setProfileLoading(true);

      const response = await api.put("/profile", {
        name: profileForm.name.trim(),
        email: profileForm.email.trim(),
      });

      const updatedUser = response.data.user;
      setProfile(updatedUser);
      setProfileForm({
        name: updatedUser.name,
        email: updatedUser.email,
      });

      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          localStorage.setItem(
            "user",
            JSON.stringify({
              ...parsedUser,
              name: updatedUser.name,
              email: updatedUser.email,
            })
          );
        } catch (storageError) {
          console.error("Unable to update local user:", storageError);
        }
      }

      setMessage("Profile updated successfully.");
    } catch (err) {
      console.error("Update profile error:", err);
      setError(err.response?.data?.error || "Unable to update profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!passwordForm.currentPassword) {
      setError("Please enter your current password.");
      return;
    }

    if (!passwordForm.newPassword) {
      setError("Please enter a new password.");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setError("New password should be different from your current password.");
      return;
    }

    try {
      setPasswordLoading(true);

      await api.patch("/profile/password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setMessage("Password changed successfully.");
    } catch (err) {
      console.error("Change password error:", err);
      setError(err.response?.data?.error || "Unable to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const formatDate = (date) => {
    if (!date) return "-";
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return "-";

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const PageShell = ({ children }) => (
    <div className="min-h-screen bg-[#F8F7F1]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      <main className="min-h-screen px-4 pb-10 pt-20 sm:px-6 sm:pt-20 lg:ml-64 lg:px-8 lg:pt-24">
        <div className="mx-auto max-w-[1400px]">{children}</div>
      </main>
    </div>
  );

  if (loading) {
    return (
      <PageShell>
        <div className="flex min-h-[60vh] flex-col items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#E6E5D9] border-t-[#78866B]" />
          <p className="mt-4 text-sm text-[#85877C]">Loading your settings...</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mb-7">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#78866B]">
          <Sparkles size={15} />
          Your account, your way
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-[#343A32]">
          Settings
        </h1>
        <p className="mt-2 max-w-xl text-sm text-[#898B80]">
          Manage your personal information, account security and preferences.
        </p>
      </div>

      {(message || error) && (
        <div
          role={error ? "alert" : "status"}
          className={`mb-6 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
            error
              ? "border-[#F0D8CC] bg-[#F9E5DC] text-[#956F60]"
              : "border-[#D4E6D6] bg-[#EAF3E9] text-[#55765A]"
          }`}
        >
          {error ? (
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
          ) : (
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          )}
          <span>{error || message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        {/* Profile information */}
        <section className="overflow-hidden rounded-[20px] border border-[#EAE8DF] bg-white">
          <div className="flex items-center gap-3 border-b border-[#F0EEE8] p-5 sm:p-6">
            <div className="rounded-xl bg-[#EAF1E7] p-3 text-[#78866B]">
              <User size={20} />
            </div>
            <div>
              <h2 className="font-semibold text-[#3E463B]">Profile information</h2>
              <p className="mt-1 text-xs text-[#929387]">
                Update the details associated with your account.
              </p>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-5 p-5 sm:p-6">
            <div>
              <label htmlFor="settings-name" className={labelClass}>
                Full name
              </label>
              <div className="relative">
                <User
                  size={17}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#A0A092]"
                />
                <input
                  id="settings-name"
                  type="text"
                  name="name"
                  value={profileForm.name}
                  onChange={handleProfileChange}
                  placeholder="Your name"
                  autoComplete="name"
                  required
                  className={`${inputClass} pl-11`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="settings-email" className={labelClass}>
                Email address
              </label>
              <div className="relative">
                <Mail
                  size={17}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#A0A092]"
                />
                <input
                  id="settings-email"
                  type="email"
                  name="email"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className={`${inputClass} pl-11`}
                />
              </div>
            </div>

            <div className="flex justify-end border-t border-[#F0EEE8] pt-5">
              <button
                type="submit"
                disabled={profileLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#526B50] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#405B43] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {profileLoading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Save size={16} />
                )}
                {profileLoading ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </section>

        {/* Account information */}
        <section className="overflow-hidden rounded-[20px] border border-[#EAE8DF] bg-white">
          <div className="flex items-center gap-3 border-b border-[#F0EEE8] p-5 sm:p-6">
            <div className="rounded-xl bg-[#F1EDF5] p-3 text-[#9281A5]">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="font-semibold text-[#3E463B]">Account information</h2>
              <p className="mt-1 text-xs text-[#929387]">
                A few details about your FinTrack account.
              </p>
            </div>
          </div>

          <div className="divide-y divide-[#F0EEE8]">
            <div className="p-5 sm:p-6">
              <p className="text-xs font-medium text-[#99998F]">Account ID</p>
              <p className="mt-2 text-sm font-semibold text-[#454C41]">
                {profile?.id ? `#${profile.id}` : "-"}
              </p>
            </div>

            <div className="p-5 sm:p-6">
              <p className="text-xs font-medium text-[#99998F]">Email address</p>
              <p className="mt-2 break-all text-sm font-semibold text-[#454C41]">
                {profile?.email || "-"}
              </p>
            </div>

            <div className="p-5 sm:p-6">
              <div className="flex items-center gap-2 text-xs font-medium text-[#99998F]">
                <CalendarDays size={14} />
                Account created
              </div>
              <p className="mt-2 text-sm font-semibold text-[#454C41]">
                {formatDate(profile?.created_at)}
              </p>
            </div>
          </div>
        </section>

        {/* Change password */}
        <section className="overflow-hidden rounded-[20px] border border-[#EAE8DF] bg-white xl:col-span-2">
          <div className="flex items-center gap-3 border-b border-[#F0EEE8] p-5 sm:p-6">
            <div className="rounded-xl bg-[#F7F0E3] p-3 text-[#A88B57]">
              <Lock size={20} />
            </div>
            <div>
              <h2 className="font-semibold text-[#3E463B]">Change password</h2>
              <p className="mt-1 text-xs text-[#929387]">
                Choose a strong password to help keep your account secure.
              </p>
            </div>
          </div>

          <form
            onSubmit={handlePasswordSubmit}
            className="grid grid-cols-1 gap-5 p-5 sm:p-6 md:grid-cols-3"
          >
            <div>
              <label htmlFor="currentPassword" className={labelClass}>
                Current password
              </label>
              <input
                id="currentPassword"
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Current password"
                autoComplete="current-password"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="newPassword" className={labelClass}>
                New password
              </label>
              <input
                id="newPassword"
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                placeholder="New password"
                autoComplete="new-password"
                minLength={6}
                required
                className={inputClass}
              />
              <p className="mt-2 text-xs text-[#99998F]">
                Minimum 6 characters.
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className={labelClass}>
                Confirm new password
              </label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Confirm new password"
                autoComplete="new-password"
                minLength={6}
                required
                className={inputClass}
              />
            </div>

            <div className="flex justify-start border-t border-[#F0EEE8] pt-5 md:col-span-3">
              <button
                type="submit"
                disabled={passwordLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#78866B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#657458] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {passwordLoading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Lock size={16} />
                )}
                {passwordLoading ? "Changing..." : "Change password"}
              </button>
            </div>
          </form>
        </section>

        {/* Sign out */}
        <section className="overflow-hidden rounded-[20px] border border-[#EBD9D1] bg-white xl:col-span-2">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h2 className="font-semibold text-[#45433E]">Sign out</h2>
              <p className="mt-1 text-sm text-[#929387]">
                Sign out of your FinTrack account on this device.
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E8CFC5] bg-[#FBF3EF] px-5 py-3 text-sm font-semibold text-[#B66F56] transition hover:bg-[#F7E7E0]"
            >
              <LogOut size={16} />
              Log out
            </button>
          </div>
        </section>
      </div>

      <footer className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-[#EAE8DF] pt-5 text-[10px] text-[#A0A092] sm:flex-row">
        <p>FinTrack · Personal Finance Intelligence</p>
        <p>Manage your account with confidence.</p>
      </footer>
    </PageShell>
  );
}

export default Settings;
