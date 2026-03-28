import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";

// Public API endpoint for lead ingestion - per-admin route
// URL: /api/leads/ingest/[adminId]
// Security: Requires a per-admin secret header.

const INGEST_SECRET_HEADER = "x-leadcrm-ingest-secret";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ adminId: string }> }
) {
  try {
    const { adminId } = await params;
    const settings = await prisma.adminSettings.findUnique({
      where: { adminId },
      select: {
        whatsappWebhookSecret: true,
        admin: { select: { id: true, role: true, status: true } },
      },
    });

    if (!settings || settings.admin?.role !== "ADMIN" || settings.admin?.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Admin not found or inactive" },
        { status: 404 }
      );
    }

    if (!settings.whatsappWebhookSecret) {
      return NextResponse.json({ error: "Ingest not configured" }, { status: 404 });
    }

    const secret = decrypt(settings.whatsappWebhookSecret);
    const provided = request.headers.get(INGEST_SECRET_HEADER);
    if (!provided || provided !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // 2. Validate required fields
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
    const normalizedPhone = phoneDigits.slice(-10);

    // 3. Upsert lead - adminId from URL only, never from body
    const lead = await prisma.lead.upsert({
      where: {
        adminId_phone: {
          adminId: adminId,
          phone: normalizedPhone,
        },
      },
      update: {
        name: data.name,
        email: data.email || null,
        city: data.city || null,
        updatedAt: new Date(),
      },
      create: {
        adminId: adminId,
        name: data.name,
        phone: normalizedPhone,
        email: data.email || null,
        city: data.city || null,
        source: data.source || "API",
        status: "NEW",
      },
    });

    // 4. Log activity
    await prisma.activityLog.create({
      data: {
        userId: adminId,
        leadId: lead.id,
        action: "LEAD_INGESTED",
        details: { 
          source: data.source || "API",
          phone: normalizedPhone 
        },
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ adminId: string }> }
) {
  const { adminId } = await params;
  return NextResponse.json({
    message: "Lead ingestion endpoint",
    adminId: adminId,
    usage: "POST with {name, phone, email?, city?, source?}",
    auth: {
      header: INGEST_SECRET_HEADER,
      note: "Set this to the per-admin secret configured in AdminSettings.",
    },
    note: "adminId is taken from URL, not body",
  });
}
