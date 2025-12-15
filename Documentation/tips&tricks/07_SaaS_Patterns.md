# Patterns Spécifiques SaaS avec Copilot

## Table des Matières
1. [Multi-Tenancy](#multi-tenancy)
2. [Subscription & Billing](#subscription-billing)
3. [Authentication & Authorization](#authentication-authorization)
4. [Background Jobs & Queues](#background-jobs-queues)
5. [Webhooks & Integrations](#webhooks-integrations)
6. [Email & Notifications](#email-notifications)
7. [Search & Filtering](#search-filtering)

---

## Multi-Tenancy

### Pattern 1: Row-Level Multi-Tenancy

**Shared Database, Tenant Isolation via tenant_id:**

```
"Implement multi-tenant architecture for fitness SaaS:

**Requirements:**
- Multiple gyms/trainers (tenants) sharing the app
- Each tenant has isolated data
- Tenant identified by organizationId
- Some shared data (exercise library)

**Implementation:**

1. **Database Schema:**
```prisma
// Shared across tenants
model Exercise {
  id          String @id @default(uuid())
  name        String
  description String
  isGlobal    Boolean @default(true)
  // ... other fields
}

// Tenant-specific models
model Organization {
  id       String @id @default(uuid())
  name     String
  slug     String @unique
  users    User[]
  programs Program[]
  // ... other fields
}

model User {
  id             String @id @default(uuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  email          String
  // ... other fields
  
  @@unique([organizationId, email]) // Email unique per tenant
  @@index([organizationId])
}

model Program {
  id             String @id @default(uuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  name           String
  // ... other fields
  
  @@index([organizationId])
}
```

2. **Tenant Context Middleware:**
```typescript
// Extract tenant from JWT or subdomain
// Attach to request
// Validate tenant access
```

3. **Prisma Middleware:**
```typescript
// Auto-inject tenant_id in all queries
// Prevent cross-tenant data access
// Apply to create, update, delete, findMany
```

4. **Authorization Guards:**
```typescript
// Verify user belongs to tenant
// Check permissions within tenant
```

**Provide complete implementation with:**
- Prisma schema
- NestJS middleware
- Prisma middleware for auto-filtering
- Authorization guards
- Unit tests
- Migration strategy from single-tenant"
```

---

### Pattern 2: Separate Database Per Tenant

**For Enterprise Clients:**

```
"Implement separate database per tenant for enterprise tier:

**Requirements:**
- Standard tier: shared database
- Enterprise tier: dedicated database
- Transparent switching in application code
- Database provisioning automation

**Implementation:**

1. **Tenant Configuration:**
```typescript
type TenantConfig = {
  id: string;
  tier: 'standard' | 'enterprise';
  databaseUrl?: string; // For enterprise
  // ... other config
}
```

2. **Dynamic Prisma Client:**
```typescript
// Client factory based on tenant
// Connection pooling per tenant
// Cache clients for performance
```

3. **Provisioning Service:**
```typescript
// Create new database for enterprise signup
// Run migrations
// Seed with initial data
// Configure backup
```

4. **Migration Strategy:**
```typescript
// Run migrations on all databases
// Track migration status per tenant
// Handle failures gracefully
```

**Provide:**
- Tenant configuration management
- Dynamic Prisma client implementation
- Database provisioning automation
- Migration orchestration
- Monitoring and alerting"
```

---

## Subscription & Billing

### Stripe Integration Complete

```
"Implement complete Stripe subscription billing:

**Requirements:**
1. **Tiers:** Free, Pro ($29/mo), Enterprise ($99/mo)
2. **Features:**
   - Subscribe/upgrade/downgrade
   - Prorated billing
   - Trial period (14 days)
   - Payment method management
   - Invoice history
   - Failed payment handling
   - Cancellation with grace period

**Implementation:**

1. **Database Schema:**
```prisma
model Subscription {
  id                  String   @id @default(uuid())
  userId              String   @unique
  user                User     @relation(fields: [userId], references: [id])
  
  stripeCustomerId    String   @unique
  stripeSubscriptionId String? @unique
  
  tier                SubscriptionTier @default(FREE)
  status              SubscriptionStatus @default(ACTIVE)
  
  currentPeriodStart  DateTime?
  currentPeriodEnd    DateTime?
  cancelAtPeriodEnd   Boolean @default(false)
  trialEnd            DateTime?
  
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}

enum SubscriptionTier {
  FREE
  PRO
  ENTERPRISE
}

enum SubscriptionStatus {
  ACTIVE
  TRIALING
  PAST_DUE
  CANCELED
  INCOMPLETE
}

model Invoice {
  id            String   @id @default(uuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  
  stripeInvoiceId String @unique
  amount          Int
  currency        String
  status          String
  hostedInvoiceUrl String?
  
  paidAt          DateTime?
  createdAt       DateTime @default(now())
  
  @@index([userId])
}
```

2. **Subscription Service:**
- createSubscription(userId, tier, paymentMethod)
- upgradeSubscription(userId, newTier)
- downgradeSubscription(userId, newTier) // at period end
- cancelSubscription(userId)
- resumeSubscription(userId)
- updatePaymentMethod(userId, paymentMethod)

3. **Webhook Handler:**
```typescript
// Handle Stripe events:
- customer.subscription.created
- customer.subscription.updated
- customer.subscription.deleted
- invoice.payment_succeeded
- invoice.payment_failed
- payment_method.attached

// Implement:
- Signature verification
- Idempotency (don't process twice)
- Event logging
- Retry logic
```

4. **Rate Limiting by Tier:**
```typescript
// Enforce limits based on subscription:
- Free: 100 requests/hour
- Pro: 1000 requests/hour
- Enterprise: 10000 requests/hour
```

5. **Feature Gating:**
```typescript
// Check features by tier:
@RequiresPlan('PRO')
createAdvancedWorkout() {}

// Decorator implementation
```

**Provide:**
- Complete schema
- SubscriptionService implementation
- Stripe webhook handler with all events
- Rate limiting middleware
- Feature gate decorators
- Frontend integration points
- Error handling for all scenarios
- Comprehensive tests with Stripe test mode"
```

---

### Usage-Based Billing

```
"Implement usage-based billing (like AWS):

**Requirements:**
- Track API usage per user
- Bill based on usage at end of month
- Show usage dashboard
- Set usage limits per tier
- Soft and hard limits

**Implementation:**

1. **Usage Tracking:**
```typescript
// Track every API call
// Store: userId, endpoint, timestamp, resourcesUsed
// Aggregate daily
```

2. **Billing Calculation:**
```typescript
// Monthly job to calculate usage
// Create Stripe invoice with line items
// Send invoice to user
```

3. **Usage Limits:**
```typescript
// Check usage before allowing request
// Soft limit: warning email
// Hard limit: block request
```

4. **Dashboard:**
```typescript
// Show current usage
// Estimate monthly cost
// Historical usage charts
```

Provide complete implementation"
```

---

## Authentication & Authorization

### Social Login (OAuth)

```
"Implement social login with Google and GitHub:

**Requirements:**
- Google OAuth 2.0
- GitHub OAuth
- Link social accounts to existing users
- Create account from social login
- Avatar from social profile

**Implementation:**

1. **OAuth Flow:**
- Redirect to provider
- Handle callback
- Exchange code for tokens
- Fetch user profile
- Create or link user

2. **Database:**
```prisma
model User {
  id String @id @default(uuid())
  email String @unique
  password String? // Nullable for social-only users
  
  socialAccounts SocialAccount[]
}

model SocialAccount {
  id         String @id @default(uuid())
  userId     String
  user       User @relation(fields: [userId], references: [id])
  
  provider   String // 'google' | 'github'
  providerAccountId String
  accessToken String?
  refreshToken String?
  
  @@unique([provider, providerAccountId])
}
```

3. **Passport Strategies:**
- GoogleStrategy
- GitHubStrategy

4. **Account Linking:**
- Link social to existing email
- Require email verification
- Handle conflicts

**Provide:**
- Complete OAuth implementation
- Passport strategies
- Account linking logic
- Frontend integration
- Security best practices"
```

---

### Role-Based Access Control (RBAC)

```
"Implement comprehensive RBAC system:

**Requirements:**
- Roles: SUPER_ADMIN, ORG_ADMIN, TRAINER, USER
- Permissions: granular (read:users, write:programs, etc.)
- Role hierarchy
- Resource-based permissions

**Implementation:**

1. **Database Schema:**
```prisma
model User {
  id    String @id
  roles UserRole[]
}

model Role {
  id          String @id
  name        String @unique
  description String
  permissions Permission[]
  users       UserRole[]
}

model Permission {
  id          String @id
  resource    String // 'users', 'programs', etc.
  action      String // 'create', 'read', 'update', 'delete'
  roles       Role[]
  
  @@unique([resource, action])
}

model UserRole {
  userId String
  user   User @relation(fields: [userId], references: [id])
  roleId String
  role   Role @relation(fields: [roleId], references: [id])
  
  // Optional: scope to organization
  organizationId String?
  
  @@id([userId, roleId])
}
```

2. **Guards:**
```typescript
@UseGuards(PermissionGuard('write:programs'))
createProgram() {}

// Check user has permission
```

3. **Decorators:**
```typescript
@RequiresPermission('read:users')
@RequiresRole('ORG_ADMIN')
```

4. **Resource-Level:**
```typescript
// User can only edit their own programs
// Unless they're ADMIN
checkResourceOwnership()
```

**Provide complete RBAC implementation with:**
- Schema
- Guards and decorators
- Permission checking logic
- Seeding roles/permissions
- Admin UI for role management
- Tests"
```

---

## Background Jobs & Queues

### Bull/BullMQ Implementation

```
"Implement background job system with BullMQ:

**Use Cases:**
1. Send emails (welcome, notifications)
2. Generate PDF reports
3. Process video uploads
4. Sync with external APIs
5. Cleanup expired data

**Implementation:**

1. **Setup:**
```typescript
// Redis connection
// Queue configuration
// Worker processes
// Job processors
```

2. **Email Queue:**
```typescript
interface EmailJob {
  to: string;
  template: string;
  data: any;
}

// Add job
await emailQueue.add('send-email', jobData, {
  attempts: 3,
  backoff: { type: 'exponential', delay: 2000 }
});

// Process job
emailQueue.process('send-email', async (job) => {
  // Send email
  // Handle errors
  // Report progress
});
```

3. **Scheduled Jobs:**
```typescript
// Daily cleanup at 2 AM
await cleanupQueue.add('cleanup-expired', {}, {
  repeat: { cron: '0 2 * * *' }
});
```

4. **Job Monitoring:**
```typescript
// Dashboard to view:
- Pending jobs
- Active jobs
- Completed jobs
- Failed jobs
- Retry status
```

5. **Error Handling:**
```typescript
// Failed job handling
// Dead letter queue
- Alerting on failures
// Manual retry
```

**Provide:**
- BullMQ setup
- Queue definitions
- Job processors
- Error handling
- Monitoring dashboard
- Admin controls (pause, retry, etc.)
- Tests"
```

---

## Webhooks & Integrations

### Outgoing Webhooks

```
"Implement outgoing webhooks system:

**Requirements:**
- Users can register webhook URLs
- Events: program.created, workout.completed, etc.
- Retry on failure
- Signature verification for recipients
- Delivery logs

**Implementation:**

1. **Database:**
```prisma
model Webhook {
  id        String @id
  userId    String
  url       String
  events    String[] // ['program.created', 'workout.completed']
  secret    String // For signature
  isActive  Boolean @default(true)
  createdAt DateTime @default(now())
}

model WebhookDelivery {
  id         String @id
  webhookId  String
  event      String
  payload    Json
  status     String // 'pending', 'success', 'failed'
  attempts   Int @default(0)
  response   String?
  createdAt  DateTime @default(now())
  deliveredAt DateTime?
}
```

2. **Event System:**
```typescript
// Emit events throughout app
eventEmitter.emit('program.created', program);

// Webhook service listens
// Sends to all registered webhooks
```

3. **Delivery:**
```typescript
// HTTP POST to webhook URL
// Include signature header
// Retry logic: 1min, 5min, 30min, 2h, 6h
// Max 5 attempts
// Exponential backoff
```

4. **Signature:**
```typescript
// HMAC-SHA256 signature
// Recipient can verify authenticity
```

**Provide complete webhook system"
```

---

### Incoming Webhooks (e.g., Stripe, GitHub)

```
"Implement secure incoming webhook handler:

**Requirements:**
- Support multiple providers (Stripe, GitHub, etc.)
- Signature verification
- Idempotency
- Event logging
- Retry handling

**Implementation:**

1. **Webhook Controller:**
```typescript
@Post('webhooks/stripe')
async handleStripeWebhook(@Req() req, @Headers('stripe-signature') sig) {
  // Verify signature
  // Parse event
  // Process idempotently
  // Return 200 quickly
  // Process async if needed
}
```

2. **Signature Verification:**
```typescript
// Provider-specific verification
// Stripe: stripe.webhooks.constructEvent()
// GitHub: crypto.timingSafeEqual()
```

3. **Idempotency:**
```typescript
// Store event IDs
// Don't process twice
// Use database unique constraint
```

4. **Event Processing:**
```typescript
// Quick response to webhook
// Queue for async processing
// Handle all event types
```

**Provide secure webhook handler with tests"
```

---

## Email & Notifications

### Transactional Email System

```
"Implement transactional email system:

**Requirements:**
- Welcome emails
- Password reset
- Email verification
- Subscription notifications
- Workout reminders
- Template-based
- Queue for async sending
- Track delivery status

**Implementation:**

1. **Email Service:**
```typescript
// Integration with SendGrid/AWS SES
// Template rendering (Handlebars)
// Queue for sending
// Bounce handling
// Unsubscribe management
```

2. **Templates:**
```typescript
// Email templates:
- welcome.hbs
- password-reset.hbs
- subscription-updated.hbs

// Template context type-safe
```

3. **Scheduling:**
```typescript
// Schedule emails (workout reminders)
// Batch digest emails
// Drip campaigns
```

4. **Tracking:**
```typescript
model EmailLog {
  id           String @id
  userId       String
  template     String
  subject      String
  status       String // 'sent', 'delivered', 'bounced'
  sentAt       DateTime
  deliveredAt  DateTime?
  openedAt     DateTime?
}
```

**Provide complete email system with:**
- Service implementation
- Template system
- Queue integration
- Tracking
- Tests with email mocking"
```

---

### Multi-Channel Notifications

```
"Implement notification system with multiple channels:

**Channels:**
1. In-app notifications
2. Email
3. Push notifications (web/mobile)
4. SMS (Twilio)

**Requirements:**
- User preferences (per channel)
- Notification center UI
- Mark as read
- Real-time delivery (WebSocket)
- Fallback if primary channel fails

**Implementation:**

1. **Database:**
```prisma
model Notification {
  id        String @id
  userId    String
  type      String // 'workout_reminder', 'subscription_update'
  title     String
  message   String
  data      Json?
  isRead    Boolean @default(false)
  channels  String[] // ['in_app', 'email', 'push']
  createdAt DateTime @default(now())
  readAt    DateTime?
}

model NotificationPreference {
  userId   String @id
  email    Boolean @default(true)
  push     Boolean @default(true)
  sms      Boolean @default(false)
  inApp    Boolean @default(true)
  
  // Per event type
  workoutReminder Boolean @default(true)
  subscriptionUpdate Boolean @default(true)
}
```

2. **Notification Service:**
```typescript
async send(userId, notification) {
  // Check user preferences
  // Send to enabled channels
  // Store in-app notification
  // Queue email/push/SMS
  // Send via WebSocket if user online
}
```

3. **Real-time:**
```typescript
// WebSocket gateway
// Emit notification to connected users
// Update notification center UI
```

**Provide complete multi-channel notification system"
```

---

## Search & Filtering

### Full-Text Search

```
"Implement full-text search for exercises:

**Requirements:**
- Search by name, description, muscle groups
- Fuzzy matching
- Result ranking
- Autocomplete suggestions
- Fast (<100ms)

**Options:**
1. PostgreSQL full-text search
2. Elasticsearch (if needed for scale)

**Implementation (PostgreSQL):**

1. **Schema:**
```prisma
model Exercise {
  id          String @id
  name        String
  description String
  searchVector Unsupported("tsvector")? // For full-text
  
  @@index([searchVector], map: "search_idx", type: Gin)
}
```

2. **Search Query:**
```typescript
// Use tsquery for search
// Rank by relevance
// Highlight matches
```

3. **Autocomplete:**
```typescript
// Suggest as user types
// Top 10 results
// Debounce requests
```

4. **Indexing:**
```typescript
// Trigger to update search vector
// Or app-level update on save
```

**Provide:**
- Schema with full-text
- Migration
- Search service
- Autocomplete endpoint
- Performance optimization"
```

---

### Advanced Filtering System

```
"Implement advanced filtering for workout programs:

**Filters:**
- Difficulty level (beginner, intermediate, advanced)
- Duration (< 30min, 30-60min, > 60min)
- Equipment (bodyweight, dumbbells, barbell, machines)
- Muscle groups (chest, back, legs, etc.)
- Goals (strength, hypertrophy, endurance)
- Trainer/creator
- Rating (> 4 stars)
- Price (free, paid)

**Requirements:**
- Multiple filters combinable
- Filter counts (show # of results per filter)
- Query string serialization (shareable URLs)
- Pagination with filters
- Sort options

**Implementation:**

1. **Query Builder:**
```typescript
class ProgramFilter {
  difficulty?: string[];
  duration?: string;
  equipment?: string[];
  muscleGroups?: string[];
  minRating?: number;
  trainerId?: string;
  isFree?: boolean;
}

buildQuery(filters: ProgramFilter) {
  // Build Prisma where clause
  // Handle arrays (OR within, AND between)
  // Handle ranges
}
```

2. **Filter Counts:**
```typescript
// For each filter option, show count
// e.g., "Beginner (45), Intermediate (120)"
// Requires aggregation query
```

3. **URL Serialization:**
```typescript
// filters to query string
// query string to filters
// ?difficulty=beginner,intermediate&equipment=dumbbells
```

4. **Performance:**
```typescript
// Proper indexes on filter columns
// Caching popular filter combinations
```

**Provide complete filtering system"
```

---

## Prochaines Étapes

Patterns SaaS maîtrisés ! Complétez avec :

- [08_Team_Collaboration.md](08_Team_Collaboration.md) - Collaboration d'équipe et CI/CD
- [09_Prompt_Library.md](09_Prompt_Library.md) - Bibliothèque de prompts

---

*Dernière mise à jour : Décembre 2025*
