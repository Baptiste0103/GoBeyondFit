declare enum InvitationStatus {
    pending = "pending",
    accepted = "accepted",
    rejected = "rejected"
}
export declare class SendInvitationDto {
    groupId: string;
    toUserId?: string;
    toPseudo?: string;
    message?: string;
}
export declare class RespondToInvitationDto {
    status: InvitationStatus;
}
export declare class InvitationResponseDto {
    id: string;
    groupId: string;
    fromCoachId: string;
    toUserId: string;
    status: string;
    createdAt: Date;
    respondedAt?: Date;
}
export declare class InvitationWithDetailsDto extends InvitationResponseDto {
    group?: {
        id: string;
        name: string;
    };
    fromCoach?: {
        id: string;
        pseudo: string;
        firstName?: string;
        lastName?: string;
    };
    toUser?: {
        id: string;
        email: string;
        pseudo: string;
    };
}
export {};
