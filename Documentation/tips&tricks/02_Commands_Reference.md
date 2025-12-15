# Référence Complète des Commandes Copilot

## Table des Matières
1. [Commandes Slash](#commandes-slash)
2. [Références de Contexte](#references-de-contexte)
3. [Raccourcis Clavier](#raccourcis-clavier)
4. [Guide de Sélection de Commandes](#guide-de-selection)

---

## Commandes Slash

Les commandes slash commencent par `/` et activent des comportements spécifiques de Copilot.

### `/explain` - Explication de Code

**Usage :** Comprendre du code complexe

**Syntaxe :**
```
/explain [description optionnelle]
```

**Exemples :**

```
/explain how this authentication middleware works
```

```
/explain the Prisma query optimization in this function
```

```
/explain #file:workouts.service.ts line 45-80
```

**Quand l'utiliser :**
- Code que vous n'avez pas écrit
- Logique complexe ou algorithmes
- Patterns inconnus
- Code legacy sans documentation

**Ce qu'il fournit :**
- Explication ligne par ligne
- Concepts clés utilisés
- Dépendances et relations
- Implications de performance
- Problèmes potentiels

---

### `/fix` - Correction d'Erreurs

**Usage :** Déboguer et réparer automatiquement

**Syntaxe :**
```
/fix [description du problème]
```

**Exemples :**

```
/fix the TypeScript error on line 45
```

```
/fix this function is returning undefined instead of an array
```

```
/fix
[Avec une erreur sélectionnée dans l'éditeur]
```

**Quand l'utiliser :**
- Erreurs TypeScript/ESLint
- Bugs évidents dans le code
- Problèmes de syntaxe
- Erreurs d'exécution courantes

**Pro Tips :**
- Incluez le message d'erreur complet
- Montrez le contexte avec `#file:` ou `#selection`
- Spécifiez le comportement attendu

**Exemple Complet :**
```
/fix I'm getting "Cannot read property 'id' of undefined"
Error occurs in: #file:programs.controller.ts:45
When user is not authenticated
Expected: Should return 401 Unauthorized
```

---

### `/tests` - Génération de Tests

**Usage :** Créer des suites de tests automatiquement

**Syntaxe :**
```
/tests [spécifications optionnelles]
```

**Exemples :**

```
/tests for UserService with edge cases
```

```
/tests unit tests for #file:auth.controller.ts
```

```
/tests comprehensive test suite for the authentication system including:
- Happy path scenarios
- Error cases
- Edge cases
- Mocking dependencies
```

**Quand l'utiliser :**
- Après avoir implémenté une fonctionnalité
- Pour augmenter la couverture de tests
- TDD (générer tests avant implémentation)
- Régression testing

**Options Utiles :**
```
/tests unit tests only (pas d'intégration)
```

```
/tests with mocked Prisma client and JWT service
```

```
/tests E2E tests using Supertest for API endpoints
```

**Framework Detection :**
Copilot détecte automatiquement :
- Jest (NestJS, React)
- Mocha/Chai
- Playwright (E2E)
- Cypress (E2E)
- Vitest

---

### `/doc` - Génération de Documentation

**Usage :** Créer de la documentation automatiquement

**Syntaxe :**
```
/doc [type de documentation]
```

**Exemples :**

```
/doc API documentation for these endpoints
```

```
/doc JSDoc comments for this function
```

```
/doc README.md for the authentication module
```

```
/doc OpenAPI spec for #file:users.controller.ts
```

**Types de Documentation :**

**1. Documentation Inline (JSDoc/TSDoc)**
```
/doc add inline comments to this complex function
```
Résultat :
```typescript
/**
 * Calculates the total calories burned during a workout session
 * @param exercises - Array of exercises performed
 * @param duration - Duration in minutes
 * @param userWeight - User's weight in kg
 * @returns Total calories burned
 * @throws {ValidationError} If duration is negative
 */
async function calculateCalories(...)
```

**2. API Documentation**
```
/doc generate Swagger/OpenAPI documentation for all endpoints in this controller
```

**3. README**
```
/doc create a README for this module explaining its purpose, usage, and API
```

**4. Architecture Docs**
```
/doc explain the architecture and data flow of the workout management system
```

---

### `/new` - Création de Nouveaux Composants

**Usage :** Scaffolder de nouveaux fichiers/composants

**Syntaxe :**
```
/new [description du composant]
```

**Exemples :**

```
/new React component for user profile display
```

```
/new NestJS module for subscription management
```

```
/new Prisma schema for notifications
```

```
/new Express middleware for rate limiting
```

**Quand l'utiliser :**
- Démarrer un nouveau composant
- Scaffolder une structure
- Créer des boilerplate files
- Générer des templates

**Framework-Aware :**
Copilot adapte le code selon votre stack :
- **NestJS** : Modules, Controllers, Services, DTOs
- **React** : Components, Hooks, Contexts
- **Prisma** : Models, Migrations
- **Express** : Routers, Middleware

**Exemple Détaillé :**
```
/new NestJS CRUD module for "Subscriptions" with:
- Controller with all REST endpoints
- Service with business logic
- DTOs with validation (Zod)
- Prisma integration
- Swagger decorators
- Unit tests
Following the pattern used in the Users module
```

---

### `/newNotebook` - Jupyter Notebooks

**Usage :** Créer des notebooks pour analyse de données

**Syntaxe :**
```
/newNotebook [description]
```

**Exemples :**

```
/newNotebook data analysis for user workout metrics
```

```
/newNotebook explore exercise performance trends
```

```
/newNotebook visualize subscription conversion rates
```

**Quand l'utiliser :**
- Analyse de données
- Data science tasks
- Visualisations
- Exploratory data analysis
- Reporting

---

### `/clear` - Réinitialiser le Contexte

**Usage :** Effacer la conversation et le contexte

**Syntaxe :**
```
/clear
```

**Quand l'utiliser :**
- Changer complètement de sujet
- Contexte devient confus
- Réponses inappropriées répétées
- Optimiser performance

**Exemple :**
```
[Après avoir travaillé sur l'auth]
/clear

Now let's work on payment integration with Stripe.
I need to implement webhook handling...
```

**Pro Tip :**
Utilisez `/clear` entre des tâches non liées pour :
- Réponses plus rapides
- Meilleur focus
- Contexte plus pertinent

---

### `/help` - Aide et Documentation

**Usage :** Obtenir de l'aide sur Copilot

**Syntaxe :**
```
/help [sujet optionnel]
```

**Exemples :**

```
/help
```

```
/help what can you do with terminal commands?
```

```
/help how do I use @workspace?
```

**Quand l'utiliser :**
- Découvrir les capacités
- Syntaxe de commandes
- Résoudre des problèmes
- Apprendre les fonctionnalités

---

## Références de Contexte

Les références de contexte permettent d'inclure des éléments spécifiques dans votre prompt.

### `@workspace` - Recherche Workspace

**Usage :** Rechercher dans tout le workspace

**Syntaxe :**
```
@workspace [requête]
```

**Exemples :**

```
@workspace how is authentication implemented?
```

```
@workspace find all database queries
```

```
@workspace where is user validation done?
```

```
@workspace explain the architecture of this project
```

**Quand l'utiliser :**
- Comprendre le projet global
- Trouver où quelque chose est implémenté
- Analyser l'architecture
- Découvrir des patterns

**Performance :**
- ⚠️ Peut être lent sur gros projets (>200 fichiers)
- ✅ Excellent pour projets petits/moyens
- 💡 Combinez avec des filtres pour accélérer

**Exemple Optimisé :**
```
@workspace find authentication implementations in backend/src only
```

---

### `#file:` - Référence de Fichier

**Usage :** Inclure un fichier spécifique dans le contexte

**Syntaxe :**
```
#file:path/to/file.ts
#file:path/to/file.ts:10-50
```

**Exemples :**

```
Review #file:backend/src/auth/auth.service.ts for security issues
```

```
Using #file:users.controller.ts as template, create workouts.controller.ts
```

```
Explain the logic in #file:programs.service.ts:45-120
```

**Avantages :**
- ✅ Plus rapide que `@workspace`
- ✅ Contexte précis
- ✅ Meilleure qualité de réponse
- ✅ Peut référencer plusieurs fichiers

**Multi-Fichiers :**
```
Compare implementations:
- #file:users.service.ts
- #file:programs.service.ts
Then implement workouts.service.ts following the better pattern
```

**Avec Lignes Spécifiques :**
```
The bug is in #file:auth.controller.ts:45-60
User gets 500 error instead of 401
```

---

### `#selection` - Code Sélectionné

**Usage :** Référencer du code actuellement sélectionné dans l'éditeur

**Syntaxe :**
```
#selection
```

**Workflow :**
1. Sélectionnez du code dans l'éditeur (surlignez avec la souris)
2. Ouvrez le chat Copilot
3. Utilisez `#selection` dans votre prompt

**Exemples :**

```
[Sélectionnez une fonction]
Refactor #selection to reduce complexity and add error handling
```

```
[Sélectionnez un algorithme]
Explain how #selection works and suggest optimizations
```

```
[Sélectionnez un pattern]
Apply the pattern from #selection to the user registration flow
```

**Pro Tips :**
- Sélectionnez juste ce qui est pertinent (pas tout le fichier)
- Incluez le contexte nécessaire (imports, types)
- Combinez avec d'autres références

**Exemple Combiné :**
```
[Sélectionnez une fonction dans users.service.ts]
Based on #selection, implement similar functionality in 
#file:programs.service.ts but with pagination support
```

---

### `@terminal` - Output Terminal

**Usage :** Référencer l'output du terminal

**Syntaxe :**
```
@terminal [description]
```

**Exemples :**

```
[Après une erreur de build]
@terminal analyze the error and fix it
```

```
[Après npm install avec erreurs]
@terminal why did the installation fail?
```

```
[Après des tests qui échouent]
@terminal explain which tests failed and why
```

**Quand l'utiliser :**
- Erreurs de compilation
- Tests en échec
- Erreurs npm/yarn
- Output de scripts

**Workflow :**
1. Exécutez une commande dans le terminal
2. Si erreur/problème, ouvrez Copilot chat
3. Utilisez `@terminal` pour analyser

---

### `@vscode` - API VS Code

**Usage :** Documentation API VS Code pour extensions

**Syntaxe :**
```
@vscode [requête]
```

**Exemples :**

```
@vscode how do I create a custom command?
```

```
@vscode implement a tree view provider
```

```
@vscode register a webview panel
```

**Quand l'utiliser :**
- Développement d'extensions VS Code
- Utilisation d'APIs VS Code
- Contribution points
- Extension lifecycle

**Note :** Spécifique au développement d'extensions, pas pour usage général.

---

## Raccourcis Clavier

### Chat et Inline

| Action | Windows/Linux | Mac | Description |
|--------|---------------|-----|-------------|
| Ouvrir Chat | `Ctrl+Shift+I` | `Cmd+Shift+I` | Panneau chat principal |
| Inline Chat | `Ctrl+I` | `Cmd+I` | Chat dans l'éditeur |
| Fermer Chat | `Esc` | `Esc` | Fermer le panneau |

### Suggestions Inline

| Action | Windows/Linux | Mac | Description |
|--------|---------------|-----|-------------|
| Accepter | `Tab` | `Tab` | Accepter la suggestion |
| Rejeter | `Esc` | `Esc` | Ignorer la suggestion |
| Suivante | `Alt+]` | `Option+]` | Suggestion suivante |
| Précédente | `Alt+[` | `Option+[` | Suggestion précédente |
| Toutes | `Ctrl+Enter` | `Cmd+Enter` | Panneau de suggestions |

### Navigation

| Action | Windows/Linux | Mac | Description |
|--------|---------------|-----|-------------|
| Go to Definition | `F12` | `F12` | Aller à la définition |
| Peek Definition | `Alt+F12` | `Option+F12` | Aperçu définition |
| Find All References | `Shift+F12` | `Shift+F12` | Toutes les références |
| Rename Symbol | `F2` | `F2` | Renommer |

### Éditeur

| Action | Windows/Linux | Mac | Description |
|--------|---------------|-----|-------------|
| Command Palette | `Ctrl+Shift+P` | `Cmd+Shift+P` | Palette de commandes |
| Quick Open | `Ctrl+P` | `Cmd+P` | Ouvrir fichier rapide |
| Search Workspace | `Ctrl+Shift+F` | `Cmd+Shift+F` | Rechercher dans projet |
| Toggle Terminal | `Ctrl+`` | `Cmd+`` | Afficher/cacher terminal |

---

## Guide de Sélection de Commandes

### Arbre de Décision

```
Que voulez-vous faire ?
│
├─ Comprendre du code
│  └─> /explain ou @workspace
│
├─ Corriger une erreur
│  └─> /fix + description ou @terminal
│
├─ Créer du nouveau code
│  ├─ Component/Module → /new
│  ├─ Tests → /tests
│  └─ Documentation → /doc
│
├─ Analyser le projet
│  ├─ Architecture globale → @workspace
│  ├─ Fichier spécifique → #file:
│  └─ Code sélectionné → #selection
│
├─ Refactoring/Modifications
│  ├─ Un fichier → Chat normal + #file:
│  ├─ Multi-fichiers → Copilot Edits
│  └─ Renaming → F2 (VS Code)
│
└─ Changer de sujet
   └─> /clear
```

---

### Matrice de Sélection

| Besoin | Commande | Alternative |
|--------|----------|-------------|
| **Comprendre du code** | `/explain #file:path` | `@workspace explain X` |
| **Déboguer** | `/fix` + erreur | `@terminal` + analyse |
| **Générer tests** | `/tests` | Chat avec spécs détaillées |
| **Créer composant** | `/new` | Chat avec template |
| **Documenter** | `/doc` | `/explain` puis adapter |
| **Rechercher** | `@workspace find X` | Utiliser VS Code search |
| **Contexte fichier** | `#file:path` | Ouvrir et utiliser `#selection` |
| **Multi-fichiers** | Copilot Edits | Chat + modifications manuelles |
| **Réinitialiser** | `/clear` | Fermer/rouvrir chat |

---

### Scénarios Courants

#### Scénario 1 : "Je ne comprends pas ce code"
```
Solution 1 (simple):
/explain this function

Solution 2 (avec contexte):
/explain #file:path/to/file.ts:45-100
Include dependencies and side effects

Solution 3 (architectural):
@workspace explain how the workout management system works
```

#### Scénario 2 : "J'ai une erreur TypeScript"
```
Solution 1 (rapide):
/fix [sélectionner l'erreur dans l'éditeur]

Solution 2 (avec contexte):
/fix TypeScript error: [copier message]
In file: #file:path.ts:45
Expected behavior: [décrire]

Solution 3 (terminal):
@terminal analyze the compilation error and fix
```

#### Scénario 3 : "Je veux créer un nouveau module"
```
Solution 1 (scaffold):
/new NestJS module for notifications

Solution 2 (avec template):
Using #file:users/users.module.ts as template,
create a notifications module with CRUD operations

Solution 3 (Copilot Edits pour multi-fichiers):
[Open Copilot Edits]
Create a complete notifications module:
- notifications.module.ts
- notifications.controller.ts
- notifications.service.ts
- dto/create-notification.dto.ts
- entities/notification.entity.ts
```

#### Scénario 4 : "Je veux refactorer plusieurs fichiers"
```
Solution: Copilot Edits
[Open Copilot Edits]
Refactor authentication to use refresh tokens:
Files: [liste]
Changes: [détails]
```

#### Scénario 5 : "Je veux tout savoir sur X"
```
Solution:
@workspace explain everything about user authentication
Include: architecture, files involved, flow, security measures
```

---

## Combinaisons Puissantes

### Pattern 1 : Analyse + Implémentation
```
Étape 1:
@workspace show me how CRUD operations are implemented

Étape 2:
Using those patterns, implement CRUD for subscriptions:
[spécifications]
```

### Pattern 2 : Template + Génération
```
Étape 1:
Analyze #file:users.controller.ts and extract the common pattern

Étape 2:
/new controller for workouts following that exact pattern
```

### Pattern 3 : Debug Complet
```
Étape 1:
@terminal analyze the error

Étape 2:
/fix the issue in #file:auth.service.ts:45-60

Étape 3:
/tests add test to prevent this regression
```

### Pattern 4 : Revue Multi-Niveau
```
Étape 1:
@workspace identify the most complex functions

Étape 2:
/explain [each complex function]

Étape 3:
Refactor #file:complex-file.ts to reduce complexity
```

---

## Commandes Personnalisées

### Créer Vos Propres "Commandes"

Bien que vous ne puissiez pas créer de vraies commandes slash, vous pouvez créer des **templates de prompts** réutilisables.

**Exemples :**

```
[Créez un fichier: .copilot-prompts.md dans votre projet]

## AUDIT_SECURITY
Review #file:[PATH] for security vulnerabilities:
- Input validation
- SQL/NoSQL injection
- XSS vulnerabilities
- Authentication/authorization issues
- Sensitive data exposure
Provide line numbers and severity

## CREATE_CRUD
Create complete CRUD module for [ENTITY]:
- Prisma model
- Controller with all endpoints
- Service with business logic
- DTOs with Zod validation
- Unit tests
- Swagger documentation
Following patterns in existing modules

## OPTIMIZE_QUERY
Analyze #file:[PATH] for database query optimization:
- N+1 query detection
- Missing indexes
- Inefficient joins
- Caching opportunities
Show before/after with performance estimates
```

**Usage :**
Copiez-collez le template et remplissez les paramètres.

---

## Aide-Mémoire Rapide

### Commandes Essentielles

```
/explain    → Comprendre du code
/fix        → Corriger une erreur
/tests      → Générer des tests
/doc        → Créer documentation
/new        → Nouveau composant
/clear      → Réinitialiser contexte
```

### Références Essentielles

```
@workspace  → Recherche globale
#file:path  → Fichier spécifique
#selection  → Code sélectionné
@terminal   → Output terminal
```

### Raccourcis Essentiels

```
Ctrl+Shift+I → Chat
Ctrl+I       → Inline chat
Tab          → Accepter
Alt+]        → Suivant
/clear       → Reset
```

---

## Prochaines Étapes

Vous maîtrisez maintenant toutes les commandes ! Continuez avec :

- [03_Prompting_Best_Practices.md](03_Prompting_Best_Practices.md) - Écrire des prompts efficaces
- [09_Prompt_Library.md](09_Prompt_Library.md) - 50+ prompts prêts à utiliser

---

*Dernière mise à jour : Décembre 2025*
