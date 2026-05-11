import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getInitials } from "@/lib/utils";
import { Sidebar } from "@/components/sidebar";
import { ArrowLeft, Filter } from "lucide-react";

export default async function AllLeadsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user;

  // Only SUPER_ADMIN can access
  if (user.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  // Fetch real leads from database with admin info
  const leads = await prisma.lead.findMany({
    select: {
      id: true,
      name: true,
      phone: true,
      status: true,
      admin: {
        select: { name: true, email: true }
      }
    },
    orderBy: { createdAt: "desc" },
    take: 50 // Limit to recent 50 leads
  });

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--surface)" }}>
      <Sidebar
        userRole={user.role}
        userName={user.name ?? undefined}
        userEmail={user.email ?? undefined}
      />

      <div className="main-content" style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Header */}
        <header style={{
          background: "var(--surface-card)",
          borderBottom: "1px solid var(--outline-ghost)",
          padding: "0 1.5rem",
          height: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Link href="/dashboard" style={{ color: "var(--text-muted)" }}>
              <ArrowLeft size={18} />
            </Link>
            <h1 style={{ fontSize: "0.9375rem", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
              All Leads ({leads.length})
            </h1>
          </div>
          <button style={{
            display: "flex", alignItems: "center", gap: "0.5rem",
            padding: "0.5rem 1rem",
            background: "transparent",
            color: "var(--text-secondary)",
            border: "1px solid var(--outline-ghost)",
            borderRadius: "0.375rem",
            fontSize: "0.8125rem",
            fontWeight: "600",
            cursor: "pointer",
          }}>
            <Filter size={16} />
            Filter
          </button>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: "1.5rem" }}>
          <div className="card" style={{ padding: "1.5rem" }}>
            {leads.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                No leads found
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {leads.map((lead) => (
                  <Link 
                    key={lead.id} 
                    href={`/all-leads/${lead.id}`}
                    style={{
                      display: "flex", alignItems: "center", gap: "0.75rem",
                      padding: "1rem",
                      borderRadius: "0.5rem",
                      background: "var(--surface-low)",
                      textDecoration: "none",
                      color: "inherit",
                      transition: "background 0.15s",
                    }}
                  >
                    <div style={{
                      width: "40px", height: "40px", borderRadius: "50%",
                      background: "linear-gradient(135deg, #1e293b, #334155)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.875rem", fontWeight: "700", color: "#10b981",
                    }}>
                      {getInitials(lead.name) || "LD"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "0.9375rem", fontWeight: "600", color: "var(--text-primary)" }}>
                        {lead.name}
                      </div>
                      <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>{lead.phone}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{
                        fontSize: "0.75rem", fontWeight: "600",
                        background: lead.status === "HOT" ? "#fee2e2" : lead.status === "NEW" ? "#dbeafe" : lead.status === "CONVERTED" ? "#d1fae5" : "#fef9c3",
                        color: lead.status === "HOT" ? "#991b1b" : lead.status === "NEW" ? "#1e40af" : lead.status === "CONVERTED" ? "#065f46" : "#713f12",
                        padding: "0.25rem 0.75rem", borderRadius: "9999px", display: "inline-block", marginBottom: "0.25rem",
                      }}>
                        {lead.status.replace("_", " ")}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {lead.admin?.name || "Unknown"} ({lead.admin?.email || "no email"})
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
