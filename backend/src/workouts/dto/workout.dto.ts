import { IsObject, IsString, IsOptional, IsArray } from 'class-validator';

export class CreateSessionProgressDto {
  @IsObject()
  progress: Record<string, any>;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateSessionProgressDto {
  @IsObject()
  @IsOptional()
  progress?: Record<string, any>;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class AddVideoDto {
  @IsString()
  videoUrl: string;
}

export class CompleteSessionDto {
  @IsString()
  @IsOptional()
  notes?: string;
}
