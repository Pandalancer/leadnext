import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AddFollowUpClient from "./add-followup-client";

export default async function AddFollowUpPageServer({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user;

  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const lead = await prisma.lead.findFirst({
    where: { id, adminId: user.id },
    select: { id: true, name: true, phone: true },
  });

  if (!lead) {
    redirect("/leads");
  }

  return <AddFollowUpClient lead={lead} user={user} />;
}

