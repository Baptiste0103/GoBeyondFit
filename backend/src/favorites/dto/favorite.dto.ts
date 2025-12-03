import { IsUUID } from 'class-validator'

export class AddFavoriteDto {
  @IsUUID()
  exerciseId: string
}

export class RemoveFavoriteDto {
  @IsUUID()
  exerciseId: string
}
