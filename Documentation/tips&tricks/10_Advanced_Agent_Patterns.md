# 10. Agents Personnalisés et Fonction Plan

## Table des Matières
- [Fonction Plan de Copilot](#fonction-plan-de-copilot)
- [Agents Personnalisés avec Contexte](#agents-personnalisés-avec-contexte)
- [Templates d'Agents pour GoBeyondFit](#templates-dagents-pour-gobeyondfit)
- [Workflows Avancés avec Agents](#workflows-avancés-avec-agents)

---

## Fonction Plan de Copilot

### Qu'est-ce que la Fonction Plan ?

La fonction **Plan** de GitHub Copilot est un système de gestion de tâches intégré qui permet à Copilot de:
- **Organiser** le travail en tâches structurées et traçables
- **Suivre** la progression de tâches complexes multi-étapes
- **Prioriser** les actions à effectuer
- **Éviter** d'oublier des étapes importantes

### Quand Copilot Utilise le Plan

Copilot active automatiquement la fonction Plan pour:

```
✅ Tâches Multi-Étapes
   - Implémentation de features complexes
   - Migrations de base de données
   - Refactorings majeurs

✅ Demandes Multiples
   - Liste numérotée de tâches
   - Plusieurs fichiers à modifier
   - Corrections multiples

✅ Travail Séquentiel
   - Étapes dépendantes
   - Processus avec validation
   - Déploiements par phases
```

### Comment Fonctionne le Plan

#### 1. Création Automatique

**Prompt Utilisateur:**
```
Implémente un système de notifications push pour GoBeyondFit:
1. Créer le service de notifications
2. Ajouter la table notifications en DB
3. Créer les endpoints API
4. Ajouter les tests
5. Mettre à jour la documentation
```

**Copilot crée automatiquement:**
```
📋 TODO LIST
┌─────────────────────────────────────────────┐
│ ⏳ 1. Créer le service de notifications     │
│ ⏸️  2. Ajouter la table notifications       │
│ ⏸️  3. Créer les endpoints API              │
│ ⏸️  4. Ajouter les tests                    │
│ ⏸️  5. Mettre à jour la documentation       │
└─────────────────────────────────────────────┘

Statuts: ⏳ En cours | ✅ Complété | ⏸️ Pas commencé
```

#### 2. Mise à Jour en Temps Réel

Copilot met à jour le plan au fur et à mesure:

```
APRÈS LA TÂCHE 1:
┌─────────────────────────────────────────────┐
│ ✅ 1. Créer le service de notifications     │
│ ⏳ 2. Ajouter la table notifications         │
│ ⏸️  3. Créer les endpoints API              │
│ ⏸️  4. Ajouter les tests                    │
│ ⏸️  5. Mettre à jour la documentation       │
└─────────────────────────────────────────────┘
```

#### 3. Suivi de Progression

Vous voyez toujours où vous en êtes:
- **En cours** (⏳): Tâche actuellement traitée
- **Complété** (✅): Tâche terminée avec succès
- **Pas commencé** (⏸️): Tâche en attente

### Exemples Pratiques avec Plan

#### Exemple 1: Feature Complète

**Prompt:**
```
Ajoute la fonctionnalité de favoris pour les exercices:
1. Modifier le schéma Prisma pour ajouter la relation
2. Créer le service favorites.service.ts
3. Ajouter les endpoints dans exercises.controller.ts
4. Créer les DTOs pour les favoris
5. Ajouter les tests unitaires
6. Ajouter les tests d'intégration
7. Mettre à jour la documentation API
```

**Copilot va:**
- ✅ Créer un plan avec 7 tâches
- ✅ Exécuter chaque tâche séquentiellement
- ✅ Marquer chaque tâche comme complétée
- ✅ Vous informer de la progression

#### Exemple 2: Audit de Sécurité

**Prompt:**
```
Fais un audit de sécurité complet:
1. Vérifier l'authentification JWT
2. Auditer les endpoints protégés
3. Vérifier la validation des inputs
4. Checker les injections SQL
5. Vérifier les CORS
6. Auditer les variables d'environnement
7. Vérifier les dépendances vulnérables
```

**Copilot va:**
- ✅ Organiser l'audit en 7 vérifications
- ✅ Traiter chaque point systématiquement
- ✅ Documenter les problèmes trouvés
- ✅ Proposer des corrections

### Contrôler le Plan Manuellement

#### Forcer l'Utilisation du Plan

```
🎯 PROMPT EXPLICITE

"Crée un plan détaillé puis implémente étape par étape la migration 
de notre authentification de JWT à OAuth2 avec Google."
```

#### Désactiver le Plan

```
❌ POUR TÂCHES SIMPLES

Si Copilot crée un plan non nécessaire:
"Juste [action simple], pas besoin de plan"
```

### Meilleures Pratiques avec le Plan

#### ✅ DO

```
1. Laisser Copilot créer le plan automatiquement
2. Vérifier le plan avant de démarrer
3. Demander des ajustements si nécessaire:
   "Ajoute une étape de backup avant la migration"
4. Suivre la progression dans le chat
```

#### ❌ DON'T

```
1. Interrompre Copilot au milieu d'un plan
2. Demander des modifications pendant l'exécution
3. Créer des plans pour des tâches triviales
```

---

## Agents Personnalisés avec Contexte

### Concept d'Agents Spécialisés

Contrairement à Claude Code CLI qui permet de créer des agents avec contexte persistant, GitHub Copilot fonctionne différemment, mais vous pouvez **simuler des agents spécialisés** via:

1. **Instructions persistantes dans le chat**
2. **Templates de prompts réutilisables**
3. **Fichiers de contexte dédiés**
4. **Utilisation de @workspace avec contexte spécifique**

### Architecture d'Agents Simulés

#### Agent de Sécurité

**Fichier: `.copilot/agents/security-agent-context.md`**

```markdown
# Agent de Sécurité - Contexte

## Rôle
Expert en sécurité des applications NestJS/Prisma/PostgreSQL

## Domaines d'Expertise
- OWASP Top 10
- Authentification JWT
- Injection SQL
- XSS/CSRF
- Validation des inputs
- Rate limiting
- Chiffrement des données sensibles

## Checklist Systématique
1. ✅ Authentification et autorisation
2. ✅ Validation des inputs (class-validator)
3. ✅ Protection contre injection SQL (Prisma)
4. ✅ Headers de sécurité (helmet)
5. ✅ Rate limiting (@nestjs/throttler)
6. ✅ CORS configuré correctement
7. ✅ Variables sensibles en .env
8. ✅ Dépendances à jour (npm audit)

## Standards du Projet
- Backend: NestJS + Prisma
- Auth: JWT avec refresh tokens
- DB: PostgreSQL
- Validation: class-validator + class-transformer
```

**Utilisation:**

```
@workspace #file:.copilot/agents/security-agent-context.md

Tu es l'agent de sécurité. Audite le fichier auth.service.ts 
et applique la checklist complète.
```

#### Agent de Performance

**Fichier: `.copilot/agents/performance-agent-context.md`**

```markdown
# Agent de Performance - Contexte

## Rôle
Expert en optimisation de performance pour applications SaaS

## Domaines d'Expertise
- Optimisation de requêtes Prisma
- Indexation PostgreSQL
- Caching (Redis)
- Lazy loading
- N+1 queries
- Pagination efficace
- Compression des réponses

## Checklist Systématique
1. ✅ Requêtes Prisma optimisées (include vs select)
2. ✅ Index sur colonnes fréquemment requêtées
3. ✅ Pagination sur listes > 100 items
4. ✅ Cache Redis pour données fréquentes
5. ✅ Compression GZIP activée
6. ✅ Lazy loading des relations
7. ✅ Connection pooling configuré

## Métriques Cibles
- Temps de réponse API: < 200ms
- Temps de requête DB: < 50ms
- Taux de cache hit: > 80%
```

**Utilisation:**

```
@workspace #file:.copilot/agents/performance-agent-context.md

Tu es l'agent de performance. Analyse le fichier programs.service.ts 
et optimise toutes les requêtes Prisma.
```

#### Agent de Tests

**Fichier: `.copilot/agents/testing-agent-context.md`**

```markdown
# Agent de Tests - Contexte

## Rôle
Expert en testing pour applications NestJS

## Domaines d'Expertise
- Tests unitaires (Jest)
- Tests d'intégration
- Tests E2E
- Mocking (Prisma, services externes)
- Coverage (minimum 80%)
- TDD/BDD

## Standards de Tests
- Arrange-Act-Assert pattern
- Mock des dépendances externes
- Tests isolés (pas de DB partagée)
- Cleanup après chaque test
- Descriptions claires et explicites

## Template de Test Unitaire
```typescript
describe('ServiceName', () => {
  let service: ServiceName;
  let mockDependency: jest.Mocked<DependencyType>;

  beforeEach(async () => {
    mockDependency = {
      method: jest.fn(),
    } as any;

    const module = await Test.createTestingModule({
      providers: [
        ServiceName,
        { provide: DependencyType, useValue: mockDependency },
      ],
    }).compile();

    service = module.get<ServiceName>(ServiceName);
  });

  describe('methodName', () => {
    it('should [comportement attendu]', async () => {
      // Arrange
      const input = {};
      mockDependency.method.mockResolvedValue(expected);

      // Act
      const result = await service.methodName(input);

      // Assert
      expect(result).toEqual(expected);
      expect(mockDependency.method).toHaveBeenCalledWith(input);
    });
  });
});
```
```

**Utilisation:**

```
@workspace #file:.copilot/agents/testing-agent-context.md

Tu es l'agent de tests. Crée les tests unitaires complets pour 
workouts.service.ts avec un coverage de 100%.
```

---

## Templates d'Agents pour GoBeyondFit

### 1. Agent Architecture

**Fichier: `.copilot/agents/architecture-agent-context.md`**

```markdown
# Agent Architecture - GoBeyondFit

## Architecture Actuelle

### Backend (NestJS)
```
backend/src/
├── auth/              # Authentification JWT
├── users/             # Gestion utilisateurs
├── exercises/         # Bibliothèque exercices
├── programs/          # Programmes d'entraînement
├── workouts/          # Séances individuelles
├── sessions/          # Sessions utilisateur
└── common/            # Guards, interceptors, filters
```

### Base de Données (PostgreSQL + Prisma)
- Multi-tenant par user_id
- Soft deletes sur toutes les tables
- Relations One-to-Many strictes
- Indexation sur FK et colonnes de recherche

## Patterns Obligatoires

### Services
```typescript
@Injectable()
export class EntityService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: number) {
    return this.prisma.entity.findMany({
      where: { userId, deletedAt: null },
      include: { relations: true },
    });
  }

  async create(userId: number, dto: CreateEntityDto) {
    return this.prisma.entity.create({
      data: { ...dto, userId },
    });
  }
}
```

### Controllers
```typescript
@Controller('entities')
@UseGuards(JwtAuthGuard)
export class EntityController {
  constructor(private entityService: EntityService) {}

  @Get()
  findAll(@Req() req: AuthRequest) {
    return this.entityService.findAll(req.user.id);
  }
}
```

## Règles d'Architecture
1. Toujours filtrer par userId
2. Toujours vérifier deletedAt: null
3. Utiliser les DTOs avec class-validator
4. Séparer business logic (services) et routing (controllers)
5. Guards sur tous les endpoints sauf /auth/*
```

### 2. Agent API

**Fichier: `.copilot/agents/api-agent-context.md`**

```markdown
# Agent API - GoBeyondFit

## Standards d'API

### Structure de Réponse
```typescript
// Success
{
  "data": T,
  "message": "Action completed successfully"
}

// Error
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": ["Field X is required"]
}
```

### Endpoints Standards

**Liste avec Pagination:**
```typescript
GET /api/entities?page=1&limit=20&sortBy=createdAt&order=desc
Response: {
  data: Entity[],
  meta: {
    total: 150,
    page: 1,
    limit: 20,
    totalPages: 8
  }
}
```

**CRUD Complet:**
```typescript
GET    /api/entities          # Liste
GET    /api/entities/:id      # Détail
POST   /api/entities          # Création
PATCH  /api/entities/:id      # Mise à jour partielle
DELETE /api/entities/:id      # Soft delete
```

## Validation DTOs

```typescript
export class CreateEntityDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}
```

## Documentation OpenAPI
- Utiliser @ApiTags pour grouper
- @ApiOperation pour décrire l'endpoint
- @ApiResponse pour toutes les réponses possibles
- @ApiBearerAuth pour auth requise
```

