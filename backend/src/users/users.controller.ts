import { Controller, Get, Query, BadRequestException, HttpCode, HttpStatus, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('search')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('users')
  @HttpCode(HttpStatus.OK)
  async searchByEmail(@Query('email') email: string, @Query('pseudo') pseudo: string) {
    // Support both email and pseudo search
    if (pseudo && pseudo.trim()) {
      const user = await this.usersService.findByPseudoOrNull(pseudo.trim());
      if (!user) {
        // Return empty array instead of error, allowing frontend to show "not found" gracefully
        return { found: false, data: null };
      }
      return { found: true, data: user };
    }
    if (email && email.trim()) {
      try {
        const user = await this.usersService.findByEmail(email.trim());
        return { found: true, data: user };
      } catch (error) {
        // Return null if user not found
        return { found: false, data: null };
      }
    }
    throw new BadRequestException('Either email or pseudo is required');
  }
}
