"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/sidebar";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import type { UserRole } from "@prisma/client";

type AppUser = {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
};

type LeadForEdit = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  city: string | null;
  status: string;
  source: string;
};

export default function EditLeadClient({
  lead,
  user,
}: {
  lead: LeadForEdit;
  user: AppUser;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: lead.name,
    phone: lead.phone,
    email: lead.email || "",
    city: lead.city || "",
    status: lead.status,
    source: lead.source,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push(`/leads/${lead.id}`);
      } else {
        alert("Failed to update lead");
        setSaving(false);
      }
    } catch {
      alert("Error saving lead");
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
            Edit Lead
          </h1>
        </header>

        <main style={{ flex: 1, padding: "1.5rem" }}>
          <div className="card" style={{ padding: "1.5rem", maxWidth: "600px" }}>
            <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "600", color: "#171c1f", marginBottom: "0.5rem" }}>
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
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
                  Status *
                </label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.625rem",
                    background: "#f8fafc",
                    border: "1px solid #e4e9ed",
                    borderRadius: "0.375rem",
                    fontSize: "0.875rem",
                    color: "#171c1f",
                    cursor: "pointer",
                  }}
                >
                  <option value="NEW">New</option>
                  <option value="HOT">Hot</option>
                  <option value="INTERESTED">Interested</option>
                  <option value="NOT_INTERESTED">Not Interested</option>
                  <option value="NOT_PICKED">Not Picked</option>
                  <option value="CONVERTED">Converted</option>
                  <option value="FOLLOW_UP">Follow Up</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "600", color: "#171c1f", marginBottom: "0.5rem" }}>
                  Source *
                </label>
                <select
                  required
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.625rem",
                    background: "#f8fafc",
                    border: "1px solid #e4e9ed",
                    borderRadius: "0.375rem",
                    fontSize: "0.875rem",
                    color: "#171c1f",
                    cursor: "pointer",
                  }}
                >
                  <option value="MANUAL">Manual</option>
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="FACEBOOK">Facebook</option>
                  <option value="WEBSITE">Website</option>
                  <option value="REFERRAL">Referral</option>
                  <option value="OTHER">Other</option>
                </select>
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
                  {saving ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={16} />}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

