# Core Features de GitHub Copilot

## Table des Matières
1. [Interface Chat](#interface-chat)
2. [Copilot Edits](#copilot-edits)
3. [Suggestions Inline](#suggestions-inline)
4. [Actions de Code](#actions-de-code)
5. [Gestion du Contexte](#gestion-du-contexte)
6. [Capacités et Limites](#capacites-et-limites)

---

## Interface Chat (Votre Outil Principal)

### Qu'est-ce que c'est ?
Le chat Copilot est votre assistant de programmation IA qui comprend votre workspace entier.

### Accès
- **Raccourci** : `Ctrl+Shift+I` (Windows) / `Cmd+Shift+I` (Mac)
- **Menu** : Vue → Copilot Chat
- **Icône** : Cliquez sur l'icône Copilot dans la barre latérale

### Capacités Contextuelles

#### 🔍 Comprend Votre Workspace
```
"@workspace explain how authentication works in this project"
```
Copilot analyse **tous vos fichiers** pour comprendre votre architecture.

#### 📁 Références de Fichiers
```
"Using #file:backend/src/auth/auth.service.ts, add refresh token support"
```
Inclut un fichier spécifique dans le contexte.

#### 📝 Références de Sélection
```
# Sélectionnez du code dans l'éditeur, puis:
"Based on #selection, write similar code for the admin controller"
```

#### 📍 Références de Lignes Spécifiques
```
"Review #file:programs.service.ts:45-120 for performance issues"
```

---

### Cas d'Usage Principaux

#### 1. Implémentation de Fonctionnalités
```
"Implement user subscription management with:
- Enum: free, pro, enterprise
- Prisma migration
- Upgrade/downgrade endpoints
- Middleware to check access by tier
- Rate limiting based on subscription
Show step-by-step implementation"
```

#### 2. Refactoring Multi-Fichiers
```
"Refactor the authentication system to use refresh tokens:
- Update User model in schema.prisma
- Modify auth.service.ts
- Update auth.controller.ts  
- Update JWT strategy
- Add refresh token DTOs
Maintain backward compatibility"
```

#### 3. Analyse et Revue
```
"Analyze backend/src for:
1. Code smells and technical debt
2. SOLID principle violations
3. Performance bottlenecks
4. Missing error handling
Provide specific file/line references and fixes"
```

#### 4. Debugging
```
"I'm getting this error when creating a workout:
Error: Cannot read property 'id' of undefined
File: programs.controller.ts line 45
Request payload: { programId: 123, name: 'Test Workout' }

Debug and fix this issue"
```

#### 5. Génération de Tests
```
"Generate comprehensive test suite for backend/src/auth:
- Unit tests for auth.service.ts
- Integration tests for auth.controller.ts
- Mock Prisma client and JWT service
- Test edge cases and error scenarios
- Include setup and teardown"
```

---

## Copilot Edits (Mode Édition Multi-Fichiers)

### 🎯 Qu'est-ce que c'est ?
Mode spécial pour effectuer des modifications coordonnées sur **plusieurs fichiers simultanément**.

### Accès
1. Ouvrez le chat (`Ctrl+Shift+I`)
2. Cliquez sur le bouton **"Edit"** ou **"Open Copilot Edits"**
3. Ou demandez : "Open Copilot Edits to refactor authentication"

### Quand Utiliser Copilot Edits ?

#### ✅ Utilisez pour :
- Refactoring qui touche plusieurs fichiers
- Renommer des symboles dans tout le projet
- Appliquer des patterns de façon cohérente
- Migrations de code importantes
- Réorganisation de structure

#### ❌ N'utilisez PAS pour :
- Modifications dans un seul fichier (utilisez le chat normal)
- Changements simples ou ponctuels
- Explorations ou questions

### Exemple d'Usage

```
[Dans Copilot Edits]

"Refactor to use dependency injection for database connections:

Files to modify:
- backend/src/users/users.service.ts
- backend/src/programs/programs.service.ts
- backend/src/workouts/workouts.service.ts
- backend/src/exercises/exercises.service.ts

Changes:
1. Replace direct PrismaClient imports with DI
2. Add constructor injection
3. Update all methods to use injected client
4. Update test files with proper mocking
5. Ensure consistent pattern across all services"
```

### Workflow Copilot Edits

1. **Demande Initiale** : Décrivez le changement global
2. **Revue** : Copilot montre les fichiers qui seront modifiés
3. **Validation** : Vous approuvez ou ajustez
4. **Édition** : Copilot modifie tous les fichiers
5. **Vérification** : Vous revoyez les changements

---

## Suggestions Inline

### Comment ça Marche ?
Pendant que vous tapez, Copilot suggère du code en temps réel (texte gris).

### Contrôles

| Action | Raccourci Windows/Linux | Raccourci Mac |
|--------|------------------------|---------------|
| Accepter | `Tab` | `Tab` |
| Rejeter | `Esc` | `Esc` |
| Suggestion suivante | `Alt+]` | `Option+]` |
| Suggestion précédente | `Alt+[` | `Option+[` |
| Voir toutes les suggestions | `Ctrl+Enter` | `Cmd+Enter` |

### 💡 Techniques pour de Meilleures Suggestions

#### 1. Commentaires Descriptifs
```typescript
// Function to validate email format according to RFC 5322 standard
// Returns true if valid, false otherwise
```
Copilot génère la fonction complète.

#### 2. Signatures de Fonctions
```typescript
async function sendWelcomeEmail(
  userId: string, 
  email: string
): Promise<void> {
  // Copilot complétera l'implémentation
}
```

#### 3. Patterns de Tests
```typescript
describe('UserService', () => {
  it('should create a new user with valid data', async () => {
    // Copilot génère le test complet
  });
});
```

#### 4. Types TypeScript
```typescript
interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: // Copilot suggère la structure complète
```

### Contexte pour les Suggestions

Copilot utilise :
- **Fichier actuel** : Code au-dessus et en dessous du curseur
- **Fichiers ouverts** : Autres onglets dans l'éditeur
- **Fichiers liés** : Imports et exports
- **Patterns du projet** : Conventions de votre codebase

---

## Actions de Code (Menu Contextuel)

### Accès
**Clic droit** sur du code → Menu **"Copilot"**

### Actions Disponibles

#### 📖 Explain
Explique du code sélectionné en détail.

**Exemple :**
```typescript
// Sélectionnez du code complexe
const result = await prisma.workout.findMany({
  where: { programId },
  include: { exercises: { include: { exercise: true } } }
});

// Clic droit → Copilot → Explain
```

**Résultat :** Explication détaillée de la requête Prisma, relations, et optimisations possibles.

#### 🔧 Fix
Corrige automatiquement les erreurs TypeScript, ESLint, etc.

**Exemple :**
```typescript
// Erreur TypeScript: Type 'string | undefined' is not assignable to type 'string'
const userId: string = user?.id;

// Clic droit → Copilot → Fix
```

**Résultat :** Code corrigé avec gestion appropriée.

#### 📝 Generate Docs
Génère de la documentation pour fonctions, classes, ou modules.

**Exemple :**
```typescript
async function calculateWorkoutCalories(
  exercises: Exercise[], 
  duration: number
): Promise<number> {
  // implementation
}

// Clic droit → Copilot → Generate Docs
```

**Résultat :** JSDoc complet avec descriptions des paramètres et valeur de retour.

#### 🔄 Refactor
Suggère des améliorations et refactoring.

---

## Gestion du Contexte

### Taille du Contexte
- **Fenêtre de contexte** : ~30,000 tokens (~60,000 mots)
- Équivalent à environ **100-150 fichiers moyens**

### Optimiser le Contexte

#### ✅ Techniques Efficaces

**1. Limiter la Portée**
```
"Focus only on backend/src/auth module. Ignore test files and frontend."
```

**2. Références Ciblées**
```
"Using #file:users.service.ts and #file:programs.service.ts as examples,
implement workouts.service.ts following the same pattern"
```

**3. Contexte Incrémental**
```
Étape 1: "@workspace show me the structure of the authentication system"
[Revue de la structure]

Étape 2: "Now analyze auth.service.ts for security issues"
[Analyse ciblée]

Étape 3: "Implement refresh token support in that service"
[Implémentation]
```

**4. Commandes Clear**
```
"/clear
Now let's work on a completely different topic - payment integration"
```

#### ❌ Anti-Patterns

**Trop Vague**
```
❌ "Look at my project and do something"
```

**Contexte Surchargé**
```
❌ "@workspace analyze everything and suggest all improvements"
```
Trop large, réponse générique.

**Meilleur approche** :
```
✅ "Analyze backend/src/auth specifically for JWT security issues"
```

---

### Références de Contexte Avancées

#### Syntaxe Complète

```
@workspace - Recherche dans tout le workspace
#file:path/to/file.ts - Inclut un fichier entier
#file:path/to/file.ts:10-50 - Lignes spécifiques
#selection - Code actuellement sélectionné
@terminal - Output du terminal
```

#### Exemples Pratiques

**Combiner Plusieurs Références**
```
"Compare the implementation in #file:users.controller.ts 
with #file:programs.controller.ts

Then update #file:workouts.controller.ts to use the better pattern"
```

**Utiliser la Sélection**
```
# Sélectionnez une fonction complexe
"Refactor #selection to:
1. Extract helper functions
2. Reduce complexity from 15 to <10
3. Add proper error handling
4. Add JSDoc comments"
```

**Référencer le Terminal**
```
# Après une erreur dans le terminal
"@terminal analyze the error in the last command and fix the issue"
```

---

## Capacités et Limites

### ✅ Ce que Copilot PEUT Faire

#### Exécution et Modification
- ✅ **Lire/Écrire des fichiers** dans le workspace
- ✅ **Exécuter des commandes** terminal (avec votre permission)
- ✅ **Rechercher** dans tout le codebase
- ✅ **Analyser** la structure du projet
- ✅ **Installer** des packages npm/yarn
- ✅ **Exécuter des tests** et interpréter les résultats
- ✅ **Accéder** aux fichiers de configuration
- ✅ **Créer/Modifier** plusieurs fichiers simultanément

#### Analyse et Compréhension
- ✅ **Comprendre** le contexte de votre projet
- ✅ **Suivre** les relations entre fichiers
- ✅ **Identifier** les patterns et conventions
- ✅ **Détecter** les erreurs et problèmes
- ✅ **Suggérer** des améliorations contextuelles

### ❌ Ce que Copilot NE PEUT PAS Faire

#### Limitations Techniques
- ❌ **Opérations Git destructives** (push, force, delete branches)
- ❌ **Accès réseau** direct (APIs externes, web scraping)
- ❌ **Modifications système** globales
- ❌ **Accès** aux fichiers hors du workspace
- ❌ **Exécution** de code arbitraire non sécurisé
- ❌ **Modifications permanentes** des settings VS Code

#### Limitations Fonctionnelles
- ❌ Ne peut pas **garantir** que le code généré est sans bug
- ❌ Ne **remplace pas** la relecture humaine
- ❌ Ne peut pas **tester** en conditions réelles
- ❌ Ne comprend pas **toutes** les nuances business
- ❌ Peut générer du code **non optimal** sans contexte

### ⚠️ Bonnes Pratiques de Sécurité

#### Toujours Relire
```
❌ Accepter aveuglément le code généré
✅ Relire et comprendre avant d'utiliser
```

#### Vérifier les Secrets
```
❌ Laisser Copilot générer des tokens/API keys
✅ Utiliser des variables d'environnement
```

#### Tester le Code
```
❌ Déployer sans tester
✅ Exécuter tests unitaires et d'intégration
```

#### Valider la Sécurité
```
❌ Faire confiance pour la sécurité
✅ Faire auditer le code de sécurité critique
```

---

## Modèles Disponibles

### Sélection du Modèle

**VS Code Settings** → `Github Copilot: Model`

### Options de Modèles

#### 🧠 Claude 3.5 Sonnet (Défaut - RECOMMANDÉ)
**Points Forts :**
- Raisonnement complexe
- Analyse d'architecture
- Revue de code approfondie
- Compréhension de nuances
- Excellent pour la sécurité

**Utilisez pour :**
- Nouvelles fonctionnalités complexes
- Refactoring important
- Audits de sécurité
- Décisions d'architecture
- Debugging difficile

#### ⚡ GPT-4
**Points Forts :**
- Génération de code rapide
- Suit les spécifications exactement
- Bon pour les patterns établis

**Utilisez pour :**
- Opérations CRUD standards
- Boilerplate code
- Code suivant des templates
- Implémentations directes

#### 🚀 GPT-3.5 (Plus Rapide)
**Points Forts :**
- Très rapide
- Bon pour le simple

**Utilisez pour :**
- Commentaires
- Documentation simple
- Fonctions triviales
- Suggestions inline

### Recommandations par Tâche

| Tâche | Modèle Recommandé | Pourquoi |
|-------|-------------------|----------|
| Feature complexe | Claude 3.5 Sonnet | Meilleure compréhension |
| Audit sécurité | Claude 3.5 Sonnet | Analyse approfondie |
| CRUD simple | GPT-4 | Rapide et efficace |
| Tests unitaires | GPT-4 | Bon pour patterns |
| Documentation | GPT-3.5 | Suffisant et rapide |
| Refactoring | Claude 3.5 Sonnet | Comprend implications |
| Bug fixing | Claude 3.5 Sonnet | Meilleur debugging |
| Boilerplate | GPT-4 ou GPT-3.5 | Rapide |

---

## Performance et Vitesse

### Optimiser les Temps de Réponse

#### 🚀 Requêtes Rapides
- Limiter le contexte avec `#file:` au lieu de `@workspace`
- Être spécifique plutôt que général
- Décomposer les grandes requêtes
- Fermer les onglets inutilisés
- Utiliser `/clear` entre sujets différents

#### 🐌 Ce qui Ralentit
- `@workspace` sur de très gros projets
- Demandes trop vagues nécessitant beaucoup d'analyse
- Contexte surchargé avec trop de fichiers ouverts
- Requêtes en cascade sans clear

### Exemple Optimisé

**❌ Lent :**
```
"@workspace review everything and tell me what's wrong"
```

**✅ Rapide :**
```
"Review #file:auth.service.ts for security issues related to JWT"
```

---

## Résumé des Fonctionnalités

### Fonctionnalités Principales

| Fonctionnalité | Raccourci | Usage Principal |
|----------------|-----------|-----------------|
| **Chat** | `Ctrl+Shift+I` | Questions, features, debug |
| **Inline Chat** | `Ctrl+I` | Édits rapides dans le code |
| **Copilot Edits** | Via Chat | Modifications multi-fichiers |
| **Suggestions** | Automatique | Complétion pendant la frappe |
| **Actions** | Clic droit | Explain, Fix, Doc, Refactor |

### Références de Contexte

| Syntaxe | Effet | Exemple |
|---------|-------|---------|
| `@workspace` | Tout le workspace | `@workspace how is auth implemented?` |
| `#file:path` | Fichier spécifique | `#file:auth.service.ts` |
| `#file:path:10-50` | Lignes précises | `#file:auth.service.ts:10-50` |
| `#selection` | Code sélectionné | `based on #selection` |
| `@terminal` | Output terminal | `@terminal analyze the error` |

---

## Prochaines Étapes

Maintenant que vous comprenez les fonctionnalités principales :

1. **Pratiquez** : Essayez chaque fonctionnalité au moins une fois
2. **Lisez** : [02_Commands_Reference.md](02_Commands_Reference.md) pour toutes les commandes
3. **Maîtrisez** : [03_Prompting_Best_Practices.md](03_Prompting_Best_Practices.md) pour des prompts efficaces

---

*Dernière mise à jour : Décembre 2025*
