# Implementation Doc: Next 4 Work Items

**Date:** 2026-03-28  
**Project:** `leadcrm-next`  
**Context:** Build is green; authenticated smoke tests pass for `ADMIN` and `SUPER_ADMIN`. This doc defines the next implementation steps.

---

## 1) Normalize Phone + ActivityLog for Lead Updates

### Goal
Make `PUT /api/leads/[id]` behavior consistent with `POST /api/leads`:
- Normalize phone numbers consistently (store last 10 digits).
- Enforce per-admin uniqueness on normalized phone.
- Log all mutations to `ActivityLog`.

### Current State
- `POST /api/leads` normalizes phone to last 10 digits and logs `CREATE_LEAD`.
- `PUT /api/leads/[id]` currently:
  - Checks for duplicate using raw `data.phone` (not normalized).
  - Updates lead without writing `ActivityLog`.

### Implementation
**Files**
- `src/app/api/leads/[id]/route.ts`

**Behavior**
- Parse body and validate required fields (at minimum `name`, `phone`, `status`, `source` as currently used by UI).
- Normalize `phone` using the same helper logic as `POST /api/leads`.
  - Recommended: extract shared helper into `src/lib/phone.ts`:
    - `normalizePhoneToLast10Digits(input: string): string`
- Duplicate check:
  - If normalized phone changed, query by `{ adminId, phone: normalizedPhone }` and reject with `409`.
- Update lead:
  - Persist normalized phone.
  - Trim strings; set nullable fields to `null` when blank.
- ActivityLog:
  - Create `ActivityLog` entry with action `UPDATE_LEAD` (or `UPDATE_STATUS` if only status changed).
  - Include `details` with `{ oldValue, newValue }` for changed fields (name/phone/email/city/status/source/remarks).

### Acceptance Criteria
- Updating a lead with `phone="+91 98-7654-3210"` stores `9876543210`.
- Updating a lead phone to another lead’s phone (same admin) returns `409`.
- Every successful update writes an `ActivityLog` row.

### Test Plan
- Unit-ish (API):
  - Update phone with formatting; verify normalized persistence.
  - Attempt duplicate; verify `409`.
  - Verify ActivityLog row count increments and contains expected `details`.

---

## 2) Lead Delete Endpoint + UI Confirmation

### Goal
Provide deletion parity with the legacy PHP app:
- Add a secure delete endpoint.
- Add UI confirmation to prevent accidental deletes.
- Log deletes to ActivityLog.

### Implementation
**API**
- Add `DELETE` handler in `src/app/api/leads/[id]/route.ts` (same file as PUT).

**Behavior**
- Auth required; `ADMIN` only.
- Verify ownership: `{ id: leadId, adminId }` exists, else `404`.
- Delete:
  - Prefer hard delete (`prisma.lead.delete`) since Prisma schema uses cascade on relations.
  - Consider deleting follow-ups/activities via cascade; ensure no foreign key errors.
- ActivityLog:
  - Write `DELETE_LEAD` before deletion (or after, with `leadId` still known).
  - Include lead snapshot in `details` (name/phone/status/source) so the audit record remains useful.

**UI**
- Leads list (`src/app/leads/leads-client.tsx`) and/or lead detail page (`src/app/leads/[id]/page.tsx`):
  - Add “Delete” action.
  - Confirmation dialog:
    - Minimum: `window.confirm("Delete this lead?")`.
    - Preferred (since direction is shadcn going forward): use a shadcn `AlertDialog`.
  - On success, redirect back to `/leads` and refresh list.

### Acceptance Criteria
- ADMIN can delete their own lead and is redirected back to `/leads`.
- ADMIN cannot delete another admin’s lead (returns `404`).
- ActivityLog has `DELETE_LEAD`.

### Test Plan
- API: delete owned lead returns `200` (or `204`).
- API: delete non-owned lead returns `404`.
- UI: delete requires explicit confirmation.

---

## 3) Reduce Remaining Lint Warnings (Non-blocking)

### Goal
Bring warnings down to near-zero without changing behavior.

### Current State
`npm run lint` has warnings (unused imports/vars) but no errors.

### Implementation
**Files to touch (as lint points out)**
- `src/app/admin/admin-client.tsx`
- `src/app/admins/page.tsx`
- `src/app/all-leads/page.tsx`
- `src/app/dashboard/dashboard-client.tsx`
- `src/app/followups/followups-client.tsx`
- `src/app/followups/page.tsx`
- `src/app/leads/[id]/page.tsx`
- `src/app/leads/leads-client.tsx`
- `src/app/leads/new/new-lead-client.tsx`
- `src/app/leads/page.tsx`
- `src/app/login/page.tsx`
- `src/components/sidebar.tsx`

**Approach**
- Remove unused icon imports and unused variables.
- Prefer deleting dead code over disabling lint rules.

### Acceptance Criteria
- `npm run lint` returns with 0 warnings (or minimal acceptable warnings only).

---

## 4) Tooling/Process for Prisma + Dev Commands in This Environment

### Goal
Make development predictable despite environment constraints.

### Current State (documented in repo-root `issues.md`)
- `npx prisma migrate dev` cannot run in non-interactive mode.
- In restricted execution contexts, Node child-process spawning can fail (`spawn EPERM`).

### Implementation
**Prisma**
- Use `npx prisma db push` for schema syncing in non-interactive environments.
- Use `npx prisma db seed` to create default users and sample data.
- If/when committed migrations exist:
  - Use `npx prisma migrate deploy` for CI/prod application of existing migrations.

**Dev / Build**
- Prefer running `npm run dev` and `npm run build` in an environment where Node spawning works.
- When an outside-sandbox run is needed:
  - Explicitly call it out and record:
    - What command was run
    - Why it needed outside-sandbox execution
  - Append the outcome to repo-root `progress.md`.

### Acceptance Criteria
- A new developer can get a working DB and login by running:
  - `npx prisma db push`
  - `npx prisma db seed`
  - `npm run dev`

