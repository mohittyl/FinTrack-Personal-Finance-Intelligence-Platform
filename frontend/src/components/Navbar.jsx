import { useEffect, useRef, useState } from "react";
import {
  Menu,
  Search,
  Bell,
  Settings,
  LogOut,
  X,
  ChevronDown,
  Wallet,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function Navbar({ onMenuClick }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Unable to parse user:", error);
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setProfileOpen(false);
    navigate("/login");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    const value = searchValue.trim().toLowerCase();
    if (!value) return;

    if (value.includes("transaction")) {
      navigate("/transactions");
    } else if (value.includes("budget")) {
      navigate("/budgets");
    } else if (value.includes("goal")) {
      navigate("/goals");
    } else if (value.includes("analytic")) {
      navigate("/analytics");
    } else if (value.includes("recurring") || value.includes("payment")) {
      navigate("/recurring-payments");
    } else if (value.includes("setting") || value.includes("profile")) {
      navigate("/settings");
    } else if (value.includes("dashboard")) {
      navigate("/dashboard");
    }

    setSearchValue("");
    setSearchOpen(false);
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  const searchInputClass =
    "h-11 w-full rounded-xl border border-[#e9e5da] bg-[#f8f7f1] pl-11 pr-4 text-sm text-[#3b4435] outline-none transition placeholder:text-[#aaa99f] focus:border-[#a6b293] focus:bg-white focus:ring-4 focus:ring-[#8b9873]/10";

  return (
    <header className="fixed left-0 right-0 top-0 z-40 border-b border-[#ebe8de] bg-[#fffefa]/95 backdrop-blur-xl lg:left-[264px]">
      <div className="flex min-h-[76px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open menu"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#68745e] transition hover:bg-[#f0efe7] hover:text-[#48583c] lg:hidden"
          >
            <Menu size={21} />
          </button>

          <div className="hidden min-w-0 flex-1 md:block">
            <form onSubmit={handleSearchSubmit} className="w-full max-w-[440px]">
              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a1a294]"
                />
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search transactions, budgets, goals..."
                  aria-label="Search FinTrack"
                  className={searchInputClass}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-[#e7e4da] bg-white px-1.5 py-0.5 text-[10px] text-[#aaa99f] lg:block">
                  Enter
                </span>
              </div>
            </form>
          </div>

          <button
            type="button"
            onClick={() => setSearchOpen((open) => !open)}
            aria-label="Toggle search"
            aria-expanded={searchOpen}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#68745e] transition hover:bg-[#f0efe7] md:hidden"
          >
            {searchOpen ? <X size={20} /> : <Search size={20} />}
          </button>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          <div ref={notificationRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setNotificationOpen((open) => !open);
                setProfileOpen(false);
              }}
              aria-label="Notifications"
              aria-expanded={notificationOpen}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-[#7c806f] transition hover:bg-[#f2f0e8] hover:text-[#687957]"
            >
              <Bell size={19} strokeWidth={1.8} />
              <span className="absolute right-[9px] top-[8px] h-2 w-2 rounded-full border-2 border-[#fffefa] bg-[#c77b65]" />
            </button>

            {notificationOpen && (
              <div className="absolute right-0 top-12 z-50 w-[290px] overflow-hidden rounded-2xl border border-[#e9e5da] bg-[#fffefa] shadow-[0_16px_45px_rgba(54,58,43,0.12)]">
                <div className="border-b border-[#efede5] px-5 py-4">
                  <h3 className="text-sm font-semibold text-[#35412f]">
                    Notifications
                  </h3>
                  <p className="mt-1 text-xs text-[#96978b]">
                    A quick look at what's new
                  </p>
                </div>
                <div className="px-5 py-8 text-center">
                  <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#eef0e5] text-[#71815f]">
                    <Sparkles size={18} />
                  </div>
                  <p className="text-sm font-medium text-[#536047]">
                    You're all caught up!
                  </p>
                  <p className="mt-1 text-xs text-[#999b8e]">
                    No new notifications right now.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div ref={profileRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setProfileOpen((open) => !open);
                setNotificationOpen(false);
              }}
              aria-label="Open profile menu"
              aria-expanded={profileOpen}
              className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-[#f3f1e9] sm:gap-3 sm:pr-2"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#758464] text-sm font-semibold text-white ring-2 ring-[#e8ebdf]">
                {userInitial}
              </span>
              <span className="hidden text-left sm:block">
                <span className="block max-w-28 truncate text-[13px] font-semibold text-[#3c4635]">
                  {user?.name || "User"}
                </span>
                <span className="mt-0.5 block text-[10px] text-[#999b8e]">
                  Personal account
                </span>
              </span>
              <ChevronDown
                size={15}
                className="hidden text-[#a0a092] sm:block"
              />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-14 z-50 w-60 overflow-hidden rounded-2xl border border-[#e9e5da] bg-[#fffefa] shadow-[0_16px_45px_rgba(54,58,43,0.12)]">
                <div className="border-b border-[#efede5] bg-[#f7f6ef] px-4 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#758464] text-sm font-semibold text-white">
                      {userInitial}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#35412f]">
                        {user?.name || "User"}
                      </p>
                      <p className="truncate text-xs text-[#999b8e]">
                        {user?.email || ""}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/settings");
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#65705b] transition hover:bg-[#f2f0e8] hover:text-[#536747]"
                  >
                    <Settings size={17} />
                    <span>Settings</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#a16f63] transition hover:bg-[#fbf0eb] hover:text-[#b65e4e]"
                  >
                    <LogOut size={17} />
                    <span>Log out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {searchOpen && (
        <form
          onSubmit={handleSearchSubmit}
          className="border-t border-[#efede5] bg-[#fffefa] px-4 pb-4 pt-3 md:hidden"
        >
          <div className="relative">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a1a294]"
            />
            <input
              type="text"
              autoFocus
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search transactions, budgets, goals..."
              aria-label="Search FinTrack"
              className={searchInputClass}
            />
          </div>
        </form>
      )}
    </header>
  );
}

export default Navbar;
