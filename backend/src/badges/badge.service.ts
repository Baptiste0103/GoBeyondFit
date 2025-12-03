import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export enum BadgeEvent {
  SESSION_COMPLETED = 'session_completed',
  PERFECT_SESSION = 'perfect_session',
  STREAK_7_DAYS = 'streak_7_days',
  STREAK_30_DAYS = 'streak_30_days',
  PERSONAL_RECORD = 'personal_record',
  TOTAL_VOLUME_MILESTONE = 'total_volume_milestone',
}

@Injectable()
export class BadgeService {
  constructor(private prisma: PrismaService) {}

  /**
   * Award badge to user if conditions are met
   */
  async awardBadgeIfEarned(
    userId: string,
    event: BadgeEvent,
    metadata?: Record<string, any>,
  ): Promise<any | null> {
    try {
      // Find badge by key
      const badge = await this.prisma.badge.findUnique({
        where: { key: event },
      });

      if (!badge) {
        return null;
      }

      // Check if user already has this badge
      const existing = await this.prisma.userBadge.findFirst({
        where: {
          userId,
          badgeId: badge.id,
        },
      });

      if (existing) {
        return existing; // Already awarded
      }

      // Check criteria (simplified - expand as needed)
      const criteria = (badge.criteria as any) || {};
      const shouldAward = await this.checkCriteria(userId, event, metadata, criteria);

      if (shouldAward) {
        return this.prisma.userBadge.create({
          data: {
            userId,
            badgeId: badge.id,
          },
          include: {
            badge: true,
          },
        });
      }

      return null;
    } catch (error) {
      console.error('Error awarding badge:', error);
      return null;
    }
  }

  /**
   * Check if user meets badge criteria
   */
  private async checkCriteria(
    userId: string,
    event: BadgeEvent,
    metadata: Record<string, any> = {},
    criteria: Record<string, any>,
  ): Promise<boolean> {
    switch (event) {
      case BadgeEvent.SESSION_COMPLETED:
        // Any session completion
        return true;

      case BadgeEvent.PERFECT_SESSION:
        // All exercises completed with full reps
        return metadata?.allExercisesCompleted === true;

      case BadgeEvent.STREAK_7_DAYS:
        return await this.checkStreak(userId, 7);

      case BadgeEvent.STREAK_30_DAYS:
        return await this.checkStreak(userId, 30);

      case BadgeEvent.PERSONAL_RECORD:
        // Check if this is a new max weight
        return metadata?.isPersonalRecord === true;

      case BadgeEvent.TOTAL_VOLUME_MILESTONE:
        // Check if total volume reached milestone
        return metadata?.volumeMilestone === true;

      default:
        return false;
    }
  }

  /**
   * Check if user has workout streak
   */
  private async checkStreak(userId: string, days: number): Promise<boolean> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const completedSessions = await this.prisma.sessionProgress.findMany({
      where: {
        studentId: userId,
        progress: {
          path: ['completed'],
          equals: true,
        },
        savedAt: {
          gte: startDate,
        },
      },
      distinct: ['sessionId'],
    });

    // Simple check: has sessions in the last N days
    return completedSessions.length >= days / 2; // At least half the days
  }

  /**
   * Get all available badges
   */
  async getAllBadges() {
    return this.prisma.badge.findMany({
      orderBy: { id: 'asc' },
    });
  }

  /**
   * Get all badges for user
   */
  async getUserBadges(userId: string) {
    return this.prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { awardedAt: 'desc' },
    });
  }

  /**
   * Get badge progress for user
   */
  async getBadgeProgress(userId: string) {
    const completedSessions = await this.prisma.sessionProgress.count({
      where: {
        studentId: userId,
        progress: {
          path: ['completed'],
          equals: true,
        },
      },
    });

    const streak = await this.calculateStreak(userId);

    const maxWeight = await this.getMaxWeight(userId);

    return {
      sessionsCompleted: completedSessions,
      currentStreak: streak,
      maxWeight,
    };
  }

  /**
   * Calculate current workout streak
   */
  private async calculateStreak(userId: string): Promise<number> {
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      const completed = await this.prisma.sessionProgress.findFirst({
        where: {
          studentId: userId,
          progress: {
            path: ['completed'],
            equals: true,
          },
          savedAt: {
            gte: date,
            lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
          },
        },
      });

      if (completed) {
        streak++;
      } else if (streak > 0) {
        break;
      }
    }

    return streak;
  }

  /**
   * Get max weight lifted by user
   */
  private async getMaxWeight(userId: string): Promise<number | null> {
    const maxSession = await this.prisma.sessionProgress.findFirst({
      where: {
        studentId: userId,
      },
      select: {
        progress: true,
      },
      orderBy: {
        savedAt: 'desc',
      },
    });

    if (!maxSession?.progress) {
      return null;
    }

    // Extract max weight from progress sets
    const progress = maxSession.progress as any;
    let maxWeight = 0;

    if (Array.isArray(progress.sets)) {
      progress.sets.forEach((set: any) => {
        if (set.weight && set.weight > maxWeight) {
          maxWeight = set.weight;
        }
      });
    }

    return maxWeight > 0 ? maxWeight : null;
  }
}
