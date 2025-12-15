/**
 * Multi-Tenancy Security Audit Tests
 * Following Security Agent: Critical checks for data isolation
 * Zero tolerance for cross-coach/cross-student data leaks
 */

import { INestApplication } from '@nestjs/common'
import request = require('supertest');
import { createTestApp, cleanupDatabase, createTestUserWithAuth } from './test-utils'
import { PrismaService } from '../src/prisma/prisma.service'

describe('Security - Multi-Tenancy Isolation (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let coachAToken: string
  let coachBToken: string
  let studentAToken: string
  let studentBToken: string
  let coachAId: string
  let coachBId: string
  let studentAId: string
  let studentBId: string

  beforeAll(async () => {
    const testApp = await createTestApp()
    app = testApp.app
    prisma = testApp.prisma

    // Create test users with proper auth
    const coachA = await createTestUserWithAuth(
      app,
      prisma,
      'coachA@test.com',
      'CoachA',
      'password123',
      'coach',
    )
    coachAToken = coachA.token
    coachAId = coachA.userId

    const coachB = await createTestUserWithAuth(
      app,
      prisma,
      'coachB@test.com',
      'CoachB',
      'password123',
      'coach',
    )
    coachBToken = coachB.token
    coachBId = coachB.userId

    const studentA = await createTestUserWithAuth(
      app,
      prisma,
      'studentA@test.com',
      'StudentA',
      'password123',
      'student',
    )
    studentAToken = studentA.token
    studentAId = studentA.userId

    const studentB = await createTestUserWithAuth(
      app,
      prisma,
      'studentB@test.com',
      'StudentB',
      'password123',
      'student',
    )
    studentBToken = studentB.token
    studentBId = studentB.userId
  })

  afterAll(async () => {
    await cleanupDatabase(prisma)
    await app.close()
  })


  afterAll(async () => {
    // Cleanup test data
    await prisma.user.deleteMany({
      where: { email: { in: ['coachA@test.com', 'coachB@test.com', 'studentA@test.com', 'studentB@test.com'] } },
    })
    await app.close()
  })

  describe('Review Queue Multi-Tenancy', () => {
    let sessionProgressA: string
    let sessionProgressB: string

    beforeAll(async () => {
      // Create programs and sessions for both students
      const coachA = await prisma.user.findUnique({ where: { email: 'coachA@test.com' } })
      const coachB = await prisma.user.findUnique({ where: { email: 'coachB@test.com' } })
      const studentA = await prisma.user.findUnique({ where: { email: 'studentA@test.com' } })
      const studentB = await prisma.user.findUnique({ where: { email: 'studentB@test.com' } })

      if (!coachA || !coachB || !studentA || !studentB) {
        throw new Error('Test users not found')
      }

      const programA = await prisma.program.create({
        data: {
          title: 'Program A',
          coachId: coachA.id,
          blocks: {
            create: {
              title: 'Block 1',
              position: 1,
              weeks: {
                create: {
                  weekNumber: 1,
                  position: 1,
                  sessions: {
                    create: {
                      title: 'Session A',
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
      })

      const sessionA = programA.blocks[0].weeks[0].sessions[0]

      const programB = await prisma.program.create({
        data: {
          title: 'Program B',
          coachId: coachB.id,
          blocks: {
            create: {
              title: 'Block 1',
              position: 1,
              weeks: {
                create: {
                  weekNumber: 1,
                  position: 1,
                  sessions: {
                    create: {
                      title: 'Session B',
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
      })

      const sessionB = programB.blocks[0].weeks[0].sessions[0]

      // Create completed session progress for both students
      const progressA = await prisma.sessionProgress.create({
        data: {
          sessionId: sessionA.id,
          studentId: studentA.id,
          status: 'completed',
          progress: { exercises: [] },
        },
      })

      const progressB = await prisma.sessionProgress.create({
        data: {
          sessionId: sessionB.id,
          studentId: studentB.id,
          status: 'completed',
          progress: { exercises: [] },
        },
      })

      sessionProgressA = progressA.id
      sessionProgressB = progressB.id
    })

    it('should prevent Coach A from seeing Coach B review queue (CRITICAL)', async () => {
      // Act: Coach A tries to get review queue
      const response = await request(app.getHttpServer())
        .get('/api/workouts/review-queue')
        .set('Authorization', `Bearer ${coachAToken}`)
        .expect(200)

      // Assert: Coach A should only see Student A sessions
      const studentIds = response.body.data.map((group: any) => group.student.id)
      const studentA = await prisma.user.findUnique({ where: { email: 'studentA@test.com' } })
      const studentB = await prisma.user.findUnique({ where: { email: 'studentB@test.com' } })

      expect(studentA).toBeDefined()
      expect(studentB).toBeDefined()
      expect(studentIds).toContain(studentA!.id)
      expect(studentIds).not.toContain(studentB!.id)
    })

    it('should prevent Coach A from accessing Coach B session detail (CRITICAL)', async () => {
      // Act: Coach A tries to access Student B session (belongs to Coach B)
      const response = await request(app.getHttpServer())
        .get(`/api/workouts/sessions/${sessionProgressB}/review-detail`)
        .set('Authorization', `Bearer ${coachAToken}`)
        .expect(403) // Forbidden

      // Assert: Should receive clear error message
      expect(response.body.message).toContain('your own students')
    })

    it('should prevent Coach A from submitting review for Coach B student (CRITICAL)', async () => {
      // Act: Coach A tries to review Student B session
      const response = await request(app.getHttpServer())
        .post(`/api/workouts/sessions/${sessionProgressB}/review`)
        .set('Authorization', `Bearer ${coachAToken}`)
        .send({
          globalFeedback: 'Trying to hack!',
          exerciseFeedbacks: [],
        })
        .expect(403)

      // Assert
      expect(response.body.message).toContain('your own students')
    })

    it('should allow Coach A to review their own student session (PASS)', async () => {
      // Act: Coach A reviews Student A session (correct ownership)
      const response = await request(app.getHttpServer())
        .post(`/api/workouts/sessions/${sessionProgressA}/review`)
        .set('Authorization', `Bearer ${coachAToken}`)
        .send({
          globalFeedback: 'Great work!',
          exerciseFeedbacks: [],
        })
        .expect(200)

      // Assert
      expect(response.body.message).toBe('Review submitted successfully')
    })

    it('should prevent Student B from accessing Student A session (CRITICAL)', async () => {
      // Act: Student B tries to access Student A session detail
      // (This endpoint should be coach-only via RolesGuard)
      const response = await request(app.getHttpServer())
        .get(`/api/workouts/sessions/${sessionProgressA}/review-detail`)
        .set('Authorization', `Bearer ${studentBToken}`)
        .expect(403)

      // Assert
      expect(response.body.message).toContain('Forbidden')
    })
  })

  describe('Program Multi-Tenancy', () => {
    it('should prevent Coach B from modifying Coach A program (CRITICAL)', async () => {
      // Arrange: Coach A creates program
      const coachA = await prisma.user.findUnique({ where: { email: 'coachA@test.com' } })
      if (!coachA) throw new Error('Coach A not found')
      
      const programA = await prisma.program.create({
        data: {
          title: 'Program A Private',
          coachId: coachA.id,
        },
      })

      // Act: Coach B tries to update Coach A program
      const response = await request(app.getHttpServer())
        .put(`/api/programs/${programA.id}`)
        .set('Authorization', `Bearer ${coachBToken}`)
        .send({ title: 'Hacked Program' })
        .expect(403)

      // Assert
      expect(response.body.message).toContain('Forbidden')
    })
  })

  describe('Group Multi-Tenancy', () => {
    it('should prevent Coach A from seeing Coach B groups (CRITICAL)', async () => {
      // Arrange: Both coaches create groups
      const coachA = await prisma.user.findUnique({ where: { email: 'coachA@test.com' } })
      const coachB = await prisma.user.findUnique({ where: { email: 'coachB@test.com' } })

      if (!coachA || !coachB) throw new Error('Coaches not found')

      await prisma.group.create({
        data: { name: 'Group A', ownerId: coachA.id },
      })

      await prisma.group.create({
        data: { name: 'Group B', ownerId: coachB.id },
      })

      // Act: Coach A gets their groups
      const response = await request(app.getHttpServer())
        .get('/api/groups')
        .set('Authorization', `Bearer ${coachAToken}`)
        .expect(200)

      // Assert: Coach A should only see Group A
      const groupNames = response.body.map((group: any) => group.name)
      expect(groupNames).toContain('Group A')
      expect(groupNames).not.toContain('Group B')
    })
  })
})
