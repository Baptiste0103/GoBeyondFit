import {
  Controller,
  Post,
  Get,
  Delete,
  Put,
  Param,
  Body,
  UseGuards,
  Request,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  HttpCode,
} from '@nestjs/common'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RatingsService } from './ratings.service'
import { CreateRatingDto, UpdateRatingDto } from './dto/rating.dto'

@Controller('exercises/:exerciseId/ratings')
@UseGuards(JwtAuthGuard)
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  /**
   * Submit or update a rating for an exercise
   * POST /exercises/{exerciseId}/ratings
   */
  @Post()
  async submitRating(
    @Param('exerciseId') exerciseId: string,
    @Body() dto: CreateRatingDto,
    @Request() req,
  ) {
    if (!exerciseId) {
      throw new BadRequestException('Exercise ID is required')
    }

    if (dto.rating < 1 || dto.rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5')
    }

    return this.ratingsService.createOrUpdateRating(
      exerciseId,
      req.user.id,
      dto,
    )
  }

  /**
   * Get all ratings for an exercise
   * GET /exercises/{exerciseId}/ratings
   */
  @Get()
  async getExerciseRatings(
    @Param('exerciseId') exerciseId: string,
    @Request() req,
  ) {
    if (!exerciseId) {
      throw new BadRequestException('Exercise ID is required')
    }

    return this.ratingsService.getExerciseRatings(exerciseId, req.user.id)
  }

  /**
   * Get user's rating for an exercise
   * GET /exercises/{exerciseId}/ratings/me
   */
  @Get('me')
  async getUserRating(
    @Param('exerciseId') exerciseId: string,
    @Request() req,
  ) {
    if (!exerciseId) {
      throw new BadRequestException('Exercise ID is required')
    }

    return this.ratingsService.getUserRating(exerciseId, req.user.id)
  }

  /**
   * Update a rating
   * PUT /exercises/{exerciseId}/ratings/{ratingId}
   */
  @Put(':ratingId')
  async updateRating(
    @Param('exerciseId') exerciseId: string,
    @Param('ratingId') ratingId: string,
    @Body() dto: UpdateRatingDto,
    @Request() req,
  ) {
    if (!ratingId) {
      throw new BadRequestException('Rating ID is required')
    }

    if (dto.rating && (dto.rating < 1 || dto.rating > 5)) {
      throw new BadRequestException('Rating must be between 1 and 5')
    }

    return this.ratingsService.updateRating(
      ratingId,
      req.user.id,
      exerciseId,
      dto,
    )
  }

  /**
   * Delete a rating
   * DELETE /exercises/{exerciseId}/ratings/{ratingId}
   */
  @Delete(':ratingId')
  @HttpCode(204)
  async deleteRating(
    @Param('exerciseId') exerciseId: string,
    @Param('ratingId') ratingId: string,
    @Request() req,
  ) {
    if (!ratingId) {
      throw new BadRequestException('Rating ID is required')
    }

    return this.ratingsService.deleteRating(ratingId, req.user.id, exerciseId)
  }
}
