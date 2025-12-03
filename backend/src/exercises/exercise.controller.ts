import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  HttpStatus,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger'
import { ExerciseService } from './exercise.service'
import { CreateExerciseDto, UpdateExerciseDto } from './dto'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'

@ApiTags('Exercises')
@ApiBearerAuth()
@Controller('exercises')
export class ExerciseController {
  constructor(private readonly exerciseService: ExerciseService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new exercise' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Exercise created',
  })
  async create(
    @Body() createExerciseDto: CreateExerciseDto,
    @Request() req: any,
  ) {
    return this.exerciseService.create(createExerciseDto, req.user.id)
  }

  @Get('library/search')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Search exercises in library with pagination and filters' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of exercises with search results',
  })
  async searchLibrary(
    @Request() req: any,
    @Query('q') search?: string,
    @Query('difficulty') difficulty?: string,
    @Query('muscle') muscleGroup?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const finalLimit = Math.min(3500, Math.max(1, limit || 20))
    console.log('[ExerciseController] searchLibrary called with:', { limit, finalLimit })
    return this.exerciseService.searchLibrary({
      search,
      difficulty,
      muscleGroup,
      page: Math.max(1, page || 1),
      limit: finalLimit,
      userId: req.user.id,
    })
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all exercises visible to user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of exercises',
  })
  async findAll(@Request() req: any) {
    return this.exerciseService.findAll(req.user.id)
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get exercise by ID with all details' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Exercise found with complete details',
  })
  async findOne(@Param('id') id: string, @Request() req: any) {
    return this.exerciseService.findOne(id, req.user.id)
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update exercise' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Exercise updated',
  })
  async update(
    @Param('id') id: string,
    @Body() updateExerciseDto: UpdateExerciseDto,
    @Request() req: any,
  ) {
    return this.exerciseService.update(id, updateExerciseDto, req.user.id)
  }

  @Get('my/created')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get exercises created by current coach' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of exercises created by coach',
  })
  async getCoachExercises(
    @Request() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.exerciseService.getCoachExercises(req.user.id, {
      page: Math.max(1, page || 1),
      limit: Math.min(100, Math.max(1, limit || 20)),
      search,
    })
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete exercise' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Exercise deleted',
  })
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.exerciseService.remove(id, req.user.id)
  }
}
