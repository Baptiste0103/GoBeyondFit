import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupDto, UpdateGroupDto, CreateInvitationDto, RespondInvitationDto } from './dto';
export declare class GroupService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createGroupDto: CreateGroupDto, userId: string): Promise<{
        owner: {
            pseudo: string;
            firstName: string | null;
            lastName: string | null;
            id: string;
        };
        members: ({
            user: {
                email: string;
                pseudo: string;
                firstName: string | null;
                lastName: string | null;
                id: string;
            };
        } & {
            id: string;
            userId: string;
            groupId: string;
            roleInGroup: string;
            joinedAt: Date;
        })[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        ownerId: string;
    }>;
    findAll(userId: string): Promise<({
        owner: {
            pseudo: string;
            firstName: string | null;
            lastName: string | null;
            id: string;
        };
        members: ({
            user: {
                email: string;
                pseudo: string;
                firstName: string | null;
                lastName: string | null;
                id: string;
            };
        } & {
            id: string;
            userId: string;
            groupId: string;
            roleInGroup: string;
            joinedAt: Date;
        })[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        ownerId: string;
    })[]>;
    findOne(id: string, userId: string): Promise<{
        owner: {
            pseudo: string;
            firstName: string | null;
            lastName: string | null;
            id: string;
        };
        members: ({
            user: {
                email: string;
                pseudo: string;
                firstName: string | null;
                lastName: string | null;
                id: string;
            };
        } & {
            id: string;
            userId: string;
            groupId: string;
            roleInGroup: string;
            joinedAt: Date;
        })[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        ownerId: string;
    }>;
    update(id: string, updateGroupDto: UpdateGroupDto, userId: string): Promise<{
        owner: {
            pseudo: string;
            firstName: string | null;
            lastName: string | null;
            id: string;
        };
        members: ({
            user: {
                email: string;
                pseudo: string;
                firstName: string | null;
                lastName: string | null;
                id: string;
            };
        } & {
            id: string;
            userId: string;
            groupId: string;
            roleInGroup: string;
            joinedAt: Date;
        })[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        ownerId: string;
    }>;
    remove(id: string, userId: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        ownerId: string;
    }>;
    inviteUser(createInvitationDto: CreateInvitationDto, userId: string): Promise<{
        group: {
            name: string;
            id: string;
        };
        fromCoach: {
            pseudo: string;
            firstName: string | null;
            lastName: string | null;
            id: string;
        };
        toUser: {
            email: string;
            pseudo: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        toUserId: string;
        groupId: string;
        status: import(".prisma/client").$Enums.InvitationStatus;
        fromCoachId: string;
        respondedAt: Date | null;
    }>;
    getInvitations(userId: string): Promise<({
        group: {
            name: string;
            id: string;
            description: string | null;
        };
        fromCoach: {
            pseudo: string;
            firstName: string | null;
            lastName: string | null;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        toUserId: string;
        groupId: string;
        status: import(".prisma/client").$Enums.InvitationStatus;
        fromCoachId: string;
        respondedAt: Date | null;
    })[]>;
    respondToInvitation(invitationId: string, respondInvitationDto: RespondInvitationDto, userId: string): Promise<{
        id: string;
        createdAt: Date;
        toUserId: string;
        groupId: string;
        status: import(".prisma/client").$Enums.InvitationStatus;
        fromCoachId: string;
        respondedAt: Date | null;
    }>;
    addMember(groupId: string, userId: string, memberUserId: string): Promise<{
        id: string;
        userId: string;
        groupId: string;
        roleInGroup: string;
        joinedAt: Date;
    }>;
    removeMember(groupId: string, userId: string, memberUserId: string): Promise<{
        id: string;
        userId: string;
        groupId: string;
        roleInGroup: string;
        joinedAt: Date;
    }>;
}
