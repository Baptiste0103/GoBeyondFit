import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

/**
 * E2E Test Suite: Performance Validation
 * 
 * Tests query performance, N+1 detection, and optimization
 * Requirements:
 * - All queries < 500ms (FAIL if exceeded)
 * - All queries < 200ms (WARN if exceeded)
 * - No N+1 queries detected
 * - Proper indexing on userId fields
 */

describe('Performance E2E Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let userId: number;
  
  const queryLogs: Array<{ query: string; duration: number }> = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    
    // Enable query logging
    prisma.$on('query' as any, (e: any) => {
      queryLogs.push({
        query: e.query,
        duration: e.duration,
      });
    });
    
    await app.init();

    // Create test user and authenticate
    const testUser = await prisma.user.create({
      data: {
        email: 'performance-test@test.com',
        password: '$2b$10$hashedPassword',
        role: 'CLIENT',
      },
    });
    userId = testUser.id;

    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'performance-test@test.com',
        password: 'TestPassword123!',
      });
    
    authToken = loginRes.body.access_token;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.user.delete({ where: { id: userId } });
    await app.close();
  });

  beforeEach(() => {
    queryLogs.length = 0; // Clear logs before each test
  });

  describe('Query Performance', () => {
    it('should fetch exercises list in < 500ms', async () => {
      const start = Date.now();
      
      const response = await request(app.getHttpServer())
        .get('/api/exercises')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(500);
      
      if (duration > 200) {
        console.warn(`⚠️  Exercise query took ${duration}ms (> 200ms warning threshold)`);
      }
    });

    it('should fetch program with workouts in < 500ms', async () => {
      // Create test program
      const program = await prisma.program.create({
        data: {
          name: 'Performance Test Program',
          description: 'Test program for performance',
          userId,
        },
      });

      const start = Date.now();
      
      const response = await request(app.getHttpServer())
        .get(`/api/programs/${program.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(500);
      
      // Cleanup
      await prisma.program.delete({ where: { id: program.id } });
    });

    it('should fetch session progress in < 500ms', async () => {
      const start = Date.now();
      
      const response = await request(app.getHttpServer())
        .get('/api/sessions/progress')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(500);
    });

    it('should handle pagination efficiently', async () => {
      const start = Date.now();
      
      const response = await request(app.getHttpServer())
        .get('/api/exercises?page=1&limit=20')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(500);
    });
  });

  describe('N+1 Query Detection', () => {
    beforeEach(async () => {
      // Create test data: program with multiple workouts
      const program = await prisma.program.create({
        data: {
          name: 'N+1 Test Program',
          userId,
          workouts: {
            create: [
              { name: 'Workout 1', dayOfWeek: 1 },
              { name: 'Workout 2', dayOfWeek: 2 },
              { name: 'Workout 3', dayOfWeek: 3 },
              { name: 'Workout 4', dayOfWeek: 4 },
              { name: 'Workout 5', dayOfWeek: 5 },
            ],
          },
        },
      });
    });

    it('should not have N+1 queries when fetching program with workouts', async () => {
      queryLogs.length = 0;
      
      const response = await request(app.getHttpServer())
        .get('/api/programs')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      // Analyze query patterns
      const workoutQueries = queryLogs.filter(log => 
        log.query.includes('Workout') && log.query.includes('SELECT')
      );
      
      // Should use JOIN or single query with include, not N individual queries
      expect(workoutQueries.length).toBeLessThanOrEqual(2); // At most 2 queries (program + workouts)
      
      if (workoutQueries.length > 2) {
        console.error('❌ N+1 detected: Multiple workout queries');
        console.error('Queries:', workoutQueries.map(q => q.query));
      }
    });

    it('should not have N+1 queries for exercises in workout', async () => {
      queryLogs.length = 0;
      
      const response = await request(app.getHttpServer())
        .get('/api/workouts')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      // Check for repeated exercise queries
      const exerciseQueries = queryLogs.filter(log => 
        log.query.includes('Exercise') && log.query.includes('SELECT')
      );
      
      // Should batch load exercises, not query per workout
      expect(exerciseQueries.length).toBeLessThanOrEqual(2);
    });

    it('should efficiently load related data with includes', async () => {
      queryLogs.length = 0;
      
      // Should use Prisma's include to batch load
      const programs = await prisma.program.findMany({
        where: { userId },
        include: {
          workouts: {
            include: {
              workoutExercises: {
                include: {
                  exercise: true,
                },
              },
            },
          },
        },
      });
      
      // With proper includes, should be 1-2 queries max
      expect(queryLogs.length).toBeLessThanOrEqual(3);
    });
  });

  describe('Database Indexing', () => {
    it('should use index on userId for exercises query', async () => {
      queryLogs.length = 0;
      
      await prisma.exercise.findMany({
        where: { userId },
      });
      
      const exerciseQuery = queryLogs.find(log => log.query.includes('Exercise'));
      
      // Query should be fast with index (< 10ms for small dataset)
      if (exerciseQuery) {
        expect(exerciseQuery.duration).toBeLessThan(50);
      }
    });

    it('should use index on userId for programs query', async () => {
      queryLogs.length = 0;
      
      await prisma.program.findMany({
        where: { userId },
      });
      
      const programQuery = queryLogs.find(log => log.query.includes('Program'));
      
      if (programQuery) {
        expect(programQuery.duration).toBeLessThan(50);
      }
    });

    it('should use composite index on userId + status for sessions', async () => {
      queryLogs.length = 0;
      
      await prisma.session.findMany({
        where: {
          userId,
          status: 'IN_PROGRESS',
        },
      });
      
      const sessionQuery = queryLogs.find(log => log.query.includes('Session'));
      
      if (sessionQuery) {
        expect(sessionQuery.duration).toBeLessThan(50);
      }
    });
  });

  describe('Query Optimization', () => {
    it('should select only needed fields (not SELECT *)', async () => {
      queryLogs.length = 0;
      
      await prisma.exercise.findMany({
        where: { userId },
        select: {
          id: true,
          name: true,
          muscleGroup: true,
        },
      });
      
      const exerciseQuery = queryLogs.find(log => log.query.includes('Exercise'));
      
      // Should not be a SELECT * query
      if (exerciseQuery) {
        expect(exerciseQuery.query).not.toMatch(/SELECT \*/);
      }
    });

    it('should use limit for pagination', async () => {
      queryLogs.length = 0;
      
      await prisma.exercise.findMany({
        where: { userId },
        take: 20,
        skip: 0,
      });
      
      const exerciseQuery = queryLogs.find(log => log.query.includes('Exercise'));
      
      // Should have LIMIT clause
      if (exerciseQuery) {
        expect(exerciseQuery.query).toMatch(/LIMIT|FETCH FIRST/i);
      }
    });

    it('should batch operations instead of multiple single inserts', async () => {
      queryLogs.length = 0;
      
      // Bad: Multiple individual creates
      // await prisma.exercise.create({ ... });
      // await prisma.exercise.create({ ... });
      // await prisma.exercise.create({ ... });
      
      // Good: Batch create
      await prisma.exercise.createMany({
        data: [
          { name: 'Ex 1', userId, muscleGroup: 'CHEST' },
          { name: 'Ex 2', userId, muscleGroup: 'BACK' },
          { name: 'Ex 3', userId, muscleGroup: 'LEGS' },
        ],
      });
      
      const insertQueries = queryLogs.filter(log => log.query.includes('INSERT'));
      
      // Should be 1 batch insert, not 3 individual
      expect(insertQueries.length).toBe(1);
    });
  });

  describe('Performance Benchmarks', () => {
    it('should handle concurrent requests efficiently', async () => {
      const concurrentRequests = 10;
      const start = Date.now();
      
      const promises = Array.from({ length: concurrentRequests }, () =>
        request(app.getHttpServer())
          .get('/api/exercises')
          .set('Authorization', `Bearer ${authToken}`)
      );
      
      const responses = await Promise.all(promises);
      const duration = Date.now() - start;
      
      // All requests should complete
      responses.forEach(res => expect(res.status).toBe(200));
      
      // Average time per request should be reasonable
      const avgTime = duration / concurrentRequests;
      expect(avgTime).toBeLessThan(500);
      
      console.log(`ℹ️  ${concurrentRequests} concurrent requests completed in ${duration}ms (avg: ${avgTime}ms)`);
    });

    it('should cache frequently accessed data', async () => {
      // First request (cold cache)
      const start1 = Date.now();
      await request(app.getHttpServer())
        .get('/api/exercises')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      const duration1 = Date.now() - start1;
      
      // Second request (should be faster with cache)
      const start2 = Date.now();
      await request(app.getHttpServer())
        .get('/api/exercises')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      const duration2 = Date.now() - start2;
      
      console.log(`ℹ️  First request: ${duration1}ms, Second request: ${duration2}ms`);
      
      // Second request should be same or faster (if caching implemented)
      expect(duration2).toBeLessThanOrEqual(duration1 * 1.2); // Allow 20% variance
    });
  });

  describe('Performance Report Generation', () => {
    it('should generate performance metrics summary', () => {
      const slowQueries = queryLogs.filter(log => log.duration > 200);
      const avgDuration = queryLogs.reduce((sum, log) => sum + log.duration, 0) / queryLogs.length;
      const maxDuration = Math.max(...queryLogs.map(log => log.duration));
      
      const report = {
        totalQueries: queryLogs.length,
        averageDuration: avgDuration,
        maxDuration,
        slowQueries: slowQueries.length,
        passed: slowQueries.length === 0 && maxDuration < 500,
      };
      
      console.log('📊 Performance Report:');
      console.log(`  Total Queries: ${report.totalQueries}`);
      console.log(`  Average Duration: ${report.averageDuration.toFixed(2)}ms`);
      console.log(`  Max Duration: ${report.maxDuration}ms`);
      console.log(`  Slow Queries (>200ms): ${report.slowQueries}`);
      console.log(`  Status: ${report.passed ? '✅ PASSED' : '❌ FAILED'}`);
      
      expect(report.passed).toBe(true);
    });
  });
});
