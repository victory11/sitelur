"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "./UserContext";

type Role = "admin" | "notulis" | "viewer";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: Role[];
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    roles: ["admin", "notulis", "viewer"],
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    label: "Input Rapat",
    href: "/rapat/input",
    roles: ["admin", "notulis"],
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    label: "Daftar Rapat",
    href: "/rapat",
    roles: ["admin", "notulis", "viewer"],
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    label: "Tindak Lanjut",
    href: "/tindak-lanjut",
    roles: ["admin", "notulis", "viewer"],
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: "Master Data",
    href: "/master",
    roles: ["admin"],
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7zm0 5h16" />
      </svg>
    ),
  },
];

const roleBadge: Record<string, { label: string; color: string; bgLight: string; icon: string }> = {
  admin: { label: "Admin", color: "bg-purple-500", bgLight: "bg-purple-100 text-purple-700", icon: "⚡" },
  notulis: { label: "Notulis", color: "bg-blue-500", bgLight: "bg-blue-100 text-blue-700", icon: "📝" },
  viewer: { label: "Viewer", color: "bg-gray-500", bgLight: "bg-gray-100 text-gray-700", icon: "👁️" },
};

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useUser();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/rapat")
      return pathname === "/rapat" || (pathname.startsWith("/rapat/") && !pathname.startsWith("/rapat/input"));
    return pathname.startsWith(href);
  };

  const userRole = user?.role || "viewer";
  const roleInfo = roleBadge[userRole] || roleBadge.viewer;

  const visibleNav = navItems.filter((item) =>
    user ? item.roles.includes(user.role) : true
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white shadow-lg rounded-lg p-2 hover:bg-gray-50"
      >
        <svg className="w-6 h-6 text-[#1A6EB5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-[#1C2A3A] text-white z-50 transition-all duration-300 flex flex-col
          ${collapsed ? "w-[68px]" : "w-64"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
          <div className="w-10 h-10 bg-[#1A6EB5] rounded-xl flex items-center justify-center font-bold text-lg shrink-0">
            🏥
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <h1 className="font-bold text-base leading-tight">SITELUR</h1>
              <p className="text-[10px] text-gray-400 leading-tight">Tata Kelola Rapat RSUD</p>
            </div>
          )}
          <button
            onClick={() => { setCollapsed(!collapsed); setMobileOpen(false); }}
            className="ml-auto text-gray-400 hover:text-white hidden lg:block"
          >
            <svg className={`w-4 h-4 transition-transform ${collapsed ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button onClick={() => setMobileOpen(false)} className="ml-auto text-gray-400 hover:text-white lg:hidden">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Role badge */}
        {!collapsed && user && (
          <div className="mx-3 mt-3 px-3 py-2 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 ${roleInfo.color} text-white text-[10px] font-bold px-2 py-0.5 rounded-full`}>
                {roleInfo.icon} {roleInfo.label.toUpperCase()}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 mt-1 truncate">
              {userRole === "admin" && "Akses penuh sistem"}
              {userRole === "notulis" && "Input & edit rapat"}
              {userRole === "viewer" && "Hanya lihat data"}
            </p>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {visibleNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all
                ${isActive(item.href)
                  ? "bg-[#1A6EB5] text-white shadow-lg shadow-[#1A6EB5]/25"
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
                }
              `}
              title={collapsed ? item.label : ""}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Footer - User info + LOGOUT BUTTON (always visible) */}
        <div className="border-t border-white/10 p-3 space-y-2">
          {/* User info */}
          <div className="flex items-center gap-3 px-2">
            <div className={`w-9 h-9 ${roleInfo.color} rounded-full flex items-center justify-center text-sm font-bold shrink-0`}>
              {user?.nama?.[0]?.toUpperCase() || "?"}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold truncate">{user?.nama || "Loading..."}</p>
                <p className="text-[10px] text-gray-400 truncate">{user?.email || ""}</p>
              </div>
            )}
          </div>

          {/* Logout button - ALWAYS VISIBLE */}
          {!collapsed ? (
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg text-xs font-medium transition-colors border border-red-500/20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Keluar
            </button>
          ) : (
            <button
              onClick={logout}
              className="w-full flex items-center justify-center p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-colors"
              title="Keluar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
