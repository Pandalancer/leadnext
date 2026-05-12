import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { normalizePhoneToLast10Digits } from "@/lib/phone";
import {
  hasValidInitialLeadQuestionCount,
  parseInitialLeadQuestions,
} from "@/lib/initial-lead-questions";

type InitialQuestionAnswer = {
  id: string;
  question: string;
  answer: string | string[]; // Can be an array for CHECKBOX
};

function parseInitialQuestionResponses(
  questions: unknown,
  responses: unknown
): InitialQuestionAnswer[] {
  if (!responses || typeof responses !== "object") return [];
  const parsedQuestions = parseInitialLeadQuestions(questions);
  if (!hasValidInitialLeadQuestionCount(parsedQuestions)) return [];
  const parsedResponses: InitialQuestionAnswer[] = [];
  for (const item of parsedQuestions) {
    const answerValue = item.id in responses ? (responses as Record<string, unknown>)[item.id] : undefined;

    let answer: string | string[] | undefined;
    const allowedOptions = new Set(item.options ?? []);

    if (item.type === "CHECKBOX") {
      if (Array.isArray(answerValue)) {
        answer = answerValue
          .map((v) => (typeof v === "string" ? v.trim() : String(v)))
          .filter((v) => v && allowedOptions.has(v));
        if (answer.length === 0) answer = undefined;
      }
    } else if (item.type === "MULTIPLE_CHOICE" || item.type === "DROPDOWN") {
      if (typeof answerValue === "string" || typeof answerValue === "number" || typeof answerValue === "boolean") {
        const trimmed = String(answerValue).trim();
        if (trimmed && allowedOptions.has(trimmed)) {
          answer = trimmed;
        }
      }
    } else if (item.type === "RANGE") {
      if (
        typeof answerValue === "number" ||
        (typeof answerValue === "string" && answerValue.trim() !== "")
      ) {
        const num = Number(answerValue);
        if (!isNaN(num)) {
          const min = typeof item.min === "number" ? item.min : num;
          const max = typeof item.max === "number" ? item.max : num;
          const lowerBound = Math.min(min, max);
          const upperBound = Math.max(min, max);
          answer = String(Math.min(upperBound, Math.max(lowerBound, num)));
        }
      }
    } else {
      if (typeof answerValue === "string") {
        const trimmed = answerValue.trim();
        if (trimmed) answer = trimmed;
      } else if (typeof answerValue === "number" || typeof answerValue === "boolean") {
        answer = String(answerValue);
      }
    }

    if (answer === undefined) continue;

    parsedResponses.push({
      id: item.id,
      question: item.question,
      answer,
    });
  }
  return parsedResponses;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminId = session.user.id;
  const data = await req.json();

  if (!data?.name || typeof data.name !== "string") {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  if (!data?.phone || typeof data.phone !== "string") {
    return NextResponse.json({ error: "Phone is required" }, { status: 400 });
  }

  const phone = normalizePhoneToLast10Digits(data.phone);
  if (phone.length !== 10) {
    return NextResponse.json({ error: "Invalid phone" }, { status: 400 });
  }

  const adminSettings = await prisma.adminSettings.findUnique({
    where: { adminId },
    select: { initialLeadQuestions: true },
  });
  const initialQuestionResponses = parseInitialQuestionResponses(
    adminSettings?.initialLeadQuestions,
    data?.initialQuestionResponses
  );

  const existing = await prisma.lead.findFirst({
    where: { adminId, phone },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json({ error: "A lead with this phone number already exists" }, { status: 409 });
  }

  const lead = await prisma.lead.create({
    data: {
      adminId,
      name: data.name.trim(),
      phone,
      email: typeof data.email === "string" && data.email.trim() ? data.email.trim() : null,
      city: typeof data.city === "string" && data.city.trim() ? data.city.trim() : null,
      status: typeof data.status === "string" ? data.status : "NEW",
      source: typeof data.source === "string" ? data.source : "MANUAL",
      remarks: typeof data.remarks === "string" && data.remarks.trim() ? data.remarks.trim() : null,
      initialQuestionResponses: (initialQuestionResponses.length ? initialQuestionResponses : null) as Prisma.InputJsonValue,
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: adminId,
      leadId: lead.id,
      action: "CREATE_LEAD",
      details: { source: lead.source },
    },
  });

  return NextResponse.json(lead);
}
