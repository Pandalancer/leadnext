<div align="center">

# 🟢 LeadCRM

**A WhatsApp-first, multi-tenant CRM built with Next.js**

Manage leads, schedule follow-ups, and integrate with WhatsApp & Facebook — all in one place.

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?logo=prisma)](https://www.prisma.io)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000?logo=vercel)](https://vercel.com)

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🏢 **Multi-Tenant** | Isolated data per admin with a Super Admin view across all tenants |
| 💬 **WhatsApp Integration** | Receive leads automatically via WhatsApp Business API webhooks |
| 📣 **Facebook Lead Ads** | Capture leads from Facebook ad campaigns in real time |
| 📋 **Lead Management** | Full CRUD for leads with status tracking: `NEW → INTERESTED → HOT → CONVERTED` |
| ⏰ **Follow-up Scheduler** | Schedule, snooze, and complete follow-ups with reminders |
| 📊 **Admin Dashboard** | Stats, recent activity feed, and upcoming follow-up summary |
| 🔒 **Role-Based Access** | `SUPER_ADMIN` and `ADMIN` roles with enforced route protection |
| 🔐 **Encryption** | AES-256-GCM for WhatsApp tokens, SMTP passwords, and other sensitive data |
| 📝 **Activity Logs** | Full audit trail of every mutation per lead |
| 📱 **Responsive UI** | Mobile-first design with a collapsible sidebar and glassmorphism style |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org) (App Router) |
| **Language** | TypeScript 5 |
| **Auth** | [NextAuth.js v5](https://authjs.dev) — Credentials Provider, JWT sessions |
| **Database** | PostgreSQL (hosted on [Supabase](https://supabase.com)) |
| **ORM** | [Prisma 5](https://www.prisma.io) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com) |
| **State** | [Zustand v5](https://zustand-demo.pmnd.rs) + [TanStack Query v5](https://tanstack.com/query) |
| **Icons** | [Lucide React](https://lucide.dev) |
| **Encryption** | Node.js `crypto` — AES-256-GCM |
| **Deployment** | [Vercel](https://vercel.com) (standalone output) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18 or later
- **PostgreSQL** database (local or [Supabase](https://supabase.com))
- **npm** (or yarn / pnpm)

### 1. Clone the repository

```bash
git clone https://github.com/harryneopotter/leadnext.git
cd leadnext
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
# PostgreSQL — use separate URLs for Supabase connection pooling
DATABASE_URL="postgresql://user:password@host:5432/leadcrm?pgbouncer=true"
DIRECT_URL="postgresql://user:password@host:5432/leadcrm"

# NextAuth — generate a strong random secret
NEXTAUTH_SECRET="your-super-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# AES-256-GCM encryption key (32-byte key encoded as 64 hex characters)
ENCRYPTION_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
```

> **Tip:** Generate a `NEXTAUTH_SECRET` with `openssl rand -base64 32` and an `ENCRYPTION_KEY` with `openssl rand -hex 32`.

### 4. Set up the database

```bash
# Apply migrations and generate the Prisma client
npx prisma migrate dev

# (Optional) Seed with a Super Admin, Admin, and sample leads
npx prisma db seed
```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Default Credentials (Seed Data)

> ⚠️ For local/dev only. Rotate or remove these immediately in shared or production environments.

| Role | Email | Password |
|---|---|---|
| `SUPER_ADMIN` | `superadmin@leadcrm.com` | `SuperAdmin@2024!` |
| `ADMIN` | `admin@leadcrm.com` | `Admin@2024!` |

---

## 📁 Project Structure

```
leadnext/
├── prisma/
│   ├── schema.prisma          # Database models
│   └── seed.ts                # Seed script
├── src/
│   ├── app/
│   │   ├── api/               # REST API routes
│   │   │   ├── auth/          # NextAuth endpoints
│   │   │   ├── leads/         # Lead CRUD + ingest
│   │   │   ├── followups/     # Follow-up CRUD
│   │   │   ├── admin/         # Admin settings
│   │   │   └── webhooks/      # WhatsApp & Facebook webhooks
│   │   ├── dashboard/         # Admin dashboard
│   │   ├── leads/             # Lead list, detail, create, edit
│   │   ├── followups/         # Follow-up schedule
│   │   ├── settings/          # WhatsApp & SMTP config
│   │   ├── admins/            # Manage admin users (Super Admin)
│   │   ├── all-leads/         # Cross-tenant lead view (Super Admin)
│   │   ├── login/             # Login page
│   │   └── page.tsx           # Public landing page
│   ├── auth.ts                # NextAuth configuration
│   ├── proxy.ts               # Page-route gating logic (wire via middleware entrypoint)
│   ├── components/
│   │   ├── sidebar.tsx        # Navigation sidebar
│   │   └── providers.tsx      # React Query + Session providers
│   └── lib/
│       ├── crypto.ts          # AES-256-GCM helpers
│       ├── phone.ts           # Phone number normalisation
│       └── prisma.ts          # Prisma client singleton
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## 🗄 Database Schema

```
User ──< Lead ──< FollowUp
              └──< ActivityLog
User ──  AdminSettings
```

| Model | Key Fields |
|---|---|
| **User** | `id`, `email`, `password` (bcrypt), `role` (`SUPER_ADMIN` \| `ADMIN`), `status` |
| **Lead** | `id`, `adminId`, `name`, `phone`, `email`, `city`, `source`, `status`, `whatsappOptIn` |
| **FollowUp** | `id`, `leadId`, `scheduledAt`, `status` (`PENDING/REMINDED/COMPLETED/SNOOZED/CANCELLED`) |
| **ActivityLog** | `id`, `userId`, `leadId`, `action`, `details` (JSON) |
| **AdminSettings** | WhatsApp credentials & SMTP config (AES-256 encrypted) |

**Lead statuses:** `NEW` · `INTERESTED` · `NOT_INTERESTED` · `NOT_PICKED` · `HOT` · `CONVERTED` · `FOLLOW_UP`

**Lead sources:** `MANUAL` · `WHATSAPP` · `FACEBOOK` · `WEBSITE` · `REFERRAL` · `OTHER`

---

## 🔌 API Reference

### Leads

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/leads` | Admin | Create a new lead |
| `PUT` | `/api/leads/:id` | Admin | Update a lead |
| `DELETE` | `/api/leads/:id` | Admin | Delete a lead |
| `POST` | `/api/leads/ingest/:adminId` | Header auth (`x-leadcrm-ingest-secret`) | External lead ingestion using the per-admin secret configured in Admin Settings |
| `GET` | `/api/leads/ingest/:adminId` | Public | Returns usage/auth header guidance for the ingest endpoint |

### Follow-ups

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/followups` | Admin | Create a follow-up |

### Webhooks

| Method | Endpoint | Description |
|---|---|---|
| `GET/POST` | `/api/webhooks/whatsapp/:adminId` | WhatsApp Business API webhook |
| `GET/POST` | `/api/webhooks/facebook/:adminId` | Facebook Lead Ads webhook |

### Settings

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/admin/settings` | Admin | Create/update encrypted WhatsApp & SMTP configuration |

---

## 🔐 Authentication & Authorisation

- **Strategy:** JWT-based sessions via NextAuth.js v5 (Credentials provider)
- **Password hashing:** bcryptjs with cost factor ≥ 12
- **Sensitive config:** AES-256-GCM encryption at rest for WhatsApp tokens and SMTP passwords
- **Route protection:** API handlers enforce auth/role checks directly.
- **Page-route gating:** Centralized gating logic is implemented in `src/proxy.ts`; wire it through a Next.js middleware entrypoint (`middleware.ts` or `src/middleware.ts`) to enable automatic page-level redirects.

**Role permissions:**

| Route | ADMIN | SUPER_ADMIN |
|---|---|---|
| `/dashboard`, `/leads`, `/followups`, `/settings` | ✅ | — |
| `/admins`, `/all-leads` | — | ✅ |

---

## 🌐 Webhooks Setup

Each admin gets unique webhook URLs scoped to their `adminId`:

```
WhatsApp:  https://your-domain.com/api/webhooks/whatsapp/<adminId>
Facebook:  https://your-domain.com/api/webhooks/facebook/<adminId>
Ingest:    https://your-domain.com/api/leads/ingest/<adminId>
```

Configure these URLs in your WhatsApp Business API and Facebook App dashboards, then save the verification tokens in **Settings → Integrations** inside LeadCRM.

---

## 🚢 Deployment

### Vercel (recommended)

1. Push your code to GitHub and import the repository in [Vercel](https://vercel.com/new).
2. Add the required environment variables in the Vercel dashboard.
3. Deploy — Vercel picks up the `standalone` Next.js output automatically.

> The `vercel.json` in this repo targets the `bom1` (Mumbai) region for low-latency access from India.


### Verify production schema after deploy

To confirm newly-added Prisma fields are present in the existing Vercel database:

```bash
# 1) Pull production env vars (example; requires Vercel CLI in your environment)
vercel env pull .env.vercel

# 2) Load env vars and run checks
set -a; source .env.vercel; set +a
npm run verify:prod-schema
```

This script checks `prisma migrate status` and verifies these required columns exist in the target DB:
- `AdminSettings.initialLeadQuestions`
- `Lead.initialQuestionResponses`

> On Vercel auto-deploy, this verification now runs automatically as part of the build command in `vercel.json`:
> `prisma migrate deploy && npm run verify:prod-schema && prisma generate && next build`.
> If required columns are missing, the deployment fails early.
>
> A dedicated migration (`prisma/migrations/202604140001_add_missing_initial_question_fields`) now adds these columns on existing databases before verification runs.

### Environment variables (production)

```env
DATABASE_URL=...
DIRECT_URL=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://your-production-domain.com
ENCRYPTION_KEY=...
```

---

## 🧰 Available Scripts

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # prisma generate + next build
npm run start    # Start production server
npm run lint     # Run ESLint
```

```bash
npm run verify:prod-schema  # Verify required Prisma columns exist in prod DB
```

```bash
npx prisma migrate dev   # Apply schema changes locally
npx prisma db seed       # Seed the database
npx prisma studio        # Open Prisma's visual DB browser
npx prisma migrate reset # Reset the database (dev only)
```

---

## 📄 Additional Documentation

| File | Contents |
|---|---|
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Full architecture, component map, data-flow diagrams |
| [`DATABASE_SCHEMA.md`](./DATABASE_SCHEMA.md) | Detailed schema with access-control notes |
| [`WALKTHROUGH.md`](./WALKTHROUGH.md) | End-to-end feature walkthrough |
| [`IMPLEMENTATION-NEXT.md`](./IMPLEMENTATION-NEXT.md) | Upcoming features and dev roadmap |

---

## 📜 License

This project is private and proprietary. All rights reserved.
