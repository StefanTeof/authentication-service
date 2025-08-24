import { Document, Types } from 'mongoose';

export interface IRefreshToken extends Document {
  user: Types.ObjectId;
  tokenHash: string;          // sha256(token)
  familyId: string;           // groups rotated tokens (session family)
  createdByIp?: string;
  revokedAt?: Date;
  revokedByIp?: string;
  revokeReason?: string;
  replacedByToken?: Types.ObjectId; // points to the next token in the chain
  userAgent?: string;
  expiresAt: Date;
  createdAt: Date;

  isExpired: boolean;
  isActive: boolean;
}
