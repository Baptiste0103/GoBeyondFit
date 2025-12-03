import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { BadgeService } from './badge.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('badges')
export class BadgeController {
  constructor(private readonly badgeService: BadgeService) {}

  /**
   * Get all badges earned by current user
   */
  @Get('my-badges')
  @UseGuards(JwtAuthGuard)
  async getMyBadges(@Request() req: any) {
    const userId = req.user.id;
    return this.badgeService.getUserBadges(userId);
  }

  /**
   * Get badge progress and stats
   */
  @Get('progress')
  @UseGuards(JwtAuthGuard)
  async getProgress(@Request() req: any) {
    const userId = req.user.id;
    return this.badgeService.getBadgeProgress(userId);
  }

  /**
   * Get all available badges
   */
  @Get()
  async getAllBadges() {
    return this.badgeService.getAllBadges();
  }
}
