#!/bin/sh
# For standalone mode, run the Next.js standalone server
cd /app/.next/standalone || exit 1
exec node server.js
