import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  MAX_INITIAL_LEAD_QUESTIONS,
  MIN_INITIAL_LEAD_QUESTIONS,
  hasValidInitialLeadQuestionCount,
  parseInitialLeadQuestions,
} from "@/lib/initial-lead-questions";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminId = session.user.id;
  const settings = await prisma.adminSettings.findUnique({
    where: { adminId },
    select: { initialLeadQuestions: true },
  });

  return NextResponse.json({
    questions: parseInitialLeadQuestions(settings?.initialLeadQuestions),
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminId = session.user.id;

  let questions: ReturnType<typeof parseInitialLeadQuestions>;
  try {
    const data: unknown = await req.json();
    if (!data || typeof data !== "object" || !("questions" in data)) {
      return NextResponse.json(
        { error: "Invalid JSON body. Expected an object with a questions field." },
        { status: 400 }
      );
    }
    questions = parseInitialLeadQuestions((data as { questions: unknown }).questions);
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body. Expected an object with a questions field." },
      { status: 400 }
    );
  }

  if (!hasValidInitialLeadQuestionCount(questions)) {
    return NextResponse.json(
      {
        error: `Please configure between ${MIN_INITIAL_LEAD_QUESTIONS} and ${MAX_INITIAL_LEAD_QUESTIONS} questions, or remove all questions to disable.`,
      },
      { status: 400 }
    );
  }

  try {
    await prisma.adminSettings.upsert({
      where: { adminId },
      update: { initialLeadQuestions: questions.length ? questions : null },
      create: { adminId, initialLeadQuestions: questions.length ? questions : null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Questions save error:", error);
    return NextResponse.json({ error: "Failed to save questions" }, { status: 500 });
  }
}
