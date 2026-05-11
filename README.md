<div align="center">

<br />

<img src="https://img.shields.io/badge/%E2%9C%A8-LeadNext-10b981?style=for-the-badge&labelColor=0a0f1a" alt="LeadNext" height="40" />

<br /><br />

# Turn WhatsApp Conversations Into Customers

**LeadNext** is a WhatsApp-first, multi-tenant CRM that captures leads from WhatsApp, Facebook, and the web — then helps your team track, follow up, and close every single one.

<br />

[![Next.js 16](https://img.shields.io/badge/Next.js-16.2-000?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Deploy on Vercel](https://img.shields.io/badge/Deploy-Vercel-000?style=flat-square&logo=vercel)](https://vercel.com)
[![License](https://img.shields.io/badge/License-Proprietary-333?style=flat-square)](#license)

<br />

[Get Started](#-quick-start) · [Features](#-why-leadnext) · [Architecture](#%EF%B8%8F-architecture) · [API Reference](#-api-reference) · [Deploy](#-deploy-to-production)

<br />

</div>

---

## 💡 The Problem

Your sales team lives on WhatsApp. Leads come in as chat messages, get buried in threads, and silently die. There's no pipeline, no follow-up reminders, no audit trail.

**LeadNext fixes that.**

Every incoming WhatsApp message, Facebook lead ad, or web form submission automatically becomes a tracked lead in your pipeline — with smart status stages, scheduled follow-ups, and a full activity history.

---

## 🚀 Why LeadNext?

<table>
<tr>
<td width="50%">

### 💬 WhatsApp-First Pipeline
Incoming WhatsApp messages are automatically captured as leads. Message intent is parsed to set initial status — "hello" becomes `NEW`, "interested" becomes `INTERESTED`, "call me" becomes `HOT`.

### 📣 Facebook Lead Ads
Connect your Meta ad campaigns and watch leads flow directly into your dashboard. Zero manual entry.

### 🔁 Smart Follow-Ups
Schedule, snooze, remind, and complete follow-ups. Never let a hot lead go cold because someone forgot to call back.

### 📊 Command-Center Dashboard
At-a-glance stats — total leads, conversions, today's follow-ups — plus a 7-day activity chart and upcoming action items.

</td>
<td width="50%">

### 🏢 Multi-Tenant by Design
Each admin operates in a fully isolated data space. A Super Admin sees everything across all tenants from a single pane of glass.

### 🔒 Enterprise-Grade Security
Passwords hashed with bcrypt (cost ≥ 12). WhatsApp tokens and SMTP credentials encrypted with AES-256-GCM at rest. JWT sessions. Role-enforced route protection.

### 📝 Full Audit Trail
Every create, update, status change, and follow-up is logged in a per-lead activity timeline with before/after snapshots.

### 📱 Mobile-Ready
Responsive, glassmorphism-styled UI with a collapsible sidebar that works beautifully on phones, tablets, and desktops.

</td>
</tr>
</table>

---

## ⚡ Quick Start

### Prerequisites

| Requirement | Version |
|---|---|
| Node.js | 18+ |
| PostgreSQL | Any (or [Supabase](https://supabase.com) hosted) |
| npm | 8+ |

### 1 — Clone & install

```bash
git clone https://github.com/Pandalancer/leadnext.git
cd leadnext
npm install
```

### 2 — Configure environment

Create **`.env.local`** in the project root:

```env
# PostgreSQL (use separate URLs for Supabase connection pooling)
DATABASE_URL="postgresql://user:password@host:5432/leadcrm?pgbouncer=true"
DIRECT_URL="postgresql://user:password@host:5432/leadcrm"

# Auth — generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your-super-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Encryption — generate with: openssl rand -hex 32 (must be exactly 64 hex chars)
ENCRYPTION_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
```

### 3 — Set up the database

```bash
npx prisma migrate dev     # Apply migrations & generate Prisma client
npx prisma db seed          # Seed Super Admin, Admin, and sample leads
```

### 4 — Launch

```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** and sign in.

### 🔑 Default credentials (seed data)

| Role | Email | Password |
|---|---|---|
| **Super Admin** | `superadmin@leadcrm.com` | `SuperAdmin@2024!` |
| **Admin** | `admin@leadcrm.com` | `Admin@2024!` |

> ⚠️ **Change these immediately** in any shared or production environment.

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────┐
│                     CLIENTS                        │
│  WhatsApp Business API · Facebook Lead Ads · Web   │
└──────────────┬────────────────┬────────────────────┘
               │ Webhooks       │ REST API
               ▼                ▼
┌──────────────────────────────────────────┐
│           Next.js 16 (App Router)        │
│                                          │
│  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │  Pages   │  │   API    │  │  Auth  │ │
│  │ (React)  │  │ Routes   │  │NextAuth│ │
│  └──────────┘  └──────────┘  └────────┘ │
│                                          │
│  Zustand + TanStack Query (client state) │
│  Tailwind CSS v4 (styling)               │
└──────────────┬───────────────────────────┘
               │ Prisma ORM
               ▼
┌──────────────────────────────────────────┐
│        PostgreSQL (Supabase)             │
│                                          │
│  User · Lead · FollowUp · ActivityLog   │
│  AdminSettings · SystemSettings          │
└──────────────────────────────────────────┘
```

### Tech Stack at a Glance

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org) — App Router, server & client components |
| **Language** | TypeScript 5 — strict mode |
| **Auth** | [NextAuth.js v5](https://authjs.dev) — Credentials provider, JWT sessions |
| **Database** | PostgreSQL on [Supabase](https://supabase.com) |
| **ORM** | [Prisma 5](https://www.prisma.io) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com) + glassmorphism design system |
| **Client State** | [Zustand v5](https://zustand-demo.pmnd.rs) + [TanStack Query v5](https://tanstack.com/query) |
| **Encryption** | AES-256-GCM via Node.js `crypto` |
| **Icons** | [Lucide React](https://lucide.dev) |
| **Deployment** | [Vercel](https://vercel.com) — standalone output, Mumbai (`bom1`) region |

---

## 🗂 Project Structure

```
leadnext/
├── prisma/
│   ├── schema.prisma            # Data models & relations
│   └── seed.ts                  # Dev seed script
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/            # NextAuth endpoints
│   │   │   ├── leads/           # Lead CRUD + external ingest
│   │   │   ├── followups/       # Follow-up CRUD
│   │   │   ├── admin/           # Per-admin settings
│   │   │   └── webhooks/        # WhatsApp & Facebook webhooks
│   │   ├── dashboard/           # Admin command-center dashboard
│   │   ├── leads/               # Lead list · detail · create · edit
│   │   ├── followups/           # Follow-up schedule view
│   │   ├── settings/            # Account settings
│   │   ├── questions/           # Configurable lead intake questions
│   │   ├── admins/              # Manage admins (Super Admin)
│   │   ├── all-leads/           # Cross-tenant lead view (Super Admin)
│   │   ├── login/               # Authentication
│   │   └── page.tsx             # Public landing page
│   ├── auth.ts                  # NextAuth configuration
│   ├── proxy.ts                 # Route-gating logic
│   ├── components/
│   │   ├── sidebar.tsx          # Responsive nav sidebar
│   │   └── providers.tsx        # React Query + Session providers
│   └── lib/
│       ├── crypto.ts            # AES-256-GCM encrypt/decrypt
│       ├── phone.ts             # Phone number normalisation
│       ├── url.ts               # URL helpers
│       ├── utils.ts             # Shared utilities
│       └── prisma.ts            # Prisma singleton
├── scripts/                     # Migration & verification helpers
├── next.config.ts
├── vercel.json
└── package.json
```

---

## 🗄 Data Model

```
User ──< Lead ──< FollowUp
              └──< ActivityLog
User ──  AdminSettings
```

| Model | Purpose | Key Fields |
|---|---|---|
| **User** | Admin & Super Admin accounts | `email`, `password` (bcrypt), `role`, `status` |
| **Lead** | Every prospect in the pipeline | `name`, `phone`, `email`, `city`, `source`, `status`, `whatsappOptIn` |
| **FollowUp** | Scheduled touchpoints per lead | `scheduledAt`, `status`, `notes`, `snoozedUntil`, `completedAt` |
| **ActivityLog** | Immutable audit trail | `action`, `details` (JSON with before/after) |
| **AdminSettings** | Per-admin WhatsApp & SMTP config | Encrypted tokens, timezone, lead questions |

**Lead lifecycle:** `NEW` → `INTERESTED` → `HOT` → `CONVERTED` *(also: `NOT_INTERESTED` · `NOT_PICKED` · `FOLLOW_UP`)*

**Lead sources:** `MANUAL` · `WHATSAPP` · `FACEBOOK` · `WEBSITE` · `REFERRAL` · `OTHER`

---

## 🔌 API Reference

### Lead Management

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/leads` | Admin | Create a lead |
| `PUT` | `/api/leads/:id` | Admin | Update a lead |
| `DELETE` | `/api/leads/:id` | Admin | Delete a lead |

### External Ingestion

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/leads/ingest/:adminId` | `x-leadcrm-ingest-secret` header | Push leads from any external system |
| `GET` | `/api/leads/ingest/:adminId` | Public | Endpoint usage & auth guidance |

### Follow-Ups

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/followups` | Admin | Schedule a follow-up |

### Webhooks

| Method | Endpoint | Description |
|---|---|---|
| `GET / POST` | `/api/webhooks/whatsapp/:adminId` | WhatsApp Business API webhook |
| `GET / POST` | `/api/webhooks/facebook/:adminId` | Facebook Lead Ads webhook |

### Settings

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/admin/settings` | Admin | Save encrypted WhatsApp & SMTP config |

---

## 🔐 Security

| Layer | Implementation |
|---|---|
| **Authentication** | NextAuth.js v5 — Credentials provider, JWT sessions, secure HTTP-only cookies |
| **Password Storage** | bcryptjs, cost factor ≥ 12 |
| **Secrets at Rest** | AES-256-GCM encryption for WhatsApp tokens, webhook secrets, SMTP passwords |
| **Route Protection** | Role-based checks in every API handler; page-level gating via `proxy.ts` middleware |
| **Webhook Verification** | `x-hub-signature-256` validation on incoming WhatsApp & Facebook payloads |
| **Data Isolation** | Tenant-scoped queries — admins can only access their own leads |

### Role Permissions

| Pages | Admin | Super Admin |
|---|:---:|:---:|
| Dashboard · Leads · Follow-ups · Settings · Questions | ✅ | — |
| Manage Admins · All Leads (cross-tenant) | — | ✅ |

---

## 🌐 Integrations

### WhatsApp Business API

Each admin gets a unique webhook URL:

```
https://your-domain.com/api/webhooks/whatsapp/<adminId>
```

1. Create a Meta Developer App → add WhatsApp product
2. Copy the Access Token, Phone Number ID, and your chosen Verify Token
3. Paste them into **Settings → Integrations** inside LeadNext
4. Point Meta's Webhook Callback URL to the URL above

Incoming messages are automatically parsed — "hello" creates a `NEW` lead, "interested" sets `INTERESTED`, "call me" sets `HOT`.

### Facebook Lead Ads

```
https://your-domain.com/api/webhooks/facebook/<adminId>
```

Subscribe to `leadgen_id` in Facebook Business Manager and LeadNext captures form submissions as leads in real time.

### Generic Ingest API

Push leads from **any** external system:

```bash
curl -X POST https://your-domain.com/api/leads/ingest/<adminId> \
  -H "Content-Type: application/json" \
  -H "x-leadcrm-ingest-secret: <your-secret>" \
  -d '{"name":"Jane Doe","phone":"9876543210","source":"WEBSITE"}'
```

---

## 🚢 Deploy to Production

### Vercel (Recommended)

1. Push your repo to GitHub
2. Import it in [Vercel](https://vercel.com/new)
3. Add environment variables in the Vercel dashboard:

```env
DATABASE_URL=...
DIRECT_URL=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://your-production-domain.com
ENCRYPTION_KEY=...
```

4. Deploy — Vercel automatically uses the `standalone` Next.js output

> The included `vercel.json` targets the **Mumbai (`bom1`)** region for low-latency access from India.

### Production Schema Verification

The build command automatically verifies that all required database columns exist before deployment:

```
ALLOW_PRISMA_BASELINE=1 npm run migrate:deploy:safe &&
npm run verify:prod-schema &&
prisma generate &&
next build
```

If required columns are missing, the deployment **fails early** — no silent data issues.

---

## 🧰 Scripts

| Command | What It Does |
|---|---|
| `npm run dev` | Start dev server on `localhost:3000` |
| `npm run build` | `prisma generate` + `next build` |
| `npm run start` | Start production server |
| `npm run lint` | ESLint check |
| `npm run migrate:deploy:safe` | Apply migrations with optional P3005 baseline handling |
| `npm run verify:prod-schema` | Verify required columns exist in production DB |
| `npx prisma studio` | Visual database browser |
| `npx prisma db seed` | Seed dev data |
| `npx prisma migrate reset` | Reset database (dev only) |

---

## 📚 Documentation

| Document | Description |
|---|---|
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | Full architecture deep-dive, component map, data-flow diagrams, color system |
| **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** | Complete schema reference with role-based access control matrix |
| **[WALKTHROUGH.md](./WALKTHROUGH.md)** | End-to-end feature walkthrough — WhatsApp setup, Facebook setup, SMTP config |
| **[IMPLEMENTATION-NEXT.md](./IMPLEMENTATION-NEXT.md)** | Upcoming features and development roadmap |

---

<div align="center">

<br />

**Built with ❤️ for sales teams that close deals on WhatsApp.**

<br />

© 2025 LeadNext. All rights reserved.

<br /><br />

</div>
