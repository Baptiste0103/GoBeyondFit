import { InvitationService } from './invitation.service';
import { SendInvitationDto } from './dto/invitation.dto';
export declare class InvitationController {
    private readonly invitationService;
    constructor(invitationService: InvitationService);
    sendInvitation(sendInvitationDto: SendInvitationDto, req: any): Promise<{
        id: string;
        groupId: string;
        fromCoachId: string;
        toUserId: string;
        status: import(".prisma/client").$Enums.InvitationStatus;
        createdAt: Date;
    }>;
    getReceivedInvitations(req: any, status?: string): Promise<({
        group: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            ownerId: string;
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
    getSentInvitations(req: any, status?: string): Promise<({
        group: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            ownerId: string;
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
    })[]>;
    acceptInvitation(invitationId: string, req: any): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.InvitationStatus;
        respondedAt: Date | null;
    }>;
    rejectInvitation(invitationId: string, req: any): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.InvitationStatus;
        respondedAt: Date | null;
    }>;
    deleteInvitation(invitationId: string, req: any): Promise<{
        success: boolean;
    }>;
}
