import { useEffect, useRef, useState } from "react";
import {
  Menu,
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  X,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

function Navbar({ onMenuClick }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [searchOpen, setSearchOpen] =
    useState(false);

  const [notificationOpen, setNotificationOpen] =
    useState(false);

  const [profileOpen, setProfileOpen] =
    useState(false);

  const [searchValue, setSearchValue] =
    useState("");

  const profileRef = useRef(null);
  const notificationRef = useRef(null);


  // ==========================================
  // GET USER FROM LOCAL STORAGE
  // ==========================================

  useEffect(() => {
    const storedUser =
      localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error(
          "Unable to parse user:",
          error
        );
      }
    }
  }, []);


  // ==========================================
  // CLOSE DROPDOWNS WHEN CLICKING OUTSIDE
  // ==========================================

  useEffect(() => {
    const handleClickOutside = (event) => {

      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          event.target
        )
      ) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);


  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setProfileOpen(false);

    navigate("/login");
  };


  // ==========================================
  // SEARCH
  // ==========================================

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    const value =
      searchValue.trim().toLowerCase();

    if (!value) {
      return;
    }

    // Basic navigation search

    if (value.includes("transaction")) {
      navigate("/transactions");
    } else if (value.includes("budget")) {
      navigate("/budgets");
    } else if (value.includes("goal")) {
      navigate("/goals");
    } else if (
      value.includes("analytic")
    ) {
      navigate("/analytics");
    } else if (
      value.includes("recurring") ||
      value.includes("payment")
    ) {
      navigate("/recurring-payments");
    } else if (
      value.includes("setting") ||
      value.includes("profile")
    ) {
      navigate("/settings");
    } else if (
      value.includes("dashboard")
    ) {
      navigate("/dashboard");
    }

    setSearchValue("");
  };


  // ==========================================
  // USER INITIAL
  // ==========================================

  const userInitial =
    user?.name
      ? user.name.charAt(0).toUpperCase()
      : "U";


  return (
    <header
      className="
        fixed
        left-0
        right-0
        top-0
        z-40
        h-16
        border-b
        border-gray-200
        bg-white

        lg:left-64
      "
    >

      <div
        className="
          flex
          h-full
          items-center
          justify-between
          gap-3
          px-4
          sm:px-6
        "
      >

        {/* ====================================
            LEFT SIDE
        ===================================== */}

        <div
          className="
            flex
            min-w-0
            flex-1
            items-center
            gap-3
          "
        >

          {/* Mobile Menu */}

          <button
            onClick={onMenuClick}
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-lg
              text-gray-600
              transition
              hover:bg-gray-100
              hover:text-gray-900
              lg:hidden
            "
            aria-label="Open menu"
          >
            <Menu size={21} />
          </button>


          {/* ==================================
              DESKTOP SEARCH
          =================================== */}

          <form
            onSubmit={handleSearchSubmit}
            className="
              hidden
              w-full
              max-w-md
              md:block
            "
          >

            <div className="relative">

              <Search
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
                type="text"
                value={searchValue}
                onChange={(e) =>
                  setSearchValue(
                    e.target.value
                  )
                }
                placeholder="Search..."
                className="
                  h-10
                  w-full
                  rounded-lg
                  border
                  border-gray-200
                  bg-gray-50
                  pl-10
                  pr-4
                  text-sm
                  text-gray-900
                  outline-none
                  transition
                  placeholder:text-gray-400
                  focus:border-green-500
                  focus:bg-white
                  focus:ring-1
                  focus:ring-green-500
                "
              />

            </div>

          </form>


          {/* ==================================
              MOBILE SEARCH BUTTON
          =================================== */}

          <button
            onClick={() =>
              setSearchOpen(!searchOpen)
            }
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-lg
              text-gray-600
              transition
              hover:bg-gray-100
              md:hidden
            "
            aria-label="Search"
          >

            {searchOpen ? (
              <X size={20} />
            ) : (
              <Search size={20} />
            )}

          </button>

        </div>


        {/* ====================================
            RIGHT SIDE
        ===================================== */}

        <div
          className="
            flex
            shrink-0
            items-center
            gap-2
            sm:gap-3
          "
        >

          {/* ==================================
              NOTIFICATIONS
          =================================== */}

          <div
            ref={notificationRef}
            className="relative"
          >

            <button
              onClick={() =>
                setNotificationOpen(
                  !notificationOpen
                )
              }
              className="
                relative
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-lg
                text-gray-600
                transition
                hover:bg-gray-100
                hover:text-gray-900
              "
              aria-label="Notifications"
            >

              <Bell size={20} />

              {/* Notification dot */}

              <span
                className="
                  absolute
                  right-2
                  top-2
                  h-2
                  w-2
                  rounded-full
                  bg-red-500
                "
              />

            </button>


            {/* Notification Dropdown */}

            {notificationOpen && (
              <div
                className="
                  absolute
                  right-0
                  top-12
                  z-50
                  w-72
                  overflow-hidden
                  rounded-xl
                  border
                  border-gray-200
                  bg-white
                  shadow-lg
                "
              >

                <div
                  className="
                    border-b
                    border-gray-200
                    px-4
                    py-3
                  "
                >

                  <h3 className="text-sm font-semibold text-gray-900">
                    Notifications
                  </h3>

                </div>


                <div className="px-4 py-6 text-center">

                  <Bell
                    size={24}
                    className="
                      mx-auto
                      mb-2
                      text-gray-300
                    "
                  />

                  <p className="text-sm text-gray-500">
                    No new notifications
                  </p>

                </div>

              </div>
            )}

          </div>


          {/* ==================================
              PROFILE
          =================================== */}

          <div
            ref={profileRef}
            className="relative"
          >

            <button
              onClick={() =>
                setProfileOpen(!profileOpen)
              }
              className="
                flex
                items-center
                gap-2
                rounded-lg
                p-1.5
                transition
                hover:bg-gray-50
                sm:gap-3
                sm:pr-2
              "
            >

              {/* Avatar */}

              <div
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-green-500
                  text-sm
                  font-semibold
                  text-white
                "
              >
                {userInitial}
              </div>


              {/* User info */}

              <div
                className="
                  hidden
                  text-left
                  sm:block
                "
              >

                <p
                  className="
                    max-w-28
                    truncate
                    text-sm
                    font-semibold
                    text-gray-900
                  "
                >
                  {user?.name || "User"}
                </p>

                <p className="text-xs text-gray-500">
                  Personal Account
                </p>

              </div>

            </button>


            {/* =================================
                PROFILE DROPDOWN
            ================================== */}

            {profileOpen && (
              <div
                className="
                  absolute
                  right-0
                  top-12
                  z-50
                  w-56
                  overflow-hidden
                  rounded-xl
                  border
                  border-gray-200
                  bg-white
                  shadow-lg
                "
              >

                {/* User header */}

                <div
                  className="
                    border-b
                    border-gray-200
                    px-4
                    py-3
                  "
                >

                  <p className="truncate text-sm font-semibold text-gray-900">
                    {user?.name || "User"}
                  </p>

                  <p className="truncate text-xs text-gray-500">
                    {user?.email || ""}
                  </p>

                </div>


                {/* Settings */}

                <button
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/settings");
                  }}
                  className="
                    flex
                    w-full
                    items-center
                    gap-3
                    px-4
                    py-3
                    text-sm
                    text-gray-700
                    transition
                    hover:bg-gray-50
                  "
                >

                  <Settings size={17} />

                  <span>
                    Settings
                  </span>

                </button>


                {/* Logout */}

                <button
                  onClick={handleLogout}
                  className="
                    flex
                    w-full
                    items-center
                    gap-3
                    border-t
                    border-gray-100
                    px-4
                    py-3
                    text-sm
                    text-red-600
                    transition
                    hover:bg-red-50
                  "
                >

                  <LogOut size={17} />

                  <span>
                    Logout
                  </span>

                </button>

              </div>
            )}

          </div>

        </div>

      </div>


      {/* ======================================
          MOBILE SEARCH BAR
      ======================================= */}

      {searchOpen && (
        <form
          onSubmit={handleSearchSubmit}
          className="
            border-b
            border-gray-200
            bg-white
            px-4
            pb-3
            pt-1
            md:hidden
          "
        >

          <div className="relative">

            <Search
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
              type="text"
              autoFocus
              value={searchValue}
              onChange={(e) =>
                setSearchValue(
                  e.target.value
                )
              }
              placeholder="Search..."
              className="
                h-10
                w-full
                rounded-lg
                border
                border-gray-200
                bg-gray-50
                pl-10
                pr-4
                text-sm
                outline-none
                focus:border-green-500
                focus:bg-white
                focus:ring-1
                focus:ring-green-500
              "
            />

          </div>

        </form>
      )}

    </header>
  );
}

export default Navbar;