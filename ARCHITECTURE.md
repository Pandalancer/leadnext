# LeadCRM Architecture Document

## Table of Contents
1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Pages & Routes](#pages--routes)
5. [Components](#components)
6. [API Routes](#api-routes)
7. [Database Schema](#database-schema)
8. [Authentication](#authentication)
9. [Key Features](#key-features)

---

## Overview

LeadCRM is a multi-tenant CRM application designed for WhatsApp-led customer relationship management. It supports role-based access control with Super Admin and Admin roles, allowing businesses to manage leads, schedule follow-ups, and integrate with external channels like WhatsApp and Facebook.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16.2.1 (App Router) |
| Language | TypeScript |
| Authentication | NextAuth.js v5 (Beta) |
| Database | PostgreSQL (via Supabase) |
| ORM | Prisma 5.22.0 |
| Styling | CSS-in-JS (inline styles), Tailwind-inspired |
| UI Icons | Lucide React |
| Encryption | AES-256-GCM (custom crypto.ts) |

## Project Structure

```
leadcrm-next/
├── prisma/
│   ├── schema.prisma      # Database schema definition
│   └── seed.ts            # Database seeding script
├── public/
│   └── favicon.svg        # App favicon
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── api/           # API routes
│   │   ├── (routes)/      # Page routes
│   │   ├── globals.css    # Global styles
│   │   ├── layout.tsx     # Root layout
│   │   └── page.tsx       # Landing page
│   ├── auth.ts            # NextAuth configuration
│   ├── components/        # Shared components
│   ├── lib/               # Utilities
│   ├── middleware.ts      # Auth middleware
│   └── types/             # TypeScript types
├── .env                   # Environment variables
├── next.config.ts         # Next.js configuration
└── package.json
```

---

## Pages & Routes

### Public Routes

| Route | File | Purpose | Implementation |
|-------|------|---------|----------------|
| `/` | `page.tsx` | Landing/marketing page | Static page with feature highlights, CTA to login |
| `/login` | `login/page.tsx` | User authentication | NextAuth sign-in with credentials |

### Protected Routes (Admin)

| Route | File | Purpose | Implementation |
|-------|------|---------|----------------|
| `/dashboard` | `dashboard/page.tsx` | Admin dashboard | Shows lead statistics, recent activity, follow-up summary |
| `/leads` | `leads/page.tsx` | Lead management | Server component that fetches leads and passes to `leads-client.tsx` |
| `/leads/new` | `leads/new/page.tsx` | Create new lead | Server component wrapper for `new-lead-client.tsx` |
| `/leads/[id]` | `leads/[id]/page.tsx` | Lead detail view | Server component with two-column layout (contact info + follow-ups) |
| `/leads/[id]/edit` | `leads/[id]/edit/page.tsx` | Edit lead | Client component with form for name, phone, email, city, status, source |
| `/leads/[id]/followup` | `leads/[id]/followup/page.tsx` | Add follow-up | Client component with date/time picker and notes |
| `/followups` | `followups/page.tsx` | Follow-up schedule | Server component with `followups-client.tsx` showing scheduled follow-ups |
| `/settings` | `settings/page.tsx` | User settings | Basic admin settings page |
| `/admin` | `admin/page.tsx` | Integration settings | Webhook URLs, API keys for WhatsApp/Facebook |

### Protected Routes (Super Admin)

| Route | File | Purpose | Implementation |
|-------|------|---------|----------------|
| `/admins` | `admins/page.tsx` | Manage admins | Super Admin can create/view admin accounts |
| `/all-leads` | `all-leads/page.tsx` | View all leads | Cross-tenant lead visibility for Super Admin |

---

## Components

### Shared Components

#### Sidebar (`components/sidebar.tsx`)
- **Purpose**: Navigation sidebar with role-based menu items
- **Props**: `userRole`, `userName`, `userEmail`
- **Features**:
  - Mobile-responsive with hamburger menu
  - Active route highlighting
  - User profile section with logout
  - Glassmorphism design
- **Navigation Items**:
  - Admin: Dashboard, Leads, Follow-ups, Settings, Integrations
  - Super Admin: Dashboard, Admins, All Leads, Settings

#### Providers (`components/providers.tsx`)
- **Purpose**: Session provider wrapper for NextAuth
- **Usage**: Wraps entire app in `layout.tsx`

### Client Components

#### LeadsClient (`app/leads/leads-client.tsx`)
- **Purpose**: Interactive leads list with filtering and search
- **Features**:
  - 3-column bento-style grid layout
  - Search by name, email, phone
  - Filter by status (NEW, HOT, INTERESTED, etc.)
  - Lead cards with status badges, contact info
  - "View Profile" links to `/leads/[id]`
  - "Add Lead" button linking to `/leads/new`

#### NewLeadClient (`app/leads/new/new-lead-client.tsx`)
- **Purpose**: Form for creating new leads
- **Fields**: Name*, Phone*, Email, City, Status*, Source*
- **API**: POST to `/api/leads`

#### FollowupsClient (`app/followups/followups-client.tsx`)
- **Purpose**: Display scheduled follow-ups
- **Features**:
  - Stats cards (Total, Pending Today)
  - List view with date, time, lead info, status
  - Color-coded by urgency (past=today yellow)
  - Links to lead detail for adding follow-ups

---

## API Routes

### Leads API

| Route | Method | Purpose | Auth Required |
|-------|--------|---------|---------------|
| `/api/leads` | GET | List all leads for admin | Yes (Admin) |
| `/api/leads` | POST | Create new lead | Yes (Admin) |
| `/api/leads/[id]` | GET | Get single lead | Yes (Admin) |
| `/api/leads/[id]` | PUT | Update lead | Yes (Admin) |
| `/api/leads/[id]` | DELETE | Delete lead | Yes (Admin) |
| `/api/leads/ingest/[adminId]` | POST | External lead ingestion | No (API key via header) |

### Follow-ups API

| Route | Method | Purpose | Auth Required |
|-------|--------|---------|---------------|
| `/api/followups` | GET | List follow-ups for admin | Yes (Admin) |
| `/api/followups` | POST | Create new follow-up | Yes (Admin) |
| `/api/followups/[id]` | PUT | Update follow-up status | Yes (Admin) |

### Webhooks (External Integration)

| Route | Method | Purpose | Auth |
|-------|--------|---------|------|
| `/api/webhooks/whatsapp/[adminId]` | POST | Receive WhatsApp messages | Token verification |
| `/api/webhooks/whatsapp/[adminId]` | GET | WhatsApp verification challenge | - |
| `/api/webhooks/facebook/[adminId]` | POST | Receive Facebook Lead Ads | Token verification |
| `/api/webhooks/facebook/[adminId]` | GET | Facebook verification | - |

### Admin API

| Route | Method | Purpose | Auth Required |
|-------|--------|---------|---------------|
| `/api/admin/settings` | GET | Get admin settings | Yes (Admin) |
| `/api/admin/settings` | PUT | Update admin settings | Yes (Admin) |

---

## Database Schema

### Models

#### User
```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  password  String   // Hashed
  role      String   // "SUPER_ADMIN" | "ADMIN"
  adminId   String?  // For leads, the admin they belong to
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  leads      Lead[]      // If ADMIN
  followUps  FollowUp[]  // If ADMIN
  activities Activity[]  // If ADMIN
}
```

#### Lead
```prisma
model Lead {
  id        String   @id @default(uuid())
  name      String
  phone     String
  email     String?
  city      String?
  status    String   // NEW, HOT, INTERESTED, NOT_INTERESTED, NOT_PICKED, CONVERTED, FOLLOW_UP
  source    String   // MANUAL, WHATSAPP, FACEBOOK, WEBSITE, REFERRAL, OTHER
  adminId   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  admin      User       @relation(fields: [adminId], references: [id])
  followUps  FollowUp[]
  activities Activity[]
}
```

#### FollowUp
```prisma
model FollowUp {
  id           String   @id @default(uuid())
  leadId       String
  adminId      String
  scheduledAt  DateTime
  notes        String?
  status       String   // PENDING, COMPLETED, CANCELLED
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  // Relations
  lead  Lead @relation(fields: [leadId], references: [id])
  admin User @relation(fields: [adminId], references: [id])
}
```

#### Activity
```prisma
model Activity {
  id        String   @id @default(uuid())
  leadId    String
  adminId   String
  type      String   // WHATSAPP_MESSAGE, STATUS_CHANGE, FOLLOW_UP_CREATED, etc.
  notes     String?
  metadata  String?  // JSON string for additional data
  createdAt DateTime @default(now())
  
  // Relations
  lead  Lead @relation(fields: [leadId], references: [id])
  admin User @relation(fields: [adminId], references: [id])
}
```

---

## Authentication

### NextAuth Configuration (`auth.ts`)

- **Provider**: Credentials (email/password)
- **Session Strategy**: JWT
- **Callbacks**:
  - `session`: Adds user role, id, adminId to session
  - `jwt`: Persists user data in token
- **Cookie Configuration**: 
  - Secure in production
  - SameSite: lax
  - Custom session token name for production

### Middleware (`middleware.ts`)

- **Purpose**: Route protection and role-based access
- **Behavior**:
  - Redirects unauthenticated users to `/login`
  - Checks both dev and production cookie names
  - Allows public access to `/`, `/login`, `/api/auth/*`

### Login Flow

1. User submits credentials on `/login`
2. NextAuth validates against database
3. On success, redirects to `/dashboard`
4. JWT token stored in cookie
5. Middleware validates token on subsequent requests

---

## Key Features

### 1. Multi-Tenant Architecture
- Each admin has isolated data (leads, follow-ups)
- Super Admin can view cross-tenant data
- Admin ID used in all queries for data isolation

### 2. Lead Management
- Create leads manually or via webhooks
- Status tracking with visual badges
- Contact information (phone, email, city)
- Source attribution for analytics

### 3. Follow-up Scheduling
- Schedule follow-ups with date/time
- Track status (Pending, Completed, Cancelled)
- View upcoming follow-ups on dashboard
- Empty state prompts for action

### 4. External Integrations
- **WhatsApp Webhook**: Receives messages, creates leads
- **Facebook Lead Ads**: Captures leads from ads
- **Lead Ingest API**: REST endpoint for external systems

### 5. Responsive Design
- Mobile-first approach
- Sidebar transforms to hamburger menu on mobile
- Grid layouts adapt to screen size
- Glassmorphism headers with backdrop blur

### 6. Security
- Password hashing (bcrypt)
- AES-256-GCM encryption for sensitive data
- CSRF protection via NextAuth
- Role-based access control
- Per-admin webhook URLs (security through uniqueness)

---

## Color Scheme

| Token | Value | Usage |
|-------|-------|-------|
| Primary (Emerald) | `#006948` | Buttons, badges, accents |
| Primary Light | `#00855d` | Gradients, hover states |
| Surface | `#f6fafe` | Page backgrounds |
| Surface Card | `#ffffff` | Cards, panels |
| Surface Low | `#f8fafc` | Input backgrounds |
| Text Primary | `#171c1f` | Headings, primary text |
| Text Secondary | `#3d4a42` | Body text |
| Text Muted | `#6d7a72` | Labels, hints |
| Outline | `#e4e9ed` | Borders, dividers |

### Status Colors
| Status | Background | Text |
|--------|------------|------|
| NEW | `#f8fafc` | `#637381` |
| HOT | `#fee2e2` | `#991b1b` |
| INTERESTED | `#dae2fd` | `#3f465c` |
| CONVERTED | `#85f8c4` | `#005137` |
| FOLLOW_UP | `#ede9fe` | `#5b21b6` |

---

## Build & Deployment

### Build Configuration
- **Output**: Static export disabled (server-side rendering required)
- **TypeScript**: Strict mode
- **Image Optimization**: Disabled (using external images)

### Environment Variables
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="https://leads.bluepanda.cloud"
ENCRYPTION_KEY="32-byte-hex-string"
```

### Deployment
- **Platform**: Vercel
- **Database**: Supabase PostgreSQL
- **Domain**: leads.bluepanda.cloud
- **SSL**: Automatic via Vercel

---

## File Relationships

```
Root Layout (layout.tsx)
├── Providers (components/providers.tsx)
│   └── SessionProvider (NextAuth)
├── Sidebar (components/sidebar.tsx)
│   └── Navigation links
└── Page Content
    ├── Server Components (async, fetch data)
    │   └── Prisma queries
    └── Client Components ("use client")
        └── React state, interactivity
```

## Data Flow

1. **Server Component** fetches data via Prisma
2. Data passed to **Client Component** as props
3. Client Component renders interactive UI
4. User actions trigger API calls
5. API routes validate auth, update database
6. Revalidation or client-side refresh updates UI

---

*Document generated on March 27, 2026*
