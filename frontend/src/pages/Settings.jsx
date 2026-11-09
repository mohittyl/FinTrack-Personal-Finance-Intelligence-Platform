import { useEffect, useState } from "react";

import {
  User,
  Mail,
  Lock,
  LogOut,
  Save,
  ShieldCheck,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../services/api";

function Settings() {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [profile, setProfile] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [profileLoading, setProfileLoading] =
    useState(false);

  const [passwordLoading, setPasswordLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [profileForm, setProfileForm] =
    useState({
      name: "",
      email: "",
    });

  const [passwordForm, setPasswordForm] =
    useState({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

  /*
  =====================================================
  FETCH PROFILE
  =====================================================
  */

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get("/profile");

      const user =
        response.data.user;

      setProfile(user);

      setProfileForm({
        name: user.name || "",
        email: user.email || "",
      });

    } catch (err) {
      console.error(
        "Profile error:",
        err
      );

      setError(
        err.response?.data?.error ||
          "Unable to load profile"
      );

    } finally {
      setLoading(false);
    }
  };

  /*
  =====================================================
  PROFILE FORM CHANGE
  =====================================================
  */

  const handleProfileChange = (e) => {
    const { name, value } = e.target;

    setProfileForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
    setError("");
  };

  /*
  =====================================================
  PASSWORD FORM CHANGE
  =====================================================
  */

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
    setError("");
  };

  /*
  =====================================================
  UPDATE PROFILE
  =====================================================
  */

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

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

      const response =
        await api.put("/profile", {
          name: profileForm.name.trim(),
          email: profileForm.email.trim(),
        });

      const updatedUser =
        response.data.user;

      setProfile(updatedUser);

      setProfileForm({
        name: updatedUser.name,
        email: updatedUser.email,
      });

      /*
      Update stored user
      */

      const storedUser =
        localStorage.getItem("user");

      if (storedUser) {
        try {
          const parsedUser =
            JSON.parse(storedUser);

          localStorage.setItem(
            "user",
            JSON.stringify({
              ...parsedUser,
              name: updatedUser.name,
              email: updatedUser.email,
            })
          );
        } catch (storageError) {
          console.error(
            "Unable to update local user:",
            storageError
          );
        }
      }

      setMessage(
        "Profile updated successfully."
      );

    } catch (err) {
      console.error(
        "Update profile error:",
        err
      );

      setError(
        err.response?.data?.error ||
          "Unable to update profile"
      );

    } finally {
      setProfileLoading(false);
    }
  };

  /*
  =====================================================
  CHANGE PASSWORD
  =====================================================
  */

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (
      !passwordForm.currentPassword
    ) {
      setError(
        "Please enter your current password."
      );
      return;
    }

    if (
      !passwordForm.newPassword
    ) {
      setError(
        "Please enter a new password."
      );
      return;
    }

    if (
      passwordForm.newPassword.length < 6
    ) {
      setError(
        "New password must be at least 6 characters."
      );
      return;
    }

    if (
      passwordForm.newPassword !==
      passwordForm.confirmPassword
    ) {
      setError(
        "New password and confirm password do not match."
      );
      return;
    }

    if (
      passwordForm.currentPassword ===
      passwordForm.newPassword
    ) {
      setError(
        "New password should be different from your current password."
      );
      return;
    }

    try {
      setPasswordLoading(true);

      await api.patch(
        "/profile/password",
        {
          currentPassword:
            passwordForm.currentPassword,

          newPassword:
            passwordForm.newPassword,
        }
      );

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setMessage(
        "Password changed successfully."
      );

    } catch (err) {
      console.error(
        "Change password error:",
        err
      );

      setError(
        err.response?.data?.error ||
          "Unable to change password"
      );

    } finally {
      setPasswordLoading(false);
    }
  };

  /*
  =====================================================
  LOGOUT
  =====================================================
  */

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/login";
  };

  /*
  =====================================================
  FORMAT DATE
  =====================================================
  */

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
  };

  /*
  =====================================================
  LOADING SCREEN
  =====================================================
  */

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">

        <Sidebar
          isOpen={sidebarOpen}
          onClose={() =>
            setSidebarOpen(false)
          }
        />

        <Navbar
          onMenuClick={() =>
            setSidebarOpen(true)
          }
        />

        <main
          className="
            p-4
            pt-20
            sm:p-6
            sm:pt-20
            lg:ml-64
            lg:p-8
            lg:pt-24
          "
        >

          <div
            className="
              flex
              min-h-[55vh]
              items-center
              justify-center
            "
          >

            <div className="text-center">

              <div
                className="
                  mx-auto
                  mb-3
                  h-8
                  w-8
                  animate-spin
                  rounded-full
                  border-4
                  border-gray-200
                  border-t-green-600
                "
              />

              <p
                className="
                  text-sm
                  text-gray-500
                "
              >
                Loading settings...
              </p>

            </div>

          </div>

        </main>

      </div>
    );
  }

  /*
  =====================================================
  MAIN UI
  =====================================================
  */

  return (
    <div className="min-h-screen bg-gray-50">

      {/* =================================================
          SIDEBAR
      ================================================== */}

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() =>
          setSidebarOpen(false)
        }
      />

      {/* =================================================
          NAVBAR
      ================================================== */}

      <Navbar
        onMenuClick={() =>
          setSidebarOpen(true)
        }
      />

      {/* =================================================
          MAIN
      ================================================== */}

      <main
        className="
          p-4
          pt-20
          sm:p-6
          sm:pt-20
          lg:ml-64
          lg:p-8
          lg:pt-24
        "
      >

        {/* =================================================
            HEADER
        ================================================== */}

        <div className="mb-6">

          <p
            className="
              mb-1
              text-sm
              font-medium
              text-green-600
            "
          >
            Account
          </p>

          <h1
            className="
              text-2xl
              font-bold
              tracking-tight
              text-gray-900
              sm:text-3xl
            "
          >
            Settings
          </h1>

          <p
            className="
              mt-1.5
              text-sm
              text-gray-500
            "
          >
            Manage your profile and account
            security.
          </p>

        </div>

        {/* =================================================
            SUCCESS MESSAGE
        ================================================== */}

        {message && (
          <div
            className="
              mb-5
              rounded-lg
              border
              border-green-200
              bg-green-50
              px-4
              py-3
              text-sm
              text-green-700
            "
          >
            {message}
          </div>
        )}

        {/* =================================================
            ERROR MESSAGE
        ================================================== */}

        {error && (
          <div
            className="
              mb-5
              rounded-lg
              border
              border-red-200
              bg-red-50
              px-4
              py-3
              text-sm
              text-red-700
            "
          >
            {error}
          </div>
        )}

        {/* =================================================
            CONTENT
        ================================================== */}

        <div
          className="
            grid
            grid-cols-1
            gap-5
            xl:grid-cols-[1.4fr_1fr]
          "
        >

          {/* =================================================
              PROFILE INFORMATION
          ================================================== */}

          <section
            className="
              rounded-xl
              border
              border-gray-200
              bg-white
            "
          >

            <div
              className="
                border-b
                border-gray-200
                p-5
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-3
                "
              >

                <div
                  className="
                    rounded-lg
                    bg-green-50
                    p-2
                  "
                >

                  <User
                    size={20}
                    className="text-green-600"
                  />

                </div>

                <div>

                  <h2
                    className="
                      font-semibold
                      text-gray-900
                    "
                  >
                    Profile information
                  </h2>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-gray-500
                    "
                  >
                    Update your personal
                    information.
                  </p>

                </div>

              </div>

            </div>

            <form
              onSubmit={handleProfileSubmit}
              className="space-y-5 p-5"
            >

              {/* NAME */}

              <div>

                <label
                  htmlFor="name"
                  className="
                    mb-1.5
                    block
                    text-sm
                    font-medium
                    text-gray-700
                  "
                >
                  Name
                </label>

                <div className="relative">

                  <User
                    size={17}
                    className="
                      absolute
                      left-3
                      top-1/2
                      -translate-y-1/2
                      text-gray-400
                    "
                  />

                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={profileForm.name}
                    onChange={
                      handleProfileChange
                    }
                    placeholder="Your name"
                    autoComplete="name"
                    required
                    className="
                      w-full
                      rounded-lg
                      border
                      border-gray-300
                      py-2.5
                      pl-10
                      pr-3
                      text-sm
                      text-gray-900
                      outline-none
                      transition
                      placeholder:text-gray-400
                      focus:border-green-600
                      focus:ring-1
                      focus:ring-green-600
                    "
                  />

                </div>

              </div>

              {/* EMAIL */}

              <div>

                <label
                  htmlFor="profile-email"
                  className="
                    mb-1.5
                    block
                    text-sm
                    font-medium
                    text-gray-700
                  "
                >
                  Email
                </label>

                <div className="relative">

                  <Mail
                    size={17}
                    className="
                      absolute
                      left-3
                      top-1/2
                      -translate-y-1/2
                      text-gray-400
                    "
                  />

                  <input
                    id="profile-email"
                    type="email"
                    name="email"
                    value={profileForm.email}
                    onChange={
                      handleProfileChange
                    }
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    className="
                      w-full
                      rounded-lg
                      border
                      border-gray-300
                      py-2.5
                      pl-10
                      pr-3
                      text-sm
                      text-gray-900
                      outline-none
                      transition
                      placeholder:text-gray-400
                      focus:border-green-600
                      focus:ring-1
                      focus:ring-green-600
                    "
                  />

                </div>

              </div>

              {/* SAVE BUTTON */}

              <div
                className="
                  flex
                  justify-end
                "
              >

                <button
                  type="submit"
                  disabled={profileLoading}
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    bg-green-600
                    px-4
                    py-2.5
                    text-sm
                    font-medium
                    text-white
                    transition
                    hover:bg-green-700
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >

                  {profileLoading ? (
                    <>
                      <span
                        className="
                          h-4
                          w-4
                          animate-spin
                          rounded-full
                          border-2
                          border-white
                          border-t-transparent
                        "
                      />

                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={17} />

                      Save Changes
                    </>
                  )}

                </button>

              </div>

            </form>

          </section>

          {/* =================================================
              ACCOUNT INFORMATION
          ================================================== */}

          <section
            className="
              rounded-xl
              border
              border-gray-200
              bg-white
            "
          >

            <div
              className="
                border-b
                border-gray-200
                p-5
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-3
                "
              >

                <div
                  className="
                    rounded-lg
                    bg-gray-100
                    p-2
                  "
                >

                  <ShieldCheck
                    size={20}
                    className="text-gray-600"
                  />

                </div>

                <div>

                  <h2
                    className="
                      font-semibold
                      text-gray-900
                    "
                  >
                    Account information
                  </h2>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-gray-500
                    "
                  >
                    Basic information about
                    your account.
                  </p>

                </div>

              </div>

            </div>

            <div
              className="
                divide-y
                divide-gray-100
              "
            >

              {/* ACCOUNT ID */}

              <div className="p-5">

                <p
                  className="
                    text-xs
                    text-gray-500
                  "
                >
                  Account ID
                </p>

                <p
                  className="
                    mt-1
                    text-sm
                    font-medium
                    text-gray-900
                  "
                >
                  #{profile?.id}
                </p>

              </div>

              {/* EMAIL */}

              <div className="p-5">

                <p
                  className="
                    text-xs
                    text-gray-500
                  "
                >
                  Email
                </p>

                <p
                  className="
                    mt-1
                    break-all
                    text-sm
                    font-medium
                    text-gray-900
                  "
                >
                  {profile?.email}
                </p>

              </div>

              {/* CREATED DATE */}

              <div className="p-5">

                <p
                  className="
                    text-xs
                    text-gray-500
                  "
                >
                  Account created
                </p>

                <p
                  className="
                    mt-1
                    text-sm
                    font-medium
                    text-gray-900
                  "
                >
                  {formatDate(
                    profile?.created_at
                  )}
                </p>

              </div>

            </div>

          </section>

          {/* =================================================
              CHANGE PASSWORD
          ================================================== */}

          <section
            className="
              rounded-xl
              border
              border-gray-200
              bg-white
              xl:col-span-2
            "
          >

            <div
              className="
                border-b
                border-gray-200
                p-5
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-3
                "
              >

                <div
                  className="
                    rounded-lg
                    bg-gray-100
                    p-2
                  "
                >

                  <Lock
                    size={20}
                    className="text-gray-600"
                  />

                </div>

                <div>

                  <h2
                    className="
                      font-semibold
                      text-gray-900
                    "
                  >
                    Change password
                  </h2>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-gray-500
                    "
                  >
                    Change your password to keep
                    your account secure.
                  </p>

                </div>

              </div>

            </div>

            <form
              onSubmit={handlePasswordSubmit}
              className="
                grid
                grid-cols-1
                gap-5
                p-5
                md:grid-cols-3
              "
            >

              {/* CURRENT PASSWORD */}

              <div>

                <label
                  htmlFor="currentPassword"
                  className="
                    mb-1.5
                    block
                    text-sm
                    font-medium
                    text-gray-700
                  "
                >
                  Current password
                </label>

                <input
                  id="currentPassword"
                  type="password"
                  name="currentPassword"
                  value={
                    passwordForm.currentPassword
                  }
                  onChange={
                    handlePasswordChange
                  }
                  placeholder="Current password"
                  autoComplete="current-password"
                  required
                  className="
                    w-full
                    rounded-lg
                    border
                    border-gray-300
                    px-3
                    py-2.5
                    text-sm
                    text-gray-900
                    outline-none
                    transition
                    placeholder:text-gray-400
                    focus:border-green-600
                    focus:ring-1
                    focus:ring-green-600
                  "
                />

              </div>

              {/* NEW PASSWORD */}

              <div>

                <label
                  htmlFor="newPassword"
                  className="
                    mb-1.5
                    block
                    text-sm
                    font-medium
                    text-gray-700
                  "
                >
                  New password
                </label>

                <input
                  id="newPassword"
                  type="password"
                  name="newPassword"
                  value={
                    passwordForm.newPassword
                  }
                  onChange={
                    handlePasswordChange
                  }
                  placeholder="New password"
                  autoComplete="new-password"
                  minLength={6}
                  required
                  className="
                    w-full
                    rounded-lg
                    border
                    border-gray-300
                    px-3
                    py-2.5
                    text-sm
                    text-gray-900
                    outline-none
                    transition
                    placeholder:text-gray-400
                    focus:border-green-600
                    focus:ring-1
                    focus:ring-green-600
                  "
                />

                <p
                  className="
                    mt-1.5
                    text-xs
                    text-gray-500
                  "
                >
                  Minimum 6 characters.
                </p>

              </div>

              {/* CONFIRM PASSWORD */}

              <div>

                <label
                  htmlFor="confirmPassword"
                  className="
                    mb-1.5
                    block
                    text-sm
                    font-medium
                    text-gray-700
                  "
                >
                  Confirm password
                </label>

                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  value={
                    passwordForm.confirmPassword
                  }
                  onChange={
                    handlePasswordChange
                  }
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  minLength={6}
                  required
                  className="
                    w-full
                    rounded-lg
                    border
                    border-gray-300
                    px-3
                    py-2.5
                    text-sm
                    text-gray-900
                    outline-none
                    transition
                    placeholder:text-gray-400
                    focus:border-green-600
                    focus:ring-1
                    focus:ring-green-600
                  "
                />

              </div>

              {/* CHANGE PASSWORD BUTTON */}

              <div
                className="
                  flex
                  justify-start
                  md:col-span-3
                "
              >

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    bg-green-600
                    px-4
                    py-2.5
                    text-sm
                    font-medium
                    text-white
                    transition
                    hover:bg-green-700
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >

                  {passwordLoading ? (
                    <>
                      <span
                        className="
                          h-4
                          w-4
                          animate-spin
                          rounded-full
                          border-2
                          border-white
                          border-t-transparent
                        "
                      />

                      Changing...
                    </>
                  ) : (
                    <>
                      <Lock size={17} />

                      Change Password
                    </>
                  )}

                </button>

              </div>

            </form>

          </section>

          {/* =================================================
              LOGOUT
          ================================================== */}

          <section
            className="
              rounded-xl
              border
              border-red-200
              bg-white
              xl:col-span-2
            "
          >

            <div
              className="
                flex
                flex-col
                gap-4
                p-5
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >

              <div>

                <h2
                  className="
                    font-semibold
                    text-gray-900
                  "
                >
                  Sign out
                </h2>

                <p
                  className="
                    mt-1
                    text-sm
                    text-gray-500
                  "
                >
                  Sign out of your FinTrack
                  account on this device.
                </p>

              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  border
                  border-red-200
                  px-4
                  py-2.5
                  text-sm
                  font-medium
                  text-red-600
                  transition
                  hover:bg-red-50
                "
              >

                <LogOut size={17} />

                Logout

              </button>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}

export default Settings;