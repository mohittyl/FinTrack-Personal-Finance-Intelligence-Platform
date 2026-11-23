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
  Wallet,
  Sparkles,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Transactions", path: "/transactions", icon: ArrowLeftRight },
    { name: "Budgets", path: "/budgets", icon: WalletCards },
    { name: "Savings Goals", path: "/goals", icon: Target },
    { name: "Analytics", path: "/analytics", icon: BarChart3 },
    { name: "Recurring Payments", path: "/recurring-payments", icon: Repeat },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
    if (onClose) onClose();
  };

  const isActivePath = (path) => location.pathname === path;

  const navItemClass = (active) =>
    `group relative flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-[13px] font-medium transition-all duration-200 ${
      active
        ? "bg-[#e9eee2] text-[#536747]"
        : "text-[#77796e] hover:bg-[#f3f1e9] hover:text-[#3e4938]"
    }`;

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 cursor-default bg-[#293126]/30 backdrop-blur-[2px] lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen w-[264px] flex-col
          border-r border-[#ebe8de] bg-[#fffefa]
          shadow-[8px_0_30px_rgba(52,57,43,0.035)]
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        <div className="flex h-[82px] shrink-0 items-center justify-between border-b border-[#efede5] px-6">
          <button
            type="button"
            onClick={() => handleNavigation("/dashboard")}
            className="flex items-center gap-3 text-left"
            aria-label="Go to FinTrack dashboard"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#687957] text-white shadow-[0_5px_12px_rgba(104,121,87,0.18)]">
              <Wallet size={20} strokeWidth={2} />
            </span>
            <span>
              <span className="block text-[19px] font-semibold tracking-[-0.04em] text-[#30382e]">
                FinTrack
              </span>
              <span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-[0.19em] text-[#9a9b8e]">
                Personal finance
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-[#929387] transition hover:bg-[#f2f0e8] hover:text-[#4d5943] lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-7">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.17em] text-[#a3a397]">
            Your workspace
          </p>

          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActivePath(item.path);

              return (
                <button
                  type="button"
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  aria-current={active ? "page" : undefined}
                  className={navItemClass(active)}
                >
                  {active && (
                    <span className="absolute bottom-2.5 left-0 top-2.5 w-[3px] rounded-r-full bg-[#71845e]" />
                  )}
                  <Icon
                    size={18}
                    strokeWidth={active ? 2.1 : 1.75}
                    className={`shrink-0 transition-colors ${
                      active
                        ? "text-[#687957]"
                        : "text-[#96988b] group-hover:text-[#687957]"
                    }`}
                  />
                  <span>{item.name}</span>
                  {active && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#84956f]" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-9">
            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.17em] text-[#a3a397]">
              Account
            </p>
            <button
              type="button"
              onClick={() => handleNavigation("/settings")}
              aria-current={isActivePath("/settings") ? "page" : undefined}
              className={navItemClass(isActivePath("/settings"))}
            >
              {isActivePath("/settings") && (
                <span className="absolute bottom-2.5 left-0 top-2.5 w-[3px] rounded-r-full bg-[#71845e]" />
              )}
              <Settings
                size={18}
                strokeWidth={1.8}
                className={
                  isActivePath("/settings")
                    ? "text-[#687957]"
                    : "text-[#96988b]"
                }
              />
              <span>Settings</span>
              {isActivePath("/settings") && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#84956f]" />
              )}
            </button>
          </div>
        </nav>

        <div className="shrink-0 border-t border-[#efede5] p-4">
          <div className="mb-3 overflow-hidden rounded-2xl border border-[#e9e9dc] bg-[#f4f3e9] p-3.5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#e4e9d9] text-[#687957]">
                <Sparkles size={15} />
              </span>
              <div>
                <p className="text-xs font-semibold text-[#4e5d42]">
                  A little more clarity
                </p>
                <p className="mt-0.5 text-[10px] text-[#8b907e]">
                  One step at a time.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-[13px] font-medium text-[#a16f63] transition hover:bg-[#fbf0eb] hover:text-[#b65e4e]"
          >
            <LogOut size={18} strokeWidth={1.8} />
            <span>Log out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
