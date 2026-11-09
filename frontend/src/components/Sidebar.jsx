import {
  LayoutDashboard,
  ArrowLeftRight,
  WalletCards,
  Target,
  BarChart3,
  Repeat,
  Settings,
  LogOut,
  X,
} from "lucide-react";

import { useLocation, useNavigate } from "react-router-dom";

function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Transactions",
      path: "/transactions",
      icon: ArrowLeftRight,
    },
    {
      name: "Budgets",
      path: "/budgets",
      icon: WalletCards,
    },
    {
      name: "Goals",
      path: "/goals",
      icon: Target,
    },
    {
      name: "Analytics",
      path: "/analytics",
      icon: BarChart3,
    },
    {
      name: "Recurring Payments",
      path: "/recurring-payments",
      icon: Repeat,
    },
  ];

  const handleNavigation = (path) => {
    navigate(path);

    // Mobile par sidebar close
    if (onClose) {
      onClose();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");

    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* ==============================
          MOBILE OVERLAY
      =============================== */}

      {isOpen && (
        <div
          className="
            fixed
            inset-0
            z-40
            bg-black/40
            lg:hidden
          "
          onClick={onClose}
        />
      )}

      {/* ==============================
          SIDEBAR
      =============================== */}

      <aside
        className={`
          fixed
          left-0
          top-0
          z-50
          flex
          h-screen
          w-64
          flex-col
          border-r
          border-gray-200
          bg-white
          transition-transform
          duration-300
          ease-in-out

          ${isOpen
            ? "translate-x-0"
            : "-translate-x-full"
          }

          lg:translate-x-0
        `}
      >

        {/* ==============================
            LOGO / BRAND
        =============================== */}

        <div
          className="
            flex
            h-16
            items-center
            justify-between
            border-b
            border-gray-200
            px-5
          "
        >

          <button
            onClick={() =>
              handleNavigation("/dashboard")
            }
            className="
              flex
              items-center
              gap-2
            "
          >

            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                bg-green-600
                text-sm
                font-bold
                text-white
              "
            >
              F
            </div>

            <span
              className="
                text-lg
                font-bold
                text-gray-900
              "
            >
              FinTrack
            </span>

          </button>


          {/* Mobile Close Button */}

          <button
            onClick={onClose}
            className="
              rounded-lg
              p-2
              text-gray-500
              hover:bg-gray-100
              hover:text-gray-900
              lg:hidden
            "
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>

        </div>


        {/* ==============================
            NAVIGATION
        =============================== */}

        <nav
          className="
            flex-1
            overflow-y-auto
            px-3
            py-5
          "
        >

          <p
            className="
              mb-3
              px-3
              text-xs
              font-semibold
              uppercase
              tracking-wider
              text-gray-400
            "
          >
            Menu
          </p>


          <div className="space-y-1">

            {menuItems.map((item) => {
              const Icon = item.icon;

              const isActive =
                location.pathname === item.path;

              return (
                <button
                  key={item.path}
                  onClick={() =>
                    handleNavigation(item.path)
                  }
                  className={`
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-lg
                    px-3
                    py-2.5
                    text-sm
                    font-medium
                    transition

                    ${
                      isActive
                        ? "bg-green-50 text-green-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }
                  `}
                >

                  <Icon size={19} />

                  <span>
                    {item.name}
                  </span>

                </button>
              );
            })}

          </div>


          {/* ==============================
              ACCOUNT
          =============================== */}

          <div className="mt-8">

            <p
              className="
                mb-3
                px-3
                text-xs
                font-semibold
                uppercase
                tracking-wider
                text-gray-400
              "
            >
              Account
            </p>


            <button
              onClick={() =>
                handleNavigation("/settings")
              }
              className={`
                flex
                w-full
                items-center
                gap-3
                rounded-lg
                px-3
                py-2.5
                text-sm
                font-medium
                transition

                ${
                  location.pathname === "/settings"
                    ? "bg-green-50 text-green-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }
              `}
            >

              <Settings size={19} />

              <span>
                Settings
              </span>

            </button>

          </div>

        </nav>


        {/* ==============================
            LOGOUT
        =============================== */}

        <div
          className="
            border-t
            border-gray-200
            p-3
          "
        >

          <button
            onClick={handleLogout}
            className="
              flex
              w-full
              items-center
              gap-3
              rounded-lg
              px-3
              py-2.5
              text-sm
              font-medium
              text-gray-600
              transition
              hover:bg-red-50
              hover:text-red-600
            "
          >

            <LogOut size={19} />

            <span>
              Logout
            </span>

          </button>

        </div>

      </aside>
    </>
  );
}

export default Sidebar;