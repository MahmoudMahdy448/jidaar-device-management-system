# Jidaar — IT Device Management System

> Production-quality IT asset management for tracking devices, assignments, and employees.

---

## Prerequisites

- **Node.js** 20 LTS
- **pnpm** (package manager)
- **Docker & Docker Compose** (for PostgreSQL and S3 storage)
- (Optional) **Playwright** for E2E tests

---

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/MahmoudMahdy448/jidaar-device-management-system.git
cd jidaar-device-management-system
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in the values. At minimum you need:

| Variable | Description | Dev Default |
|----------|-------------|-------------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://jidaar:secret@localhost:5432/jidaar` |
| `NEXTAUTH_SECRET` | JWT encryption key (any random string for dev) | `dev-secret-change-in-production` |
| `NEXTAUTH_URL` | Application base URL | `http://localhost:3000` |
| `S3_ENDPOINT` | S3-compatible storage endpoint | `http://localhost:9000` |
| `S3_BUCKET` | S3 bucket name | `jidaar-attachments` |
| `S3_ACCESS_KEY` | S3 access key | `minioadmin` |
| `S3_SECRET_KEY` | S3 secret key | `minioadmin` |

### 4. Start infrastructure services

```bash
docker-compose up -d db minio
```

This starts:
- **PostgreSQL** on port `5432`
- **MinIO** (S3-compatible) on port `9000` (API) and `9001` (console)

### 5. Run database migrations

```bash
pnpm prisma migrate dev
```

### 6. Seed the database

```bash
pnpm prisma db seed
```

This creates:
- 1 admin user (email: `admin@jidaar.com`, password: `admin123`)
- 30 employees across 6 departments
- 75 devices with varied types, statuses, and assignments
- 25 assignment records (some open, some closed)
- Reference data: 10 device types, 9 statuses, 5 manufacturers, 5 vendors, 10 locations

### 7. Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Next.js development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm format` | Run Prettier |
| `pnpm test` | Run unit and integration tests (Vitest) |
| `pnpm test:e2e` | Run end-to-end tests (Playwright) |
| `pnpm prisma migrate dev` | Create/apply development migrations |
| `pnpm prisma db seed` | Seed the database |
| `pnpm prisma studio` | Open Prisma Studio (visual DB browser) |

---

## Project Structure

```
├── prisma/              # Database schema, migrations, seed
├── src/
│   ├── app/             # Next.js App Router (pages + API routes)
│   ├── components/      # React components (UI, layout, feature-specific)
│   ├── lib/             # Shared utilities, Prisma client, auth, validation
│   ├── hooks/           # Custom React hooks
│   └── types/           # TypeScript type definitions
├── tests/               # Unit, integration, and E2E tests
├── ARCHITECTURE.md      # All settled design decisions
├── TASKS.md             # Current task tracking
├── DECISIONS_LOG.md     # Chronological decision history
└── KNOWN_ISSUES.md      # Known bugs and deferred issues
```

---

## Default Login

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@jidaar.com | admin123 |

---

## Testing

```bash
# Unit + integration tests
pnpm test

# E2E tests (requires running dev server)
pnpm test:e2e
```

---

## Environment Setup Notes

- **macOS/Linux:** Docker Compose works natively.
- **Windows:** Use Docker Desktop with WSL 2 backend. Ensure `docker-compose` commands run in a WSL-integrated terminal.
- **MinIO Console:** Access at http://localhost:9001 to manage S3 buckets (login: minioadmin/minioadmin).
- **Database GUI:** Run `pnpm prisma studio` to browse the database visually.
