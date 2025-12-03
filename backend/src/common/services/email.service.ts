import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

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

/**
 * Email Service
 * Handles all email sending operations
 * Supports templates for invitations, notifications, and more
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    // Initialize Nodemailer transporter
    // For development, using Ethereal test email service
    // For production, replace with SendGrid, AWS SES, or your SMTP provider
    
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
    } else {
      // Development: use test email account
      this.logger.warn(
        'Email service configured with test account. Configure SMTP for production.',
      );
      this.initializeTestTransporter();
    }
  }

  private async initializeTestTransporter() {
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
    } catch (error) {
      this.logger.error('Failed to initialize test email account', error);
    }
  }

  /**
   * Send email with generic options
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
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

      // Log preview URL for test account
      if (process.env.NODE_ENV !== 'production') {
        this.logger.debug(
          `Preview URL: ${nodemailer.getTestMessageUrl(result)}`,
        );
      }

      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}`, error);
      throw error;
    }
  }

  /**
   * Send invitation email
   */
  async sendInvitationEmail(
    recipientEmail: string,
    data: InvitationEmailData,
  ): Promise<boolean> {
    const html = this.buildInvitationTemplate(data);

    return this.sendEmail({
      to: recipientEmail,
      subject: `${data.senderName} invited you to join ${data.groupName}`,
      html,
      text: `You have been invited to join ${data.groupName} by ${data.senderName}. Accept the invitation: ${data.invitationLink}`,
    });
  }

  /**
   * Send welcome email to new user
   */
  async sendWelcomeEmail(
    email: string,
    userName: string,
    role: string,
  ): Promise<boolean> {
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

  /**
   * Build invitation email HTML template
   */
  private buildInvitationTemplate(data: InvitationEmailData): string {
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

  /**
   * Get role-specific welcome message
   */
  private getRoleSpecificWelcomeMessage(role: string): string {
    const messages: Record<string, string> = {
      coach:
        'As a coach, you can create exercises, build training programs, and manage student groups. Start by creating your first exercise or program.',
      student:
        'As a student, you can join groups, view assigned programs, and log your workout progress. Wait for your coach to add you to a group.',
      admin:
        'As an admin, you have full access to manage users, exercises, programs, and view platform analytics.',
    };

    return messages[role] || 'You can now start using GoBeyondFit!';
  }

  /**
   * Send progress notification email
   */
  async sendProgressNotificationEmail(
    email: string,
    userName: string,
    message: string,
  ): Promise<boolean> {
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
}
