# ✅ SOLUTION: Workouts dans l'Onglet Programme

## Architecture Correcte

L'étudiant accède à tout depuis **"Mes Programmes"**:

```
Dashboard
├── Mes Programmes (page my-programs)
│   ├── Liste programmes assignés
│   └── Clic sur programme → MODAL
│       ├── Onglet "Vue d'ensemble" (blocs/semaines/sessions)
│       ├── Onglet "Mes Séances" (avec boutons "Commencer")
│       └── Onglet "Statistiques" (progression)
```

---

## 🎯 Plan d'Implémentation (3 fichiers)

### 1. Créer: `components/program-workout-interface.tsx`

**Responsabilités**:
- Afficher les sessions du programme assigné
- Pour chaque session: afficher liste exercices
- Bouton "Commencer" qui lance le workout
- Interface d'exécution d'exercices
- Bouton "Sauter", "Terminer"
- Upload vidéo pour chaque exercice
- Progress bar

```typescript
// Structure
export function ProgramWorkoutInterface({ 
  programId: string, 
  sessionId: string,
  onStartWorkout: (workoutId: string) => void 
}) {
  // États
  - [activeTab, setActiveTab] = useState('overview' | 'sessions' | 'stats')
  - [currentWorkoutId, setCurrentWorkoutId] = useState(null)
  - [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  - [session, setSession] = useState<Session>()
  - [loading, setLoading] = useState(false)
  
  // Tabs
  ├── "Vue d'ensemble" (existing block structure display)
  ├── "Mes Séances" (list sessions with Start button)
  │   └── Si en cours de workout:
  │       ├── Exercise card (current exercise)
  │       ├── Form (sets, reps, weight, notes)
  │       ├── Video uploader
  │       └── Buttons (Skip, Complete, Next)
  └── "Statistiques"
      ├── Programme completion %
      ├── Exercices complétés
      └── Dernière session
}
```

### 2. Modifier: `components/program-detail-modal.tsx`

```typescript
// Ajouter les onglets et utiliser ProgramWorkoutInterface
<div className="flex gap-4 border-b">
  <button 
    onClick={() => setTab('overview')}
    className={tab === 'overview' ? 'border-b-2 border-blue-600' : ''}
  >
    Vue d'ensemble
  </button>
  <button 
    onClick={() => setTab('sessions')}
    className={tab === 'sessions' ? 'border-b-2 border-blue-600' : ''}
  >
    Mes Séances
  </button>
  <button 
    onClick={() => setTab('stats')}
    className={tab === 'stats' ? 'border-b-2 border-blue-600' : ''}
  >
    Statistiques
  </button>
</div>

{tab === 'overview' && </* existing view */}
{tab === 'sessions' && <ProgramWorkoutInterface {...} />}
{tab === 'stats' && </* stats view */}
```

### 3. Ajouter à: `lib/api-client.ts`

