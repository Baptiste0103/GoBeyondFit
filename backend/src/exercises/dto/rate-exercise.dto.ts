import { IsInt, Min, Max, IsOptional, IsString, Length } from 'class-validator'

export class RateExerciseDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number

  @IsOptional()
  @IsString()
  @Length(0, 500)
  comment?: string
}
