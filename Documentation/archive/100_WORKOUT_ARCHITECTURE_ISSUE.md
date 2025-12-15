# 🔴 CRITICAL: Workouts Architecture Mismatch

## Le Problème

Il y a **2 systèmes différents** pour les workouts qui ne se coordonnent pas:

### ❌ Système 1: WorkoutRunnerService (workout-runner.controller.ts)

**Endpoints**: 
```
POST   /workouts/start/:sessionId
POST   /workouts/:workoutId/exercise/:idx/complete
POST   /workouts/:workoutId/end
GET    /workouts/:workoutId/progress
GET    /workouts/current
GET    /workouts/history/list
GET    /workouts/stats/summary
```

**Problème**:
- Crée un `workoutSession` **DÉTACHÉ** (pas lié à la Session programmée)
- Stocke les exercices dans `sessionData.exercises` (JSON loose)
- Ne sait pas quel **programme** l'étudiant suit
- Ne peut pas valider l'accès étudiant au programme
- Les données de progression ne remontent pas au programme du coach

```typescript
// ❌ Voir workout-runner.service.ts ligne 47
const workout = await this.prisma.workoutSession.create({
  data: {
    userId,
    startedAt: new Date(),
    // ❌ MANQUE: sessionId, programId
    totalExercises,
  },
})
// Résultat: Séance perdue, déconnectée du programme assigné
```

### ✅ Système 2: WorkoutService (workout.controller.ts)

**Endpoints**:
```
GET    /workouts/my-sessions         - Sessions assignées
GET    /workouts/sessions/:id        - Détails session
POST   /workouts/sessions/:id/exercises/:exId/progress  - Sauvegarder
POST   /workouts/sessions/:id/complete - Terminer session
POST   /workouts/progress/:progressId/videos - Upload vidéo
```

**Correct**: 
- Session liée à **Program assigné** (Session → Week → Block → Program)
- Valide l'accès étudiant via `program.assignments`
- Données remontent correctement au coach
- Système de vidéo intégré

**Mais**: Endpoints orphelins - pas d'UI pour démarrer/terminer/sauter

---

## 🎯 LA SOLUTION

Il faut **connecter le système WorkoutRunner au Programme assigné**:

### Phase 1: Fixer WorkoutRunnerService

```typescript
// ✅ workout-runner.service.ts - startWorkout() doit être reécrit

async startWorkout(
  userId: string,
  sessionId: string,  // Session du programme assigné
  config: { restPeriodSeconds?: number; formGuidanceEnabled?: boolean } = {}
) {
  // ✅ 1. Vérifier la session existe ET appartient à l'utilisateur
  const session = await this.prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      week: {
        include: {
          block: {
            include: {
              program: {
                include: {
                  assignments: true,
                }
              }
            }
          }
        }
      },
      exercises: {
        include: {
          exercise: true,
        }
      }
    }
  })

  if (!session) {
    throw new NotFoundException('Session not found')
  }

  // ✅ 2. Vérifier l'étudiant a accès à ce programme
  const program = session.week.block.program
  const hasAccess = program.assignments?.some(a => a.studentId === userId)
  if (!hasAccess) {
    throw new ForbiddenException('Not assigned to this program')
  }

  // ✅ 3. Créer workout LIÉ à la session et programme
  const workout = await this.prisma.workoutSession.create({
    data: {
      userId,
      sessionId,           // ✅ LIER à la session
      programId,           // ✅ LIER au programme
      startedAt: new Date(),
      totalExercises: session.exercises.length,
      restPeriodSeconds: config.restPeriodSeconds || 60,
      formGuidanceEnabled: config.formGuidanceEnabled ?? true,
    },
  })

  return {
    workoutId: workout.id,
    sessionId,
    programId,
    totalExercises: session.exercises.length,
    exercises: session.exercises.map(se => ({
      id: se.id,
      exerciseId: se.exerciseId,
      name: se.exercise.name,
      position: se.position,
      sets: se.sets,
      reps: se.reps,
      weight: se.weight,
    })),
    restPeriod: workout.restPeriodSeconds,
    formGuidance: workout.formGuidanceEnabled,
    startedAt: workout.startedAt,
  }
}
```

### Phase 2: Fixer le Schema Prisma

**Actuellement**: WorkoutSession n'a PAS `sessionId` ni `programId`

```prisma
// ❌ AVANT (prisma/schema.prisma)
model WorkoutSession {
  id                  String    @id @default(cuid())
  userId              String
  startedAt           DateTime?
  endedAt             DateTime?
  // ❌ MANQUE: sessionId, programId
}

// ✅ APRÈS
model WorkoutSession {
  id                  String    @id @default(cuid())
  userId              String
  sessionId           String?           // ✅ LIER à session du programme
  programId           String?           // ✅ LIER au programme assigné
  startedAt           DateTime?
  endedAt             DateTime?
  
  // Relations
  session             Session?          @relation(fields: [sessionId], references: [id])
  program             Program?          @relation(fields: [programId], references: [id])
  user                User              @relation(fields: [userId], references: [id])
  
  @@index([userId])
  @@index([sessionId])
  @@index([programId])
}
```

