import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminId = session.user.id;
    const data = await req.json();

    if (!data?.leadId || typeof data.leadId !== "string") {
      return NextResponse.json({ error: "leadId is required" }, { status: 400 });
    }

    if (!data?.scheduledAt || typeof data.scheduledAt !== "string") {
      return NextResponse.json({ error: "scheduledAt is required" }, { status: 400 });
    }

    const scheduledAt = new Date(data.scheduledAt);
    if (Number.isNaN(scheduledAt.getTime())) {
      return NextResponse.json({ error: "Invalid scheduledAt" }, { status: 400 });
    }

    // Verify lead belongs to this admin
    const lead = await prisma.lead.findFirst({
      where: { id: data.leadId, adminId },
      select: { id: true, status: true },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const followUp = await prisma.followUp.create({
      data: {
        leadId: data.leadId,
        adminId,
        scheduledAt,
        notes: typeof data.notes === "string" && data.notes.trim() ? data.notes.trim() : null,
        status: "PENDING",
      },
    });

    // Update lead status to FOLLOW_UP if it's a new follow-up
    if (lead.status !== "FOLLOW_UP") {
      await prisma.lead.update({
        where: { id: data.leadId },
        data: { status: "FOLLOW_UP" },
      });
    }

    await prisma.activityLog.create({
      data: {
        userId: adminId,
        leadId: data.leadId,
        action: "FOLLOW_UP_CREATED",
        details: { scheduledAt: scheduledAt.toISOString() },
      },
    });

    return NextResponse.json(followUp);
  } catch (error) {
    console.error("Follow-up create error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
