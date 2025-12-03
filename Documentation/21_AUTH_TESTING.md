# 🧪 Test d'Authentification JWT + bcrypt

## 📝 Instructions de Test

Suivez les étapes ci-dessous pour tester l'authentification complète.

---

## 1️⃣ Démarrer le Backend

```bash
cd backend
npm install  # Si nécessaire
npm run start:dev
```

Le backend doit démarrer sur `http://localhost:3000`.

---

## 2️⃣ Tester Signup (Créer un compte)

### Via cURL:

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

### Response Attendue (201):

```json
{
  "user": {
    "id": "uuid-string",
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

## 3️⃣ Tester Login (Se connecter)

### Via cURL:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123"
  }'
```

### Response Attendue (200):

```json
{
  "user": {
    "id": "uuid-string",
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

## 4️⃣ Tester Protected Route (/me)

### Via cURL (avec JWT Token):

```bash
# Remplacez YOUR_JWT_TOKEN par le token reçu
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response Attendue (200):

```json
{
  "id": "uuid-string",
  "email": "john@example.com",
  "pseudo": "johndoe",
  "firstName": "John",
  "lastName": "Doe",
  "role": "student",
  "profileUrl": null,
  "createdAt": "2025-11-29T10:00:00Z",
  "updatedAt": "2025-11-29T10:00:00Z"
}
```

---

## 5️⃣ Tester Erreurs

### ❌ Erreur: Email déjà existant

```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "pseudo": "johndoe2",
    "password": "SecurePassword123",
    "role": "student"
  }'
```

**Response (409):**
```json
{
  "statusCode": 409,
  "message": "Email already exists"
}
```

### ❌ Erreur: Invalid Credentials

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "WrongPassword"
  }'
```

**Response (401):**
```json
{
  "statusCode": 401,
  "message": "Invalid credentials"
}
```

### ❌ Erreur: Token manquant

```bash
curl -X GET http://localhost:3000/auth/me
```

**Response (401):**
```json
{
  "statusCode": 401,
  "message": "Token not found or is invalid"
}
```

---

## 6️⃣ Test avec Postman/Insomnia

### Configuration:

1. **Collection Name:** `GoBeyondFit Auth`

2. **Signup Request:**
   - **Method:** POST
   - **URL:** `http://localhost:3000/auth/signup`
   - **Body (JSON):**
     ```json
     {
       "email": "coach@example.com",
       "pseudo": "coachuser",
       "password": "CoachPassword123",
       "firstName": "Coach",
       "lastName": "Test",
       "role": "coach"
     }
     ```

3. **Login Request:**
   - **Method:** POST
   - **URL:** `http://localhost:3000/auth/login`
   - **Body (JSON):**
     ```json
     {
       "email": "coach@example.com",
       "password": "CoachPassword123"
     }
     ```

4. **Get Me Request (Protected):**
   - **Method:** GET
   - **URL:** `http://localhost:3000/auth/me`
   - **Headers:**
     ```
     Authorization: Bearer [TOKEN_FROM_SIGNUP_OR_LOGIN]
     ```

---

## 7️⃣ Tester Frontend

### Démarrer le Frontend:

```bash
cd frontend
npm install  # Si nécessaire
npm run dev
```

Le frontend doit démarrer sur `http://localhost:3001`.

### Tester Signup:

1. Naviguer vers `http://localhost:3001/auth/signup`
2. Remplir le formulaire
3. Cliquer sur "Sign Up"
4. Vérifier que le redirect se fait vers `/dashboard`
5. Vérifier que le token est sauvegardé dans `localStorage`

### Tester Login:

1. Naviguer vers `http://localhost:3001/auth/login`
2. Entrer les credentials (email + password)
3. Cliquer sur "Sign In"
4. Vérifier que le redirect se fait vers `/dashboard`

---

## 🔒 Vérifier le Password Hashing

### Vérifier que le password est bien hashé:

```bash
# Connectez-vous à la base de données PostgreSQL
psql -U gobeyondfit -h localhost -d gobeyondfit_db

# Requête pour vérifier:
SELECT email, password FROM users LIMIT 1;
```

**Résultat Attendu:**
```
        email         |                           password                            
---------------------+--------------------------------------------------------------
 john@example.com     | $2b$10$abcdef...  (hash bcrypt, pas du texte clair)
```

---

## ✅ Checklist de Vérification

- [ ] Signup crée un utilisateur avec password hashé
- [ ] Signup retourne un JWT token valide
- [ ] Login avec credentials correctes retourne un token
- [ ] Login avec password incorrect retourne 401
- [ ] Endpoint /me retourne les données de l'utilisateur
- [ ] Endpoint /me sans token retourne 401
- [ ] Email et Pseudo sont uniques (409 en cas de doublon)
- [ ] Password minimum 6 caractères
- [ ] Frontend peut créer un compte
- [ ] Frontend peut se connecter
- [ ] Token est stocké dans localStorage
- [ ] Token est envoyé dans les headers Authorization

---

## 🐛 Dépannage

### Erreur: "Cannot find module '@nestjs/jwt'"

```bash
cd backend
npm install
```

### Erreur: "Token not found or is invalid"

- Vérifier que le token est inclus dans l'en-tête `Authorization: Bearer <token>`
- Vérifier que le token n'a pas expiré (JWT_EXPIRATION = 3600s)

### Erreur: "Email already exists"

- L'email est déjà utilisé, utiliser un autre email pour les tests

### Erreur: Database connection failed

- Vérifier que PostgreSQL est en cours d'exécution
- Vérifier que `DATABASE_URL` est correct dans `.env`

---

**Mise à jour:** 29 novembre 2025
