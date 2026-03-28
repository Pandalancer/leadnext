import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LeadsPageClient } from "./leads-client";

async function LeadsPageServer() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user;

  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const leads = await prisma.lead.findMany({
    where: { adminId: user.id },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      city: true,
      status: true,
      source: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return <LeadsPageClient leads={leads} user={user} />;
}

export default LeadsPageServer;
