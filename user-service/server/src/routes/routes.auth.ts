import { Router } from 'express';
import passport from 'passport';
import {
  authController
} from '../controller/auth.controller';
import { env } from '../config/env';
import { validate } from '../middleware/validate';
import { registerSchema } from '../validators/auth/register.validator';
import { verifyEmailBodySchema, verifyEmailParamsSchema } from '../validators/auth/emailVerification.validator';
import { resendVerificationCodeSchema } from '../validators/auth/resendVerificationCode.validator';
import { loginSchema } from '../validators/auth/login.validator';
import { forgotPasswordSchema } from '../validators/auth/forgotPassword.validator';
import { resetPasswordSchema } from '../validators/auth/resetPassword.validator';

const router = Router();

// Local auth
router.post('/register', validate({ body: registerSchema }), authController.registerUser);
router.post('/login', validate({ body: loginSchema }), authController.loginUser);
router.post('/logout', authController.logoutUser);

// Password reset
router.post('/forgotPassword', validate({ body: forgotPasswordSchema }), authController.forgotPassword);
router.post('/resetPassword', validate({ body: resetPasswordSchema }), authController.resetPassword);

// Email verification
router.post('/resend-verification', validate({ body: resendVerificationCodeSchema }), authController.resendVerification);
router.post(
  '/verifyEmail/:userId',
  validate({
    body: verifyEmailBodySchema,
    params: verifyEmailParamsSchema,
  }),
  authController.verifyUserEmail
);

// JWT refresh
router.post('/refresh', authController.refreshToken);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: env.clientFailureRedirect }),
  authController.googleCallback
);

// Verify authenticated user
router.get(
  '/verify',
  passport.authenticate('user-jwt', { session: false }),
  authController.verifyAuthenticatedUser);

export default router;