import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
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
  Shield,
  Users,
  CheckCircle2,
} from "lucide-react";

const tagColors: Record<string, { bg: string; text: string }> = {
  NEW:          { bg: "#dbeafe", text: "#1e40af" },
  HOT:          { bg: "#fee2e2", text: "#991b1b" },
  INTERESTED:   { bg: "#fef9c3", text: "#713f12" },
  FOLLOW_UP:    { bg: "#ede9fe", text: "#5b21b6" },
  CONVERTED:    { bg: "#d1fae5", text: "#065f46" },
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user;

  // Super Admin sees tenant management, not lead data
  if (user.role === "SUPER_ADMIN") {
    // Fetch real counts from database
    const [adminCount, clientCount, leadCount] = await Promise.all([
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.user.count({ where: { role: "CLIENT" } }),
      prisma.lead.count(),
    ]);

    return <SuperAdminDashboard user={user} adminCount={adminCount} clientCount={clientCount} leadCount={leadCount} />;
  }

  // For Admin/Client - fetch their leads
  // Leads belong to clients, so for ADMIN we need to find leads of their clients
  let totalLeads = 0;
  if (user.role === "ADMIN") {
    // Get all client IDs belonging to this admin
    const clients = await prisma.user.findMany({
      where: { adminId: user.id, role: "CLIENT" },
      select: { id: true }
    });
    const clientIds = clients.map(c => c.id);
    totalLeads = await prisma.lead.count({
      where: { clientId: { in: clientIds } }
    });
  } else {
    // For CLIENT role
    totalLeads = await prisma.lead.count({
      where: { clientId: user.id }
    });
  }

  return <AdminDashboard user={user} totalLeads={totalLeads} />;
}

// Super Admin: Tenant Management View
function SuperAdminDashboard({ user, adminCount, clientCount, leadCount }: { user: any, adminCount: number, clientCount: number, leadCount: number }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--surface)" }}>
      <Sidebar
        userRole={user.role}
        userName={user.name ?? undefined}
        userEmail={user.email ?? undefined}
      />

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
              Super Admin Dashboard
            </h1>
            <p style={{ fontSize: "0.6875rem", color: "var(--text-muted)", margin: 0 }}>
              Manage tenants and system settings
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

        {/* Super Admin Content */}
        <main style={{ flex: 1, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Stats */}
          <section style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
            {[
              { label: "Total Admins", value: adminCount.toString(), icon: <Shield size={20} />, color: "#3b82f6", href: "/admins" },
              { label: "Total Clients", value: clientCount.toString(), icon: <Users size={20} />, color: "#10b981", href: "/clients" },
              { label: "Total Leads", value: leadCount.toLocaleString(), icon: <TrendingUp size={20} />, color: "#f59e0b", href: "/all-leads" },
              { label: "System Status", value: "Active", icon: <CheckCircle2 size={20} />, color: "#10b981", href: null },
            ].map((s) => (
              <Link 
                key={s.label} 
                href={s.href || "#"}
                style={{ textDecoration: "none" }}
              >
                <div className="stat-card" style={{ cursor: s.href ? "pointer" : "default" }}>
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
                </div>
              </Link>
            ))}
          </section>

          {/* Tenants Table */}
          <section className="card" style={{ padding: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "0.875rem", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
                Recent Admins
              </h2>
              <Link href="/admin" style={{ fontSize: "0.75rem", color: "var(--emerald)", textDecoration: "none", fontWeight: "600" }}>
                Manage All
              </Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {[
                { name: "Admin User", email: "admin@leadcrm.com", clients: 5, status: "Active" },
                { name: "Sales Team Lead", email: "sales@company.com", clients: 3, status: "Active" },
                { name: "Support Admin", email: "support@company.com", clients: 4, status: "Inactive" },
              ].map((admin, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: "0.75rem",
                  padding: "0.75rem",
                  borderRadius: "0.375rem",
                  background: "var(--surface-low)",
                }}>
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "50%",
                    background: "linear-gradient(135deg, #1e293b, #334155)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.75rem", fontWeight: "700", color: "#10b981",
                  }}>
                    {admin.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.875rem", fontWeight: "600", color: "var(--text-primary)" }}>
                      {admin.name}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{admin.email}</div>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{admin.clients} clients</div>
                  <div style={{
                    fontSize: "0.625rem", fontWeight: "600",
                    background: admin.status === "Active" ? "#d1fae5" : "#fee2e2",
                    color: admin.status === "Active" ? "#065f46" : "#991b1b",
                    padding: "0.125rem 0.5rem", borderRadius: "9999px",
                  }}>
                    {admin.status}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

// Admin/Client: Lead Dashboard View  
function AdminDashboard({ user, totalLeads }: { user: any, totalLeads: number }) {
  // Mock stats using real totalLeads count
  const stats = [
    { label: "Total Leads", value: totalLeads.toString(), icon: <TrendingUp size={20} />, delta: "All time", color: "#3b82f6" },
    { label: "Converted", value: "0", icon: <UserCheck size={20} />, delta: "0% conversion rate", color: "#10b981" },
    { label: "Today's Leads", value: "0", icon: <UserPlus size={20} />, delta: "No new leads today", color: "#f59e0b" },
    { label: "Pending Follow-ups", value: "0", icon: <Bell size={20} />, delta: "No pending", color: "#ef4444" },
  ];

  const chartData = [
    { day: "Mon", value: 0 },
    { day: "Tue", value: 0 },
    { day: "Wed", value: 0 },
    { day: "Thu", value: 0 },
    { day: "Fri", value: 0 },
    { day: "Sat", value: 0 },
    { day: "Sun", value: 0 },
  ];
  const maxVal = 1;

  const followUps: any[] = [];

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
