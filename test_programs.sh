#!/bin/bash

# Login as admin
echo "Logging in as admin..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gobeyondfit.com","password":"admin123"}')

echo "Login Response: $LOGIN_RESPONSE"
echo ""

# Extract token
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

echo "Token: $TOKEN"
echo ""

# Test GET /programs
echo "Testing GET /programs:"
curl -s -X GET http://localhost:3000/programs \
  -H "Authorization: Bearer $TOKEN"

echo ""
echo ""

# Create a SIMPLE test program with NO nested structure
echo "Creating SIMPLE program (no blocks)..."
curl -s -X POST http://localhost:3000/programs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Simple Program","description":"No blocks","isDraft":true}'

echo ""
echo "Done!"
