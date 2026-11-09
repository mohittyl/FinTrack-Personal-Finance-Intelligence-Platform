import { useState } from "react";

import {
  Link,
  Navigate,
  useNavigate,
} from "react-router-dom";

import {
  Wallet,
  User,
  Mail,
  Lock,
  UserPlus,
} from "lucide-react";

import api from "../services/api";

function Register() {
  const navigate = useNavigate();

  /*
  =====================================================
  FORM STATE
  =====================================================
  */

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
  =====================================================
  IF ALREADY LOGGED IN
  =====================================================
  */

  const token =
    localStorage.getItem("token");

  if (token) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  /*
  =====================================================
  HANDLE INPUT
  =====================================================
  */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  /*
  =====================================================
  HANDLE REGISTER
  =====================================================
  */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    /*
    FRONTEND VALIDATION
    */

    if (!form.name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!form.email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!form.password) {
      setError("Please enter a password.");
      return;
    }

    if (form.password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (
      form.password !==
      form.confirmPassword
    ) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    try {
      setLoading(true);

      /*
      ================================================
      REGISTER API
      ================================================
      */

      await api.post(
        "/auth/register",
        {
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
        }
      );

      /*
      ================================================
      REGISTRATION SUCCESS
      ================================================
      */

      navigate("/login", {
        replace: true,
        state: {
          message:
            "Account created successfully. Please login.",
        },
      });

    } catch (err) {
      console.error(
        "Register error:",
        err
      );

      setError(
        err.response?.data?.error ||
          "Unable to create account. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  /*
  =====================================================
  UI
  =====================================================
  */

  return (
    <div
      className="
        min-h-screen
        bg-gray-50
        px-4
        py-8
        sm:px-6
      "
    >

      <div
        className="
          flex
          min-h-[calc(100vh-4rem)]
          items-center
          justify-center
        "
      >

        <div
          className="
            w-full
            max-w-md
          "
        >

          {/* LOGO */}

          <div
            className="
              mb-8
              text-center
            "
          >

            <div
              className="
                mx-auto
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-xl
                bg-green-600
              "
            >

              <Wallet
                size={25}
                className="text-white"
              />

            </div>

            <h1
              className="
                mt-4
                text-2xl
                font-bold
                text-gray-900
              "
            >
              Create your account
            </h1>

            <p
              className="
                mt-1.5
                text-sm
                text-gray-500
              "
            >
              Start managing your money with FinTrack
            </p>

          </div>

          {/* REGISTER CARD */}

          <div
            className="
              rounded-xl
              border
              border-gray-200
              bg-white
              p-6
              sm:p-8
            "
          >

            {/* ERROR */}

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

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
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
                    size={18}
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
                    value={form.name}
                    onChange={handleChange}
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
                  htmlFor="email"
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
                    size={18}
                    className="
                      absolute
                      left-3
                      top-1/2
                      -translate-y-1/2
                      text-gray-400
                    "
                  />

                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
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

              {/* PASSWORD */}

              <div>

                <label
                  htmlFor="password"
                  className="
                    mb-1.5
                    block
                    text-sm
                    font-medium
                    text-gray-700
                  "
                >
                  Password
                </label>

                <div className="relative">

                  <Lock
                    size={18}
                    className="
                      absolute
                      left-3
                      top-1/2
                      -translate-y-1/2
                      text-gray-400
                    "
                  />

                  <input
                    id="password"
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    autoComplete="new-password"
                    required
                    minLength={6}
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

                <div className="relative">

                  <Lock
                    size={18}
                    className="
                      absolute
                      left-3
                      top-1/2
                      -translate-y-1/2
                      text-gray-400
                    "
                  />

                  <input
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    value={
                      form.confirmPassword
                    }
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    required
                    minLength={6}
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

              {/* REGISTER BUTTON */}

              <button
                type="submit"
                disabled={loading}
                className="
                  flex
                  w-full
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

                {loading ? (
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

                    Creating account...
                  </>
                ) : (
                  <>
                    <UserPlus size={17} />

                    Create account
                  </>
                )}

              </button>

            </form>

            {/* LOGIN LINK */}

            <div
              className="
                mt-6
                border-t
                border-gray-100
                pt-5
                text-center
              "
            >

              <p
                className="
                  text-sm
                  text-gray-500
                "
              >
                Already have an account?{" "}

                <Link
                  to="/login"
                  className="
                    font-medium
                    text-green-600
                    hover:text-green-700
                  "
                >
                  Sign in
                </Link>

              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Register;