import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { FollowupsClient } from "./followups-client";

export default async function FollowupsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user;

  // Only ADMIN can access
  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Fetch follow-ups for this admin with lead info
  const followUps = await prisma.followUp.findMany({
    where: { adminId: user.id },
    include: {
      lead: {
        select: { id: true, name: true, phone: true, status: true }
      }
    },
    orderBy: { scheduledAt: "asc" },
    take: 50
  });

  return <FollowupsClient user={user} followUps={followUps} />;
}
