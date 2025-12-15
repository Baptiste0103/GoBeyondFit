import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import * as bcrypt from 'bcrypt';
import request = require('supertest');

/**
 * Create a properly configured test application instance
 * Applies the same configuration as main.ts
 */
export async function createTestApp(): Promise<{
  app: INestApplication;
  prisma: PrismaService;
}> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  
  // Apply the same configuration as main.ts
  app.setGlobalPrefix('api');
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(
    new AllExceptionsFilter(),
    new HttpExceptionFilter(),
  );

  app.enableCors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  });

  const prisma = app.get<PrismaService>(PrismaService);
  
  await app.init();
  
  return { app, prisma };
}

/**
 * Clean up test data from database
 * WARNING: This deletes data in the order that respects foreign key constraints
 */
export async function cleanupDatabase(prisma: PrismaService): Promise<void> {
  if (!prisma) {
    console.log('Cleanup skipped: prisma is undefined');
    return;
  }
  
  try {
    // Delete in correct order to avoid FK violations
    await prisma.exerciseMedia.deleteMany({});
    await prisma.sessionProgress.deleteMany({});
    await prisma.sessionExercise.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.week.deleteMany({});
    await prisma.programBlock.deleteMany({});
    await prisma.programAssignment.deleteMany({});
    await prisma.programAudit.deleteMany({});
    await prisma.program.deleteMany({});
    await prisma.exerciseHistory.deleteMany({});
    await prisma.exerciseRating.deleteMany({});
    await prisma.favoriteExercise.deleteMany({});
    await prisma.exercise.deleteMany({});
    await prisma.groupMember.deleteMany({});
    await prisma.invitation.deleteMany({});
    await prisma.group.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.userBadge.deleteMany({});
    await prisma.user.deleteMany({});
  } catch (error) {
    console.log('Cleanup error (expected if tables empty):', error.message);
  }
}

/**
 * Hash a password using bcrypt (same as the app)
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Register a test user and return auth token
 * Uses the API endpoint which handles password hashing
 */
export async function registerTestUser(
  app: INestApplication,
  email: string,
  pseudo: string,
  password: string,
  role: 'STUDENT' | 'COACH',
): Promise<{ token: string; userId: string }> {
  const response = await request(app.getHttpServer())
    .post('/api/auth/register')
    .send({ email, pseudo, password, role })
    .expect(201);

  return {
    token: response.body.access_token,
    userId: response.body.user.id,
  };
}

/**
 * Login a test user and return auth token
 */
export async function loginTestUser(
  app: INestApplication,
  email: string,
  password: string,
): Promise<{ token: string; userId: string }> {
  const response = await request(app.getHttpServer())
    .post('/api/auth/login')
    .send({ email, password })
    .expect(200);

  return {
    token: response.body.access_token,
    userId: response.body.user.id,
  };
}

/**
 * Create a test user directly in database and return login token
 * Useful when you need more control over user creation
 */
export async function createTestUserWithAuth(
  app: INestApplication,
  prisma: PrismaService,
  email: string,
  pseudo: string,
  password: string,
  role: 'admin' | 'coach' | 'student',
): Promise<{ token: string; userId: string }> {
  // Hash password first
  const hashedPassword = await hashPassword(password);
  
  // Create user directly in database
  const user = await prisma.user.create({
    data: {
      email,
      pseudo,
      password: hashedPassword,
      role,
    },
  });
  
  // Login to get token
  const response = await request(app.getHttpServer())
    .post('/api/auth/login')
    .send({ email, password });
  
  return {
    token: response.body.access_token,
    userId: user.id,
  };
}
