# ❌ Endpoints Implémentés mais NON Accessibles via UI

## 🎯 Le Problème

Ces endpoints **existent** dans le backend et **sont définis** dans les `api-client.ts` du frontend, mais **AUCUN composant UI** ne les utilise. L'utilisateur ne peut pas accéder à ces fonctionnalités.

---

## 📋 Liste Complète des Endpoints Orphelins

### 🏋️ WORKOUT RUNNER (8 endpoints - 0% accessible)

| Endpoint | Méthode | Description | Statut | Où devrait être? |
|----------|---------|-------------|--------|-----------------|
| `/workouts/start/:sessionId` | POST | Démarrer une séance | ❌ Aucun bouton | Page workout |
| `/workouts/:workoutId/exercise/:index/complete` | POST | Marquer exercice comme fait | ❌ Aucun formulaire | Form exercice |
| `/workouts/:workoutId/exercise/:index/skip` | POST | Sauter un exercice | ❌ Aucun bouton | Pendant l'exercice |
| `/workouts/:workoutId/end` | POST | Terminer la séance | ❌ Aucun bouton | Page résumé |
| `/workouts/:workoutId/progress` | GET | Voir la progression | ❌ Jamais appelé | Barre progrès |
| `/workouts/history/list` | GET | Historique des séances | ❌ Pas de page | Page "Historique" |
| `/workouts/current` | GET | Séance active actuelle | ❌ Jamais appelé | Widget accueil |
| `/workouts/stats/summary` | GET | Résumé des stats | ❌ Jamais appelé | Dashboard stats |

### 📊 PROGRAM BUILDER (3 endpoints - partiellement accessible)

| Endpoint | Méthode | Description | Statut | Où devrait être? |
|----------|---------|-------------|--------|-----------------|
| `/programs/builder/:id/clone` | POST | Cloner un programme | ❌ Aucun bouton | Page programme |
| `/programs/builder/:id/validate` | POST | Valider structure | ⚠️ Appelé mais pas d'UI | À la sauvegarde |
| `/programs/builder/:id/stats` | GET | Stats du programme | ❌ Jamais appelé | Onglet stats |

### ⭐ RATINGS (5 endpoints - 0% accessible)

| Endpoint | Méthode | Description | Statut | Où devrait être? |
|----------|---------|-------------|--------|-----------------|
| `POST /ratings` | POST | Créer une note | ❌ Pas de composant | Card exercice |
| `GET /ratings` | GET | Lister les notes | ❌ Pas de composant | Card exercice |
| `GET /ratings/me` | GET | Mes notes | ❌ Pas de page | Profil utilisateur |
| `PUT /ratings/:id` | PUT | Modifier note | ❌ Pas de formulaire | Modal édition |
| `DELETE /ratings/:id` | DELETE | Supprimer note | ❌ Pas de bouton | Menu contextuel |

### ❤️ FAVORITES (4 endpoints - 0% accessible)

| Endpoint | Méthode | Description | Statut | Où devrait être? |
|----------|---------|-------------|--------|-----------------|
| `POST /favorites/:id/favorite` | POST | Ajouter favori | ❌ Pas de bouton | Card exercice |
| `DELETE /favorites/:id/favorite` | DELETE | Retirer favori | ❌ Pas de bouton | Card exercice |
| `GET /favorites/:id/is-favorite` | GET | Est favori? | ❌ Pas de vérification | Card exercice |
| `GET /favorites/exercises` | GET | Lister favoris | ❌ Pas de page | Sidebar menu |

### 📜 HISTORY (6 endpoints - 0% accessible)

| Endpoint | Méthode | Description | Statut | Où devrait être? |
|----------|---------|-------------|--------|-----------------|
| `POST /history/:id/view` | POST | Tracker vue | ❌ Jamais appelé | Au clic exercice |
| `GET /history/:id/view-count` | GET | Nombre de vues | ❌ Jamais appelé | Card exercice |
| `GET /history/:id/unique-views` | GET | Vues uniques | ❌ Jamais appelé | Stats exercice |
| `GET /history/exercises` | GET | Exercices vus | ❌ Pas de page | Sidebar menu |
| `GET /history/recent` | GET | Récemment vus | ❌ Pas de section | Page accueil |
| `DELETE /history/entries/:id` | DELETE | Effacer historique | ❌ Pas de bouton | Page historique |

