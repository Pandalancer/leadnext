import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
import crypto from "crypto";

// WhatsApp webhook verification (GET) and message receiver (POST)
// URL: /api/webhooks/whatsapp/[adminId]

function verifyHubSignature256(rawBody: string, signatureHeader: string, secret: string) {
  // Meta webhooks use: "sha256=<hex>"
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
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode !== "subscribe") {
    return new NextResponse("Invalid mode", { status: 400 });
  }

  // Look up this admin's webhook secret
  const settings = await prisma.adminSettings.findUnique({
    where: { adminId: adminId },
    select: { whatsappWebhookSecret: true }
  });

  if (!settings?.whatsappWebhookSecret) {
    return new NextResponse("Admin not found or not configured", { status: 404 });
  }

  try {
    const secret = decrypt(settings.whatsappWebhookSecret);

    if (token !== secret) {
      return new NextResponse("Forbidden", { status: 403 });
    }
  } catch {
    return new NextResponse("Invalid secret configuration", { status: 500 });
  }

  return new NextResponse(challenge, { status: 200 });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ adminId: string }> }
) {
  try {
    const { adminId } = await params;
    // 1. Look up admin settings by adminId
    const settings = await prisma.adminSettings.findUnique({
      where: { adminId: adminId },
      select: {
        whatsappToken: true,
        whatsappPhoneNumberId: true,
        whatsappWebhookSecret: true,
        admin: { select: { id: true, status: true, role: true } }
      }
    });

    if (!settings || settings.admin?.role !== "ADMIN" || settings.admin?.status !== "ACTIVE") {
      return NextResponse.json({ error: "Not found or inactive" }, { status: 404 });
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
    
    // Extract message data
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;
    
    if (!messages || messages.length === 0) {
      return NextResponse.json({ success: true, message: "No messages" });
    }
    
    const msg = messages[0];
    
    // Only process text messages
    if (msg.type !== "text") {
      return NextResponse.json({ success: true, message: "Non-text message ignored" });
    }
    
    const from = msg.from;
    const text = msg.text?.body?.toLowerCase()?.trim() || "";
    
    // Normalize phone (last 10 digits)
    const phoneDigits = from.replace(/\D/g, "").slice(-10);
    
    if (phoneDigits.length !== 10) {
      return NextResponse.json({ error: "Invalid phone" }, { status: 400 });
    }
    
    // Skip reminder echoes
    if (text.includes("follow-up reminder")) {
      return NextResponse.json({ success: true, message: "Reminder echo skipped" });
    }
    
    // Intent filter
    const hasIntent = 
      text.includes("hi") ||
      text.includes("hello") ||
      text.includes("yes") ||
      text.includes("interested") ||
      text.includes("call");
    
    if (!hasIntent) {
      return NextResponse.json({ success: true, message: "No matching intent" });
    }
    
    // Determine status from message
    let status: "NEW" | "INTERESTED" | "NOT_INTERESTED" | "HOT" = "NEW";
    if (text.includes("yes") || text.includes("interested")) {
      status = "INTERESTED";
    } else if (text.includes("no")) {
      status = "NOT_INTERESTED";
    } else if (text.includes("call")) {
      status = "HOT";
    }
    
    // 4. Upsert lead with adminId from URL params
    const lead = await prisma.lead.upsert({
      where: {
        adminId_phone: {
          adminId: adminId,
          phone: phoneDigits,
        },
      },
      update: {
        status,
        updatedAt: new Date(),
      },
      create: {
        adminId: adminId,
        name: "WhatsApp User",
        phone: phoneDigits,
        source: "WHATSAPP",
        status,
      },
    });
    
    // 6. Write ActivityLog
    await prisma.activityLog.create({
      data: {
        userId: adminId,
        leadId: lead.id,
        action: "WHATSAPP_LEAD_CAPTURED",
        details: { message: text, status },
      },
    });
    
    return NextResponse.json({ 
      success: true, 
      leadId: lead.id,
      action: lead.createdAt.getTime() === lead.updatedAt.getTime() ? "created" : "updated"
    });
    
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
