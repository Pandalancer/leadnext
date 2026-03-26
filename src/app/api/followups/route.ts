import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminId = session.user.id;
  const data = await req.json();

  // Verify lead belongs to this admin
  const lead = await prisma.lead.findFirst({
    where: { id: data.leadId, adminId },
  });

  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  const followUp = await prisma.followUp.create({
    data: {
      leadId: data.leadId,
      adminId,
      scheduledAt: new Date(data.scheduledAt),
      notes: data.notes || null,
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

  return NextResponse.json(followUp);
}
