"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = __importStar(require("nodemailer"));
let EmailService = EmailService_1 = class EmailService {
    logger = new common_1.Logger(EmailService_1.name);
    transporter;
    constructor() {
        if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
            this.transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT || '587', 10),
                secure: process.env.SMTP_SECURE === 'true',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });
        }
        else {
            this.logger.warn('Email service configured with test account. Configure SMTP for production.');
            this.initializeTestTransporter();
        }
    }
    async initializeTestTransporter() {
        try {
            const testAccount = await nodemailer.createTestAccount();
            this.transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });
        }
        catch (error) {
            this.logger.error('Failed to initialize test email account', error);
        }
    }
    async sendEmail(options) {
        try {
            const result = await this.transporter.sendMail({
                from: process.env.SMTP_FROM || 'noreply@gobeyondfit.com',
                to: options.to,
                subject: options.subject,
                html: options.html,
                text: options.text,
                replyTo: options.replyTo,
            });
            this.logger.log(`Email sent to ${options.to}`, result.messageId);
            if (process.env.NODE_ENV !== 'production') {
                this.logger.debug(`Preview URL: ${nodemailer.getTestMessageUrl(result)}`);
            }
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to send email to ${options.to}`, error);
            throw error;
        }
    }
    async sendInvitationEmail(recipientEmail, data) {
        const html = this.buildInvitationTemplate(data);
        return this.sendEmail({
            to: recipientEmail,
            subject: `${data.senderName} invited you to join ${data.groupName}`,
            html,
            text: `You have been invited to join ${data.groupName} by ${data.senderName}. Accept the invitation: ${data.invitationLink}`,
        });
    }
    async sendWelcomeEmail(email, userName, role) {
        const html = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px;">
        <h1 style="color: #4F46E5;">Welcome to GoBeyondFit!</h1>
        <p>Hi ${userName},</p>
        <p>Your ${role} account has been created successfully. You can now log in and start your fitness journey.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Getting Started</h3>
          <p>${this.getRoleSpecificWelcomeMessage(role)}</p>
        </div>
        
        <p>If you have any questions, feel free to contact our support team.</p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #6B7280; font-size: 12px;">
          © 2025 GoBeyondFit. All rights reserved.
        </p>
      </div>
    `;
        return this.sendEmail({
            to: email,
            subject: 'Welcome to GoBeyondFit!',
            html,
        });
    }
    buildInvitationTemplate(data) {
        return `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px;">
        <h1 style="color: #4F46E5;">You're Invited!</h1>
        
        <p>Hi ${data.recipientName},</p>
        
        <p><strong>${data.senderName}</strong> has invited you to join the group <strong>${data.groupName}</strong> on GoBeyondFit.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;">Accept this invitation to start training with your team:</p>
          <p style="margin: 15px 0;">
            <a href="${data.invitationLink}" style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Accept Invitation
            </a>
          </p>
          ${data.expiresIn ? `<p style="margin: 0; font-size: 12px; color: #6B7280;">This invitation expires in ${data.expiresIn}</p>` : ''}
        </div>
        
        <p style="color: #6B7280; font-size: 14px;">
          Or copy and paste this link in your browser:<br>
          <code>${data.invitationLink}</code>
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #6B7280; font-size: 12px;">
          © 2025 GoBeyondFit. All rights reserved.
        </p>
      </div>
    `;
    }
    getRoleSpecificWelcomeMessage(role) {
        const messages = {
            coach: 'As a coach, you can create exercises, build training programs, and manage student groups. Start by creating your first exercise or program.',
            student: 'As a student, you can join groups, view assigned programs, and log your workout progress. Wait for your coach to add you to a group.',
            admin: 'As an admin, you have full access to manage users, exercises, programs, and view platform analytics.',
        };
        return messages[role] || 'You can now start using GoBeyondFit!';
    }
    async sendProgressNotificationEmail(email, userName, message) {
        const html = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px;">
        <h1 style="color: #4F46E5;">Your Progress Update</h1>
        <p>Hi ${userName},</p>
        <p>${message}</p>
        <p>Keep up the great work!</p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #6B7280; font-size: 12px;">
          © 2025 GoBeyondFit. All rights reserved.
        </p>
      </div>
    `;
        return this.sendEmail({
            to: email,
            subject: 'Your Progress Update',
            html,
        });
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], EmailService);
//# sourceMappingURL=email.service.js.map