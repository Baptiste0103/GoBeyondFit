import {
  Controller,
  Get,
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
import { SessionProgressService } from './session-progress.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Session Progress')
@ApiBearerAuth()
@Controller('session-progress')
export class SessionProgressController {
  constructor(private readonly sessionProgressService: SessionProgressService) {}

  /**
   * LEGACY: This endpoint is deprecated
   * Use WorkoutRunnerController instead
   */

  @Get('sessions/:sessionId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get progress for a session (LEGACY)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Session progress',
  })
  async getSessionProgress(sessionId: string, req: any) {
    return this.sessionProgressService.getProgress(sessionId, req.user.id);
  }
}
