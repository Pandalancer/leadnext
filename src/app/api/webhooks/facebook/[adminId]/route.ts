import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
import crypto from "crypto";

// Facebook Lead Ads webhook endpoint - per-admin route
// URL: /api/webhooks/facebook/[adminId]

function verifyHubSignature256(rawBody: string, signatureHeader: string, secret: string) {
  const [algo, sentHex] = signatureHeader.split("=", 2);
  if (algo !== "sha256" || !sentHex || sentHex.length < 32) return false;

  const expectedHex = crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  const expected = Buffer.from(expectedHex, "hex");

  let sent: Buffer;
  try {
    sent = Buffer.from(sentHex, "hex");
  } catch {
    return false;
  }

  if (sent.length !== expected.length) return false;
  return crypto.timingSafeEqual(sent, expected);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ adminId: string }> }
) {
  const { adminId } = await params;
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const challenge = searchParams.get("hub.challenge");
  const verifyToken = searchParams.get("hub.verify_token");

  if (mode !== "subscribe") {
    return new NextResponse("Invalid mode", { status: 400 });
  }

  // Verify admin exists, is active, and has a configured secret.
  const settings = await prisma.adminSettings.findUnique({
    where: { adminId },
    select: {
      whatsappWebhookSecret: true,
      admin: { select: { id: true, role: true, status: true } },
    },
  });

  if (!settings || settings.admin?.role !== "ADMIN" || settings.admin?.status !== "ACTIVE") {
    return new NextResponse("Admin not found or inactive", { status: 404 });
  }

  if (!settings.whatsappWebhookSecret) {
    return new NextResponse("Admin not configured", { status: 404 });
  }

  const secret = decrypt(settings.whatsappWebhookSecret);
  if (!verifyToken || verifyToken !== secret) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // Facebook sends the challenge back for verification
  if (challenge) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Missing challenge", { status: 400 });
}

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
      return NextResponse.json({ error: "Admin not found or inactive" }, { status: 404 });
    }

    if (!settings.whatsappWebhookSecret) {
      return NextResponse.json({ error: "Webhook not configured" }, { status: 404 });
    }

    const secret = decrypt(settings.whatsappWebhookSecret);
    const signature = request.headers.get("x-hub-signature-256");
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }

    const rawBody = await request.text();
    if (!verifyHubSignature256(rawBody, signature, secret)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    
    // Facebook sends leadgen_id in real webhooks
    // For direct POST integration, we accept lead data directly
    const { name, phone, email, city, leadgen_id } = body;
    
    // Validation
    if (!phone) {
      return NextResponse.json({ error: "Phone is required" }, { status: 400 });
    }
    
    const normalizedPhone = phone.replace(/\D/g, "").slice(-10);
    
    if (normalizedPhone.length !== 10) {
      return NextResponse.json({ error: "Invalid phone format" }, { status: 400 });
    }
    
    // 3. Upsert lead - adminId from URL params only
    const lead = await prisma.lead.upsert({
      where: {
        adminId_phone: {
          adminId: adminId,
          phone: normalizedPhone,
        },
      },
      update: {
        name: name || "Facebook Lead",
        email: email || null,
        city: city || null,
        status: "NEW",
        updatedAt: new Date(),
      },
      create: {
        adminId: adminId,
        name: name || "Facebook Lead",
        phone: normalizedPhone,
        email: email || null,
        city: city || null,
        source: "FACEBOOK",
        status: "NEW",
      },
    });
    
    // 4. Log activity
    await prisma.activityLog.create({
      data: {
        userId: adminId,
        leadId: lead.id,
        action: "FACEBOOK_LEAD_CAPTURED",
        details: {
          leadgen_id: leadgen_id || null,
          phone: normalizedPhone 
        },
      },
    });
    
    return NextResponse.json({ 
      success: true, 
      leadId: lead.id,
      action: lead.createdAt.getTime() === lead.updatedAt.getTime() ? "created" : "updated"
    });
    
  } catch (error) {
    console.error("Facebook webhook error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
