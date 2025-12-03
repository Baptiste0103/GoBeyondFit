import { JwtService } from '@nestjs/jwt';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
export declare class AuthController {
    private readonly userService;
    private readonly jwtService;
    constructor(userService: UserService, jwtService: JwtService);
    signup(createUserDto: CreateUserDto): Promise<{
        user: {
            id: string;
            email: string;
            pseudo: string;
            firstName: string | null;
            lastName: string | null;
            role: import(".prisma/client").$Enums.Role;
            profileUrl: string | null;
        };
        access_token: string;
    }>;
    login(loginDto: {
        email: string;
        password: string;
    }): Promise<{
        user: {
            id: string;
            email: string;
            pseudo: string;
            firstName: string | null;
            lastName: string | null;
            role: import(".prisma/client").$Enums.Role;
            profileUrl: string | null;
        };
        access_token: string;
    }>;
    getCurrentUser(req: any): Promise<{
        email: string;
        pseudo: string;
        password: string;
        firstName: string | null;
        lastName: string | null;
        role: import(".prisma/client").$Enums.Role;
        profileUrl: string | null;
        id: string;
        coachId: string | null;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    getAllUsers(): Promise<{
        email: string;
        pseudo: string;
        password: string;
        firstName: string | null;
        lastName: string | null;
        role: import(".prisma/client").$Enums.Role;
        profileUrl: string | null;
        id: string;
        coachId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getUserById(id: string): Promise<{
        email: string;
        pseudo: string;
        password: string;
        firstName: string | null;
        lastName: string | null;
        role: import(".prisma/client").$Enums.Role;
        profileUrl: string | null;
        id: string;
        coachId: string | null;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    updateUser(id: string, updateUserDto: UpdateUserDto): Promise<{
        email: string;
        pseudo: string;
        password: string;
        firstName: string | null;
        lastName: string | null;
        role: import(".prisma/client").$Enums.Role;
        profileUrl: string | null;
        id: string;
        coachId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteUser(id: string): Promise<{
        email: string;
        pseudo: string;
        password: string;
        firstName: string | null;
        lastName: string | null;
        role: import(".prisma/client").$Enums.Role;
        profileUrl: string | null;
        id: string;
        coachId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getCoachStudents(coachId: string): Promise<{
        email: string;
        pseudo: string;
        password: string;
        firstName: string | null;
        lastName: string | null;
        role: import(".prisma/client").$Enums.Role;
        profileUrl: string | null;
        id: string;
        coachId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
}
