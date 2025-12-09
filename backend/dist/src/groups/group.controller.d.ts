import { GroupService } from './group.service';
import { CreateGroupDto, UpdateGroupDto, CreateInvitationDto, RespondInvitationDto } from './dto';
export declare class GroupController {
    private readonly groupService;
    constructor(groupService: GroupService);
    create(createGroupDto: CreateGroupDto, req: any): Promise<{
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
    findAll(req: any): Promise<({
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
    findOne(id: string, req: any): Promise<{
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
    update(id: string, updateGroupDto: UpdateGroupDto, req: any): Promise<{
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
    remove(id: string, req: any): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        ownerId: string;
    }>;
    inviteUser(groupId: string, createInvitationDto: CreateInvitationDto, req: any): Promise<{
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
    getMyInvitations(req: any): Promise<({
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
    respondToInvitation(invitationId: string, respondInvitationDto: RespondInvitationDto, req: any): Promise<{
        id: string;
        createdAt: Date;
        toUserId: string;
        groupId: string;
        status: import(".prisma/client").$Enums.InvitationStatus;
        fromCoachId: string;
        respondedAt: Date | null;
    }>;
    addMember(groupId: string, memberUserId: string, req: any): Promise<{
        id: string;
        userId: string;
        groupId: string;
        roleInGroup: string;
        joinedAt: Date;
    }>;
    removeMember(groupId: string, memberUserId: string, req: any): Promise<{
        id: string;
        userId: string;
        groupId: string;
        roleInGroup: string;
        joinedAt: Date;
    }>;
    getGroupMembers(groupId: string, req: any): Promise<({
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
    })[]>;
    leaveGroup(groupId: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
