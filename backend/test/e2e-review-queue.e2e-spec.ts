import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request = require('supertest');
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp, cleanupDatabase, createTestUserWithAuth } from './test-utils';

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
  let coachId: string;
  let clientId: string;
  let userId: string;

  beforeAll(async () => {
    const testApp = await createTestApp();
    app = testApp.app;
    prisma = testApp.prisma;

    // Create coach user
    const coach = await createTestUserWithAuth(
      app,
      prisma,
      'coach-review@test.com',
      'CoachReview',
      'TestPassword123!',
      'coach',
    );
    coachId = coach.userId;
    coachToken = coach.token;

    // Create client user
    const client = await createTestUserWithAuth(
      app,
      prisma,
      'client-review@test.com',
      'ClientReview',
      'TestPassword123!',
      'student',
    );
    clientId = client.userId;
    clientToken = client.token;
    userId = coachId;
  });

  afterAll(async () => {
    // Cleanup
    await cleanupDatabase(prisma);
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
    let sessionId: string;

    beforeAll(async () => {
      // Create a test program with proper structure
      const program = await prisma.program.create({
        data: {
          title: 'Review Test Program',
          coachId: coachId,
          blocks: {
            create: {
              title: 'Review Block',
              position: 1,
              weeks: {
                create: {
                  weekNumber: 1,
                  position: 1,
                  sessions: {
                    create: {
                      title: 'Review Session',
                      position: 1,
                    },
                  },
                },
              },
            },
          },
        },
        include: {
          blocks: {
            include: {
              weeks: {
                include: {
                  sessions: true,
                },
              },
            },
          },
        },
      });

      const session = program.blocks[0]?.weeks[0]?.sessions[0];
      if (!session) {
        throw new Error('Session not created');
      }

      // Create session progress for the client
      await prisma.sessionProgress.create({
        data: {
          sessionId: session.id,
          studentId: clientId,
          progress: { exercises: [] },
          reviewStatus: 'pending',
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
          title: 'Filter Test Program',
          coachId: coachId,
          blocks: {
            create: {
              title: 'Filter Block',
              position: 1,
              weeks: {
                create: [{
                  weekNumber: 1,
                  position: 1,
                  sessions: {
                    create: [
                      { title: 'Session 1', position: 1, date: new Date('2025-12-01') },
                      { title: 'Session 2', position: 2, date: new Date('2025-12-08') },
                    ],
                  },
                }],
              },
            },
          },
        },
        include: {
          blocks: {
            include: {
              weeks: {
                include: {
                  sessions: true,
                },
              },
            },
          },
        },
      });

      const sessions = program.blocks[0]?.weeks[0]?.sessions || [];
      
      // Create progress for both sessions
      await prisma.sessionProgress.createMany({
        data: [
          {
            sessionId: sessions[0].id,
            studentId: clientId,
            progress: { exercises: [] },
            reviewStatus: 'pending',
          },
          {
            sessionId: sessions[1].id,
            studentId: clientId,
            progress: { exercises: [] },
            reviewStatus: 'reviewed',
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
    let sessionIds: string[] = [];

    beforeAll(async () => {
      // Create multiple sessions for batch testing
      const program = await prisma.program.create({
        data: {
          title: 'Batch Test Program',
          coachId: coachId,
          blocks: {
            create: {
              title: 'Batch Block',
              position: 1,
              weeks: {
                create: {
                  weekNumber: 1,
                  position: 1,
                  sessions: {
                    create: [
                      { title: 'Batch Session 1', position: 1 },
                      { title: 'Batch Session 2', position: 2 },
                      { title: 'Batch Session 3', position: 3 },
                    ],
                  },
                },
              },
            },
          },
        },
        include: {
          blocks: {
            include: {
              weeks: {
                include: {
                  sessions: true,
                },
              },
            },
          },
        },
      });

      const sessions = program.blocks[0]?.weeks[0]?.sessions || [];
      sessionIds = sessions.map(s => s.id);

      // Create progress for all sessions
      await prisma.sessionProgress.createMany({
        data: sessions.map(session => ({
          sessionId: session.id,
          studentId: clientId,
          progress: { exercises: [] },
          reviewStatus: 'pending',
        })),
      });
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
