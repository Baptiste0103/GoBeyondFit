import { Controller, Get, Query, BadRequestException, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('search')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('users')
  @HttpCode(HttpStatus.OK)
  async searchByEmail(@Query('email') email: string) {
    if (!email || !email.trim()) {
      throw new BadRequestException('Email is required');
    }
    return this.usersService.findByEmail(email.trim());
  }
}
