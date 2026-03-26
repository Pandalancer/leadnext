import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/sidebar";
import {
  TrendingUp,
  UserCheck,
  UserPlus,
  Bell,
  Plus,
  ArrowRight,
  MessageCircle,
  Clock,
} from "lucide-react";

/* ─── Mock data (will be replaced by real DB queries) ───────── */
const stats = [
  { label: "Total Leads",       value: "1,247",  icon: <TrendingUp size={20} />,  delta: "+12% vs last month", color: "#3b82f6" },
  { label: "Converted",         value: "89",     icon: <UserCheck size={20} />,   delta: "7.1% conversion rate", color: "#10b981" },
  { label: "Today's Leads",     value: "23",     icon: <UserPlus size={20} />,    delta: "+5 from yesterday",    color: "#f59e0b" },
  { label: "Pending Follow-ups",value: "34",     icon: <Bell size={20} />,        delta: "8 due in 1 hr",       color: "#ef4444" },
];

const followUps = [
  { name: "Priya Sharma",  phone: "+91 98765 43210", time: "10:30 AM", tag: "HOT" },
  { name: "Amit Verma",    phone: "+91 87654 32109", time: "11:00 AM", tag: "INTERESTED" },
  { name: "Sunita Patel",  phone: "+91 76543 21098", time: "12:15 PM", tag: "FOLLOW_UP" },
  { name: "Rohit Gupta",   phone: "+91 65432 10987", time: "2:00 PM",  tag: "NEW" },
  { name: "Kavita Singh",  phone: "+91 54321 09876", time: "4:30 PM",  tag: "INTERESTED" },
];

const tagColors: Record<string, { bg: string; text: string }> = {
  NEW:          { bg: "#dbeafe", text: "#1e40af" },
  HOT:          { bg: "#fee2e2", text: "#991b1b" },
  INTERESTED:   { bg: "#fef9c3", text: "#713f12" },
  FOLLOW_UP:    { bg: "#ede9fe", text: "#5b21b6" },
  CONVERTED:    { bg: "#d1fae5", text: "#065f46" },
};

