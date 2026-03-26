import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/crypto";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminId = session.user.id;
  const data = await req.json();

  try {
    // Upsert admin settings with encrypted sensitive fields
    const settings = await prisma.adminSettings.upsert({
      where: { adminId },
      update: {
        whatsappToken: data.whatsappToken ? encrypt(data.whatsappToken) : undefined,
        whatsappPhoneNumberId: data.whatsappPhoneId || null,
        whatsappWebhookSecret: data.whatsappWebhookSecret ? encrypt(data.whatsappWebhookSecret) : undefined,
        smtpHost: data.smtpHost || null,
        smtpPort: data.smtpPort ? parseInt(data.smtpPort) : null,
        smtpUser: data.smtpUser || null,
        smtpPass: data.smtpPassword ? encrypt(data.smtpPassword) : undefined,
        emailFrom: data.senderEmail || null,
      },
      create: {
        adminId,
        whatsappToken: data.whatsappToken ? encrypt(data.whatsappToken) : null,
        whatsappPhoneNumberId: data.whatsappPhoneId || null,
        whatsappWebhookSecret: data.whatsappWebhookSecret ? encrypt(data.whatsappWebhookSecret) : null,
        smtpHost: data.smtpHost || null,
        smtpPort: data.smtpPort ? parseInt(data.smtpPort) : null,
        smtpUser: data.smtpUser || null,
        smtpPass: data.smtpPassword ? encrypt(data.smtpPassword) : null,
        emailFrom: data.senderEmail || null,
      },
    });

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("Settings save error:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
