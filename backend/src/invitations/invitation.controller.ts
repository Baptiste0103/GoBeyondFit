import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  HttpStatus,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { InvitationService } from './invitation.service';
import {
  SendInvitationDto,
  RespondToInvitationDto,
  InvitationResponseDto,
  InvitationWithDetailsDto,
} from './dto/invitation.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard, Roles, UserRole } from '../common/guards/roles.guard';

@ApiTags('Invitations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('invitations')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.COACH, UserRole.ADMIN)
  @ApiOperation({ summary: 'Send invitation to join a group' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Invitation sent',
    type: InvitationResponseDto,
  })
  async sendInvitation(
    @Body() sendInvitationDto: SendInvitationDto,
    @Request() req: any,
  ) {
    return this.invitationService.sendInvitation(req.user.id, sendInvitationDto);
  }

  @Get('received')
  @ApiOperation({ summary: 'Get invitations received by current user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of received invitations',
    type: [InvitationWithDetailsDto],
  })
  async getReceivedInvitations(
    @Request() req: any,
    @Query('status') status?: string,
  ) {
    return this.invitationService.getInvitationsForUser(req.user.id, status);
  }

  @Get('sent')
  @UseGuards(RolesGuard)
  @Roles(UserRole.COACH, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get invitations sent by current coach' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of sent invitations',
    type: [InvitationWithDetailsDto],
  })
  async getSentInvitations(
    @Request() req: any,
    @Query('status') status?: string,
  ) {
    return this.invitationService.getInvitationsSentByCoach(req.user.id, status);
  }

  @Post(':id/accept')
  @ApiOperation({ summary: 'Accept an invitation' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Invitation accepted',
  })
  async acceptInvitation(
    @Param('id') invitationId: string,
    @Request() req: any,
  ) {
    return this.invitationService.acceptInvitation(invitationId, req.user.id);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject an invitation' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Invitation rejected',
  })
  async rejectInvitation(
    @Param('id') invitationId: string,
    @Request() req: any,
  ) {
    return this.invitationService.rejectInvitation(invitationId, req.user.id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.COACH, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete invitation' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Invitation deleted',
  })
  async deleteInvitation(
    @Param('id') invitationId: string,
    @Request() req: any,
  ) {
    return this.invitationService.deleteInvitation(invitationId, req.user.id);
  }
}
