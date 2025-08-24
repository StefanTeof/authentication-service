import { FilterQuery, UpdateQuery } from "mongoose";
import { IRefreshToken } from "../models/RefreshToken/refreshToken.interface";
import { RefreshToken } from "../models/RefreshToken/refreshToken.schema";
import { CreateRefreshTokenInput } from "../types/auth.types";
import { hashRefreshToken } from "../utils/auth.utils";

const findByRawToken = async (rawToken: string): Promise<IRefreshToken | null> => {
  const tokenHash = hashRefreshToken(rawToken);
  return RefreshToken.findOne({ tokenHash }).exec();
};

const create = async (input: CreateRefreshTokenInput): Promise<IRefreshToken> => {
  return RefreshToken.create({
    user: input.userId,
    familyId: input.familyId,
    tokenHash: hashRefreshToken(input.rawToken),
    createdByIp: input.createdByIp,
    userAgent: input.userAgent,
    expiresAt: input.expiresAt,
  });
};

const markRevoked = async (
  token: IRefreshToken,
  opts: { ip?: string; reason?: string; replacedById?: string | null } = {},
): Promise<IRefreshToken> => {
  token.revokedAt = new Date();
  token.revokedByIp = opts.ip;
  token.revokeReason = opts.reason ?? token.revokeReason;
  token.replacedByToken = (opts.replacedById as any) ?? token.replacedByToken ?? null;
  await token.save();
  return token;
};

const revokeFamily = async (
  userId: string,
  familyId: string,
  reason: string,
  ip?: string,
): Promise<void> => {
  const filter: FilterQuery<IRefreshToken> = { user: userId as any, familyId, revokedAt: null };
  const update: UpdateQuery<IRefreshToken> = {
    $set: { revokedAt: new Date(), revokedByIp: ip ?? null, revokeReason: reason },
  };
  await RefreshToken.updateMany(filter, update).exec();
};

const findActiveFamilyTokens = async (
  userId: string,
  familyId: string,
): Promise<IRefreshToken[]> => {
  return RefreshToken.find({
    user: userId as any,
    familyId,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  }).exec();
};

export const refreshTokenRepository = {
  findByRawToken,
  create,
  markRevoked,
  revokeFamily,
  findActiveFamilyTokens,
};