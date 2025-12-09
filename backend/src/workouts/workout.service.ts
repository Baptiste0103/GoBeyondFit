import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionProgressDto, UpdateSessionProgressDto } from './dto/workout.dto';

@Injectable()
export class WorkoutService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get assigned sessions for a student within a date range
   */
  async getStudentSessions(studentId: string, startDate?: Date, endDate?: Date) {
    const query: any = {
      where: {
        progress: {
          some: {
            studentId,
          },
        },
      },
      include: {
        week: {
          include: {
            block: {
              include: {
                program: true,
              },
            },
          },
        },
        exercises: {
          include: {
            exercise: true,
          },
        },
        progress: {
          where: { studentId },
        },
      },
    };

    if (startDate || endDate) {
      query.where.date = {};
      if (startDate) query.where.date.gte = startDate;
      if (endDate) query.where.date.lte = endDate;
    }

    return this.prisma.session.findMany(query);
  }

  /**
   * Get single session with full workout details
   */
  async getSessionForWorkout(sessionId: string, studentId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        week: {
          include: {
            block: {
              include: {
                program: true,
              },
            },
          },
        },
        exercises: {
          include: {
            exercise: true,
          },
          orderBy: { position: 'asc' },
        },
        progress: {
          where: { studentId },
          orderBy: { savedAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return session;
  }

  /**
   * LEGACY: Create or update session progress for an exercise
   * This method is deprecated - use WorkoutRunnerService instead
   */
  async saveExerciseProgress(
    sessionId: string,
    exerciseInstanceId: string,
    studentId: string,
    data: UpdateSessionProgressDto,
  ) {
    // Fetch the existing session progress
    const sessionProgress = await this.prisma.sessionProgress.findFirst({
      where: {
        sessionId,
        studentId,
      },
    });

    if (!sessionProgress) {
      // Create new progress record
      return this.prisma.sessionProgress.create({
        data: {
          sessionId,
          studentId,
          progress: data.progress,
          notes: data.notes,
        },
      });
    }

    // Update existing progress record
    return this.prisma.sessionProgress.update({
      where: { id: sessionProgress.id },
      data: {
        progress: data.progress,
        notes: data.notes,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Upload video for exercise progress
   */
  async addVideoToProgress(progressId: string, studentId: string, videoUrl: string) {
    const progress = await this.prisma.sessionProgress.findUnique({
      where: { id: progressId },
    });

    if (!progress) {
      throw new NotFoundException('Progress not found');
    }

    if (progress.studentId !== studentId) {
      throw new ForbiddenException('Unauthorized');
    }

    return this.prisma.sessionProgress.update({
      where: { id: progressId },
      data: {
        videos: [...(progress.videos || []), videoUrl],
      },
    });
  }

  /**
   * Complete a session
   */
  async completeSession(sessionId: string, studentId: string, notes?: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        progress: {
          where: { studentId },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Update or create final progress for the session
    if (session.progress.length > 0) {
      return this.prisma.sessionProgress.update({
        where: { id: session.progress[0].id },
        data: {
          notes: notes || session.progress[0].notes,
          progress: {
            ...((session.progress[0].progress as any) || {}),
            completed: true,
            completedAt: new Date().toISOString(),
          },
        },
      });
    }

    return this.prisma.sessionProgress.create({
      data: {
        sessionId,
        studentId,
        notes,
        progress: {
          completed: true,
          completedAt: new Date().toISOString(),
        },
      },
    });
  }
}
