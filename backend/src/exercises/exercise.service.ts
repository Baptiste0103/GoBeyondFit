import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateExerciseDto, UpdateExerciseDto } from './dto'

@Injectable()
export class ExerciseService {
  constructor(private prisma: PrismaService) {}

  async create(createExerciseDto: CreateExerciseDto, userId: string) {
    // Only coaches or admins can create exercises
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user || (user.role !== 'coach' && user.role !== 'admin')) {
      throw new ForbiddenException('Only coaches can create exercises')
    }

    // Set scope to 'coach' by default for coaches, 'global' for admins (if specified)
    const scope = createExerciseDto.scope || 'coach'

    // If scope is 'global', only admins can create
    if (scope === 'global' && user.role !== 'admin') {
      throw new ForbiddenException('Only admins can create global exercises')
    }

    // Build meta object with exercise metadata
    const meta = {
      ...(createExerciseDto.meta || {}),
      difficulty: createExerciseDto.difficulty || 'Beginner',
      muscleGroups: createExerciseDto.muscleGroups || [],
      instructions: createExerciseDto.instructions || [],
      videoUrl: createExerciseDto.videoUrl || null,
      sets: createExerciseDto.sets || 3,
      reps: createExerciseDto.reps || 12,
    }

    return this.prisma.exercise.create({
      data: {
        name: createExerciseDto.name,
        description: createExerciseDto.description,
        type: createExerciseDto.type || 'standard',
        scope,
        meta,
        ownerId: scope === 'global' ? null : userId,
      },
      include: {
        owner: {
          select: { id: true, pseudo: true, firstName: true, lastName: true },
        },
      },
    })
  }

  async findAll(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      throw new NotFoundException('User not found')
    }

    // Students and coaches can see global exercises
    // Coaches also see their own exercises
    const exercises = await this.prisma.exercise.findMany({
      where: {
        OR: [
          { scope: 'global' },
          { ownerId: userId }, // Own exercises
          // If student and has a coach, see coach's exercises
          ...(user.role === 'student' && user.coachId
            ? [{ ownerId: user.coachId }]
            : []),
        ],
      },
      include: {
        owner: {
          select: { id: true, pseudo: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return exercises.map((exercise) => ({
      ...exercise,
      ...(exercise.meta as any),
    }))
  }

  async findOne(id: string, userId: string) {
    const exercise = await this.prisma.exercise.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, pseudo: true, firstName: true, lastName: true },
        },
      },
    })

    if (!exercise) {
      throw new NotFoundException('Exercise not found')
    }

    // Check permission: can view if global, owner, or student of coach
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      throw new NotFoundException('User not found')
    }

    if (exercise.scope === 'global') {
      return { ...exercise, ...(exercise.meta as any) }
    }

    if (exercise.ownerId === userId) {
      return { ...exercise, ...(exercise.meta as any) }
    }

    if (user.role === 'student' && exercise.ownerId === user.coachId) {
      return { ...exercise, ...(exercise.meta as any) }
    }

    throw new ForbiddenException('You do not have permission to view this exercise')
  }

  async update(id: string, updateExerciseDto: UpdateExerciseDto, userId: string) {
    const exercise = await this.prisma.exercise.findUnique({ where: { id } })

    if (!exercise) {
      throw new NotFoundException('Exercise not found')
    }

    // Only owner or admin can update
    if (exercise.ownerId !== userId) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } })
      if (!user || user.role !== 'admin') {
        throw new ForbiddenException('You can only update your own exercises')
      }
    }

    // Build update data, merging custom fields into meta
    const updateData: any = {
      name: updateExerciseDto.name,
      description: updateExerciseDto.description,
      type: updateExerciseDto.type,
      scope: updateExerciseDto.scope,
    }

    // Merge custom fields into meta
    if (
      updateExerciseDto.difficulty ||
      updateExerciseDto.muscleGroups ||
      updateExerciseDto.instructions ||
      updateExerciseDto.videoUrl ||
      updateExerciseDto.sets ||
      updateExerciseDto.reps
    ) {
      const currentMeta = (exercise.meta as any) || {}
      updateData.meta = {
        ...currentMeta,
        ...(updateExerciseDto.difficulty && { difficulty: updateExerciseDto.difficulty }),
        ...(updateExerciseDto.muscleGroups && { muscleGroups: updateExerciseDto.muscleGroups }),
        ...(updateExerciseDto.instructions && { instructions: updateExerciseDto.instructions }),
        ...(updateExerciseDto.videoUrl && { videoUrl: updateExerciseDto.videoUrl }),
        ...(updateExerciseDto.sets && { sets: updateExerciseDto.sets }),
        ...(updateExerciseDto.reps && { reps: updateExerciseDto.reps }),
      }
    }

    return this.prisma.exercise.update({
      where: { id },
      data: updateData,
      include: {
        owner: {
          select: { id: true, pseudo: true, firstName: true, lastName: true },
        },
      },
    })
  }

  async remove(id: string, userId: string) {
    const exercise = await this.prisma.exercise.findUnique({ where: { id } })

    if (!exercise) {
      throw new NotFoundException('Exercise not found')
    }

    // Only owner or admin can delete
    if (exercise.ownerId !== userId) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } })
      if (!user || user.role !== 'admin') {
        throw new ForbiddenException('You can only delete your own exercises')
      }
    }

    return this.prisma.exercise.delete({ where: { id } })
  }

  async searchLibrary(options: {
    search?: string
    difficulty?: string
    muscleGroup?: string
    page: number
    limit: number
    userId: string
  }) {
    const { search, difficulty, muscleGroup, page, limit, userId } = options
    const skip = (page - 1) * limit

    console.log('[searchLibrary] Called with limit:', limit)
    
    // Direct SQL - bypass all Prisma caching
    const escapedUserId = userId.replace(/'/g, "''")
    let whereClause = `(scope = 'global' OR "ownerId" = '${escapedUserId}')`

    if (search && search.trim()) {
      const escapedSearch = search.trim().replace(/'/g, "''")
      whereClause += ` AND (name ILIKE '%${escapedSearch}%' OR description ILIKE '%${escapedSearch}%')`
    }

    if (difficulty) {
      const escapedDifficulty = difficulty.replace(/'/g, "''")
      whereClause += ` AND (meta->>'difficulty_level' = '${escapedDifficulty}' OR meta->>'difficultyLevel' = '${escapedDifficulty}')`
    }

    if (muscleGroup) {
      const escapedMuscleGroup = muscleGroup.replace(/'/g, "''")
      whereClause += ` AND (meta->>'target_muscle_group' = '${escapedMuscleGroup}' OR meta->>'targetMuscleGroup' = '${escapedMuscleGroup}')`
    }

    console.log('[searchLibrary] WHERE clause:', whereClause.substring(0, 100))
    console.log('[searchLibrary] LIMIT:', limit, 'OFFSET:', skip)

    // Count total
    const countQuery = `SELECT COUNT(*) as count FROM exercises WHERE ${whereClause}`
    const countResult: any = await this.prisma.$queryRawUnsafe(countQuery)
    const total = parseInt(countResult[0].count, 10)
    console.log('[searchLibrary] Total count:', total)

    // Get paginated data
    const dataQuery = `SELECT * FROM exercises WHERE ${whereClause} ORDER BY "createdAt" DESC LIMIT $1 OFFSET $2`
    console.log('[searchLibrary] Running query with LIMIT', limit, 'OFFSET', skip)
    
    const exercises: any[] = await this.prisma.$queryRawUnsafe(
      dataQuery,
      limit,
      skip
    )
    
    console.log('[searchLibrary] Exercises returned:', exercises.length)

    return {
      data: exercises,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async getCoachExercises(
    userId: string,
    options: { page?: number; limit?: number; search?: string } = {}
  ) {
    const { page = 1, limit = 20, search = '' } = options
    const skip = (page - 1) * limit

    // Verify user is a coach
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== 'coach') {
      throw new ForbiddenException('Only coaches can view their created exercises')
    }

    // Build where clause
    const where: any = { ownerId: userId }

    // Add search filter
    if (search && search.trim()) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Get total count
    const total = await this.prisma.exercise.count({ where })

    // Get exercises
    const data = await this.prisma.exercise.findMany({
      where,
      include: {
        owner: {
          select: { id: true, pseudo: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    })

    // Transform data to flatten meta fields
    const transformedData = data.map((exercise) => ({
      ...exercise,
      ...(exercise.meta as any),
    }))

    return {
      data: transformedData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }
}
