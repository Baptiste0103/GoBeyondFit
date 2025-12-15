# 🎯 Role-Based Navigation & Access Control

## Implémentation Complète

La navigation et l'interface du dashboard sont maintenant **entièrement basées sur les rôles** des utilisateurs. Chaque rôle (admin, coach, student) voit une expérience différente.

## 📋 Visible par Rôle

### Admin & Coach
- ✅ Dashboard (Vue d'ensemble avec stats)
- ✅ Exercises (Créer, éditer, supprimer)
- ✅ Groups (Créer, gérer, inviter)
- ✅ Programs (Créer des plans d'entraînement)
- ✅ Logout

### Student
- ✅ Dashboard (Vue d'ensemble personnalisée)
- ✅ Groups (Rejoindre, voir invitations)
- ❌ Exercises (Accès restreint)
- ❌ Programs (Accès restreint)
- ✅ Logout

## 🔧 Fichiers Modifiés

### 1. `frontend/components/sidebar.tsx`
```typescript
// Sidebar dynamique avec filtrage des menus par rôle
const getMenuItems = () => {
  const menuItems = [
    { href: '/dashboard', label: '📊 Dashboard', roles: ['admin', 'coach', 'student'] },
    { href: '/dashboard/exercises', label: '💪 Exercises', roles: ['admin', 'coach'] },
    { href: '/dashboard/groups', label: '👥 Groups', roles: ['admin', 'coach', 'student'] },
    { href: '/dashboard/programs', label: '📋 Programs', roles: ['admin', 'coach'] },
  ]
  
  if (!role) return [menuItems[0]]
  return menuItems.filter(item => item.roles.includes(role))
}
```

**Features:**
- Affichage du rôle utilisateur dans la sidebar
- Menu dynamique filtré par rôle
- Stockage du rôle lors de la connexion

### 2. `frontend/lib/auth.ts`
```typescript
// Nouvelles méthodes pour gérer le rôle
private setUserRole(role: string): void {
  localStorage.setItem('userRole', role)
}

getUserRole(): string | null {
  return localStorage.getItem('userRole')
}
```

**Modifications:**
- `signup()` - Sauvegarde maintenant le rôle
- `login()` - Sauvegarde maintenant le rôle
- `logout()` - Supprime le rôle de localStorage

### 3. `frontend/app/dashboard/page.tsx`
```typescript
// Dashboard avec contenu personnalisé par rôle

// Pour Coach/Admin:
- Stats: Exercises, Groups, Programs, Workouts
- Section "Start Building" avec liens de création

// Pour Student:
- Stats: My Groups, Pending Invitations, Assigned Programs, Completed Sessions
- Section "What's Next?" pour rejoindre des groupes
```

## 📊 Dashboard Pages Existantes

Ces pages nécessitent une **mise à jour** pour vérifier le rôle:

1. **`/dashboard/exercises`**
   - ✅ Coach: Affiche formulaire de création + liste d'exercices
   - ❌ Student: Redirection ou page d'erreur 403

2. **`/dashboard/groups`**
   - ✅ Coach: Affiche formulaire + liste de ses groupes
   - ✅ Student: Affiche liste + invitations pendantes
   - ❌ Student ne peut pas créer/éditer de groupes

3. **`/dashboard/programs`**
   - ✅ Coach: Affiche formulaire + liste de programmes
   - ❌ Student: Redirection ou page vide

## 🔐 Flux d'Authentification

```
1. Utilisateur se connecte
   ↓
2. Backend renvoie { user: { role, email, ... }, access_token }
   ↓
3. Frontend stock:
   - access_token (localStorage)
   - userRole (localStorage)
   - user_data (localStorage)
   ↓
4. Sidebar lit userRole depuis localStorage
   ↓
5. Menu filtré selon rôle
```

## ✅ Checklist de Test

### Admin (admin@gobeyondfit.com / admin123)
- [ ] Voir tous les menus (Dashboard, Exercises, Groups, Programs)
- [ ] Voir le rôle "admin" dans la sidebar
- [ ] Accès complet à toutes les pages

### Coach (coach@gmail.com / password)
- [ ] Voir: Dashboard, Exercises, Groups, Programs
- [ ] Pas de section "User Management" (admin only)
- [ ] Voir le rôle "coach" dans la sidebar
- [ ] Pouvoir créer exercises, groups, programs

### Student (bibi@gmail.com / password)
- [ ] Voir: Dashboard, Groups
- [ ] NE PAS voir: Exercises, Programs
- [ ] Voir le rôle "student" dans la sidebar
- [ ] Section "What's Next?" pour rejoindre des groupes
- [ ] Stats personnalisées (My Groups, Pending Invitations, etc)

## 🚀 Prochaines Étapes

1. **Route Guards**
   - Créer middleware pour vérifier les rôles
   - Rediriger les students qui accèdent aux routes interdites

2. **Pages Spécifiques**
   - Mettre à jour exercises/page.tsx pour students
   - Mettre à jour programs/page.tsx pour students

3. **API-Level Checks**
   - Backend vérifie déjà les rôles
   - Frontend doit afficher des erreurs appropriées

## 📝 Notes

- Les rôles sont chargés depuis localStorage au rendu du sidebar
- Le localStorage persiste entre les sessions
- La déconnexion supprime le rôle de localStorage
- `useEffect` charge le rôle côté client (SSR safe)

---

*Implémenté: 29 Novembre 2025*
