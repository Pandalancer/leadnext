import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// WhatsApp webhook verification (GET) and message receiver (POST)
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  
  // Meta webhook verification
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");
  
  if (mode === "subscribe" && token && challenge) {
    // Find admin with matching webhook secret
    // Note: In production, you'd verify against the encrypted token
    return new NextResponse(challenge, { status: 200 });
  }
  
  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Log for debugging
    console.log("WhatsApp webhook received:", JSON.stringify(body, null, 2));
    
    // Extract message data (similar to PHP webhook.php)
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;
    
    if (!messages || messages.length === 0) {
      // Could be a status update, not a message
      return NextResponse.json({ success: true, message: "No messages" });
    }
    
    const msg = messages[0];
    
    // Only process text messages
    if (msg.type !== "text") {
      return NextResponse.json({ success: true, message: "Non-text message ignored" });
    }
    
    const from = msg.from; // Phone number
    const text = msg.text?.body?.toLowerCase()?.trim() || "";
    
    // Normalize phone (last 10 digits)
    const phoneDigits = from.replace(/\D/g, "").slice(-10);
    
    if (phoneDigits.length !== 10) {
      return NextResponse.json({ error: "Invalid phone" }, { status: 400 });
    }
    
    // Skip reminder echoes (safety check from PHP)
    if (text.includes("follow-up reminder")) {
      return NextResponse.json({ success: true, message: "Reminder echo skipped" });
    }
    
    // Intent filter (same as PHP: hi, hello, yes, interested, call)
    const hasIntent = 
      text.includes("hi") ||
      text.includes("hello") ||
      text.includes("yes") ||
      text.includes("interested") ||
      text.includes("call");
    
    if (!hasIntent) {
      return NextResponse.json({ success: true, message: "No matching intent" });
    }
    
    // Determine status from message (same logic as PHP)
    let status: "NEW" | "INTERESTED" | "NOT_INTERESTED" | "HOT" = "NEW";
    if (text.includes("yes") || text.includes("interested")) {
      status = "INTERESTED";
    } else if (text.includes("no")) {
      status = "NOT_INTERESTED";
    } else if (text.includes("call")) {
      status = "HOT";
    }
    
    // Find admin by phone number ID or use default
    // In production, you'd map the business phone number to an admin
    const admin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
      orderBy: { createdAt: "asc" },
    });
    
    if (!admin) {
      return NextResponse.json({ error: "No admin found" }, { status: 500 });
    }
    
    // Upsert lead (create or update by phone)
    const lead = await prisma.lead.upsert({
      where: {
        adminId_phone: {
          adminId: admin.id,
          phone: phoneDigits,
        },
      },
      update: {
        status,
        updatedAt: new Date(),
      },
      create: {
        adminId: admin.id,
        name: "WhatsApp User",
        phone: phoneDigits,
        source: "WHATSAPP",
        status,
      },
    });
    
    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: admin.id,
        leadId: lead.id,
        action: "WHATSAPP_LEAD",
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
