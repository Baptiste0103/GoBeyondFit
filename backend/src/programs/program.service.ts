import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProgramDto, UpdateProgramDto } from './dto/program.dto';
import { AuditService } from './audit.service';

@Injectable()
export class ProgramService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  /**
   * Create a complete program with nested structure
   * Program → Blocks → Weeks → Sessions → SessionExercises
   */
  async createProgram(data: any, coachId: string) {
    const { blocks, ...programData } = data;

    try {
      // Validate all exerciseIds if blocks exist
      if (blocks && Array.isArray(blocks)) {
        const exerciseIds = new Set<string>();
        
        for (const block of blocks) {
          if (block.weeks && Array.isArray(block.weeks)) {
            for (const week of block.weeks) {
              if (week.sessions && Array.isArray(week.sessions)) {
                for (const session of week.sessions) {
                  if (session.exercises && Array.isArray(session.exercises)) {
                    for (const exercise of session.exercises) {
                      if (exercise.exerciseId) {
                        exerciseIds.add(exercise.exerciseId);
                      }
                    }
                  }
                }
              }
            }
          }
        }

        // Check if all exerciseIds exist
        if (exerciseIds.size > 0) {
          const existingExercises = await this.prisma.exercise.findMany({
            where: {
              id: {
                in: Array.from(exerciseIds),
              },
            },
            select: { id: true },
          });

          const existingIds = new Set(existingExercises.map(e => e.id));
          const missingIds = Array.from(exerciseIds).filter(id => !existingIds.has(id));

          if (missingIds.length > 0) {
            throw new BadRequestException(`Invalid exercise IDs: ${missingIds.join(', ')}`);
          }
        }
      }

      // Build the creation data safely
      const programCreateData: any = {
        ...programData,
        coachId,
      };

      // Only add blocks if they exist and are not empty
      if (blocks && Array.isArray(blocks) && blocks.length > 0) {
        programCreateData.blocks = {
          create: blocks.map((block, blockIndex) => {
            const blockData: any = {
              title: block.title || `Block ${blockIndex + 1}`,
              position: block.position ?? blockIndex,
            };
            
            // Only add notes if provided
            if (block.notes) {
              blockData.notes = block.notes;
            }

            // Add weeks if they exist
            if (block.weeks && Array.isArray(block.weeks) && block.weeks.length > 0) {
              blockData.weeks = {
                create: block.weeks.map((week, weekIndex) => {
                  const weekData: any = {
                    weekNumber: week.weekNumber || weekIndex + 1,
                    position: week.position ?? weekIndex,
                  };

                  // Add sessions if they exist
                  if (week.sessions && Array.isArray(week.sessions) && week.sessions.length > 0) {
                    weekData.sessions = {
                      create: week.sessions.map((session, sessionIndex) => {
                        const sessionData: any = {
                          position: session.position ?? sessionIndex,
                        };
                        
                        if (session.title) {
                          sessionData.title = session.title;
                        }
                        if (session.notes) {
                          sessionData.notes = session.notes;
                        }
                        if (session.date) {
                          sessionData.date = session.date;
                        }

                        // Add exercises if they exist
                        if (session.exercises && Array.isArray(session.exercises) && session.exercises.length > 0) {
                          sessionData.exercises = {
                            create: session.exercises.map((ex, exIndex) => ({
                              exerciseId: ex.exerciseId,
                              position: ex.position ?? exIndex,
                              ...(ex.config && { config: ex.config }),
                            })),
                          };
                        }

                        return sessionData;
                      }),
                    };
                  }

                  return weekData;
                }),
              };
            }

            return blockData;
          }),
        };
      }

      return this.prisma.program.create({
        data: programCreateData,
        include: {
          blocks: {
            include: {
              weeks: {
                include: {
                  sessions: {
                    include: {
                      exercises: { include: { exercise: true } },
                    },
                  },
                },
              },
            },
          },
        },
      }).then(async (program) => {
        // Log creation to audit
        await this.auditService.logChange(
          program.id,
          coachId,
          'create',
          { title: program.title, description: program.description, isDraft: program.isDraft },
        );
        return program;
      });
    } catch (error: any) {
      console.error('CREATE_PROGRAM_ERROR:', error);
      const message = error?.message || 'Unknown error';
      
      // Handle specific Prisma errors
      if (error?.code === 'P2003') {
        // Foreign key constraint failed (likely invalid exerciseId)
        throw new BadRequestException('Invalid exercise ID in program structure: ' + message);
      }
      if (error?.code === 'P2002') {
        // Unique constraint failed
        throw new BadRequestException('Duplicate entry in program structure: ' + message);
      }
      
      throw new BadRequestException('Failed to create program: ' + message);
    }
  }

  /**
   * Get all programs for a coach
   */
  async findByCoach(coachId: string) {
    return this.prisma.program.findMany({
      where: { coachId },
      include: {
        blocks: {
          include: {
            weeks: {
              include: {
                sessions: true,
              },
            },
          },
        },
        assignments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get a specific program with all nested data and permission check
   */
  async findById(id: string, userId: string) {
    const program = await this.prisma.program.findUnique({
      where: { id },
      include: {
        coach: { select: { id: true, pseudo: true, email: true } },
        blocks: {
          orderBy: { position: 'asc' },
          include: {
            weeks: {
              orderBy: { position: 'asc' },
              include: {
                sessions: {
                  orderBy: { position: 'asc' },
                  include: {
                    exercises: {
                      orderBy: { position: 'asc' },
                      include: { exercise: true },
                    },
                  },
                },
              },
            },
          },
        },
        assignments: true,
      },
    });

    if (!program) {
      throw new NotFoundException(`Program not found`);
    }

    // Check access: owner (coach) or assigned student
    const isOwner = program.coachId === userId;
    const isAssigned = program.assignments.some(a => a.studentId === userId);

    if (!isOwner && !isAssigned) {
      throw new ForbiddenException('Access denied to this program');
    }

    return program;
  }

  /**
   * Get all programs (admin/public view)
   */
  async findAll() {
    return this.prisma.program.findMany({
      include: {
        coach: true,
        blocks: true,
        assignments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Update program (coach only)
   */
  async update(id: string, data: any, coachId: string) {
    const program = await this.prisma.program.findUnique({ where: { id } });

    if (!program) {
      throw new NotFoundException('Program not found');
    }

    if (program.coachId !== coachId) {
      throw new ForbiddenException('Only the coach can update this program');
    }

    const { blocks, ...programData } = data;

    // If blocks are provided, update the full structure
    if (blocks && Array.isArray(blocks)) {
      // Delete existing blocks (cascade will delete weeks, sessions, exercises)
      await this.prisma.programBlock.deleteMany({
        where: { programId: id },
      });

      // Update program basic info
      await this.prisma.program.update({
        where: { id },
        data: programData,
      });

      // Recreate blocks structure
      for (const block of blocks) {
        const createdBlock = await this.prisma.programBlock.create({
          data: {
            programId: id,
            title: block.title || `Block`,
            position: block.position ?? 0,
            notes: block.notes,
          },
        });

        // Create weeks
        if (block.weeks && Array.isArray(block.weeks)) {
          for (const week of block.weeks) {
            const createdWeek = await this.prisma.week.create({
              data: {
                blockId: createdBlock.id,
                weekNumber: week.weekNumber || 1,
                position: week.position ?? 0,
              },
            });

            // Create sessions
            if (week.sessions && Array.isArray(week.sessions)) {
              for (const session of week.sessions) {
                const createdSession = await this.prisma.session.create({
                  data: {
                    weekId: createdWeek.id,
                    title: session.title,
                    notes: session.notes,
                    date: session.date,
                    position: session.position ?? 0,
                  },
                });

                // Create session exercises
                if (session.exercises && Array.isArray(session.exercises)) {
                  for (const exercise of session.exercises) {
                    const configData = (exercise.weight || exercise.reps || exercise.sets || exercise.format || exercise.duration || exercise.notes)
                      ? {
                          weight: exercise.weight,
                          reps: exercise.reps,
                          sets: exercise.sets,
                          format: exercise.format,
                          duration: exercise.duration,
                          notes: exercise.notes,
                        }
                      : undefined;

                    await this.prisma.sessionExercise.create({
                      data: {
                        sessionId: createdSession.id,
                        exerciseId: exercise.exerciseId,
                        position: exercise.position ?? 0,
                        ...(configData && { config: configData }),
                      },
                    });
                  }
                }
              }
            }
          }
        }
      }
    } else {
      // Simple update for basic fields only
      await this.prisma.program.update({
        where: { id },
        data: programData,
      });
    }

    // Calculate diff
    const diff = this.auditService.calculateDiff(program, data);

    // Log update to audit
    await this.auditService.logChange(id, coachId, 'update', diff);

    // Return updated program with full structure
    return this.findById(id, coachId);
  }

  /**
   * Delete program (coach only)
   */
  async delete(id: string, coachId: string) {
    const program = await this.prisma.program.findUnique({ where: { id } });

    if (!program) {
      throw new NotFoundException('Program not found');
    }

    if (program.coachId !== coachId) {
      throw new ForbiddenException('Only the coach can delete this program');
    }

    // Log deletion to audit before deleting
    await this.auditService.logChange(
      id,
      coachId,
      'delete',
      { title: program.title, description: program.description },
    );

    return this.prisma.program.delete({ where: { id } });
  }

  /**
   * Get programs assigned to a student
   */
  async getAssignedPrograms(studentId: string) {
    return this.prisma.program.findMany({
      where: {
        assignments: {
          some: {
            studentId,
          },
        },
      },
      include: {
        blocks: {
          include: {
            weeks: {
              include: {
                sessions: {
                  include: {
                    exercises: { include: { exercise: true } },
                  },
                },
              },
            },
          },
        },
        coach: { select: { pseudo: true, email: true } },
      },
    });
  }

  /**
   * Assign program to student
   */
  async assignToStudent(programId: string, studentId: string, coachId: string) {
    const program = await this.prisma.program.findUnique({ where: { id: programId } });

    if (!program) {
      throw new NotFoundException('Program not found');
    }

    if (program.coachId !== coachId) {
      throw new ForbiddenException('Only the coach can assign programs');
    }

    // Check if already assigned
    const existing = await this.prisma.programAssignment.findFirst({
      where: { programId, studentId },
    });

    if (existing) {
      return existing;
    }

    const assignment = await this.prisma.programAssignment.create({
      data: {
        programId,
        studentId,
        assignedBy: coachId,
      },
    });

    // Log assignment to audit
    await this.auditService.logChange(
      programId,
      coachId,
      'assign',
      { studentId, assignmentId: assignment.id },
    );

    return assignment;
  }

  /**
   * Remove assignment
   */
  async removeAssignment(assignmentId: string, coachId: string) {
    const assignment = await this.prisma.programAssignment.findUnique({
      where: { id: assignmentId },
      include: { program: true },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    if (assignment.program.coachId !== coachId) {
      throw new ForbiddenException('Only the coach can remove assignments');
    }

    const result = await this.prisma.programAssignment.delete({ where: { id: assignmentId } });

    // Log unassignment to audit
    await this.auditService.logChange(
      assignment.programId,
      coachId,
      'unassign',
      { studentId: assignment.studentId, assignmentId },
    );

    return result;
  }

  /**
   * Get audit log for a program
   */
  async getAuditLog(programId: string, coachId: string) {
    const program = await this.prisma.program.findUnique({ where: { id: programId } });

    if (!program) {
      throw new NotFoundException('Program not found');
    }

    // Only coach or admin can view audit log
    if (program.coachId !== coachId) {
      throw new ForbiddenException('Only the coach can view audit logs');
    }

    return this.auditService.getAuditLog(programId);
  }
}

