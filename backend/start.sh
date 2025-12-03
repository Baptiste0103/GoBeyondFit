#!/bin/sh

# Push database schema (creates database and tables)
echo "Pushing Prisma schema to database..."
npx prisma db push --skip-generate

# Start the application
echo "Starting application..."
node dist/src/main.js
