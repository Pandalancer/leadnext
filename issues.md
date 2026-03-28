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
