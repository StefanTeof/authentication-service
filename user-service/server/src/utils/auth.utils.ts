import jwt, { SignOptions } from 'jsonwebtoken';
import { Response } from 'express';
import { env } from '../config/env';
import crypto from 'crypto';
import { UserType } from '../models/User/user.enums';


export const toMs = (input: string | number): number => {
  if (typeof input === 'number') return input; // already ms
  const m = String(input).trim().match(/^(\d+)\s*(ms|s|m|h|d)?$/i);
  if (!m) throw new Error(`Invalid duration: ${input}`);
  const n = Number(m[1]);
  const unit = (m[2] || 'ms').toLowerCase();
  switch (unit) {
    case 'ms': return n;
    case 's': return n * 1000;
    case 'm': return n * 60_000;
    case 'h': return n * 3_600_000;
    case 'd': return n * 86_400_000;
    default: throw new Error(`Unsupported unit in duration: ${input}`);
  }
}

/**
 * Creates a JWT token from user ID.
 */
export const createToken = (
  userId: string,
  userType: UserType = UserType.USER,
): string => {
  const secret = env.jwtSecret;
  const expiresIn = env.jwtExpiration;

  const options: SignOptions = {
    expiresIn,
    algorithm: 'HS256',
  };

  return jwt.sign({ id: userId, userType: userType }, secret, options);
};


export const generateRefreshTokenString = (bytes = 64): string =>
  crypto.randomBytes(bytes).toString('hex');

/**
 * Sets the refresh token in an HttpOnly cookie.
 */
export const setRefreshTokenCookie = (res: Response, token: string): void => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: 'strict',
    path: '/auth',
    maxAge: toMs(env.jwtRefreshExpiration),
  });
};

export const clearRefreshTokenCookie = (res: Response): void => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: env.isProd,
    sameSite: 'strict',
    path: '/auth',
  });
};


export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
}


export const isVerificationCodeExpired = (createdAt: Date): boolean => {
  const now = new Date();
  const diff = (now.getTime() - createdAt.getTime()) / (1000 * 60); // in minutes
  return diff > env.verificationCodeExpiration;
};

export const hashResetToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export function hashRefreshToken(raw: string): string {
  return crypto.createHmac('sha256', env.tokenPepper).update(raw).digest('hex');
}