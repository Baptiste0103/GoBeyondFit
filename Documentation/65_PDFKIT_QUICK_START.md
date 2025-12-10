# PDF Export - Quick Start Guide

## 🚀 Quick Test (30 seconds)

```bash
# 1. Start backend (terminal 1)
cd backend
npm run start

# 2. Login and get token (terminal 2)
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"coach@example.com","password":"password123"}' | jq -r '.access_token')

# 3. Export PDF with default theme
curl -X GET "http://localhost:3000/api/export/programs/{programId}/pdf?theme=default" \
  -H "Authorization: Bearer $TOKEN" \
  --output program.pdf

# 4. Open PDF
open program.pdf
```

## 📋 API Reference

### Export Program to PDF

**Endpoint:** `GET /api/export/programs/:programId/pdf`

**Query Parameters:**
- `theme` (optional): `default` | `dark` | `minimal`

**Headers:**
- `Authorization: Bearer {jwt_token}`

**Response:**
- Content-Type: `application/pdf`
- Status: `200 OK` or `404 Not Found` or `500 Internal Server Error`

**Example:**
```bash
curl -X GET "http://localhost:3000/api/export/programs/abc123/pdf?theme=dark" \
  -H "Authorization: Bearer eyJhbGci..." \
  -H "Accept: application/pdf" \
  --output "my-program.pdf"
```

### Get Available Formats

**Endpoint:** `GET /api/export/formats`

**Response:**
```json
{
  "formats": ["pdf"],
  "themes": ["default", "dark", "minimal"],
  "sizes": ["A4"],
  "description": "Export training programs in multiple formats"
}
```

### Health Check

**Endpoint:** `GET /api/export/health`

**Response:**
```json
{
  "status": "healthy",
  "service": "pdfkit-export",
  "memory": {
    "heapUsed": "45 MB",
    "heapTotal": "120 MB"
  },
  "timestamp": "2025-01-17T10:30:45.123Z"
}
```

## 🎨 Available Themes

### 1. Default (Professional)
- Blue accents
- White background
- Black text
- Standard font sizes
- Best for printing

### 2. Dark
- Light blue accents
- Dark background (#1A1A1A)
- White text
- Good for screens
- Easier on eyes

### 3. Minimal
- Black accents
- Minimalist design
- Gray text
- Smallest file size
- Fast loading

## 🔑 Authentication

All export endpoints require JWT token in Authorization header:

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Get Token

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "coach@example.com",
    "password": "your_password"
  }'
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600
}
```

## 📊 Performance

| Metric | Value |
|--------|-------|
| Generation Time | 50-200 ms |
| Memory Usage | 10-30 MB |
| File Size | 1-3 MB (depending on program size) |
| Supported Formats | PDF (A4) |

## 🐛 Troubleshooting

### PDF Export Returns 404
- **Cause:** Program ID doesn't exist or you don't have access
- **Solution:** Verify program ID is correct and you're logged in as owner

### PDF Export Returns 500
- **Cause:** Internal server error during generation
- **Solution:** 
  1. Check backend logs: `docker logs <container_id>`
  2. Verify database connection
  3. Check for large programs with many exercises

### PDF Takes Too Long
- **Cause:** Large program with 100+ exercises
- **Solution:** Generate smaller programs or batch exports

### Token Expired
- **Cause:** JWT token expired (3600 seconds)
- **Solution:** Get new token with login endpoint

### Slow Theme Rendering
- **Cause:** Large PDF file being styled
- **Solution:** Use "minimal" theme for faster generation

## 💡 Tips & Tricks

### 1. Export All Programs
```bash
TOKEN="your_token"
PROGRAMS=$(curl -s -X GET http://localhost:3000/api/programs \
  -H "Authorization: Bearer $TOKEN" | jq -r '.[] | .id')

for id in $PROGRAMS; do
  curl -X GET "http://localhost:3000/api/export/programs/$id/pdf" \
    -H "Authorization: Bearer $TOKEN" \
    --output "$id.pdf"
done
```

### 2. Compare Themes
```bash
for theme in default dark minimal; do
  curl -X GET "http://localhost:3000/api/export/programs/{id}/pdf?theme=$theme" \
    -H "Authorization: Bearer $TOKEN" \
    --output "program_$theme.pdf"
done
```

### 3. Monitor Export Performance
```bash
# Time the export
time curl -X GET "http://localhost:3000/api/export/programs/{id}/pdf" \
  -H "Authorization: Bearer $TOKEN" \
  --output test.pdf
```

### 4. Check Service Health
```bash
curl -X GET http://localhost:3000/api/export/health \
  -H "Authorization: Bearer $TOKEN" | jq '.'
```

## 📁 File Locations

**Backend Implementation:**
- Controller: `backend/src/export/export.controller.ts`
- Service: `backend/src/export/pdfkit-export.service.ts`
- Module: `backend/src/export/export.module.ts`

**Documentation:**
- Main Reference: `Documentation/65_PDFKIT_IMPLEMENTATION.md`
- Migration Guide: `Documentation/65_PDFKIT_MIGRATION.md`
- Code Examples: `Documentation/65_PDFKIT_CODE_REFERENCE.md`

## ✅ Testing Checklist

- [ ] Backend starts without errors
- [ ] Can get JWT token
- [ ] Can list programs
- [ ] Can export PDF with default theme
- [ ] Can export PDF with dark theme
- [ ] Can export PDF with minimal theme
- [ ] PDF opens in reader
- [ ] PDF contains all program details
- [ ] `/api/export/formats` returns correct themes
- [ ] `/api/export/health` shows healthy status

## 🚀 Next Steps

1. **Deploy** to production
2. **Monitor** error logs
3. **Test** with real users
4. **Collect** feedback
5. **Optimize** if needed (e.g., caching, lazy loading)

## 📞 Support

For detailed documentation, see:
- `Documentation/65_PDFKIT_IMPLEMENTATION.md`
- `Documentation/65_PDFKIT_CODE_REFERENCE.md`
- `Documentation/65_PDFKIT_MIGRATION.md`

---

**Last Updated:** January 2025
**Status:** Production Ready ✅
