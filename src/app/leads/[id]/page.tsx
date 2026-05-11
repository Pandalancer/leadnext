import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getInitials } from "@/lib/utils";
import { Sidebar } from "@/components/sidebar";
import DeleteLeadButton from "./delete-lead-button";
import { ArrowLeft, Phone, Mail, MapPin, Calendar, Clock, Edit, Plus, History, MessageCircle, CheckCircle, AlertCircle } from "lucide-react";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user;

  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const lead = await prisma.lead.findFirst({
    where: { id, adminId: user.id },
    include: {
      followUps: {
        orderBy: { scheduledAt: "desc" },
        take: 10,
      },
      activities: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!lead) {
    redirect("/leads");
  }

  const statusColors: Record<string, { bg: string; text: string; label: string }> = {
    NEW: { bg: "#dbeafe", text: "#1d4ed8", label: "New Lead" },
    HOT: { bg: "#fee2e2", text: "#991b1b", label: "Hot Lead" },
    INTERESTED: { bg: "#fff7e6", text: "#b45309", label: "Interested" },
    NOT_INTERESTED: { bg: "#fecaca", text: "#7f1d1d", label: "Not Interested" },
    NOT_PICKED: { bg: "#fef3c7", text: "#92400e", label: "Not Picked" },
    CONVERTED: { bg: "#d1fae5", text: "#065f46", label: "Converted" },
    FOLLOW_UP: { bg: "#ede9fe", text: "#5b21b6", label: "Follow Up" },
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f6fafe" }}>
      <Sidebar
        userRole={user.role}
        userName={user.name ?? undefined}
        userEmail={user.email ?? undefined}
      />

      <div className="main-content" style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Glassmorphism Header */}
        <header style={{
          background: "rgba(246, 250, 254, 0.8)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          padding: "0 2rem",
          height: "80px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <Link href="/leads" style={{ color: "#171c1f", display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none", fontSize: "0.875rem", fontWeight: 600 }}>
              <ArrowLeft size={20} />
              Back
            </Link>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "900", color: "#171c1f", margin: 0 }}>
              Lead Details
            </h2>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <Link href={`/leads/${lead.id}/edit`}>
              <button style={{
                display: "flex", alignItems: "center", gap: "0.5rem",
                padding: "0.625rem 1.25rem",
                background: "#e4e9ed",
                color: "#171c1f",
                border: "none",
                borderRadius: "0.75rem",
                fontSize: "0.875rem",
                fontWeight: "600",
                cursor: "pointer",
              }}>
                <Edit size={16} />
                Edit Lead
              </button>
            </Link>
            <DeleteLeadButton leadId={lead.id} />
            <Link href={`/leads/${lead.id}/followup`}>
              <button style={{
                display: "flex", alignItems: "center", gap: "0.5rem",
                padding: "0.625rem 1.25rem",
                background: "linear-gradient(135deg, #006948, #00855d)",
                color: "white",
                border: "none",
                borderRadius: "0.75rem",
                fontSize: "0.875rem",
                fontWeight: "700",
                cursor: "pointer",
                boxShadow: "0 4px 6px rgba(0, 105, 72, 0.2)",
              }}>
                <Plus size={16} />
                Add Follow-up
              </button>
            </Link>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: "1.5rem" }}>
          <div style={{ display: "grid", gap: "1.5rem", maxWidth: "800px" }}>
            {/* Lead Info Card */}
            <div className="card" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", marginBottom: "1.5rem" }}>
                <div style={{
                  width: "56px", height: "56px", borderRadius: "50%",
                  background: "linear-gradient(135deg, #1e293b, #334155)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.25rem", fontWeight: "700", color: "#10b981",
                }}>
                  {getInitials(lead.name) || "LD"}
                </div>
                <div>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
                    {lead.name}
                  </h2>
                  <div style={{
                    fontSize: "0.75rem", fontWeight: "600",
                    background: statusColors[lead.status]?.bg || "#e2e8f0",
                    color: statusColors[lead.status]?.text || "#475569",
                    padding: "0.25rem 0.75rem", borderRadius: "9999px", display: "inline-block", marginTop: "0.5rem",
                  }}>
                    {lead.status.replace("_", " ")}
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gap: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <Phone size={18} style={{ color: "var(--emerald)" }} />
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Phone</div>
                    <div style={{ fontSize: "0.9375rem", color: "var(--text-primary)" }}>{lead.phone}</div>
                  </div>
                </div>
                {lead.email && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <Mail size={18} style={{ color: "var(--emerald)" }} />
                    <div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Email</div>
                      <div style={{ fontSize: "0.9375rem", color: "var(--text-primary)" }}>{lead.email}</div>
                    </div>
                  </div>
                )}
                {lead.city && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <MapPin size={18} style={{ color: "var(--emerald)" }} />
                    <div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>City</div>
                      <div style={{ fontSize: "0.9375rem", color: "var(--text-primary)" }}>{lead.city}</div>
                    </div>
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <Calendar size={18} style={{ color: "var(--emerald)" }} />
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Source</div>
                    <div style={{ fontSize: "0.9375rem", color: "var(--text-primary)" }}>{lead.source}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <Clock size={18} style={{ color: "var(--emerald)" }} />
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Created</div>
                    <div style={{ fontSize: "0.9375rem", color: "var(--text-primary)" }}>
                      {new Date(lead.createdAt).toLocaleDateString("en-IN")}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Initial Question Responses Card */}
            {(() => {
              if (!Array.isArray(lead.initialQuestionResponses)) return null;
              const responses = lead.initialQuestionResponses as { id: string; question: string; answer: string }[];
              if (responses.length === 0) return null;
              return (
                <div className="card" style={{ padding: "1.5rem" }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: "600", color: "var(--text-primary)", margin: "0 0 1rem 0" }}>
                    Initial Questions
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {responses.map((item, i) => (
                      <div key={item.id || String(i)} style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                        <div style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--text-muted)" }}>
                          {i + 1}. {item.question}
                        </div>
                        <div style={{ fontSize: "0.9375rem", color: "var(--text-primary)", paddingLeft: "1rem" }}>
                          {item.answer}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Follow-ups Card */}
            <div className="card" style={{ padding: "1.5rem" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: "600", color: "var(--text-primary)", margin: "0 0 1rem 0" }}>
                Follow-ups
              </h3>
              {lead.followUps.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
                  No follow-ups scheduled for this lead.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {lead.followUps.map((fu) => (
                    <div
                      key={fu.id}
                      style={{
                        display: "flex", alignItems: "center", gap: "0.75rem",
                        padding: "0.75rem",
                        borderRadius: "0.375rem",
                        background: "var(--surface-low)",
                      }}
                    >
                      <Calendar size={16} style={{ color: "var(--emerald)" }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "0.875rem", color: "var(--text-primary)" }}>
                          {new Date(fu.scheduledAt).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </div>
                        {fu.notes && (
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                            {fu.notes}
                          </div>
                        )}
                      </div>
                      <div style={{
                        fontSize: "0.75rem", fontWeight: "600",
                        background: fu.status === "COMPLETED" ? "#d1fae5" : fu.status === "PENDING" ? "#dbeafe" : "#fef9c3",
                        color: fu.status === "COMPLETED" ? "#065f46" : fu.status === "PENDING" ? "#1e40af" : "#713f12",
                        padding: "0.25rem 0.5rem", borderRadius: "9999px",
                      }}>
                        {fu.status.replace("_", " ")}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Activity History Card */}
            <div className="card" style={{ padding: "1.5rem" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: "600", color: "var(--text-primary)", margin: "0 0 1rem 0", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <History size={18} />
                Activity History
              </h3>
              {lead.activities.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
                  No activity recorded for this lead.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {lead.activities.map((activity) => (
                    <div
                      key={activity.id}
                      style={{
                        display: "flex", alignItems: "flex-start", gap: "0.75rem",
                        padding: "0.75rem",
                        borderRadius: "0.375rem",
                        background: "var(--surface-low)",
                      }}
                    >
                      <div style={{ marginTop: "0.125rem" }}>
                        {getActivityIcon(activity.action)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "0.875rem", color: "var(--text-primary)", fontWeight: "500" }}>
                          {formatActivityText(activity.action)}
                        </div>
                        {activity.details && (
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                            {JSON.stringify(activity.details)}
                          </div>
                        )}
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                          {new Date(activity.createdAt).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function getActivityIcon(action: string) {
  if (action.includes("WHATSAPP")) return <MessageCircle size={16} style={{ color: "#10b981" }} />;
  if (action.includes("FOLLOW_UP")) return <Calendar size={16} style={{ color: "#3b82f6" }} />;
  if (action.includes("STATUS") || action.includes("UPDATE")) return <Edit size={16} style={{ color: "#f59e0b" }} />;
  if (action.includes("CREATE")) return <Plus size={16} style={{ color: "#8b5cf6" }} />;
  if (action.includes("COMPLETE")) return <CheckCircle size={16} style={{ color: "#10b981" }} />;
  return <AlertCircle size={16} style={{ color: "#6b7280" }} />;
}

function formatActivityText(action: string): string {
  return action
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
}
