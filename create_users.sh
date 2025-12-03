#!/bin/bash

# Create coach user
echo "Creating coach user..."
curl -s -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "coach@gobeyondfit.com",
    "password": "coach123",
    "username": "Coach User",
    "role": "coach"
  }'

echo ""
echo ""

# Create student user
echo "Creating student user..."
curl -s -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@gobeyondfit.com",
    "password": "student123",
    "username": "Student User",
    "role": "student"
  }'

echo ""
echo ""

# Create admin user
echo "Creating admin user..."
curl -s -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@gobeyondfit.com",
    "password": "admin123",
    "username": "Admin User",
    "role": "admin"
  }'

echo ""
echo "Users created!"
