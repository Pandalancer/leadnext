"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/sidebar";
import { ArrowLeft, Plus, Filter, Search, X } from "lucide-react";

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

export function LeadsPageClient({ leads, user }: { leads: Lead[]; user: any }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  
  const statusFilter = searchParams.get("status") || "";
  const searchQuery = searchParams.get("q") || "";

  const filteredLeads = leads.filter((lead) => {
    const matchesStatus = !statusFilter || lead.status === statusFilter;
    const matchesSearch = !searchQuery || 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery) ||
      (lead.email && lead.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (lead.city && lead.city.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/leads?${params.toString()}`);
  };

  const statusColors: Record<string, { bg: string; text: string }> = {
    NEW: { bg: "#dbeafe", text: "#1e40af" },
    HOT: { bg: "#fee2e2", text: "#991b1b" },
    CONVERTED: { bg: "#d1fae5", text: "#065f46" },
    INTERESTED: { bg: "#fef9c3", text: "#713f12" },
    FOLLOW_UP: { bg: "#ede9fe", text: "#5b21b6" },
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--surface)" }}>
      {/* ── Sidebar ── */}
      <Sidebar
        userRole={user.role}
        userName={user.name ?? undefined}
        userEmail={user.email ?? undefined}
      />

      {/* ── Main area ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, marginLeft: "240px" }}>
        {/* Top bar */}
        <header style={{
          background: "var(--surface-card)",
          borderBottom: "1px solid var(--outline-ghost)",
          padding: "0 1.5rem",
          height: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}>
          <div>
            <h1 style={{ fontSize: "0.9375rem", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
              Leads
            </h1>
            <p style={{ fontSize: "0.6875rem", color: "var(--text-muted)", margin: 0 }}>
              {filteredLeads.length} lead{filteredLeads.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-outline"
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <Filter size={16} />
              Filters
            </button>
            <Link href="/leads/new">
              <button className="btn-emerald" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Plus size={16} />
                Add Lead
              </button>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="main-content" style={{ flex: 1, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Filters */}
          {showFilters && (
            <div className="card" style={{ padding: "1rem", display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: 1, minWidth: "200px" }}>
                <Search size={16} style={{ color: "var(--text-muted)" }} />
                <input
                  type="text"
                  placeholder="Search leads..."
                  value={searchQuery}
                  onChange={(e) => updateFilter("q", e.target.value)}
                  className="field-input"
                  style={{ flex: 1 }}
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => updateFilter("status", e.target.value)}
                className="field-input"
                style={{ width: "150px" }}
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
                  className="btn-outline"
                  style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                >
                  <X size={16} />
                  Clear
                </button>
              )}
            </div>
          )}

          {/* Leads list */}
          {filteredLeads.length === 0 ? (
            <div className="card" style={{ padding: "3rem", textAlign: "center" }}>
              <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
                {leads.length === 0 ? "No leads yet. Add your first lead to get started." : "No leads match your filters."}
              </p>
              {leads.length === 0 && (
                <Link href="/leads/new">
                  <button className="btn-emerald">
                    <Plus size={16} style={{ marginRight: "0.5rem" }} />
                    Add Lead
                  </button>
                </Link>
              )}
            </div>
          ) : (
            <div className="card" style={{ padding: "1rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {filteredLeads.map((lead) => {
                  const colors = statusColors[lead.status] || statusColors.NEW;
                  return (
                    <Link
                      key={lead.id}
                      href={`/leads/${lead.id}`}
                      style={{ textDecoration: "none" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          padding: "0.75rem",
                          borderRadius: "0.375rem",
                          background: "var(--surface-low)",
                          transition: "background 0.15s",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "var(--surface-container)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "var(--surface-low)";
                        }}
                      >
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #1e293b, #334155)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.75rem",
                            fontWeight: "700",
                            color: "#10b981",
                            flexShrink: 0,
                          }}
                        >
                          {lead.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "0.875rem", fontWeight: "600", color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {lead.name}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.125rem" }}>
                            <span style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>{lead.phone}</span>
                            {lead.email && (
                              <>
                                <span style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>•</span>
                                <span style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>{lead.email}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div style={{
                          fontSize: "0.625rem",
                          fontWeight: "600",
                          background: colors.bg,
                          color: colors.text,
                          padding: "0.125rem 0.5rem",
                          borderRadius: "9999px",
                        }}>
                          {lead.status.replace("_", " ")}
                        </div>
                      </div>
                    </Link>
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
