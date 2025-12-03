import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET') || 
                   process.env.JWT_SECRET || 
                   'your_jwt_secret_key_change_in_production';
    
    console.log('[JWT Strategy] Constructor - Using JWT_SECRET:', secret);
    console.log('[JWT Strategy] ConfigService JWT_SECRET:', configService.get<string>('JWT_SECRET'));
    console.log('[JWT Strategy] process.env.JWT_SECRET:', process.env.JWT_SECRET);
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    console.log('[JWT Strategy] Validating payload:', JSON.stringify(payload));
    console.log('[JWT Strategy] Token was valid with secret');
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
