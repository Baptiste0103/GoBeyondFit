# 🚀 COMMANDES À EXÉCUTER

## 📋 Étapes pour Démarrer

### **Étape 1: Préparer l'Environnement**

#### Windows (PowerShell):
```powershell
# Option 1: Script automatique (Recommandé)
.\quick_start.ps1

# Option 2: Manuel
cd backend
npm install
cd ..\frontend
npm install
cd ..
```

#### Linux/Mac (Bash):
```bash
# Option 1: Script automatique (Recommandé)
bash quick_start.sh

# Option 2: Manuel
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

---

### **Étape 2: Démarrer le Backend**

#### Terminal 1:
```bash
cd backend
npm run start:dev
```

**Résultat attendu:**
```
[Nest] 12345  - 11/29/2025, 2:30:00 PM     LOG [NestFactory] Starting Nest application...
[Nest] 12345  - 11/29/2025, 2:30:02 PM     LOG [InstanceLoader] JwtModule dependencies initialized
...
[Nest] 12345  - 11/29/2025, 2:30:05 PM     LOG [NestApplication] Nest application successfully started
Listening on port 3000 ✓
```

---

### **Étape 3: Démarrer le Frontend**

#### Terminal 2:
```bash
cd frontend
npm run dev
```

**Résultat attendu:**
```
▲ Next.js 16.0.5
- Local:        http://localhost:3001
- Environments: .env.local
✓ Ready in 2.5s
```

---

### **Étape 4: Tester Immédiatement**

#### Dans le navigateur:
```
http://localhost:3001/auth/signup
```

---

## 🧪 TESTS CURL RAPIDES

### **Test 1: Créer un Compte (Signup)**

```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "pseudo": "johndoe",
    "password": "SecurePassword123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "student"
  }'
```

**Response Attendue (201):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john@example.com",
    "pseudo": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "role": "student",
    "profileUrl": null
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJlbWFpbCI6ImpvaG5AZXhhbXBsZS5jb20iLCJyb2xlIjoic3R1ZGVudCIsImlhdCI6MTczMjg2MDYwNSwiZXhwIjoxNzMyODY0MjA1fQ.sxB_9vHYZ7KjNQqZ8uQqWqQqWqQqWqQqWqQqWqQqWqQ"
}
```

**⚠️ Copier le JWT token (access_token) pour les prochains tests!**

---

### **Test 2: Se Connecter (Login)**

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123"
  }'
```

**Response Attendue (200):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john@example.com",
    "pseudo": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "role": "student",
    "profileUrl": null
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### **Test 3: Récupérer ses Données (Protected)**

```bash
# Remplacer YOUR_JWT_TOKEN par le token du test 1 ou 2
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response Attendue (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john@example.com",
  "pseudo": "johndoe",
  "firstName": "John",
  "lastName": "Doe",
  "role": "student",
  "profileUrl": null,
  "createdAt": "2025-11-29T10:30:05.000Z",
  "updatedAt": "2025-11-29T10:30:05.000Z"
}
```

---

### **Test 4: Erreur - Credential Invalide**

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "WrongPassword"
  }'
```

**Response Attendue (401):**
```json
{
  "statusCode": 401,
  "message": "Invalid credentials"
}
```

---

### **Test 5: Erreur - Token Manquant**

```bash
curl -X GET http://localhost:3000/auth/me
```

**Response Attendue (401):**
```json
{
  "statusCode": 401,
  "message": "Token not found or is invalid"
}
```

---

## 🧮 TEST AVEC POSTMAN/INSOMNIA

### **1. Importer Collection**

Créer une nouvelle collection: `GoBeyondFit Auth`

### **2. Créer Requests**

#### Request 1: Signup
```
POST http://localhost:3000/auth/signup
Headers: Content-Type: application/json

Body (raw JSON):
{
  "email": "coach@example.com",
  "pseudo": "coachuser",
  "password": "CoachPassword123",
  "firstName": "Coach",
  "lastName": "Test",
  "role": "coach"
}
```

#### Request 2: Login
```
POST http://localhost:3000/auth/login
Headers: Content-Type: application/json

Body (raw JSON):
{
  "email": "coach@example.com",
  "password": "CoachPassword123"
}
```

#### Request 3: Get Me (Protected)
```
GET http://localhost:3000/auth/me
Headers: 
  - Content-Type: application/json
  - Authorization: Bearer {{ACCESS_TOKEN}}

(Remplacer {{ACCESS_TOKEN}} par le token reçu)
```

---

## ✅ VÉRIFICATION FINALE

### **Checklist de Vérification**

- [ ] Backend démarre sur `http://localhost:3000`
- [ ] Frontend démarre sur `http://localhost:3001`
- [ ] Signup crée un compte et retourne un JWT token
- [ ] Login accepte les credentials correctes
- [ ] Login rejette les passwords incorrects
- [ ] /me retourne les données utilisateur
- [ ] /me sans token retourne 401
- [ ] Frontend peut créer un compte
- [ ] Frontend peut se connecter
- [ ] Token est stocké dans localStorage

---

## 🐛 DÉPANNAGE

### **Backend ne démarre pas**

```bash
# Vérifier les dépendances
cd backend
npm install

# Vérifier la base de données
# S'assurer que PostgreSQL est en cours d'exécution
# Vérifier DATABASE_URL dans .env
```

### **Frontend ne démarre pas**

```bash
# Vérifier les dépendances
cd frontend
npm install

# Vérifier le port 3001 n'est pas utilisé
# Ou changer le port avec: npm run dev -- -p 3002
```

### **Erreur: "Cannot POST /auth/signup"**

- Vérifier que le backend est démarré (port 3000)
- Vérifier que l'URL est correcte
- Vérifier que la méthode HTTP est POST

### **Erreur: "Invalid credentials"**

- Vérifier que l'email existe
- Vérifier que le password est correct
- Essayer de créer un nouveau compte

### **Erreur: "Token not found or is invalid"**

- Vérifier que le header Authorization est présent
- Vérifier que le format est: `Bearer <TOKEN>`
- Vérifier que le token n'a pas expiré

---

## 📁 FICHIERS DE RÉFÉRENCE

| Document | Lire si |
|----------|----------|
| `QUICK_START_2MIN.md` | Vous êtes pressé |
| `JWT_SETUP.md` | Vous voulez un setup complet |
| `AUTH_TESTING.md` | Vous voulez plus d'exemples |
| `AUTH_IMPLEMENTATION.md` | Vous voulez les détails techniques |

---

## 🎉 RÉSULTAT FINAL

Si tous les tests passent ✅:

```
✅ Signup fonctionne
✅ Login fonctionne
✅ JWT token généré
✅ Routes protégées fonctionnent
✅ Frontend peut se connecter

🎉 PRÊT POUR LA PRODUCTION! 🎉
```

---

**Besoin d'aide?** Lire: `JWT_SETUP.md` → Section Troubleshooting
