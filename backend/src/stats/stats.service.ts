import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get comprehensive stats for a student
   */
  async getStudentStats(userId: string) {
    const [
      totalSessions,
      completedSessions,
      totalVolume,
      maxWeight,
      avgWeight,
      streak,
      sessionsThisWeek,
    ] = await Promise.all([
      this.getTotalSessions(userId),
      this.getCompletedSessions(userId),
      this.getTotalVolume(userId),
      this.getMaxWeight(userId),
      this.getAverageWeight(userId),
      this.getCurrentStreak(userId),
      this.getSessionsThisWeek(userId),
    ]);

    return {
      totalSessions,
      completedSessions,
      completionRate: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0,
      totalVolume: Math.round(totalVolume),
      maxWeight,
      avgWeight: avgWeight ? Math.round(avgWeight * 100) / 100 : 0,
      currentStreak: streak,
      sessionsThisWeek,
    };
  }

  /**
   * Get total sessions assigned to student
   */
  private async getTotalSessions(userId: string): Promise<number> {
    const assignments = await this.prisma.programAssignment.findMany({
      where: { studentId: userId },
      include: {
        program: {
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
        },
      },
    });

    let totalSessions = 0;
    assignments.forEach((assignment) => {
      assignment.program.blocks.forEach((block) => {
        block.weeks.forEach((week) => {
          totalSessions += week.sessions.length;
        });
      });
    });

    return totalSessions;
  }

  /**
   * Get completed sessions
   */
  private async getCompletedSessions(userId: string): Promise<number> {
    const completed = await this.prisma.sessionProgress.findMany({
      where: {
        studentId: userId,
        progress: {
          path: ['completed'],
          equals: true,
        },
      },
      select: {
        sessionId: true,
      },
    });

    return new Set(completed.map((c) => c.sessionId)).size;
  }

  /**
   * Get total volume lifted (sum of weight * reps)
   */
  private async getTotalVolume(userId: string): Promise<number> {
    const progressRecords = await this.prisma.sessionProgress.findMany({
      where: {
        studentId: userId,
      },
      select: {
        progress: true,
      },
    });

    let totalVolume = 0;

    progressRecords.forEach((record) => {
      const progress = record.progress as any;
      if (progress && progress.sets && Array.isArray(progress.sets)) {
        progress.sets.forEach((set: any) => {
          if (set.weight && set.reps) {
            totalVolume += set.weight * set.reps;
          }
        });
      }
    });

    return totalVolume;
  }

  /**
   * Get max weight lifted
   */
  private async getMaxWeight(userId: string): Promise<number | null> {
    const progressRecords = await this.prisma.sessionProgress.findMany({
      where: {
        studentId: userId,
      },
      select: {
        progress: true,
      },
    });

    let maxWeight = 0;

    progressRecords.forEach((record) => {
      const progress = record.progress as any;
      if (progress && progress.sets && Array.isArray(progress.sets)) {
        progress.sets.forEach((set: any) => {
          if (set.weight && set.weight > maxWeight) {
            maxWeight = set.weight;
          }
        });
      }
    });

    return maxWeight > 0 ? maxWeight : null;
  }

  /**
   * Get average weight used
   */
  private async getAverageWeight(userId: string): Promise<number | null> {
    const progressRecords = await this.prisma.sessionProgress.findMany({
      where: {
        studentId: userId,
      },
      select: {
        progress: true,
      },
    });

    let totalWeight = 0;
    let setCount = 0;

    progressRecords.forEach((record) => {
      const progress = record.progress as any;
      if (progress && progress.sets && Array.isArray(progress.sets)) {
        progress.sets.forEach((set: any) => {
          if (set.weight) {
            totalWeight += set.weight;
            setCount++;
          }
        });
      }
    });

    return setCount > 0 ? totalWeight / setCount : null;
  }

  /**
   * Get current workout streak (consecutive days)
   */
  private async getCurrentStreak(userId: string): Promise<number> {
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const hasCompletedSession = await this.prisma.sessionProgress.findFirst({
        where: {
          studentId: userId,
          progress: {
            path: ['completed'],
            equals: true,
          },
          savedAt: {
            gte: date,
            lt: nextDate,
          },
        },
      });

      if (hasCompletedSession) {
        streak++;
      } else if (streak > 0) {
        break;
      }
    }

    return streak;
  }

  /**
   * Get sessions completed this week
   */
  private async getSessionsThisWeek(userId: string): Promise<number> {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const completed = await this.prisma.sessionProgress.findMany({
      where: {
        studentId: userId,
        progress: {
          path: ['completed'],
          equals: true,
        },
        savedAt: {
          gte: weekAgo,
        },
      },
      select: {
        sessionId: true,
      },
    });

    return new Set(completed.map((c) => c.sessionId)).size;
  }

  /**
   * Get exercise-specific stats
   */
  async getExerciseStats(userId: string, exerciseId: string) {
    const progressRecords = await this.prisma.sessionProgress.findMany({
      where: {
        studentId: userId,
        session: {
          exercises: {
            some: {
              exerciseId,
            },
          },
        },
      },
      select: {
        progress: true,
        savedAt: true,
      },
      orderBy: {
        savedAt: 'desc',
      },
      take: 20, // Last 20 sessions
    });

    const stats = {
      totalSessions: progressRecords.length,
      maxWeight: 0,
      avgWeight: 0,
      maxReps: 0,
      avgReps: 0,
      history: [] as any[],
    };

    let totalWeight = 0;
    let totalReps = 0;
    let setCount = 0;

    progressRecords.forEach((record) => {
      const progress = record.progress as any;
      if (progress && progress.sets && Array.isArray(progress.sets)) {
        const sessionData = {
          date: record.savedAt,
          sets: [] as any[],
        };

        progress.sets.forEach((set: any) => {
          if (set.weight) {
            totalWeight += set.weight;
            stats.maxWeight = Math.max(stats.maxWeight, set.weight);
            sessionData.sets.push({
              weight: set.weight,
              reps: set.reps || 0,
            });
          }
          if (set.reps) {
            totalReps += set.reps;
            stats.maxReps = Math.max(stats.maxReps, set.reps);
          }
          setCount++;
        });

        if (sessionData.sets.length > 0) {
          stats.history.push(sessionData);
        }
      }
    });

    stats.avgWeight = setCount > 0 ? Math.round((totalWeight / setCount) * 100) / 100 : 0;
    stats.avgReps = setCount > 0 ? Math.round((totalReps / setCount) * 100) / 100 : 0;

    return stats;
  }
}
