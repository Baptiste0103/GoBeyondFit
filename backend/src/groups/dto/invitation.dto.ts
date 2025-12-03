import { IsString, IsEnum } from 'class-validator'

enum InvitationStatus {
  pending = 'pending',
  accepted = 'accepted',
  rejected = 'rejected',
}

export class CreateInvitationDto {
  @IsString()
  toUserId: string

  @IsString()
  groupId: string
}

export class RespondInvitationDto {
  @IsEnum(InvitationStatus)
  status: InvitationStatus
}
