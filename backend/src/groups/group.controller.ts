import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger'
import { GroupService } from './group.service'
import {
  CreateGroupDto,
  UpdateGroupDto,
  CreateInvitationDto,
  RespondInvitationDto,
} from './dto'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'

@ApiTags('Groups')
@ApiBearerAuth()
@Controller('groups')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new group' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Group created',
  })
  async create(
    @Body() createGroupDto: CreateGroupDto,
    @Request() req: any,
  ) {
    return this.groupService.create(createGroupDto, req.user.id)
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all user groups' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of user groups',
  })
  async findAll(@Request() req: any) {
    return this.groupService.findAll(req.user.id)
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get group by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Group details',
  })
  async findOne(@Param('id') id: string, @Request() req: any) {
    return this.groupService.findOne(id, req.user.id)
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update group' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Group updated',
  })
  async update(
    @Param('id') id: string,
    @Body() updateGroupDto: UpdateGroupDto,
    @Request() req: any,
  ) {
    return this.groupService.update(id, updateGroupDto, req.user.id)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete group' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Group deleted',
  })
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.groupService.remove(id, req.user.id)
  }

  // Invitation endpoints
  @Post(':id/invite')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Invite user to group' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Invitation sent',
  })
  async inviteUser(
    @Param('id') groupId: string,
    @Body() createInvitationDto: CreateInvitationDto,
    @Request() req: any,
  ) {
    return this.groupService.inviteUser(
      { ...createInvitationDto, groupId },
      req.user.id,
    )
  }

  @Get('invitations/me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get my invitations' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of invitations',
  })
  async getMyInvitations(@Request() req: any) {
    return this.groupService.getInvitations(req.user.id)
  }

  @Post('invitations/:invitationId/respond')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Respond to invitation' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Invitation responded',
  })
  async respondToInvitation(
    @Param('invitationId') invitationId: string,
    @Body() respondInvitationDto: RespondInvitationDto,
    @Request() req: any,
  ) {
    return this.groupService.respondToInvitation(
      invitationId,
      respondInvitationDto,
      req.user.id,
    )
  }

  // Member management
  @Post(':id/members')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add member to group' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Member added',
  })
  async addMember(
    @Param('id') groupId: string,
    @Body('userId') memberUserId: string,
    @Request() req: any,
  ) {
    return this.groupService.addMember(groupId, req.user.id, memberUserId)
  }

  @Delete(':id/members/:memberUserId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Remove member from group' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Member removed',
  })
  async removeMember(
    @Param('id') groupId: string,
    @Param('memberUserId') memberUserId: string,
    @Request() req: any,
  ) {
    return this.groupService.removeMember(groupId, req.user.id, memberUserId)
  }

  @Get(':id/members')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get members of a group' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of group members',
  })
  async getGroupMembers(
    @Param('id') groupId: string,
    @Request() req: any,
  ) {
    return this.groupService.getGroupMembers(groupId, req.user.id)
  }

  @Post(':id/leave')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Leave a group as member' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Left group successfully',
  })
  async leaveGroup(
    @Param('id') groupId: string,
    @Request() req: any,
  ) {
    return this.groupService.leaveGroup(groupId, req.user.id)
  }
}
