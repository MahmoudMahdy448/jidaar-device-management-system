# Jidaar Device Management System

A comprehensive device lifecycle management platform built with Next.js 16, TypeScript, Tailwind CSS v4, shadcn/ui, Prisma 6, and NextAuth 5.

## Features

- Device inventory management with full lifecycle tracking
- User management with role-based access control (Admin, Technician, Read Only)
- Device assignment, return, and transfer workflows
- Dashboard with real-time KPIs and charts
- Global search across devices and users
- File attachments (signed forms, documents)
- CSV export for devices and assignments
- Activity logging for all operations
- Light/dark mode support

## Prerequisites

- **Node.js 20+** — run `node -v` to check
- **pnpm 9+** — install via `npm install -g pnpm`
- **MySQL 8.0+** — local install or remote instance

## Step-by-Step Setup (No Docker)

### 1. Clone and install dependencies

```bash
git clone https://github.com/MahmoudMahdy448/jidaar-device-management-system.git
cd jidaar-device-management-system
pnpm install
```

### 2. Install and start MySQL

**Windows** — Download from https://dev.mysql.com/downloads/installer/ and run the MySQL Installer. Use port `3306` (default) and set a password for the `root` user. Or use winget:

```bash
winget install Oracle.MySQL
```

Then initialize and start:

```bash
# Initialize (first time only)
mysqld --initialize-insecure --datadir=C:\mysql-data

# Start MySQL
Start-Process mysqld -ArgumentList "--datadir=C:\mysql-data" -WindowStyle Hidden
```

**macOS** — Use Homebrew:

```bash
brew install mysql
brew services start mysql
```

**Linux (Debian/Ubuntu)**:

```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

Verify MySQL is running:

```bash
mysql --version
```

### 3. Create the database and set password

```bash
# Windows
mysql -u root -e "CREATE DATABASE jidaar;"
mysql -u root -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'password'; FLUSH_PRIVILEGES;"

# macOS / Linux
sudo mysql -e "CREATE DATABASE jidaar;"
sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password'; FLUSH PRIVILEGES;"
```

### 4. Configure environment variables

Copy the example environment file and adjust for your setup:

```bash
cp .env.example .env
```

Edit `.env` with your database connection string:

```ini
DATABASE_URL="mysql://root:password@localhost:3306/jidaar"
NEXTAUTH_SECRET="dev-secret-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

**Connection string format:**

```
mysql://USER:PASSWORD@HOST:PORT/DATABASE
```

Common examples:

| Setup | `DATABASE_URL` |
|-------|----------------|
| Local, default password | `mysql://root:password@localhost:3306/jidaar` |
| Local, no password | `mysql://root@localhost:3306/jidaar` |
| Dedicated user | `mysql://jidaar:secret@localhost:3306/jidaar` |
| Non-default port | `mysql://root:password@localhost:3307/jidaar` |

> **Tip:** Do not put quotes inside the `DATABASE_URL` value. The URL must be a valid MySQL connection string.

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

### `Access denied` / `connection refused`

- Verify MySQL is running: `mysql -u root -p -e "SELECT 1;"`
- Check your `DATABASE_URL` matches the user, password, host, and port
- Ensure the `jidaar` database exists

### `P3009: Failed to create database` (migration error)

- Make sure the database exists and the user in `DATABASE_URL` has full privileges
- Run: `mysql -u root -p -e "GRANT ALL PRIVILEGES ON jidaar.* TO 'root'@'localhost'; FLUSH PRIVILEGES;"`

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

For cloud deployment (e.g., GoDaddy cPanel, Vercel, Railway), ensure the following environment variables are set:

- `DATABASE_URL` — MySQL connection string
- `NEXTAUTH_SECRET` — Random secret for NextAuth session encryption
- `NEXTAUTH_URL` — Your production URL

See `ARCHITECTURE.md` for additional details.

## License

Private project.
