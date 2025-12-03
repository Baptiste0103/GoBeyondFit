# Quick Start: Exercise Library Testing

## Access the Application

1. **Frontend**: http://localhost:3001
2. **Backend API**: http://localhost:3000
3. **Database**: http://localhost:8080 (Adminer)

---

## Test Credentials

### Coach Account
- Email: `coach@gmail.com`
- Password: `Motdepasse123!`
- Role: Coach (full access to exercises, programs, groups)

### Admin Account  
- Email: `admin@gmail.com`
- Password: `Motdepasse123!`
- Role: Admin (access to all features)

### Student Account
- Email: `student@gmail.com`
- Password: `Motdepasse123!`
- Role: Student (view exercises, assigned programs)

---

## Test the Exercise Library

### Step 1: Navigate to Exercise Library
1. Login as coach or student
2. Click **📚 Exercise Library** in sidebar
3. Should see a grid of exercises with cards

### Step 2: Search Exercises
1. Type in search box: `squat`
2. Press Enter or click Search
3. Should see exercises containing "squat"
4. Examples: Barbell Back Squat, Bodyweight Squat, Front Squat

### Step 3: Filter by Difficulty
1. Select **Intermediate** from difficulty dropdown
2. Search results update to show only Intermediate exercises
3. Change to **Beginner** → results update

### Step 4: Filter by Muscle Group
1. Select **Legs** from muscle group dropdown
2. Results show exercises targeting legs
3. Try **Chest** or **Back** → different exercises appear

### Step 5: Combine Filters
1. Set difficulty: **Beginner**
2. Set muscle group: **Legs**
3. Results show beginner leg exercises
4. Example: Bodyweight Glute Bridge, Bodyweight Leg Raises

### Step 6: Pagination
1. On Exercise Library page, scroll to bottom
2. Click page numbers or Next button
3. Navigate between pages
4. Shows "Showing X to Y of Z exercises"

---

## View Exercise Details

### Step 1: Click an Exercise
1. From Exercise Library, click any exercise card
2. Page should load with exercise details
3. URL shows: `/dashboard/exercises/{id}`

### Step 2: View Exercise Name & Difficulty
1. At top, see large exercise name
2. Difficulty badge shows level (Beginner, Intermediate, etc.)
3. Target muscle group displayed

### Step 3: Watch YouTube Videos
1. Scroll down to video section
2. Two videos should embed:
   - **Quick Demonstration** (left/top)
   - **In-Depth Explanation** (right/bottom)
3. Videos should be playable inline
4. Hover mouse, see YouTube player controls
5. Click "Watch on YouTube →" to open original video

### Step 4: View Exercise Details
1. Scroll down to "Details" section
2. See all exercise specifications:
   - Difficulty level
   - Target muscle group
   - Prime/Secondary/Tertiary muscles
   - Equipment needed
   - Posture, grip type, mechanics
   - Force type, movement patterns, etc.

### Step 5: Navigate Back
1. Click "← Back to Library" button at top
2. Returns to Exercise Library page
3. Search/filters preserved in URL

---

## Test API Endpoints

### Search Exercises (Curl)

```bash
# Basic search
curl -X GET "http://localhost:3000/exercises/library/search?q=squat" \
  -H "Authorization: Bearer YOUR_TOKEN" | jq .

# With filters
curl -X GET "http://localhost:3000/exercises/library/search?q=squat&difficulty=Intermediate&muscle=Legs&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN" | jq .

# Get page 2
curl -X GET "http://localhost:3000/exercises/library/search?q=&page=2&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN" | jq .
```

### Get Exercise Details (Curl)

```bash
# First, get an exercise ID from search
EXERCISE_ID="<paste-id-from-search-results>"

# Get full exercise details
curl -X GET "http://localhost:3000/exercises/$EXERCISE_ID" \
  -H "Authorization: Bearer YOUR_TOKEN" | jq .

# Pretty print metadata
curl -X GET "http://localhost:3000/exercises/$EXERCISE_ID" \
  -H "Authorization: Bearer YOUR_TOKEN" | jq '.meta'

# Check hyperlinks
curl -X GET "http://localhost:3000/exercises/$EXERCISE_ID" \
  -H "Authorization: Bearer YOUR_TOKEN" | jq '.meta | {exercise, short_demonstration_link, indepth_explanation_link}'
```

---

## Get Authorization Token

### Option 1: From Browser Console
1. Login to http://localhost:3001
2. Open browser DevTools (F12)
3. Go to Console tab
4. Run: `localStorage.getItem('access_token')`
5. Copy the token value

### Option 2: Login via API
```bash
curl -X POST "http://localhost:3000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"coach@gmail.com","password":"Motdepasse123!"}' | jq .

# Response will include accessToken
```

---

## Database Verification

### Check Exercise Count in Database

