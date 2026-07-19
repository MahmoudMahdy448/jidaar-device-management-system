#!/bin/bash
# Jidaar Device Management System - cPanel Deployment Script
# Run this via SSH after uploading code to the server

set -e

echo "=== Jidaar Deployment ==="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "ERROR: Node.js not found. Please enable Node.js in cPanel > Setup Node.js App first."
  exit 1
fi

NODE_VERSION=$(node -v)
echo "Node.js version: $NODE_VERSION"

# Check npm
if ! command -v npm &> /dev/null; then
  echo "ERROR: npm not found."
  exit 1
fi

echo ""

# Step 1: Install dependencies
echo ">>> Step 1: Installing dependencies..."
npm install --omit=dev
echo "Dependencies installed."

# Step 2: Generate Prisma Client
echo ""
echo ">>> Step 2: Generating Prisma Client..."
npx prisma generate
echo "Prisma Client generated."

# Step 3: Run database migrations
echo ""
echo ">>> Step 3: Running database migrations..."
npx prisma migrate deploy
echo "Migrations applied."

# Step 4: Build the application
echo ""
echo ">>> Step 4: Building application..."
npm run build
echo "Build complete."

echo ""
echo "=== Deployment Complete ==="
echo ""
echo "Start the app with: npm start"
echo "Or restart via cPanel > Setup Node.js App > Restart"