/* ─── Bar chart data ─────────────────────────────────────────── */
const chartData = [
  { day: "Mon", value: 18 },
  { day: "Tue", value: 27 },
  { day: "Wed", value: 14 },
  { day: "Thu", value: 31 },
  { day: "Fri", value: 22 },
  { day: "Sat", value: 9 },
  { day: "Sun", value: 16 },
];
const maxVal = Math.max(...chartData.map((d) => d.value));

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--surface)" }}>
      {/* ── Sidebar ── */}
      <Sidebar
        userRole={user.role}
        userName={user.name ?? undefined}
        userEmail={user.email ?? undefined}
      />

      {/* ── Main area ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top bar */}
        <header style={{
          background: "var(--surface-card)",
          borderBottom: "1px solid var(--outline-ghost)",
          padding: "0 1.5rem",
          height: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}>
          <div>
            <h1 style={{ fontSize: "0.9375rem", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
              Dashboard
            </h1>
            <p style={{ fontSize: "0.6875rem", color: "var(--text-muted)", margin: 0 }}>
              {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
              {user.name || user.email}
            </span>
            <form action={async () => { "use server"; await signOut(); }}>
              <button type="submit" style={{
                fontSize: "0.75rem", color: "#ef4444",
                background: "none", border: "none", cursor: "pointer", padding: "0.25rem 0.5rem",
                borderRadius: "0.25rem", transition: "background 0.15s"
              }}>
                Sign out
              </button>
            </form>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Stat cards */}
          <section style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
            {stats.map((s) => (
              <div key={s.label} className="stat-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ fontSize: "0.6875rem", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 0.5rem" }}>
                      {s.label}
                    </p>
                    <p style={{ fontSize: "2rem", fontWeight: "700", color: "var(--text-primary)", margin: 0, letterSpacing: "-0.03em", lineHeight: 1 }}>
                      {s.value}
                    </p>
                  </div>
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "0.5rem",
                    background: s.color + "18",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: s.color, flexShrink: 0,
                  }}>
                    {s.icon}
                  </div>
                </div>
                <p style={{ margin: "0.625rem 0 0", fontSize: "0.6875rem", color: "var(--text-muted)" }}>
                  {s.delta}
                </p>
              </div>
            ))}
          </section>

          {/* Bottom grid: chart + followups */}
          <section style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "1rem", alignItems: "start" }}>
            {/* Lead Activity Chart */}
            <div className="card" style={{ padding: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <div>
                  <h2 style={{ fontSize: "0.875rem", fontWeight: "700", color: "var(--text-primary)", margin: "0 0 0.125rem" }}>
                    Lead Activity
                  </h2>
                  <p style={{ fontSize: "0.6875rem", color: "var(--text-muted)", margin: 0 }}>
                    Last 7 days (17 Mar – 23 Mar)
                  </p>
                </div>
                <span style={{ fontSize: "0.6875rem", color: "var(--emerald)", fontWeight: "600" }}>+18% ↑</span>
              </div>

              {/* Bar chart */}
              <div style={{ display: "flex", alignItems: "flex-end", gap: "0.5rem", height: "140px" }}>
                {chartData.map((d) => (
                  <div key={d.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.375rem", height: "100%", justifyContent: "flex-end" }}>
                    <span style={{ fontSize: "0.625rem", color: "var(--text-muted)", fontWeight: "600" }}>{d.value}</span>
                    <div style={{
                      width: "100%",
                      height: `${(d.value / maxVal) * 100}%`,
                      background: "linear-gradient(180deg, #10b981, #059669)",
                      borderRadius: "3px 3px 0 0",
                      minHeight: "6px",
                      transition: "height 0.3s ease",
                    }} />
                    <span style={{ fontSize: "0.625rem", color: "var(--text-muted)" }}>{d.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Follow-ups */}
            <div className="card" style={{ padding: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h2 style={{ fontSize: "0.875rem", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
                  Upcoming Follow-ups
                </h2>
                <Link href="/followups" style={{ fontSize: "0.75rem", color: "var(--emerald)", textDecoration: "none", fontWeight: "600" }}>
                  View all
                </Link>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {followUps.map((f, i) => {
                  const colors = tagColors[f.tag] || tagColors.NEW;
                  return (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: "0.75rem",
                      padding: "0.625rem 0.75rem",
                      borderRadius: "0.375rem",
                      background: "var(--surface-low)",
                      transition: "background 0.15s",
                    }}>
                      <div style={{
                        width: "32px", height: "32px", borderRadius: "50%",
                        background: "linear-gradient(135deg, #1e293b, #334155)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.625rem", fontWeight: "700", color: "#10b981",
                        flexShrink: 0,
                      }}>
                        {f.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "0.8125rem", fontWeight: "600", color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {f.name}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", marginTop: "0.125rem" }}>
                          <MessageCircle size={11} style={{ color: "var(--emerald)" }} />
                          <span style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>{f.phone}</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.25rem", flexShrink: 0 }}>
                        <div style={{
                          fontSize: "0.625rem", fontWeight: "600",
                          background: colors.bg, color: colors.text,
                          padding: "0.125rem 0.5rem", borderRadius: "9999px",
                        }}>
                          {f.tag.replace("_", " ")}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                          <Clock size={10} style={{ color: "var(--text-muted)" }} />
                          <span style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>{f.time}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Quick actions */}
          <section className="card" style={{ padding: "1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h3 style={{ fontSize: "0.875rem", fontWeight: "700", color: "var(--text-primary)", margin: "0 0 0.25rem" }}>Quick Actions</h3>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0 }}>Jump to common tasks</p>
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <Link href="/leads/new">
                <button className="btn-emerald">
                  <Plus size={15} /> Add Lead
                </button>
              </Link>
              <Link href="/leads">
                <button className="btn-outline">
                  View All Leads <ArrowRight size={14} />
                </button>
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
