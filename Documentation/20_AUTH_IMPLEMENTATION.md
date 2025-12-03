# ✅ Authentication Implementation - JWT + bcrypt

## 📋 Résumé

Votre système d'authentification est maintenant **complètement implémenté** sans dépendre de Supabase :

- ✅ **JWT Tokens** : Authentification sans état (stateless)
- ✅ **bcrypt** : Hashage sécurisé des mots de passe
- ✅ **Signup** : Créer un compte avec génération de token
- ✅ **Login** : Connexion avec email/password
- ✅ **Protected Routes** : Endpoints protégés par JWT Guard
- ✅ **Supabase Supprimé** : Plus de dépendances externes pour l'auth

---

## 🔐 Endpoints d'Authentification

### 1. **POST /auth/signup**
Crée un nouvel utilisateur et retourne un JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "pseudo": "johndoe",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "student"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid-string",
    "email": "user@example.com",
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

### 2. **POST /auth/login**
Se connecter avec email et mot de passe.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid-string",
    "email": "user@example.com",
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

### 3. **GET /auth/me** (Protected)
Récupère les données de l'utilisateur connecté.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200):**
```json
{
  "id": "uuid-string",
  "email": "user@example.com",
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

## 🔧 Configuration

### **Backend .env**
```properties
# JWT Configuration
JWT_SECRET="your_jwt_secret_key_change_in_production"
JWT_EXPIRATION="3600"  # 1 heure

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/db_name"
```

### **Frontend .env**
```properties
# API Configuration
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

---

## 📦 Implémentation Technique

### **Files Impactés:**

1. **Backend:**
   - `src/auth/user.service.ts` : Méthodes hashPassword() et validatePassword()
   - `src/auth/auth.controller.ts` : Routes /signup et /login avec JWT
   - `src/auth/auth.module.ts` : Configuration JwtModule
   - `src/auth/strategies/jwt.strategy.ts` : Extraction du token
   - `src/common/guards/jwt-auth.guard.ts` : Protection des routes

2. **Database:**
   - `prisma/schema.prisma` : Champ `password` dans User model
   - `prisma/migrations` : Migration avec le champ password

---

## 🔒 Sécurité

### **bcrypt Configuration**
- **Salt rounds:** 10
- **Algorithme:** bcrypt (standard industry)
- **Hash stored:** En base de données PostgreSQL

### **JWT Configuration**
- **Secret:** `JWT_SECRET` (à changer en production)
- **Expiration:** 3600 secondes (1 heure)
- **Signature:** HS256
- **Transport:** Bearer token dans l'en-tête `Authorization`

---

## 💻 Utilisation Frontend

### **Exemple avec React Query**

```typescript
import { useMutation } from '@tanstack/react-query';

// Signup
const signupMutation = useMutation(async (data) => {
  const response = await fetch('http://localhost:3000/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  
  // Stocker le token
  localStorage.setItem('access_token', result.access_token);
  
  return result;
});

// Login
const loginMutation = useMutation(async (credentials) => {
  const response = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  const result = await response.json();
  
  localStorage.setItem('access_token', result.access_token);
  
  return result;
});

// Protected Request
const getMe = async () => {
  const token = localStorage.getItem('access_token');
  const response = await fetch('http://localhost:3000/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.json();
};
```

---

## 🚀 Testing avec cURL

### **Signup**
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "pseudo": "testuser",
    "password": "password123",
    "role": "student"
  }'
```

### **Login**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### **Get Current User (Protected)**
```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

---

## ✅ Checklist de Vérification

- [x] bcrypt installé et configuré
- [x] JWT module configuré dans AuthModule
- [x] Routes /signup et /login implémentées
- [x] Password hashé à la création
- [x] JWT généré au signup et login
- [x] JWT Guard protège les routes sensibles
- [x] Supabase supprimé du projet
- [x] Variables d'environnement nettoyées
- [x] Package.json frontend mis à jour

---

## 📝 Prochaines Étapes (Optionnel)

1. **Refresh Token** : Ajouter un mécanisme de refresh token pour prolonger la session
2. **Rate Limiting** : Limiter les tentatives de login
3. **Two-Factor Auth** : Ajouter une authentification à deux facteurs
4. **Email Verification** : Vérifier les emails avant la création de compte
5. **Password Reset** : Implémentation d'une route de réinitialisation de mot de passe

---

## 🆘 Dépannage

### **Erreur: "Token not found or is invalid"**
- Vérifier que le token est envoyé dans l'en-tête `Authorization: Bearer <token>`
- Vérifier que le token n'a pas expiré

### **Erreur: "Invalid credentials"**
- Vérifier que l'email et le mot de passe sont corrects
- Vérifier que l'utilisateur existe en base de données

### **Erreur: "Email already exists"**
- L'email est déjà utilisé par un autre compte

---

**Mise à jour:** 29 novembre 2025
**Statut:** ✅ Production-ready
