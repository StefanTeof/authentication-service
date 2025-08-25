// src/api/auth.ts
import { api } from "@/lib/api";

const BASE = "/auth";

/** Avoid `any` in index signatures */
export type JsonRecord = Record<string, unknown>;

export interface User extends JsonRecord {
  _id: string;
  email: string;
  username: string;
}

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
}

export const login = (data: LoginPayload) =>
  api<LoginResponse>(`${BASE}/login`, { method: "POST", body: data });

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  authType: "site" | "google";
}

export type RegisterResponse =
  | { status: "resent"; message: string; userId: string } // 200
  | { status: "created"; message: string; userId: string }; // 201

export const registerUser = (data: RegisterPayload) =>
  api<RegisterResponse>(`${BASE}/register`, { method: "POST", body: data });

export interface VerifyEmailResponse {
  user: User;
  accessToken: string;
}

export const verifyEmail = (userId: string, code: string) =>
  api<VerifyEmailResponse>(`${BASE}/verifyEmail/${userId}`, {
    method: "POST",
    body: { code },
    // credentials: "include", // uncomment if your backend sets a refresh cookie
  });

export interface ResendVerificationResponse {
  message: string;
}

export const resendVerificationCode = (email: string) =>
  api<ResendVerificationResponse>(`${BASE}/resend-verification`, {
    method: "POST",
    body: { email },
  });
