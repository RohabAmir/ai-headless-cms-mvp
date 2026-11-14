# Headly — AI-Powered Headless CMS Platform (MVP)

Recruiter-ready MVP of a headless CMS dashboard inspired by a production tourism CMS. Attach a website, turn page HTML sections into JSON content APIs, manage blog posts, users (RBAC), SEO, and activity logs.

**Live demo:** https://headly-cms-beta.vercel.app  
**API:** https://headly-api.vercel.app  
**Login:** `admin@cms.com` / `Admin@123`  
**Repo:** https://github.com/RohabAmir/ai-headless-cms-mvp

**Stack:** Next.js (shadcn/ui) · NestJS · PostgreSQL (Neon in prod / PGlite locally)

## Quick start

This machine has no Docker — use PGlite locally (`npm run db:local`). On a machine with Docker you can use `npm run db:up` instead and point `DATABASE_URL` at `:5432`.

```bash
# 1) Local Postgres-compatible DB (PGlite on :5433)
npm install
npm run db:local

# 2) API (new terminal)
npm run api:seed
npm run api:dev

# 3) Web (new terminal)
npm run web:dev
```

- Web: http://localhost:3000  
- API: http://localhost:4000  
- Login: `admin@cms.com` / `Admin@123`  
  Also: `editor@cms.com` / `Editor@123`, `viewer@cms.com` / `Viewer@123`

## What the MVP demonstrates

| Area | Capability |
| --- | --- |
| Auth & RBAC | JWT login, roles `ADMIN` / `EDITOR` / `VIEWER`, add users with roles |
| Dashboard | Counts, distribution chart, activity series |
| Websites | Attach site URL + slug for headless delivery |
| Pages | Hierarchical pages (parent/sub-page), status |
| Sections | Section library, attach to page, drag reorder, edit JSON content |
| Public API | `GET /api/v1/sites/:siteSlug/pages/:pageSlug` → ordered sections JSON |
| Posts & categories | Blog CRUD with categories |
| SEO | Site/page meta title, description, keywords, OG image |
| Activity logs | Audit trail filtered by user |

## Project layout

```
backend/     NestJS + TypeORM + Postgres
frontend/    Next.js App Router + shadcn (dark Jigsaw-like UI)
docker-compose.yml   optional real Postgres
```

## Docker Postgres (optional)

```bash
docker compose up -d
# set DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/headly
```
