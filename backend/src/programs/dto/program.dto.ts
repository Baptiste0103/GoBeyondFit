import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsArray,
  IsUUID,
  IsJSON,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Session Exercise DTO
export class SessionExerciseDto {
  @ApiProperty({ description: 'Exercise ID' })
  @IsUUID()
  @IsNotEmpty()
  exerciseId: string;

  @ApiPropertyOptional({ description: 'Position in session', example: 0 })
  @IsOptional()
  position?: number;

  @ApiPropertyOptional({ description: 'Exercise config (sets, reps, weights)' })
  @IsOptional()
  config?: Record<string, any>;
}

// Session DTO
export class SessionDto {
  @ApiPropertyOptional({ description: 'Session title', example: 'Workout A' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Session notes', example: 'Push day' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Planned date' })
  @IsOptional()
  date?: Date;

  @ApiPropertyOptional({ description: 'Position in week', example: 0 })
  @IsOptional()
  position?: number;

  @ApiPropertyOptional({ type: [SessionExerciseDto], description: 'Exercises in session' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SessionExerciseDto)
  exercises?: SessionExerciseDto[];
}

// Week DTO
export class WeekDto {
  @ApiPropertyOptional({ description: 'Week number', example: 1 })
  @IsOptional()
  weekNumber?: number;

  @ApiPropertyOptional({ description: 'Position in block', example: 0 })
  @IsOptional()
  position?: number;

  @ApiPropertyOptional({ type: [SessionDto], description: 'Sessions in week' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SessionDto)
  sessions?: SessionDto[];
}

// Block DTO
export class BlockDto {
  @ApiPropertyOptional({ description: 'Block title', example: 'Strength Block' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Block notes', example: 'Focus on compound lifts' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Position in program', example: 0 })
  @IsOptional()
  position?: number;

  @ApiPropertyOptional({ type: [WeekDto], description: 'Weeks in block' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WeekDto)
  weeks?: WeekDto[];
}

export class CreateProgramDto {
  @ApiProperty({ description: 'Program title', example: '12-Week Strength Program' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Program description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Is draft (not published)', example: true })
  @IsBoolean()
  @IsOptional()
  isDraft?: boolean = true;

  @ApiPropertyOptional({ type: [BlockDto], description: 'Nested program structure' })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => BlockDto)
  blocks?: BlockDto[];
}

export class UpdateProgramDto {
  @ApiPropertyOptional({ description: 'Program title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Program description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Is draft' })
  @IsBoolean()
  @IsOptional()
  isDraft?: boolean;
}

export class ProgramResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  coachId: string;

  @ApiProperty()
  isDraft: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
