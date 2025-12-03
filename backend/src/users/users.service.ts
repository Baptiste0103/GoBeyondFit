import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        pseudo: true,
        firstName: true,
        lastName: true,
        role: true,
        profileUrl: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }

  async findByPseudoOrNull(pseudo: string) {
    const user = await this.prisma.user.findFirst({
      where: { pseudo: { equals: pseudo, mode: 'insensitive' } },
      select: {
        id: true,
        email: true,
        pseudo: true,
        firstName: true,
        lastName: true,
        role: true,
        profileUrl: true,
      },
    });

    return user;
  }

  async findByPseudo(pseudo: string) {
    const user = await this.prisma.user.findFirst({
      where: { pseudo: { equals: pseudo, mode: 'insensitive' } },
      select: {
        id: true,
        email: true,
        pseudo: true,
        firstName: true,
        lastName: true,
        role: true,
        profileUrl: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with pseudo ${pseudo} not found`);
    }

    return user;
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        pseudo: true,
        firstName: true,
        lastName: true,
        role: true,
        profileUrl: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async searchUsers(query: string) {
    return this.prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: query, mode: 'insensitive' } },
          { pseudo: { contains: query, mode: 'insensitive' } },
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        email: true,
        pseudo: true,
        firstName: true,
        lastName: true,
        role: true,
        profileUrl: true,
      },
      take: 20,
    });
  }

  async getCoachStudents(coachId: string) {
    // TODO: Implement coach-students relationship query
    return [];
  }
}
