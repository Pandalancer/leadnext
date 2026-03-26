import Link from "next/link";
import { Layers, GitBranch, Zap, ArrowRight } from "lucide-react";

const features = [
  {
    icon: <Layers size={22} />,
    title: "Multi-tenant control",
    description:
      "SUPER_ADMIN oversees tenants, ADMINs manage clients, and guests see only their leads with secure scoping.",
    color: "#3b82f6",
  },
  {
    icon: <GitBranch size={22} />,
    title: "Lead lifecycle",
    description:
      "Capture leads from WhatsApp, forms, or CSV, score them, log activities, and move them through pipelines.",
    color: "#10b981",
  },
  {
    icon: <Zap size={22} />,
    title: "Follow-up automation",
    description:
      "Schedule reminders, send WhatsApp/email nudges, and keep each conversation encrypted with AES-256 secrets.",
    color: "#f59e0b",
  },
];

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--sidebar-bg)", color: "var(--text-on-dark)" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "4rem 1.5rem" }}>

        {/* Hero */}
        <header style={{ marginBottom: "4rem" }}>
          <p style={{
            fontSize: "0.6875rem", textTransform: "uppercase", letterSpacing: "0.5em",
            color: "var(--emerald)", fontWeight: "700", marginBottom: "1.25rem"
          }}>
            LeadCRM SaaS
          </p>
          <h1 style={{
            fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: "800", lineHeight: 1.15,
            letterSpacing: "-0.03em", color: "#f8fafc",
            maxWidth: "720px", marginBottom: "1.25rem"
          }}>
            Build a WhatsApp-led CRM that scales across clients and admins.
          </h1>
          <p style={{
            fontSize: "1rem", color: "#94a3b8", lineHeight: 1.7, maxWidth: "620px",
            marginBottom: "2rem"
          }}>
            Modern Next.js 16 meets Supabase/PostgreSQL with Prisma 5, NextAuth v5,
            and AES-256 secrets — every message stays private while follow-ups stay on schedule.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <Link href="/login">
              <button className="btn-emerald" style={{ padding: "0.75rem 1.5rem", fontSize: "0.875rem" }}>
                Launch Dashboard <ArrowRight size={16} />
              </button>
            </Link>
            <Link href="/dashboard">
              <button style={{
                display: "inline-flex", alignItems: "center", gap: "0.5rem",
                padding: "0.75rem 1.5rem", borderRadius: "0.375rem",
                fontSize: "0.875rem", fontWeight: "600",
                color: "#cbd5e1", background: "transparent",
                border: "1.5px solid rgba(203,213,225,0.25)",
                cursor: "pointer", transition: "border-color 0.15s",
              }}>
                Try Demo Data
              </button>
            </Link>
          </div>
        </header>

        {/* Feature cards */}
        <section style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "4rem" }}>
          {features.map((f) => (
            <article key={f.title} style={{
              background: "#1e293b",
              borderRadius: "0.5rem",
              padding: "1.5rem",
              border: "1px solid rgba(255,255,255,0.06)",
            }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "0.5rem",
                background: f.color + "1a",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: f.color, marginBottom: "1rem",
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: "0.9375rem", fontWeight: "700", color: "#f8fafc", marginBottom: "0.5rem" }}>
                {f.title}
              </h3>
              <p style={{ fontSize: "0.8125rem", color: "#94a3b8", lineHeight: 1.6 }}>
                {f.description}
              </p>
            </article>
          ))}
        </section>

        {/* Overview */}
        <section style={{
          background: "#1e293b",
          borderRadius: "0.5rem",
          padding: "2rem",
          border: "1px solid rgba(255,255,255,0.06)",
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", alignItems: "center"
        }}>
          <div>
            <p style={{ fontSize: "0.6875rem", textTransform: "uppercase", letterSpacing: "0.4em", color: "var(--emerald)", fontWeight: "700", marginBottom: "0.75rem" }}>
              Overview
            </p>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "700", color: "#f8fafc", lineHeight: 1.3, letterSpacing: "-0.02em" }}>
              Every tenant gets scoped leads, follow-ups, and WhatsApp rems out of the box.
            </h2>
          </div>
          <p style={{ fontSize: "0.875rem", color: "#94a3b8", lineHeight: 1.75 }}>
            Start with the seeded superadmin/admin/client trio, hook up each admin's WhatsApp/SMS
            credentials, and let Prisma + NextAuth secure the session with role-aware middleware.
            Use <code style={{ fontFamily: "monospace", fontSize: "0.8125rem", color: "#10b981", background: "rgba(16,185,129,0.1)", padding: "0.125rem 0.375rem", borderRadius: "0.25rem" }}>supabase</code> pooler
            URLs in production without worrying about prepared statements or dropped connections.
          </p>
        </section>

        {/* Footer */}
        <footer style={{ marginTop: "3rem", textAlign: "center" }}>
          <p style={{ fontSize: "0.6875rem", color: "#475569" }}>
            © 2025 LeadCRM · Precise Ledger Architecture
          </p>
        </footer>
      </div>
    </div>
  );
}
