import { Module } from '@nestjs/common';
import { EmailService } from './services/email.service';
import { RolesGuard } from './guards/roles.guard';
import { OwnershipGuard } from './guards/ownership.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

/**
 * Common Module
 * Exports shared services, guards, and filters
 * Used across all feature modules
 */
@Module({
  providers: [EmailService, RolesGuard, OwnershipGuard, JwtAuthGuard],
  exports: [EmailService, RolesGuard, OwnershipGuard, JwtAuthGuard],
})
export class CommonModule {}