```bash
# Via Adminer (http://localhost:8080)
# System: PostgreSQL
# Server: postgres
# Username: gobeyondfit
# Password: gobeyondfit123
# Database: gobeyondfit_db

# Then run SQL:
SELECT COUNT(*) as total_exercises FROM exercises;
-- Should return 3242

# Check sample exercise with hyperlink
SELECT 
  name,
  meta->>'exercise' as exercise_name,
  meta->>'difficulty_level' as difficulty,
  meta->>'target_muscle_group' as muscle_group,
  meta->>'short_demonstration_link' as demo_link,
  meta->>'indepth_explanation_link' as explanation_link
FROM exercises 
WHERE meta->>'exercise' ILIKE '%squat%'
LIMIT 1;
```

### Via Docker CLI
```bash
docker exec gobeyondfit-postgres psql -U gobeyondfit -d gobeyondfit_db -c \
  "SELECT COUNT(*) FROM exercises;"

# Should output: 3242
```

---

## Check Hyperlinks in JSON

```bash
# View first exercise with hyperlinks
cd c:\Users\bapti\Documents\GoBeyondFitWebApp\backend\src\seeds

# Open exercises.json and search for entries with "_link" fields
# Example format:
# {
#   "exercise": "Bodyweight Glute Bridge",
#   "short_youtube_demonstration": "Video Demonstration",
#   "indepth_explanation_link": "https://youtu.be/5jDEulwWs04",
#   "difficulty_level": "Beginner",
#   "target_muscle_group": "Glutes"
# }
```

---

## Common Test Scenarios

### Scenario 1: New User Exploring Exercises
1. ✅ Login as student
2. ✅ Go to Exercise Library (📚 menu item appears)
3. ✅ Browse exercises with pagination
4. ✅ Search for familiar exercise (e.g., "push-up")
5. ✅ Click to view video demonstrations
6. ✅ Watch Quick Demo video
7. ✅ Watch In-Depth Explanation
8. ✅ See exercise specifications

### Scenario 2: Coach Building Program
1. ✅ Login as coach
2. ✅ Go to Exercise Library
3. ✅ Filter exercises (difficulty, muscle group)
4. ✅ Click exercise to view details
5. ✅ Understand exercise form via videos
6. ✅ Reference while building program
7. ✅ (Phase 5) Program will have clickable exercises

### Scenario 3: Student Following Program
1. ✅ Login as student
2. ✅ (Future) Go to assigned program
3. ✅ (Future) See exercises in program
4. ✅ (Future) Click exercise to view details
5. ✅ (Future) Watch video before performing
6. ✅ (Future) Start workout and autosave progress

---

## Troubleshooting

### "Exercise Library" menu item not showing
- Make sure you're logged in (token in localStorage)
- Check user role (coach/admin can always see, students can see)
- Refresh page (Ctrl+F5)

### Videos not loading
- Check YouTube links are correct format: `https://youtu.be/xxxxx`
- Ensure browser allows iframes from youtube.com
- Try opening direct YouTube link (click "Watch on YouTube →")

### Search returning no results
- Check spelling of search term
- Try searching for common words (e.g., "barbell", "bodyweight")
- Try with no filters first
- Make sure you're searching in library, not other pages

### API returning 401 Unauthorized
- Token might be expired (1 hour expiration)
- Re-login to get fresh token
- Check token format: `Authorization: Bearer TOKEN_HERE`

### Docker containers not running
```bash
# Check status
docker ps

# Restart if needed
cd c:\Users\bapti\Documents\GoBeyondFitWebApp
docker-compose restart

# Check logs
docker logs gobeyondfit-backend
docker logs gobeyondfit-frontend
```

---

## Next Steps

### When Phase 5 is Ready:
1. ✅ Exercises accessible in library ← **YOU ARE HERE**
2. ⏳ Program Builder component (create/edit programs)
3. ⏳ Exercises clickable in programs
4. ⏳ Workout Runner component (execute sessions)
5. ⏳ Autosave workout progress

### Additional Resources
- Full documentation: `Documentation/41_EXERCISE_LIBRARY_GUIDE.md`
- Completion report: `Documentation/42_PHASE_4_5_COMPLETION.md`
- API Swagger docs: http://localhost:3000/api/docs

---

## Success Checklist

- ✅ Can navigate to Exercise Library
- ✅ Can search exercises
- ✅ Can filter by difficulty and muscle group
- ✅ Can paginate through exercises
- ✅ Can click exercise to view details
- ✅ Can see exercise name and difficulty
- ✅ Can view Quick Demonstration video
- ✅ Can view In-Depth Explanation video
- ✅ Can view all exercise specifications
- ✅ Can navigate back to library
- ✅ Database has 3,242 exercises
- ✅ YouTube hyperlinks are preserved
- ✅ All containers running and healthy

**Congratulations! Exercise Library is fully functional! 🎉**

