import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsPositive,
  IsEnum,
  IsArray,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ExerciseConfigType {
  STANDARD = 'standard',
  EMOM = 'EMOM',
  AMRAP = 'AMRAP',
  CIRCUIT = 'circuit',
}

/**
 * Standard Exercise Config
 * Coach specifies target sets, reps, weight
 */
export class StandardExerciseConfig {
  @IsNumber()
  @IsPositive()
  sets: number;

  @IsNumber()
  @IsPositive()
  reps: number;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  weight?: number;

  @IsString()
  @IsOptional()
  weightUnit?: string; // 'lbs', 'kg'

  @IsString()
  @IsOptional()
  notes?: string;
}

/**
 * EMOM (Every Minute On The Minute) Config
 * Coach specifies total minutes and target reps per minute
 */
export class EMOMExerciseConfig {
  @IsNumber()
  @IsPositive()
  @Max(60)
  totalMinutes: number;

  @IsNumber()
  @IsPositive()
  repsPerMinute: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

/**
 * AMRAP (As Many Reps As Possible) Config
 * Coach specifies time window and target reps
 */
export class AMRAPExerciseConfig {
  @IsNumber()
  @IsPositive()
  @Max(60)
  timeMinutes: number;

  @IsNumber()
  @IsPositive()
  targetReps: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

/**
 * Circuit Exercise Config
 * Part of a circuit with multiple exercises
 */
export class CircuitExerciseConfig {
  @IsNumber()
  @IsPositive()
  rounds: number;

  @IsNumber()
  @IsPositive()
  repsPerRound: number;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  weight?: number;

  @IsString()
  @IsOptional()
  weightUnit?: string;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  restSeconds?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

/**
 * Exercise Instance Config - Union type for all exercise configurations
 */
export class ExerciseInstanceConfig {
  @IsEnum(ExerciseConfigType)
  @IsNotEmpty()
  type: ExerciseConfigType;

  @IsString()
  @IsNotEmpty()
  exerciseId: string;

  @IsString()
  @IsNotEmpty()
  exerciseName: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => StandardExerciseConfig, {
    discriminator: {
      property: 'type',
      subTypes: [{ value: StandardExerciseConfig, name: ExerciseConfigType.STANDARD }],
    },
  })
  config?: StandardExerciseConfig | EMOMExerciseConfig | AMRAPExerciseConfig | CircuitExerciseConfig;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  order?: number;
}

/**
 * Session Workout Config - What coach configured for the session
 */
export class SessionWorkoutConfig {
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExerciseInstanceConfig)
  exercises: ExerciseInstanceConfig[];

  @IsString()
  @IsOptional()
  notes?: string;

  @IsNumber()
  @IsOptional()
  estimatedMinutes?: number;
}
