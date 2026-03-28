import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EditLeadClient from "./edit-lead-client";

export default async function EditLeadPageServer({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user;

  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const lead = await prisma.lead.findFirst({
    where: { id, adminId: user.id },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      city: true,
      status: true,
      source: true,
    },
  });

  if (!lead) {
    redirect("/leads");
  }

  return <EditLeadClient lead={lead} user={user} />;
}

