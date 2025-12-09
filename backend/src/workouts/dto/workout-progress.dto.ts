import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsPositive,
  IsEnum,
  IsArray,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ProgressStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
  FAILED = 'failed',
}

/**
 * Standard Exercise Progress - Student logs actual sets/reps completed
 */
export class StandardExerciseProgress {
  @IsNumber()
  @IsPositive()
  setsCompleted: number;

  @IsNumber()
  @IsPositive()
  repsCompleted: number;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  weightUsed?: number;

  @IsString()
  @IsOptional()
  weightUnit?: string;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  rpe?: number; // Rate of Perceived Exertion (0-10)

  @IsString()
  @IsOptional()
  notes?: string;
}

/**
 * EMOM Exercise Progress - Student logs reps completed each minute
 */
export class EMOMExerciseProgress {
  @IsArray()
  @IsNumber({}, { each: true })
  repsPerMinute: number[]; // Array of reps for each minute

  @IsNumber()
  @IsOptional()
  @IsPositive()
  rpe?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

/**
 * AMRAP Exercise Progress - Student logs total reps in time window
 */
export class AMRAPExerciseProgress {
  @IsNumber()
  @IsPositive()
  totalReps: number;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  rpe?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

/**
 * Circuit Exercise Progress - Student logs rounds and reps
 */
export class CircuitExerciseProgress {
  @IsNumber()
  @IsPositive()
  roundsCompleted: number;

  @IsNumber()
  @IsPositive()
  totalReps: number;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  weightUsed?: number;

  @IsString()
  @IsOptional()
  weightUnit?: string;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  rpe?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

/**
 * Exercise Progress Log - Student's actual performance
 */
export class ExerciseProgressLog {
  @IsUUID()
  @IsNotEmpty()
  exerciseInstanceId: string;

  @IsString()
  @IsNotEmpty()
  exerciseName: string;

  @IsEnum(ProgressStatus)
  @IsNotEmpty()
  status: ProgressStatus;

  @IsOptional()
  @ValidateNested()
  @Type(() => StandardExerciseProgress, {
    discriminator: {
      property: 'type',
      subTypes: [
        { value: StandardExerciseProgress, name: 'standard' },
        { value: EMOMExerciseProgress, name: 'EMOM' },
        { value: AMRAPExerciseProgress, name: 'AMRAP' },
        { value: CircuitExerciseProgress, name: 'circuit' },
      ],
    },
  })
  progress?: StandardExerciseProgress | EMOMExerciseProgress | AMRAPExerciseProgress | CircuitExerciseProgress;

  @IsOptional()
  @IsUUID()
  videoMediaId?: string; // Reference to uploaded video evidence

  @IsNumber()
  @IsOptional()
  @IsPositive()
  durationSeconds?: number; // How long the exercise took

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[]; // e.g., ['form-issue', 'equipment-unavailable', 'feeling-strong']

  @IsNumber()
  @IsOptional()
  completedAt?: number; // Timestamp
}

/**
 * Session Progress Submission - Student submits completed workout
 */
export class SessionProgressSubmission {
  @IsUUID()
  @IsNotEmpty()
  sessionId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExerciseProgressLog)
  exercises: ExerciseProgressLog[];

  @IsString()
  @IsOptional()
  overallNotes?: string;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  totalDurationMinutes?: number;

  @IsEnum(ProgressStatus)
  @IsNotEmpty()
  sessionStatus: ProgressStatus;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  difficulty?: number; // 1-10 scale

  @IsNumber()
  @IsOptional()
  @IsPositive()
  energyLevel?: number; // 1-10 scale

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  issues?: string[]; // e.g., ['equipment-shortage', 'time-constraint', 'feeling-tired']
}

/**
 * Quick Exercise Log - For rapid in-app logging
 */
export class QuickExerciseLog {
  @IsUUID()
  @IsNotEmpty()
  exerciseInstanceId: string;

  @IsEnum(ProgressStatus)
  @IsNotEmpty()
  status: ProgressStatus;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  repsCompleted?: number;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  setsCompleted?: number;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  rpe?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
