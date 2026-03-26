import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public API endpoint for lead ingestion (similar to facebook_lead.php)
// Can be called by Facebook, WhatsApp webhook, or other external sources
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Validate required fields
    if (!data.phone || !data.name) {
      return NextResponse.json(
        { error: "Phone and name are required" },
        { status: 400 }
      );
    }

    // Validate phone format (10-15 digits)
    const phoneDigits = data.phone.replace(/\D/g, "");
    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      return NextResponse.json(
        { error: "Phone must be 10-15 digits" },
        { status: 400 }
      );
    }

    // Normalize phone
    const normalizedPhone = phoneDigits;

    // Determine admin assignment
    // If adminId provided, use it; otherwise assign to a default/admin based on logic
    const adminId = data.adminId || await getDefaultAdminId();

    if (!adminId) {
      return NextResponse.json(
        { error: "No admin available to assign lead" },
        { status: 500 }
      );
    }

    // Upsert lead by phone (prevent duplicates per admin)
    const lead = await prisma.lead.upsert({
      where: {
        // Use a unique constraint on phone+adminId or just phone
        // Since we don't have a composite unique constraint, we check first
        id: await getExistingLeadId(normalizedPhone, adminId),
      },
      update: {
        name: data.name,
        email: data.email || null,
        city: data.city || null,
        // Keep existing status if already processed
      },
      create: {
        adminId,
        name: data.name,
        phone: normalizedPhone,
        email: data.email || null,
        city: data.city || null,
        source: data.source || "API",
        status: "NEW",
      },
    });

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      action: lead.createdAt.getTime() === lead.updatedAt.getTime() ? "created" : "updated",
    });

  } catch (error) {
    console.error("Lead ingestion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function getDefaultAdminId(): Promise<string | null> {
  // Get first available admin
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    orderBy: { createdAt: "asc" },
  });
  return admin?.id || null;
}

async function getExistingLeadId(phone: string, adminId: string): Promise<string> {
  const existing = await prisma.lead.findFirst({
    where: { phone, adminId },
    select: { id: true },
  });
  // Return existing ID or a dummy that won't match (for create)
  return existing?.id || "new-lead-placeholder";
}

// Also support GET for simple testing
export async function GET() {
  return NextResponse.json({
    message: "Lead ingestion endpoint",
    usage: "POST with {name, phone, email?, city?, source?, adminId?}",
  });
}
