import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Add an exercise to user's favorites
   */
  async addFavorite(userId: string, exerciseId: string) {
    // Verify exercise exists
    const exercise = await this.prisma.exercise.findUnique({
      where: { id: exerciseId },
      include: {
        owner: {
          select: {
            id: true,
            pseudo: true,
          },
        },
      },
    })

    if (!exercise) {
      throw new NotFoundException('Exercise not found')
    }

    // Check if already favorited
    const existing = await this.prisma.favoriteExercise.findUnique({
      where: {
        userId_exerciseId: {
          userId,
          exerciseId,
        },
      },
    })

    if (existing) {
      throw new ConflictException('Exercise already in favorites')
    }

    // Add to favorites
    const favorite = await this.prisma.favoriteExercise.create({
      data: {
        userId,
        exerciseId,
      },
      include: {
        exercise: {
          include: {
            owner: {
              select: {
                id: true,
                pseudo: true,
              },
            },
          },
        },
      },
    })

    return {
      id: favorite.id,
      exercise: this.formatExercise(favorite.exercise),
      addedAt: favorite.addedAt,
    }
  }

  /**
   * Remove an exercise from user's favorites
   */
  async removeFavorite(userId: string, exerciseId: string) {
    // Verify exercise exists
    const exercise = await this.prisma.exercise.findUnique({
      where: { id: exerciseId },
    })

    if (!exercise) {
      throw new NotFoundException('Exercise not found')
    }

    // Find and delete the favorite
    const favorite = await this.prisma.favoriteExercise.findUnique({
      where: {
        userId_exerciseId: {
          userId,
          exerciseId,
        },
      },
    })

    if (!favorite) {
      throw new NotFoundException('Exercise not in favorites')
    }

    await this.prisma.favoriteExercise.delete({
      where: {
        userId_exerciseId: {
          userId,
          exerciseId,
        },
      },
    })

    return { success: true, message: 'Removed from favorites' }
  }

  /**
   * Get all user's favorite exercises
   */
  async getUserFavorites(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit

    // Get total count
    const total = await this.prisma.favoriteExercise.count({
      where: { userId },
    })

    // Get favorites with pagination
    const favorites = await this.prisma.favoriteExercise.findMany({
      where: { userId },
      include: {
        exercise: {
          include: {
            owner: {
              select: {
                id: true,
                pseudo: true,
              },
            },
          },
        },
      },
      orderBy: { addedAt: 'desc' },
      skip,
      take: limit,
    })

    return {
      data: favorites.map((fav) => ({
        id: fav.id,
        exercise: this.formatExercise(fav.exercise),
        addedAt: fav.addedAt,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  /**
   * Check if exercise is favorited by user
   */
  async isFavorite(userId: string, exerciseId: string): Promise<boolean> {
    const favorite = await this.prisma.favoriteExercise.findUnique({
      where: {
        userId_exerciseId: {
          userId,
          exerciseId,
        },
      },
    })

    return !!favorite
  }

  /**
   * Get all favorite exercise IDs for a user (for batch checking)
   */
  async getFavoriteIds(userId: string): Promise<string[]> {
    const favorites = await this.prisma.favoriteExercise.findMany({
      where: { userId },
      select: { exerciseId: true },
    })

    return favorites.map((fav) => fav.exerciseId)
  }

  /**
   * Format exercise for response
   */
  private formatExercise(exercise: any) {
    return {
      id: exercise.id,
      name: exercise.name,
      description: exercise.description,
      scope: exercise.scope,
      meta: exercise.meta,
      owner: exercise.owner,
    }
  }
}
