import { IsString, IsEnum, IsOptional, IsArray, IsNumber, IsObject } from 'class-validator'

enum ExerciseType {
  standard = 'standard',
  EMOM = 'EMOM',
  AMRAP = 'AMRAP',
  custom = 'custom',
}

enum Scope {
  global = 'global',
  coach = 'coach',
}

export class CreateExerciseDto {
  @IsString()
  name: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsEnum(ExerciseType)
  type?: ExerciseType

  @IsOptional()
  @IsString()
  difficulty?: string

  @IsOptional()
  @IsArray()
  muscleGroups?: string[]

  @IsOptional()
  @IsArray()
  instructions?: string[]

  @IsOptional()
  @IsString()
  videoUrl?: string

  @IsOptional()
  @IsNumber()
  sets?: number

  @IsOptional()
  @IsNumber()
  reps?: number

  @IsOptional()
  @IsObject()
  meta?: Record<string, any>

  @IsOptional()
  @IsEnum(Scope)
  scope?: Scope
}
