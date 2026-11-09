import { useState } from "react";

import {
  Link,
  Navigate,
  useNavigate,
} from "react-router-dom";

import {
  Wallet,
  Mail,
  Lock,
  LogIn,
} from "lucide-react";

import api from "../services/api";

function Login() {
  const navigate = useNavigate();

  /*
  =====================================================
  FORM STATE
  =====================================================
  */

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  /*
  =====================================================
  LOADING + ERROR
  =====================================================
  */

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
  =====================================================
  CHECK IF USER IS ALREADY LOGGED IN
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
  HANDLE INPUT CHANGE
  =====================================================
  */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    /*
    Clear old error when user starts typing
    */

    if (error) {
      setError("");
    }
  };

  /*
  =====================================================
  HANDLE LOGIN
  =====================================================
  */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    /*
    =================================================
    FRONTEND VALIDATION
    =================================================
    */

    if (!form.email.trim()) {
      setError(
        "Please enter your email."
      );

      return;
    }

    if (!form.password) {
      setError(
        "Please enter your password."
      );

      return;
    }

    try {
      setLoading(true);

      /*
      ================================================
      LOGIN API
      ================================================
      */

      const response =
        await api.post(
          "/auth/login",
          {
            email: form.email.trim(),
            password: form.password,
          }
        );

      /*
      ================================================
      SAVE TOKEN
      ================================================
      */

      localStorage.setItem(
        "token",
        response.data.token
      );

      /*
      ================================================
      SAVE USER
      ================================================
      */

      localStorage.setItem(
        "user",
        JSON.stringify(
          response.data.user
        )
      );

      /*
      ================================================
      REDIRECT TO DASHBOARD
      ================================================
      */

      navigate("/dashboard", {
        replace: true,
      });

    } catch (err) {
      console.error(
        "Login error:",
        err
      );

      setError(
        err.response?.data?.error ||
          "Unable to login. Please check your credentials."
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

          {/* =================================================
              LOGO
          ================================================== */}

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
              Welcome back
            </h1>

            <p
              className="
                mt-1.5
                text-sm
                text-gray-500
              "
            >
              Sign in to continue to FinTrack
            </p>

          </div>

          {/* =================================================
              LOGIN CARD
          ================================================== */}

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

            {/* =================================================
                ERROR
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
                FORM
            ================================================== */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* =================================================
                  EMAIL
              ================================================== */}

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

              {/* =================================================
                  PASSWORD
              ================================================== */}

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
                    placeholder="Enter your password"
                    autoComplete="current-password"
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

              {/* =================================================
                  LOGIN BUTTON
              ================================================== */}

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

                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn size={17} />

                    Sign in
                  </>
                )}

              </button>

            </form>

            {/* =================================================
                REGISTER LINK
            ================================================== */}

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
                Don't have an account?{" "}

                <Link
                  to="/register"
                  className="
                    font-medium
                    text-green-600
                    hover:text-green-700
                  "
                >
                  Create one
                </Link>

              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;