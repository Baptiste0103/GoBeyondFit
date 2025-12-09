import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkoutController } from './workout.controller';
import { WorkoutRunnerController } from './workout-runner.controller';
import { WorkoutService } from './workout.service';
import { WorkoutRunnerService } from './workout-runner.service';

@Module({
  controllers: [WorkoutController, WorkoutRunnerController],
  providers: [WorkoutService, WorkoutRunnerService, PrismaService],
  exports: [WorkoutRunnerService],
})
export class WorkoutModule {}
