import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/sidebar";
import { ArrowLeft, Calendar, Clock, CheckCircle, Phone } from "lucide-react";

export default async function FollowupsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user;

  // Only ADMIN can access
  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Fetch follow-ups for this admin with lead info
  const followUps = await prisma.followUp.findMany({
    where: { adminId: user.id },
    include: {
      lead: {
        select: { id: true, name: true, phone: true, status: true }
      }
    },
    orderBy: { scheduledAt: "asc" },
    take: 50
  });

  const statusColors: Record<string, { bg: string; text: string }> = {
    PENDING: { bg: "#dbeafe", text: "#1e40af" },
    REMINDED: { bg: "#fef9c3", text: "#713f12" },
    COMPLETED: { bg: "#d1fae5", text: "#065f46" },
    SNOOZED: { bg: "#ede9fe", text: "#5b21b6" },
    CANCELLED: { bg: "#e2e8f0", text: "#475569" },
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
          gap: "0.75rem",
        }}>
          <Link href="/dashboard" style={{ color: "var(--text-muted)" }}>
            <ArrowLeft size={18} />
          </Link>
          <h1 style={{ fontSize: "0.9375rem", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
            Follow-ups ({followUps.length})
          </h1>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: "1.5rem" }}>
          <div className="card" style={{ padding: "1.5rem" }}>
            {followUps.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                <Calendar size={48} style={{ color: "var(--emerald)", marginBottom: "1rem" }} />
                <p style={{ marginBottom: "1rem" }}>No follow-ups scheduled.</p>
                <p style={{ fontSize: "0.875rem", marginBottom: "1.5rem" }}>
                  Go to your leads and schedule follow-ups to track them here.
                </p>
                <Link href="/leads">
                  <button style={{
                    padding: "0.5rem 1rem",
                    background: "var(--emerald)",
                    color: "white",
                    border: "none",
                    borderRadius: "0.375rem",
                    fontSize: "0.8125rem",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}>
                    View My Leads
                  </button>
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {followUps.map((followUp) => (
                  <div
                    key={followUp.id}
                    style={{
                      display: "flex", alignItems: "center", gap: "0.75rem",
                      padding: "1rem",
                      borderRadius: "0.5rem",
                      background: "var(--surface-low)",
                    }}
                  >
                    <div style={{
                      width: "40px", height: "40px", borderRadius: "50%",
                      background: "linear-gradient(135deg, #1e293b, #334155)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {followUp.status === "COMPLETED" ? (
                        <CheckCircle size={20} style={{ color: "#10b981" }} />
                      ) : (
                        <Clock size={20} style={{ color: "#f59e0b" }} />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "0.9375rem", fontWeight: "600", color: "var(--text-primary)" }}>
                        {followUp.lead.name}
                      </div>
                      <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Phone size={12} />
                        {followUp.lead.phone}
                      </div>
                      {followUp.notes && (
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                          {followUp.notes}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{
                        fontSize: "0.75rem", fontWeight: "600",
                        background: statusColors[followUp.status]?.bg || "#e2e8f0",
                        color: statusColors[followUp.status]?.text || "#475569",
                        padding: "0.25rem 0.75rem", borderRadius: "9999px", display: "inline-block", marginBottom: "0.25rem",
                      }}>
                        {followUp.status.replace("_", " ")}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <Calendar size={12} />
                        {new Date(followUp.scheduledAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
