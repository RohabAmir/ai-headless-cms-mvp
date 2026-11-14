# Headly API (NestJS)

NestJS + TypeORM + PostgreSQL for the AI-Powered Headless CMS MVP.

## Quick start (no Docker)

From repo root, run PGlite (Postgres wire protocol on `:5433`):

```bash
npm install
npm run db:local
```

Then:

```bash
cd backend
cp .env.example .env   # already points at 127.0.0.1:5433
npm install
npm run seed
npm run start:dev
```

API: http://localhost:4000

### Demo users

| Email | Password | Role |
| --- | --- | --- |
| admin@cms.com | Admin@123 | ADMIN |
| editor@cms.com | Editor@123 | EDITOR |
| viewer@cms.com | Viewer@123 | VIEWER |

### Public headless example

`GET /api/v1/sites/tourism-demo/pages/home`

## Docker Postgres (optional)

```bash
docker compose up -d
# set DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/headly
```
