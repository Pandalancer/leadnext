# LeadCRM Next Issues

> Append-only log of issues encountered during implementation, including investigation notes and what ultimately worked.

## 2026-03-28 - `npm run build` fails in sandbox with `spawn EPERM`

**Issue**
- Running `cd leadcrm-next; npm run build` fails during `prisma generate` with `Error: spawn EPERM`.

**Impact**
- Cannot run `next build` or a full local server smoke-test from within the sandbox environment.

**What I tried**
- Run the default build script (`prisma generate && next build`) as-is.

**Next actions / likely resolution**
- Re-run the same commands outside the sandbox (where child-process spawning is permitted).
- If still blocked outside: adjust scripts to avoid `prisma generate` on every build (or run generate as an explicit, separate step), then re-test.

**Update**
- Outside-sandbox `npm run build` succeeded (Prisma client generated; Next build produced the expected route list).
- Inside-sandbox `npm run dev` fails with `Error: spawn EPERM` from `next-dev.js` (Next dev server forks/spawns).
- `next start` in production mode is not sufficient for authenticated smoke tests over plain HTTP because session cookies are `Secure` in production and won’t be sent to `http://127.0.0.1`.

## 2026-03-28 - Prisma JSON typing blocked lead update build

**Issue**
- `src/app/api/leads/[id]/route.ts` failed to compile because Prisma’s `details` field expects JSON-compatible input, but the audit payload was typed too loosely.

**What I changed**
- Tightened the change log payload to explicit string/null JSON values.
- Cast the Prisma audit `details` payload to `Prisma.InputJsonValue`.

**Why this works**
- Prisma accepts JSON-compatible primitives/objects, and the lead audit trail only needs string/null field snapshots.

**Verification**
- `npm run build` completed successfully after this change.

## 2026-03-28 - UI affordances were misleading on follow-up, integrations, and settings pages

**Issue**
- The follow-up form relied on the browser time control without making the picker affordance obvious.
- The integrations page showed an always-active badge and a placeholder callback URL.
- The settings page rendered notification toggles that were not backed by persisted settings.

**What I changed**
- Added an explicit clock trigger beside the follow-up time input.
- Switched the integrations badge to reflect actual configuration state and wired the callback URL to `NEXTAUTH_URL`.
- Replaced the notification toggles with a temporary V2 TODO note.

**Why this works**
- Users now see actual state instead of placeholders, and the pages no longer imply functionality that does not exist yet.
