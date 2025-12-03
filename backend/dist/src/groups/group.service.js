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
exports.GroupService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let GroupService = class GroupService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createGroupDto, userId) {
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
        });
    }
    async findAll(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const groups = await this.prisma.group.findMany({
            where: {
                OR: [
                    { ownerId: userId },
                    { members: { some: { userId } } },
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
        });
        return groups;
    }
    async findOne(id, userId) {
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
        });
        if (!group) {
            throw new common_1.NotFoundException('Group not found');
        }
        const isMember = group.members.some((m) => m.userId === userId);
        if (group.ownerId !== userId && !isMember) {
            throw new common_1.ForbiddenException('You do not have permission to view this group');
        }
        return group;
    }
    async update(id, updateGroupDto, userId) {
        const group = await this.prisma.group.findUnique({ where: { id } });
        if (!group) {
            throw new common_1.NotFoundException('Group not found');
        }
        if (group.ownerId !== userId) {
            throw new common_1.ForbiddenException('Only the group owner can update the group');
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
        });
    }
    async remove(id, userId) {
        const group = await this.prisma.group.findUnique({ where: { id } });
        if (!group) {
            throw new common_1.NotFoundException('Group not found');
        }
        if (group.ownerId !== userId) {
            throw new common_1.ForbiddenException('Only the group owner can delete the group');
        }
        return this.prisma.group.delete({ where: { id } });
    }
    async inviteUser(createInvitationDto, userId) {
        const group = await this.prisma.group.findUnique({ where: { id: createInvitationDto.groupId } });
        if (!group) {
            throw new common_1.NotFoundException('Group not found');
        }
        if (group.ownerId !== userId) {
            throw new common_1.ForbiddenException('Only the group owner can invite users');
        }
        const existingInvitation = await this.prisma.invitation.findFirst({
            where: {
                groupId: createInvitationDto.groupId,
                toUserId: createInvitationDto.toUserId,
            },
        });
        if (existingInvitation) {
            throw new common_1.ForbiddenException('User already has a pending invitation to this group');
        }
        const isMember = await this.prisma.groupMember.findFirst({
            where: {
                groupId: createInvitationDto.groupId,
                userId: createInvitationDto.toUserId,
            },
        });
        if (isMember) {
            throw new common_1.ForbiddenException('User is already a member of this group');
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
        });
    }
    async getInvitations(userId) {
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
        });
    }
    async respondToInvitation(invitationId, respondInvitationDto, userId) {
        const invitation = await this.prisma.invitation.findUnique({
            where: { id: invitationId },
        });
        if (!invitation) {
            throw new common_1.NotFoundException('Invitation not found');
        }
        if (invitation.toUserId !== userId) {
            throw new common_1.ForbiddenException('You can only respond to your own invitations');
        }
        const updatedInvitation = await this.prisma.invitation.update({
            where: { id: invitationId },
            data: {
                status: respondInvitationDto.status,
                respondedAt: new Date(),
            },
        });
        if (respondInvitationDto.status === 'accepted') {
            await this.prisma.groupMember.create({
                data: {
                    groupId: invitation.groupId,
                    userId: invitation.toUserId,
                    roleInGroup: 'member',
                },
            });
        }
        return updatedInvitation;
    }
    async addMember(groupId, userId, memberUserId) {
        const group = await this.prisma.group.findUnique({ where: { id: groupId } });
        if (!group) {
            throw new common_1.NotFoundException('Group not found');
        }
        if (group.ownerId !== userId) {
            throw new common_1.ForbiddenException('Only the group owner can add members');
        }
        const existingMember = await this.prisma.groupMember.findFirst({
            where: {
                groupId,
                userId: memberUserId,
            },
        });
        if (existingMember) {
            throw new common_1.ForbiddenException('User is already a member of this group');
        }
        return this.prisma.groupMember.create({
            data: {
                groupId,
                userId: memberUserId,
                roleInGroup: 'member',
            },
        });
    }
    async removeMember(groupId, userId, memberUserId) {
        const group = await this.prisma.group.findUnique({ where: { id: groupId } });
        if (!group) {
            throw new common_1.NotFoundException('Group not found');
        }
        if (group.ownerId !== userId) {
            throw new common_1.ForbiddenException('Only the group owner can remove members');
        }
        const member = await this.prisma.groupMember.findFirst({
            where: {
                groupId,
                userId: memberUserId,
            },
        });
        if (!member) {
            throw new common_1.NotFoundException('Member not found in group');
        }
        return this.prisma.groupMember.delete({
            where: { id: member.id },
        });
    }
};
exports.GroupService = GroupService;
exports.GroupService = GroupService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GroupService);
//# sourceMappingURL=group.service.js.map