@echo off
set DATABASE_URL=mysql://root:password@localhost:3306/jidaar
set NEXTAUTH_SECRET=dev-secret-change-in-production
set NEXTAUTH_URL=http://localhost:3000
cd /d C:\Users\PC\Documents\jidaar-device-management-system
pnpm dev
