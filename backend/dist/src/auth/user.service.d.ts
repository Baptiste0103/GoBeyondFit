import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { User } from '@prisma/client';
export declare class UserService {
    private prisma;
    constructor(prisma: PrismaService);
    hashPassword(password: string): Promise<string>;
    validatePassword(password: string, hash: string): Promise<boolean>;
    create(data: CreateUserDto): Promise<User>;
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findByEmailWithPassword(email: string): Promise<User | null>;
    findByPseudo(pseudo: string): Promise<User | null>;
    findAll(): Promise<User[]>;
    update(id: string, data: UpdateUserDto): Promise<User>;
    delete(id: string): Promise<User>;
    getStudentsByCoach(coachId: string): Promise<User[]>;
}
