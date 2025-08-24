import bcrypt from 'bcryptjs';

import { IUser } from '../models/User/user.interface';
import { userRepository } from '../repository/user.repository';
import { EmailAlreadyExistsException } from '../exceptions/EmailAlreadyExistsException';
import { UsernameAlreadyExistsException } from '../exceptions/UsernameAlreadyExistsException';
import { createToken, generateRefreshTokenString, generateVerificationCode, isVerificationCodeExpired } from '../utils/auth.utils';
import { AuthResponse, LoginCtx, RefreshArgs, RegisterUserResponse, VerificationResponse, } from '../types/auth.types';
import { sendVerificationCodeEmail, sendPasswordResetEmail } from '../config/nodemailer';
import { VerificationFailedException } from '../exceptions/VerificationFailedException';
import { UserNotFoundException } from '../exceptions/UserNotFoundException';
import { UserAlreadyVerifiedException } from '../exceptions/UserAlreadyVerifiedException';
import { UserNotVerifiedException } from '../exceptions/UserNotVerifiedException';
import { InvalidCredentialsException } from '../exceptions/InvalidCredentialsException';
import { GoogleAccountLoginException } from '../exceptions/GoogleAccountLoginException';
import { RegisterInput } from '../validators/auth/register.validator';
import { refreshTokenRepository } from '../repository/refreshToken.repository';
import { env } from 'process';
import { toMs } from '../utils/auth.utils';
import { InvalidRefreshTokenException } from '../exceptions/InvalidRefreshTokenException';
import { MissingRefreshTokenException } from '../exceptions/MissingRefreshTokenException';

/**
 * Registers a new user after validating uniqueness.
 */
const registerUser = async (data: RegisterInput): Promise<RegisterUserResponse> => {
    const existingEmail = await userRepository.findByEmail(data.email);
    const existingUsername = await userRepository.findByUsername(data.username);

    if (existingEmail?.isVerified) {
        throw new EmailAlreadyExistsException();
    }

    if (existingUsername?.isVerified) {
        throw new UsernameAlreadyExistsException();
    }

    const verificationCode = generateVerificationCode();
    const verificationCodeCreatedAt = new Date();

    // Email exists but not verified → resend code
    if (existingEmail) {
        await userRepository.updateVerificationCode(
            existingEmail._id,
            verificationCode,
            verificationCodeCreatedAt
        );

        await sendVerificationCodeEmail(existingEmail.email, verificationCode);

        return {
            status: 'resent',
            message: 'Account exists but not verified. Verification code resent.',
            userId: existingEmail._id.toString(),
        };
    }

    const newUser = await userRepository.createUser({
        ...data,
        isVerified: false,
        verificationCode,
        verificationCodeCreatedAt,
    });

    await sendVerificationCodeEmail(data.email, verificationCode);

    return {
        status: 'created',
        message: 'User registered successfully. Please verify your email.',
        userId: newUser._id.toString(),
    };
};


const verifyUserEmail = async (
    userId: string,
    code: string
): Promise<{ user: IUser; accessToken: string }> => {
    const user = await userRepository.findById(userId);

    if (!user) {
        throw new UserNotFoundException();
    }

    if (user.isVerified) {
        throw new UserAlreadyVerifiedException();
    }

    if (
        !user.verificationCode ||
        user.verificationCode !== code ||
        !user.verificationCodeCreatedAt ||
        isVerificationCodeExpired(user.verificationCodeCreatedAt)
    ) {
        throw new VerificationFailedException();
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeCreatedAt = undefined;

    await userRepository.save(user);

    const accessToken = createToken(user._id.toString(), user.userType);
    return { user, accessToken };
};


const resendVerificationCode = async (email: string): Promise<VerificationResponse> => {
    const user = await userRepository.findByEmail(email);

    if (!user) {
        throw new UserNotFoundException();
    }
    if (user.isVerified) {
        throw new UserAlreadyVerifiedException();
    }

    const newCode = generateVerificationCode();
    const createdAt = new Date();

    await userRepository.updateVerificationCode(user._id, newCode, createdAt);
    await sendVerificationCodeEmail(user.email, newCode);

    return {
        message: 'Verification code resent to your email.',
    };
};


const loginUser = async (
    identifier: string,
    password: string,
    ctx: LoginCtx = {}
): Promise<AuthResponse> => {
    let user = await userRepository.findByEmail(identifier);
    if (!user) {
        user = await userRepository.findByUsername(identifier);
    }

    if (!user) throw new UserNotFoundException();
    if (user.authType === 'google') throw new GoogleAccountLoginException();
    if (!user.isVerified) throw new UserNotVerifiedException();

    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) throw new InvalidCredentialsException();

    const accessToken = createToken(user._id.toString(), user.userType);
    const refreshToken = await issueInitialRefreshToken(
        user._id.toString(),
        ctx.ip,
        ctx.userAgent
    );

    return { user, accessToken, refreshToken };
};


