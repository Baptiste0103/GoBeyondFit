import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  HttpCode,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { WorkoutRunnerService } from './workout-runner.service'

@Controller('workouts')
@UseGuards(JwtAuthGuard)
export class WorkoutRunnerController {
  constructor(private readonly workoutService: WorkoutRunnerService) {}

  /**
   * POST /workouts/start/:sessionId
   * Start a new workout session
   */
  @Post('start/:sessionId')
  @HttpCode(201)
  async startWorkout(
    @Param('sessionId') sessionId: string,
    @Body() config: any,
    @Request() req
  ) {
    return this.workoutService.startWorkout(req.user.id, sessionId, config)
  }

  /**
   * GET /workouts/session/:sessionId/status
   * Check if session has progress and if user can continue or must start new
   */
  @Get('session/:sessionId/status')
  async getSessionStatus(
    @Param('sessionId') sessionId: string,
    @Request() req
  ) {
    return this.workoutService.getSessionStatus(req.user.id, sessionId)
  }

  /**
   * GET /workouts/history/list
   * Get user's workout history
   */
  @Get('history/list')
  async getHistory(
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
    @Request() req
  ) {
    return this.workoutService.getUserWorkoutHistory(req.user.id, Math.min(limit, 100))
  }

  /**
   * GET /workouts/current
   * Get current/active workout session for quick access
   */
  @Get('current')
  async getCurrentSession(@Request() req) {
    const session = await this.workoutService.getCurrentSession(req.user.id)
    if (!session) {
      return { session: null, message: 'No active workout session' }
    }
    return { session }
  }

  /**
   * GET /workouts/stats/summary
   * Get user's workout statistics
   */
  @Get('stats/summary')
  async getStats(@Request() req) {
    return this.workoutService.getWorkoutStats(req.user.id)
  }

  /**
   * GET /workouts/session/:sessionId/progress
   * Get session progress for a student (fetch existing or initialize new)
   */
  @Get('session/:sessionId/progress')
  async getSessionProgress(@Param('sessionId') sessionId: string, @Request() req) {
    return this.workoutService.getOrInitializeSessionProgress(req.user.id, sessionId)
  }

  /**
   * POST /workouts/:workoutId/exercise/:exerciseIndex/complete
   * Mark exercise as completed
   */
  @Post(':workoutId/exercise/:exerciseIndex/complete')
  @HttpCode(200)
  async completeExercise(
    @Param('workoutId') workoutId: string,
    @Param('exerciseIndex', ParseIntPipe) exerciseIndex: number,
    @Body() data: any,
    @Request() req
  ) {
    return this.workoutService.completeExercise(req.user.id, workoutId, exerciseIndex, data)
  }

  /**
   * POST /workouts/:workoutId/exercise/:exerciseIndex/save
   * Save exercise data (draft - not marking as completed)
   */
  @Post(':workoutId/exercise/:exerciseIndex/save')
  @HttpCode(200)
  async saveExerciseData(
    @Param('workoutId') workoutId: string,
    @Param('exerciseIndex', ParseIntPipe) exerciseIndex: number,
    @Body() data: any,
    @Request() req
  ) {
    return this.workoutService.saveExerciseData(req.user.id, workoutId, exerciseIndex, data)
  }

  /**
   * POST /workouts/:workoutId/exercise/:exerciseIndex/skip
   * Skip an exercise
   */
  @Post(':workoutId/exercise/:exerciseIndex/skip')
  @HttpCode(200)
  async skipExercise(
    @Param('workoutId') workoutId: string,
    @Param('exerciseIndex', ParseIntPipe) exerciseIndex: number,
    @Body() { reason }: { reason?: string },
    @Request() req
  ) {
    return this.workoutService.skipExercise(req.user.id, workoutId, exerciseIndex, reason)
  }

  /**
   * POST /workouts/:workoutId/end
   * End a workout session
   */
  @Post(':workoutId/end')
  @HttpCode(200)
  async endWorkout(@Param('workoutId') workoutId: string, @Request() req) {
    return this.workoutService.endWorkout(req.user.id, workoutId)
  }

  /**
   * GET /workouts/:workoutId/progress
   * Get current workout progress
   */
  @Get(':workoutId/progress')
  async getProgress(@Param('workoutId') workoutId: string, @Request() req) {
    return this.workoutService.getWorkoutProgress(req.user.id, workoutId)
  }
}
