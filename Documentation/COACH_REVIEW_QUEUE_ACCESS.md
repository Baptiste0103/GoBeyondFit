# 📋 Coach Review Queue - Guide d'Accès

**Feature:** Coach Review Queue (Task 1 - Feedback Loop)  
**Status:** ✅ Production Ready  
**Version:** 1.0  
**Date:** 2025-12-14

---

## 🎯 Qu'est-ce que la Review Queue ?

La **Review Queue** est l'interface centrale permettant aux coachs de :
- Visualiser toutes les séances complétées par leurs élèves en attente de feedback
- Comparer le **Planned vs Actual** pour chaque exercice
- Visionner les **vidéos** uploadées par les athlètes
- Rédiger un **feedback structuré** (global + par exercice)
- Marquer les séances comme **reviewed**

Cette fonctionnalité est au cœur du feedback loop GoBeyondFit (PRD Section 4.3).

---

## 🚀 Comment Accéder à la Review Queue (4 Options)

### Option 1: Via la Sidebar Navigation (Recommandé)

1. **Connectez-vous** en tant que coach
2. Dans la **sidebar gauche**, cliquez sur :
   ```
   📋 Review Queue (badge "New")
   ```
3. Vous arrivez directement sur `/dashboard/review-queue`

**Visuel:**
```
┌─────────────────────┐
│ 🏠 Dashboard        │
│ 📋 Review Queue 🆕  │ ← Cliquer ici
│ 💪 Exercises        │
│ 📖 Programs         │
│ ▶️  Workouts        │
└─────────────────────┘
```

**Remarque:** Cette option n'est visible **que pour les coachs** (filtre role-based).

---

### Option 2: Via le Dashboard Coach (Card KPI)

1. Allez sur `/dashboard`
2. En haut de la page, vous voyez **4 cards KPI**
3. La **première card** affiche :
   ```
   Pending Reviews
   [Nombre] sessions
   → View Queue
   ```
4. Cliquez sur **"View Queue"**

**Visuel:**
```
┌──────────────────────┐  ┌──────────────────────┐
│ Pending Reviews      │  │ Total Exercises      │
│ 0 sessions           │  │ 0                    │
│ → View Queue         │  └──────────────────────┘
└──────────────────────┘
   ↑ Cliquer ici
```

---

### Option 3: Via le Dashboard Coach (Quick Actions)

1. Allez sur `/dashboard`
2. Scrollez jusqu'à la section **"Coach Actions"** (fond bleu)
3. Cliquez sur le bouton **orange** :
   ```
   📋 Review Queue
   ```

**Visuel:**
```
┌────────────────────────────────────────┐
│ 🚀 Coach Actions                       │
│                                        │
│ [📋 Review Queue] [Create Program]    │
│ [Exercise Library] [Manage Students]  │
│    ↑ Cliquer ici (bouton orange)      │
└────────────────────────────────────────┘
```

---

### Option 4: URL Directe

Si vous connaissez l'URL, tapez directement :
```
https://[votre-domaine]/dashboard/review-queue
```

**Protection:** Cette route est protégée par :
- JwtAuthGuard (nécessite token valide)
- RolesGuard (nécessite role = `coach`)

Si un élève essaie d'y accéder → **403 Forbidden**

---

## 📱 Interface Review Queue - Overview

### Vue Principale (Liste des Séances)

