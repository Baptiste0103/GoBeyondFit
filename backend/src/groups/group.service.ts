import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import {
  CreateGroupDto,
  UpdateGroupDto,
  CreateInvitationDto,
  RespondInvitationDto,
} from './dto'

@Injectable()
export class GroupService {
  constructor(private prisma: PrismaService) {}

  async create(createGroupDto: CreateGroupDto, userId: string) {
    return this.prisma.group.create({
      data: {
        ...createGroupDto,
        ownerId: userId,
      },
      include: {
        owner: {
          select: { id: true, pseudo: true, firstName: true, lastName: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, pseudo: true, email: true, firstName: true, lastName: true },
            },
          },
        },
      },
    })
  }

  async findAll(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      throw new NotFoundException('User not found')
    }

    // Get groups where user is owner or member
    const groups = await this.prisma.group.findMany({
      where: {
        OR: [
          { ownerId: userId }, // Owner
          { members: { some: { userId } } }, // Member
        ],
      },
      include: {
        owner: {
          select: { id: true, pseudo: true, firstName: true, lastName: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, pseudo: true, email: true, firstName: true, lastName: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return groups
  }

  async findOne(id: string, userId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, pseudo: true, firstName: true, lastName: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, pseudo: true, email: true, firstName: true, lastName: true },
            },
          },
        },
      },
    })

    if (!group) {
      throw new NotFoundException('Group not found')
    }

    // Check permission: owner or member can view
    const isMember = group.members.some((m) => m.userId === userId)
    if (group.ownerId !== userId && !isMember) {
      throw new ForbiddenException('You do not have permission to view this group')
    }

    return group
  }

  async update(id: string, updateGroupDto: UpdateGroupDto, userId: string) {
    const group = await this.prisma.group.findUnique({ where: { id } })

    if (!group) {
      throw new NotFoundException('Group not found')
    }

    if (group.ownerId !== userId) {
      throw new ForbiddenException('Only the group owner can update the group')
    }

    return this.prisma.group.update({
      where: { id },
      data: updateGroupDto,
      include: {
        owner: {
          select: { id: true, pseudo: true, firstName: true, lastName: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, pseudo: true, email: true, firstName: true, lastName: true },
            },
          },
        },
      },
    })
  }

  async remove(id: string, userId: string) {
    const group = await this.prisma.group.findUnique({ where: { id } })

    if (!group) {
      throw new NotFoundException('Group not found')
    }

    if (group.ownerId !== userId) {
      throw new ForbiddenException('Only the group owner can delete the group')
    }

    return this.prisma.group.delete({ where: { id } })
  }

  // Invitation management
  async inviteUser(createInvitationDto: CreateInvitationDto, userId: string) {
    const group = await this.prisma.group.findUnique({ where: { id: createInvitationDto.groupId } })

    if (!group) {
      throw new NotFoundException('Group not found')
    }

    if (group.ownerId !== userId) {
      throw new ForbiddenException('Only the group owner can invite users')
    }

    // Check if user already invited or member
    const existingInvitation = await this.prisma.invitation.findFirst({
      where: {
        groupId: createInvitationDto.groupId,
        toUserId: createInvitationDto.toUserId,
      },
    })

    if (existingInvitation) {
      throw new ForbiddenException('User already has a pending invitation to this group')
    }

    const isMember = await this.prisma.groupMember.findFirst({
      where: {
        groupId: createInvitationDto.groupId,
        userId: createInvitationDto.toUserId,
      },
    })

    if (isMember) {
      throw new ForbiddenException('User is already a member of this group')
    }

    return this.prisma.invitation.create({
      data: {
        groupId: createInvitationDto.groupId,
        fromCoachId: userId,
        toUserId: createInvitationDto.toUserId,
        status: 'pending',
      },
      include: {
        group: {
          select: { id: true, name: true },
        },
        fromCoach: {
          select: { id: true, pseudo: true, firstName: true, lastName: true },
        },
        toUser: {
          select: { id: true, pseudo: true, email: true },
        },
      },
    })
  }

  async getInvitations(userId: string) {
    return this.prisma.invitation.findMany({
      where: {
        toUserId: userId,
      },
      include: {
        group: {
          select: { id: true, name: true, description: true },
        },
        fromCoach: {
          select: { id: true, pseudo: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async respondToInvitation(invitationId: string, respondInvitationDto: RespondInvitationDto, userId: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { id: invitationId },
    })

    if (!invitation) {
      throw new NotFoundException('Invitation not found')
    }

    if (invitation.toUserId !== userId) {
      throw new ForbiddenException('You can only respond to your own invitations')
    }

    // Update invitation status
    const updatedInvitation = await this.prisma.invitation.update({
      where: { id: invitationId },
      data: {
        status: respondInvitationDto.status,
        respondedAt: new Date(),
      },
    })

    // If accepted, add user to group
    if (respondInvitationDto.status === 'accepted') {
      await this.prisma.groupMember.create({
        data: {
          groupId: invitation.groupId,
          userId: invitation.toUserId,
          roleInGroup: 'member',
        },
      })
    }

    return updatedInvitation
  }

  async addMember(groupId: string, userId: string, memberUserId: string) {
    const group = await this.prisma.group.findUnique({ where: { id: groupId } })

    if (!group) {
      throw new NotFoundException('Group not found')
    }

    if (group.ownerId !== userId) {
      throw new ForbiddenException('Only the group owner can add members')
    }

    const existingMember = await this.prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: memberUserId,
      },
    })

    if (existingMember) {
      throw new ForbiddenException('User is already a member of this group')
    }

    return this.prisma.groupMember.create({
      data: {
        groupId,
        userId: memberUserId,
        roleInGroup: 'member',
      },
    })
  }

  async removeMember(groupId: string, userId: string, memberUserId: string) {
    const group = await this.prisma.group.findUnique({ where: { id: groupId } })

    if (!group) {
      throw new NotFoundException('Group not found')
    }

    if (group.ownerId !== userId) {
      throw new ForbiddenException('Only the group owner can remove members')
    }

    const member = await this.prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: memberUserId,
      },
    })

    if (!member) {
      throw new NotFoundException('Member not found in group')
    }

    return this.prisma.groupMember.delete({
      where: { id: member.id },
    })
  }
}