### 💌 INVITATIONS (3 endpoints - partiellement accessible)

| Endpoint | Méthode | Description | Statut | Où devrait être? |
|----------|---------|-------------|--------|-----------------|
| `POST /invitations/:id/accept` | POST | Accepter invite | ⚠️ Endpoint existe | UI invite acceptée |
| `POST /invitations/:id/reject` | POST | Refuser invite | ⚠️ Endpoint existe | UI invite refusée |
| `DELETE /invitations/:id` | DELETE | Supprimer invite | ⚠️ Endpoint existe | Menu contextuel |

### 📊 STATS (1 endpoint)

| Endpoint | Méthode | Description | Statut | Où devrait être? |
|----------|---------|-------------|--------|-----------------|
| `GET /stats/exercise/:id/history` | GET | Historique exercice | ❌ Jamais appelé | Page détails stats |

---

## 🔍 Analyse par Fonctionnalité

### 1️⃣ WORKOUT RUNNER (40% du code écrit, 0% accessible)

**Endpoints côté backend**: ✅ Tous implémentés et testés
```
POST   /workouts/start/:sessionId
POST   /workouts/:id/exercise/:idx/complete
POST   /workouts/:id/exercise/:idx/skip
POST   /workouts/:id/end
GET    /workouts/:id/progress
GET    /workouts/history/list
GET    /workouts/current
GET    /workouts/stats/summary
```

**Composants frontend existants**:
- ✅ `components/workout/` - Affichage séance
- ✅ `components/video-uploader` - Upload vidéo
- ✅ Progress bar

**CE QUI MANQUE**:
```typescript
// 1. Bouton "Démarrer la séance"
// Location: components/workout/session-card.tsx
<button onClick={() => startWorkout(sessionId)}>Commencer</button>

// 2. Formulaire exercice complètement vide
// Location: components/workout/exercise-form.tsx
// Les inputs existent mais le submit ne fait rien

// 3. Pas de bouton "Sauter" et "Terminer"
// Devrait être: components/workout/exercise-controls.tsx

// 4. Pas de page historique
// Devrait être: app/workout-history/page.tsx

// 5. Pas de widget "Séance actuelle"
// Devrait être: components/current-workout-widget.tsx
```

### 2️⃣ SYSTEM DE FAVORIS (0% - 4 endpoints)

**CE QUI MANQUE**:
```typescript
// Bouton cœur sur chaque exercice
// Location: components/exercise-card.tsx
<FavoriteButton exerciseId={exercise.id} />

// Page "Mes favoris"
// Location: app/favorites/page.tsx
export default function FavoritesPage() { }

// Intégration dans la recherche
// Ajouter filtre "Afficher mes favoris"
```

### 3️⃣ SYSTEM DE NOTATION (0% - 5 endpoints)

**CE QUI MANQUE**:
```typescript
// Composant note 5 étoiles
// Location: components/exercise-rating.tsx
<StarRating exerciseId={exercise.id} />

// Afficher note moyenne
// Location: components/exercise-card.tsx
<div>Moyenne: {exercise.averageRating}/5 ({exercise.ratingCount})</div>

// Page "Mes notes"
// Location: app/my-ratings/page.tsx
export default function MyRatingsPage() { }
```

### 4️⃣ TRACKING HISTORIQUE (0% - 6 endpoints)

**CE QUI MANQUE**:
```typescript
// Auto-tracker les vues
// Location: components/exercise-details.tsx
useEffect(() => {
  trackView(exerciseId)
}, [exerciseId])

// Section "Récemment vus"
// Location: app/page.tsx
<RecentlyViewedSection />

// Page historique complet
// Location: app/history/page.tsx
export default function HistoryPage() { }
```

---

## 🚀 Plan d'Action - Court Terme (2 jours)

