import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

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

  // Check for phone duplicate if phone changed
  if (data.phone && data.phone !== existingLead.phone) {
    const duplicate = await prisma.lead.findFirst({
      where: { phone: data.phone, adminId },
    });
    if (duplicate) {
      return NextResponse.json(
        { error: "A lead with this phone number already exists" },
        { status: 409 }
      );
    }
  }

  const updated = await prisma.lead.update({
    where: { id: leadId },
    data: {
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      city: data.city || null,
      status: data.status,
      source: data.source,
    },
  });

  return NextResponse.json(updated);
}
