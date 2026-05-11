# Prisma Migrations

## Baselining an existing database

If your database was previously set up via `supabase/migrations/*.sql`, the
schema already exists and the initial migration (`0_init`) must **not** be
re-applied. Instead, mark it as already applied:

```bash
prisma migrate resolve --applied 0_init
```

After that, `prisma migrate deploy` will skip `0_init` and only apply any
subsequent migrations.

## Fresh database

On a brand-new database, `prisma migrate deploy` will apply `0_init` (and all
later migrations) automatically — no extra steps needed.