### 3. Agent Database

**Fichier: `.copilot/agents/database-agent-context.md`**

```markdown
# Agent Database - GoBeyondFit

## Schéma Actuel

### Tables Principales
```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  username  String   @unique
  password  String
  role      Role     @default(USER)
  exercises Exercise[]
  programs  Program[]
  workouts  Workout[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Exercise {
  id          Int      @id @default(autoincrement())
  name        String
  description String?
  videoUrl    String?
  userId      Int
  user        User     @relation(fields: [userId], references: [id])
  deletedAt   DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([userId])
  @@index([deletedAt])
}
```

## Patterns Prisma

### Requêtes Optimisées
```typescript
// ❌ BAD - N+1 queries
const programs = await prisma.program.findMany();
for (const program of programs) {
  const workouts = await prisma.workout.findMany({
    where: { programId: program.id }
  });
}

// ✅ GOOD - Single query with include
const programs = await prisma.program.findMany({
  include: { workouts: true }
});
```

### Transactions
```typescript
await prisma.$transaction(async (tx) => {
  const program = await tx.program.create({ data: programData });
  await tx.workout.createMany({ 
    data: workouts.map(w => ({ ...w, programId: program.id }))
  });
});
```

## Migrations
- Toujours tester en local d'abord
- Backup DB avant migration production
- Utiliser `prisma migrate dev` en dev
- Utiliser `prisma migrate deploy` en prod
```

---

## Workflows Avancés avec Agents

### Workflow 1: Nouvelle Feature avec Agents Spécialisés

```
ÉTAPE 1: ARCHITECTURE
─────────────────────
@workspace #file:.copilot/agents/architecture-agent-context.md

"Tu es l'agent architecture. Je veux ajouter un système de favoris 
pour les exercices. Propose-moi l'architecture complète (modèles, 
services, controllers) en respectant les patterns du projet."

ÉTAPE 2: DATABASE
─────────────────
@workspace #file:.copilot/agents/database-agent-context.md

"Tu es l'agent database. Crée le schéma Prisma pour le système de 
favoris (table ExerciseFavorite) et génère la migration."

ÉTAPE 3: API
────────────
@workspace #file:.copilot/agents/api-agent-context.md

"Tu es l'agent API. Implémente les endpoints REST pour les favoris:
- POST /api/exercises/:id/favorite
- DELETE /api/exercises/:id/favorite
- GET /api/exercises/favorites
Avec DTOs et documentation OpenAPI."

ÉTAPE 4: TESTS
──────────────
@workspace #file:.copilot/agents/testing-agent-context.md

"Tu es l'agent de tests. Crée les tests unitaires et d'intégration 
pour le système de favoris (coverage 100%)."

ÉTAPE 5: SÉCURITÉ
─────────────────
@workspace #file:.copilot/agents/security-agent-context.md

"Tu es l'agent de sécurité. Audite l'implémentation des favoris et 
vérifie qu'un utilisateur ne peut pas manipuler les favoris d'un autre."

ÉTAPE 6: PERFORMANCE
────────────────────
@workspace #file:.copilot/agents/performance-agent-context.md

"Tu es l'agent de performance. Optimise les requêtes pour la liste 
des exercices favoris et ajoute du caching si nécessaire."
```

### Workflow 2: Audit Complet Automatisé

```bash
# Créer un script d'audit multi-agents
# File: scripts/copilot-full-audit.md
```

```markdown
# Audit Complet GoBeyondFit

## 1. Audit Sécurité
@workspace #file:.copilot/agents/security-agent-context.md
Audite tous les services dans backend/src/ et génère un rapport.

## 2. Audit Performance  
@workspace #file:.copilot/agents/performance-agent-context.md
Analyse toutes les requêtes Prisma et identifie les goulots.

## 3. Audit Tests
@workspace #file:.copilot/agents/testing-agent-context.md
Calcule le coverage actuel et liste les fichiers sans tests.

## 4. Audit Architecture
@workspace #file:.copilot/agents/architecture-agent-context.md
Vérifie que tous les services respectent les patterns définis.

## 5. Audit API
@workspace #file:.copilot/agents/api-agent-context.md
Vérifie la cohérence des endpoints et la documentation OpenAPI.
```

**Utilisation:**
```
@workspace #file:scripts/copilot-full-audit.md

"Exécute l'audit complet en suivant ce script."
```

### Workflow 3: Onboarding Nouveau Dev

```
JOUR 1: ARCHITECTURE
────────────────────
@workspace #file:.copilot/agents/architecture-agent-context.md

"Tu es l'agent architecture. Explique à un nouveau développeur 
l'architecture complète de GoBeyondFit avec des exemples de code."

JOUR 2: PREMIERS TESTS
───────────────────────
@workspace #file:.copilot/agents/testing-agent-context.md

"Tu es l'agent de tests. Montre au nouveau dev comment écrire 
et exécuter des tests sur GoBeyondFit. Donne des exemples concrets."

JOUR 3: PREMIÈRE FEATURE
─────────────────────────
@workspace #file:.copilot/agents/architecture-agent-context.md

"Guide le développeur pour implémenter sa première feature: 
ajouter un champ 'notes' aux exercices. Explique chaque étape."
```

---

## Exemples Pratiques Combinés (Plan + Agents)

### Exemple: Migration OAuth2 avec Plan et Agents

```
PROMPT INITIAL:
───────────────
"Crée un plan détaillé puis implémente la migration de notre 
authentification JWT vers OAuth2 avec Google. Utilise les agents 
spécialisés pour chaque étape."

PLAN AUTOMATIQUE CRÉÉ PAR COPILOT:
───────────────────────────────────
📋 TODO LIST
┌──────────────────────────────────────────────────────┐
│ ⏳ 1. Architecture: Concevoir le système OAuth2      │
│ ⏸️  2. Database: Ajouter table oauth_providers       │
│ ⏸️  3. Backend: Implémenter le flow OAuth2          │
│ ⏸️  4. API: Créer les endpoints /auth/google/*      │
│ ⏸️  5. Tests: Tester l'authentification Google      │
│ ⏸️  6. Sécurité: Auditer l'implémentation           │
│ ⏸️  7. Documentation: Mettre à jour les docs        │
└──────────────────────────────────────────────────────┘

EXÉCUTION AVEC AGENTS:
──────────────────────
Copilot va automatiquement:

1. ⏳ Architecture
   → Charge: .copilot/agents/architecture-agent-context.md
   → Conçoit l'architecture OAuth2

2. ⏳ Database  
   → Charge: .copilot/agents/database-agent-context.md
   → Crée la migration Prisma

3. ⏳ Backend
   → Charge: architecture-agent-context.md
   → Implémente le service OAuth

... et ainsi de suite jusqu'à la fin.
```

---

## Conseils Pro

### 1. Organisation des Agents

```
.copilot/
└── agents/
    ├── README.md                          # Index des agents
    ├── security-agent-context.md
    ├── performance-agent-context.md
    ├── testing-agent-context.md
    ├── architecture-agent-context.md
    ├── api-agent-context.md
    └── database-agent-context.md
```

### 2. Commandes Rapides

Créez des alias dans votre workflow:

```markdown
# File: .copilot/commands.md

## Audit Sécurité Rapide
`/security` → @workspace #file:.copilot/agents/security-agent-context.md
"Audite le fichier actuellement ouvert."

## Tests Automatiques
`/test` → @workspace #file:.copilot/agents/testing-agent-context.md
"Crée les tests pour le fichier actuellement ouvert."

## Optimisation Performance
`/perf` → @workspace #file:.copilot/agents/performance-agent-context.md
"Optimise le fichier actuellement ouvert."
```

### 3. Utilisation Combinée

```
PROMPT ULTIME:
──────────────
@workspace 
#file:.copilot/agents/architecture-agent-context.md
#file:.copilot/agents/security-agent-context.md
#file:.copilot/agents/performance-agent-context.md

"Tu es une équipe de 3 agents (architecture, sécurité, performance).
Travaillez ensemble pour implémenter un système de webhooks Stripe 
pour GoBeyondFit. Architecture propose la structure, Sécurité valide, 
Performance optimise."
```

---

## Limites et Différences avec Claude Code CLI

### GitHub Copilot
- ✅ Intégré directement dans VS Code
- ✅ Fonction Plan automatique
- ✅ Accès au contexte workspace
- ❌ Pas d'agents persistants natifs
- ❌ Contexte rechargé à chaque prompt

### Claude Code CLI (Comparaison)
- ✅ Agents persistants avec mémoire
- ✅ Contexte conservé entre sessions
- ✅ Workflow personnalisés complexes
- ❌ Nécessite installation séparée
- ❌ Pas d'intégration VS Code native

### Solution Hybride Recommandée

```
POUR DÉVELOPPEMENT QUOTIDIEN:
→ GitHub Copilot (rapidité, intégration)

POUR WORKFLOWS COMPLEXES:
→ Fichiers de contexte agents + fonction Plan

POUR REFACTORING MASSIFS:
→ Claude Code CLI si disponible
```

---

## Checklist Finale

### Setup Agents
- [ ] Créer le dossier `.copilot/agents/`
- [ ] Créer les 6 agents de base
- [ ] Tester chaque agent individuellement
- [ ] Créer un fichier README.md d'index

### Utilisation Quotidienne
- [ ] Utiliser le Plan pour tâches > 3 étapes
- [ ] Préfixer avec le bon agent selon la tâche
- [ ] Vérifier le plan avant validation
- [ ] Marquer les tâches complétées

### Optimisation
- [ ] Mettre à jour les agents avec les learnings
- [ ] Documenter les nouveaux patterns découverts
- [ ] Partager les prompts qui marchent bien
- [ ] Créer des scripts d'audit automatisés

---

## Ressources

- [Documentation Officielle Copilot](https://docs.github.com/en/copilot)
- [Architecture GoBeyondFit](../10_ARCHITECTURE.md)
- [Commandes de Référence](./02_Commands_Reference.md)
- [Bibliothèque de Prompts](./09_Prompt_Library.md)

---

*Dernière mise à jour: Décembre 2024*
*Version: 1.0*
