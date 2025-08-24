import { Strategy as GoogleStrategy, VerifyCallback } from 'passport-google-oauth20';
import { env } from '../../config/env';
import { User } from '../../models/User/user.schema';
import { Profile } from 'passport';


export const googleStrategy = new GoogleStrategy(
  {
    clientID: env.googleClientId,
    clientSecret: env.googleSecretKey,
    callbackURL: env.googleCallbackUrl,
    passReqToCallback: true,
    scope: ['profile', 'email'],
    proxy: true,
  },
  async (
    _req: any,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback
  ) => {
    try {
      const { givenName, familyName } = profile.name || {};
      const email = profile.emails?.[0]?.value;
      const googleId = profile.id;

      if (!email) {
        return done(new Error('Google account did not return an email.'), false);
      }

      let user = await User.findOne({ email });

      if (user && user.authType === 'site') {
        return done(
          new Error(
            'Email already registered with password login. Use email/password instead.'
          ),
          false
        );
      }

      if (!user) {
        user = new User({
          firstName: givenName || 'Unknown',
          lastName: familyName || 'Unknown',
          email,
          username: email.split('@')[0],
          googleId,
          isVerified: true,
          authType: 'google',
        });

        await user.save();
      }

      return done(null, user);
    } catch (error) {
      return done(error as Error, false);
    }
  }
);

googleStrategy.authorizationParams = () => ({
  prompt: 'select_account consent',
});
