import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateRatingDto, UpdateRatingDto } from './dto/rating.dto'

@Injectable()
export class RatingsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create or update a rating for an exercise
   */
  async createOrUpdateRating(
    exerciseId: string,
    userId: string,
    dto: CreateRatingDto,
  ) {
    // Verify exercise exists
    const exercise = await this.prisma.exercise.findUnique({
      where: { id: exerciseId },
    })

    if (!exercise) {
      throw new NotFoundException('Exercise not found')
    }

    // Upsert rating (create if doesn't exist, update if does)
    const rating = await this.prisma.exerciseRating.upsert({
      where: {
        exerciseId_userId: {
          exerciseId,
          userId,
        },
      },
      update: {
        rating: dto.rating,
        comment: dto.comment || null,
      },
      create: {
        exerciseId,
        userId,
        rating: dto.rating,
        comment: dto.comment,
      },
      include: {
        user: {
          select: {
            id: true,
            pseudo: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    return this.formatRating(rating)
  }

  /**
   * Get all ratings for an exercise with statistics
   */
  async getExerciseRatings(exerciseId: string, userId: string) {
    // Verify exercise exists
    const exercise = await this.prisma.exercise.findUnique({
      where: { id: exerciseId },
    })

    if (!exercise) {
      throw new NotFoundException('Exercise not found')
    }

    // Get all ratings
    const ratings = await this.prisma.exerciseRating.findMany({
      where: { exerciseId },
      include: {
        user: {
          select: {
            id: true,
            pseudo: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Calculate statistics
    const totalRatings = ratings.length
    const averageRating =
      totalRatings > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
        : 0

    // Get user's own rating if exists
    const userRating = ratings.find((r) => r.userId === userId)

    // Distribution
    const distribution = {
      5: ratings.filter((r) => r.rating === 5).length,
      4: ratings.filter((r) => r.rating === 4).length,
      3: ratings.filter((r) => r.rating === 3).length,
      2: ratings.filter((r) => r.rating === 2).length,
      1: ratings.filter((r) => r.rating === 1).length,
    }

    return {
      exerciseId,
      totalRatings,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      distribution,
      userRating: userRating ? this.formatRating(userRating) : null,
      recentRatings: ratings.slice(0, 10).map((r) => this.formatRating(r)),
    }
  }

  /**
   * Get user's rating for an exercise
   */
  async getUserRating(exerciseId: string, userId: string) {
    const rating = await this.prisma.exerciseRating.findUnique({
      where: {
        exerciseId_userId: {
          exerciseId,
          userId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            pseudo: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    if (!rating) {
      return null
    }

    return this.formatRating(rating)
  }

  /**
   * Update a rating
   */
  async updateRating(
    ratingId: string,
    userId: string,
    exerciseId: string,
    dto: UpdateRatingDto,
  ) {
    // Get the rating to verify ownership
    const rating = await this.prisma.exerciseRating.findUnique({
      where: { id: ratingId },
    })

    if (!rating) {
      throw new NotFoundException('Rating not found')
    }

    if (rating.userId !== userId) {
      throw new ForbiddenException(
        'You can only update your own ratings',
      )
    }

    if (rating.exerciseId !== exerciseId) {
      throw new BadRequestException('Rating does not belong to this exercise')
    }

    // Update rating
    const updated = await this.prisma.exerciseRating.update({
      where: { id: ratingId },
      data: {
        rating: dto.rating ?? rating.rating,
        comment: dto.comment !== undefined ? dto.comment : rating.comment,
      },
      include: {
        user: {
          select: {
            id: true,
            pseudo: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    return this.formatRating(updated)
  }

  /**
   * Delete a rating
   */
  async deleteRating(
    ratingId: string,
    userId: string,
    exerciseId: string,
  ) {
    // Get the rating to verify ownership
    const rating = await this.prisma.exerciseRating.findUnique({
      where: { id: ratingId },
    })

    if (!rating) {
      throw new NotFoundException('Rating not found')
    }

    if (rating.userId !== userId) {
      throw new ForbiddenException(
        'You can only delete your own ratings',
      )
    }

    if (rating.exerciseId !== exerciseId) {
      throw new BadRequestException('Rating does not belong to this exercise')
    }

    // Delete rating
    await this.prisma.exerciseRating.delete({
      where: { id: ratingId },
    })

    return { success: true, message: 'Rating deleted successfully' }
  }

  /**
   * Format rating for response
   */
  private formatRating(rating: any) {
    return {
      id: rating.id,
      exerciseId: rating.exerciseId,
      rating: rating.rating,
      comment: rating.comment,
      createdAt: rating.createdAt,
      updatedAt: rating.updatedAt,
      user: rating.user || null,
    }
  }
}
