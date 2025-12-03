import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SessionService } from './session.service';
import { CreateSessionProgressDto, AddExerciseToSessionDto } from './dto/session.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Sessions & Workout Mode')
@ApiBearerAuth()
@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  /**
   * Get student's sessions for a date range
   */
  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get my assigned sessions' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of student sessions',
  })
  async getMySessions(
    @Request() req: any,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.sessionService.getStudentSessions(req.user.id, from, to);
  }

  /**
   * Get a specific session
   */
  @Get(':sessionId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get session details with exercises' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Session details',
  })
  async getSession(@Param('sessionId') sessionId: string, @Request() req: any) {
    return this.sessionService.getSessionDetails(sessionId, req.user.id);
  }

  /**
   * Record session progress (autosave)
   */
  @Post(':sessionId/progress')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Save workout progress (autosave)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Progress saved',
  })
  async saveProgress(
    @Param('sessionId') sessionId: string,
    @Body() progressData: CreateSessionProgressDto,
    @Request() req: any,
  ) {
    return this.sessionService.saveProgress(
      sessionId,
      req.user.id,
      progressData,
    );
  }

  /**
   * Get student's progress on a session
   */
  @Get(':sessionId/my-progress')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get my progress on this session' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Student progress',
  })
  async getMyProgress(
    @Param('sessionId') sessionId: string,
    @Request() req: any,
  ) {
    return this.sessionService.getStudentProgress(sessionId, req.user.id);
  }

  /**
   * Add exercise to a session
   */
  @Post(':sessionId/exercises')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add exercise to a session' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Exercise added to session',
  })
  async addExerciseToSession(
    @Param('sessionId') sessionId: string,
    @Body() addExerciseDto: AddExerciseToSessionDto,
    @Request() req: any,
  ) {
    return this.sessionService.addExerciseToSession(
      sessionId,
      addExerciseDto.exerciseId,
      req.user.id,
      addExerciseDto.config,
    );
  }
}
