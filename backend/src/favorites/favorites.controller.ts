import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
  BadRequestException,
  HttpCode,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { FavoritesService } from './favorites.service'

@Controller('exercises')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  /**
   * Add exercise to favorites
   * POST /exercises/{id}/favorite
   */
  @Post(':id/favorite')
  async addFavorite(@Param('id') exerciseId: string, @Request() req) {
    if (!exerciseId) {
      throw new BadRequestException('Exercise ID is required')
    }

    return this.favoritesService.addFavorite(req.user.id, exerciseId)
  }

  /**
   * Remove exercise from favorites
   * DELETE /exercises/{id}/favorite
   */
  @Delete(':id/favorite')
  @HttpCode(204)
  async removeFavorite(@Param('id') exerciseId: string, @Request() req) {
    if (!exerciseId) {
      throw new BadRequestException('Exercise ID is required')
    }

    return this.favoritesService.removeFavorite(req.user.id, exerciseId)
  }

  /**
   * Check if exercise is favorited
   * GET /exercises/{id}/is-favorite
   */
  @Get(':id/is-favorite')
  async isFavorite(@Param('id') exerciseId: string, @Request() req) {
    if (!exerciseId) {
      throw new BadRequestException('Exercise ID is required')
    }

    const isFavorited = await this.favoritesService.isFavorite(
      req.user.id,
      exerciseId,
    )
    return { exerciseId, isFavorited }
  }
}

@Controller('users/favorites')
@UseGuards(JwtAuthGuard)
export class UserFavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  /**
   * Get user's favorite exercises
   * GET /users/favorites/exercises
   */
  @Get('exercises')
  async getUserFavorites(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Request() req,
  ) {
    if (limit > 100) limit = 100
    if (page < 1) page = 1

    return this.favoritesService.getUserFavorites(req.user.id, page, limit)
  }
}
