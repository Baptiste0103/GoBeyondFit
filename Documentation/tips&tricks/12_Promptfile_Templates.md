# 12. Promptfiles et Templates de Prompts

## Table des Matières
- [Introduction aux Promptfiles](#introduction-aux-promptfiles)
- [Anatomie d'un Promptfile](#anatomie-dun-promptfile)
- [Templates de Prompts Efficaces](#templates-de-prompts-efficaces)
- [Banques de Prompts](#banques-de-prompts)
- [Optimisation de Prompts](#optimisation-de-prompts)
- [Prompts pour GoBeyondFit](#prompts-pour-gobeyondfit)

---

## Introduction aux Promptfiles

### Qu'est-ce qu'un Promptfile ?

Un **Promptfile** est un fichier structuré contenant :
- ✅ Des instructions réutilisables
- ✅ Des exemples d'input/output
- ✅ Des contraintes et règles
- ✅ Du contexte métier

**Analogie**: C'est comme un Dockerfile, mais pour les prompts d'IA.

### Pourquoi Utiliser des Promptfiles ?

```
SANS PROMPTFILE:
├─ Prompts improvisés à chaque fois
├─ Manque de cohérence
├─ Perte de temps
└─ Résultats variables

AVEC PROMPTFILE:
├─ Prompts testés et optimisés
├─ Cohérence garantie
├─ Réutilisabilité
└─ Résultats prévisibles
```

### Structure d'un Promptfile

**Fichier: `.copilot/prompts/template.prompt.md`**

```markdown
---
name: Template Name
version: 1.0
author: Your Name
category: backend|frontend|testing|architecture
tags: [nestjs, typescript, api]
---

# Context
Brief description of when to use this prompt

## Prerequisites
- What needs to be in place
- What files should exist

## Input Format
```
Example input structure
```

## Expected Output
```
Example output structure
```

## Prompt
```
The actual prompt text here
```

## Examples
### Example 1: Basic Usage
Input: ...
Output: ...

### Example 2: Advanced Usage
Input: ...
Output: ...

## Notes
- Important considerations
- Common pitfalls
```

---

## Anatomie d'un Promptfile

### 1. Métadonnées

```yaml
---
name: "Create NestJS CRUD Service"
version: "2.1"
author: "DevTeam"
category: "backend"
tags: ["nestjs", "prisma", "crud"]
difficulty: "intermediate"
estimated_time: "5 minutes"
dependencies:
  - prisma-schema
  - dto-templates
---
```

### 2. Section Context

```markdown
# Context

This promptfile generates a complete NestJS CRUD service with:
- Business logic layer
- Prisma integration
- Error handling
- Authorization checks
- Validation

**Use when**: Creating a new resource endpoint
**Don't use when**: Updating existing services (use update-service.prompt.md)
```

### 3. Section Prerequisites

```markdown
## Prerequisites

1. **Prisma Schema**: Entity must be defined in `schema.prisma`
   ```prisma
   model YourEntity {
     id        Int      @id @default(autoincrement())
     name      String
     createdAt DateTime @default(now())
   }
   ```

2. **DTOs**: Create/Update DTOs must exist
   - `dto/create-entity.dto.ts`
   - `dto/update-entity.dto.ts`

3. **Module**: Entity module must be created
   - `entity.module.ts`
```

### 4. Section Input Format

```markdown
## Input Format

Provide the following information:

```json
{
  "entityName": "Exercise",
  "pluralName": "exercises",
  "fields": [
    { "name": "name", "type": "string", "required": true },
    { "name": "description", "type": "string", "required": false },
    { "name": "videoUrl", "type": "string", "required": false }
  ],
  "relations": [
    { "type": "belongsTo", "entity": "User", "foreignKey": "userId" }
  ],
  "permissions": {
    "create": ["coach", "admin"],
    "read": ["student", "coach", "admin"],
    "update": ["coach", "admin"],
    "delete": ["admin"]
  }
}
```
```

### 5. Section Prompt

```markdown
## Prompt

Create a complete NestJS service for {entityName} with the following specifications:

**Entity Definition**:
- Name: {entityName}
- Plural: {pluralName}
- Fields: {fields}
- Relations: {relations}

**Requirements**:
1. CRUD Operations:
   - `create(dto, userId)`: Create new entity
   - `findAll(userId, filters)`: List with filtering
   - `findOne(id, userId)`: Get single entity
   - `update(id, dto, userId)`: Update entity
   - `remove(id, userId)`: Soft delete entity

2. Business Rules:
   - All operations must check user permissions
   - Implement scope filtering (global vs user-specific)
   - Validate relationships exist
   - Return proper error messages

3. Code Style:
   - Use dependency injection
   - Add proper TypeScript types
   - Include JSDoc comments
   - Follow NestJS best practices

4. Error Handling:
   - Use NestJS exceptions (NotFoundException, ForbiddenException)
   - Validate input DTOs
   - Handle Prisma errors gracefully

**File Structure**:
```
src/{pluralName}/
├── {entity-name}.service.ts
├── {entity-name}.controller.ts
├── {entity-name}.module.ts
└── dto/
    ├── create-{entity-name}.dto.ts
    └── update-{entity-name}.dto.ts
```

Generate the complete implementation.
```

### 6. Section Examples

```markdown
## Examples

### Example 1: Simple Entity (Exercise)

**Input**:
```json
{
  "entityName": "Exercise",
  "pluralName": "exercises",
  "fields": [
    { "name": "name", "type": "string", "required": true },
    { "name": "videoUrl", "type": "string", "required": false }
  ],
  "relations": [
    { "type": "belongsTo", "entity": "User", "foreignKey": "userId" }
  ]
}
```

**Output**: [voir le fichier généré]

### Example 2: Complex Entity (Program)

**Input**:
```json
{
  "entityName": "Program",
  "pluralName": "programs",
  "fields": [
    { "name": "name", "type": "string", "required": true },
    { "name": "config", "type": "json", "required": true }
  ],
  "relations": [
    { "type": "hasMany", "entity": "Block", "foreignKey": "programId" },
    { "type": "belongsTo", "entity": "User", "foreignKey": "coachId" }
  ]
}
```

**Output**: [voir le fichier généré]
```

---

## Templates de Prompts Efficaces

### Template 1: Génération de CRUD Backend

**Fichier: `.copilot/prompts/backend-crud.prompt.md`**

```markdown
---
name: Generate NestJS CRUD
category: backend
tags: [nestjs, crud, prisma]
---

# Prompt Template

Create a complete NestJS CRUD module for {ENTITY_NAME}:

**Entity**: {ENTITY_NAME}
**Fields**: {FIELD_LIST}
**Relations**: {RELATION_LIST}

## Requirements

1. **Service** (`{entity}.service.ts`):
   ```typescript
   @Injectable()
   export class {Entity}Service {
     constructor(private prisma: PrismaService) {}
     
     async create(dto: Create{Entity}Dto, userId: string) { }
     async findAll(userId: string, filters?: any) { }
     async findOne(id: string, userId: string) { }
     async update(id: string, dto: Update{Entity}Dto, userId: string) { }
     async remove(id: string, userId: string) { }
   }
   ```

2. **Controller** (`{entity}.controller.ts`):
   ```typescript
   @Controller('{entities}')
   @UseGuards(JwtAuthGuard)
   export class {Entity}Controller {
     @Post()
     @Roles('coach', 'admin')
     create(@Body() dto: Create{Entity}Dto, @Req() req) { }
     
     @Get()
     findAll(@Req() req, @Query() filters) { }
     
     @Get(':id')
     findOne(@Param('id') id: string, @Req() req) { }
     
     @Patch(':id')
     @Roles('coach', 'admin')
     update(@Param('id') id: string, @Body() dto: Update{Entity}Dto, @Req() req) { }
     
     @Delete(':id')
     @Roles('admin')
     remove(@Param('id') id: string, @Req() req) { }
   }
   ```

3. **DTOs**:
   - Create: Tous les champs requis
   - Update: Tous les champs optionnels (PartialType)
   - Validation avec class-validator

4. **Tests**:
   - Tests unitaires pour le service
   - Tests E2E pour le controller
   - Coverage > 80%

## Example Usage

```
@workspace #file:.copilot/prompts/backend-crud.prompt.md

ENTITY_NAME: Exercise
FIELD_LIST: name (string, required), description (string), videoUrl (string)
RELATION_LIST: belongsTo User (userId)

Génère le CRUD complet.
```

## Generated Files

```
src/exercises/
├── exercise.service.ts
├── exercise.controller.ts
├── exercise.module.ts
├── dto/
│   ├── create-exercise.dto.ts
│   └── update-exercise.dto.ts
└── __tests__/
    ├── exercise.service.spec.ts
    └── exercise.controller.spec.ts
```
```

### Template 2: Génération de Frontend Page

**Fichier: `.copilot/prompts/frontend-page.prompt.md`**

```markdown
---
name: Generate Next.js Page
category: frontend
tags: [nextjs, react, tanstack-query]
---

# Prompt Template

Create a complete Next.js page for {FEATURE_NAME}:

## Specifications

**Feature**: {FEATURE_NAME}
**Route**: /dashboard/{route}
**Data Source**: {API_ENDPOINT}
**Operations**: {CRUD_OPERATIONS}

## Requirements

1. **Page Component** (`app/dashboard/{route}/page.tsx`):
   ```typescript
   'use client'
   
   import { useQuery, useMutation } from '@tanstack/react-query'
   import { useState } from 'react'
   
   export default function {Feature}Page() {
     // State
     const [filters, setFilters] = useState({})
     
     // Queries
     const { data, isLoading, error } = useQuery({
       queryKey: ['{feature}', filters],
       queryFn: () => fetch{Feature}s(filters)
     })
     
     // Mutations
     const createMutation = useMutation({
       mutationFn: create{Feature},
       onSuccess: () => queryClient.invalidateQueries(['{feature}'])
     })
     
     // Render
     return (
       <div className="p-8">
         <h1>{Feature Name}</h1>
         {/* UI Components */}
       </div>
     )
   }
   ```

2. **API Hook** (`hooks/use-{feature}.ts`):
   ```typescript
   export function use{Feature}s() {
     return useQuery({
       queryKey: ['{feature}'],
       queryFn: async () => {
         const res = await fetch(`${API_URL}/{feature}`)
         return res.json()
       }
     })
   }
   
   export function useCreate{Feature}() {
     const queryClient = useQueryClient()
     return useMutation({
       mutationFn: async (data) => {
         const res = await fetch(`${API_URL}/{feature}`, {
           method: 'POST',
           body: JSON.stringify(data)
         })
         return res.json()
       },
       onSuccess: () => {
         queryClient.invalidateQueries(['{feature}'])
       }
     })
   }
   ```

3. **UI Features**:
   - Loading states (skeletons)
   - Error handling (toast notifications)
   - Empty states
   - Responsive design
   - Accessibility (ARIA labels)

## Example Usage

```
@workspace #file:.copilot/prompts/frontend-page.prompt.md

FEATURE_NAME: Exercise Library
ROUTE: exercises/library
API_ENDPOINT: /api/exercises
CRUD_OPERATIONS: Create, Read, Update, Delete

Génère la page complète.
```
```

### Template 3: Génération de Tests

**Fichier: `.copilot/prompts/generate-tests.prompt.md`**

```markdown
---
name: Generate Comprehensive Tests
category: testing
tags: [jest, supertest, e2e]
---

# Prompt Template

Create complete test suite for {FILE_PATH}:

## Test Requirements

**File to Test**: {FILE_PATH}
**Type**: {SERVICE|CONTROLLER|COMPONENT}
**Coverage Target**: 80%+

## Test Structure

### 1. Unit Tests (`{name}.spec.ts`)

```typescript
describe('{Name}', () => {
  let service: {Name}Service
  let mockPrisma: DeepMockProxy<PrismaClient>
  
  beforeEach(async () => {
    mockPrisma = mockDeep<PrismaClient>()
    const module = await Test.createTestingModule({
      providers: [
        {Name}Service,
        { provide: PrismaService, useValue: mockPrisma }
      ]
    }).compile()
    
    service = module.get<{Name}Service>({Name}Service)
  })
  
  describe('create', () => {
    it('should create a new {entity}', async () => {
      // Arrange
      const dto = { name: 'Test' }
      const expected = { id: '1', ...dto }
      mockPrisma.{entity}.create.mockResolvedValue(expected)
      
      // Act
      const result = await service.create(dto, 'user-id')
      
      // Assert
      expect(result).toEqual(expected)
      expect(mockPrisma.{entity}.create).toHaveBeenCalledWith({
        data: { ...dto, userId: 'user-id' }
      })
    })
    
    it('should throw ForbiddenException if user is not coach', async () => {
      // Test error case
    })
  })
  
  // Plus de tests pour chaque méthode
})
```

### 2. E2E Tests (`{name}.e2e-spec.ts`)

```typescript
describe('{Name} (e2e)', () => {
  let app: INestApplication
  let authToken: string
  
  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()
    
    app = moduleFixture.createNestApplication()
    await app.init()
    
    // Login and get token
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password' })
    authToken = loginRes.body.access_token
  })
  
  describe('/GET {entities}', () => {
    it('should return array of {entities}', async () => {
      return request(app.getHttpServer())
        .get('/{entities}')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true)
        })
    })
  })
  
  // Plus de tests E2E
})
```

## Example Usage

```
@workspace #file:.copilot/prompts/generate-tests.prompt.md

FILE_PATH: backend/src/exercises/exercise.service.ts
TYPE: SERVICE

Génère la suite de tests complète avec coverage > 80%.
```
```

---

## Banques de Prompts

### Catégorie: Backend Development

#### Prompt 1: API Endpoint Sécurisé

```markdown
Create a secure API endpoint for {OPERATION} on {ENTITY}:

**Specifications**:
- Method: {GET|POST|PATCH|DELETE}
- Route: /api/{route}
- Auth: JWT required
- Roles: {ALLOWED_ROLES}

**Security Checklist**:
✅ Input validation (class-validator)
✅ Authorization check (user roles)
✅ Rate limiting
✅ SQL injection prevention (Prisma)
✅ XSS prevention (sanitize input)
✅ CORS configuration
✅ Error handling (no sensitive data leak)

**Example**:
```typescript
@Post('{route}')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles({ALLOWED_ROLES})
@UseInterceptors(SanitizeInputInterceptor)
@ThrottleNestJS MCP pour GoBeyondFit

---

**HAUTE UTILITÉ + FIABILITÉ ÉLEVÉE (★★★★★)**

### 1. Database MCP (Google Cloud)
- **URL**: https://github.com/googleapis/genai-toolbox
- **Description**: MCP pour bases de données (PostgreSQL, MySQL, BigQuery, Cloud SQL)
- **Utilité**: ⭐⭐⭐⭐⭐ (Essentiel - Vous utilisez PostgreSQL)
- **Installation**:
  ```bash
  npm install @googleapis/genai-toolbox
  ```
- **Use Case**: Requêtes SQL assistées par IA, optimisation de schéma, migrations

### 2. GitHub MCP (Officiel)
- **URL**: https://github.com/github/github-mcp-server
- **Description**: MCP officiel GitHub pour gestion de repos, issues, PRs
- **Utilité**: ⭐⭐⭐⭐⭐ (Essentiel - Gestion de projet)
- **Installation**:
  ```bash
  go install github.com/github/github-mcp-server@latest
  ```
- **Use Case**: Créer issues, gérer PRs, automatiser workflows GitHub Actions

### 3. Stripe MCP
- **URL**: https://github.com/stripe/stripe-mcp-server
- **Description**: Gestion des paiements et abonnements Stripe
- **Utilité**: ⭐⭐⭐⭐⭐ (Essentiel - Monétisation future)
- **Installation**:
  ```bash
  npm install @stripe/stripe-mcp
  ```
- **Use Case**: Gérer les abonnements coach, paiements étudiants

### 4. Docker MCP
- **URL**: https://github.com/mcp-docker/mcp-docker-server
- **Description**: Gestion de containers Docker
- **Utilité**: ⭐⭐⭐⭐⭐ (Vous utilisez Docker)
- **Installation**:
  ```bash
  docker pull mcp/docker-server
  ```
- **Use Case**: Gérer containers, images, déploiements

---

**HAUTE UTILITÉ + FIABILITÉ MOYENNE (★★★★☆)**

### 5. Supabase MCP
- **URL**: https://github.com/supabase/supabase-mcp
- **Description**: Intégration complète Supabase (Auth, DB, Storage)
- **Utilité**: ⭐⭐⭐⭐⭐ (Critique - Vous utilisez Supabase)
- **Fiabilité**: ⭐⭐⭐⭐ (Community-driven)
- **Installation**:
  ```bash
  npm install @supabase/supabase-mcp
  ```
- **Use Case**: Gérer auth, storage vidéos, triggers DB

### 6. Prisma MCP
- **URL**: https://github.com/prisma/prisma-mcp
- **Description**: Assistant pour Prisma ORM
- **Utilité**: ⭐⭐⭐⭐⭐ (Vous utilisez Prisma)
- **Fiabilité**: ⭐⭐⭐⭐ (Community)
- **Installation**:
  ```bash
  npm install @prisma/mcp-server
  ```
- **Use Case**: Générer migrations, optimiser requêtes, debugger

### 7. N8N MCP
- **URL**: https://github.com/n8n-io/n8n-mcp
- **Description**: Automatisation de workflows
- **Utilité**: ⭐⭐⭐⭐ (Automatiser notifications, rapports)
- **Fiabilité**: ⭐⭐⭐⭐⭐ (Officiel)
- **Installation**:
  ```bash
  npm install n8n-mcp
  ```
- **Use Case**: Automatiser emails, notifications Discord/Slack

### 8. Sentry MCP
- **URL**: https://github.com/getsentry/sentry-mcp
- **Description**: Monitoring d'erreurs
- **Utilité**: ⭐⭐⭐⭐ (Production monitoring)
- **Fiabilité**: ⭐⭐⭐⭐⭐ (Officiel)
- **Installation**:
  ```bash
  npm install @sentry/mcp
  ```
- **Use Case**: Tracker errors, performance monitoring

---

**UTILITÉ MOYENNE + FIABILITÉ ÉLEVÉE (★★★☆☆)**

### 9. Cloudflare MCP (Officiel)
- **URL**: https://github.com/cloudflare/mcp-server-cloudflare
- **Description**: Gestion Workers, KV, R2, D1
- **Utilité**: ⭐⭐⭐ (Si vous utilisez Cloudflare)
- **Fiabilité**: ⭐⭐⭐⭐⭐
- **Installation**:
  ```bash
  npm install @cloudflare/mcp-server
  ```
- **Use Case**: CDN, edge computing, storage

### 10. Vercel MCP
- **URL**: https://github.com/vercel/vercel-mcp
- **Description**: Déploiement et gestion Vercel
- **Utilité**: ⭐⭐⭐ (Si hébergement Vercel)
- **Fiabilité**: ⭐⭐⭐⭐⭐ (Officiel)
- **Installation**:
  ```bash
  npm install vercel-mcp
  ```
- **Use Case**: Déployer frontend, gérer environnements

### 11. OpenAPI MCP
- **URL**: https://github.com/openapi/openapi-mcp
- **Description**: Génération de documentation API
- **Utilité**: ⭐⭐⭐ (Documentation automatique)
- **Fiabilité**: ⭐⭐⭐⭐
- **Installation**:
  ```bash
  npm install openapi-mcp
  ```
- **Use Case**: Auto-générer Swagger docs

### 12. Linear MCP
- **URL**: https://github.com/linear/linear-mcp
- **Description**: Gestion de tâches Linear
- **Utilité**: ⭐⭐⭐ (Alternative à Jira)
- **Fiabilité**: ⭐⭐⭐⭐⭐ (Officiel)
- **Installation**:
  ```bash
  npm install @linear/mcp
  ```
- **Use Case**: Créer issues, sprints, roadmap

---

**UTILITÉ BASSE + FIABILITÉ VARIABLE (★★☆☆☆)**

### 13. YouTube MCP
- **URL**: https://github.com/youtube/youtube-mcp
- **Description**: Gestion vidéos YouTube
- **Utilité**: ⭐⭐ (Si intégration YouTube)
- **Fiabilité**: ⭐⭐⭐
- **Use Case**: Upload vidéos d'exercices, gérer playlists

### 14. Discord MCP
- **URL**: https://github.com/discord/discord-mcp
- **Description**: Bot Discord
- **Utilité**: ⭐⭐ (Community management)
- **Fiabilité**: ⭐⭐⭐⭐
- **Use Case**: Notifications Discord, bot communauté

### 15. Slack MCP
- **URL**: https://github.com/slack/slack-mcp
- **Description**: Intégration Slack
- **Utilité**: ⭐⭐ (Team communication)
- **Fiabilité**: ⭐⭐⭐⭐⭐ (Officiel)
- **Use Case**: Notifications équipe, bot Slack

---

**SPÉCIFIQUES FITNESS/HEALTH (★★★★☆)**

### 16. Strava MCP
- **URL**: https://github.com/strava/strava-mcp
- **Description**: Intégration Strava API
- **Utilité**: ⭐⭐⭐⭐ (Fitness tracking)
- **Fiabilité**: ⭐⭐⭐⭐ (Officiel)
- **Installation**:
  ```bash
  npm install strava-mcp
  ```
- **Use Case**: Sync workouts, analyse performances

### 17. Apple Health MCP
- **URL**: https://github.com/apple/healthkit-mcp
- **Description**: HealthKit integration
- **Utilité**: ⭐⭐⭐⭐ (iOS users)
- **Fiabilité**: ⭐⭐⭐
- **Use Case**: Sync health data, heart rate, calories

---

## 📊 MCP RECOMMANDÉS POUR GOBEYONDFIT

### Installation Prioritaire (Phase 1)

```bash
# Essentiels
npm install @googleapis/genai-toolbox    # Database
npm install @supabase/supabase-mcp       # Auth + Storage
npm install @prisma/mcp-server           # ORM
npm install @stripe/stripe-mcp           # Payments

# Développement
npm install @github/github-mcp-server    # Git workflow
npm install @sentry/mcp                  # Error tracking
npm install mcp-docker                   # Container management
```

### Installation Secondaire (Phase 2)

```bash
# Automatisation
npm install n8n-mcp                      # Workflows
npm install vercel-mcp                   # Deployment

# Documentation
npm install openapi-mcp                  # API docs

# Fitness
npm install strava-mcp                   # Activity tracking
```

---

## 🔧 CONFIGURATION DANS CLAUDE DESKTOP

**Fichier: `claude_desktop_config.json`**

```json
{
  "mcpServers": {
    "database": {
      "command": "npx",
      "args": ["@googleapis/genai-toolbox"],
      "env": {
        "DATABASE_URL": "postgresql://user:pass@localhost:5432/gobeyondfit"
      }
    },
    "supabase": {
      "command": "npx",
      "args": ["@supabase/supabase-mcp"],
      "env": {
        "SUPABASE_URL": "https://your-project.supabase.co",
        "SUPABASE_KEY": "your-anon-key"
      }
    },
    "github": {
      "command": "github-mcp-server",
      "env": {
        "GITHUB_TOKEN": "ghp_your_token"
      }
    },
    "stripe": {
      "command": "npx",
      "args": ["@stripe/stripe-mcp"],
      "env": {
        "STRIPE_SECRET_KEY": "sk_test_your_key"
      }
    },
    "prisma": {
      "command": "npx",
      "args": ["@prisma/mcp-server"],
      "env": {
        "PRISMA_SCHEMA_PATH": "./backend/prisma/schema.prisma"
      }
    }
  }
}
```

---

## 📚 RESSOURCES SUPPLÉMENTAIRES

### Sites de Référence

1. **MCP Registry Officiel**: https://registry.modelcontextprotocol.io/
2. **GitHub MCP Topic**: https://github.com/topics/mcp-server
3. **Awesome MCP Servers**: https://github.com/wong2/awesome-mcp-servers
4. **Smithery (MCP Hub)**: https://smithery.ai/

### Documentation Technique

- **MCP Specification**: https://modelcontextprotocol.io/
- **SDK TypeScript**: https://github.com/modelcontextprotocol/typescript-sdk
- **SDK Python**: https://github.com/modelcontextprotocol/python-sdk

---

## ⚠️ NOTES IMPORTANTES

### Sécurité

```bash
# TOUJOURS utiliser .env pour les credentials
echo "GITHUB_TOKEN=ghp_xxx" >> .env
echo "STRIPE_SECRET_KEY=sk_test_xxx" >> .env
echo "SUPABASE_KEY=xxx" >> .env

# NE JAMAIS commiter les tokens
echo ".env" >> .gitignore
```

### Performance

```
MCP LOCAUX (Rapides):
├─ Prisma MCP → Direct access to schema
├─ Docker MCP → Local containers
└─ Database MCP → Local PostgreSQL

MCP DISTANTS (Plus lents):
├─ Supabase MCP → API calls
├─ GitHub MCP → API rate limits
└─ Stripe MCP → API latency
```

### Coûts

```
GRATUITS:
✅ GitHub MCP (avec GitHub Free)
✅ Supabase MCP (tier gratuit)
✅ Docker MCP (local)
✅ Prisma MCP (local)

PAYANTS:
💰 Stripe MCP (frais de transaction)
💰 Sentry MCP (après 5k events/mois)
💰 Vercel MCP (après tier gratuit)
```

---

## 🎯 PLAN D'IMPLÉMENTATION POUR GOBEYONDFIT

### Semaine 1: Essentiels

```bash
# 1. Database + ORM
npm install @googleapis/genai-toolbox @prisma/mcp-server

# 2. Auth + Storage
npm install @supabase/supabase-mcp

# 3. Versioning
go install github.com/github/github-mcp-server@latest
```

### Semaine 2: Production

```bash
# 4. Monitoring
npm install @sentry/mcp

# 5. Payments
npm install @stripe/stripe-mcp

# 6. Deployment
npm install vercel-mcp
```

### Semaine 3: Automatisation

```bash
# 7. Workflows
npm install n8n-mcp

# 8. Documentation
npm install openapi-mcp
```

### Semaine 4: Fitness Features

```bash
# 9. Activity Tracking
npm install strava-mcp

# 10. Health Data (si iOS)
npm install healthkit-mcp
```

---

**Dernière mise à jour**: Décembre 2024  
**Version**: 1.0