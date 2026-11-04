
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import {
  LayoutDashboard,
  Users,
  UserRound,
  PhoneCall,
  Contact,
  ClipboardList,
  ExternalLink,
  Handshake,
  Building2,
  Bot,
  FileText,
  Network,
  Inbox,
  CalendarDays,
  ListTodo,
  Share2,
  Settings2,
  MessageCircle,
  Mail,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  PanelLeft,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

/* =========================================
   TYPES
========================================= */

interface SidebarProps {
  collapsed?: boolean;
  mobileOpen?: boolean;
  onClose?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const mainNavItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Customers",
    href: "/customer",
    icon: Users,
  },
  {
    label: "Customer Follow Up",
    href: "/customer-follow-up",
    icon: ClipboardList,
  },
  {
    label: "Customer Calling",
    href: "/customer-calling",
    icon: PhoneCall,
  },
  {
    label: "Contact",
    href: "/contact",
    icon: Contact,
  },
  {
    label: "Contact Follow Up",
    href: "/contact-follow-up",
    icon: ClipboardList,
  },
  {
    label: "External Leads",
    href: "/external-leads",
    icon: ExternalLink,
  },
  {
    label: "Clients",
    href: "/clients",
    icon: Handshake,
  },
  {
    label: "Company Project",
    href: "/company-project",
    icon: Building2,
  },
  {
    label: "Company Project Enquiry",
    href: "/company-project-enquiry",
    icon: ClipboardList,
  },
  {
    label: "AI Agents",
    href: "/ai-agents",
    icon: Bot,
  },
  {
    label: "Sales Script",
    href: "/sales-script",
    icon: FileText,
  },
  {
    label: "Journey",
    href: "/journey",
    icon: Network,
  },
  {
    label: "Inbox",
    href: "/inbox",
    icon: Inbox,
  },
];

const outreachItems: NavItem[] = [
  {
    label: "WhatsApp",
    href: "/outreach-channels/whatsapp",
    icon: MessageCircle,
  },
  {
    label: "Email",
    href: "/outreach-channels/email",
    icon: Mail,
  },
  {
    label: "SMS",
    href: "/outreach-channels/sms",
    icon: MessageSquare,
  },
];

const bottomNavItems: NavItem[] = [
  {
    label: "Schedules",
    href: "/schedules",
    icon: CalendarDays,
  },
  {
    label: "Task",
    href: "/task",
    icon: ListTodo,
  },
  {
    label: "Social Media Manager",
    href: "/social-media-manager",
    icon: Share2,
  },
  {
    label: "Masters",
    href: "/masters",
    icon: Settings2,
  },
];

/* =========================================
   SIDEBAR COMPONENT
========================================= */

