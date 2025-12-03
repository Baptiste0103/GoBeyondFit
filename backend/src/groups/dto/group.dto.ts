import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsNotEmpty()
  ownerId: string;
}

export class UpdateGroupDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class AddGroupMemberDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsOptional()
  roleInGroup?: string;
}

export class GroupResponseDto {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class GroupMemberResponseDto {
  id: string;
  userId: string;
  roleInGroup: string;
  joinedAt: Date;
}
