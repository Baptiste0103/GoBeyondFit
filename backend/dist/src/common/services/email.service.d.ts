interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
    replyTo?: string;
}
interface InvitationEmailData {
    recipientName: string;
    senderName: string;
    groupName: string;
    invitationLink: string;
    expiresIn?: string;
}
export declare class EmailService {
    private readonly logger;
    private transporter;
    constructor();
    private initializeTestTransporter;
    sendEmail(options: EmailOptions): Promise<boolean>;
    sendInvitationEmail(recipientEmail: string, data: InvitationEmailData): Promise<boolean>;
    sendWelcomeEmail(email: string, userName: string, role: string): Promise<boolean>;
    private buildInvitationTemplate;
    private getRoleSpecificWelcomeMessage;
    sendProgressNotificationEmail(email: string, userName: string, message: string): Promise<boolean>;
}
export {};
