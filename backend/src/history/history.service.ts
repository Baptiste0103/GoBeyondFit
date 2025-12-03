import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { LogViewDto, GetHistoryDto } from './dto/history.dto'

@Injectable()
export class HistoryService {
  constructor(private prisma: PrismaService) {}

  /**
   * Log exercise view
   */
  async logView(userId: string, dto: LogViewDto) {
    // Verify exercise exists
    const exercise = await this.prisma.exercise.findUnique({
      where: { id: dto.exerciseId },
    })

    if (!exercise) {
      throw new NotFoundException(`Exercise with ID ${dto.exerciseId} not found`)
    }

    // Create history entry
    const history = await this.prisma.exerciseHistory.create({
      data: {
        userId,
        exerciseId: dto.exerciseId,
        viewedAt: new Date(),
      },
      include: {
        exercise: {
          select: {
            id: true,
            name: true,
            description: true,
            meta: true,
          },
        },
      },
    })

    // Auto-cleanup: keep only last 50 views per user
    await this.cleanupOldHistory(userId, 50)

    return history
  }

  /**
   * Get user's exercise history
   */
  async getUserHistory(userId: string, page: number, limit: number, from?: string, to?: string) {
    const skip = (page - 1) * limit

    const whereClause: any = { userId }

    // Add date range filter if provided
    if (from || to) {
      whereClause.viewedAt = {}
      if (from) whereClause.viewedAt.gte = new Date(from)
      if (to) whereClause.viewedAt.lte = new Date(to)
    }

    const [history, total] = await Promise.all([
      this.prisma.exerciseHistory.findMany({
        where: whereClause,
        include: {
          exercise: {
            select: {
              id: true,
              name: true,
              description: true,
              meta: true,
            },
          },
        },
        orderBy: { viewedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.exerciseHistory.count({ where: whereClause }),
    ])

    return {
      data: history,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    }
  }

  /**
   * Get recently viewed exercises (for sidebar/component)
   */
  async getRecentlyViewed(userId: string, limit: number = 8) {
    // Get unique exercises by most recent view
    const recentHistory = await this.prisma.exerciseHistory.findMany({
      where: { userId },
      include: {
        exercise: {
          select: {
            id: true,
            name: true,
            description: true,
            meta: true,
          },
        },
      },
      orderBy: { viewedAt: 'desc' },
      take: limit * 2, // Fetch more to account for duplicates
    })

    // Deduplicate by exerciseId, keeping most recent
    const seen = new Set<string>()
    const unique = recentHistory.filter((item) => {
      if (seen.has(item.exerciseId)) return false
      seen.add(item.exerciseId)
      return true
    })

    return unique.slice(0, limit)
  }

  /**
   * Clear history for user
   */
  async clearHistory(userId: string) {
    const deleted = await this.prisma.exerciseHistory.deleteMany({
      where: { userId },
    })

    return {
      deletedCount: deleted.count,
      message: `Deleted ${deleted.count} history entries`,
    }
  }

  /**
   * Delete specific history entry
   */
  async deleteHistoryEntry(userId: string, historyId: string) {
    const entry = await this.prisma.exerciseHistory.findUnique({
      where: { id: historyId },
    })

    if (!entry) {
      throw new NotFoundException(`History entry ${historyId} not found`)
    }

    if (entry.userId !== userId) {
      throw new NotFoundException('History entry not found')
    }

    await this.prisma.exerciseHistory.delete({
      where: { id: historyId },
    })

    return { message: 'History entry deleted' }
  }

  /**
   * Auto-cleanup old history entries (keep last N per user)
   */
  private async cleanupOldHistory(userId: string, keepCount: number) {
    const userHistory = await this.prisma.exerciseHistory.findMany({
      where: { userId },
      orderBy: { viewedAt: 'desc' },
      select: { id: true },
    })

    if (userHistory.length > keepCount) {
      const toDelete = userHistory.slice(keepCount).map((h) => h.id)
      await this.prisma.exerciseHistory.deleteMany({
        where: { id: { in: toDelete } },
      })
    }
  }

  /**
   * Get view count for an exercise
   */
  async getExerciseViewCount(exerciseId: string) {
    const count = await this.prisma.exerciseHistory.count({
      where: { exerciseId },
    })

    return { exerciseId, viewCount: count }
  }

  /**
   * Get unique user view count for an exercise
   */
  async getExerciseUniqueViewCount(exerciseId: string) {
    const count = await this.prisma.exerciseHistory.findMany({
      where: { exerciseId },
      distinct: ['userId'],
      select: { userId: true },
    })

    return { exerciseId, uniqueUserCount: count.length }
  }
}
