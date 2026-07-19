# Jidaar Device Management System

A comprehensive device lifecycle management platform built with Next.js 16, TypeScript, Tailwind CSS v4, shadcn/ui, Prisma 7, and NextAuth 5.

## Features

- Device inventory management with full lifecycle tracking
- User management with role-based access control (Admin, Technician, Read Only)
- Device assignment, return, and transfer workflows
- Dashboard with real-time KPIs and charts
- Global search across devices and users
- File attachments stored in PostgreSQL (signed forms, documents)
- CSV export for devices and assignments
- Activity logging for all operations
- Light/dark mode support

## Prerequisites

- **Node.js 20+** — run `node -v` to check
- **pnpm 9+** — install via `npm install -g pnpm`
- **PostgreSQL 16+** — local install or remote instance

## Step-by-Step Setup (No Docker)

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd jidaar-device-management-system
pnpm install
```

### 2. Install and start PostgreSQL

**Windows** — Download from https://www.postgresql.org/download/windows/ and run the installer. Use port `5432` (default) and set a password for the `postgres` user. Alternatively, use [PostgreSQL Portable](https://www.postgresql.org/download/windows-portable/) or [Chocolatey](https://chocolatey.org/):

```bash
choco install postgresql16
```

**macOS** — Use Homebrew:

```bash
brew install postgresql@16
brew services start postgresql@16
```

**Linux (Debian/Ubuntu)**:

```bash
sudo apt update
sudo apt install postgresql
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

Verify PostgreSQL is running:

```bash
psql --version
```

### 3. Create the database

Connect to PostgreSQL and create the database:

```bash
# Using the default 'postgres' user (Windows)
psql -U postgres -h 127.0.0.1 -p 5432 -c "CREATE DATABASE jidaar;"

# macOS / Linux (peer auth as system user)
sudo -u postgres psql -c "CREATE DATABASE jidaar;"
```

> **Note:** If you set a password during PostgreSQL installation, you'll need to provide it. You can also create a dedicated user:
>
> ```bash
> psql -U postgres -h 127.0.0.1 -p 5432 -c "CREATE USER jidaar WITH PASSWORD 'secret';"
> psql -U postgres -h 127.0.0.1 -p 5432 -c "GRANT ALL PRIVILEGES ON DATABASE jidaar TO jidaar;"
> psql -U postgres -h 127.0.0.1 -p 5432 -d jidaar -c "GRANT ALL ON SCHEMA public TO jidaar;"
> ```

### 4. Configure environment variables

Copy the example environment file and adjust for your setup:

```bash
cp .env.example .env
```

Edit `.env` with your database connection string:

```ini
DATABASE_URL="postgresql://postgres@127.0.0.1:5432/jidaar"
NEXTAUTH_SECRET="dev-secret-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

**Connection string format:**

```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

Common examples:

| Setup | `DATABASE_URL` |
|-------|----------------|
| Local, no password | `postgresql://postgres@127.0.0.1:5432/jidaar` |
| Local, with password | `postgresql://postgres:password@127.0.0.1:5432/jidaar` |
| Dedicated user | `postgresql://jidaar:secret@127.0.0.1:5432/jidaar` |
| Non-default port | `postgresql://postgres@127.0.0.1:5433/jidaar` |

> **Tip:** Do not put quotes inside the `DATABASE_URL` value. The URL must be a valid PostgreSQL connection string.

### 5. Run database migrations

```bash
pnpm prisma migrate dev
```

This creates all tables in the database. On first run, it applies all existing migrations. On subsequent runs, it creates a new migration if the schema has changed.

### 6. Seed the database

```bash
pnpm prisma db seed
```

This populates the database with:

- 12 device types (Desktop, Laptop, Server, Router, Switch, etc.)
- 9 device statuses (Available, Assigned, Maintenance, etc.)
- 6 departments
- 10 locations
- 5 manufacturers
- 5 vendors
- 1 admin user
- 30 regular users
- 75 devices
- 25 assignments (some open, some returned, some overdue)

### 7. Start the development server

```bash
pnpm dev
```

Open http://localhost:3000 in your browser.

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@jidaar.com | admin123 |
| Technician | tech@jidaar.com | admin123 |
| Read Only | readonly@jidaar.com | admin123 |

> **Note:** Only the admin user is created by the seed. The technician and read-only accounts listed above are examples — create additional users through the admin panel.

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server (with Turbopack) |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run unit tests (Vitest) |
| `pnpm prisma migrate dev` | Run database migrations |
| `pnpm prisma db seed` | Seed the database |
| `pnpm prisma studio` | Open Prisma Studio (browser-based DB viewer) |
| `pnpm format` | Format code with Prettier |

## Troubleshooting

### `password authentication failed` / `connection refused`

- Verify PostgreSQL is running: `pg_isready -h 127.0.0.1 -p 5432`
- Check your `DATABASE_URL` matches the user, password, host, and port
- Ensure the `jidaar` database exists

### `P3009: Failed to create database` (migration error)

- Make sure the database exists and the user in `DATABASE_URL` has full privileges
- Run: `psql -U postgres -h 127.0.0.1 -p 5432 -d jidaar -c "GRANT ALL ON SCHEMA public TO postgres;"`

### Port conflict on 3000

```bash
# Find process using port 3000
# Windows
netstat -ano | findstr :3000
# macOS/Linux
lsof -i :3000

# Kill the process or use a different port
pnpm dev -- -p 3001
```

### Seed fails with duplicate key errors

The database already has data. Reset it:

```bash
pnpm prisma migrate reset
pnpm prisma db seed
```

### `Module not found` errors after pulling

Reinstall dependencies:

```bash
rm -rf node_modules
pnpm install
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/                  # Login page
│   ├── (dashboard)/             # Protected dashboard pages
│   │   ├── assignments/         # Assignment list + detail pages
│   │   ├── devices/             # Device list + detail pages
│   │   ├── users/               # User list + detail pages
│   │   └── settings/            # Reference data management
│   └── api/                     # API routes
├── components/                  # Reusable UI components
├── hooks/                       # Custom React hooks (SWR)
├── lib/                         # Utilities, validations, prisma client
tests/
├── unit/                        # Unit tests (validations, permissions)
└── integration/                 # Integration tests (API endpoints)
prisma/
├── schema.prisma                # Database schema
├── seed.ts                      # Seed script
└── migrations/                  # Migration history
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

For cloud deployment (e.g., Supabase, Vercel, Railway), ensure the following environment variables are set:

- `DATABASE_URL` — PostgreSQL connection string
- `NEXTAUTH_SECRET` — Random secret for NextAuth session encryption
- `NEXTAUTH_URL` — Your production URL

See `ARCHITECTURE.md` for connection pooling details.

## License

Private project.
