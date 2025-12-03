export declare class CreateGroupDto {
    name: string;
    description?: string;
    ownerId: string;
}
export declare class UpdateGroupDto {
    name?: string;
    description?: string;
}
export declare class AddGroupMemberDto {
    userId: string;
    roleInGroup?: string;
}
export declare class GroupResponseDto {
    id: string;
    name: string;
    description?: string;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class GroupMemberResponseDto {
    id: string;
    userId: string;
    roleInGroup: string;
    joinedAt: Date;
}
