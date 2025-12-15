# 🚀 PHASE 2 - QUICK START GUIDE

## ✅ Everything is Running!

### 📱 URLs
| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:3001 | Web application |
| **Backend** | http://localhost:3000 | REST API |
| **Database** | http://localhost:8080 | Adminer (DB Management) |
| **API Docs** | http://localhost:3000/api/docs | Swagger (next phase) |

---

## 🧪 Quick Test

### 1️⃣ Create Accounts (30 seconds)

**Coach Account:**
```
Go to: http://localhost:3001/auth/signup

Email: coach@example.com
Pseudo: Coach1
Password: Coach123
First Name: Jean
Last Name: Dupont
Role: coach
```

**Student Account:**
```
Email: student@example.com
Pseudo: Student1
Password: Student123
First Name: Marie
Last Name: Martin
Role: student
```

---

### 2️⃣ Test Exercises (2 minutes)

**With Coach Account:**

1. Login with Coach account
2. Click `💪 Exercises` in sidebar
3. Click `➕ New Exercise`
4. Create "Push-ups":
   - Type: `standard`
   - Scope: `coach`
   - Description: "Upper body"
5. Create more exercises:
   - "Squats" (standard, coach)
   - "Deadlifts" (AMRAP, coach)

**Verify:**
- All exercises appear in list
- Can edit any exercise
- Can delete exercises
- Updated info shows immediately

---

### 3️⃣ Test Groups (2 minutes)

**With Coach Account:**

1. Click `👥 Groups` in sidebar
2. Click `➕ New Group`
3. Create "Fitness Bootcamp":
   - Description: "Advanced training"
4. Verify group appears in list

**Verify:**
- Group shows in list
- Group shows "Owner" badge
- Can edit group
- Can delete group

---

### 4️⃣ Test Invitations (with API)

**Send Invitation (Coach):**

Get the groupId and studentId from database or responses, then:

```bash
curl -X POST http://localhost:3000/groups/{groupId}/invite \
  -H "Authorization: Bearer {coach-token}" \
  -H "Content-Type: application/json" \
  -d '{"toUserId": "{student-id}"}'
```

**Receive Invitation (Student):**

1. Logout Coach
2. Login as Student
3. Go to `👥 Groups`
4. Should see "📨 Pending Invitations" section
5. Click `Accept` button
6. Login as Coach again
7. View group - Student should be in members!

---

### 5️⃣ View Database Changes

**In Adminer (http://localhost:8080):**

```
Login:
- Server: postgres
- User: gobeyondfit
- Pass: gobeyondfit_secure_password
- DB: gobeyondfit_db

Browse tables:
- users → See created accounts
- exercises → See created exercises
- groups → See created groups
- invitations → See invitation history
```

---

## 🛠️ Docker Commands

```bash
# Restart everything
docker compose down && docker compose up -d

# View backend logs
docker compose logs -f backend

# View frontend logs  
docker compose logs -f frontend

# View database
docker compose logs -f postgres

# Enter database
docker exec -it gobeyondfit-postgres psql -U gobeyondfit -d gobeyondfit_db
```

---

## 📝 Testing Checklist

### Exercises
- [ ] Create exercise
- [ ] View all exercises
- [ ] Edit exercise
- [ ] Delete exercise
- [ ] See exercise in database

### Groups
- [ ] Create group
- [ ] View groups list
- [ ] Edit group
- [ ] Delete group
- [ ] See group in database

### Invitations
- [ ] Send invitation (via API or future UI)
- [ ] Student receives invitation
- [ ] Student accepts invitation
- [ ] Student appears in group members
- [ ] Verify in database

### Permissions
- [ ] Student can't create exercises/groups (permission denied expected)
- [ ] Student can only see coach's exercises
- [ ] Student can only see groups they're invited to
- [ ] Only owner can edit/delete

---

## 🔍 Example API Calls

### Get all exercises
```bash
curl -X GET http://localhost:3000/exercises \
  -H "Authorization: Bearer {token}"
```

### Create exercise
```bash
curl -X POST http://localhost:3000/exercises \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Push-ups",
    "type": "standard",
    "scope": "coach",
    "description": "Upper body exercise"
  }'
```

### Get groups
```bash
curl -X GET http://localhost:3000/groups \
  -H "Authorization: Bearer {token}"
```

### Create group
```bash
curl -X POST http://localhost:3000/groups \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Group",
    "description": "Group description"
  }'
```

---

## 🐛 Troubleshooting

### Frontend not loading
- Check: http://localhost:3001
- If blank, wait 30 seconds for build
- Check logs: `docker compose logs -f frontend`

### Backend errors
- Check logs: `docker compose logs -f backend`
- Verify JWT token is being sent
- Check database connection

### Database issues
- Access Adminer: http://localhost:8080
- Verify databases exist
- Check credentials

### Token issues
- Make sure to copy token from login response
- Include in `Authorization: Bearer {token}` header
- Tokens expire after defined time

---

## 📖 For More Info

- **Detailed Testing**: See `TESTING_GUIDE.md`
- **Architecture**: See `PHASE_2_COMPLETION.md`
- **Technical Details**: See `PROJECT_SUMMARY.md`

---

## ✨ What's Next?

After testing Phase 2, Phase 3 will add:
- **Program Builder** - Create complex training programs
- **Sessions & Progress** - Track workouts
- **Gamification** - Badges and achievements
- **Analytics** - Performance statistics

---

## 🎉 You're All Set!

Start testing at: **http://localhost:3001**

Questions? Check the logs or documentation files!
