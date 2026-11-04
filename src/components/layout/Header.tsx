
"use client";

import { useEffect, useRef, useState } from "react";

import {
  PanelLeft,
  Moon,
  Sun,
  Bell,
  Plus,
  ChevronDown,
  LogOut,
  UserRound,
  Users,
  Contact,
  ListTodo,
  Network,
} from "lucide-react";

/* =========================================
   TYPES
========================================= */

export type QuickAddType =
  | "customer"
  | "contact"
  | "task"
  | "journey";

interface HeaderProps {
  onMenuClick: () => void;
  onToggleTheme?: () => void;
  onQuickAdd?: (type: QuickAddType) => void;
  onNotificationsClick?: () => void;
  onLogout?: () => void;

  isDarkMode?: boolean;
  notificationCount?: number;
  adminLabel?: string;
}

/* =========================================
   QUICK ADD OPTIONS
========================================= */

const quickAddOptions = [
  {
    label: "Add Customer",
    type: "customer" as const,
    icon: Users,
  },
  {
    label: "Add Contact",
    type: "contact" as const,
    icon: Contact,
  },
  {
    label: "Create Task",
    type: "task" as const,
    icon: ListTodo,
  },
  {
    label: "Create Journey",
    type: "journey" as const,
    icon: Network,
  },
];

/* =========================================
   HEADER COMPONENT
========================================= */

export default function Header({
  onMenuClick,
  onToggleTheme,
  onQuickAdd,
  onNotificationsClick,
  onLogout,
  isDarkMode = false,
  notificationCount = 20,
  adminLabel = "Admin mail",
}: HeaderProps) {
  const [openMenu, setOpenMenu] = useState<
    "quickAdd" | "admin" | null
  >(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  /* =========================================
     CLOSE DROPDOWNS ON OUTSIDE CLICK
  ========================================= */

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenMenu(null);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  /* =========================================
     TOGGLE DROPDOWN
  ========================================= */

  const toggleMenu = (menu: "quickAdd" | "admin") => {
    setOpenMenu((current) =>
      current === menu ? null : menu
    );
  };

  return (
    <header className="sticky top-0 z-30 flex h-[58px] w-full shrink-0 items-center justify-between border-b border-[#E5EAF0] bg-white px-4 md:px-6">

      {/* =====================================
          LEFT SECTION
      ===================================== */}

      <div className="flex items-center gap-3">

        {/* Sidebar Toggle */}
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Toggle sidebar"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[#344258] transition hover:bg-[#E5F8FA] hover:text-[#008F9F]"
        >
          <PanelLeft size={19} strokeWidth={1.8} />
        </button>

      </div>

      {/* =====================================
          RIGHT SECTION
      ===================================== */}

      <div
        ref={dropdownRef}
        className="flex items-center gap-2 md:gap-4"
      >

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label="Toggle theme"
          title="Toggle theme"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[#344258] transition hover:bg-[#E5F8FA] hover:text-[#008F9F]"
        >
          {isDarkMode ? (
            <Sun size={19} strokeWidth={1.8} />
          ) : (
            <Moon size={19} strokeWidth={1.8} />
          )}
        </button>

        {/* Notifications */}
        <button
          type="button"
          onClick={onNotificationsClick}
          aria-label={`${notificationCount} notifications`}
          title="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-[#344258] transition hover:bg-[#E5F8FA] hover:text-[#008F9F]"
        >
          <Bell size={19} strokeWidth={1.8} />

          {notificationCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#00A9B7] px-1 text-[9px] font-bold text-white">
              {notificationCount > 99
                ? "99+"
                : notificationCount}
            </span>
          )}
        </button>

        {/* =================================
            QUICK ADD DROPDOWN
        ================================= */}

        <div className="relative">
          <button
            type="button"
            onClick={() => toggleMenu("quickAdd")}
            aria-expanded={openMenu === "quickAdd"}
            className="flex h-9 items-center gap-2 rounded-lg px-2 text-[14px] font-medium text-[#344258] transition hover:bg-[#E5F8FA] hover:text-[#008F9F] md:px-3"
          >
            <Plus size={19} strokeWidth={2} />

            <span className="hidden sm:inline">
              Quick Add
            </span>

            <ChevronDown
              size={15}
              className={`hidden transition-transform sm:block ${
                openMenu === "quickAdd" ? "rotate-180" : ""
              }`}
            />
          </button>

          {openMenu === "quickAdd" && (
            <div className="absolute right-0 top-[46px] z-50 w-[210px] overflow-hidden rounded-xl border border-[#DDE7F0] bg-white py-2 shadow-xl">

              <p className="px-4 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-[#8293A8]">
                Quick Create
              </p>

              {quickAddOptions.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => {
                      onQuickAdd?.(item.type);
                      setOpenMenu(null);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[13px] font-medium text-[#344258] transition hover:bg-[#E5F8FA] hover:text-[#008F9F]"
                  >
                    <Icon size={17} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* =================================
            ADMIN MENU
        ================================= */}

        <div className="relative">
          <button
            type="button"
            onClick={() => toggleMenu("admin")}
            aria-expanded={openMenu === "admin"}
            className="flex h-9 items-center gap-2 rounded-lg px-2 text-[14px] font-medium text-[#344258] transition hover:bg-[#E5F8FA] hover:text-[#008F9F] md:px-3"
          >
            <span className="hidden sm:inline">
              {adminLabel}
            </span>

            <ChevronDown
              size={15}
              className={`transition-transform ${
                openMenu === "admin" ? "rotate-180" : ""
              }`}
            />
          </button>

          {openMenu === "admin" && (
            <div className="absolute right-0 top-[46px] z-50 w-[220px] overflow-hidden rounded-xl border border-[#DDE7F0] bg-white p-2 shadow-xl">

              <div className="flex items-center gap-3 border-b border-[#EDF0F4] px-3 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E5F8FA] text-[#008F9F]">
                  <UserRound size={19} />
                </div>

                <div>
                  <p className="text-[13px] font-semibold text-[#17324D]">
                    Administrator
                  </p>

                  <p className="text-[11px] text-[#8293A8]">
                    CRM Account
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setOpenMenu(null);
                  onLogout?.();
                }}
                className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-red-600 transition hover:bg-red-50"
              >
                <LogOut size={17} />
                Logout
              </button>
            </div>
          )}
        </div>

        {/* =================================
            LOGOUT BUTTON
        ================================= */}

        <button
          type="button"
          onClick={onLogout}
          aria-label="Logout"
          title="Logout"
          className="ml-1 flex h-9 w-9 items-center justify-center rounded-lg text-[#344258] transition hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={19} strokeWidth={1.8} />
        </button>

      </div>
    </header>
  );
}
