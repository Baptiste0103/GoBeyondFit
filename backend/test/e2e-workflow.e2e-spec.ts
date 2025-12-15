import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

/**
 * E2E Test Suite: User Workflow Validation
 * 
 * Tests complete user journeys from start to finish:
 * - Program creation workflow
 * - Workout session workflow
 * - Exercise library workflow
 */

describe('Workflow E2E Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let userId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    await app.init();

    // Create test user
    const testUser = await prisma.user.create({
      data: {
        email: 'workflow-test@test.com',
        password: '$2b$10$hashedPassword',
        role: 'CLIENT',
      },
    });
    userId = testUser.id;

    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'workflow-test@test.com',
        password: 'TestPassword123!',
      });
    
    authToken = loginRes.body.access_token;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.user.delete({ where: { id: userId } });
    await app.close();
  });

  describe('Program Creation Workflow', () => {
    let createdProgramId: number;
    let createdExerciseIds: number[] = [];

    it('Step 1: User creates exercises for program', async () => {
      // Create multiple exercises
      const exercises = [
        { name: 'Bench Press', muscleGroup: 'CHEST', equipment: 'BARBELL' },
        { name: 'Squats', muscleGroup: 'LEGS', equipment: 'BARBELL' },
        { name: 'Deadlift', muscleGroup: 'BACK', equipment: 'BARBELL' },
        { name: 'Shoulder Press', muscleGroup: 'SHOULDERS', equipment: 'DUMBBELL' },
      ];

      for (const exercise of exercises) {
        const response = await request(app.getHttpServer())
          .post('/api/exercises')
          .set('Authorization', `Bearer ${authToken}`)
          .send(exercise)
          .expect(201);
        
        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toBe(exercise.name);
        expect(response.body.userId).toBe(userId);
        
        createdExerciseIds.push(response.body.id);
      }

      expect(createdExerciseIds.length).toBe(4);
    });

    it('Step 2: User creates a training program', async () => {
      const programData = {
        name: 'Full Body Strength Program',
        description: 'Complete program for strength building',
        durationWeeks: 12,
      };

      const response = await request(app.getHttpServer())
        .post('/api/programs')
        .set('Authorization', `Bearer ${authToken}`)
        .send(programData)
        .expect(201);
      
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(programData.name);
      expect(response.body.userId).toBe(userId);
      
      createdProgramId = response.body.id;
    });

    it('Step 3: User adds workouts to program', async () => {
      const workouts = [
        { name: 'Upper Body A', dayOfWeek: 1 },
        { name: 'Lower Body', dayOfWeek: 3 },
        { name: 'Upper Body B', dayOfWeek: 5 },
      ];

      for (const workout of workouts) {
        const response = await request(app.getHttpServer())
          .post(`/api/programs/${createdProgramId}/workouts`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(workout)
          .expect(201);
        
        expect(response.body.name).toBe(workout.name);
        expect(response.body.programId).toBe(createdProgramId);
      }
    });

    it('Step 4: User adds exercises to workouts', async () => {
      // Get workouts
      const workoutsRes = await request(app.getHttpServer())
        .get(`/api/programs/${createdProgramId}/workouts`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      const workoutId = workoutsRes.body[0].id;

      // Add exercises to first workout
      const exercisesToAdd = [
        { exerciseId: createdExerciseIds[0], sets: 4, reps: 8 },
        { exerciseId: createdExerciseIds[1], sets: 3, reps: 10 },
      ];

      for (const exercise of exercisesToAdd) {
        const response = await request(app.getHttpServer())
          .post(`/api/workouts/${workoutId}/exercises`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(exercise)
          .expect(201);
        
        expect(response.body.sets).toBe(exercise.sets);
        expect(response.body.reps).toBe(exercise.reps);
      }
    });

    it('Step 5: User views completed program', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/programs/${createdProgramId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body.id).toBe(createdProgramId);
      expect(response.body.workouts).toBeDefined();
      expect(response.body.workouts.length).toBeGreaterThan(0);
      
      // Verify exercises are included
      const firstWorkout = response.body.workouts[0];
      expect(firstWorkout.workoutExercises).toBeDefined();
      expect(firstWorkout.workoutExercises.length).toBeGreaterThan(0);
    });

    it('Step 6: User edits program details', async () => {
      const updatedData = {
        name: 'Updated Strength Program',
        description: 'Modified program description',
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/programs/${createdProgramId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedData)
        .expect(200);
      
      expect(response.body.name).toBe(updatedData.name);
      expect(response.body.description).toBe(updatedData.description);
    });
  });

  describe('Workout Session Workflow', () => {
    let programId: number;
    let workoutId: number;
    let sessionId: number;

    beforeAll(async () => {
      // Setup: Create program with workout
      const program = await prisma.program.create({
        data: {
          name: 'Session Test Program',
          userId,
          workouts: {
            create: {
              name: 'Test Workout',
              dayOfWeek: 1,
            },
          },
        },
        include: { workouts: true },
      });
      
      programId = program.id;
      workoutId = program.workouts[0].id;
    });

    it('Step 1: User starts a workout session', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/sessions/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          workoutId,
          programId,
        })
        .expect(201);
      
      expect(response.body).toHaveProperty('id');
      expect(response.body.status).toBe('IN_PROGRESS');
      expect(response.body.userId).toBe(userId);
      
      sessionId = response.body.id;
    });

    it('Step 2: User logs exercise progress', async () => {
      const progressData = {
        exerciseId: 1,
        sets: 4,
        reps: 8,
        weight: 100,
      };

      const response = await request(app.getHttpServer())
        .post(`/api/sessions/${sessionId}/progress`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(progressData)
        .expect(201);
      
      expect(response.body.sessionId).toBe(sessionId);
      expect(response.body.sets).toBe(progressData.sets);
    });

    it('Step 3: User pauses session', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/sessions/${sessionId}/pause`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body.status).toBe('PAUSED');
    });

    it('Step 4: User resumes session', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/sessions/${sessionId}/resume`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body.status).toBe('IN_PROGRESS');
    });

    it('Step 5: User completes session', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/sessions/${sessionId}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body.status).toBe('COMPLETED');
      expect(response.body.completedAt).toBeDefined();
    });

    it('Step 6: User views session history', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/sessions/history')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      const session = response.body.find(s => s.id === sessionId);
      expect(session).toBeDefined();
      expect(session.status).toBe('COMPLETED');
    });
  });

  describe('Exercise Library Workflow', () => {
    it('Step 1: User browses exercise library', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/exercises')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('Step 2: User filters exercises by muscle group', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/exercises?muscleGroup=CHEST')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
      
      // All results should be CHEST exercises
      response.body.forEach(exercise => {
        expect(exercise.muscleGroup).toBe('CHEST');
      });
    });

    it('Step 3: User searches exercises by name', async () => {
      // First create a searchable exercise
      await request(app.getHttpServer())
        .post('/api/exercises')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Unique Exercise Search Test',
          muscleGroup: 'ARMS',
        })
        .expect(201);

      const response = await request(app.getHttpServer())
        .get('/api/exercises?search=Unique')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].name).toContain('Unique');
    });

    it('Step 4: User views exercise details', async () => {
      // Create exercise
      const createRes = await request(app.getHttpServer())
        .post('/api/exercises')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Detail Test Exercise',
          muscleGroup: 'BACK',
          instructions: 'Test instructions',
        })
        .expect(201);
      
      const exerciseId = createRes.body.id;

      // View details
      const response = await request(app.getHttpServer())
        .get(`/api/exercises/${exerciseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body.id).toBe(exerciseId);
      expect(response.body.name).toBe('Detail Test Exercise');
      expect(response.body.instructions).toBe('Test instructions');
    });

    it('Step 5: User marks exercise as favorite', async () => {
      // Create exercise
      const createRes = await request(app.getHttpServer())
        .post('/api/exercises')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Favorite Test Exercise',
          muscleGroup: 'LEGS',
        })
        .expect(201);
      
      const exerciseId = createRes.body.id;

      // Mark as favorite
      const response = await request(app.getHttpServer())
        .post(`/api/exercises/${exerciseId}/favorite`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body.isFavorite).toBe(true);
    });

    it('Step 6: User views favorite exercises', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/exercises?favorites=true')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
      
      // All results should be favorites
      response.body.forEach(exercise => {
        expect(exercise.isFavorite).toBe(true);
      });
    });
  });

  describe('Error Recovery Workflow', () => {
    it('should handle invalid program creation gracefully', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/programs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // Missing required name field
          description: 'Invalid program',
        })
        .expect(400);
      
      expect(response.body).toHaveProperty('message');
    });

    it('should prevent starting session with invalid workout', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/sessions/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          workoutId: 99999, // Non-existent workout
          programId: 99999,
        })
        .expect(404);
      
      expect(response.body).toHaveProperty('message');
    });

    it('should validate exercise data on creation', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/exercises')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '', // Empty name
          muscleGroup: 'INVALID_GROUP', // Invalid enum
        })
        .expect(400);
      
      expect(response.body).toHaveProperty('message');
    });
  });
});
