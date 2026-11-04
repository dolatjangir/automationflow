
"use client";

import { Suspense, useEffect, useState } from "react";
import type { ReactNode } from "react";

import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/Header";

/* =========================================
   DASHBOARD LAYOUT
========================================= */

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  /* =========================================
     SIDEBAR TOGGLE
  ========================================= */

  const handleMenuClick = () => {
    // Mobile: Open / close sidebar
    if (window.matchMedia("(max-width: 767px)").matches) {
      setMobileOpen((prev) => !prev);
    } else {
      // Desktop: Collapse / expand sidebar
      setCollapsed((prev) => !prev);
    }
  };

  /* =========================================
     CLOSE MOBILE SIDEBAR
     WHEN NAVIGATION OCCURS
  ========================================= */

  const closeMobileSidebar = () => {
    setMobileOpen(false);
  };

  /* =========================================
     HANDLE SCREEN RESIZE
  ========================================= */

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  /* =========================================
     RENDER
  ========================================= */

  return (
    <div className="flex min-h-screen w-full bg-crm-background">

      {/* =====================================
          SIDEBAR
      ===================================== */}

     <Suspense
  fallback={
    <aside className="hidden h-screen w-[255px] shrink-0 bg-white md:block" />
  }
>
  <Sidebar
    collapsed={collapsed && !mobileOpen}
    mobileOpen={mobileOpen}
    onClose={closeMobileSidebar}
  />
</Suspense>

      {/* =====================================
          MAIN CONTENT AREA
      ===================================== */}

      <div className="flex min-w-0 flex-1 flex-col">

        {/* HEADER */}
        <Header
          onMenuClick={handleMenuClick}
          notificationCount={20}
          adminLabel="Admin mail"
        />

        {/* =================================
            PAGE CONTENT
        ================================= */}

        <main className="min-h-[calc(100vh-58px)] min-w-0 flex-1 overflow-x-hidden bg-crm-background p-4 md:p-5 lg:p-6">

          {children}

        </main>

      </div>
    </div>
  );
}
