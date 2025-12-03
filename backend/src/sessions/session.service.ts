import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionProgressDto } from './dto/session.dto';

@Injectable()
export class SessionService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all sessions assigned to a student (via program assignment)
   * Optionally filter by date range
   */
  async getStudentSessions(
    studentId: string,
    from?: string,
    to?: string,
  ) {
    // Get all programs assigned to this student
    const assignments = await this.prisma.programAssignment.findMany({
      where: { studentId },
      select: { programId: true },
    });

    const programIds = assignments.map(a => a.programId);

    if (programIds.length === 0) {
      return [];
    }

    // Get all sessions from those programs
    let dateFilter: any = {};
    if (from || to) {
      dateFilter = {
        date: {
          ...(from && { gte: new Date(from) }),
          ...(to && { lte: new Date(to) }),
        },
      };
    }

    return this.prisma.session.findMany({
      where: {
        week: {
          block: {
            programId: { in: programIds },
          },
        },
        ...dateFilter,
      },
      include: {
        exercises: {
          include: { exercise: true },
          orderBy: { position: 'asc' },
        },
        week: {
          select: {
            blockId: true,
            weekNumber: true,
            block: {
              select: { programId: true, title: true },
            },
          },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  /**
   * Get detailed session with exercises and student's progress
   */
  async getSessionDetails(sessionId: string, studentId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        exercises: {
          include: { exercise: true },
          orderBy: { position: 'asc' },
        },
        week: {
          select: {
            block: {
              select: { programId: true, title: true },
            },
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Verify student has access (is assigned to the program)
    const program = session.week.block;
    const assignment = await this.prisma.programAssignment.findFirst({
      where: {
        studentId,
        programId: program.programId,
      },
    });

    if (!assignment) {
      throw new ForbiddenException('Access denied to this session');
    }

    return session;
  }

  /**
   * Save workout progress (autosave)
   */
  async saveProgress(
    sessionId: string,
    studentId: string,
    progressData: CreateSessionProgressDto,
  ) {
    // Verify session exists
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: { week: { select: { block: { select: { programId: true } } } } },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Verify student has access to this program
    const assignment = await this.prisma.programAssignment.findFirst({
      where: {
        studentId,
        programId: session.week.block.programId,
      },
    });

    if (!assignment) {
      throw new ForbiddenException('Access denied to this session');
    }

    // Verify exercise instance exists in this session
    const exerciseInstance = await this.prisma.sessionExercise.findUnique({
      where: { id: progressData.exerciseInstanceId },
    });

    if (!exerciseInstance || exerciseInstance.sessionId !== sessionId) {
      throw new BadRequestException('Invalid exercise instance for this session');
    }

    // Check if progress already exists
    let existingProgress = await this.prisma.sessionProgress.findFirst({
      where: {
        sessionId,
        studentId,
        exerciseInstanceId: progressData.exerciseInstanceId,
      },
    });

    if (existingProgress) {
      // Update existing
      return this.prisma.sessionProgress.update({
        where: { id: existingProgress.id },
        data: {
          progress: progressData.progress,
          notes: progressData.notes,
          videos: progressData.videos || [],
        },
      });
    } else {
      // Create new
      return this.prisma.sessionProgress.create({
        data: {
          sessionId,
          studentId,
          exerciseInstanceId: progressData.exerciseInstanceId,
          progress: progressData.progress,
          notes: progressData.notes,
          videos: progressData.videos || [],
        },
      });
    }
  }

  /**
   * Get student's progress on a session
   */
  async getStudentProgress(sessionId: string, studentId: string) {
    // Verify access
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: { week: { select: { block: { select: { programId: true } } } } },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const assignment = await this.prisma.programAssignment.findFirst({
      where: {
        studentId,
        programId: session.week.block.programId,
      },
    });

    if (!assignment) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.sessionProgress.findMany({
      where: { sessionId, studentId },
      include: { exerciseInstance: { include: { exercise: true } } },
    });
  }

  /**
   * Add an exercise to a session (for coaches when building/editing sessions)
   */
  async addExerciseToSession(
    sessionId: string,
    exerciseId: string,
    coachId: string,
    config?: {
      sets?: number;
      reps?: number;
      format?: string;
      weight?: number;
      duration?: number;
      notes?: string;
    },
  ) {
    // Verify session exists and get its program
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        week: {
          select: {
            block: {
              select: { programId: true, program: { select: { coachId: true } } },
            },
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Verify the coach owns this program
    if (session.week.block.program.coachId !== coachId) {
      throw new ForbiddenException('You can only add exercises to your own sessions');
    }

    // Verify exercise exists
    const exercise = await this.prisma.exercise.findUnique({
      where: { id: exerciseId },
    });

    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }

    // Get the max position in this session
    const maxPosition = await this.prisma.sessionExercise.findFirst({
      where: { sessionId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    const nextPosition = (maxPosition?.position || 0) + 1;

    // Create the session exercise with config
    return this.prisma.sessionExercise.create({
      data: {
        sessionId,
        exerciseId,
        position: nextPosition,
        config: config || {
          sets: 3,
          reps: 10,
          format: 'standard',
        },
      },
      include: { exercise: true },
    });
  }
}
