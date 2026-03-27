"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/sidebar";
import { ArrowLeft, Calendar, Loader2, Plus } from "lucide-react";

function AddFollowUpPageClient({ 
  params, 
  lead, 
  user 
}: { 
  params: { id: string }; 
  lead: any; 
  user: any;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    scheduledDate: "",
    scheduledTime: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.scheduledDate || !formData.scheduledTime) {
      alert("Please select date and time");
      return;
    }

    setSaving(true);
    
    const scheduledAt = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
    
    try {
      const res = await fetch(`/api/followups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: params.id,
          scheduledAt: scheduledAt.toISOString(),
          notes: formData.notes,
        }),
      });
      
      if (res.ok) {
        router.push(`/leads/${params.id}`);
      } else {
        alert("Failed to schedule follow-up");
        setSaving(false);
      }
    } catch (error) {
      alert("Error scheduling follow-up");
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--surface)" }}>
      <Sidebar
        userRole={user.role}
        userName={user.name ?? undefined}
        userEmail={user.email ?? undefined}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, marginLeft: "240px" }}>
        <header style={{
          background: "var(--surface-card)",
          borderBottom: "1px solid var(--outline-ghost)",
          padding: "0 1.5rem",
          height: "56px",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
        }}>
          <Link href={`/leads/${params.id}`} style={{ color: "var(--text-muted)" }}>
            <ArrowLeft size={18} />
          </Link>
          <h1 style={{ fontSize: "0.9375rem", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
            Schedule Follow-up
          </h1>
        </header>

        <main style={{ flex: 1, padding: "1.5rem" }}>
          <div className="card" style={{ padding: "1.5rem", maxWidth: "600px" }}>
            <div style={{ marginBottom: "1.5rem", padding: "1rem", background: "var(--surface-low)", borderRadius: "0.5rem" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Lead</div>
              <div style={{ fontSize: "1rem", fontWeight: "600", color: "var(--text-primary)" }}>{lead.name}</div>
              <div style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>{lead.phone}</div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
              <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "1fr 1fr" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "600", color: "var(--text-primary)", marginBottom: "0.5rem" }}>
                    <Calendar size={14} style={{ display: "inline", marginRight: "0.25rem" }} />
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.625rem",
                      background: "var(--surface-low)",
                      border: "1px solid var(--outline-ghost)",
                      borderRadius: "0.375rem",
                      fontSize: "0.875rem",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "600", color: "var(--text-primary)", marginBottom: "0.5rem" }}>
                    Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.625rem",
                      background: "var(--surface-low)",
                      border: "1px solid var(--outline-ghost)",
                      borderRadius: "0.375rem",
                      fontSize: "0.875rem",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "600", color: "var(--text-primary)", marginBottom: "0.5rem" }}>
                  Notes
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add notes about this follow-up..."
                  style={{
                    width: "100%",
                    padding: "0.625rem",
                    background: "var(--surface-low)",
                    border: "1px solid var(--outline-ghost)",
                    borderRadius: "0.375rem",
                    fontSize: "0.875rem",
                    color: "var(--text-primary)",
                    resize: "vertical",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                <Link href={`/leads/${params.id}`} style={{ flex: 1 }}>
                  <button
                    type="button"
                    style={{
                      width: "100%",
                      padding: "0.625rem 1rem",
                      background: "transparent",
                      border: "1px solid var(--outline-ghost)",
                      borderRadius: "0.375rem",
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      color: "var(--text-secondary)",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    flex: 1,
                    padding: "0.625rem 1rem",
                    background: "var(--emerald)",
                    border: "none",
                    borderRadius: "0.375rem",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    color: "white",
                    cursor: saving ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saving ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Plus size={16} />}
                  {saving ? "Scheduling..." : "Schedule Follow-up"}
                </button>
              </div>
            </form>
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

async function AddFollowUpPageServer({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user;

  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const lead = await prisma.lead.findFirst({
    where: { id, adminId: user.id },
  });

  if (!lead) {
    redirect("/leads");
  }

  return <AddFollowUpPageClient params={{ id }} lead={lead} user={user} />;
}

export default AddFollowUpPageServer;
