# 🔐 Admin Credentials

## Admin Account Created

Un compte administrateur a été créé dans la base de données le 29 Novembre 2025.

### ✅ Credentials d'Accès

```
Email:    admin@gobeyondfit.com
Username: admin
Password: admin123
Role:     admin
```

### 🔑 Utilisation

### 1. Se connecter via Frontend

- Allez sur http://localhost:3001/auth/login
- Entrez les credentials ci-dessus
- Vous serez redirigé vers le dashboard avec le scope admin

### 2. Accès API Direct

Pour tester les endpoints via API:

```bash
# 1. Se connecter et récupérer le JWT
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@gobeyondfit.com",
    "password": "admin123"
  }'

# Response: { "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc..." }

# 2. Utiliser le JWT dans les requêtes
curl -X GET http://localhost:3000/exercises \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc..."
```

### 3. Base de Données

Les utilisateurs actuels sont:

| Email | Username | Role | Status |
|-------|----------|------|--------|
| admin@gobeyondfit.com | admin | admin | ✅ Créé |
| coach@gmail.com | lecoach | coach | ✅ Existant |
| bibi@gmail.com | Arnold | student | ✅ Existant |

### 🔒 Sécurité

- Le mot de passe est hashé avec bcrypt (algorithme: `$2b$10$...`)
- Hash: `$2b$10$peRvMN6zeJstRAfM32vze.VLniQLSwTkoOL6yNVW33RJA9Q4gLzn2`
- Le rôle admin a accès à toutes les ressources globales

### 📝 Notes

- Cette documentation a été créée automatiquement le 29 Novembre 2025
- Pour changer le password, utilisez l'endpoint `/auth/change-password`
- Pour ajouter d'autres admins, contactez l'administrateur système

---

*Créé: 29 Novembre 2025*
