import { IUser } from "../models/User/user.interface";

export interface AuthResponse {
    user: IUser;
    accessToken: string;
    refreshToken: string;
}

export type RegisterUserStatus = 'created' | 'resent';

export interface RegisterUserResponse {
  status: RegisterUserStatus;
  message: string;
  userId?: string;
}

export interface VerificationResponse {
  message: string;
}

export interface CreateRefreshTokenInput {
  userId: string;
  familyId: string;
  rawToken: string;
  createdByIp?: string;
  userAgent?: string;
  expiresAt: Date;
}

export interface RefreshArgs {
  rawToken: string;
  ip?: string;
  userAgent?: string;
}

export interface LoginCtx {
  ip?: string;
  userAgent?: string;
}