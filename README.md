# Regiflow — Approval System

Lightweight registration & invoicing demo app (React + Vite frontend, Express + Prisma backend).

This repository contains both the frontend (root) and the API server (`server/`). The frontend talks to the backend at `/api` (Vite is configured to proxy to the server during development).

**Table of contents**
- [Prerequisites](#prerequisites)
- [Quick start](#quick-start)
- [Environment variables](#environment-variables)
- [Database (Prisma)](#database-prisma)
- [Run commands](#run-commands)
- [Project structure](#project-structure)
- [API endpoints](#api-endpoints)
- [Development notes](#development-notes)
- [Contributing](#contributing)
- [License](#license)

## Prerequisites
- Node.js 18+ (LTS recommended)
- npm or pnpm (the repo includes a `pnpm-lock.yaml`, but `npm` also works)
- Git (optional)

## Quick start
1. Clone the repo and install dependencies at the project root:

```powershell
git clone <your-repo-url>
cd "altario demo"
npm install
```

2. Install server dependencies and set up the database:

```powershell
cd server
npm install
# create a .env file (see below) then run migrations & seed
npx prisma migrate dev --name init
npx prisma db seed
```

3. Start the backend (in one terminal) and the frontend (another terminal):

```powershell
# terminal 1 (server)
cd server
npm run dev

# terminal 2 (frontend)
cd ..
npm run dev
```

Open the frontend at `http://localhost:3000` (Vite default). The frontend proxies `/api` requests to the backend running on port `5000`.

## Environment variables

Create environment files for both root (frontend) and `server` as needed.

- Frontend (root): create a file named `.env` or `.env.local` at the project root to define optional keys used by Vite. Example:

```text
# optional AI key used by Vite build define
GEMINI_API_KEY=your_gemini_api_key_here
```

- Server: create `server/.env` with at least the `DATABASE_URL`.

Example `server/.env` for Postgres:

```text
PORT=5000
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"
NODE_ENV=development
```

Notes:
- The Prisma datasource in `server/prisma/schema.prisma` is configured for PostgreSQL. For local development you can point `DATABASE_URL` to a local Postgres instance; for production set `DATABASE_URL` to your managed DB (Supabase, Neon, PlanetScale, etc.).

## Database (Prisma)

- Prisma schema: `server/prisma/schema.prisma` (uses SQLite `DATABASE_URL` by default).
- To apply migrations locally:

```powershell
cd server
npx prisma migrate dev --name init
```

- To run the seed script (the project already includes `server/prisma/seed.ts`):

```powershell
cd server
npx prisma db seed
```

If you need to inspect the SQLite DB file, it will be created in `server/dev.db` (or the path you set in `DATABASE_URL`).

## Run commands

Root (frontend) `package.json` scripts:

- `npm run dev` — start Vite dev server (http://localhost:3000)
- `npm run build` — build frontend for production
- `npm run preview` — preview production build locally

Server `package.json` scripts (`server/`):

- `npm run dev` — start backend with `nodemon` + `ts-node` (reloads on changes)

Typical local workflow: open two terminals, run `npm run dev` in `server/` and the root folder.

## Project structure

- `App.tsx`, `index.tsx`, `vite.config.ts`, etc. — frontend (React + Vite)
- `components/` — shared UI components used by the frontend
- `pages/` — page views for dashboard, invoices, registrations
- `services/api.ts` — frontend API client; uses `baseURL: '/api'` and relies on Vite proxy
- `server/` — Express + TypeScript backend
  - `server/app.ts` — Express app configuration and routes
  - `server/server.ts` — start script
  - `server/prisma` — Prisma schema, seed and migrations
  - `server/routes` / `controllers` / `services` — API logic

## API endpoints
The backend mounts API routes under `/api` (see `server/app.ts`). Common routes exposed:

- `GET /api/health` — health check
- `GET /api/dashboard/stats` — dashboard statistics
- `GET /api/registrations` — paginated registrations
- `GET /api/registrations/all` — all registrations
- `POST /api/registrations` — create registration
- `PATCH /api/registrations/:id/status` — update registration status
- `GET /api/invoices` — paginated invoices
- `POST /api/invoices` — create invoice
- `PATCH /api/invoices/:id` — update invoice

You can browse the code under `server/routes` and `server/controllers` for more details.

## Development notes
- Frontend expects the backend on port `5000` and relies on Vite proxy (`/api` -> `http://localhost:5000`). Adjust `vite.config.ts` if you run the server on a different port.
- The frontend API client is `services/api.ts`.
- Prisma seed creates sample registrations and invoices in `server/prisma/seed.ts`.

## Contributing
- Fork & create a branch
- Make changes, update types or tests if needed
- Open a PR describing your change

