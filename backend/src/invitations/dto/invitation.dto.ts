import { IsString, IsNotEmpty, IsOptional, IsEnum, IsUUID } from 'class-validator';

enum InvitationStatus {
  pending = 'pending',
  accepted = 'accepted',
  rejected = 'rejected',
}

export class SendInvitationDto {
  @IsUUID()
  @IsNotEmpty()
  groupId: string;

  @IsUUID()
  @IsOptional()
  toUserId?: string;

  @IsString()
  @IsOptional()
  toPseudo?: string;

  @IsString()
  @IsOptional()
  message?: string;
}

export class RespondToInvitationDto {
  @IsEnum(InvitationStatus)
  @IsNotEmpty()
  status: InvitationStatus;
}

export class InvitationResponseDto {
  id: string;
  groupId: string;
  fromCoachId: string;
  toUserId: string;
  status: string;
  createdAt: Date;
  respondedAt?: Date;
}

export class InvitationWithDetailsDto extends InvitationResponseDto {
  group?: {
    id: string;
    name: string;
  };
  fromCoach?: {
    id: string;
    pseudo: string;
    firstName?: string;
    lastName?: string;
  };
  toUser?: {
    id: string;
    email: string;
    pseudo: string;
  };
}
