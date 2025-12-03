import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
  HttpCode,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { HistoryService } from './history.service'
import { LogViewDto } from './dto/history.dto'

@Controller('exercises')
@UseGuards(JwtAuthGuard)
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  /**
   * POST /exercises/:id/view
   * Log exercise view
   */
  @Post(':id/view')
  @HttpCode(201)
  async logView(@Param('id') exerciseId: string, @Body() dto: LogViewDto, @Request() req) {
    return this.historyService.logView(req.user.id, {
      ...dto,
      exerciseId,
    })
  }

  /**
   * GET /exercises/:id/view-count
   * Get total view count for exercise
   */
  @Get(':id/view-count')
  async getViewCount(@Param('id') exerciseId: string) {
    return this.historyService.getExerciseViewCount(exerciseId)
  }

  /**
   * GET /exercises/:id/unique-views
   * Get unique user view count for exercise
   */
  @Get(':id/unique-views')
  async getUniqueViewCount(@Param('id') exerciseId: string) {
    return this.historyService.getExerciseUniqueViewCount(exerciseId)
  }
}

@Controller('users/history')
@UseGuards(JwtAuthGuard)
export class UserHistoryController {
  constructor(private readonly historyService: HistoryService) {}

  /**
   * GET /users/history/exercises
   * Get user's exercise history with pagination
   */
  @Get('exercises')
  async getUserHistory(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    if (limit > 100) limit = 100
    if (page < 1) page = 1

    return this.historyService.getUserHistory(req.user.id, page, limit, from, to)
  }

  /**
   * GET /users/history/recent
   * Get recently viewed exercises (for sidebar)
   */
  @Get('recent')
  async getRecentlyViewed(
    @Query('limit', new DefaultValuePipe(8), ParseIntPipe) limit: number,
    @Request() req,
  ) {
    return this.historyService.getRecentlyViewed(req.user.id, Math.min(limit, 50))
  }

  /**
   * DELETE /users/history/exercises
   * Clear all user's history
   */
  @Delete('exercises')
  @HttpCode(200)
  async clearHistory(@Request() req) {
    return this.historyService.clearHistory(req.user.id)
  }

  /**
   * DELETE /users/history/entries/:entryId
   * Delete specific history entry
   */
  @Delete('entries/:entryId')
  @HttpCode(200)
  async deleteEntry(@Param('entryId') entryId: string, @Request() req) {
    return this.historyService.deleteHistoryEntry(req.user.id, entryId)
  }
}
