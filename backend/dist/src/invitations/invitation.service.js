"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvitationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const email_service_1 = require("../common/services/email.service");
let InvitationService = class InvitationService {
    prisma;
    emailService;
    constructor(prisma, emailService) {
        this.prisma = prisma;
        this.emailService = emailService;
    }
    async sendInvitation(fromCoachId, dto) {
        const group = await this.prisma.group.findUnique({
            where: { id: dto.groupId },
        });
        if (!group) {
            throw new common_1.NotFoundException('Group not found');
        }
        if (group.ownerId !== fromCoachId) {
            throw new common_1.BadRequestException('You can only send invitations for groups you own');
        }
        const toUser = await this.prisma.user.findUnique({
            where: { id: dto.toUserId },
        });
        if (!toUser) {
            throw new common_1.NotFoundException('User not found');
        }
        const existingInvitation = await this.prisma.invitation.findFirst({
            where: {
                groupId: dto.groupId,
                toUserId: dto.toUserId,
                status: 'pending',
            },
        });
        if (existingInvitation) {
            throw new common_1.BadRequestException('An invitation is already pending for this user');
        }
        const fromCoach = await this.prisma.user.findUnique({
            where: { id: fromCoachId },
        });
        const invitation = await this.prisma.invitation.create({
            data: {
                groupId: dto.groupId,
                fromCoachId,
                toUserId: dto.toUserId,
                status: 'pending',
            },
            include: {
                group: true,
                fromCoach: true,
                toUser: true,
            },
        });
        const invitationLink = `${process.env.FRONTEND_URL}/invitations/${invitation.id}/accept`;
        try {
            await this.emailService.sendInvitationEmail(toUser.email, {
                recipientName: toUser.pseudo,
                senderName: fromCoach?.pseudo || 'Coach',
                groupName: group.name,
                invitationLink,
                expiresIn: '7 days',
            });
        }
        catch (error) {
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
    async getInvitationsForUser(userId, status) {
        const where = { toUserId: userId };
        if (status) {
            where.status = status;
        }
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
    async getInvitationsSentByCoach(coachId, status) {
        const where = { fromCoachId: coachId };
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
    async acceptInvitation(invitationId, userId) {
        const invitation = await this.prisma.invitation.findUnique({
            where: { id: invitationId },
        });
        if (!invitation) {
            throw new common_1.NotFoundException('Invitation not found');
        }
        if (invitation.toUserId !== userId) {
            throw new common_1.BadRequestException('This invitation is not intended for you');
        }
        if (invitation.status !== 'pending') {
            throw new common_1.BadRequestException(`This invitation has already been ${invitation.status}`);
        }
        const updatedInvitation = await this.prisma.invitation.update({
            where: { id: invitationId },
            data: {
                status: 'accepted',
                respondedAt: new Date(),
            },
        });
        await this.prisma.groupMember.create({
            data: {
                groupId: invitation.groupId,
                userId: invitation.toUserId,
                roleInGroup: 'member',
            },
        });
        return {
            id: updatedInvitation.id,
            status: updatedInvitation.status,
            respondedAt: updatedInvitation.respondedAt,
        };
    }
    async rejectInvitation(invitationId, userId) {
        const invitation = await this.prisma.invitation.findUnique({
            where: { id: invitationId },
        });
        if (!invitation) {
            throw new common_1.NotFoundException('Invitation not found');
        }
        if (invitation.toUserId !== userId) {
            throw new common_1.BadRequestException('This invitation is not intended for you');
        }
        if (invitation.status !== 'pending') {
            throw new common_1.BadRequestException(`This invitation has already been ${invitation.status}`);
        }
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
    async deleteInvitation(invitationId, fromCoachId) {
        const invitation = await this.prisma.invitation.findUnique({
            where: { id: invitationId },
        });
        if (!invitation) {
            throw new common_1.NotFoundException('Invitation not found');
        }
        if (invitation.fromCoachId !== fromCoachId) {
            throw new common_1.BadRequestException('You can only delete your own invitations');
        }
        await this.prisma.invitation.delete({
            where: { id: invitationId },
        });
        return { success: true };
    }
};
exports.InvitationService = InvitationService;
exports.InvitationService = InvitationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService])
], InvitationService);
//# sourceMappingURL=invitation.service.js.map