### Phase 3: Migration Prisma

```bash
cd backend
npx prisma migrate dev --name add_session_program_to_workout
```

### Phase 4: Fixer completeExercise et endWorkout

```typescript
// ✅ completeExercise - sauvegarder aussi dans session-progress
async completeExercise(userId: string, workoutId: string, exerciseIndex: number, data: {...}) {
  const workout = await this.prisma.workoutSession.findUnique({
    where: { id: workoutId },
    include: {
      session: {
        include: {
          exercises: true,
        }
      }
    }
  })
  
  if (!workout.session) {
    throw new BadRequestException('Session not linked to workout')
  }

  const sessionExercise = workout.session.exercises[exerciseIndex]
  
  // ✅ Sauvegarder dans SessionProgress (pour le coach)
  await this.prisma.sessionProgress.create({
    data: {
      sessionId: workout.sessionId,
      exerciseInstanceId: sessionExercise.id,
      studentId: userId,
      progress: data,
      savedAt: new Date(),
    }
  })
  
  // Log exercise (existing)
  await this.prisma.exerciseLog.create({
    data: {
      sessionId: workoutId,
      exerciseId: sessionExercise.exerciseId,
      userId,
      setsCompleted: data.setsCompleted,
      weight: data.weight,
      duration: data.duration,
      notes: data.notes,
      formRating: data.formRating,
      completedAt: new Date(),
    },
  })
  
  // Update progress
  const updated = await this.prisma.workoutSession.update({
    where: { id: workoutId },
    data: { exercisesCompleted: (workout.exercisesCompleted || 0) + 1 },
  })

  return {
    exerciseLogId: exerciseLog.id,
    progress: {
      completed: updated.exercisesCompleted,
      total: updated.totalExercises,
      percentage: Math.round((updated.exercisesCompleted / updated.totalExercises) * 100),
    },
  }
}
```

### Phase 5: Unifier les Endpoints

**GARDER les 2 systèmes mais les connecter**:

```
GET    /workouts/my-sessions         ← Lister sessions assignées (du WorkoutService)
POST   /workouts/start/:sessionId    ← Démarrer (WorkoutRunnerService réparé)
POST   /workouts/:id/exercise/:idx/complete ← Exercice (synchronisé)
POST   /workouts/:id/end             ← Terminer (synchronisé)
GET    /workouts/current             ← Session active
GET    /workouts/history             ← Historique
```

---

## ✅ Après la Correction

**Flow étudiant**:
1. Voit liste de ses programmes assignés ← `GET /programs/my-assignments`
2. Ouvre un programme → Voit sessions ← `GET /workouts/my-sessions`
3. Clique "Commencer" → Lance une session ← `POST /workouts/start/:sessionId`
4. Exécute exercices → Sauvegarde progrès ← `POST /workouts/:id/exercise/:idx/complete`
5. Termine séance → Remonte au coach ← `POST /workouts/:id/end`

**Flow coach**:
1. Voit programme → Voit liste étudiants assignés
2. Pour chaque étudiant → Voit leurs `SessionProgress` 
3. Voit leurs vidéos, leurs poids, leurs notes

---

## 📋 Checklist de Correction

- [ ] Ajouter `sessionId` et `programId` au schema WorkoutSession
- [ ] Générer migration Prisma
- [ ] Réécrire `startWorkout()` pour lier à Session/Program
- [ ] Modifier `completeExercise()` pour sauvegarder dans SessionProgress
- [ ] Modifier `endWorkout()` pour marquer session comme complète
- [ ] Tests backend: vérifier les permissions
- [ ] Tests E2E: vérifier le flow complet
- [ ] UI Frontend: créer le bouton "Commencer"
- [ ] UI Frontend: créer le formulaire exercice
- [ ] UI Frontend: créer le bouton "Terminer"

---

## 💡 Pourquoi c'est Important

**Sans cette correction**:
- ❌ Coach ne voit pas qui a fait quel exercice
- ❌ Coach ne peut pas suivre la progression réelle
- ❌ Données orphelines dans WorkoutSession
- ❌ Impossible de valider l'accès (anyone can start any session)

**Après correction**:
- ✅ Données cohérentes (Program → Session → SessionProgress → StudentWorkout)
- ✅ Coach voit toute la progression
- ✅ Sécurité: seul l'étudiant assigné peut accéder
- ✅ Historique complet et traçable
