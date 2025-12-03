import { IsString, IsOptional, IsNotEmpty, IsJSON, IsUUID, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddExerciseToSessionDto {
  @ApiProperty({
    description: 'Exercise ID to add',
    example: 'uuid-here',
  })
  @IsUUID()
  @IsNotEmpty()
  exerciseId: string;

  @ApiPropertyOptional({
    description: 'Exercise configuration',
    example: {
      sets: 3,
      reps: 10,
      format: 'standard',
      weight: 20,
      duration: 60,
      notes: 'Optional notes',
    },
  })
  @IsOptional()
  config?: {
    sets?: number;
    reps?: number;
    format?: string;
    weight?: number;
    duration?: number;
    notes?: string;
  };
}

export class CreateSessionProgressDto {
  @ApiProperty({
    description: 'Exercise instance ID',
    example: 'uuid-here',
  })
  @IsUUID()
  @IsNotEmpty()
  exerciseInstanceId: string;

  @ApiPropertyOptional({
    description: 'Progress data (sets, reps, weights, notes, etc)',
    example: { sets: [{ reps: 10, weight: 100 }], done: false },
  })
  @IsOptional()
  progress?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Workout notes',
    example: 'Felt strong today',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Video upload URLs',
    example: ['https://...'],
  })
  @IsOptional()
  videos?: string[];
}

export class SessionProgressResponseDto {
  id: string;
  sessionId: string;
  studentId: string;
  exerciseInstanceId?: string;
  progress?: Record<string, any>;
  notes?: string;
  videos: string[];
  savedAt: Date;
}
