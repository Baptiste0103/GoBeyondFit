import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../common/services/email.service';
import { SendInvitationDto } from './dto/invitation.dto';
export declare class InvitationService {
    private prisma;
    private emailService;
    constructor(prisma: PrismaService, emailService: EmailService);
    sendInvitation(fromCoachId: string, dto: SendInvitationDto): Promise<{
        id: string;
        groupId: string;
        fromCoachId: string;
        toUserId: string;
        status: import(".prisma/client").$Enums.InvitationStatus;
        createdAt: Date;
    }>;
    getInvitationsForUser(userId: string, status?: string): Promise<({
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
    getInvitationsSentByCoach(coachId: string, status?: string): Promise<({
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
    acceptInvitation(invitationId: string, userId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.InvitationStatus;
        respondedAt: Date | null;
    }>;
    rejectInvitation(invitationId: string, userId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.InvitationStatus;
        respondedAt: Date | null;
    }>;
    deleteInvitation(invitationId: string, fromCoachId: string): Promise<{
        success: boolean;
    }>;
}
