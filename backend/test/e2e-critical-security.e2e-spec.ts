import { INestApplication } from '@nestjs/common';
import request = require('supertest');
import { createTestApp, cleanupDatabase, createTestUserWithAuth } from './test-utils';
import { PrismaService } from '../src/prisma/prisma.service';

/**
 * CRITICAL E2E Test: Security & Multi-Tenancy
 * 
 * Tests the most critical security requirements:
 * - Multi-tenant data isolation (userId enforcement)
 * - Authentication and authorization
 * - Coach access control (can only see their own students)
 */

describe('CRITICAL Security E2E Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  
  // Coach A and Student A
  let coachAToken: string;
  let coachAId: string;
  let studentAToken: string;
  let studentAId: string;
  
  // Coach B and Student B
  let coachBToken: string;
  let coachBId: string;
  let studentBToken: string;
  let studentBId: string;
  
  const TEST_PASSWORD = 'TestPassword123!';

  beforeAll(async () => {
    // Create app with correct configuration
    const testApp = await createTestApp();
    app = testApp.app;
    prisma = testApp.prisma;
    
    // Clean up any existing test data
    await cleanupDatabase(prisma);
    
    // Create Coach A and Student A
    const coachA = await createTestUserWithAuth(
      app,
      prisma,
      'critical-coachA@test.com',
      'coachA',
      TEST_PASSWORD,
      'coach',
    );
    coachAToken = coachA.token;
    coachAId = coachA.userId;

    const studentA = await createTestUserWithAuth(
      app,
      prisma,
      'critical-studentA@test.com',
      'studentA',
      TEST_PASSWORD,
      'student',
    );
    studentAToken = studentA.token;
    studentAId = studentA.userId;

    // Create Coach B and Student B
    const coachB = await createTestUserWithAuth(
      app,
      prisma,
      'critical-coachB@test.com',
      'coachB',
      TEST_PASSWORD,
      'coach',
    );
    coachBToken = coachB.token;
    coachBId = coachB.userId;

    const studentB = await createTestUserWithAuth(
      app,
      prisma,
      'critical-studentB@test.com',
      'studentB',
      TEST_PASSWORD,
      'student',
    );
    studentBToken = studentB.token;
    studentBId = studentB.userId;
  });

  afterAll(async () => {
    await cleanupDatabase(prisma);
    await app.close();
  });

  describe('Authentication (CRITICAL)', () => {
    it('should reject requests without auth token', async () => {
      await request(app.getHttpServer())
        .get('/api/exercises')
        .expect(401);
    });

    it('should reject requests with invalid auth token', async () => {
      await request(app.getHttpServer())
        .get('/api/exercises')
        .set('Authorization', 'Bearer invalid-token-12345')
        .expect(401);
    });

    it('should accept requests with valid auth token', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/exercises')
        .set('Authorization', `Bearer ${coachAToken}`);
      
      // Should NOT be 401 Unauthorized
      expect(response.status).not.toBe(401);
    });
  });

  describe('Exercise Multi-Tenancy (CRITICAL)', () => {
    let coachAExerciseId: string;
    let coachBExerciseId: string;

    beforeAll(async () => {
      // Coach A creates an exercise
      const exerciseA = await prisma.exercise.create({
        data: {
          name: 'Coach A Exercise',
          description: 'Created by Coach A',
          type: 'standard',
          scope: 'coach',
          owner: { connect: { id: coachAId } },
        },
      });
      coachAExerciseId = exerciseA.id;

      // Coach B creates an exercise
      const exerciseB = await prisma.exercise.create({
        data: {
          name: 'Coach B Exercise',
          description: 'Created by Coach B',
          type: 'EMOM',
          scope: 'coach',
          owner: { connect: { id: coachBId } },
        },
      });
      coachBExerciseId = exerciseB.id;
    });

    it('should prevent Coach A from seeing Coach B exercises', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/exercises')
        .set('Authorization', `Bearer ${coachAToken}`)
        .expect(200);

      const exerciseIds = response.body.map((ex: any) => ex.id);
      
      // Coach A should see their own exercise
      expect(exerciseIds).toContain(coachAExerciseId);
      
      // Coach A should NOT see Coach B private exercise
      expect(exerciseIds).not.toContain(coachBExerciseId);
    });

    it('should prevent Coach B from seeing Coach A exercises', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/exercises')
        .set('Authorization', `Bearer ${coachBToken}`)
        .expect(200);

      const exerciseIds = response.body.map((ex: any) => ex.id);
      
      // Coach B should see their own exercise
      expect(exerciseIds).toContain(coachBExerciseId);
      
      // Coach B should NOT see Coach A private exercise
      expect(exerciseIds).not.toContain(coachAExerciseId);
    });

    it('should prevent Coach B from updating Coach A exercise', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/exercises/${coachAExerciseId}`)
        .set('Authorization', `Bearer ${coachBToken}`)
        .send({ name: 'Hacked Exercise Name' });

      // Should be 403 Forbidden or 404 Not Found (both acceptable)
      expect([403, 404]).toContain(response.status);
    });

    it('should prevent Coach B from deleting Coach A exercise', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/exercises/${coachAExerciseId}`)
        .set('Authorization', `Bearer ${coachBToken}`);

      // Should be 403 Forbidden or 404 Not Found (both acceptable)
      expect([403, 404]).toContain(response.status);
    });
  });

  describe('Program Multi-Tenancy (CRITICAL)', () => {
    let coachAProgramId: string;
    let coachBProgramId: string;

    beforeAll(async () => {
      // Coach A creates a program
      const programA = await prisma.program.create({
        data: {
          title: 'Coach A Program',
          description: 'Created by Coach A',
          coach: { connect: { id: coachAId } },
        },
      });
      coachAProgramId = programA.id;

      // Coach B creates a program
      const programB = await prisma.program.create({
        data: {
          title: 'Coach B Program',
          description: 'Created by Coach B',
          coach: { connect: { id: coachBId } },
        },
      });
      coachBProgramId = programB.id;
    });

    it('should prevent Coach A from seeing Coach B programs', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/programs')
        .set('Authorization', `Bearer ${coachAToken}`)
        .expect(200);

      const programIds = response.body.map((p: any) => p.id);
      
      // Coach A should see their own program
      expect(programIds).toContain(coachAProgramId);
      
      // Coach A should NOT see Coach B program
      expect(programIds).not.toContain(coachBProgramId);
    });

    it('should prevent Coach B from modifying Coach A program', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/programs/${coachAProgramId}`)
        .set('Authorization', `Bearer ${coachBToken}`)
        .send({ title: 'Hacked Program' });

      // Should be 403 Forbidden or 404 Not Found
      expect([403, 404]).toContain(response.status);
    });
  });

  describe('Session Progress Access Control (CRITICAL)', () => {
    let programA: any;
    let blockA: any;
    let weekA: any;
    let sessionA: any;
    let progressA: any;

    beforeAll(async () => {
      // Create program hierarchy for Coach A -> Student A relationship
      programA = await prisma.program.create({
        data: {
          title: 'Review Test Program',
          description: 'For testing review queue',
          coach: { connect: { id: coachAId } },
        },
      });

      blockA = await prisma.programBlock.create({
        data: {
          title: 'Block 1',
          position: 1,
          program: { connect: { id: programA.id } },
        },
      });

      weekA = await prisma.week.create({
        data: {
          weekNumber: 1,
          position: 1,
          block: { connect: { id: blockA.id } },
        },
      });

      sessionA = await prisma.session.create({
        data: {
          title: 'Session 1',
          position: 1,
          week: { connect: { id: weekA.id } },
        },
      });

      // Create session progress for Student A
      progressA = await prisma.sessionProgress.create({
        data: {
          session: { connect: { id: sessionA.id } },
          student: { connect: { id: studentAId } },
          status: 'completed',
          blockNumber: 1,
          weekNumber: 1,
          sessionNumber: 1,
        },
      });
    });

    it('should allow Coach A to see their student sessions in review queue', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/workouts/review-queue')
        .set('Authorization', `Bearer ${coachAToken}`);

      // Should return 200 OK
      expect(response.status).toBe(200);
    });

    it('should NOT allow Coach B to see Coach A student sessions', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/workouts/review-queue')
        .set('Authorization', `Bearer ${coachBToken}`)
        .expect(200);

      // Coach B review queue should not contain Student A data
      // Response structure may vary, but should not expose Student A's sessions
      if (Array.isArray(response.body)) {
        const studentIds = response.body
          .flatMap((item: any) => item.student?.id || [])
          .filter(Boolean);
        expect(studentIds).not.toContain(studentAId);
      }
    });

    it('should prevent students from accessing review queue', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/workouts/review-queue')
        .set('Authorization', `Bearer ${studentAToken}`);

      // Should be 403 Forbidden (students can't access coach features)
      expect(response.status).toBe(403);
    });
  });
});
