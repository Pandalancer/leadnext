import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { normalizePhoneToLast10Digits } from "@/lib/phone";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: leadId } = await params;
  const adminId = session.user.id;

  // Verify lead belongs to this admin
  const existingLead = await prisma.lead.findFirst({
    where: { id: leadId, adminId },
  });

  if (!existingLead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  const data = await req.json();

  if (!data?.name || typeof data.name !== "string") {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  if (!data?.phone || typeof data.phone !== "string") {
    return NextResponse.json({ error: "Phone is required" }, { status: 400 });
  }

  const nextPhone = normalizePhoneToLast10Digits(data.phone);
  if (nextPhone.length !== 10) {
    return NextResponse.json({ error: "Invalid phone" }, { status: 400 });
  }

  // Check for phone duplicate if phone changed (normalized).
  if (nextPhone !== existingLead.phone) {
    const duplicate = await prisma.lead.findFirst({
      where: { phone: nextPhone, adminId },
      select: { id: true },
    });
    if (duplicate && duplicate.id !== leadId) {
      return NextResponse.json(
        { error: "A lead with this phone number already exists" },
        { status: 409 }
      );
    }
  }

  const nextName = data.name.trim();
  const nextEmail =
    typeof data.email === "string" && data.email.trim() ? data.email.trim() : null;
  const nextCity =
    typeof data.city === "string" && data.city.trim() ? data.city.trim() : null;
  const nextStatus = typeof data.status === "string" ? data.status : existingLead.status;
  const nextSource = typeof data.source === "string" ? data.source : existingLead.source;
  const nextRemarks =
    typeof data.remarks === "string" && data.remarks.trim() ? data.remarks.trim() : null;

  const changes: Record<string, { old: unknown; new: unknown }> = {};
  if (existingLead.name !== nextName) changes.name = { old: existingLead.name, new: nextName };
  if (existingLead.phone !== nextPhone) changes.phone = { old: existingLead.phone, new: nextPhone };
  if (existingLead.email !== nextEmail) changes.email = { old: existingLead.email, new: nextEmail };
  if (existingLead.city !== nextCity) changes.city = { old: existingLead.city, new: nextCity };
  if (existingLead.status !== nextStatus) changes.status = { old: existingLead.status, new: nextStatus };
  if (existingLead.source !== nextSource) changes.source = { old: existingLead.source, new: nextSource };
  if (existingLead.remarks !== nextRemarks) changes.remarks = { old: existingLead.remarks, new: nextRemarks };

  const updated = await prisma.lead.update({
    where: { id: leadId },
    data: {
      name: nextName,
      phone: nextPhone,
      email: nextEmail,
      city: nextCity,
      status: nextStatus,
      source: nextSource,
      remarks: nextRemarks,
    },
  });

  if (Object.keys(changes).length > 0) {
    await prisma.activityLog.create({
      data: {
        userId: adminId,
        leadId,
        action: Object.keys(changes).length === 1 && changes.status ? "UPDATE_STATUS" : "UPDATE_LEAD",
        details: { changes },
      },
    });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: leadId } = await params;
  const adminId = session.user.id;

  const lead = await prisma.lead.findFirst({
    where: { id: leadId, adminId },
    select: { id: true, name: true, phone: true, email: true, city: true, status: true, source: true },
  });

  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  // ActivityLog.lead relation is not configured with onDelete:cascade, so delete dependent logs first.
  await prisma.$transaction([
    prisma.activityLog.create({
      data: {
        userId: adminId,
        leadId: null,
        action: "DELETE_LEAD",
        details: { lead },
      },
    }),
    prisma.activityLog.deleteMany({ where: { leadId } }),
    prisma.lead.delete({ where: { id: leadId } }),
  ]);

  return NextResponse.json({ success: true });
}