export default function Sidebar({
  collapsed = false,
  mobileOpen = false,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();

  const isOutreachActive = pathname.startsWith(
    "/outreach-channels"
  );

  const [outreachOpen, setOutreachOpen] = useState(
    isOutreachActive
  );

  // Automatically expand Outreach when one
  // of its channel pages is active.
  useEffect(() => {
    if (isOutreachActive) {
      setOutreachOpen(true);
    }
  }, [isOutreachActive]);

  const isActive = (href: string) => {
    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  };

  const getNavClass = (active: boolean) => {
    return `
      flex items-center gap-3
      h-[39px] px-3
      rounded-lg
      text-[14px] font-medium
      transition-all duration-200
      ${
        active
          ? "bg-[#00A9B7] text-white shadow-sm"
          : "text-[#344258] hover:bg-[#E5F8FA] hover:text-[#008F9F]"
      }
    `;
  };

  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon;
    const active = isActive(item.href);

    return (
      <Link
        key={item.href}
        href={item.href}
        title={collapsed ? item.label : undefined}
        onClick={onClose}
        aria-current={active ? "page" : undefined}
        className={getNavClass(active)}
      >
        <Icon
          size={18}
          strokeWidth={1.8}
          className="shrink-0"
        />

        {!collapsed && (
          <span className="truncate">
            {item.label}
          </span>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
        />
      )}

      <aside
        className={`
          ${
            mobileOpen
              ? "fixed left-0 top-0 z-50 flex md:sticky md:z-10"
              : "hidden md:sticky md:top-0 md:flex"
          }
          h-screen shrink-0 flex-col
          overflow-hidden
          border-r border-[#E5EAF0]
          bg-white
          transition-[width] duration-300
          ${collapsed ? "w-[76px]" : "w-[255px]"}
        `}
      >
        {/* =====================================
            LOGO SECTION
        ===================================== */}

        <div
          className={`
            flex h-[90px] shrink-0 items-center
            border-b border-[#EDF0F4]
            ${collapsed ? "justify-center px-2" : "px-5"}
          `}
        >
          <Link
            href="/dashboard"
            onClick={onClose}
            className="flex items-center gap-2"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center">
              <Building2
                size={34}
                strokeWidth={2.2}
                className="text-[#009EB3]"
              />
            </div>

            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-[17px] font-extrabold leading-5 tracking-tight text-[#075A85]">
                  PROPERTY
                </span>

                <span className="text-[11px] leading-4 text-[#8293A8]">
                  ibigdata.in
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* =====================================
            NAVIGATION
        ===================================== */}

        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3">
          <div className="flex flex-col gap-[3px]">

            {/* Main navigation */}
            {mainNavItems.map(renderNavItem)}

            {/* =================================
                OUTREACH CHANNELS
            ================================= */}

            <div className="mt-1">
              <button
                type="button"
                title={
                  collapsed
                    ? "Outreach Channels"
                    : undefined
                }
                onClick={() =>
                  setOutreachOpen(!outreachOpen)
                }
                aria-expanded={outreachOpen}
                className={`
                  flex h-[39px] w-full
                  items-center justify-between
                  rounded-lg px-3
                  text-[14px] font-medium
                  transition-all duration-200
                  ${
                    isOutreachActive
                      ? "bg-[#00A9B7] text-white shadow-sm"
                      : "text-[#344258] hover:bg-[#E5F8FA] hover:text-[#008F9F]"
                  }
                `}
              >
                <span className="flex items-center gap-3">
                  <Network
                    size={18}
                    strokeWidth={1.8}
                    className="shrink-0"
                  />

                  {!collapsed && (
                    <span className="truncate">
                      Outreach Channels
                    </span>
                  )}
                </span>

                {!collapsed &&
                  (outreachOpen ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  ))}
              </button>

              {/* Channel submenu */}
              {!collapsed && outreachOpen && (
                <div className="mt-1 ml-3 flex flex-col gap-1 border-l border-[#DDE7F0] pl-2">
                  {outreachItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        aria-current={
                          active ? "page" : undefined
                        }
                        className={`
                          flex h-[36px] items-center gap-3
                          rounded-lg px-3
                          text-[13px] font-medium
                          transition-all duration-200
                          ${
                            active
                              ? "bg-[#E0F7F8] text-[#008F9F]"
                              : "text-[#344258] hover:bg-[#F0FAFB] hover:text-[#008F9F]"
                          }
                        `}
                      >
                        <Icon
                          size={17}
                          strokeWidth={1.9}
                          className="shrink-0"
                        />

                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom navigation */}
            <div className="mt-1 flex flex-col gap-[3px]">
              {bottomNavItems.map((item) => (
                <div key={item.href} className="relative">
                  {renderNavItem(item)}

                  {/* Masters arrow */}
                  {item.label === "Masters" &&
                    !collapsed && (
                      <ChevronRight
                        size={16}
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8293A8]"
                      />
                    )}
                </div>
              ))}
            </div>
          </div>
        </nav>

        {/* =====================================
            SIDEBAR FOOTER
        ===================================== */}

        <div className="shrink-0 border-t border-[#EDF0F4] px-3 py-3">
          <div
            className={`
              flex items-center gap-2
              ${collapsed ? "justify-center" : "px-1"}
            `}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E5F8FA]">
              <UserRound
                size={17}
                className="text-[#008F9F]"
              />
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-[12px] font-semibold text-[#17324D]">
                  Admin
                </p>
                <p className="text-[10px] text-[#8293A8]">
                  CRM Administrator
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
