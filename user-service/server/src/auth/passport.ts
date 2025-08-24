import passport from 'passport';
import { adminJwtStrategy, userJwtStrategy } from './strategies/jwt.strategy';
import { googleStrategy } from './strategies/google.strategy';

export const configurePassport = () => {
  passport.use('user-jwt', userJwtStrategy);
  passport.use('admin-jwt', adminJwtStrategy);
  passport.use(googleStrategy);
};