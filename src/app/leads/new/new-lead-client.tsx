"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/sidebar";
import { ArrowLeft, Save, Loader2, UserPlus, Mail, Phone, MapPin, Tag } from "lucide-react";
import type { UserRole } from "@prisma/client";

export default function NewLeadPage({
  user,
  initialLeadQuestions,
}: {
  user: { id: string; email: string; name?: string | null; role: UserRole };
  initialLeadQuestions: { id: string; question: string }[];
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    status: "NEW",
    source: "MANUAL",
    remarks: "",
  });
  const [initialQuestionResponses, setInitialQuestionResponses] = useState<Record<string, string>>(
    () =>
      Object.fromEntries(
        initialLeadQuestions.map((q) => [q.id, ""])
      )
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          initialQuestionResponses:
            initialLeadQuestions.length > 0 ? initialQuestionResponses : undefined,
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        router.push(`/leads/${data.id}`);
      } else {
        alert("Failed to create lead");
        setSaving(false);
      }
    } catch {
      alert("Error creating lead");
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

      <div className="main-content" style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, marginLeft: "240px" }}>
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
            <Link href="/leads">
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
                Back to Leads
              </button>
            </Link>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "900", color: "#171c1f", margin: 0 }}>
              Add New Lead
            </h2>
          </div>
        </header>

        {/* Page content */}
        <main className="main-content" style={{ 
          flex: 1, 
          padding: "2rem 1.5rem", 
          display: "flex", 
          flexDirection: "column", 
          gap: "2rem",
          maxWidth: "800px",
          margin: "0 auto",
          width: "100%",
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
              Lead Management
            </div>
            <h3 style={{ 
              fontSize: "2.5rem", 
              fontWeight: "800", 
              color: "#171c1f", 
              margin: "0 0 0.5rem",
              letterSpacing: "-0.025em"
            }}>
              Create New Lead
            </h3>
            <p style={{ 
              color: "#637381", 
              fontSize: "1.125rem", 
              maxWidth: "600px",
              lineHeight: 1.6
            }}>
              Add a new lead to your pipeline. Fill in the details below to get started.
            </p>
          </section>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            <div style={{
              background: "white",
              borderRadius: "1.5rem",
              padding: "2rem",
              boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
              border: "1px solid rgba(0,0,0,0.02)",
            }}>
              <h4 style={{ fontSize: "1.125rem", fontWeight: "700", color: "#171c1f", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <UserPlus size={20} style={{ color: "#059669" }} />
                Contact Information
              </h4>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.5rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#374151" }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    style={{
                      padding: "0.75rem 1rem",
                      borderRadius: "0.75rem",
                      border: "1px solid #e5e7eb",
                      fontSize: "0.875rem",
                      background: "#f9fafb",
                    }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#374151", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Phone size={16} />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. 9876543210"
                    style={{
                      padding: "0.75rem 1rem",
                      borderRadius: "0.75rem",
                      border: "1px solid #e5e7eb",
                      fontSize: "0.875rem",
                      background: "#f9fafb",
                    }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#374151", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Mail size={16} />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. rahul@example.com"
                    style={{
                      padding: "0.75rem 1rem",
                      borderRadius: "0.75rem",
                      border: "1px solid #e5e7eb",
                      fontSize: "0.875rem",
                      background: "#f9fafb",
                    }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#374151", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <MapPin size={16} />
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Delhi"
                    style={{
                      padding: "0.75rem 1rem",
                      borderRadius: "0.75rem",
                      border: "1px solid #e5e7eb",
                      fontSize: "0.875rem",
                      background: "#f9fafb",
                    }}
                  />
                </div>
              </div>
            </div>

            {initialLeadQuestions.length > 0 && (
              <div style={{
                background: "white",
                borderRadius: "1.5rem",
                padding: "2rem",
                boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                border: "1px solid rgba(0,0,0,0.02)",
              }}>
                <h4 style={{ fontSize: "1.125rem", fontWeight: "700", color: "#171c1f", marginBottom: "1.5rem" }}>
                  Initial Lead Questions
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {initialLeadQuestions.map((q, index) => (
                    <div key={q.id} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#374151" }}>
                        {index + 1}. {q.question}
                      </label>
                      <input
                        type="text"
                        value={initialQuestionResponses[q.id] ?? ""}
                        onChange={(e) =>
                          setInitialQuestionResponses((prev) => ({
                            ...prev,
                            [q.id]: e.target.value,
                          }))
                        }
                        placeholder="Enter response"
                        style={{
                          padding: "0.75rem 1rem",
                          borderRadius: "0.75rem",
                          border: "1px solid #e5e7eb",
                          fontSize: "0.875rem",
                          background: "#f9fafb",
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{
              background: "white",
              borderRadius: "1.5rem",
              padding: "2rem",
              boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
              border: "1px solid rgba(0,0,0,0.02)",
            }}>
              <h4 style={{ fontSize: "1.125rem", fontWeight: "700", color: "#171c1f", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Tag size={20} style={{ color: "#059669" }} />
                Lead Details
              </h4>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.5rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#374151" }}>
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{
                      padding: "0.75rem 1rem",
                      borderRadius: "0.75rem",
                      border: "1px solid #e5e7eb",
                      fontSize: "0.875rem",
                      background: "#f9fafb",
                    }}
                  >
                    <option value="NEW">New</option>
                    <option value="HOT">Hot</option>
                    <option value="INTERESTED">Interested</option>
                    <option value="FOLLOW_UP">Follow Up</option>
                    <option value="CONVERTED">Converted</option>
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#374151" }}>
                    Source
                  </label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    style={{
                      padding: "0.75rem 1rem",
                      borderRadius: "0.75rem",
                      border: "1px solid #e5e7eb",
                      fontSize: "0.875rem",
                      background: "#f9fafb",
                    }}
                  >
                    <option value="MANUAL">Manual Entry</option>
                    <option value="WHATSAPP">WhatsApp</option>
                    <option value="FACEBOOK">Facebook</option>
                    <option value="WEBSITE">Website</option>
                    <option value="REFERRAL">Referral</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "1.5rem" }}>
                <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#374151" }}>
                  Remarks / Notes
                </label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="Add any additional notes about this lead..."
                  rows={4}
                  style={{
                    padding: "0.75rem 1rem",
                    borderRadius: "0.75rem",
                    border: "1px solid #e5e7eb",
                    fontSize: "0.875rem",
                    background: "#f9fafb",
                    resize: "vertical",
                  }}
                />
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
              <Link href="/leads">
                <button
                  type="button"
                  style={{
                    padding: "0.75rem 1.5rem",
                    background: "#e4e9ed",
                    color: "#171c1f",
                    border: "none",
                    borderRadius: "0.75rem",
                    fontSize: "0.875rem",
                    fontWeight: "600",
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
                  padding: "0.75rem 2rem",
                  background: saving ? "#059669" : "linear-gradient(135deg, #006948, #00855d)",
                  color: "white",
                  border: "none",
                  borderRadius: "0.75rem",
                  fontSize: "0.875rem",
                  fontWeight: "700",
                  cursor: saving ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  boxShadow: "0 4px 6px rgba(16, 185, 129, 0.2)",
                }}
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {saving ? "Creating..." : "Create Lead"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
