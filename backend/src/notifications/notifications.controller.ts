import {
  Controller,
  Get,
  Delete,
  Param,
  Post,
  UseGuards,
  Request,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get my notifications' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of notifications',
  })
  async getMyNotifications(@Request() req: any) {
    return this.notificationsService.getMyNotifications(req.user.id);
  }

  @Post(':id/read')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notification marked as read',
  })
  async markAsRead(@Param('id') notificationId: string) {
    return this.notificationsService.markAsRead(notificationId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete notification' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notification deleted',
  })
  async deleteNotification(@Param('id') notificationId: string) {
    return this.notificationsService.deleteNotification(notificationId);
  }
}
