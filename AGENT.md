# Mini Image Compressor - Agent Setup Notes

> Internal log for coding agents. Tracks initialization steps, environment assumptions, and quick actions after cloning the repo.

## Workspace State (2025-09-17 14:07:16)

### Initialization Commands Executed
- `pnpm install` (pnpm v10.14.0) - lockfile already in sync; removed unused dependency `@radix-ui/react-checkbox`; build scripts for prisma/sharp remain blocked until `pnpm approve-builds` is run.
- `pnpm prisma:migrate` - connected to PostgreSQL at `156.238.247.229:5434` via `DATABASE_URL`; no pending migrations.
- `pnpm prisma:generate` - regenerated Prisma Client v6.15.0 into `lib/generated/prisma`.

### Runtime Prerequisites
- Node.js v22.10.0, pnpm v10.14.0 (update available to 10.16.1).
- `.env` already populated with Cloudflare R2 and database credentials; keep out of version control.
- Native build steps (sharp, prisma engines, tailwind oxide) require explicit approval: run `pnpm approve-builds` followed by `pnpm install` if binaries are missing at runtime.

### Next Moves
- Launch dev server with `pnpm dev` (Turbopack enabled).
- Optional health checks: `pnpm check-r2` to validate Cloudflare credentials; `curl http://localhost:3000/api/init` after server boot.
- For schema updates, edit `prisma/schema.prisma`, run `pnpm prisma migrate dev --name <change>` locally, then `pnpm prisma:generate`.

### Troubleshooting Reminders
- If migrations hang, verify outbound access to the managed Postgres host and ensure credentials in `.env` are current.
- `sharp` runtime errors usually mean skipped postinstall scripts; approve builds or install the Windows native binary manually.
- Scheduler tasks respect `ENABLE_CLEANUP_SCHEDULER`; toggle in `.env` when running locally to avoid unintended deletions.