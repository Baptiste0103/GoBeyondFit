import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Request,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto/user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Auth & Users')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('signup')
  @ApiOperation({ summary: 'Create a new user account' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User created successfully with JWT token',
  })
  async signup(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    return {
      user: {
        id: user.id,
        email: user.email,
        pseudo: user.pseudo,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profileUrl: user.profileUrl,
      },
      access_token: token,
    };
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Login successful, returns JWT token',
  })
  async login(@Body() loginDto: { email: string; password: string }) {
    const user = await this.userService.findByEmailWithPassword(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.userService.validatePassword(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        pseudo: user.pseudo,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profileUrl: user.profileUrl,
      },
      access_token: token,
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Current user data',
    type: UserResponseDto,
  })
  async getCurrentUser(@Request() req) {
    if (!req.user) {
      throw new UnauthorizedException('Not authenticated');
    }
    return this.userService.findById(req.user.id);
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of all users',
    type: [UserResponseDto],
  })
  async getAllUsers() {
    return this.userService.findAll();
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User found',
    type: UserResponseDto,
  })
  async getUserById(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Put('users/:id')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User updated',
    type: UserResponseDto,
  })
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User deleted',
  })
  async deleteUser(@Param('id') id: string) {
    return this.userService.delete(id);
  }

  @Get('students/:coachId')
  @ApiOperation({ summary: 'Get students managed by a coach' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of students',
    type: [UserResponseDto],
  })
  async getCoachStudents(@Param('coachId') coachId: string) {
    return this.userService.getStudentsByCoach(coachId);
  }
}