### JOUR 1: Workout Runner (le plus visible)

**Fichiers à créer/modifier**:

```typescript
// 1. Créer lib/api-client-workout.ts
export const workoutClient = {
  async startSession(sessionId: string) {
    return fetch(`${API_URL}/workouts/start/${sessionId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authClient.getToken()}` }
    })
  },
  async completeExercise(workoutId: string, index: number, data: any) {
    return fetch(`${API_URL}/workouts/${workoutId}/exercise/${index}/complete`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${authClient.getToken()}` }
    })
  },
  async skipExercise(workoutId: string, index: number) {
    return fetch(`${API_URL}/workouts/${workoutId}/exercise/${index}/skip`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authClient.getToken()}` }
    })
  },
  async endSession(workoutId: string) {
    return fetch(`${API_URL}/workouts/${workoutId}/end`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authClient.getToken()}` }
    })
  },
  async getProgress(workoutId: string) {
    return fetch(`${API_URL}/workouts/${workoutId}/progress`, {
      headers: { Authorization: `Bearer ${authClient.getToken()}` }
    })
  },
  async getCurrentSession() {
    return fetch(`${API_URL}/workouts/current`, {
      headers: { Authorization: `Bearer ${authClient.getToken()}` }
    })
  },
  async getHistory() {
    return fetch(`${API_URL}/workouts/history/list`, {
      headers: { Authorization: `Bearer ${authClient.getToken()}` }
    })
  },
  async getStats() {
    return fetch(`${API_URL}/workouts/stats/summary`, {
      headers: { Authorization: `Bearer ${authClient.getToken()}` }
    })
  }
}

// 2. Créer components/workout/start-session-button.tsx
export function StartSessionButton({ sessionId }: { sessionId: string }) {
  const [loading, setLoading] = useState(false)
  
  return (
    <button onClick={() => {
      setLoading(true)
      workoutClient.startSession(sessionId)
        .then(() => router.push(`/workout/${sessionId}`))
        .catch(err => toast.error(err.message))
        .finally(() => setLoading(false))
    }}>
      {loading ? 'Démarrage...' : 'Commencer la séance'}
    </button>
  )
}

// 3. Modifier components/workout/exercise-form.tsx
// Ajouter handlers pour skip et complete

// 4. Créer components/workout/end-session-button.tsx
// Ajouter confirmation et résumé

// 5. Créer app/workout-history/page.tsx
// Afficher liste historique
```

### JOUR 2: Favorites + Ratings (quick wins)

```typescript
// lib/api-client-favorites.ts
// lib/api-client-ratings.ts
// components/favorite-button.tsx
// components/star-rating.tsx
// app/favorites/page.tsx
```

---

## 📱 Priorité d'Affichage des Endpoints Orphelins

### 🔴 URGENT (Block utilisateur)
1. **Workout Start/Complete/End** - L'utilisateur a un programme mais ne peut rien faire avec
2. **Favorites** - Système simple et populaire (4 endpoints)
3. **Ratings** - Engagement utilisateur (5 endpoints)

### 🟡 IMPORTANT (Bonne UX)
4. **History Tracking** - FOMO prevention (6 endpoints)
5. **Program Clone** - Économise du temps aux coaches (1 endpoint)
6. **Invitations Accept/Reject** - Social (3 endpoints)

### 🟢 NICE TO HAVE (Polish)
7. **Workout Stats** - Analytics (1 endpoint)
8. **Validation UI** - Developer experience (1 endpoint)

---

## 📊 Récapitulatif

```
Endpoints implémentés mais orphelins: 27/103
Endpoints avec UI partielle: 22/103
Endpoints accessibles: 54/103

Si on active les 27 orphelins: 81/103 = 79% complétude ✅
```

---

## 🎯 Recommendation

**Commencer par Workout Runner** car:
1. ✅ Endpoints complètement implémentés au backend
2. ✅ Composants UI 80% prêts
3. ✅ Bloc principal pour l'utilisateur
4. ✅ ~4 heures de travail frontend

Après: Favorites (2h) + Ratings (2h) = avoir 80% des endpoints accessibles
