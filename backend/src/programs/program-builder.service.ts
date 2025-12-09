import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

export interface FilterOptions {
  muscleGroups?: string[]
  difficulty?: string
  searchQuery?: string
  excludeExercises?: string[]
}

export interface DuplicateCheckResult {
  hasDuplicates: boolean
  duplicates: Array<{
    exerciseId: string
    exerciseName: string
    count: number
    positions: number[]
  }>
}

@Injectable()
export class ProgramBuilderService {
  constructor(private prisma: PrismaService) {}

  /**
   * Filter exercises based on criteria
   */
  async filterExercises(
    options: FilterOptions,
    page: number = 1,
    limit: number = 20
  ) {
    const skip = (page - 1) * limit

    const whereClause: any = {}

    // Difficulty filter
    if (options.difficulty) {
      whereClause.meta = whereClause.meta || {}
      whereClause.meta.path = ['difficulty']
      whereClause.meta.equals = options.difficulty
    }

    // Muscle group filter using JSONB contains
    if (options.muscleGroups && options.muscleGroups.length > 0) {
      whereClause.meta = whereClause.meta || {}
      whereClause.meta.path = ['muscleGroups']
      whereClause.meta.hasSome = options.muscleGroups
    }

    // Search query
    if (options.searchQuery) {
      whereClause.OR = [
        { name: { contains: options.searchQuery, mode: 'insensitive' } },
        { description: { contains: options.searchQuery, mode: 'insensitive' } },
      ]
    }

    // Exclude exercises
    if (options.excludeExercises && options.excludeExercises.length > 0) {
      whereClause.id = { notIn: options.excludeExercises }
    }

    const [exercises, total] = await Promise.all([
      this.prisma.exercise.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          description: true,
          meta: true,
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.exercise.count({ where: whereClause }),
    ])

    return {
      data: exercises,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    }
  }

  /**
   * Check for duplicate exercises in program structure
   */
  checkDuplicates(exercises: any[]): DuplicateCheckResult {
    const exerciseMap = new Map<string, number[]>()

    // Flatten all exercises and track positions
    const flattenExercises = (items: any[], position: number[] = []) => {
      items.forEach((item, index) => {
        const currentPosition = [...position, index]

        if (item.exerciseId) {
          if (!exerciseMap.has(item.exerciseId)) {
            exerciseMap.set(item.exerciseId, [])
          }
          exerciseMap.get(item.exerciseId)!.push(parseInt(currentPosition.join('.')))
        }

        // Check nested items
        if (item.exercises && Array.isArray(item.exercises)) {
          flattenExercises(item.exercises, currentPosition)
        } else if (item.sessions && Array.isArray(item.sessions)) {
          flattenExercises(item.sessions, currentPosition)
        } else if (item.weeks && Array.isArray(item.weeks)) {
          flattenExercises(item.weeks, currentPosition)
        } else if (item.blocks && Array.isArray(item.blocks)) {
          flattenExercises(item.blocks, currentPosition)
        }
      })
    }

    flattenExercises(exercises)

    const duplicates: DuplicateCheckResult['duplicates'] = []
    let hasDuplicates = false

    exerciseMap.forEach((positions, exerciseId) => {
      if (positions.length > 1) {
        hasDuplicates = true
        duplicates.push({
          exerciseId,
          exerciseName: '', // Will be populated if needed
          count: positions.length,
          positions,
        })
      }
    })

    return {
      hasDuplicates,
      duplicates,
    }
  }

  /**
   * Get exercises with detailed duplicate info
   */
  async getExercisesWithDetails(
    exerciseIds: string[]
  ): Promise<Map<string, any>> {
    const exercises = await this.prisma.exercise.findMany({
      where: { id: { in: exerciseIds } },
      select: {
        id: true,
        name: true,
        description: true,
        meta: true,
      },
    })

    const map = new Map()
    exercises.forEach((ex) => {
      map.set(ex.id, ex)
    })

    return map
  }

