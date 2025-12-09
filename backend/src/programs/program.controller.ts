import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
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
import { ProgramService } from './program.service';
import {
  CreateProgramDto,
  UpdateProgramDto,
  ProgramResponseDto,
} from './dto/program.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard, Roles, UserRole } from '../common/guards/roles.guard';

@ApiTags('Programs')
@ApiBearerAuth()
@Controller('programs')
export class ProgramController {
  constructor(private readonly programService: ProgramService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COACH, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new program with nested structure' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Program created',
    type: ProgramResponseDto,
  })
  async create(@Body() body: Record<string, any>, @Request() req: Record<string, any>) {
    console.log('CREATE POST body:', body);
    console.log('CREATE POST req.user.id:', req?.user?.id);
    return this.programService.createProgram(body, req?.user?.id || 'unknown');
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all programs' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of programs',
    type: [ProgramResponseDto],
  })
  async findAll(@Request() req: any) {
    const userRole = req.user?.role?.toLowerCase?.() || req.user?.role;
    
    if (userRole === 'coach') {
      return this.programService.findByCoach(req.user.id);
    }
    if (userRole === 'student') {
      return this.programService.getAssignedPrograms(req.user.id);
    }
    return this.programService.findAll();
  }

  @Get('my-assignments')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get my assigned programs (for current user)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of my assigned programs',
  })
  async getMyAssignments(@Request() req: any) {
    return this.programService.getMyAssignmentsWithDetails(req.user.id);
  }

  @Get('coach/:coachId')
  @ApiOperation({ summary: "Get programs created by a coach" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of coach programs',
    type: [ProgramResponseDto],
  })
  async findByCoach(@Param('coachId') coachId: string) {
    return this.programService.findByCoach(coachId);
  }

  @Get('assigned/:studentId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get programs assigned to a student' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of assigned programs',
    type: [ProgramResponseDto],
  })
  async getAssignedPrograms(@Param('studentId') studentId: string, @Request() req: any) {
    // Students can only see their own programs
    if (req.user.role === UserRole.STUDENT && req.user.id !== studentId) {
      throw new Error('Forbidden');
    }
    return this.programService.getAssignedPrograms(studentId);
  }

  @Get(':id/audit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COACH, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get audit log for a program' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Audit log entries',
  })
  async getAuditLog(@Param('id') id: string, @Request() req: any) {
    return this.programService.getAuditLog(id, req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get program by ID with full structure' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Program details',
    type: ProgramResponseDto,
  })
  async findById(@Param('id') id: string, @Request() req: any) {
    return this.programService.findById(id, req.user.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COACH, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update program' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Program updated',
    type: ProgramResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updateProgramDto: UpdateProgramDto,
    @Request() req: any,
  ) {
    return this.programService.update(id, updateProgramDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COACH, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete program' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Program deleted',
  })
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.programService.delete(id, req.user.id);
  }

  @Post(':programId/assign/:studentId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COACH, UserRole.ADMIN)
  @ApiOperation({ summary: 'Assign program to a student' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Program assigned',
  })
  async assignToStudent(
    @Param('programId') programId: string,
    @Param('studentId') studentId: string,
    @Body() body?: { groupId?: string },
    @Request() req?: any,
  ) {
    return this.programService.assignToStudent(programId, studentId, req.user.id, body?.groupId);
  }

  @Delete(':assignmentId/assignment')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Remove program assignment' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Assignment removed',
  })
  async removeAssignment(@Param('assignmentId') assignmentId: string, @Request() req: any) {
    return this.programService.removeAssignment(assignmentId, req.user.id);
  }
}
