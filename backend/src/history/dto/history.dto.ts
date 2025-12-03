import { IsNotEmpty, IsString, IsOptional, IsDateString } from 'class-validator'

export class LogViewDto {
  @IsNotEmpty()
  @IsString()
  exerciseId: string

  @IsOptional()
  @IsString()
  notes?: string
}

export class GetHistoryDto {
  @IsOptional()
  page?: number = 1

  @IsOptional()
  limit?: number = 20

  @IsOptional()
  @IsDateString()
  from?: string

  @IsOptional()
  @IsDateString()
  to?: string
}