  /**
   * Validate program structure
   */
  async validateProgram(programData: any) {
    const errors: string[] = []

    if (!programData.title) {
      errors.push('Program title is required')
    }

    if (!programData.title || programData.title.length < 3) {
      errors.push('Program title must be at least 3 characters')
    }

    if (!programData.blocks || !Array.isArray(programData.blocks)) {
      errors.push('Program must have at least one block')
    }

    if (programData.blocks && programData.blocks.length === 0) {
      errors.push('Program must have at least one block')
    }

    // Validate blocks structure
    if (programData.blocks && Array.isArray(programData.blocks)) {
      programData.blocks.forEach((block: any, blockIndex: number) => {
        if (!block.title) {
          errors.push(`Block ${blockIndex + 1}: title is required`)
        }

        if (!block.weeks || !Array.isArray(block.weeks) || block.weeks.length === 0) {
          errors.push(`Block "${block.title}": must have at least one week`)
        }

        // Validate weeks
        block.weeks?.forEach((week: any, weekIndex: number) => {
          if (!week.sessions || !Array.isArray(week.sessions) || week.sessions.length === 0) {
            errors.push(
              `Week ${week.weekNumber || weekIndex + 1}: must have at least one session`
            )
          }

          // Validate sessions
          week.sessions?.forEach((session: any, sessionIndex: number) => {
            if (!session.title) {
              errors.push(`Session ${sessionIndex + 1}: title is required`)
            }

            if (!session.exercises || !Array.isArray(session.exercises)) {
              errors.push(`Session "${session.title}": must have exercises array`)
            }

            // Validate exercises exist
            session.exercises?.forEach((exercise: any, exerciseIndex: number) => {
              if (!exercise.exerciseId) {
                errors.push(
                  `Session "${session.title}", Exercise ${exerciseIndex + 1}: exerciseId is required`
                )
              }
            })
          })
        })
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  /**
   * Clone program (with new title)
   */
  async cloneProgram(userId: string, originalProgramId: string, newTitle: string) {
    const original = await this.prisma.program.findUnique({
      where: { id: originalProgramId },
    })

    if (!original) {
      throw new NotFoundException('Program not found')
    }

    // Verify user owns the program
    if (original.ownerId !== userId) {
      throw new BadRequestException('Cannot clone program you do not own')
    }

    return this.prisma.program.create({
      data: {
        title: newTitle,
        description: original.description,
        coachId: userId,
        ownerId: userId,
        isDraft: true,
        data: original.data || {},
      },
    })
  }

  /**
   * Get program statistics
   */
  async getProgramStats(programId: string) {
    const program = await this.prisma.program.findUnique({
      where: { id: programId },
    })

    if (!program) {
      throw new NotFoundException('Program not found')
    }

    let exerciseCount = 0
    let blockCount = 0
    let weekCount = 0
    let sessionCount = 0

    const data = program.data as any

    if (data.blocks && Array.isArray(data.blocks)) {
      blockCount = data.blocks.length

      data.blocks.forEach((block: any) => {
        if (block.weeks && Array.isArray(block.weeks)) {
          weekCount += block.weeks.length

          block.weeks.forEach((week: any) => {
            if (week.sessions && Array.isArray(week.sessions)) {
              sessionCount += week.sessions.length

              week.sessions.forEach((session: any) => {
                if (session.exercises && Array.isArray(session.exercises)) {
                  exerciseCount += session.exercises.length
                }
              })
            }
          })
        }
      })
    }

    return {
      programId,
      title: program.title,
      exerciseCount,
      blockCount,
      weekCount,
      sessionCount,
      estimatedDuration: `${weekCount} weeks`,
    }
  }

  /**
   * Save program structure (blocks, sessions, exercises)
   */
  async saveProgram(
    userId: string,
    programId: string,
    saveData: {
      title: string;
      description?: string;
      blocks: any[];
      isDraft?: boolean;
    }
  ) {
    if (!saveData.title || saveData.title.trim().length < 3) {
      throw new BadRequestException('Program title must be at least 3 characters')
    }

    const program = await this.prisma.program.findUnique({
      where: { id: programId },
    })

    if (!program) {
      throw new NotFoundException('Program not found')
    }

    // Check permissions
    if (program.ownerId !== userId && program.coachId !== userId) {
      throw new BadRequestException('You do not have permission to edit this program')
    }

    // Delete existing blocks (cascade will delete weeks, sessions, exercises)
    await this.prisma.programBlock.deleteMany({
      where: { programId },
    })

    // Create new blocks with their structure
    let position = 0
    for (const blockData of saveData.blocks || []) {
      const block = await this.prisma.programBlock.create({
        data: {
          programId,
          title: blockData.title || `Block ${position + 1}`,
          position: position,
          notes: blockData.notes,
        },
      })

      // Create weeks for this block
      let weekPosition = 0
      for (const weekData of blockData.weeks || []) {
        const week = await this.prisma.week.create({
          data: {
            blockId: block.id,
            weekNumber: weekData.weekNumber || weekPosition + 1,
            position: weekPosition,
          },
        })

        // Create sessions for this week
        let sessionPosition = 0
        for (const sessionData of weekData.sessions || []) {
          const session = await this.prisma.session.create({
            data: {
              weekId: week.id,
              title: sessionData.title || `Session ${sessionPosition + 1}`,
              position: sessionPosition,
              date: sessionData.date,
              notes: sessionData.notes,
            },
          })

          // Create exercises for this session
          let exercisePosition = 0
          for (const exerciseData of sessionData.exercises || []) {
            // exerciseData should have exerciseId property
            if (!exerciseData.exerciseId) {
              console.warn('Exercise missing exerciseId, skipping', exerciseData)
              continue
            }

            // Verify exercise exists
            const exercise = await this.prisma.exercise.findUnique({
              where: { id: exerciseData.exerciseId },
            })

            if (!exercise) {
              console.warn(`Exercise ${exerciseData.exerciseId} not found, skipping`)
              continue
            }

            await this.prisma.sessionExercise.create({
              data: {
                sessionId: session.id,
                exerciseId: exerciseData.exerciseId,
                position: exercisePosition,
                config: exerciseData.config || {},
              },
            })

            exercisePosition++
          }

          sessionPosition++
        }

        weekPosition++
      }

      position++
    }

    // Update program metadata
    return this.prisma.program.update({
      where: { id: programId },
      data: {
        title: saveData.title,
        description: saveData.description || program.description,
        isDraft: saveData.isDraft ?? true,
        updatedAt: new Date(),
      },
      include: {
        blocks: {
          include: {
            weeks: {
              include: {
                sessions: {
                  include: {
                    exercises: {
                      include: {
                        exercise: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })
  }

  /**
   * Get program details with full structure
   */
  async getProgramDetails(programId: string, userId: string) {
    const program = await this.prisma.program.findUnique({
      where: { id: programId },
      include: {
        assignments: true,
        blocks: {
          include: {
            weeks: {
              include: {
                sessions: {
                  include: {
                    exercises: {
                      include: {
                        exercise: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!program) {
      throw new NotFoundException('Program not found')
    }

    // Check if user has access: coach/owner OR assigned student
    const isCoach = program.coachId === userId || program.ownerId === userId;
    const isAssigned = program.assignments?.some(a => a.studentId === userId);

    if (!isCoach && !isAssigned) {
      throw new ForbiddenException('You do not have permission to view this program')
    }

    return {
      id: program.id,
      title: program.title,
      description: program.description,
      isDraft: program.isDraft,
      blocks: program.blocks || [],
      ownerId: program.ownerId,
      coachId: program.coachId,
      createdAt: program.createdAt,
      updatedAt: program.updatedAt,
    }
  }
}
