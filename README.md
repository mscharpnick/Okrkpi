# THINK OKR & KPI Tracker (MVP)

A Vercel-ready Next.js app for July–June fiscal-year planning with Workstreams → Stages → Objectives → Key Results (KRs) and a separate KPI view.

## Features
- Fiscal Year (July–June) timeline with stacked Workstreams.
- Stages can overlap; gaps allowed. Objectives warn if they fall outside their Stage.
- Traffic-light (RAG) status on Stages and Objectives; KRs show progress (percent, numeric, or High/Med/Low).
- KPI page for standalone KPIs (not required to tie to KRs).
- Print-to-PDF export of the timeline page.
- No auth in MVP; all users share the same data with full edit access.
- Vercel Postgres + Prisma.

## One-time setup (Vercel)
1. Create a new Git repo and push this folder.
2. Import the repo into Vercel.
3. In Vercel, add **Vercel Postgres** (Storage tab) to this project.
4. Add an Environment Variable `DATABASE_URL` (copy from Vercel Postgres).
5. In the Vercel dashboard, run a one-time deployment to populate env vars.
6. Locally (optional): `npm i` then `npx prisma migrate deploy && npm run seed`.
   - Or in Vercel, add a Post-Deployment command: `npx prisma migrate deploy` (Project Settings → Git → Post-Deployment Command).

## Local dev
```bash
npm i
npm run dev
```
Open http://localhost:3000

## Production build
```bash
npm run build
```

## Seeding (sample data)
```bash
npm run seed
```

This creates FY2025–26 sample Workstreams, Stages, Objectives, KRs and KPIs you can click around.

## Environments
- **Production** is your main Vercel deployment.
- **Preview** builds are automatic for each pull request (no extra setup).

## Notes
- Export to PDF: Use your browser's print dialog on the Timeline page for a clean PDF.
- Status rules are defined in `lib/status.ts` and can be tuned easily.
