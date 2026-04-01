import { auth } from "@/auth";
import { redirect } from "next/navigation";
import NewLeadClient from "./new-lead-client";
import { prisma } from "@/lib/prisma";
import { parseInitialLeadQuestions } from "@/lib/initial-lead-questions";

export default async function NewLeadPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user;

  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const settings = await prisma.adminSettings.findUnique({
    where: { adminId: user.id },
    select: { initialLeadQuestions: true },
  });

  const initialLeadQuestions = parseInitialLeadQuestions(settings?.initialLeadQuestions);

  return <NewLeadClient user={user} initialLeadQuestions={initialLeadQuestions} />;
}
