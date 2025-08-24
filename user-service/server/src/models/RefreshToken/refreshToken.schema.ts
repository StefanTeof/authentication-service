import mongoose, { Schema } from 'mongoose';
import { IRefreshToken } from './refreshToken.interface';

const RefreshTokenSchema = new Schema<IRefreshToken>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tokenHash: { type: String, required: true, unique: true, select: false },
  familyId: { type: String, required: true, index: true },
  createdByIp: { type: String },
  userAgent: { type: String },

  revokedAt: { type: Date, default: null },
  revokedByIp: { type: String },
  revokeReason: { type: String },
  replacedByToken: { type: Schema.Types.ObjectId, ref: 'RefreshToken', default: null },

  expiresAt: { type: Date, required: true, index: true },
  createdAt: { type: Date, default: Date.now },
});

// TTL: delete when expiresAt passes
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

RefreshTokenSchema.virtual('isExpired').get(function (this: IRefreshToken) {
  return !!this.expiresAt && this.expiresAt.getTime() <= Date.now();
});

RefreshTokenSchema.virtual('isActive').get(function (this: IRefreshToken) {
  return !this.revokedAt && !this.isExpired;
});

export const RefreshToken = mongoose.model<IRefreshToken>('RefreshToken', RefreshTokenSchema);
