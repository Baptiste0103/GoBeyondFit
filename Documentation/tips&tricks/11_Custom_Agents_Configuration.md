# 11. Configuration d'Agents Personnalisés

## Table des Matières
- [Introduction aux Custom Agents](#introduction-aux-custom-agents)
- [Background Agents](#background-agents)
- [Cloud Agents](#cloud-agents)
- [Codex Agents](#codex-agents)
- [Configuration Avancée](#configuration-avancée)
- [Cas d'Usage Pratiques](#cas-dusage-pratiques)

---

## Introduction aux Custom Agents

### Qu'est-ce qu'un Custom Agent ?

Les **Custom Agents** dans GitHub Copilot sont des agents spécialisés configurables qui peuvent :
- Exécuter des tâches en arrière-plan
- Se connecter à des services cloud
- Accéder à des API spécifiques
- Maintenir un contexte persistant

### Différence avec les Agents Simulés

| Feature | Agents Simulés (Files) | Custom Agents (Config) |
|---------|------------------------|------------------------|
| **Persistance** | Rechargé à chaque prompt | Contexte maintenu |
| **Exécution** | Synchrone dans le chat | Peut être asynchrone |
| **Configuration** | Fichiers markdown | Fichiers JSON/YAML |
| **Authentification** | Manuelle | Gérée par config |
| **État** | Stateless | Peut être stateful |

---

## Background Agents

### Qu'est-ce qu'un Background Agent ?

Un **Background Agent** est un agent qui s'exécute en arrière-plan et peut :
- ✅ Surveiller des changements de fichiers
- ✅ Exécuter des tâches périodiques
- ✅ Analyser le code en continu
- ✅ Envoyer des notifications

### Configuration d'un Background Agent

**Fichier: `.copilot/agents/background-agent.json`**

```json
{
  "name": "security-watcher",
  "type": "background",
  "description": "Surveille le code pour détecter les vulnérabilités",
  "config": {
    "interval": 300000,
    "triggers": [
      {
        "type": "file-change",
        "pattern": "**/*.ts",
        "action": "scan-security"
      },
      {
        "type": "schedule",
        "cron": "0 */4 * * *",
        "action": "full-audit"
      }
    ],
    "actions": {
      "scan-security": {
        "command": "npm audit",
        "notify": true,
        "severity": ["high", "critical"]
      },
      "full-audit": {
        "command": "npm audit --audit-level=moderate",
        "notify": true,
        "report": true
      }
    }
  }
}
```

### Cas d'Usage Background Agents

#### 1. Surveillance Continue de la Sécurité

```json
{
  "name": "continuous-security",
  "type": "background",
  "config": {
    "watchers": [
      {
        "path": "backend/src/**/*.ts",
        "checks": [
          "sql-injection",
          "xss-vulnerabilities",
          "hardcoded-secrets"
        ]
      },
      {
        "path": "backend/package.json",
        "checks": [
          "outdated-dependencies",
          "vulnerable-packages"
        ]
      }
    ],
    "notifications": {
      "slack": true,
      "email": false,
      "vscode": true
    }
  }
}
```

#### 2. Optimisation de Performance Automatique

```json
{
  "name": "performance-optimizer",
  "type": "background",
  "config": {
    "monitors": [
      {
        "metric": "bundle-size",
        "threshold": "5MB",
        "action": "suggest-optimization"
      },
      {
        "metric": "query-time",
        "threshold": "100ms",
        "action": "suggest-index"
      }
    ],
    "auto-fix": {
      "enabled": false,
      "require-approval": true
    }
  }
}
```

#### 3. Synchronisation de Documentation

```json
{
  "name": "doc-sync",
  "type": "background",
  "config": {
    "sources": [
      {
        "type": "code-comments",
        "output": "docs/api/"
      },
      {
        "type": "jsdoc",
        "output": "docs/reference/"
      }
    ],
    "schedule": "0 2 * * *",
    "commit": {
      "auto": true,
      "message": "docs: auto-update from code comments"
    }
  }
}
```

---

## Cloud Agents

### Qu'est-ce qu'un Cloud Agent ?

Un **Cloud Agent** est un agent qui s'exécute dans le cloud et peut :
- ✅ Accéder à des API externes
- ✅ Se connecter à des bases de données distantes
- ✅ Utiliser des services cloud (AWS, Azure, GCP)
- ✅ Partager le contexte entre développeurs

### Configuration d'un Cloud Agent

**Fichier: `.copilot/agents/cloud-agent.json`**

```json
{
  "name": "database-cloud-agent",
  "type": "cloud",
  "description": "Agent cloud pour gérer les bases de données",
  "config": {
    "endpoint": "https://api.yourservice.com/mcp",
    "authentication": {
      "type": "bearer",
      "token": "${CLOUD_AGENT_TOKEN}"
    },
    "services": [
      {
        "name": "supabase",
        "type": "database",
        "connection": {
          "url": "${SUPABASE_URL}",
          "key": "${SUPABASE_KEY}"
        }
      },
      {
        "name": "stripe",
        "type": "payment",
        "connection": {
          "apiKey": "${STRIPE_SECRET_KEY}"
        }
      }
    ],
    "capabilities": [
      "query-database",
      "manage-subscriptions",
      "generate-reports"
    ]
  }
}
```

### Cas d'Usage Cloud Agents

#### 1. Agent de Gestion de Base de Données

```json
{
  "name": "database-manager",
  "type": "cloud",
  "config": {
    "provider": "supabase",
    "credentials": {
      "url": "${SUPABASE_URL}",
      "serviceKey": "${SUPABASE_SERVICE_KEY}"
    },
    "capabilities": [
      {
        "name": "query",
        "description": "Exécute des requêtes SQL sécurisées",
        "permissions": ["read"]
      },
      {
        "name": "schema-inspect",
        "description": "Inspecte le schéma de la base",
        "permissions": ["read"]
      },
      {
        "name": "backup",
        "description": "Crée des backups",
        "permissions": ["read"],
        "schedule": "0 3 * * *"
      }
    ],
    "security": {
      "readonly": true,
      "whitelist-tables": ["users", "exercises", "programs"]
    }
  }
}
```

#### 2. Agent de CI/CD

```json
{
  "name": "cicd-cloud-agent",
  "type": "cloud",
  "config": {
    "provider": "github-actions",
    "credentials": {
      "token": "${GITHUB_TOKEN}"
    },
    "workflows": [
      {
        "name": "deploy-production",
        "trigger": "manual",
        "steps": [
          "npm run test",
          "npm run build",
          "docker build",
          "kubectl apply"
        ]
      },
      {
        "name": "run-e2e-tests",
        "trigger": "on-pr",
        "parallel": true
      }
    ]
  }
}
```

#### 3. Agent de Monitoring

```json
{
  "name": "monitoring-agent",
  "type": "cloud",
  "config": {
    "provider": "datadog",
    "credentials": {
      "apiKey": "${DATADOG_API_KEY}"
    },
    "metrics": [
      {
        "name": "api-response-time",
        "threshold": 200,
        "alert": true
      },
      {
        "name": "error-rate",
        "threshold": 0.01,
        "alert": true
      }
    ],
    "dashboards": [
      "performance",
      "errors",
      "user-activity"
    ]
  }
}
```

---

## Codex Agents

### Qu'est-ce qu'un Codex Agent ?

Un **Codex Agent** est un agent spécialisé dans la génération et l'analyse de code qui peut :
- ✅ Générer du code complexe
- ✅ Refactoriser automatiquement
- ✅ Détecter les patterns anti-patterns
- ✅ Suggérer des améliorations architecturales

### Configuration d'un Codex Agent

**Fichier: `.copilot/agents/codex-agent.json`**

```json
{
  "name": "advanced-codegen",
  "type": "codex",
  "description": "Agent de génération de code avancée",
  "config": {
    "model": "gpt-4-turbo",
    "temperature": 0.2,
    "context": {
      "architecture": ".copilot/agents/architecture-agent-context.md",
      "patterns": ".copilot/patterns/",
      "examples": ".copilot/examples/"
    },
    "capabilities": [
      {
        "name": "generate-crud",
        "template": "templates/nestjs-crud.hbs",
        "validation": true
      },
      {
        "name": "refactor-extract-method",
        "threshold": 20,
        "preserve-behavior": true
      },
      {
        "name": "generate-tests",
        "coverage-target": 80,
        "frameworks": ["jest", "supertest"]
      }
    ],
    "rules": [
      {
        "type": "naming-convention",
        "pattern": "camelCase",
        "apply-to": ["variables", "functions"]
      },
      {
        "type": "max-lines",
        "value": 300,
        "action": "suggest-split"
      }
    ]
  }
}
```

### Cas d'Usage Codex Agents

#### 1. Générateur de CRUD Complet

```json
{
  "name": "crud-generator",
  "type": "codex",
  "config": {
    "templates": {
      "service": "templates/service.template.ts",
      "controller": "templates/controller.template.ts",
      "dto": "templates/dto.template.ts",
      "test": "templates/test.template.ts"
    },
    "generation-rules": {
      "validate-dtos": true,
      "generate-tests": true,
      "add-swagger-docs": true,
      "use-prisma": true
    },
    "example": {
      "input": "Entity: Exercise with fields: name, description, videoUrl",
      "output": [
        "src/exercises/exercise.service.ts",
        "src/exercises/exercise.controller.ts",
        "src/exercises/dto/create-exercise.dto.ts",
        "src/exercises/dto/update-exercise.dto.ts",
        "src/exercises/exercise.service.spec.ts"
      ]
    }
  }
}
```

#### 2. Agent de Refactoring Intelligent

```json
{
  "name": "smart-refactorer",
  "type": "codex",
  "config": {
    "detection": {
      "long-methods": {
        "threshold": 50,
        "action": "suggest-extract"
      },
      "duplicated-code": {
        "similarity": 0.8,
        "action": "suggest-extract-util"
      },
      "complex-conditionals": {
        "cyclomatic-complexity": 10,
        "action": "suggest-strategy-pattern"
      }
    },
    "refactoring-patterns": [
      "extract-method",
      "extract-class",
      "introduce-parameter-object",
      "replace-conditional-with-polymorphism"
    ],
    "safety": {
      "run-tests-before": true,
      "run-tests-after": true,
      "require-approval": true
    }
  }
}
```

#### 3. Agent de Migration de Code

```json
{
  "name": "migration-agent",
  "type": "codex",
  "config": {
    "migrations": [
      {
        "from": "JavaScript",
        "to": "TypeScript",
        "rules": [
          "add-type-annotations",
          "convert-require-to-import",
          "add-interfaces"
        ]
      },
      {
        "from": "REST",
        "to": "GraphQL",
        "rules": [
          "generate-schema",
          "create-resolvers",
          "add-subscriptions"
        ]
      }
    ],
    "validation": {
      "type-check": true,
      "run-tests": true,
      "lint": true
    }
  }
}
```

---

## Configuration Avancée

### Chaînage d'Agents

**Fichier: `.copilot/workflows/feature-complete.json`**

```json
{
  "name": "complete-feature-workflow",
  "description": "Workflow complet de développement d'une feature",
  "agents": [
    {
      "agent": "architecture-agent",
      "phase": "design",
      "output": "architecture-plan.md"
    },
    {
      "agent": "crud-generator",
      "phase": "implementation",
      "input": "architecture-plan.md",
      "output": "generated-code/"
    },
    {
      "agent": "testing-agent",
      "phase": "testing",
      "input": "generated-code/",
      "output": "test-reports/"
    },
    {
      "agent": "security-agent",
      "phase": "validation",
      "input": "generated-code/",
      "output": "security-report.md"
    },
    {
      "agent": "doc-generator",
      "phase": "documentation",
      "input": "generated-code/",
      "output": "docs/"
    }
  ],
  "error-handling": {
    "on-failure": "rollback",
    "notify": true
  }
}
```

### Agents avec Authentification

**Fichier: `.copilot/agents/authenticated-agent.json`**

```json
{
  "name": "github-integration",
  "type": "cloud",
  "config": {
    "authentication": {
      "type": "oauth2",
      "flow": "authorization_code",
      "auth-url": "https://github.com/login/oauth/authorize",
      "token-url": "https://github.com/login/oauth/access_token",
      "scopes": ["repo", "workflow"],
      "credentials": {
        "client-id": "${GITHUB_CLIENT_ID}",
        "client-secret": "${GITHUB_CLIENT_SECRET}"
      }
    },
    "endpoints": {
      "create-pr": "POST /repos/{owner}/{repo}/pulls",
      "list-issues": "GET /repos/{owner}/{repo}/issues",
      "trigger-workflow": "POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches"
    }
  }
}
```

### Variables d'Environnement

**Fichier: `.copilot/agents/.env.example`**

```bash
# Cloud Agents
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# CI/CD
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
VERCEL_TOKEN=xxxxxxxxxxxxxxxxxxxx

# Monitoring
DATADOG_API_KEY=xxxxxxxxxxxxxxxxxxxx
SENTRY_DSN=https://xxx@sentry.io/xxx

# Payment
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxx

# Security
NPM_TOKEN=npm_xxxxxxxxxxxxxxxxxxxx
```

---

## Cas d'Usage Pratiques

### Workflow 1: Développement Feature Complète

```
ÉTAPE 1: DESIGN AVEC CLOUD AGENT
─────────────────────────────────
Agent: architecture-cloud-agent
Action: Consulte les patterns existants sur le cloud
Output: Architecture proposal avec diagrammes

ÉTAPE 2: GÉNÉRATION AVEC CODEX AGENT
─────────────────────────────────────
Agent: crud-generator-codex
Input: Architecture proposal
Action: Génère tout le code (service, controller, DTOs, tests)
Output: Code complet

ÉTAPE 3: VALIDATION BACKGROUND
───────────────────────────────
Agent: security-background-agent
Action: Scanne le code généré en arrière-plan
Output: Security report (si problèmes → alerte)

ÉTAPE 4: TESTS CLOUD
────────────────────
Agent: testing-cloud-agent
Action: Lance les tests E2E sur environnement cloud
Output: Test results + coverage report

ÉTAPE 5: DÉPLOIEMENT CLOUD
───────────────────────────
Agent: cicd-cloud-agent
Action: Déploie sur staging si tests OK
Output: Deployment URL
```

### Workflow 2: Maintenance Continue

```
BACKGROUND AGENTS ACTIFS EN PERMANENCE:
───────────────────────────────────────

Agent 1: security-watcher
└─ Surveille: Nouvelles vulnérabilités CVE
└─ Action: Crée une issue GitHub automatiquement
└─ Fréquence: Toutes les 4h

Agent 2: performance-monitor
└─ Surveille: Bundle size, query time
└─ Action: Suggère optimisations
└─ Fréquence: À chaque build

Agent 3: doc-sync
└─ Surveille: Commentaires de code
└─ Action: Met à jour la documentation
└─ Fréquence: Tous les jours à 2h

Agent 4: dependency-updater
└─ Surveille: Nouvelles versions de dépendances
└─ Action: Crée une PR avec les mises à jour
└─ Fréquence: Hebdomadaire
```

### Workflow 3: Code Review Automatisé

```
CLOUD AGENT: code-review-agent
──────────────────────────────

Trigger: Sur chaque Pull Request

Actions:
1. ✅ Analyse la qualité du code
2. ✅ Vérifie les tests (coverage > 80%)
3. ✅ Scanne les vulnérabilités
4. ✅ Vérifie le respect des patterns
5. ✅ Suggère des améliorations
6. ✅ Poste un commentaire sur la PR

Configuration:
{
  "checks": [
    "eslint",
    "prettier",
    "tests-coverage",
    "security-scan",
    "performance-analysis"
  ],
  "auto-approve": {
    "enabled": true,
    "conditions": [
      "all-checks-passed",
      "coverage >= 80%",
      "no-vulnerabilities"
    ]
  }
}
```

---

## Comparaison des Types d'Agents

| Feature | Background | Cloud | Codex |
|---------|-----------|-------|-------|
| **Exécution** | Asynchrone | Remote | Synchrone/Async |
| **Contexte** | Local | Cloud | Local + Cloud |
| **Authentification** | Non requis | OAuth/API Key | API Key |
| **Persistance** | Session | Multi-session | Session |
| **Coût** | Gratuit | Payant | Payant (API) |
| **Cas d'usage** | Surveillance | API externes | Génération code |
| **Performance** | Léger | Variable | Intensif |

---

## Best Practices

### 1. Sécurité

```json
{
  "security-rules": {
    "never-commit-secrets": true,
    "use-env-variables": true,
    "rotate-tokens": "monthly",
    "least-privilege": true,
    "audit-logs": true
  }
}
```

### 2. Performance

```json
{
  "performance-rules": {
    "cache-responses": true,
    "batch-operations": true,
    "rate-limiting": {
      "enabled": true,
      "requests-per-minute": 60
    },
    "timeout": 30000
  }
}
```

### 3. Monitoring

```json
{
  "monitoring": {
    "log-all-requests": true,
    "track-errors": true,
    "measure-latency": true,
    "alert-on-failure": true,
    "dashboard": "grafana"
  }
}
```

---

## Limitations

### GitHub Copilot vs Claude Code CLI

| Feature | GitHub Copilot | Claude Code CLI |
|---------|----------------|-----------------|
| **Custom Agents** | Limité (config JSON) | Complet (Python SDK) |
| **Persistance** | Session | Multi-session |
| **Contexte** | Rechargé | Persistant |
| **Background Tasks** | Simulé | Natif |
| **Cloud Integration** | Partiel | Complet |

**Note**: GitHub Copilot se concentre sur l'assistance à la programmation, pas sur l'orchestration d'agents complexes comme Claude Code CLI.

---

## Ressources

- [GitHub Copilot Documentation](https://docs.github.com/en/copilot)
- [MCP Protocol Specification](https://modelcontextprotocol.io/)
- [Agent Configuration Examples](https://github.com/modelcontextprotocol/servers)
- [GoBeyondFit Architecture](../10_ARCHITECTURE.md)

---

*Dernière mise à jour: Décembre 2024*
*Version: 1.0*
