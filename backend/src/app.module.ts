import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ExerciseModule } from './exercises/exercise.module';
import { GroupModule } from './groups/group.module';
import { ProgramModule } from './programs/program.module';
import { SessionModule } from './sessions/session.module';
import { SessionProgressModule } from './session-progress/session-progress.module';
import { WorkoutModule } from './workouts/workout.module';
import { CommonModule } from './common/common.module';
import { InvitationModule } from './invitations/invitation.module';
import { RatingsModule } from './ratings/ratings.module';
import { FavoritesModule } from './favorites/favorites.module';
import { HistoryModule } from './history/history.module';
import { BadgeModule } from './badges/badge.module';
import { StatsModule } from './stats/stats.module';
import { StorageModule } from './storage/storage.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      // Explicitly set to read from environment first, then .env file
      expandVariables: true,
    }),
    PrismaModule,
    CommonModule,
    UsersModule,
    AuthModule,
    ExerciseModule,
    RatingsModule,
    FavoritesModule,
    HistoryModule,
    GroupModule,
    ProgramModule,
    SessionModule,
    SessionProgressModule,
    WorkoutModule,
    BadgeModule,
    StatsModule,
    InvitationModule,
    StorageModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
