import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardClient } from "./dashboard-client";

async function DashboardPageServer() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user;

  let totalLeads = 0;
  if (user.role === "ADMIN") {
    totalLeads = await prisma.lead.count({
      where: { adminId: user.id },
    });
  } else if (user.role === "SUPER_ADMIN") {
    totalLeads = await prisma.lead.count();
  }

  return <DashboardClient user={user} totalLeads={totalLeads} />;
}

export default DashboardPageServer;
