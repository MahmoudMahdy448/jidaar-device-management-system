@echo off
set DATABASE_URL=postgresql://postgres@127.0.0.1:5433/jidaar
set NEXTAUTH_SECRET=dev-secret-change-in-production
set NEXTAUTH_URL=http://localhost:3000
cd /d C:\Users\PC\Documents\jidaar-device-management-system
pnpm dev
