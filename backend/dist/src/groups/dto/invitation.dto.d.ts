declare enum InvitationStatus {
    pending = "pending",
    accepted = "accepted",
    rejected = "rejected"
}
export declare class CreateInvitationDto {
    toUserId: string;
    groupId: string;
}
export declare class RespondInvitationDto {
    status: InvitationStatus;
}
export {};
