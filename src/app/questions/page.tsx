import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseInitialLeadQuestions } from "@/lib/initial-lead-questions";
import QuestionsClient from "./questions-client";

export default async function QuestionsPage() {
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

  const questions = parseInitialLeadQuestions(settings?.initialLeadQuestions);

  return <QuestionsClient user={user} questions={questions} />;
}
