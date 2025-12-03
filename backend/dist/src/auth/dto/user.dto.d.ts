export declare enum UserRole {
    admin = "admin",
    coach = "coach",
    student = "student"
}
export declare class CreateUserDto {
    email: string;
    pseudo: string;
    password: string;
    firstName?: string;
    lastName?: string;
    role: UserRole;
}
export declare class UpdateUserDto {
    pseudo?: string;
    firstName?: string;
    lastName?: string;
    profileUrl?: string;
}
export declare class UserResponseDto {
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