```
┌──────────────────────────────────────────────────────────────┐
│ 📋 Coach Review Queue                            [Refresh]   │
├──────────────────────────────────────────────────────────────┤
│ Tabs: [All] [Pending] [Reviewed]                            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ 👤 John Doe                                                  │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ Session: Upper Body Strength                          │  │
│ │ Program: Powerlifting Prep 2025                       │  │
│ │ Completed: 2 hours ago                                │  │
│ │ Status: [Pending]  Has videos: ✅                     │  │
│ │                                      [Review Session] │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ 👤 Jane Smith                                                │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ Session: Lower Body Hypertrophy                       │  │
│ │ Program: General Strength Q1                          │  │
│ │ Completed: 5 hours ago                                │  │
│ │ Status: [Pending]  Has videos: ❌                     │  │
│ │                                      [Review Session] │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Modal de Review (Détail Séance)

Quand vous cliquez sur **"Review Session"** :

```
┌──────────────────────────────────────────────────────────────┐
│ 🎯 Review Session: Upper Body Strength              [Close] │
├──────────────────────────────────────────────────────────────┤
│ Tabs: [Overview] [Exercises] [Videos]                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ 📊 Overview Tab                                              │
│ • Student: John Doe                                          │
│ • Program: Powerlifting Prep 2025                            │
│ • Completed: Dec 14, 2025 14:30                              │
│ • RPE Global: 8/10                                           │
│ • Notes: "Felt strong on bench, struggled on OHP"            │
│                                                              │
│ 💪 Exercises Tab                                             │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ Exercise 1: Bench Press                               │  │
│ │ Planned: 4x5 @ 100kg                                  │  │
│ │ Actual:  4x5 @ 102.5kg ✅ (+2.5kg)                    │  │
│ │ RPE: 8                                                │  │
│ │ Coach Feedback: [Optional text area]                  │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ 🎥 Videos Tab                                                │
│ • Video 1: Bench Press Top Set (0:45)                        │
│ • Video 2: Overhead Press Fail (0:30)                        │
│                                                              │
│ 📝 Global Feedback (Required)                                │
│ [Text area: "Great work on bench! Let's reduce OHP..."]     │
│                                                              │
│                      [Cancel] [Submit Review]                │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔐 Sécurité & Permissions

### Protection Backend (API)

Tous les endpoints Review Queue sont protégés :

```typescript
// Endpoint: GET /workouts/review-queue
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('coach')
async getReviewQueue(@CurrentUser() user) {
  // Filtrage automatique par coachId
  return this.service.getReviewQueue(user.id);
}
```

**Garanties:**
- ✅ Seul un coach peut accéder à la Review Queue
- ✅ Un coach ne voit **que** les séances de **ses propres élèves**
- ✅ Multi-tenancy strict : aucune fuite de données inter-coach
- ✅ Ownership check sur chaque action (review, update status)

### Protection Frontend (UI)

```typescript
// Sidebar: Affichage conditionnel
...(user?.role === 'coach' ? [{
  label: 'Review Queue',
  href: '/dashboard/review-queue',
}] : []),
```

**Comportement:**
- **Coach/Admin** → Voit l'option "Review Queue"
- **Student** → Option cachée (ne voit même pas le lien)

---

## 📊 Données Affichées

### Groupement Par Élève

Les séances sont **groupées par élève** pour optimiser le workflow coach :

```json
{
  "data": [
    {
      "student": {
        "id": "uuid-1",
        "pseudo": "John Doe",
        "email": "john@example.com"
      },
      "sessions": [
        {
          "id": "session-uuid-1",
          "sessionTitle": "Upper Body Strength",
          "programTitle": "Powerlifting Prep 2025",
          "completedAt": "2025-12-14T14:30:00Z",
          "reviewStatus": "pending",
          "hasVideos": true
        }
      ]
    }
  ]
}
```

**Avantages:**
- Le coach voit tous ses élèves avec séances pending d'un coup d'œil
- Peut traiter séance par séance pour un élève
- Facilite le suivi longitudinal

### Tri & Filtres (MVP)

**Tri actuel:**
- Par date de complétion (plus récent en premier)

**Filtres disponibles (Tabs):**
- **All:** Toutes les séances
- **Pending:** Seulement les séances en attente de review
- **Reviewed:** Séances déjà reviewées

**Future:** Filtres avancés (élève spécifique, programme, date range).

---

## 🎨 Composants UI Utilisés

La Review Queue utilise les composants shadcn/ui suivants :

```typescript
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
```

**Style:**
- Design inspiré **Linear** : dense, rapide, clair
- Loading states avec Skeleton
- Badges de status colorés (pending = orange, reviewed = green)
- Refresh auto toutes les 30s (TanStack Query)

---

## 🔄 Workflow Complet (End-to-End)

### Phase A: Élève Complète Séance

1. Élève se connecte → `/dashboard/workouts`
2. Sélectionne la séance du jour
3. Renseigne les champs Actual (sets, reps, load, RPE)
4. Upload 0–N vidéos
5. Ajoute une note globale
6. Clique sur **"Terminer la séance"**

**Effets système:**
- Création `SessionProgress` avec status `completed`
- `reviewStatus` → `pending` (par défaut)
- Création d'une **Notification** pour le coach

---

### Phase B: Coach Review (Cette Interface)

