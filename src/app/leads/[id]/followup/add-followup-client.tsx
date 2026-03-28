"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/sidebar";
import { ArrowLeft, Calendar, Loader2, Plus } from "lucide-react";
import type { UserRole } from "@prisma/client";

type AppUser = {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
};

type LeadForFollowUp = {
  id: string;
  name: string;
  phone: string;
};

export default function AddFollowUpClient({
  lead,
  user,
}: {
  lead: LeadForFollowUp;
  user: AppUser;
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
          leadId: lead.id,
          scheduledAt: scheduledAt.toISOString(),
          notes: formData.notes,
        }),
      });

      if (res.ok) {
        router.push(`/leads/${lead.id}`);
      } else {
        alert("Failed to schedule follow-up");
        setSaving(false);
      }
    } catch {
      alert("Error scheduling follow-up");
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f6fafe" }}>
      <Sidebar
        userRole={user.role}
        userName={user.name ?? undefined}
        userEmail={user.email ?? undefined}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, marginLeft: "240px" }}>
        <header style={{
          background: "#ffffff",
          borderBottom: "1px solid #e4e9ed",
          padding: "0 1.5rem",
          height: "56px",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
        }}>
          <Link href={`/leads/${lead.id}`} style={{ color: "#6d7a72" }}>
            <ArrowLeft size={18} />
          </Link>
          <h1 style={{ fontSize: "0.9375rem", fontWeight: "700", color: "#171c1f", margin: 0 }}>
            Schedule Follow-up
          </h1>
        </header>

        <main style={{ flex: 1, padding: "1.5rem" }}>
          <div className="card" style={{ padding: "1.5rem", maxWidth: "600px" }}>
            <div style={{ marginBottom: "1.5rem", padding: "1rem", background: "#f8fafc", borderRadius: "0.5rem" }}>
              <div style={{ fontSize: "0.75rem", color: "#6d7a72", marginBottom: "0.25rem" }}>Lead</div>
              <div style={{ fontSize: "1rem", fontWeight: "600", color: "#171c1f" }}>{lead.name}</div>
              <div style={{ fontSize: "0.875rem", color: "#6d7a72" }}>{lead.phone}</div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
              <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "1fr 1fr" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "600", color: "#171c1f", marginBottom: "0.5rem" }}>
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
                      background: "#f8fafc",
                      border: "1px solid #e4e9ed",
                      borderRadius: "0.375rem",
                      fontSize: "0.875rem",
                      color: "#171c1f",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "600", color: "#171c1f", marginBottom: "0.5rem" }}>
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
                      background: "#f8fafc",
                      border: "1px solid #e4e9ed",
                      borderRadius: "0.375rem",
                      fontSize: "0.875rem",
                      color: "#171c1f",
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "600", color: "#171c1f", marginBottom: "0.5rem" }}>
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
                    background: "#f8fafc",
                    border: "1px solid #e4e9ed",
                    borderRadius: "0.375rem",
                    fontSize: "0.875rem",
                    color: "#171c1f",
                    resize: "vertical",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                <Link href={`/leads/${lead.id}`} style={{ flex: 1 }}>
                  <button
                    type="button"
                    style={{
                      width: "100%",
                      padding: "0.625rem 1rem",
                      background: "transparent",
                      border: "1px solid #e4e9ed",
                      borderRadius: "0.375rem",
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      color: "#3d4a42",
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
                    background: "linear-gradient(135deg, #006948, #00855d)",
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

