import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  HttpCode,
  BadRequestException,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { ProgramBuilderService, FilterOptions, DuplicateCheckResult } from './program-builder.service'

@Controller('programs/builder')
@UseGuards(JwtAuthGuard)
export class ProgramBuilderController {
  constructor(private readonly builderService: ProgramBuilderService) {}

  /**
   * GET /programs/builder/exercises/filter
   * Filter exercises for program builder
   */
  @Get('exercises/filter')
  async filterExercises(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
    @Query('muscleGroups') muscleGroups?: string,
    @Query('difficulty') difficulty?: string,
    @Query('search') search?: string,
    @Query('exclude') exclude?: string,
  ) {
    if (limit > 100) limit = 100
    if (page < 1) page = 1

    const options: FilterOptions = {
      muscleGroups: muscleGroups ? muscleGroups.split(',') : undefined,
      difficulty,
      searchQuery: search,
      excludeExercises: exclude ? exclude.split(',') : undefined,
    }

    return this.builderService.filterExercises(options, page, limit)
  }

  /**
   * POST /programs/builder/validate
   * Validate program structure
   */
  @Post('validate')
  @HttpCode(200)
  async validateProgram(@Body() programData: any) {
    return this.builderService.validateProgram(programData)
  }

  /**
   * POST /programs/builder/check-duplicates
   * Check for duplicate exercises in program
   */
  @Post('check-duplicates')
  @HttpCode(200)
  async checkDuplicates(
    @Body() { exercises }: { exercises: any[] }
  ): Promise<DuplicateCheckResult> {
    if (!exercises || !Array.isArray(exercises)) {
      throw new BadRequestException('Exercises array is required')
    }

    const result = this.builderService.checkDuplicates(exercises)

    // Enrich with exercise names if there are duplicates
    if (result.hasDuplicates && result.duplicates.length > 0) {
      const exerciseIds = result.duplicates.map((d) => d.exerciseId)
      const exerciseMap = await this.builderService.getExercisesWithDetails(exerciseIds)

      result.duplicates.forEach((dup) => {
        const exercise = exerciseMap.get(dup.exerciseId)
        if (exercise) {
          dup.exerciseName = exercise.name
        }
      })
    }

    return result
  }

  /**
   * POST /programs/builder/:programId/clone
   * Clone an existing program
   */
  @Post(':programId/clone')
  @HttpCode(201)
  async cloneProgram(
    @Param('programId') programId: string,
    @Body() { title }: { title: string },
    @Request() req
  ) {
    if (!title || title.length < 3) {
      throw new BadRequestException('Title must be at least 3 characters')
    }

    return this.builderService.cloneProgram(req.user.id, programId, title)
  }

  /**
   * GET /programs/builder/:programId/stats
   * Get program statistics
   */
  @Get(':programId/stats')
  async getProgramStats(@Param('programId') programId: string) {
    return this.builderService.getProgramStats(programId)
  }

  /**
   * GET /programs/builder/:programId/details
   * Get full program details with structure
   */
  @Get(':programId/details')
  async getProgramDetails(
    @Param('programId') programId: string,
    @Request() req
  ) {
    return this.builderService.getProgramDetails(programId, req.user.id)
  }

  /**
   * PUT /programs/builder/:programId/save
   * Save program structure (blocks, sessions, exercises)
   */
  @Put(':programId/save')
  @HttpCode(200)
  async saveProgram(
    @Param('programId') programId: string,
    @Body() saveData: {
      title: string;
      description?: string;
      blocks: any[];
      isDraft?: boolean;
    },
    @Request() req
  ) {
    return this.builderService.saveProgram(req.user.id, programId, saveData)
  }
}

@Controller('programs/builder/templates')
@UseGuards(JwtAuthGuard)
export class ProgramTemplatesController {
  constructor(private readonly builderService: ProgramBuilderService) {}

  /**
   * POST /programs/builder/templates/:templateId/create
   * Create program from template
   */
  @Post(':templateId/create')
  @HttpCode(201)
  async createFromTemplate(
    @Param('templateId') templateId: string,
    @Body() { title, customizations }: { title: string; customizations?: any },
    @Request() req
  ) {
    if (!title || title.length < 3) {
      throw new BadRequestException('Title must be at least 3 characters')
    }

    // Template structure mapping
    const templates: { [key: string]: any } = {
      'beginner-strength': {
        blocks: [
          {
            title: 'Foundation Phase',
            weeks: [
              {
                weekNumber: 1,
                sessions: [
                  { title: 'Full Body A', exercises: [] },
                  { title: 'Full Body B', exercises: [] },
                  { title: 'Full Body C', exercises: [] },
                ],
              },
            ],
          },
        ],
      },
      // Add more templates as needed
    }

    const template = templates[templateId]
    if (!template) {
      throw new BadRequestException('Template not found')
    }

    // This would be implemented with actual Program creation
    return {
      message: `Program created from template: ${templateId}`,
      title,
      template: templateId,
    }
  }
}
