import { PrismaService } from '../prisma/prisma.service';
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    getMyNotifications(userId: string): Promise<{
        type: string;
        id: string;
        createdAt: Date;
        userId: string;
        payload: import("@prisma/client/runtime/library").JsonValue | null;
        read: boolean;
    }[]>;
    markAsRead(notificationId: string): Promise<{
        type: string;
        id: string;
        createdAt: Date;
        userId: string;
        payload: import("@prisma/client/runtime/library").JsonValue | null;
        read: boolean;
    }>;
    deleteNotification(notificationId: string): Promise<{
        type: string;
        id: string;
        createdAt: Date;
        userId: string;
        payload: import("@prisma/client/runtime/library").JsonValue | null;
        read: boolean;
    }>;
}
