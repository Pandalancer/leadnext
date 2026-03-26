"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  CalendarClock,
  Settings,
  Shield,
  ChevronRight,
  LogOut,
  ChevronUp,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const adminNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={18} /> },
  { label: "Leads",     href: "/leads",     icon: <Users size={18} /> },
  { label: "Follow-ups",href: "/followups", icon: <CalendarClock size={18} /> },
  { label: "Settings",  href: "/settings",  icon: <Settings size={18} /> },
  { label: "Admin",     href: "/admin",     icon: <Shield size={18} /> },
];

const superAdminNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={18} /> },
  { label: "Admins",    href: "/admins",    icon: <Users size={18} /> },
  { label: "All Leads", href: "/all-leads", icon: <LayoutDashboard size={18} /> },
  { label: "Settings",  href: "/settings",  icon: <Settings size={18} /> },
];

interface SidebarProps {
  userRole?: string;
  userName?: string;
  userEmail?: string;
}

export function Sidebar({ userRole, userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const [showMenu, setShowMenu] = useState(false);

  // Different navigation for Super Admin vs Admin/Client
  const navItems = userRole === "SUPER_ADMIN" ? superAdminNavItems : adminNavItems;

  const initials = userName
    ? userName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  return (
    <aside style={{
      width: "240px",
      minWidth: "240px",
      background: "var(--sidebar-bg)",
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
      position: "relative",
    }}>
      {/* Brand */}
      <div style={{
        padding: "1.5rem 1.25rem 1rem",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        alignItems: "center",
        gap: "0.625rem",
      }}>
        <div style={{
          width: "32px", height: "32px",
          background: "linear-gradient(145deg, #10b981, #059669)",
          borderRadius: "8px",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
          boxShadow: "0 2px 8px rgba(16,185,129,0.4)"
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: "0.9375rem", fontWeight: "700", color: "#f8fafc", letterSpacing: "-0.01em" }}>
            LeadCRM
          </div>
          <div style={{ fontSize: "0.625rem", color: "var(--emerald)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: "600" }}>
            Precision Ledger
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "0.75rem 0.625rem", display: "flex", flexDirection: "column", gap: "0.125rem" }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.5rem 0.75rem",
                borderRadius: "0.375rem",
                fontSize: "0.8125rem",
                fontWeight: isActive ? "600" : "500",
                color: isActive ? "#10b981" : "var(--text-on-sidebar)",
                background: isActive ? "rgba(16,185,129,0.1)" : "transparent",
                borderLeft: isActive ? "3px solid #10b981" : "3px solid transparent",
                textDecoration: "none",
                transition: "background 0.15s, color 0.15s",
              }}
            >
              <span style={{ color: isActive ? "#10b981" : "#64748b", flexShrink: 0 }}>
                {item.icon}
              </span>
              {item.label}
              {isActive && (
                <ChevronRight size={14} style={{ marginLeft: "auto", opacity: 0.6 }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User footer - clickable dropdown */}
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          style={{
            width: "100%",
            padding: "1rem 1.25rem",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            background: "transparent",
            border: "none",
            borderBottom: "none",
            borderLeft: "none",
            borderRight: "none",
            cursor: "pointer",
            color: "inherit",
          }}
        >
          <div style={{
            width: "32px", height: "32px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #1e293b, #334155)",
            border: "2px solid rgba(16,185,129,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.6875rem",
            fontWeight: "700",
            color: "#10b981",
            flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ overflow: "hidden", flex: 1, minWidth: 0, textAlign: "left" }}>
            <div style={{ fontSize: "0.8125rem", fontWeight: "600", color: "#f8fafc", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {userName || "User"}
            </div>
            <div style={{ fontSize: "0.6875rem", color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {userRole ? userRole.toLowerCase().replace("_", " ") : "user"}
            </div>
          </div>
          <ChevronUp size={16} style={{ color: "#64748b", transform: showMenu ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
        </button>

        {/* Dropdown menu */}
        {showMenu && (
          <div style={{
            position: "absolute",
            bottom: "100%",
            left: "1rem",
            right: "1rem",
            marginBottom: "0.5rem",
            background: "var(--surface-card)",
            border: "1px solid var(--outline-ghost)",
            borderRadius: "0.5rem",
            padding: "0.5rem",
            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.3)",
            zIndex: 50,
          }}>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.625rem 0.75rem",
                borderRadius: "0.375rem",
                background: "transparent",
                border: "none",
                color: "#ef4444",
                fontSize: "0.8125rem",
                fontWeight: "500",
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(239,68,68,0.1)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