**Manquent actuellement**:
```typescript
// Pour démarrer une session du programme
export const workoutClient = {
  async startSession(sessionId: string): Promise<any> {
    const token = authClient.getToken()
    const response = await fetch(`${API_URL}/workouts/start/${sessionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
    if (!response.ok) throw new Error('Failed to start session')
    return response.json()
  },

  async completeExercise(
    workoutId: string,
    exerciseIndex: number,
    data: { sets: number, reps?: number[], weight?: number, notes?: string }
  ): Promise<any> {
    const token = authClient.getToken()
    const response = await fetch(
      `${API_URL}/workouts/${workoutId}/exercise/${exerciseIndex}/complete`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }
    )
    if (!response.ok) throw new Error('Failed to complete exercise')
    return response.json()
  },

  async skipExercise(workoutId: string, exerciseIndex: number, reason?: string): Promise<any> {
    const token = authClient.getToken()
    const response = await fetch(
      `${API_URL}/workouts/${workoutId}/exercise/${exerciseIndex}/skip`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      }
    )
    if (!response.ok) throw new Error('Failed to skip exercise')
    return response.json()
  },

  async endSession(workoutId: string): Promise<any> {
    const token = authClient.getToken()
    const response = await fetch(`${API_URL}/workouts/${workoutId}/end`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
    if (!response.ok) throw new Error('Failed to end session')
    return response.json()
  },

  async getSessionDetails(sessionId: string): Promise<any> {
    const token = authClient.getToken()
    const response = await fetch(`${API_URL}/workouts/sessions/${sessionId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Failed to get session')
    return response.json()
  },
}
```

---

## 📋 Workflow Étudiant (Après Implémentation)

### Scénario: Élève fait une séance

1. **Accueil** → Clique "Mes Programmes"
2. **my-programs page** → Voit liste programmes assignés
   - "Full Body Strength" (assigné le 01/12)
   - "Upper Body Focus" (assigné le 02/12)
3. **Clique programme** → Modal s'ouvre
   - Par défaut, onglet "Vue d'ensemble" (structure blocs/semaines)
4. **Clique onglet "Mes Séances"** → Voir les sessions
   ```
   Semaine 1:
   □ Lundi 01/12 - Chest & Triceps
     - Bench Press
     - Incline Press
     - Tricep Dips
     [Bouton: Commencer]
   
   □ Mercredi 03/12 - Back & Biceps
     - Barbell Rows
     - Pull-ups
     - Bicep Curls
     [Bouton: Commencer]
   ```
5. **Clique "Commencer"** → Interface d'exécution s'affiche dans le modal
   ```
   EXÉCUTION: Chest & Triceps (Jour 1/3 de la semaine)
   ├── Progress: 1/3 exercices complétés (33%)
   ├── Exercice actuel: Bench Press
   ├── ├─ Config: 4 sets x 8 reps @ 100kg
   ├── ├─ Form:
   ├── │  - Sets complétés: [spinner 0-4]
   ├── │  - Reps/set: [input x4]
   ├── │  - Poids utilisé: [input] kg
   ├── │  - Notes: [textarea]
   ├── │  - [Upload vidéo]
   ├── └─ Buttons: [Sauter] [Compléter] [Suivant]
   ```
6. **Après Bench Press**:
   - Clique "Compléter" → Sauvegarde données
   - Progress passe à 2/3
   - Affiche prochain exercice (Incline Press)
7. **Après tous les exercices**:
   - Clique "Terminer séance"
   - Résumé: "✅ 3/3 exercices complétés"
   - Option: "Ajouter des notes à la séance"
   - Bouton "Fermer" → Retour onglet overview
8. **Onglet "Statistiques"**:
   - "Full Body Strength: 35% complété"
   - "Dernière séance: Aujourd'hui 14h30"
   - "Exercices complétés: 18/48"

---

## 🔧 Implémentation Détaillée: ProgramWorkoutInterface

```typescript
'use client'

import { useState, useEffect } from 'react'
import { ChevronRight, Play, SkipForward, CheckCircle } from 'lucide-react'
import { workoutClient, sessionProgressClient, programClient } from '@/lib/api-client'
import { VideoUploader } from './video-uploader'

interface ProgramWorkoutInterfaceProps {
  programId: string
  assignment: any
  onClose: () => void
}

export function ProgramWorkoutInterface({ 
  programId, 
  assignment,
  onClose 
}: ProgramWorkoutInterfaceProps) {
  const [tab, setTab] = useState<'overview' | 'sessions' | 'stats'>('overview')
  
  // Workout execution state
  const [currentWorkoutId, setCurrentWorkoutId] = useState<string | null>(null)
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [session, setSession] = useState<any>(null)
  const [workoutSession, setWorkoutSession] = useState<any>(null)
  
  // Form data
  const [exerciseData, setExerciseData] = useState({
    sets: 0,
    reps: [] as number[],
    weight: 0,
    notes: '',
  })
  
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<any>(null)

  // 1. Charger les stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await sessionProgressClient.getProgressStats(programId)
        setStats(data)
      } catch (err) {
        console.error('Failed to load stats', err)
      }
    }
    loadStats()
  }, [programId])

  // 2. Démarrer une séance
  const handleStartSession = async (sessionId: string) => {
    try {
      setLoading(true)
      
      // Appeler POST /workouts/start/:sessionId
      const workout = await workoutClient.startSession(sessionId)
      setCurrentWorkoutId(workout.workoutId)
      setWorkoutSession(workout)
      setCurrentExerciseIndex(0)
      
      // Charger les détails de la session
      const sessionDetails = await workoutClient.getSessionDetails(sessionId)
      setSession(sessionDetails)
      
    } catch (err: any) {
      console.error('Failed to start session', err)
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  // 3. Compléter un exercice
  const handleCompleteExercise = async () => {
    if (!currentWorkoutId) return

    try {
      setLoading(true)
      
      // Appeler POST /workouts/:workoutId/exercise/:index/complete
      await workoutClient.completeExercise(currentWorkoutId, currentExerciseIndex, {
        sets: exerciseData.sets,
        reps: exerciseData.reps,
        weight: exerciseData.weight,
        notes: exerciseData.notes,
      })
      
      // Passer à l'exercice suivant
      if (currentExerciseIndex < session.exercises.length - 1) {
        setCurrentExerciseIndex(currentExerciseIndex + 1)
        setExerciseData({ sets: 0, reps: [], weight: 0, notes: '' })
      } else {
        // Dernière exercice, proposer de terminer
        handleEndSession()
      }
      
    } catch (err: any) {
      console.error('Failed to complete exercise', err)
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  // 4. Sauter un exercice
  const handleSkipExercise = async () => {
    if (!currentWorkoutId) return

    try {
      setLoading(true)
      
      // Appeler POST /workouts/:workoutId/exercise/:index/skip
      await workoutClient.skipExercise(
        currentWorkoutId, 
        currentExerciseIndex, 
        'Skipped by user'
      )
      
      // Passer au suivant
      if (currentExerciseIndex < session.exercises.length - 1) {
        setCurrentExerciseIndex(currentExerciseIndex + 1)
        setExerciseData({ sets: 0, reps: [], weight: 0, notes: '' })
      }
      
    } catch (err: any) {
      console.error('Failed to skip exercise', err)
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  // 5. Terminer la séance
  const handleEndSession = async () => {
    if (!currentWorkoutId) return

    try {
      setLoading(true)
      
      // Appeler POST /workouts/:workoutId/end
      await workoutClient.endSession(currentWorkoutId)
      
      // Reset state
      setCurrentWorkoutId(null)
      setSession(null)
      setExerciseData({ sets: 0, reps: [], weight: 0, notes: '' })
      
      // Reload stats
      const data = await sessionProgressClient.getProgressStats(programId)
      setStats(data)
      
      alert('Séance terminée! ✅')
      
    } catch (err: any) {
      console.error('Failed to end session', err)
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  // 6. Render

  if (currentWorkoutId && session) {
    // Mode exécution d'une séance
    const currentExercise = session.exercises[currentExerciseIndex]
    const progress = currentExerciseIndex + 1

    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-bold text-lg">{session.title || 'Session'}</h3>
          <div className="mt-2 bg-white rounded-full h-2 overflow-hidden">
            <div 
              className="bg-blue-600 h-full transition-all"
              style={{ width: `${(progress / session.exercises.length) * 100}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {progress}/{session.exercises.length} exercices
          </p>
        </div>

        {/* Exercice actuel */}
        <div className="bg-white border rounded-lg p-4 space-y-4">
          <h4 className="font-bold text-lg">
            {currentExercise.exercise.name}
          </h4>
          
          {currentExercise.config && (
            <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
              {currentExercise.config.sets && (
                <div>Sets: {currentExercise.config.sets}</div>
              )}
              {currentExercise.config.reps && (
                <div>Reps: {currentExercise.config.reps}</div>
              )}
              {currentExercise.config.weight && (
                <div>Weight: {currentExercise.config.weight}kg</div>
              )}
            </div>
          )}

          {/* Formulaire */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Sets complétés</label>
              <input
                type="number"
                min="0"
                max={currentExercise.config?.sets || 5}
                value={exerciseData.sets}
                onChange={(e) => setExerciseData({ 
                  ...exerciseData, 
                  sets: parseInt(e.target.value) 
                })}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Poids utilisé (kg)</label>
              <input
                type="number"
                step="0.5"
                value={exerciseData.weight}
                onChange={(e) => setExerciseData({ 
                  ...exerciseData, 
                  weight: parseFloat(e.target.value) 
                })}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                value={exerciseData.notes}
                onChange={(e) => setExerciseData({ 
                  ...exerciseData, 
                  notes: e.target.value 
                })}
                placeholder="Vos observations..."
                className="w-full border rounded px-3 py-2 text-sm"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Vidéo</label>
              <VideoUploader 
                onUploadSuccess={(videoId) => {
                  console.log('Video uploaded:', videoId)
                }}
              />
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-2 pt-4 border-t">
            <button
              onClick={handleSkipExercise}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-orange-400 text-orange-600 rounded-lg hover:bg-orange-50 disabled:opacity-50"
            >
              <SkipForward size={16} />
              Sauter
            </button>
            <button
              onClick={handleCompleteExercise}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <CheckCircle size={16} />
              Compléter
            </button>
          </div>

          {/* Bouton terminer si dernière exercice */}
          {currentExerciseIndex === session.exercises.length - 1 && (
            <button
              onClick={handleEndSession}
              disabled={loading}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              Terminer la séance
            </button>
          )}
        </div>
      </div>
    )
  }

  // Mode normal (tabs)
  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-4 border-b">
        {['overview', 'sessions', 'stats'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t as any)}
            className={`pb-2 font-medium transition ${
              tab === t 
                ? 'border-b-2 border-blue-600 text-blue-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t === 'overview' && 'Vue d\'ensemble'}
            {t === 'sessions' && 'Mes Séances'}
            {t === 'stats' && 'Statistiques'}
          </button>
        ))}
      </div>

      {/* TAB: Sessions */}
      {tab === 'sessions' && assignment?.program?.blocks && (
        <div className="space-y-4">
          {assignment.program.blocks.map((block: any) => (
            <div key={block.id}>
              <h3 className="font-bold mb-3">{block.title || `Block ${block.position}`}</h3>
              
              {block.weeks?.map((week: any) => (
                <div key={week.id} className="ml-4 mb-3">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">
                    Week {week.weekNumber}
                  </h4>
                  
                  {week.sessions?.map((session: any) => (
                    <div 
                      key={session.id}
                      className="bg-gray-50 border rounded-lg p-3 mb-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{session.title || `Session ${session.position}`}</p>
                          <p className="text-xs text-gray-600">
                            {session.exercises?.length || 0} exercices
                          </p>
                        </div>
                        <button
                          onClick={() => handleStartSession(session.id)}
                          disabled={loading}
                          className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
                        >
                          <Play size={14} />
                          Commencer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* TAB: Stats */}
      {tab === 'stats' && stats && (
        <div className="space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-600">Progression du programme</p>
            <h3 className="text-2xl font-bold text-blue-600">
              {Math.round((stats.completionRate || 0))}%
            </h3>
            <div className="mt-2 bg-white rounded-full h-2">
              <div 
                className="bg-blue-600 h-full rounded-full"
                style={{ width: `${stats.completionRate || 0}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 border rounded-lg p-3">
              <p className="text-xs text-gray-600">Séances complétées</p>
              <p className="text-xl font-bold">{stats.completedSessions || 0}</p>
            </div>
            <div className="bg-gray-50 border rounded-lg p-3">
              <p className="text-xs text-gray-600">Exercices complétés</p>
              <p className="text-xl font-bold">{stats.completedExercises || 0}</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Overview (existing structure) */}
      {tab === 'overview' && assignment?.program?.blocks && (
        // ... existing block structure display
        <div>Overview tab content (existing display)</div>
      )}
    </div>
  )
}
```

---

## 📝 Checklist d'Implémentation

**Frontend**:
- [ ] Créer `components/program-workout-interface.tsx`
- [ ] Modifier `program-detail-modal.tsx` pour ajouter les onglets
- [ ] Ajouter `workoutClient` à `lib/api-client.ts`
- [ ] Tester le flow complet

**Backend**:
- [ ] Modifier `WorkoutRunnerService.startWorkout()` pour lier à Session/Program
- [ ] Ajouter validation permission
- [ ] Tester avec permissions incorrectes

**Testing**:
- [ ] Coach assigne programme à étudiant
- [ ] Étudiant voit programme, clique dessus
- [ ] Voit onglet "Mes Séances"
- [ ] Clique "Commencer" → Interface d'exécution
- [ ] Complète exercice → Passe au suivant
- [ ] Saute exercice → Fonctionne
- [ ] Termine séance → Données sauvegardées
- [ ] Coach voit progression mise à jour

---

## 🎯 Result

L'étudiant a maintenant une **expérience cohérente**:
- ✅ Voit ses programmes dans "Mes Programmes"
- ✅ Clique pour ouvrir le programme
- ✅ Voit structure (Vue d'ensemble)
- ✅ Voit ses séances à faire (Mes Séances)
- ✅ Peut démarrer et exécuter une séance
- ✅ Peut compléter/sauter exercices
- ✅ Peut uploader vidéos
- ✅ Voit sa progression

**ET le coach**:
- ✅ Voit les programmes qu'il a créés
- ✅ Assigne à des étudiants
- ✅ Voit la progression en temps réel
- ✅ Voit les vidéos uploadées
