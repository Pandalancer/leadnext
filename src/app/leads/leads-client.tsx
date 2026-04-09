"use client";

import type { UserRole } from "@prisma/client";
import { useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getInitials } from "@/lib/utils";
import Link from "next/link";
import { Sidebar } from "@/components/sidebar";
import { ArrowLeft, Plus, Filter, Search, X, Users, Mail, Phone, ChevronRight } from "lucide-react";


interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  city: string | null;
  status: string;
  source: string;
  createdAt: Date;
}

export function LeadsPageClient({
  leads,
  user,
}: {
  leads: Lead[];
  user: { id: string; email: string; name?: string | null; role: UserRole };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  
  const statusFilter = searchParams.get("status") || "";
  const searchQuery = searchParams.get("q") || "";

  const filteredLeads = useMemo(() => {
    const lowerSearchQuery = searchQuery.toLowerCase();

    return leads.filter((lead) => {
      const matchesStatus = !statusFilter || lead.status === statusFilter;
      const matchesSearch = !searchQuery ||
        lead.name.toLowerCase().includes(lowerSearchQuery) ||
        lead.phone.includes(searchQuery) ||
        (lead.email && lead.email.toLowerCase().includes(lowerSearchQuery)) ||
        (lead.city && lead.city.toLowerCase().includes(lowerSearchQuery));
      return matchesStatus && matchesSearch;
    });
  }, [leads, statusFilter, searchQuery]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/leads?${params.toString()}`);
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "NEW":
        return { bg: "#dbeafe", text: "#1d4ed8", label: "New Lead" };
      case "CONVERTED":
        return { bg: "#d1fae5", text: "#065f46", label: "Converted" };
      case "INTERESTED":
        return { bg: "#fff7e6", text: "#b45309", label: "Interested" };
      case "HOT":
        return { bg: "#fee2e2", text: "#991b1b", label: "Hot Lead" };
      case "FOLLOW_UP":
        return { bg: "#ede9fe", text: "#5b21b6", label: "Follow Up" };
      default:
        return { bg: "#dbeafe", text: "#1d4ed8", label: "New Lead" };
    }
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
              Lead Management
            </h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", background: "#f0f4f8", borderRadius: "9999px", padding: "0.5rem 1rem", gap: "0.5rem" }}>
              <Search size={16} style={{ color: "#64748b" }} />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchQuery}
                onChange={(e) => updateFilter("q", e.target.value)}
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
              background: "#e4e9ed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}>
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
              }}>
                {getInitials(user.name)}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="main-content" style={{ 
          flex: 1, 
          padding: "3rem 2rem", 
          display: "flex", 
          flexDirection: "column", 
          gap: "3rem",
          width: "100%",
          maxWidth: "1400px",
          margin: "0 auto"
        }}>
          {/* Hero Header Section */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginBottom: "2rem" }}>
            <div>
              <span style={{
                color: "#006948",
                fontWeight: "700",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontSize: "0.75rem",
                display: "block",
                marginBottom: "0.5rem"
              }}>
                Management
              </span>
              <h2 style={{ 
                fontSize: "3rem", 
                fontWeight: "900", 
                color: "#171c1f", 
                margin: "0 0 0.5rem",
                letterSpacing: "-0.025em"
              }}>
                Active Leads
              </h2>
              <p style={{ 
                color: "#475569", 
                fontSize: "1.125rem", 
                maxWidth: "600px",
                lineHeight: 1.6
              }}>
                Review and engage with your latest curated editorial leads from across all channels.
              </p>
            </div>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <button
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  padding: "0.75rem 1.5rem",
                  background: "#f8fafc",
                  color: "#0f172a",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  borderRadius: "0.75rem",
                  border: "1px solid #cbd5e1",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  transition: "all 0.2s",
                  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
                }}
              >
                <Filter size={20} style={{ color: "#475569" }} />
                Filter
              </button>
              <Link href="/leads/new">
                <button style={{
                  padding: "0.75rem 1.5rem",
                  background: "linear-gradient(135deg, #006948, #00855d)",
                  color: "white",
                  fontSize: "0.875rem",
                  fontWeight: "700",
                  borderRadius: "0.75rem",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  boxShadow: "0 8px 16px rgba(0, 105, 72, 0.2)",
                  transition: "all 0.2s",
                }}>
                  <Plus size={20} />
                  Add Lead
                </button>
              </Link>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div style={{
              background: "white",
              borderRadius: "1rem",
              padding: "1.5rem",
              boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
              border: "1px solid rgba(0,0,0,0.02)",
              display: "flex",
              gap: "1rem",
              alignItems: "center",
              flexWrap: "wrap",
              marginBottom: "2rem",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: 1, minWidth: "200px" }}>
                <Search size={16} style={{ color: "#64748b" }} />
                <input
                  type="text"
                  placeholder="Search leads..."
                  value={searchQuery}
                  onChange={(e) => updateFilter("q", e.target.value)}
                  style={{
                    flex: 1,
                    background: "#f8fafc",
                    border: "none",
                    borderRadius: "0.5rem",
                    padding: "0.75rem 1rem",
                    fontSize: "0.875rem",
                  }}
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => updateFilter("status", e.target.value)}
                style={{
                  background: "#f8fafc",
                  border: "none",
                  borderRadius: "0.5rem",
                  padding: "0.75rem 1rem",
                  fontSize: "0.875rem",
                  minWidth: "150px",
                }}
              >
                <option value="">All Status</option>
                <option value="NEW">New</option>
                <option value="HOT">Hot</option>
                <option value="INTERESTED">Interested</option>
                <option value="FOLLOW_UP">Follow Up</option>
                <option value="CONVERTED">Converted</option>
              </select>
              {(statusFilter || searchQuery) && (
                <button
                  onClick={() => {
                    updateFilter("status", "");
                    updateFilter("q", "");
                  }}
                  style={{
                    background: "#ef4444",
                    color: "white",
                    padding: "0.75rem 1rem",
                    borderRadius: "0.5rem",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    cursor: "pointer",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <X size={16} />
                  Clear
                </button>
              )}
            </div>
          )}

          {/* Bento-Style Grid of Leads */}
          {filteredLeads.length === 0 ? (
            <div style={{
              background: "white",
              borderRadius: "2rem",
              padding: "4rem 2rem",
              textAlign: "center",
              boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
              border: "1px solid rgba(0,0,0,0.02)",
            }}>
              <Users size={48} style={{ margin: "0 auto 1.5rem", opacity: 0.3 }} />
              <h3 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#171c1f", marginBottom: "0.5rem" }}>
                {leads.length === 0 ? "No leads yet" : "No leads match your filters"}
              </h3>
              <p style={{ fontSize: "0.875rem", color: "#3d4a42", marginBottom: "2rem", maxWidth: "400px", margin: "0 auto 2rem" }}>
                {leads.length === 0 
                  ? "Start building your lead pipeline by adding your first lead."
                  : "Try adjusting your search or filter criteria to find the leads you're looking for."
                }
              </p>
              {leads.length === 0 && (
                <Link href="/leads/new">
                  <button style={{
                    background: "linear-gradient(135deg, #006948, #00855d)",
                    color: "white",
                    padding: "0.75rem 2rem",
                    borderRadius: "0.5rem",
                    fontSize: "0.875rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    border: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    boxShadow: "0 8px 16px rgba(0, 105, 72, 0.2)",
                  }}>
                    <Plus size={16} />
                    Add Your First Lead
                  </button>
                </Link>
              )}
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "2rem",
              width: "100%",
            }}>
              {filteredLeads.map((lead) => {
                const statusStyles = getStatusStyles(lead.status);
                return (
                  <div
                    key={lead.id}
                    style={{
                      background: "#ffffff",
                      borderRadius: "2rem",
                      padding: "2rem",
                      boxShadow: "none",
                      transition: "all 0.5s ease",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      height: "100%",
                      border: "1px solid rgba(0,0,0,0.02)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 24px 48px rgba(23,28,31,0.06)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                        <div style={{
                          width: "56px",
                          height: "56px",
                          borderRadius: "1rem",
                          overflow: "hidden",
                          background: "#e4e9ed",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}>
                          <div style={{
                            width: "56px",
                            height: "56px",
                            borderRadius: "1rem",
                            background: "linear-gradient(135deg, #1e293b, #334155)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#10b981",
                            fontSize: "1rem",
                            fontWeight: "700",
                          }}>
                            {getInitials(lead.name)}
                          </div>
                        </div>
                        <span style={{
                          padding: "0.25rem 0.75rem",
                          background: statusStyles.bg,
                          color: statusStyles.text,
                          fontSize: "0.625rem",
                          fontWeight: "900",
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          borderRadius: "9999px",
                        }}>
                          {statusStyles.label}
                        </span>
                      </div>
                      <h3 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#171c1f", marginBottom: "0.25rem" }}>
                        {lead.name}
                      </h3>
                      <p style={{ color: "#475569", fontSize: "0.875rem", marginBottom: "1rem" }}>
                        {lead.city ? (
                          <span>{lead.city}</span>
                        ) : (
                          <span style={{ color: "#94a3b8", fontStyle: "italic" }}>Location Unknown</span>
                        )}
                        {" "}• {lead.source}
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", paddingTop: "1rem", marginBottom: "2rem" }}>
                        {lead.email && (
                          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "#475569" }}>
                            <Mail size={20} />
                            <span style={{ fontSize: "0.875rem", fontWeight: "500" }}>{lead.email}</span>
                          </div>
                        )}
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "#475569" }}>
                          <Phone size={20} />
                          <span style={{ fontSize: "0.875rem", fontWeight: "500" }}>{lead.phone}</span>
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/leads/${lead.id}`}
                      style={{
                        width: "100%",
                        padding: "1rem",
                        textAlign: "center",
                        borderTop: "1px solid #cbd5e1",
                        color: "#047857",
                        fontWeight: "700",
                        fontSize: "0.875rem",
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.5rem",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.textDecoration = "underline";
                        e.currentTarget.style.color = "#065f46";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.textDecoration = "none";
                        e.currentTarget.style.color = "#047857";
                      }}
                    >
                      View Profile
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
