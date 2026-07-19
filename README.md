# Jidaar Device Management System

A comprehensive device lifecycle management platform built with Next.js 16, TypeScript, Tailwind CSS v4, shadcn/ui, Prisma 7, and NextAuth 5.

## Features

- Device inventory management with full lifecycle tracking
- User management with role-based access control (Admin, Technician, Read Only)
- Device assignment, return, and transfer workflows
- Dashboard with real-time KPIs and charts
- Global search across devices and users
- File attachments via S3-compatible storage (MinIO)
- CSV export for devices and assignments
- Activity logging for all operations
- Light/dark mode support

## Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL 16+
- MinIO (or any S3-compatible storage)

## Quick Start (Docker)

The easiest way to run the full stack:

```bash
# Copy environment file
cp .env.example .env

# Start all services (PostgreSQL + MinIO + App)
docker-compose up --build
```

The app will be available at http://localhost:3000.

## Manual Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

Required variables:

```
DATABASE_URL=postgresql://jidaar:secret@localhost:5432/jidaar
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
```

### 3. Start the database

```bash
docker-compose up -d db minio
```

### 4. Run migrations and seed

```bash
pnpm prisma migrate dev
pnpm prisma db seed
```

### 5. Start the dev server

```bash
pnpm dev
```

Open http://localhost:3000.

## Default Credentials

After seeding, you can log in with:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@jidaar.com | admin123 |
| Technician | tech@jidaar.com | admin123 |
| Read Only | readonly@jidaar.com | admin123 |

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run unit tests (Vitest) |
| `pnpm prisma migrate dev` | Run database migrations |
| `pnpm prisma db seed` | Seed the database |
| `pnpm prisma studio` | Open Prisma Studio |

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login page
│   ├── (dashboard)/     # Protected dashboard pages
│   │   ├── assignments/
│   │   ├── devices/
│   │   ├── users/
│   │   └── settings/
│   └── api/             # API routes
├── components/          # Reusable UI components
├── hooks/               # Custom React hooks
├── lib/                 # Utilities, validations, prisma client
tests/
├── unit/                # Unit tests (validations, permissions)
└── integration/         # Integration tests (API endpoints)
prisma/
└── schema.prisma        # Database schema
```

## Testing

Unit tests run without a database:

```bash
pnpm test
```

Integration tests require a running database and server:

```bash
pnpm prisma migrate dev
pnpm dev  # in a separate terminal
pnpm test -- --run tests/integration/
```

## Deployment

Build the Docker image for production:

```bash
docker-compose -f docker-compose.yml up --build -d
```

For cloud deployment (e.g., Supabase), ensure the following environment variables are set:

- `DATABASE_URL` — PostgreSQL connection string (use pooler endpoint port 6543 for production; port 5432 for migrations only)
- `NEXTAUTH_SECRET` — Random secret for NextAuth session encryption
- `NEXTAUTH_URL` — Your production URL
- `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY` — S3 storage configuration

See `ARCHITECTURE.md` §14 for connection pooling details.

## License

Private project.
