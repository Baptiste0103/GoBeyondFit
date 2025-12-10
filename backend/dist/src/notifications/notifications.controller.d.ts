import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    getMyNotifications(req: any): Promise<{
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
