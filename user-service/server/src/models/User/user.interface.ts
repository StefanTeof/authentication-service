import { Document, Types } from 'mongoose';
import { AuthType, UserType } from './user.enums';

export interface IUser extends Document {
    _id: Types.ObjectId;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password?: string;
    bio?: string;
    image?: string;
    address?: string;
    phoneNumber?: string;
    country?: string;
    userType: UserType;
    authType: AuthType;
    isVerified: boolean;
    verificationCode?: string;
    verificationCodeCreatedAt?: Date;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    createResetPasswordToken: () => string;
}