const forgotPassword = async (email: string, callbackUrl: string): Promise<{ message: string }> => {
    const user = await userRepository.findByEmail(email);

    const message = 'If an account with this email exists, a password reset link has been sent.';

    if (!user || !user.isVerified) {
        return { message };
    }

    const token = user.createResetPasswordToken();
    await user.save();

    await sendPasswordResetEmail(user.email, token, callbackUrl);

    return { message };
};


const resetPassword = async (email: string, token: string, newPassword: string): Promise<{ message: string }> => {
    const user = await userRepository.findByPasswordResetToken(email, token);

    if (!user) {
        throw new UserNotFoundException();
    }

    // Set new password (will be auto-hashed by mongoose-bcrypt)
    user.password = newPassword;

    // Invalidate token
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    return { message: 'Password has been reset successfully' };
};


const issueInitialRefreshToken = async (
    userId: string,
    ip?: string,
    userAgent?: string
): Promise<string> => {
    const familyId = crypto.randomUUID();
    const raw = generateRefreshTokenString(64);
    const expiresAt = new Date(Date.now() + toMs(env.jwtRefreshExpiration ?? '7d'));

    await refreshTokenRepository.create({
        userId,
        familyId,
        rawToken: raw,
        createdByIp: ip,
        userAgent,
        expiresAt,
    });

    return raw;
};


const refreshToken = async ({ rawToken, ip, userAgent }: RefreshArgs): Promise<{ accessToken: string, newRefreshToken: string }> => {
    if (!rawToken) throw new MissingRefreshTokenException();

    // 1) Lookup the token row by deterministic hash
    const current = await refreshTokenRepository.findByRawToken(rawToken);
    if (!current) throw new InvalidRefreshTokenException();

    // 2) Validate state
    const now = Date.now();
    const isExpired = current.expiresAt?.getTime() <= now;
    const isRevoked = !!current.revokedAt;
    const alreadyRotated = !!current.replacedByToken;

    if (isExpired) throw new InvalidRefreshTokenException();
    if (isRevoked || alreadyRotated) {
        // reuse = likely theft -> revoke the whole family
        await refreshTokenRepository.revokeFamily(String(current.user), current.familyId, 'REUSE_DETECTED', ip);
        throw new InvalidRefreshTokenException();
    }

    // 3) Make sure user still exists (and is allowed)
    const user = await userRepository.findById(String(current.user));
    if (!user) {
        await refreshTokenRepository.revokeFamily(String(current.user), current.familyId, 'USER_NOT_FOUND', ip);
        throw new UserNotFoundException();
    }

    // 4) Rotate: create next token in the same family
    const nextPlain = generateRefreshTokenString(64);
    const expiresAt = new Date(Date.now() + toMs(env.jwtRefreshExpiration ?? '7d'));

    const next = await refreshTokenRepository.create({
        userId: String(user._id),
        familyId: current.familyId,
        rawToken: nextPlain,
        createdByIp: ip,
        userAgent,
        expiresAt,
    });

    await refreshTokenRepository.markRevoked(current, {
        ip,
        reason: 'ROTATED',
        replacedById: String(next._id),
    });

    // 5) Mint fresh access token
    const accessToken = createToken(String(user._id), user.userType);
    return { accessToken, newRefreshToken: nextPlain };
};

const logoutByRefreshToken = async (rawToken: string, ip?: string): Promise<void> => {
    const rt = await refreshTokenRepository.findByRawToken(rawToken);
    if (!rt) return;
    await refreshTokenRepository.revokeFamily(String(rt.user), rt.familyId, 'USER_LOGOUT', ip);
};

/**
 * Finds a user by their MongoDB ID.
 */
const findUserById = async (id: string): Promise<IUser | null> => {
    return userRepository.findById(id);
};

/**
 * Finds a user by email address.
 */
const findUserByEmail = async (email: string): Promise<IUser | null> => {
    return userRepository.findByEmail(email);
};

/**
 * Finds a user by username.
 */
const findUserByUsername = async (username: string): Promise<IUser | null> => {
    return userRepository.findByUsername(username);
};


export const userService = {
    registerUser,
    findUserById,
    findUserByEmail,
    findUserByUsername,
    verifyUserEmail,
    resendVerificationCode,
    loginUser,
    forgotPassword,
    resetPassword,
    refreshToken,
    issueInitialRefreshToken,
    logoutByRefreshToken,
};