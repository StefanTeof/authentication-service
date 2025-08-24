import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { userService } from '../service/user.service';
import { IUser } from '../models/User/user.interface';
import { clearRefreshTokenCookie, createToken, setRefreshTokenCookie } from '../utils/auth.utils';
import { RegisterInput, registerSchema } from '../validators/auth/register.validator';
import { VerifyEmailBody, VerifyEmailParams } from '../validators/auth/emailVerification.validator';
import { ResendVerificationCodeInput } from '../validators/auth/resendVerificationCode.validator';
import { LoginInput } from '../validators/auth/login.validator';
import { ForgotPasswordInput } from '../validators/auth/forgotPassword.validator';
import { ResetPasswordInput } from '../validators/auth/resetPassword.validator';

const registerUser = async (req: Request<{}, {}, RegisterInput>, res: Response, next: NextFunction) => {
  try {
    const userInput = registerSchema.parse(req.body);
    const { status, message, userId } = await userService.registerUser(userInput);

    const statusCode = status === 'created' ? 201 : 200;

    return res.status(statusCode).json({
      status,
      message,
      userId,
    });
  } catch (error) {
    next(error);
  }
};


const verifyUserEmail = async (req: Request<VerifyEmailParams, {}, VerifyEmailBody>, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.userId;

    const { code } = req.body;
    const result = await userService.verifyUserEmail(userId, code);
    const user = result.user;
    const refreshToken = await userService.issueInitialRefreshToken(
      user._id.toString(),
      req.ip,
      req.get('user-agent') || undefined
    );

    setRefreshTokenCookie(res, refreshToken);

    return res.status(200).json({
      user: result.user,
      accessToken: result.accessToken,
    });
  }
  catch (error) {
    next(error);
  }
};

const resendVerification = async (req: Request<{}, {}, ResendVerificationCodeInput>, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const result = await userService.resendVerificationCode(email);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req: Request<{}, {}, LoginInput>, res: Response, next: NextFunction) => {
  try {
    const { identifier, password } = req.body;
    const result = await userService.loginUser(identifier, password);
    setRefreshTokenCookie(res, result.refreshToken);
    return res.status(200).json({
      user: result.user,
      accessToken: result.accessToken,
    });
  } catch (error) {
    next(error);
  }
};

const logoutUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawToken = req.cookies?.refreshToken;

    if (rawToken) {
      // revoke the whole family for this device/session
      await userService.logoutByRefreshToken(rawToken, req.ip);
    }

    // clear cookie after revocation
    clearRefreshTokenCookie(res);

    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};


const googleCallback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as IUser;

    if (!req.user) {
      return res.redirect(`${env.clientFailureRedirect}?error=oauth_failed`);
    }

    const accessToken = createToken(user._id.toString(), user.userType);
    const refreshToken = await userService.issueInitialRefreshToken(
      user._id.toString(),
      req.ip,
      req.get('user-agent') || undefined
    );
    setRefreshTokenCookie(res, refreshToken);

    return res.redirect(`${env.clientSuccessRedirect}?token=${accessToken}`);

  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req: Request<{}, {}, ForgotPasswordInput>, res: Response, next: NextFunction) => {
  try {
    const { email, callbackUrl } = req.body;

    const result = await userService.forgotPassword(email, callbackUrl);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req: Request<{}, {}, ResetPasswordInput>, res: Response, next: NextFunction) => {
  try {
    const { email, token, newPassword } = req.body;

    const result = await userService.resetPassword(email, token, newPassword);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};


const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawToken = req.cookies?.refreshToken;
    if (!rawToken) {
      return res.status(401).json({ message: 'Missing refresh token' });
    }

    const { accessToken, newRefreshToken } = await userService.refreshToken({
      rawToken,
      ip: req.ip,
      userAgent: req.get('user-agent') || undefined,
    });

    setRefreshTokenCookie(res, newRefreshToken);
    return res.status(200).json({ accessToken });
  } catch (error) {
    next(error);
  }
};

const verifyAuthenticatedUser = async (req: Request, res: Response, next: NextFunction) => {
  return res.status(200).json({
    message: 'Authenticated',
    user: req.user,
  });
}

export const authController = {
  registerUser,
  verifyUserEmail,
  resendVerification,
  loginUser,
  logoutUser,
  googleCallback,
  forgotPassword,
  resetPassword,
  refreshToken,
  verifyAuthenticatedUser,
};
