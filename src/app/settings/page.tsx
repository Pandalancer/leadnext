import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/sidebar";
import { ArrowLeft, User, Mail, Shield, Bell, Key } from "lucide-react";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user;

  // Fetch full user details
  const userDetails = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, name: true, email: true, role: true, status: true, createdAt: true }
  });

  // If user not found in DB (stale session after reset), redirect to login
  if (!userDetails) {
    redirect("/login");
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--surface)" }}>
      <Sidebar
        userRole={user.role}
        userName={user.name ?? undefined}
        userEmail={user.email ?? undefined}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, marginLeft: "240px" }}>
        {/* Header */}
        <header style={{
          background: "var(--surface-card)",
          borderBottom: "1px solid var(--outline-ghost)",
          padding: "0 1.5rem",
          height: "56px",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
        }}>
          <Link href="/dashboard" style={{ color: "var(--text-muted)" }}>
            <ArrowLeft size={18} />
          </Link>
          <h1 style={{ fontSize: "0.9375rem", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
            Settings
          </h1>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: "1.5rem" }}>
          <div style={{ maxWidth: "600px" }}>
            
            {/* Profile Section */}
            <div className="card" style={{ padding: "1.5rem", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
                <User size={20} style={{ color: "var(--emerald)" }} />
                <h2 style={{ fontSize: "1rem", fontWeight: "600" }}>Profile Information</h2>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Name</label>
                  <div style={{ padding: "0.75rem", background: "var(--surface-low)", borderRadius: "0.375rem", marginTop: "0.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <User size={16} style={{ color: "var(--text-muted)" }} />
                    {userDetails?.name || "Not set"}
                  </div>
                </div>
                
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Email</label>
                  <div style={{ padding: "0.75rem", background: "var(--surface-low)", borderRadius: "0.375rem", marginTop: "0.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Mail size={16} style={{ color: "var(--text-muted)" }} />
                    {userDetails?.email}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Role</label>
                  <div style={{ padding: "0.75rem", background: "var(--surface-low)", borderRadius: "0.375rem", marginTop: "0.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Shield size={16} style={{ color: "var(--text-muted)" }} />
                    {userDetails?.role?.replace("_", " ")}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Account Status</label>
                  <div style={{ padding: "0.75rem", background: "var(--surface-low)", borderRadius: "0.375rem", marginTop: "0.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: userDetails?.status === "ACTIVE" ? "#10b981" : "#ef4444" }} />
                    {userDetails?.status}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Member Since</label>
                  <div style={{ padding: "0.75rem", background: "var(--surface-low)", borderRadius: "0.375rem", marginTop: "0.25rem", color: "var(--text-muted)" }}>
                    {userDetails?.createdAt ? new Date(userDetails.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }) : "Unknown"}
                  </div>
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div className="card" style={{ padding: "1.5rem", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                <Key size={20} style={{ color: "var(--emerald)" }} />
                <h2 style={{ fontSize: "1rem", fontWeight: "600" }}>Security</h2>
              </div>
              <button style={{ padding: "0.75rem 1rem", background: "var(--surface-low)", border: "1px solid var(--outline-ghost)", borderRadius: "0.375rem", color: "var(--text-primary)", fontSize: "0.875rem", cursor: "pointer", width: "100%", textAlign: "left" }}>
                Change Password
              </button>
            </div>

            {/* Notifications Section */}
            <div className="card" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                <Bell size={20} style={{ color: "var(--emerald)" }} />
                <h2 style={{ fontSize: "1rem", fontWeight: "600" }}>Notifications</h2>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {["Email notifications for new leads", "Daily summary reports", "Follow-up reminders"].map((setting, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem", background: "var(--surface-low)", borderRadius: "0.375rem" }}>
                    <span style={{ fontSize: "0.875rem" }}>{setting}</span>
                    <div style={{ width: "40px", height: "20px", background: i === 0 ? "var(--emerald)" : "var(--outline-ghost)", borderRadius: "9999px", position: "relative" }}>
                      <div style={{ width: "16px", height: "16px", background: "white", borderRadius: "50%", position: "absolute", top: "2px", left: i === 0 ? "22px" : "2px" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
