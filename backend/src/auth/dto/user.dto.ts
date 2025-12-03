import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';

// Define Role enum locally for validation
export enum UserRole {
  admin = 'admin',
  coach = 'coach',
  student = 'student',
}

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  pseudo: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEnum(UserRole)
  role: UserRole;
}

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  pseudo?: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  profileUrl?: string;
}

export class UserResponseDto {
  id: string;
  email: string;
  pseudo: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  profileUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
