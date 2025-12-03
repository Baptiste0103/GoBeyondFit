import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  /**
   * Get comprehensive stats for current student
   */
  @Get('my-stats')
  @UseGuards(JwtAuthGuard)
  async getMyStats(@Request() req: any) {
    return this.statsService.getStudentStats(req.user.id);
  }

  /**
   * Get exercise-specific stats
   */
  @Get('exercise/:exerciseId')
  @UseGuards(JwtAuthGuard)
  async getExerciseStats(
    @Request() req: any,
    @Param('exerciseId') exerciseId: string,
  ) {
    return this.statsService.getExerciseStats(req.user.id, exerciseId);
  }
}
