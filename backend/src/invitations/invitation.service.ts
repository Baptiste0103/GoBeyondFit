import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../common/services/email.service';
import { SendInvitationDto, RespondToInvitationDto } from './dto/invitation.dto';

/**
 * Invitation Service
 * Handles invitation sending, acceptance, and rejection
 * Integrates with email service for notifications
 */
@Injectable()
export class InvitationService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  /**
   * Send an invitation to a user to join a group
   */
  async sendInvitation(fromCoachId: string, dto: SendInvitationDto) {
    // Verify group exists and coach owns it
    const group = await this.prisma.group.findUnique({
      where: { id: dto.groupId },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (group.ownerId !== fromCoachId) {
      throw new BadRequestException(
        'You can only send invitations for groups you own',
      );
    }

    // Resolve toUserId from either toUserId or toPseudo
    let toUserId = dto.toUserId;
    if (!toUserId && dto.toPseudo) {
      const user = await this.prisma.user.findFirst({
        where: { pseudo: { equals: dto.toPseudo, mode: 'insensitive' } },
        select: { id: true },
      });
      if (!user) {
        throw new NotFoundException(`User with pseudo ${dto.toPseudo} not found`);
      }
      toUserId = user.id;
    } else if (!toUserId) {
      throw new BadRequestException('Either toUserId or toPseudo must be provided');
    }

    // Check if user exists
    const toUser = await this.prisma.user.findUnique({
      where: { id: toUserId },
    });

    if (!toUser) {
      throw new NotFoundException('User not found');
    }

    // Check for existing invitation (pending or recent)
    const existingInvitation = await this.prisma.invitation.findFirst({
      where: {
        groupId: dto.groupId,
        toUserId: toUserId,
        status: 'pending',
      },
    });

    if (existingInvitation) {
      throw new BadRequestException(
        'An invitation is already pending for this user',
      );
    }

    // Get coach details
    const fromCoach = await this.prisma.user.findUnique({
      where: { id: fromCoachId },
    });

    // Create invitation
    const invitation = await this.prisma.invitation.create({
      data: {
        groupId: dto.groupId,
        fromCoachId,
        toUserId: toUserId,
        status: 'pending',
      },
      include: {
        group: true,
        fromCoach: true,
        toUser: true,
      },
    });

    // Send email notification
    const invitationLink = `${process.env.FRONTEND_URL}/invitations/${invitation.id}/accept`;
    
    try {
      await this.emailService.sendInvitationEmail(toUser.email, {
        recipientName: toUser.pseudo,
        senderName: fromCoach?.pseudo || 'Coach',
        groupName: group.name,
        invitationLink,
        expiresIn: '7 days',
      });
    } catch (error) {
      // Log error but don't fail the invitation creation
      console.error('Failed to send invitation email:', error);
    }

    return {
      id: invitation.id,
      groupId: invitation.groupId,
      fromCoachId: invitation.fromCoachId,
      toUserId: invitation.toUserId,
      status: invitation.status,
      createdAt: invitation.createdAt,
    };
  }

  /**
   * Get invitations for a user
   */
  async getInvitationsForUser(userId: string, status?: string) {
    const where: any = { toUserId: userId };
    // Default to pending invitations only
    where.status = status || 'pending';

    const invitations = await this.prisma.invitation.findMany({
      where,
      include: {
        group: true,
        fromCoach: {
          select: {
            id: true,
            pseudo: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return invitations;
  }

  /**
   * Get invitations sent by a coach
   */
  async getInvitationsSentByCoach(coachId: string, status?: string) {
    const where: any = { fromCoachId: coachId };
    if (status) {
      where.status = status;
    }

    const invitations = await this.prisma.invitation.findMany({
      where,
      include: {
        group: true,
        toUser: {
          select: {
            id: true,
            pseudo: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return invitations;
  }

  /**
   * Accept an invitation
   */
  async acceptInvitation(invitationId: string, userId: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.toUserId !== userId) {
      throw new BadRequestException(
        'This invitation is not intended for you',
      );
    }

    if (invitation.status !== 'pending') {
      throw new BadRequestException(
        `This invitation has already been ${invitation.status}`,
      );
    }

    // Update invitation status
    const updatedInvitation = await this.prisma.invitation.update({
      where: { id: invitationId },
      data: {
        status: 'accepted',
        respondedAt: new Date(),
      },
    });

    // Add user to group as member (or update if already exists)
    const existingMember = await this.prisma.groupMember.findFirst({
      where: {
        groupId: invitation.groupId,
        userId: invitation.toUserId,
      },
    });

    if (!existingMember) {
      await this.prisma.groupMember.create({
        data: {
          groupId: invitation.groupId,
          userId: invitation.toUserId,
          roleInGroup: 'member',
        },
      });
    }

    return {
      id: updatedInvitation.id,
      status: updatedInvitation.status,
      respondedAt: updatedInvitation.respondedAt,
    };
  }

  /**
   * Reject an invitation
   */
  async rejectInvitation(invitationId: string, userId: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.toUserId !== userId) {
      throw new BadRequestException(
        'This invitation is not intended for you',
      );
    }

    if (invitation.status !== 'pending') {
      throw new BadRequestException(
        `This invitation has already been ${invitation.status}`,
      );
    }

    // Update invitation status
    const updatedInvitation = await this.prisma.invitation.update({
      where: { id: invitationId },
      data: {
        status: 'rejected',
        respondedAt: new Date(),
      },
    });

    return {
      id: updatedInvitation.id,
      status: updatedInvitation.status,
      respondedAt: updatedInvitation.respondedAt,
    };
  }

  /**
   * Delete an invitation (coach or student who received it)
   */
  async deleteInvitation(invitationId: string, userId: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    // Allow coach who sent it or student who received it to delete
    const isCoachWhoSent = invitation.fromCoachId === userId;
    const isStudentWhoReceived = invitation.toUserId === userId;

    if (!isCoachWhoSent && !isStudentWhoReceived) {
      throw new BadRequestException(
        'You do not have permission to delete this invitation',
      );
    }

    await this.prisma.invitation.delete({
      where: { id: invitationId },
    });

    return { success: true };
  }
}
