// src/auth/strategies/jwt.access.strategy.ts
import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import { env } from '../../config/env';
import { User } from '../../models/User/user.schema';
import { UserType } from '../../models/User/user.enums';

export interface AccessJwtPayload {
  id: string;
  userType: UserType;
  iat?: number;
  exp?: number;
}

const accessOpts: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), 
  secretOrKey: env.jwtSecret,                              
  algorithms: ['HS256'],
};

export const userJwtStrategy = new JwtStrategy(accessOpts, async (payload: AccessJwtPayload, done) => {
  try {
    if (!payload?.id) return done(null, false);
    const user = await User.findById(payload.id);
    if (!user) return done(null, false);
    return done(null, user);
  } catch (err) {
    return done(err, false);
  }
});

export const adminJwtStrategy = new JwtStrategy(accessOpts, async (payload: AccessJwtPayload, done) => {
  try {
    if (!payload?.id) return done(null, false);
    if (payload.userType !== UserType.ADMIN) {
      return done(null, false, { message: 'Admin only' });
    }
    const user = await User.findById(payload.id);
    if (!user || user.userType !== UserType.ADMIN) {
      return done(null, false, { message: 'Admin only' });
    }
    return done(null, user);
  } catch (err) {
    return done(err, false);
  }
});
