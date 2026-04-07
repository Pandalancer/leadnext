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

  let data: Record<string, unknown>;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (data.smtpPort !== undefined && data.smtpPort !== "" && data.smtpPort !== null) {
    const port = parseInt(data.smtpPort as string, 10);
    if (isNaN(port) || port < 1 || port > 65535) {
      return NextResponse.json(
        { error: "smtpPort must be an integer between 1 and 65535." },
        { status: 400 }
      );
    }
  }

  try {
    // Upsert admin settings with encrypted sensitive fields.
    // initialLeadQuestions is intentionally omitted here; it is managed
    // exclusively via /api/admin/questions to avoid accidental overwrites.
    const settings = await prisma.adminSettings.upsert({
      where: { adminId },
      update: {
        whatsappToken: data.whatsappToken ? encrypt(data.whatsappToken as string) : undefined,
        whatsappPhoneNumberId: (data.whatsappPhoneId as string) || null,
        whatsappWebhookSecret: data.whatsappWebhookSecret ? encrypt(data.whatsappWebhookSecret as string) : undefined,
        smtpHost: (data.smtpHost as string) || null,
        smtpPort: data.smtpPort ? parseInt(data.smtpPort as string) : null,
        smtpUser: (data.smtpUser as string) || null,
        smtpPass: data.smtpPassword ? encrypt(data.smtpPassword as string) : undefined,
        emailFrom: (data.senderEmail as string) || null,
      },
      create: {
        adminId,
        whatsappToken: data.whatsappToken ? encrypt(data.whatsappToken as string) : null,
        whatsappPhoneNumberId: (data.whatsappPhoneId as string) || null,
        whatsappWebhookSecret: data.whatsappWebhookSecret ? encrypt(data.whatsappWebhookSecret as string) : null,
        smtpHost: (data.smtpHost as string) || null,
        smtpPort: data.smtpPort ? parseInt(data.smtpPort as string) : null,
        smtpUser: (data.smtpUser as string) || null,
        smtpPass: data.smtpPassword ? encrypt(data.smtpPassword as string) : null,
        emailFrom: (data.senderEmail as string) || null,
      },
    });

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("Settings save error:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
