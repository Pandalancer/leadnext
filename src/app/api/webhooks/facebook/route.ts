import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Facebook Lead Ads webhook endpoint (similar to api/facebook_lead.php)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Facebook sends leadgen_id, we need to fetch lead data from Graph API
    // For now, support direct lead data POST ( simpler integration )
    const { name, phone, email, city, adminId, source = "FACEBOOK" } = body;
    
    // Validation (same as PHP)
    if (!phone || !/^\d{10,15}$/.test(phone.replace(/\D/g, ""))) {
      return NextResponse.json({ error: "Invalid phone" }, { status: 400 });
    }
    
    const normalizedPhone = phone.replace(/\D/g, "").slice(-10);
    
    // Use provided adminId or find default
    const targetAdminId = adminId || await getDefaultAdminId();
    
    if (!targetAdminId) {
      return NextResponse.json({ error: "No admin available" }, { status: 500 });
    }
    
    // Upsert lead (same pattern as PHP: INSERT ... ON DUPLICATE KEY UPDATE)
    const lead = await prisma.lead.upsert({
      where: {
        adminId_phone: {
          adminId: targetAdminId,
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
        adminId: targetAdminId,
        name: name || "Facebook Lead",
        phone: normalizedPhone,
        email: email || null,
        city: city || null,
        source,
        status: "NEW",
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

// GET for webhook verification
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  
  // Facebook webhook verification
  const mode = searchParams.get("hub.mode");
  const challenge = searchParams.get("hub.challenge");
  const verifyToken = searchParams.get("hub.verify_token");
  
  if (mode === "subscribe" && challenge) {
    // Verify token would be checked against stored secret
    return new NextResponse(challenge, { status: 200 });
  }
  
  return NextResponse.json({ 
    message: "Facebook Lead Ads webhook endpoint",
    usage: "POST with lead data {name, phone, email, city, adminId}"
  });
}

async function getDefaultAdminId(): Promise<string | null> {
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    orderBy: { createdAt: "asc" },
  });
  return admin?.id || null;
}
