"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CalendarClock,
  Settings,
  Shield,
  ChevronRight,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={18} /> },
  { label: "Leads",     href: "/leads",     icon: <Users size={18} /> },
  { label: "Follow-ups",href: "/followups", icon: <CalendarClock size={18} /> },
  { label: "Settings",  href: "/settings",  icon: <Settings size={18} /> },
  { label: "Admin",     href: "/admin",     icon: <Shield size={18} />, adminOnly: true },
];

interface SidebarProps {
  userRole?: string;
  userName?: string;
  userEmail?: string;
}

export function Sidebar({ userRole, userName, userEmail }: SidebarProps) {
  const pathname = usePathname();

  const visibleItems = navItems.filter(
    (item) => !item.adminOnly || userRole === "ADMIN" || userRole === "SUPER_ADMIN"
  );

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
        {visibleItems.map((item) => {
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

      {/* User footer */}
      <div style={{
        padding: "1rem 1.25rem",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
      }}>
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
        <div style={{ overflow: "hidden", flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "0.8125rem", fontWeight: "600", color: "#f8fafc", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {userName || "User"}
          </div>
          <div style={{ fontSize: "0.6875rem", color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {userRole ? userRole.toLowerCase().replace("_", " ") : "user"}
          </div>
        </div>
      </div>
    </aside>
  );
}
