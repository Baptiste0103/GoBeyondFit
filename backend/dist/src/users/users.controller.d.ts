import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    searchByEmail(email: string): Promise<{
        email: string;
        pseudo: string;
        firstName: string | null;
        lastName: string | null;
        role: import(".prisma/client").$Enums.Role;
        profileUrl: string | null;
        id: string;
    }>;
}
