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

function LeadsPageClient({ leads, user }: { leads: Lead[]; user: any }) {
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
    INTERESTED: { bg: "#fef9c3", text: "#713f12" },
    NOT_INTERESTED: { bg: "#fecaca", text: "#7f1d1d" },
    NOT_PICKED: { bg: "#fef3c7", text: "#92400e" },
    CONVERTED: { bg: "#d1fae5", text: "#065f46" },
    FOLLOW_UP: { bg: "#ede9fe", text: "#5b21b6" },
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--surface)" }}>
      <Sidebar
        userRole={user.role}
        userName={user.name ?? undefined}
        userEmail={user.email ?? undefined}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, marginLeft: "240px" }}>
        {/* Header */}
        <header style={{
          background: "var(--surface-card)",
          borderBottom: "1px solid var(--outline-ghost)",
          padding: "0 1.5rem",
          height: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Link href="/dashboard" style={{ color: "var(--text-muted)" }}>
              <ArrowLeft size={18} />
            </Link>
            <h1 style={{ fontSize: "0.9375rem", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
              My Leads ({filteredLeads.length})
            </h1>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              style={{
                display: "flex", alignItems: "center", gap: "0.5rem",
                padding: "0.5rem 1rem",
                background: showFilters ? "var(--emerald)" : "transparent",
                color: showFilters ? "white" : "var(--text-secondary)",
                border: "1px solid var(--outline-ghost)",
                borderRadius: "0.375rem",
                fontSize: "0.8125rem",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              <Filter size={16} />
              Filter
            </button>
            <Link href="/leads/new">
              <button style={{
                display: "flex", alignItems: "center", gap: "0.5rem",
                padding: "0.5rem 1rem",
                background: "var(--emerald)",
                color: "white",
                border: "none",
                borderRadius: "0.375rem",
                fontSize: "0.8125rem",
                fontWeight: "600",
                cursor: "pointer",
              }}>
                <Plus size={16} />
                Add Lead
              </button>
            </Link>
          </div>
        </header>

        {/* Filters */}
        {showFilters && (
          <div style={{
            background: "var(--surface-card)",
            borderBottom: "1px solid var(--outline-ghost)",
            padding: "1rem 1.5rem",
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
            alignItems: "center",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: 1, minWidth: "200px" }}>
              <Search size={16} style={{ color: "var(--text-muted)" }} />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchQuery}
                onChange={(e) => updateFilter("q", e.target.value)}
                style={{
                  flex: 1,
                  padding: "0.5rem",
                  background: "var(--surface-low)",
                  border: "1px solid var(--outline-ghost)",
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem",
                  color: "var(--text-primary)",
                }}
              />
              {searchQuery && (
                <button onClick={() => updateFilter("q", "")} style={{ background: "none", border: "none", cursor: "pointer" }}>
                  <X size={16} style={{ color: "var(--text-muted)" }} />
                </button>
              )}
            </div>
            <select
              value={statusFilter}
              onChange={(e) => updateFilter("status", e.target.value)}
              style={{
                padding: "0.5rem 1rem",
                background: "var(--surface-low)",
                border: "1px solid var(--outline-ghost)",
                borderRadius: "0.375rem",
                fontSize: "0.875rem",
                color: "var(--text-primary)",
                cursor: "pointer",
              }}
            >
              <option value="">All Status</option>
              <option value="NEW">New</option>
              <option value="HOT">Hot</option>
              <option value="INTERESTED">Interested</option>
              <option value="NOT_INTERESTED">Not Interested</option>
              <option value="NOT_PICKED">Not Picked</option>
              <option value="CONVERTED">Converted</option>
              <option value="FOLLOW_UP">Follow Up</option>
            </select>
            {(statusFilter || searchQuery) && (
              <button
                onClick={() => router.push("/leads")}
                style={{
                  padding: "0.5rem 1rem",
                  background: "transparent",
                  border: "1px solid var(--outline-ghost)",
                  borderRadius: "0.375rem",
                  fontSize: "0.8125rem",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                }}
              >
                Clear All
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <main style={{ flex: 1, padding: "1.5rem" }}>
          <div className="card" style={{ padding: "1.5rem" }}>
            {filteredLeads.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                <p>{leads.length === 0 ? "No leads yet." : "No leads match your filters."}</p>
                <p style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>
                  {leads.length === 0 ? 'Click "Add Lead" to create your first lead.' : "Try adjusting your search or filters."}
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {filteredLeads.map((lead) => (
                  <Link
                    key={lead.id}
                    href={`/leads/${lead.id}`}
                    style={{
                      display: "flex", alignItems: "center", gap: "0.75rem",
                      padding: "1rem",
                      borderRadius: "0.5rem",
                      background: "var(--surface-low)",
                      textDecoration: "none",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{
                      width: "40px", height: "40px", borderRadius: "50%",
                      background: "linear-gradient(135deg, #1e293b, #334155)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.875rem", fontWeight: "700", color: "#10b981",
                    }}>
                      {lead.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2) || "LD"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "0.9375rem", fontWeight: "600", color: "var(--text-primary)" }}>
                        {lead.name}
                      </div>
                      <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                        {lead.phone} {lead.city && `• ${lead.city}`}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{
                        fontSize: "0.75rem", fontWeight: "600",
                        background: statusColors[lead.status]?.bg || "#e2e8f0",
                        color: statusColors[lead.status]?.text || "#475569",
                        padding: "0.25rem 0.75rem", borderRadius: "9999px", display: "inline-block", marginBottom: "0.25rem",
                      }}>
                        {lead.status.replace("_", " ")}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {lead.source}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// Server component wrapper
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

async function LeadsPageServer({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user;

  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const leads = await prisma.lead.findMany({
    where: { adminId: user.id },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      city: true,
      status: true,
      source: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return <LeadsPageClient leads={leads} user={user} />;
}

export default LeadsPageServer;
