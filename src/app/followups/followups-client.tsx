"use client";

import type { UserRole } from "@prisma/client";
import Link from "next/link";
import { getInitials } from "@/lib/utils";
import { Sidebar } from "@/components/sidebar";
import { ArrowLeft, Calendar, Clock, Phone, Plus, Search } from "lucide-react";


interface FollowupsClientProps {
  user: {
    id: string;
    email: string;
    name?: string | null;
    role: UserRole;
  };
  followUps: Array<{
    id: string;
    scheduledAt: string | Date;
    notes: string | null;
    lead: {
      id: string;
      name: string;
      phone: string;
      status: string;
    };
  }>;
}

export function FollowupsClient({ user, followUps }: FollowupsClientProps) {
  const statusColors: Record<string, { bg: string; text: string }> = {
    NEW: { bg: "#dbeafe", text: "#1e40af" },
    HOT: { bg: "#fee2e2", text: "#991b1b" },
    CONVERTED: { bg: "#d1fae5", text: "#065f46" },
    INTERESTED: { bg: "#fef9c3", text: "#713f12" },
    FOLLOW_UP: { bg: "#ede9fe", text: "#5b21b6" },
  };

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
            <Link href="/dashboard">
              <button style={{
                background: "none",
                border: "none",
                color: "#171c1f",
                cursor: "pointer",
                padding: "0.5rem",
                borderRadius: "0.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.875rem",
                fontWeight: "600",
              }}>
                <ArrowLeft size={20} />
                Back
              </button>
            </Link>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "900", color: "#171c1f", margin: 0 }}>
              Follow-up Schedule
            </h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", background: "#f0f4f8", borderRadius: "9999px", padding: "0.5rem 1rem", gap: "0.5rem" }}>
              <Search size={16} style={{ color: "#64748b" }} />
              <input
                type="text"
                placeholder="Search follow-ups..."
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
              {getInitials(user.name) || "U"}
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
              Activity Tracking
            </div>
            <h3 style={{ 
              fontSize: "2.5rem", 
              fontWeight: "800", 
              color: "#171c1f", 
              margin: "0 0 0.5rem",
              letterSpacing: "-0.025em"
            }}>
              Follow-up Schedule
            </h3>
            <p style={{ 
              color: "#637381", 
              fontSize: "1.125rem", 
              maxWidth: "600px",
              lineHeight: 1.6
            }}>
              Track and manage all your scheduled follow-ups. Never miss an opportunity to connect with your leads.
            </p>
          </section>

          {/* Stats Bar */}
          <section style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
            <div style={{
              background: "white",
              borderRadius: "0.75rem",
              padding: "1rem 1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              border: "1px solid rgba(0,0,0,0.02)",
            }}>
              <Calendar size={20} style={{ color: "#3b82f6" }} />
              <div>
                <p style={{ fontSize: "0.75rem", color: "#637381", margin: 0 }}>Total Follow-ups</p>
                <p style={{ fontSize: "1.25rem", fontWeight: "700", color: "#171c1f", margin: 0 }}>{followUps.length}</p>
              </div>
            </div>
            <div style={{
              background: "white",
              borderRadius: "0.75rem",
              padding: "1rem 1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              border: "1px solid rgba(0,0,0,0.02)",
            }}>
              <Clock size={20} style={{ color: "#f59e0b" }} />
              <div>
                <p style={{ fontSize: "0.75rem", color: "#637381", margin: 0 }}>Pending Today</p>
                <p style={{ fontSize: "1.25rem", fontWeight: "700", color: "#171c1f", margin: 0 }}>
                  {followUps.filter(f => {
                    const today = new Date();
                    const followUpDate = new Date(f.scheduledAt);
                    return followUpDate.toDateString() === today.toDateString();
                  }).length}
                </p>
              </div>
            </div>
          </section>

          {/* Action Bar */}
          <section style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <h4 style={{ fontSize: "1.125rem", fontWeight: "700", color: "#171c1f", margin: 0 }}>
                Scheduled Follow-ups
              </h4>
              <span style={{ fontSize: "0.875rem", color: "#637381" }}>
                {followUps.length} follow-up{followUps.length !== 1 ? "s" : ""}
              </span>
            </div>
            <Link href="/leads">
              <button style={{
                background: "#10b981",
                color: "white",
                padding: "0.75rem 1.5rem",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                fontWeight: "500",
                cursor: "pointer",
                border: "none",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                boxShadow: "0 4px 6px rgba(16, 185, 129, 0.2)",
              }}>
                <Plus size={16} />
                Schedule Follow-up
              </button>
            </Link>
          </section>

          {/* Follow-ups list */}
          {followUps.length === 0 ? (
            <div style={{
              background: "white",
              borderRadius: "1rem",
              padding: "4rem 2rem",
              textAlign: "center",
              boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
              border: "1px solid rgba(0,0,0,0.02)",
            }}>
              <Calendar size={48} style={{ margin: "0 auto 1.5rem", opacity: 0.3 }} />
              <h3 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#171c1f", marginBottom: "0.5rem" }}>
                No follow-ups scheduled
              </h3>
              <p style={{ fontSize: "0.875rem", color: "#637381", marginBottom: "2rem", maxWidth: "400px", margin: "0 auto 2rem" }}>
                Start building your follow-up schedule by adding follow-ups to your leads.
              </p>
              <Link href="/leads">
                <button style={{
                  background: "#10b981",
                  color: "white",
                  padding: "0.75rem 2rem",
                  borderRadius: "0.5rem",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  border: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}>
                  <Plus size={16} />
                  Schedule Your First Follow-up
                </button>
              </Link>
            </div>
          ) : (
            <div style={{
              background: "white",
              borderRadius: "1rem",
              padding: "1rem",
              boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
              border: "1px solid rgba(0,0,0,0.02)",
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {followUps.map((followUp) => {
                  const colors = statusColors[followUp.lead.status] || statusColors.NEW;
                  const scheduledDate = new Date(followUp.scheduledAt);
                  const isToday = scheduledDate.toDateString() === new Date().toDateString();
                  const isPast = scheduledDate < new Date();
                  
                  return (
                    <div
                      key={followUp.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        padding: "1rem",
                        borderRadius: "0.75rem",
                        background: isPast ? "#fef2f2" : isToday ? "#fefce8" : "#f8fafc",
                        transition: "all 0.2s",
                        cursor: "pointer",
                        border: `1px solid ${isPast ? "#fecaca" : isToday ? "#fde68a" : "transparent"}`,
                      }}
                    >
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "50%",
                          background: isPast ? "#ef4444" : isToday ? "#f59e0b" : "#3b82f6",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          flexShrink: 0,
                        }}
                      >
                        {isPast ? <Clock size={20} /> : <Calendar size={20} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ 
                          fontSize: "1rem", 
                          fontWeight: "600", 
                          color: "#171c1f", 
                          whiteSpace: "nowrap", 
                          overflow: "hidden", 
                          textOverflow: "ellipsis",
                          marginBottom: "0.25rem"
                        }}>
                          {followUp.lead.name}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "0.875rem", color: "#637381", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                            <Phone size={14} />
                            {followUp.lead.phone}
                          </span>
                          <span style={{ fontSize: "0.875rem", color: "#637381" }}>
                            {scheduledDate.toLocaleDateString()} at {scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {followUp.notes && (
                          <p style={{ fontSize: "0.875rem", color: "#637381", margin: "0.5rem 0 0", fontStyle: "italic" }}>
                            {followUp.notes}
                          </p>
                        )}
                      </div>
                      <div style={{
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        background: colors.bg,
                        color: colors.text,
                        padding: "0.25rem 0.75rem",
                        borderRadius: "9999px",
                        whiteSpace: "nowrap",
                      }}>
                        {followUp.lead.status.replace("_", " ")}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
