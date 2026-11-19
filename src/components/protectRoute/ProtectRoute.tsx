"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

function ProtectedRouteContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { admin, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const publicPaths = [
    "/admin",
    "/register",
    "/system/maintenance/access/signup",
  ];

  const isPublicPage = publicPaths.includes(pathname);
  const shouldBlock = !isPublicPage && (isLoading || !admin);

  useEffect(() => {
    if (isLoading || isPublicPage) return;

    if (!admin) {
      router.replace("/admin");
    }
  }, [admin, isLoading, isPublicPage, router]);

  return (
    <div className="relative min-h-full">
      {/* Always render route children */}
      <div
        className={shouldBlock ? "invisible" : "visible"}
        aria-hidden={shouldBlock}
      >
        {children}
      </div>

      {/* Loading overlay */}
      {shouldBlock && (
        <div
          className="fixed inset-0 z-[9999] grid min-h-screen place-items-center bg-white"
          role="status"
          aria-live="polite"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
            <p className="text-sm text-gray-500">
              {isLoading ? "Checking authentication..." : "Redirecting..."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen place-items-center">
          Loading...
        </div>
      }
    >
      <ProtectedRouteContent>{children}</ProtectedRouteContent>
    </Suspense>
  );
}