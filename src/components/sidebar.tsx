"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { getInitials } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  CalendarClock,
  Settings,
  Shield,
  HelpCircle,
  ChevronRight,
  LogOut,
  ChevronUp,
  Menu,
  X,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const adminNavItems: NavItem[] = [
  { label: "Dashboard",      href: "/dashboard",  icon: <LayoutDashboard size={18} /> },
  { label: "Leads",          href: "/leads",      icon: <Users size={18} /> },
  { label: "Follow-ups",     href: "/followups",  icon: <CalendarClock size={18} /> },
  { label: "Lead Questions", href: "/questions",  icon: <HelpCircle size={18} /> },
  { label: "Settings",       href: "/settings",   icon: <Settings size={18} /> },
  { label: "Integrations",   href: "/admin",      icon: <Shield size={18} /> },
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
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = userRole === "SUPER_ADMIN" ? superAdminNavItems : adminNavItems;

  const initials = getInitials(userName) || "U";

  return (
    <>
      {/* Mobile Header */}
      <div className="mobile-header">
        <div className="mobile-brand">
          <div className="mobile-logo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span className="mobile-title">LeadCRM</span>
        </div>
        <button 
          className="mobile-menu-btn"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar - Desktop fixed, Mobile overlay */}
      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div className="sidebar-title">
            <div className="sidebar-title-main">LeadCRM</div>
            <div className="sidebar-title-sub">Precision Ledger</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <span className={`sidebar-icon ${isActive ? 'active' : ''}`}>
                  {item.icon}
                </span>
                {item.label}
                {isActive && (
                  <ChevronRight size={14} className="sidebar-chevron" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="sidebar-footer">
          <button
            className="sidebar-user-btn"
            onClick={() => setShowMenu(!showMenu)}
          >
            <div className="sidebar-avatar">
              {initials}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{userName || "User"}</div>
              <div className="sidebar-user-role">
                {userRole ? userRole.toLowerCase().replace("_", " ") : "user"}
              </div>
              {userEmail && (
                <div className="sidebar-user-role">{userEmail}</div>
              )}
            </div>
            <ChevronUp 
              size={16} 
              className={`sidebar-chevron-up ${showMenu ? 'rotated' : ''}`} 
            />
          </button>

          {/* Dropdown menu */}
          {showMenu && (
            <div className="sidebar-dropdown">
              <button
                className="sidebar-logout-btn"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}
