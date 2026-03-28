import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { normalizePhoneToLast10Digits } from "@/lib/phone";

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
