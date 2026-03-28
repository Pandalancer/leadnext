import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPageClient } from "./admin-client";

async function AdminPageServer() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user;
  const baseUrl = process.env.NEXTAUTH_URL?.replace(/\/$/, "") ?? "";

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

  return <AdminPageClient user={user} settings={settings} baseUrl={baseUrl} />;
}

export default AdminPageServer;
