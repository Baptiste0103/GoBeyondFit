import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { UserService } from './user.service';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET') || 
                       process.env.JWT_SECRET || 
                       'your_jwt_secret_key_change_in_production';
        console.log('[Auth Module] Using JWT_SECRET for signing:', secret.substring(0, 10) + '...');
        return {
          secret: secret,
          signOptions: {
            expiresIn: 3600, // seconds
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [UserService, JwtStrategy],
  exports: [UserService, JwtModule, PassportModule],
})
export class AuthModule {}
