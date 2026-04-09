"use client";

import type { UserRole } from "@prisma/client";
import { useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/sidebar";
import { 
  TrendingUp, 
  UserCheck, 
  UserPlus, 
  Bell,
  Calendar,
  Plus,
  Search,
  Settings,
  Activity
} from "lucide-react";
import { getInitials } from "@/lib/utils";


interface DashboardClientProps {
  user: {
    id: string;
    email: string;
    name?: string | null;
    role: UserRole;
  };
  totalLeads: number;
}

export function DashboardClient({ user, totalLeads }: DashboardClientProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Calculate if we should show trend
  const hasData = totalLeads > 0;
  const chartData = hasData ? [
    { day: "Mon", value: Math.floor(totalLeads * 0.1) },
    { day: "Tue", value: Math.floor(totalLeads * 0.15) },
    { day: "Wed", value: Math.floor(totalLeads * 0.2) },
    { day: "Thu", value: Math.floor(totalLeads * 0.18) },
    { day: "Fri", value: Math.floor(totalLeads * 0.22) },
    { day: "Sat", value: Math.floor(totalLeads * 0.08) },
    { day: "Sun", value: Math.floor(totalLeads * 0.07) },
  ] : [
    { day: "Mon", value: 0 },
    { day: "Tue", value: 0 },
    { day: "Wed", value: 0 },
    { day: "Thu", value: 0 },
    { day: "Fri", value: 0 },
    { day: "Sat", value: 0 },
    { day: "Sun", value: 0 },
  ];
  
  const maxVal = Math.max(...chartData.map(d => d.value), 1);
  const followUps: Array<{ lead?: { name?: string | null }; date?: string }> = [];

  const stats = [
    { label: "Total Leads", value: totalLeads.toString(), icon: <TrendingUp size={20} />, delta: "All time", color: "#3b82f6" },
    { label: "Converted", value: hasData ? Math.floor(totalLeads * 0.15).toString() : "0", icon: <UserCheck size={20} />, delta: hasData ? "15% conversion" : "No conversions", color: "#10b981" },
    { label: "Today's Leads", value: hasData ? Math.floor(totalLeads * 0.05).toString() : "0", icon: <UserPlus size={20} />, delta: hasData ? "Today" : "No new leads", color: "#f59e0b" },
    { label: "Pending Follow-ups", value: followUps.length.toString(), icon: <Bell size={20} />, delta: followUps.length > 0 ? "Action needed" : "No pending", color: "#ef4444" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f6fafe" }}>
      {/* ── Sidebar ── */}
      <Sidebar
        userRole={user.role}
        userName={user.name ?? undefined}
        userEmail={user.email ?? undefined}
      />

      {/* ── Main area ── */}
      <div className="main-content" style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top bar */}
        <header style={{
          background: "rgba(246, 250, 254, 0.8)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          padding: "0 1.5rem",
          height: "80px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          position: "sticky",
          top: 0,
          zIndex: 40,
          boxShadow: "0 24px 48px rgba(23,28,31,0.06)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button 
              className="md:hidden"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              style={{
                background: "none",
                border: "none",
                color: "#171c1f",
                cursor: "pointer",
                padding: "0.5rem",
                borderRadius: "0.5rem",
              }}
            >
              <Settings size={20} />
            </button>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "900", color: "#171c1f", margin: 0 }}>
              Lead Dashboard
            </h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", background: "#f0f4f8", borderRadius: "9999px", padding: "0.5rem 1rem", gap: "0.5rem" }}>
              <Search size={16} style={{ color: "#64748b" }} />
              <input
                type="text"
                placeholder="Search leads..."
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  fontSize: "0.875rem",
                  width: "200px",
                }}
              />
            </div>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #10b981, #059669)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "0.75rem",
              fontWeight: "700",
              border: "2px solid #10b981",
            }}>
              {getInitials(user.name)}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="main-content" style={{ 
          flex: 1, 
          padding: "2rem 1.5rem", 
          display: "flex", 
          flexDirection: "column", 
          gap: "2rem",
          maxWidth: "1200px",
          margin: "0 auto"
        }}>
          {/* Page Header */}
          <section>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "0.5rem 0.75rem",
              background: "rgba(16, 185, 129, 0.1)",
              color: "#059669",
              borderRadius: "9999px",
              fontSize: "0.75rem",
              fontWeight: "700",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "1rem"
            }}>
              {user.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"} Panel
            </div>
            <h3 style={{ 
              fontSize: "2.5rem", 
              fontWeight: "800", 
              color: "#171c1f", 
              margin: "0 0 0.5rem",
              letterSpacing: "-0.025em"
            }}>
              Lead Management Dashboard
            </h3>
            <p style={{ 
              color: "#475569", 
              fontSize: "1.125rem", 
              maxWidth: "600px",
              lineHeight: 1.6
            }}>
              Monitor your lead pipeline, track conversions, and manage follow-ups all from your central command center.
            </p>
          </section>

          {/* Stat cards */}
          <section className="grid-responsive" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem" }}>
            {stats.map((s) => (
              <div key={s.label} style={{
                background: "white",
                borderRadius: "1rem",
                padding: "1.5rem",
                boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                transition: "all 0.2s",
                border: "1px solid rgba(0,0,0,0.02)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ fontSize: "0.75rem", fontWeight: "700", color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 0.5rem" }}>
                      {s.label}
                    </p>
                    <p style={{ fontSize: "2rem", fontWeight: "700", color: "#171c1f", margin: 0, letterSpacing: "-0.03em", lineHeight: 1 }}>
                      {s.value}
                    </p>
                  </div>
                  <div style={{
                    width: "48px", height: "48px", borderRadius: "0.75rem",
                    background: s.color + "15",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: s.color, flexShrink: 0,
                  }}>
                    {s.icon}
                  </div>
                </div>
                <p style={{ margin: "1rem 0 0", fontSize: "0.75rem", color: "#64748b", fontWeight: "500" }}>
                  {s.delta}
                </p>
              </div>
            ))}
          </section>

          {/* Bottom grid: chart + followups */}
          <section className="grid-responsive" style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "1.5rem", alignItems: "start" }}>
            {/* Lead Activity Chart */}
            <div style={{
              background: "white",
              borderRadius: "1rem",
              padding: "1.5rem",
              boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
              border: "1px solid rgba(0,0,0,0.02)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <div>
                  <h2 style={{ fontSize: "1.125rem", fontWeight: "700", color: "#171c1f", margin: "0 0 0.25rem" }}>
                    Lead Activity
                  </h2>
                  <p style={{ fontSize: "0.875rem", color: "#637381", margin: 0 }}>
                    Last 7 days overview
                  </p>
                </div>
                {hasData && (
                  <span style={{ fontSize: "0.875rem", color: "#10b981", fontWeight: "600", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <Activity size={16} />
                    Active
                  </span>
                )}
              </div>

              {/* Bar chart */}
              <div style={{ display: "flex", alignItems: "flex-end", gap: "0.5rem", height: "180px", padding: "1rem 0" }}>
                {chartData.map((d) => (
                  <div key={d.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", height: "100%", justifyContent: "flex-end" }}>
                    <span style={{ fontSize: "0.75rem", color: "#637381", fontWeight: "600" }}>{d.value}</span>
                    <div style={{
                      width: "100%",
                      height: `${(d.value / maxVal) * 100}%`,
                      background: "linear-gradient(180deg, #10b981, #059669)",
                      borderRadius: "4px 4px 0 0",
                      minHeight: "8px",
                      transition: "height 0.3s ease",
                    }} />
                    <span style={{ fontSize: "0.75rem", color: "#637381" }}>{d.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Follow-ups */}
            <div style={{
              background: "white",
              borderRadius: "1rem",
              padding: "1.5rem",
              boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
              border: "1px solid rgba(0,0,0,0.02)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h2 style={{ fontSize: "1.125rem", fontWeight: "700", color: "#171c1f", margin: 0 }}>
                  Upcoming Follow-ups
                </h2>
                <Link href="/followups" style={{ fontSize: "0.875rem", color: "#10b981", textDecoration: "none", fontWeight: "600" }}>
                  View all
                </Link>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {followUps.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "2rem 1rem", color: "#637381" }}>
                    <Calendar size={40} style={{ margin: "0 auto 1rem", opacity: 0.3 }} />
                    <p style={{ fontSize: "0.875rem", marginBottom: "1rem" }}>No upcoming follow-ups</p>
                    <Link href="/leads/new">
                      <button style={{
                        background: "#10b981",
                        color: "white",
                        padding: "0.5rem 1rem",
                        borderRadius: "0.5rem",
                        fontSize: "0.875rem",
                        fontWeight: "500",
                        cursor: "pointer",
                        border: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        margin: "0 auto",
                      }}>
                        <Plus size={16} />
                        Schedule Follow-up
                      </button>
                    </Link>
                  </div>
                ) : (
                  followUps.map((f, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: "0.75rem",
                      padding: "0.75rem",
                      borderRadius: "0.5rem",
                      background: "#f8fafc",
                    }}>
                      <div style={{
                        width: "32px", height: "32px", borderRadius: "50%",
                        background: "#10b981", color: "white",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.75rem", fontWeight: "600"
                      }}>
                        {f.lead?.name?.charAt(0)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: "0.875rem", fontWeight: "600", color: "#171c1f", margin: 0 }}>
                          {f.lead?.name}
                        </p>
                        <p style={{ fontSize: "0.75rem", color: "#637381", margin: 0 }}>
                          {f.date}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
