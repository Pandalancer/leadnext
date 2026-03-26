"use client";

import { useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/sidebar";
import { ArrowLeft, Shield, Users, Plus, MessageCircle, Mail, Facebook, Save, Loader2 } from "lucide-react";

interface AdminPageProps {
  user: any;
  settings: any;
}

function AdminPageClient({ user, settings }: AdminPageProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    whatsappToken: settings?.whatsappToken || "",
    whatsappPhoneId: settings?.whatsappPhoneId || "",
    whatsappWebhookSecret: settings?.whatsappWebhookSecret || "",
    smtpHost: settings?.smtpHost || "",
    smtpPort: settings?.smtpPort || "587",
    smtpUser: settings?.smtpUser || "",
    smtpPassword: settings?.smtpPassword || "",
    senderEmail: settings?.senderEmail || "",
    senderName: settings?.senderName || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        alert("Settings saved successfully");
      } else {
        alert("Failed to save settings");
      }
    } catch (error) {
      alert("Error saving settings");
    } finally {
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

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
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
              {user.role === "SUPER_ADMIN" ? "System Admin" : "Admin Settings"}
            </h1>
          </div>
          {user.role === "SUPER_ADMIN" && (
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
              Add Admin
            </button>
          )}
        </header>

        <main style={{ flex: 1, padding: "1.5rem" }}>
          {user.role === "SUPER_ADMIN" ? (
            <SuperAdminContent />
          ) : (
            <div style={{ maxWidth: "800px", display: "grid", gap: "1.5rem" }}>
              {/* WhatsApp Settings */}
              <div className="card" style={{ padding: "1.5rem" }}>
                <h2 style={{ fontSize: "1rem", fontWeight: "600", color: "var(--text-primary)", margin: "0 0 1.5rem 0", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <MessageCircle size={20} style={{ color: "var(--emerald)" }} />
                  WhatsApp Business API
                </h2>
                
                <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "600", color: "var(--text-primary)", marginBottom: "0.5rem" }}>
                      Access Token
                    </label>
                    <input
                      type="password"
                      value={formData.whatsappToken}
                      onChange={(e) => setFormData({ ...formData, whatsappToken: e.target.value })}
                      placeholder="EAAYZAejIIFLUBO..."
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
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                      Meta Developer Dashboard → WhatsApp → Access Tokens
                    </p>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "600", color: "var(--text-primary)", marginBottom: "0.5rem" }}>
                      Phone Number ID
                    </label>
                    <input
                      type="text"
                      value={formData.whatsappPhoneId}
                      onChange={(e) => setFormData({ ...formData, whatsappPhoneId: e.target.value })}
                      placeholder="1091354217387254"
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
                      Webhook Verify Token
                    </label>
                    <input
                      type="text"
                      value={formData.whatsappWebhookSecret}
                      onChange={(e) => setFormData({ ...formData, whatsappWebhookSecret: e.target.value })}
                      placeholder="your_webhook_secret"
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
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                      Webhook URL: <code style={{ background: "var(--surface-low)", padding: "0.125rem 0.25rem", borderRadius: "0.25rem" }}>/api/webhooks/whatsapp</code>
                    </p>
                  </div>

                  <h2 style={{ fontSize: "1rem", fontWeight: "600", color: "var(--text-primary)", margin: "1.5rem 0 1rem 0", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Mail size={20} style={{ color: "var(--emerald)" }} />
                    Email (SMTP) Settings
                  </h2>

                  <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "2fr 1fr" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "600", color: "var(--text-primary)", marginBottom: "0.5rem" }}>
                        SMTP Host
                      </label>
                      <input
                        type="text"
                        value={formData.smtpHost}
                        onChange={(e) => setFormData({ ...formData, smtpHost: e.target.value })}
                        placeholder="smtp.gmail.com"
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
                        Port
                      </label>
                      <input
                        type="text"
                        value={formData.smtpPort}
                        onChange={(e) => setFormData({ ...formData, smtpPort: e.target.value })}
                        placeholder="587"
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
                      SMTP Username
                    </label>
                    <input
                      type="text"
                      value={formData.smtpUser}
                      onChange={(e) => setFormData({ ...formData, smtpUser: e.target.value })}
                      placeholder="your-email@gmail.com"
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
                      SMTP Password / App Password
                    </label>
                    <input
                      type="password"
                      value={formData.smtpPassword}
                      onChange={(e) => setFormData({ ...formData, smtpPassword: e.target.value })}
                      placeholder="••••••••"
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

                  <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "1fr 1fr" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "600", color: "var(--text-primary)", marginBottom: "0.5rem" }}>
                        Sender Email
                      </label>
                      <input
                        type="email"
                        value={formData.senderEmail}
                        onChange={(e) => setFormData({ ...formData, senderEmail: e.target.value })}
                        placeholder="noreply@yourcompany.com"
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
                        Sender Name
                      </label>
                      <input
                        type="text"
                        value={formData.senderName}
                        onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                        placeholder="Your Company"
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

                  <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                    <button
                      type="submit"
                      disabled={saving}
                      style={{
                        padding: "0.625rem 1.5rem",
                        background: "var(--emerald)",
                        border: "none",
                        borderRadius: "0.375rem",
                        fontSize: "0.875rem",
                        fontWeight: "600",
                        color: "white",
                        cursor: saving ? "not-allowed" : "pointer",
                        display: "flex", alignItems: "center", gap: "0.5rem",
                        opacity: saving ? 0.7 : 1,
                      }}
                    >
                      {saving ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={16} />}
                      {saving ? "Saving..." : "Save Settings"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Integration Guide */}
              <div className="card" style={{ padding: "1.5rem" }}>
                <h2 style={{ fontSize: "1rem", fontWeight: "600", color: "var(--text-primary)", margin: "0 0 1rem 0", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Facebook size={20} style={{ color: "var(--emerald)" }} />
                  Facebook Lead Ads Integration
                </h2>
                
                <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                  <p style={{ marginBottom: "1rem" }}>
                    To automatically capture leads from Facebook Lead Ads:
                  </p>
                  <ol style={{ margin: "0 0 1rem 1.25rem", padding: 0 }}>
                    <li>Go to Facebook Business Manager → Lead Access → Webhooks</li>
                    <li>Add webhook URL: <code style={{ background: "var(--surface-low)", padding: "0.125rem 0.375rem", borderRadius: "0.25rem" }}>/api/webhooks/facebook</code></li>
                    <li>Subscribe to <code>leadgen_id</code> field</li>
                    <li>Verify the webhook</li>
                  </ol>
                  <p style={{ marginBottom: "1rem" }}>
                    Or use the lead ingestion API directly:
                  </p>
                  <pre style={{ 
                    background: "var(--surface-low)", 
                    padding: "1rem", 
                    borderRadius: "0.375rem",
                    fontSize: "0.8125rem",
                    overflow: "auto",
                    color: "var(--text-primary)"
                  }}>
                    POST /api/leads/ingest
                    Content-Type: application/json
                    
                    {'{'}"name": "John Doe", "phone": "9876543210",
                    "email": "john@example.com", "city": "Mumbai",
                    "source": "FACEBOOK", "adminId": "your_admin_id"{'}'}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function SuperAdminContent() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.5rem" }}>
      <div className="card" style={{ padding: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
          <Shield size={24} style={{ color: "var(--emerald)" }} />
          <h2 style={{ fontSize: "1rem", fontWeight: "700" }}>Admins</h2>
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
          Manage admin users and their permissions.
        </p>
      </div>

      <div className="card" style={{ padding: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
          <Users size={24} style={{ color: "var(--emerald)" }} />
          <h2 style={{ fontSize: "1rem", fontWeight: "700" }}>Clients</h2>
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
          View and manage client accounts.
        </p>
      </div>
    </div>
  );
}

// Server component wrapper
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

async function AdminPageServer() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user;

  // Only SUPER_ADMIN and ADMIN can access
  if (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  let settings = null;
  if (user.role === "ADMIN") {
    settings = await prisma.adminSettings.findUnique({
      where: { adminId: user.id },
    });
  }

  return <AdminPageClient user={user} settings={settings} />;
}

export { AdminPageServer as default };
