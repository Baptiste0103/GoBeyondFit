import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { WorkoutService } from './workout.service';
import {
  UpdateSessionProgressDto,
  AddVideoDto,
  CompleteSessionDto,
} from './dto/workout.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard, Roles, UserRole } from '../common/guards/roles.guard';

@ApiTags('Workouts')
@ApiBearerAuth()
@Controller('workouts')
export class WorkoutController {
  constructor(private readonly workoutService: WorkoutService) {}

  /**
   * Get assigned sessions for authenticated student
   */
  @Get('my-sessions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Get my assigned sessions' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of sessions assigned to student',
  })
  async getMySessions(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.workoutService.getStudentSessions(req.user.id, start, end);
  }

  /**
   * Get single session for workout execution
   */
  @Get('sessions/:sessionId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get session details for workout' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Session with exercises and progress',
  })
  async getSession(@Param('sessionId') sessionId: string, @Request() req: any) {
    return this.workoutService.getSessionForWorkout(sessionId, req.user.id);
  }

  /**
   * Save progress for an exercise during workout
   */
  @Post('sessions/:sessionId/exercises/:exerciseInstanceId/progress')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Save exercise progress' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Progress saved',
  })
  async saveProgress(
    @Param('sessionId') sessionId: string,
    @Param('exerciseInstanceId') exerciseInstanceId: string,
    @Body() dto: UpdateSessionProgressDto,
    @Request() req: any,
  ) {
    return this.workoutService.saveExerciseProgress(
      sessionId,
      exerciseInstanceId,
      req.user.id,
      dto,
    );
  }

  /**
   * Add video to exercise progress
   */
  @Post('progress/:progressId/videos')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add video to progress' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Video added',
  })
  async addVideo(
    @Param('progressId') progressId: string,
    @Body() dto: AddVideoDto,
    @Request() req: any,
  ) {
    return this.workoutService.addVideoToProgress(progressId, req.user.id, dto.videoUrl);
  }

  /**
   * Complete a session
   */
  @Post('sessions/:sessionId/complete')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mark session as complete' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Session completed',
  })
  async completeSession(
    @Param('sessionId') sessionId: string,
    @Body() dto: CompleteSessionDto,
    @Request() req: any,
  ) {
    return this.workoutService.completeSession(sessionId, req.user.id, dto.notes);
  }
}
