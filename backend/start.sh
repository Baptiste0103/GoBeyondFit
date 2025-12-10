#!/bin/sh

# Push database schema (creates database and tables)
echo "Pushing Prisma schema to database..."
npx prisma db push --skip-generate --accept-data-loss

# Only seed database on first run (check for a seed marker file)
SEED_MARKER="/app/.seeded"
if [ ! -f "$SEED_MARKER" ]; then
  echo "First startup detected - seeding database with exercises..."
  npx prisma db seed
  touch "$SEED_MARKER"
  echo "Database seeding completed"
else
  echo "Database already seeded, skipping seed step..."
fi

# Start the application
echo "Starting application..."
node dist/src/main.js
