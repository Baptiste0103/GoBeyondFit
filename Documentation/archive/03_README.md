# GoBeyondFit - Fitness Coaching Platform

A comprehensive web platform for fitness coaching allowing coaches to create programs and students to track workouts.

## Project Structure

```
GoBeyondFitWebApp/
├── backend/              # NestJS backend application
│   ├── src/
│   │   ├── auth/         # Authentication module
│   │   ├── exercises/    # Exercise management
│   │   ├── groups/       # Group management
│   │   ├── prisma/       # Database setup
│   │   └── main.ts       # Application entry point
│   ├── prisma/
│   │   └── schema.prisma # Database schema
│   ├── .env.example      # Environment variables template
│   └── package.json
└── frontend/             # Next.js frontend application
    ├── app/
    │   ├── auth/         # Authentication pages
    │   ├── coach/        # Coach dashboard
    │   ├── student/      # Student dashboard
    │   └── page.tsx      # Home page
    ├── lib/
    │   ├── api.ts        # API client
    │   ├── supabase.ts   # Supabase config
    │   ├── i18n.ts       # Internationalization
    │   └── react-query.tsx # React Query setup
    ├── .env.local        # Environment variables
    └── package.json
```

## Technology Stack

### Backend
- **Framework**: NestJS with TypeScript (Strict Mode)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Supabase Auth + Passport JWT
- **Storage**: Supabase Storage (S3 compatible)
- **API Documentation**: Swagger/OpenAPI
- **Email**: Nodemailer
- **Validation**: class-validator & class-transformer

### Frontend
- **Framework**: Next.js 14+ with App Router
- **Styling**: TailwindCSS + shadcn/ui
- **Animation**: Framer Motion
- **State Management**: TanStack Query v5
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React
- **Language Support**: EN/FR

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL database (or Supabase)
- Supabase account

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your values:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/gobeyondfit"
   SUPABASE_URL="https://your-project.supabase.co"
   SUPABASE_KEY="your-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   JWT_SECRET="your-jwt-secret-key"
   JWT_EXPIRATION="3600"
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-app-password"
   EMAIL_FROM="noreply@gobeyondfit.com"
   APP_URL="http://localhost:3000"
   NODE_ENV="development"
   ```

4. **Setup database**
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Run development server**
   ```bash
   npm run start:dev
   ```

   Backend will be available at `http://localhost:3000`
   Swagger API docs at `http://localhost:3000/api/docs`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Update .env.local with your Supabase credentials
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

   Frontend will be available at `http://localhost:3001`

## Database Schema

The database includes the following main entities:

- **User**: User accounts with roles (admin, coach, student)
- **Exercise**: Fitness exercises with different types (standard, EMOM, AMRAP, custom)
- **Group**: Groups managed by coaches
- **GroupMember**: Members of groups
- **Program**: Workout programs created by coaches
- **ProgramBlock**: Blocks within programs
- **Week**: Weeks within blocks
- **Session**: Workout sessions
- **SessionExercise**: Exercises within sessions
- **SessionProgress**: Student progress tracking
- **ProgramAssignment**: Assignment of programs to students
- **Badge**: Achievement badges
- **UserBadge**: Badges earned by users
- **Notification**: User notifications

## API Endpoints

### Authentication
- `POST /auth/signup` - Create new user account
- `GET /auth/me` - Get current authenticated user
- `GET /auth/users` - Get all users
- `GET /auth/users/:id` - Get user by ID
- `PUT /auth/users/:id` - Update user profile
- `DELETE /auth/users/:id` - Delete user
- `GET /auth/students/:coachId` - Get students managed by coach

### Exercises
- `POST /exercises` - Create exercise
- `GET /exercises` - Get all exercises
- `GET /exercises/global` - Get global exercises
- `GET /exercises/coach/:coachId` - Get coach's exercises
- `GET /exercises/:id` - Get exercise by ID
- `PUT /exercises/:id` - Update exercise
- `DELETE /exercises/:id` - Delete exercise

### Groups
- `POST /groups` - Create group
- `GET /groups` - Get all groups
- `GET /groups/owner/:ownerId` - Get coach's groups
- `GET /groups/:id` - Get group by ID
- `PUT /groups/:id` - Update group
- `DELETE /groups/:id` - Delete group
- `POST /groups/:id/members` - Add group member
- `GET /groups/:id/members` - Get group members
- `DELETE /groups/:id/members/:userId` - Remove group member

## Development Guidelines

### Code Style
- Use TypeScript with Strict Mode enabled
- No `any` types - always properly type code
- Use DTOs for all API inputs/outputs
- Follow NestJS modular architecture

### Architecture
- **Backend**: Services handle business logic, controllers handle HTTP
- **Repository Pattern**: Use repositories for data access
- **Error Handling**: Implement custom HTTP exception filters
- **Frontend**: Use React Query for server state, local state for UI

### Validation
- Backend: Use class-validator decorators
- Frontend: Use Zod for form validation

### Testing
- Backend: Jest for unit and E2E tests
- Frontend: React Testing Library for component tests

## Environment Variables

### Backend (.env)
See `.env.example` for all required variables

### Frontend (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=
```

## Running Tests

### Backend
```bash
cd backend

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

### Frontend
```bash
cd frontend

# Run tests
npm run test
```

## Deployment

### Docker Setup
```bash
# Build Docker images
docker-compose build

# Run containers
docker-compose up
```

### Environment for Production
Update environment variables for:
- Database connection
- JWT secret (use strong random key)
- SMTP credentials for email
- Supabase project settings

## Features Implemented

### Phase 1: Foundation ✓
- NestJS + Prisma setup
- Supabase configuration
- JWT authentication
- User management
- Swagger documentation

### Phase 2: Core Domain ✓
- Exercise CRUD operations
- Group management
- Invitation system (pending)

### Phase 3: Program Builder
- Program management (pending)
- Nested structure (pending)
- Audit logging (pending)
- Access control (pending)

### Phase 4: Student Experience
- Session tracking (pending)
- Progress logging (pending)
- Video uploads (pending)

### Phase 5: Gamification
- Badge system (pending)
- Statistics & analytics (pending)

## Contributing

1. Follow the code style guidelines
2. Write tests for new features
3. Update documentation
4. Commit with clear messages

## Support

For issues or questions, please create an issue in the repository.

## License

MIT License
