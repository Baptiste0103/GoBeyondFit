# 🚀 Testing Guide - Phase 2 Complete!

## URLs
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **Adminer (DB)**: http://localhost:8080
- **Swagger Docs** (soon): http://localhost:3000/api/docs

---

## Test Plan

### 1. Authentication (Already Working ✅)
```
1. Go to http://localhost:3001/auth/signup
2. Create a coach account:
   - Email: coach@example.com
   - Pseudo: Coach1
   - Password: Coach123
   - First Name: Jean
   - Last Name: Dupont
   - Role: coach

3. Create a student account:
   - Email: student@example.com
   - Pseudo: Student1
   - Password: Student123
   - First Name: Marie
   - Last Name: Martin
   - Role: student
```

---

### 2. Exercises Module 💪

#### Create Exercise (Coach logged in)
```
1. Go to http://localhost:3001/dashboard/exercises
2. Click "➕ New Exercise"
3. Fill form:
   - Name: "Push-ups"
   - Type: "standard"
   - Scope: "coach"
   - Description: "Upper body exercise"
4. Click "Create"
5. Repeat for more exercises:
   - "Squats" (standard, coach)
   - "Deadlifts" (AMRAP, coach)
   - "Bench Press" (standard, coach)
```

#### View Exercises
```
1. List should show all exercises
2. Each card shows: Name, Type, Scope, Owner
3. Cards are clickable to edit/delete
```

#### Edit Exercise
```
1. Click "Edit" on any exercise card
2. Modify the form
3. Click "Update"
4. Verify changes in list
```

#### Delete Exercise
```
1. Click "Delete" on any exercise
2. Confirm deletion dialog
3. Exercise disappears from list
```

---

### 3. Groups Module 👥

#### Create Group (Coach logged in)
```
1. Go to http://localhost:3001/dashboard/groups
2. Click "➕ New Group"
3. Fill form:
   - Name: "Fitness Bootcamp 2025"
   - Description: "Advanced training program"
4. Click "Create"
5. Repeat for second group:
   - Name: "Yoga Classes"
   - Description: "Weekly yoga sessions"
```

#### View Groups
```
1. List should show all groups
2. Each card shows: Name, Description, Members count, Owner badge
3. Members displayed as chips with ✕ to remove them
```

#### Edit Group (Owner only)
```
1. Click "Edit" on a group card
2. Modify name/description
3. Click "Update"
4. Verify changes
```

#### Delete Group (Owner only)
```
1. Click "Delete"
2. Confirm deletion
3. Group disappears
```

---

### 4. Invitations & Members Flow

#### Send Invitation (Coach to Student)
```
IMPORTANT: Currently needs to be tested via API or later UI
Future feature will have "Invite" button in group card

API Test:
POST http://localhost:3000/groups/{groupId}/invite
Body: { "toUserId": "student-id" }
```

#### Receive & Respond to Invitation (Student)
```
1. Student logs in
2. Go to /dashboard/groups
3. Should see "📨 Pending Invitations" section
4. Shows invitations from coaches
5. Click "Accept" or "Reject"
6. If accepted: Student added to group members
```

---

### 5. Programs Placeholder 📋
```
1. Go to /dashboard/programs
2. See "Coming Soon" message
3. Lists upcoming features
```

---

### 6. Dashboard Overview 🏠
```
1. After login, shows user info
2. Quick stats cards (0s for now)
3. Profile details
4. Links to Exercises & Groups
```

---

## 🧪 Testing Scenarios

### Scenario A: Single Coach Managing Exercises
1. Login as Coach
2. Create 5 exercises with different types
3. Edit one exercise
4. Delete one exercise
5. Verify remaining exercises show correctly

### Scenario B: Coach Creates Group & Invites Students
1. Login as Coach
2. Create a group
3. Note the group ID
4. Use API to invite student (or wait for UI)
5. Logout

### Scenario C: Student Joins Group via Invitation
1. Login as Student
2. View pending invitations
3. Accept an invitation
4. Verify student appears in group members (coach view)

---

## 🔍 Testing with Adminer

1. Go to http://localhost:8080
2. Login:
   - System: PostgreSQL
   - Server: postgres
   - User: gobeyondfit
   - Pass: gobeyondfit_secure_password
   - DB: gobeyondfit_db
3. Browse tables:
   - `users` - See created accounts
   - `exercises` - See created exercises  
   - `groups` - See created groups
   - `group_members` - See group memberships
   - `invitations` - See pending/accepted invitations

---

## 🔧 API Endpoints to Test (via curl/Postman)

### Get All Exercises
```
GET http://localhost:3000/exercises
Authorization: Bearer {token}
```

### Create Exercise
```
POST http://localhost:3000/exercises
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Pull-ups",
  "type": "standard",
  "scope": "coach",
  "description": "Back exercise"
}
```

### Get All Groups
```
GET http://localhost:3000/groups
Authorization: Bearer {token}
```

### Create Group
```
POST http://localhost:3000/groups
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "My Group",
  "description": "Group description"
}
```

### Send Invitation
```
POST http://localhost:3000/groups/{groupId}/invite
Authorization: Bearer {token}
Content-Type: application/json

{
  "toUserId": "student-user-id"
}
```

### Get My Invitations
```
GET http://localhost:3000/groups/invitations/me
Authorization: Bearer {token}
```

### Respond to Invitation
```
POST http://localhost:3000/groups/invitations/{invitationId}/respond
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "accepted"
}
```

---

## ✅ Success Criteria

- [ ] Can create coach and student accounts
- [ ] Coach can create exercises
- [ ] Coach can view all exercises
- [ ] Coach can edit exercises
- [ ] Coach can delete exercises
- [ ] Coach can create groups
- [ ] Coach can view groups
- [ ] Coach can edit/delete own groups
- [ ] Coach can view group members
- [ ] Student receives invitations
- [ ] Student can accept/reject invitations
- [ ] Accepted students appear in group
- [ ] Database reflects all changes

---

## 📝 Notes

- All endpoints require JWT authentication
- Coach can only modify their own exercises (unless admin)
- Global exercises require admin role
- Only group owner can modify group
- Invitations are email-triggered (not fully implemented yet)
- Student sidebar might show different options than coach (implement role-based nav next)

---

## 🐛 Known Limitations

- No email notifications yet for invitations
- No role-based UI navigation yet (all users see all menu items)
- Programs module is placeholder
- Invitation send requires API call (no UI button yet)

---

## 🚀 Next Steps

1. Implement Program Builder (nested structure)
2. Add role-based navigation
3. Build Session/Progress tracking
4. Add email notifications
