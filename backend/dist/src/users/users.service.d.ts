import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findByEmail(email: string): Promise<{
        email: string;
        pseudo: string;
        firstName: string | null;
        lastName: string | null;
        role: import(".prisma/client").$Enums.Role;
        profileUrl: string | null;
        id: string;
    }>;
    findByPseudoOrNull(pseudo: string): Promise<{
        email: string;
        pseudo: string;
        firstName: string | null;
        lastName: string | null;
        role: import(".prisma/client").$Enums.Role;
        profileUrl: string | null;
        id: string;
    } | null>;
    findByPseudo(pseudo: string): Promise<{
        email: string;
        pseudo: string;
        firstName: string | null;
        lastName: string | null;
        role: import(".prisma/client").$Enums.Role;
        profileUrl: string | null;
        id: string;
    }>;
    findById(id: string): Promise<{
        email: string;
        pseudo: string;
        firstName: string | null;
        lastName: string | null;
        role: import(".prisma/client").$Enums.Role;
        profileUrl: string | null;
        id: string;
    }>;
    searchUsers(query: string): Promise<{
        email: string;
        pseudo: string;
        firstName: string | null;
        lastName: string | null;
        role: import(".prisma/client").$Enums.Role;
        profileUrl: string | null;
        id: string;
    }[]>;
    getCoachStudents(coachId: string): Promise<never[]>;
}
