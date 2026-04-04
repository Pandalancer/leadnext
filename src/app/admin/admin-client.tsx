"use client";

import { useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/sidebar";
import { ArrowLeft, MessageCircle, Save, Loader2, Copy, Check, Plus, Trash2 } from "lucide-react";
import type { UserRole } from "@prisma/client";
import {
  MAX_INITIAL_LEAD_QUESTIONS,
  MIN_INITIAL_LEAD_QUESTIONS,
  hasValidInitialLeadQuestionCount,
  parseInitialLeadQuestions,
} from "@/lib/initial-lead-questions";

interface AdminPageProps {
  user: {
    id: string;
    email: string;
    name?: string | null;
    role: UserRole;
  };
  settings: null | {
    whatsappToken: string | null;
    whatsappPhoneNumberId: string | null;
    whatsappWebhookSecret: string | null;
    smtpHost: string | null;
    smtpPort: number | null;
    smtpUser: string | null;
    smtpPass: string | null;
    emailFrom: string | null;
    initialLeadQuestions: unknown;
  };
  baseUrl: string;
}

export function AdminPageClient({ user, settings, baseUrl }: AdminPageProps) {
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [questionError, setQuestionError] = useState("");
  const [formData, setFormData] = useState({
    whatsappToken: settings?.whatsappToken || "",
    whatsappPhoneId: settings?.whatsappPhoneNumberId || "",
    whatsappWebhookSecret: settings?.whatsappWebhookSecret || "",
    smtpHost: settings?.smtpHost || "",
    smtpPort: settings?.smtpPort || "587",
    smtpUser: settings?.smtpUser || "",
    smtpPassword: settings?.smtpPass || "",
    senderEmail: settings?.emailFrom || "",
    initialLeadQuestions: parseInitialLeadQuestions(settings?.initialLeadQuestions),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nonEmptyQuestions = formData.initialLeadQuestions.filter((q) => q.question.trim());
    if (!hasValidInitialLeadQuestionCount(nonEmptyQuestions)) {
      setQuestionError(
        `Please configure ${MIN_INITIAL_LEAD_QUESTIONS} to ${MAX_INITIAL_LEAD_QUESTIONS} initial questions, or leave all questions empty.`
      );
      return;
    }
    setQuestionError("");
    setSaving(true);
    
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          initialLeadQuestions: nonEmptyQuestions,
        }),
      });
      
      if (res.ok) {
        alert("Settings saved successfully");
      } else {
        alert("Failed to save settings");
      }
    } catch {
      alert("Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const isConfigured = Boolean(
    settings?.whatsappToken && settings.whatsappPhoneNumberId && settings.whatsappWebhookSecret
  );
  const webhookUrl = baseUrl
    ? `${baseUrl}/api/webhooks/whatsapp/${user.id}`
    : "";

  const addQuestion = () => {
    if (formData.initialLeadQuestions.length >= MAX_INITIAL_LEAD_QUESTIONS) return;
    setFormData({
      ...formData,
      initialLeadQuestions: [
        ...formData.initialLeadQuestions,
        { id: crypto.randomUUID(), question: "" },
      ],
    });
  };

  const removeQuestion = (id: string) => {
    setFormData({
      ...formData,
      initialLeadQuestions: formData.initialLeadQuestions.filter((q) => q.id !== id),
    });
  };

  const updateQuestion = (id: string, question: string) => {
    setFormData({
      ...formData,
      initialLeadQuestions: formData.initialLeadQuestions.map((q) =>
        q.id === id ? { ...q, question } : q
      ),
    });
  };

  const configuredCount = formData.initialLeadQuestions.filter((q) => q.question.trim()).length;
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f6fafe" }}>
      {/* ── Sidebar ── */}
      <Sidebar
        userRole={user.role}
        userName={user.name ?? undefined}
        userEmail={user.email ?? undefined}
      />

      {/* ── Main area ── */}
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
            <Link href="/dashboard">
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
                Back
              </button>
            </Link>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "900", color: "#171c1f", margin: 0 }}>
              System Integrations
            </h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #10b981, #059669)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "0.75rem",
              fontWeight: "700",
              border: "2px solid #10b981",
            }}>
              {user.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="main-content" style={{ 
          flex: 1, 
          padding: "2rem 1.5rem", 
          display: "flex", 
          flexDirection: "column", 
          gap: "4rem",
          maxWidth: "1200px",
          margin: "0 auto"
        }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "4rem" }}>
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
                Admin Panel
              </div>
              <h3 style={{ 
                fontSize: "2.5rem", 
                fontWeight: "800", 
                color: "#171c1f", 
                margin: "0 0 0.5rem",
                letterSpacing: "-0.025em"
              }}>
                System Integrations
              </h3>
              <p style={{ 
                color: "#637381", 
                fontSize: "1.125rem", 
                maxWidth: "600px",
                lineHeight: 1.6
              }}>
                Configure your editorial gateway and lead acquisition channels. Maintain the precision of your digital ecosystem from a central hub.
              </p>
            </section>

            {/* WhatsApp Business API Settings */}
            <section style={{
              background: "white",
              borderRadius: "0.75rem",
              padding: "2rem",
              boxShadow: "0 24px 48px rgba(23,28,31,0.06)",
              transition: "all 0.3s ease",
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "2rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{
                    width: "56px",
                    height: "56px",
                    background: "rgba(37, 211, 102, 0.1)",
                    borderRadius: "0.75rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#25D366",
                  }}>
                    <MessageCircle size={28} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#171c1f", margin: "0 0 0.25rem" }}>
                      WhatsApp Business API
                    </h4>
                    <p style={{ color: "#637381", fontSize: "0.875rem", margin: 0 }}>
                      Automated editorial lead responses
                    </p>
                  </div>
                </div>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: isConfigured ? "rgba(16, 185, 129, 0.3)" : "rgba(148, 163, 184, 0.18)",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "9999px",
                }}>
                  <span style={{
                    width: "8px",
                    height: "8px",
                    background: isConfigured ? "#10b981" : "#94a3b8",
                    borderRadius: "50%",
                    animation: "pulse 2s infinite"
                  }}></span>
                  <span style={{
                    fontSize: "0.625rem",
                    fontWeight: "700",
                    color: isConfigured ? "#059669" : "#64748b",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase"
                  }}>
                    {isConfigured ? "Configured" : "Not Configured"}
                  </span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.5rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <label style={{
                      display: "block",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      color: "#637381",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      padding: "0 0.25rem"
                    }}>
                      API Key
                    </label>
                    <input
                      type="password"
                      value={formData.whatsappToken}
                      onChange={(e) => setFormData({ ...formData, whatsappToken: e.target.value })}
                      style={{
                        width: "100%",
                        background: "#f8fafc",
                        border: "none",
                        borderRadius: "0.5rem",
                        padding: "0.75rem 1rem",
                        fontSize: "0.875rem",
                        fontFamily: "monospace",
                        transition: "all 0.2s",
                      }}
                      placeholder="EAAZ..."
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <label style={{
                      display: "block",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      color: "#637381",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      padding: "0 0.25rem"
                    }}>
                      Phone Number ID
                    </label>
                    <input
                      type="text"
                      value={formData.whatsappPhoneId}
                      onChange={(e) => setFormData({ ...formData, whatsappPhoneId: e.target.value })}
                      style={{
                        width: "100%",
                        background: "#f8fafc",
                        border: "none",
                        borderRadius: "0.5rem",
                        padding: "0.75rem 1rem",
                        fontSize: "0.875rem",
                        transition: "all 0.2s",
                      }}
                      placeholder="1234567890123456"
                    />
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{
                    display: "block",
                    fontSize: "0.75rem",
                    fontWeight: "700",
                    color: "#637381",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    padding: "0 0.25rem"
                  }}>
                      WhatsApp Callback URL
                    </label>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <input
                      readOnly
                      value={webhookUrl}
                      placeholder="Set NEXTAUTH_URL to generate the callback URL"
                      style={{
                        flex: 1,
                        background: "#f1f5f9",
                        border: "none",
                        borderRadius: "0.5rem",
                        padding: "0.75rem 1rem",
                        fontSize: "0.875rem",
                        color: "#64748b",
                        fontFamily: "monospace",
                        fontStyle: "italic",
                      }}
                    />
                    <button
                      type="button"
                      disabled={!webhookUrl}
                      onClick={() => copyToClipboard(webhookUrl, "whatsapp")}
                      style={{
                        background: "#f8fafc",
                        padding: "0.75rem",
                        borderRadius: "0.5rem",
                        border: "none",
                        cursor: webhookUrl ? "pointer" : "not-allowed",
                        opacity: webhookUrl ? 1 : 0.5,
                        transition: "background 0.2s",
                      }}
                    >
                      {copied === "whatsapp" ? <Check size={20} /> : <Copy size={20} />}
                    </button>
                  </div>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b" }}>
                    Use this callback URL in Meta webhook configuration. It is only shown when `NEXTAUTH_URL` is set.
                  </p>
                </div>
              </div>
            </section>

            <section style={{
              background: "white",
              borderRadius: "0.75rem",
              padding: "2rem",
              boxShadow: "0 24px 48px rgba(23,28,31,0.06)",
              transition: "all 0.3s ease",
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.5rem", gap: "1rem" }}>
                <div>
                  <h4 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#171c1f", margin: "0 0 0.25rem" }}>
                    Initial Lead Questions
                  </h4>
                  <p style={{ color: "#637381", fontSize: "0.875rem", margin: 0 }}>
                    Configure {MIN_INITIAL_LEAD_QUESTIONS}-{MAX_INITIAL_LEAD_QUESTIONS} questions asked for every new lead.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addQuestion}
                  disabled={formData.initialLeadQuestions.length >= MAX_INITIAL_LEAD_QUESTIONS}
                  style={{
                    background: formData.initialLeadQuestions.length >= MAX_INITIAL_LEAD_QUESTIONS ? "#cbd5e1" : "#10b981",
                    color: "white",
                    padding: "0.625rem 0.875rem",
                    borderRadius: "0.625rem",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    cursor: formData.initialLeadQuestions.length >= MAX_INITIAL_LEAD_QUESTIONS ? "not-allowed" : "pointer",
                  }}
                >
                  <Plus size={16} />
                  Add Question
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                {formData.initialLeadQuestions.map((q, index) => (
                  <div key={q.id} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "0.75rem", alignItems: "center" }}>
                    <input
                      type="text"
                      value={q.question}
                      onChange={(e) => updateQuestion(q.id, e.target.value)}
                      placeholder={`Question ${index + 1} (e.g. Which service are you interested in?)`}
                      style={{
                        width: "100%",
                        background: "#f8fafc",
                        border: "none",
                        borderRadius: "0.5rem",
                        padding: "0.75rem 1rem",
                        fontSize: "0.875rem",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeQuestion(q.id)}
                      style={{
                        background: "#fee2e2",
                        color: "#b91c1c",
                        border: "none",
                        borderRadius: "0.5rem",
                        padding: "0.625rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      aria-label={`Remove question ${index + 1}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <p style={{ margin: "1rem 0 0", fontSize: "0.75rem", color: "#64748b" }}>
                Configured questions: {configuredCount}/{MAX_INITIAL_LEAD_QUESTIONS} (minimum {MIN_INITIAL_LEAD_QUESTIONS} if enabled).
              </p>
              {questionError ? (
                <p style={{ margin: "0.5rem 0 0", fontSize: "0.75rem", color: "#b91c1c", fontWeight: 600 }}>
                  {questionError}
                </p>
              ) : null}
            </section>

            {/* Save Button */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  background: saving ? "#059669" : "#10b981",
                  color: "white",
                  padding: "0.75rem 2rem",
                  borderRadius: "0.75rem",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  cursor: saving ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  boxShadow: "0 8px 16px rgba(16, 185, 129, 0.2)",
                  transition: "all 0.2s",
                  border: "none",
                }}
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