1. Coach reçoit notification ou visite `/dashboard/review-queue`
2. Voit la séance listée dans la queue (groupée par élève)
3. Clique sur **"Review Session"**
4. Modal s'ouvre avec 3 tabs (Overview, Exercises, Videos)
5. Compare Planned vs Actual pour chaque exercice
6. Visionne les vidéos si présentes
7. Rédige :
   - **Feedback global** (obligatoire)
   - Feedbacks par exercice (optionnel)
8. Clique sur **"Submit Review"**

**Effets système:**
- Update `SessionProgress` :
  - `reviewStatus` → `reviewed`
  - `reviewedAt` → timestamp actuel
  - `reviewedBy` → coachId
  - `coachFeedback` → JSON structuré
- Création d'une **Notification** pour l'élève
- Suppression de la séance de la Review Queue

---

### Phase C: Élève Consulte Feedback

1. Élève reçoit notification "Coach reviewed your session"
2. Clique sur notification → redirigé vers `/dashboard/workouts/[id]`
3. Voit son feedback :
   - Feedback global en haut
   - Feedbacks par exercice si présents
4. Peut répondre (future feature) ou continuer entraînement

---

## 🧪 Tests & Validation

### Tests Backend (13/13 PASS)

**Unit Tests (12):**
- `workout-runner-review.service.spec.ts`
- Couverture: getReviewQueue, getSessionReviewDetail, submitReview, updateReviewStatus

**E2E Tests (7):**
- `security-multi-tenancy.e2e-spec.ts`
- Scénarios critiques :
  - Coach A ne voit pas les séances de Coach B
  - Coach A ne peut pas review les séances de Coach B
  - Students ne peuvent pas accéder aux endpoints coach

### Tests Manuels Recommandés

1. **Test Coach Login:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"coach@test.com","password":"password"}'
   ```

2. **Test Review Queue Access:**
   ```bash
   curl http://localhost:3000/api/workouts/review-queue \
     -H "Authorization: Bearer [TOKEN]"
   ```

3. **Test Submit Review:**
   ```bash
   curl -X POST http://localhost:3000/api/workouts/sessions/[ID]/review \
     -H "Authorization: Bearer [TOKEN]" \
     -H "Content-Type: application/json" \
     -d '{
       "globalFeedback": "Great work!",
       "exerciseFeedbacks": []
     }'
   ```

---

## 🐛 Troubleshooting

### Problème: "Review Queue est vide"

**Causes possibles:**
1. Aucune séance complétée par vos élèves
2. Toutes les séances sont déjà reviewées
3. Problème de filtrage coachId

**Diagnostic:**
```sql
-- Vérifier les séances pending pour vos élèves
SELECT sp.id, sp."sessionId", sp."studentId", sp.status, sp."reviewStatus"
FROM session_progress sp
JOIN users u ON u.id = sp."studentId"
WHERE u."coachId" = '[YOUR_COACH_ID]'
  AND sp.status = 'completed'
  AND sp."reviewStatus" = 'pending';
```

---

### Problème: "403 Forbidden"

**Cause:** Vous n'avez pas le rôle coach ou votre token est expiré.

**Solution:**
1. Vérifier votre rôle : `SELECT role FROM users WHERE email = '[VOTRE_EMAIL]';`
2. Re-login pour obtenir un nouveau token
3. Vérifier JWT expiration (défaut: 3600s = 1h)

---

### Problème: "Cannot find module @radix-ui/react-tabs"

**Cause:** Dépendances frontend manquantes.

**Solution:**
```bash
cd frontend
npm install @radix-ui/react-tabs @radix-ui/react-dialog @radix-ui/react-label
```

---

## 📚 Références

**Fichiers Clés:**
- Backend API: `backend/src/workouts/workout-runner.controller.ts`
- Backend Service: `backend/src/workouts/workout-runner.service.ts`
- Frontend Page: `frontend/app/dashboard/review-queue/page.tsx`
- Frontend Modal: `frontend/components/review-session-modal.tsx`

**Documentation:**
- PRD Section 4.3: Feedback Loop
- [Session Report](../roadmap/sessions/2025-12-14-session-finale-coach-review-queue.md)
- [Agent 07 Session Manager](../.copilot/agents/07-session-manager-agent.md)

**Tests:**
- `backend/src/workouts/workout-runner-review.service.spec.ts`
- `backend/test/security-multi-tenancy.e2e-spec.ts`

---

**Version:** 1.0  
**Dernière Mise à Jour:** 2025-12-14  
**Contributeurs:** Agent 05 (API), Agent 06 (Database), Agent 11 (Frontend), Agent 01 (Security), Agent 02 (Testing)
