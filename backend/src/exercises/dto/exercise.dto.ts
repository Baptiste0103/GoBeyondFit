import { IsString, IsNotEmpty, IsOptional, IsEnum, IsObject } from 'class-validator';

export enum ExerciseTypeEnum {
  standard = 'standard',
  EMOM = 'EMOM',
  AMRAP = 'AMRAP',
  custom = 'custom',
}

export enum ScopeEnum {
  global = 'global',
  coach = 'coach',
}

export class CreateExerciseDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ExerciseTypeEnum)
  @IsNotEmpty()
  type: ExerciseTypeEnum;

  @IsObject()
  @IsOptional()
  meta?: Record<string, any>;

  @IsEnum(ScopeEnum)
  @IsNotEmpty()
  scope: ScopeEnum;

  @IsString()
  @IsOptional()
  ownerId?: string;
}

export class UpdateExerciseDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ExerciseTypeEnum)
  @IsOptional()
  type?: ExerciseTypeEnum;

  @IsObject()
  @IsOptional()
  meta?: Record<string, any>;

  @IsEnum(ScopeEnum)
  @IsOptional()
  scope?: ScopeEnum;
}

export class ExerciseResponseDto {
  id: string;
  name: string;
  description?: string;
  type: ExerciseTypeEnum;
  meta?: Record<string, any>;
  scope: ScopeEnum;
  ownerId?: string;
  createdAt: Date;
  updatedAt: Date;
}
