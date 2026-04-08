# LeadCRM - Complete Walkthrough

A Next.js Lead Management CRM with WhatsApp and Facebook Lead Ads integration.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [User Roles & Permissions](#user-roles--permissions)
3. [Initial Setup](#initial-setup)
4. [Dashboard](#dashboard)
5. [Lead Management](#lead-management)
6. [Follow-ups](#follow-ups)
7. [WhatsApp Integration](#whatsapp-integration)
8. [Facebook Lead Ads Integration](#facebook-lead-ads-integration)
9. [Admin Settings](#admin-settings)
10. [Activity History](#activity-history)
11. [API Reference](#api-reference)

---

## Architecture Overview

**Tech Stack:**
- **Frontend:** Next.js 14 (App Router), React, TypeScript
- **Backend:** Next.js API Routes (Server Actions)
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **Auth:** NextAuth.js v5
- **Deployment:** Vercel

**Key Features:**
- 2-tier role system (SUPER_ADMIN, ADMIN)
- Real-time lead capture from WhatsApp & Facebook
- Follow-up scheduling with reminders
- Activity logging for all actions
- AES-256 encryption for sensitive credentials

---

## User Roles & Permissions

### SUPER_ADMIN
- **Access:** All pages and data
- **Capabilities:**
  - View system-wide dashboard
  - Manage all admins
  - View all leads across all admins
  - System configuration

### ADMIN
- **Access:** Own data only
- **Capabilities:**
  - View personal dashboard
  - Manage own leads
  - Schedule follow-ups
  - Configure WhatsApp & Email settings
  - View activity history

---

## Initial Setup

### 1. Environment Variables
Create `.env.local`:
```env
# Database
DATABASE_URL="postgresql://postgres:password@host:5432/db"
DIRECT_URL="postgresql://postgres:password@host:5432/db"

# Auth
NEXTAUTH_SECRET="your-random-secret-min-32-chars"
NEXTAUTH_URL="https://your-domain.com"

# Encryption (32 bytes hex, 64 characters)
# Generate with: openssl rand -hex 32
# Must be exactly 64 hex characters (32 bytes)
# Do NOT use openssl rand -base64 32 — base64 output is not hex and will cause runtime encryption/decryption errors (for example, invalid key length)
ENCRYPTION_KEY="paste-64-char-hex-string-here"
```

### 2. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (creates super admin)
npx prisma db seed
```

**Default credentials after seed:**
- **SUPER_ADMIN:** superadmin@leadcrm.com / ChangeMe@SuperAdmin1!
- **ADMIN:** admin@leadcrm.com / ChangeMe@Admin1!

**⚠️ IMPORTANT:** Change these passwords immediately after first login!

### 3. Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

---

## Dashboard

### Super Admin Dashboard
Shows platform-level metrics:
- Total Admins
- Total Clients (reserved for V2)
- Total Leads

**Cards are clickable** - takes you to respective management pages.

### Admin Dashboard
Shows personal metrics:
- Total Leads
- New Leads (this month)
- Follow-ups Today
- Conversion Rate

---

## Lead Management

### Lead Sources
Leads can come from:
- **MANUAL** - Added by admin manually
- **WHATSAPP** - Auto-captured from WhatsApp messages
- **FACEBOOK** - Auto-captured from Facebook Lead Ads
- **WEBSITE** - Website form submissions
- **REFERRAL** - Referral sources

### Lead Statuses
- **NEW** - Just captured, no action taken
- **INTERESTED** - Expressed interest
- **NOT_INTERESTED** - Declined
- **NOT_PICKED** - Didn't respond to calls
- **HOT** - High priority, ready to convert
- **CONVERTED** - Successfully converted
- **FOLLOW_UP** - Requires follow-up

### Managing Leads

**My Leads Page (`/leads`):**
- View all your leads
- **Filters:** Search by name/phone/email/city, filter by status
- Click any lead to view details

**Lead Detail Page (`/leads/[id]`):**
- View complete lead information
- See all follow-ups
- **Activity History** - chronological log of all actions
- Edit lead button
- Add follow-up button

**Edit Lead (`/leads/[id]/edit`):**
- Update name, phone, email, city
- Change status
- Add remarks

---

## Follow-ups

### Scheduling Follow-ups
From lead detail page → **"Add Follow-up"**

**Fields:**
- **Date & Time** - When to follow up
- **Notes** - What to discuss

### Follow-up Statuses
- **PENDING** - Scheduled, awaiting
- **REMINDED** - Reminder sent
- **COMPLETED** - Follow-up done
- **SNOOZED** - Rescheduled
- **CANCELLED** - Cancelled

### Viewing Follow-ups
**Follow-ups Page (`/followups`):**
- Shows all your follow-ups
- Sorted by scheduled date
- Color-coded by status

---

## WhatsApp Integration

### Overview
Automatically capture leads from incoming WhatsApp messages. When someone messages your WhatsApp Business number, a lead is created/updated with status based on message content.

### Setup Steps

#### 1. Create Meta Developer Account
- Go to https://developers.facebook.com
- Create a developer account
- Create a new app (type: Business)

#### 2. Add WhatsApp Product
- In your app → Add Product → WhatsApp
- This gives you a test phone number

#### 3. Get Your Credentials
**From Meta Developer Dashboard:**
- **Access Token:** WhatsApp → Access Tokens → Generate Token
- **Phone Number ID:** WhatsApp → Getting Started → Phone Number ID
- **Verify Token:** Create any secret string (e.g., "my_webhook_secret_123")

#### 4. Configure in Your App
Go to `/admin` → **WhatsApp Business API** section:

| Field | Value |
|-------|-------|
| Access Token | `EAAYZAejIIFLUBO...` (from Meta) |
| Phone Number ID | `1091354217387254` (from Meta) |
| Webhook Verify Token | `your_secret_here` (you create this) |

#### 5. Configure Meta Webhook
Back in Meta Developer Dashboard:
- WhatsApp → Configuration → Webhooks
- **Callback URL:** `https://your-domain.com/api/webhooks/whatsapp/{your_admin_id}`
- **Verify Token:** Same as above
- Subscribe to `messages` field

**Note:** Each admin has their own webhook URL with their adminId

### How It Works

**Message Intents → Lead Status:**
| Message Contains | Lead Status |
|------------------|-------------|
| "hi", "hello" | NEW |
| "yes", "interested" | INTERESTED |
| "no" | NOT_INTERESTED |
| "call" | HOT |

**Phone Normalization:**
- Incoming: `+91 98765 43210`
- Stored: `9876543210` (last 10 digits)

**Lead Creation:**
- If phone exists → Updates status
- If phone new → Creates new lead
- Source set to `WHATSAPP`

---

## Facebook Lead Ads Integration

### Overview
Capture leads directly from Facebook Lead Ads. When someone submits your lead form, data flows automatically into your CRM.

### Setup Options

#### Option 1: Direct API (Recommended)
Use the lead ingestion endpoint from your Facebook Ads webhook:

```
POST https://your-domain.com/api/leads/ingest/{your_admin_id}
Content-Type: application/json
x-leadcrm-ingest-secret: <per-admin secret>

{
  "name": "John Doe",
  "phone": "9876543210",
  "email": "john@example.com",
  "city": "Mumbai",
  "source": "FACEBOOK"
}
```

**Note:** adminId is now in the URL, not the body
**Security:** `x-leadcrm-ingest-secret` must match the per-admin secret configured in Admin Settings.

#### Option 2: Meta Webhook
1. Facebook Business Manager → Lead Access → Webhooks
2. Add URL: `https://your-domain.com/api/webhooks/facebook/{your_admin_id}`
3. Subscribe to `leadgen_id` field
4. Verify webhook

**Note:** Each admin has their own webhook URL with their adminId
**Verification:** The webhook verification request must include `hub.verify_token` matching the per-admin secret configured in Admin Settings.

### Lead Data Mapping
| Facebook Field | CRM Field |
|---------------|-----------|
| Full Name | name |
| Phone Number | phone (normalized) |
| Email | email |
| City | city |
| Form ID | source = "FACEBOOK" |

---

## Admin Settings

### Accessing Settings
Navigate to `/admin` (Admin role only)

### WhatsApp Configuration
- **Access Token** - Meta Graph API token (encrypted)
- **Phone Number ID** - Meta identifier for routing
- **Webhook Verify Token** - Secret for webhook validation

### Email (SMTP) Configuration
For sending follow-up reminders:

| Field | Example |
|-------|---------|
| SMTP Host | `smtp.gmail.com` |
| Port | `587` |
| Username | `your-email@gmail.com` |
| Password | App Password (not regular password) |
| Sender Email | `noreply@yourcompany.com` |
| Sender Name | `Your Company` |

**Gmail App Password Setup:**
1. Google Account → Security → 2-Step Verification → ON
2. Security → App Passwords
3. Select "Mail" + "Other (Custom name)"
4. Generate → Copy 16-character password

---

## Activity History

Every action is logged automatically:

**Logged Activities:**
- `CREATE_LEAD` - New lead created
- `UPDATE_STATUS` - Status changed
- `SEND_WHATSAPP` - WhatsApp message sent
- `WHATSAPP_LEAD` - Lead from WhatsApp
- `FOLLOW_UP_CREATED` - Follow-up scheduled
- `FOLLOW_UP_COMPLETED` - Follow-up done
- `FOLLOW_UP_SNOOZED` - Follow-up rescheduled

**View:** On any lead detail page → **Activity History** section

---

## API Reference

### Authentication
All API routes (except webhooks) require session authentication via NextAuth.

### Lead Management

#### Update Lead
```
PUT /api/leads/[id]
Content-Type: application/json

{
  "name": "Updated Name",
  "phone": "9876543210",
  "email": "new@email.com",
  "city": "Delhi",
  "status": "HOT",
  "remarks": "Interested in premium plan"
}
```

#### Create Follow-up
```
POST /api/followups
Content-Type: application/json

{
  "leadId": "lead_uuid",
  "scheduledAt": "2024-01-15T10:00:00Z",
  "notes": "Discuss pricing"
}
```

#### Public Lead Ingestion
```
POST /api/leads/ingest/{adminId}
Content-Type: application/json
x-leadcrm-ingest-secret: <per-admin secret>

{
  "name": "Lead Name",
  "phone": "9876543210",
  "email": "optional@email.com",
  "city": "Optional City",
  "source": "FACEBOOK"
}
```

**Note:** adminId is required in URL path, not in request body
**Security:** `x-leadcrm-ingest-secret` must match the per-admin secret configured in Admin Settings.

### Admin Settings

#### Save Settings
```
POST /api/admin/settings
Content-Type: application/json

{
  "whatsappToken": "EAAYZA...",
  "whatsappPhoneId": "1091354217387254",
  "whatsappWebhookSecret": "secret123",
  "smtpHost": "smtp.gmail.com",
  "smtpPort": "587",
  "smtpUser": "email@gmail.com",
  "smtpPassword": "app_password",
  "senderEmail": "noreply@company.com",
  "senderName": "Your Company"
}
```

### Webhooks (Public)

#### WhatsApp Webhook
```
GET /api/webhooks/whatsapp/{adminId}?hub.mode=subscribe&hub.verify_token=xxx&hub.challenge=xxx
POST /api/webhooks/whatsapp/{adminId}
```

#### Facebook Lead Webhook
```
GET /api/webhooks/facebook/{adminId}?hub.mode=subscribe&hub.verify_token=xxx&hub.challenge=xxx
POST /api/webhooks/facebook/{adminId}
```

---

## Security Notes

1. **Encryption:** WhatsApp tokens and SMTP passwords are AES-256 encrypted before storage
2. **Phone Uniqueness:** Phone numbers are unique per admin (not globally)
3. **Role Access:** All routes check user role before serving data
4. **Session:** Secure HTTP-only cookies via NextAuth
5. **Webhook authenticity:** WhatsApp/Facebook webhook POST requests are validated using `x-hub-signature-256` against the per-admin secret
6. **Ingest auth:** `/api/leads/ingest/{adminId}` requires `x-leadcrm-ingest-secret`

---

## Troubleshooting

### WhatsApp messages not creating leads
- Check Phone Number ID is correctly saved in `/admin`
- Verify webhook URL in Meta Dashboard matches your live domain
- Check Vercel logs for webhook errors

### Email reminders not sending
- Verify SMTP credentials in `/admin`
- For Gmail, use App Password (not regular password)
- Check spam folders

### Cannot access pages
- Ensure you're logged in with correct role
- SUPER_ADMIN sees different pages than ADMIN
- Check `/dashboard` first after login

---

## Support

For issues or feature requests, check the codebase or create an issue in the repository.
