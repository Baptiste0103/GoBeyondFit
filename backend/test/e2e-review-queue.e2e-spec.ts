import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

/**
 * E2E Test Suite: Coach Review Queue
 * 
 * Tests coach-specific workflows:
 * - Review queue access (coach only)
 * - Session review and approval
 * - Student progress tracking
 * - Calendar integration
 */

describe('Review Queue E2E Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let coachToken: string;
  let clientToken: string;
  let coachId: number;
  let clientId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    await app.init();

    // Create coach user
    const coach = await prisma.user.create({
      data: {
        email: 'coach@test.com',
        password: '$2b$10$hashedPassword',
        role: 'COACH',
      },
    });
    coachId = coach.id;

    // Create client user
    const client = await prisma.user.create({
      data: {
        email: 'client@test.com',
        password: '$2b$10$hashedPassword',
        role: 'CLIENT',
      },
    });
    clientId = client.id;

    // Authenticate both users
    const coachLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'coach@test.com', password: 'TestPassword123!' });
    coachToken = coachLogin.body.access_token;

    const clientLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'client@test.com', password: 'TestPassword123!' });
    clientToken = clientLogin.body.access_token;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.user.delete({ where: { id: coachId } });
    await prisma.user.delete({ where: { id: clientId } });
    await app.close();
  });

  describe('Review Queue Access Control', () => {
    it('should allow coach to access review queue', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/workouts/review-queue')
        .set('Authorization', `Bearer ${coachToken}`)
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should deny client access to review queue', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/workouts/review-queue')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(403);
      
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Forbidden');
    });

    it('should deny unauthenticated access to review queue', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/workouts/review-queue')
        .expect(401);
    });
  });

  describe('Session Submission and Review', () => {
    let sessionId: number;

    beforeAll(async () => {
      // Client creates and completes a session
      const program = await prisma.program.create({
        data: {
          name: 'Review Test Program',
          userId: clientId,
          workouts: {
            create: {
              name: 'Review Test Workout',
              dayOfWeek: 1,
            },
          },
        },
        include: { workouts: true },
      });

      const session = await prisma.session.create({
        data: {
          userId: clientId,
          workoutId: program.workouts[0].id,
          programId: program.id,
          status: 'COMPLETED',
          startedAt: new Date(),
          completedAt: new Date(),
        },
      });
      
      sessionId = session.id;
    });

    it('should list completed sessions in review queue', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/workouts/review-queue')
        .set('Authorization', `Bearer ${coachToken}`)
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
      
      // Should include our completed session
      const session = response.body.find(s => s.id === sessionId);
      expect(session).toBeDefined();
      expect(session.status).toBe('COMPLETED');
    });

    it('should allow coach to view session details', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/sessions/${sessionId}`)
        .set('Authorization', `Bearer ${coachToken}`)
        .expect(200);
      
      expect(response.body.id).toBe(sessionId);
      expect(response.body.userId).toBe(clientId);
    });

    it('should allow coach to approve session', async () => {
      const reviewData = {
        approved: true,
        feedback: 'Great workout! Keep it up!',
        rating: 5,
      };

      const response = await request(app.getHttpServer())
        .post(`/api/workouts/review-queue/${sessionId}/review`)
        .set('Authorization', `Bearer ${coachToken}`)
        .send(reviewData)
        .expect(200);
      
      expect(response.body.approved).toBe(true);
      expect(response.body.feedback).toBe(reviewData.feedback);
    });

    it('should not allow client to review their own session', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/workouts/review-queue/${sessionId}/review`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          approved: true,
          feedback: 'Self review',
        })
        .expect(403);
    });
  });

  describe('Review Queue Filtering', () => {
    beforeAll(async () => {
      // Create multiple sessions with different statuses
      const program = await prisma.program.create({
        data: {
          name: 'Filter Test Program',
          userId: clientId,
          workouts: {
            create: [
              { name: 'Workout 1', dayOfWeek: 1 },
              { name: 'Workout 2', dayOfWeek: 2 },
            ],
          },
        },
        include: { workouts: true },
      });

      await prisma.session.createMany({
        data: [
          {
            userId: clientId,
            workoutId: program.workouts[0].id,
            programId: program.id,
            status: 'PENDING_REVIEW',
            startedAt: new Date('2025-12-01'),
            completedAt: new Date('2025-12-01'),
          },
          {
            userId: clientId,
            workoutId: program.workouts[1].id,
            programId: program.id,
            status: 'APPROVED',
            startedAt: new Date('2025-12-08'),
            completedAt: new Date('2025-12-08'),
          },
        ],
      });
    });

    it('should filter by status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/workouts/review-queue?status=PENDING_REVIEW')
        .set('Authorization', `Bearer ${coachToken}`)
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
      
      // All results should have PENDING_REVIEW status
      response.body.forEach(session => {
        expect(session.status).toBe('PENDING_REVIEW');
      });
    });

    it('should filter by student (userId)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/workouts/review-queue?studentId=${clientId}`)
        .set('Authorization', `Bearer ${coachToken}`)
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
      
      // All results should belong to client
      response.body.forEach(session => {
        expect(session.userId).toBe(clientId);
      });
    });

    it('should filter by date range', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/workouts/review-queue?startDate=2025-12-01&endDate=2025-12-07')
        .set('Authorization', `Bearer ${coachToken}`)
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
      
      // All sessions should be within date range
      response.body.forEach(session => {
        const sessionDate = new Date(session.completedAt);
        expect(sessionDate >= new Date('2025-12-01')).toBe(true);
        expect(sessionDate <= new Date('2025-12-07')).toBe(true);
      });
    });

    it('should combine multiple filters', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/workouts/review-queue?status=PENDING_REVIEW&studentId=${clientId}`)
        .set('Authorization', `Bearer ${coachToken}`)
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
      
      response.body.forEach(session => {
        expect(session.status).toBe('PENDING_REVIEW');
        expect(session.userId).toBe(clientId);
      });
    });
  });

  describe('Calendar Integration', () => {
    it('should get calendar view of review queue', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/workouts/review-queue/calendar?month=12&year=2025')
        .set('Authorization', `Bearer ${coachToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('days');
      expect(Array.isArray(response.body.days)).toBe(true);
      
      // Calendar should have 31 days for December
      expect(response.body.days.length).toBe(31);
    });

    it('should show session count per day', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/workouts/review-queue/calendar?month=12&year=2025')
        .set('Authorization', `Bearer ${coachToken}`)
        .expect(200);
      
      // Each day should have session count
      response.body.days.forEach(day => {
        expect(day).toHaveProperty('date');
        expect(day).toHaveProperty('sessionCount');
        expect(typeof day.sessionCount).toBe('number');
      });
    });
  });

  describe('Student Progress Tracking', () => {
    it('should get student progress summary', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/students/${clientId}/progress`)
        .set('Authorization', `Bearer ${coachToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('totalSessions');
      expect(response.body).toHaveProperty('completedSessions');
      expect(response.body).toHaveProperty('pendingReviews');
      expect(response.body).toHaveProperty('averageRating');
    });

    it('should track weekly activity', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/students/${clientId}/activity?period=week`)
        .set('Authorization', `Bearer ${coachToken}`)
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(7); // 7 days
      
      response.body.forEach(day => {
        expect(day).toHaveProperty('date');
        expect(day).toHaveProperty('sessionCount');
      });
    });

    it('should deny client access to other students progress', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/students/${coachId}/progress`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(403);
    });
  });

  describe('Batch Operations', () => {
    let sessionIds: number[] = [];

    beforeAll(async () => {
      // Create multiple sessions for batch testing
      const program = await prisma.program.create({
        data: {
          name: 'Batch Test Program',
          userId: clientId,
          workouts: {
            create: { name: 'Batch Workout', dayOfWeek: 1 },
          },
        },
        include: { workouts: true },
      });

      const sessions = await prisma.session.createMany({
        data: [
          {
            userId: clientId,
            workoutId: program.workouts[0].id,
            programId: program.id,
            status: 'PENDING_REVIEW',
            startedAt: new Date(),
            completedAt: new Date(),
          },
          {
            userId: clientId,
            workoutId: program.workouts[0].id,
            programId: program.id,
            status: 'PENDING_REVIEW',
            startedAt: new Date(),
            completedAt: new Date(),
          },
          {
            userId: clientId,
            workoutId: program.workouts[0].id,
            programId: program.id,
            status: 'PENDING_REVIEW',
            startedAt: new Date(),
            completedAt: new Date(),
          },
        ],
      });

      // Get created session IDs
      const allSessions = await prisma.session.findMany({
        where: { userId: clientId, status: 'PENDING_REVIEW' },
      });
      sessionIds = allSessions.map(s => s.id);
    });

    it('should approve multiple sessions at once', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/workouts/review-queue/batch-approve')
        .set('Authorization', `Bearer ${coachToken}`)
        .send({
          sessionIds: sessionIds.slice(0, 2),
          feedback: 'Batch approved - good work!',
        })
        .expect(200);
      
      expect(response.body).toHaveProperty('approved');
      expect(response.body.approved).toBe(2);
    });

    it('should reject invalid batch operations', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/workouts/review-queue/batch-approve')
        .set('Authorization', `Bearer ${coachToken}`)
        .send({
          sessionIds: [99999, 99998], // Non-existent sessions
          feedback: 'Invalid',
        })
        .expect(404);
    });
  });
});
