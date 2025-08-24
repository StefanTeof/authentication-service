import mongoose, { Schema } from 'mongoose';
import mongooseBcrypt from 'mongoose-bcrypt';
import crypto from 'crypto';
import { IUser } from './user.interface';
import { AuthType, UserType } from './user.enums';

const userSchema = new Schema<IUser>(
    {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },

        email: {
            type: String,
            required: true,
            unique: true,
            index: true,
            lowercase: true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address'],
        },

        username: {
            type: String,
            required: true,
            unique: true,
            index: true,
            lowercase: true,
            minLength: 5,
            maxlength: 20,
        },

        password: {
            type: String,
            required: function (this: IUser) {
                return this.authType === AuthType.SITE;
            },
            bcrypt: true,
            minlength: [6, 'Password must be at least 6 characters long'],
            validate: {
                validator: function (v: string) {
                    // Custom: at least 1 letter and 1 number
                    return /^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(v);
                },
                message: 'Password must include at least one letter and one number',
            },
        },

        bio: { type: String, maxlength: 100 },
        image: { type: String },
        address: { type: String },

        phoneNumber: {
            type: String,
            validate: {
                validator: (v: string) => /^\+?\d{10,15}$/.test(v),
                message: 'Invalid phone number format',
            },
        },

        country: {
            type: String,
            enum: ['Macedonia', 'Albania', 'Kosovo'],
        },

        userType: {
            type: String,
            enum: Object.values(UserType),
            default: UserType.USER,
        },

        authType: {
            type: String,
            enum: Object.values(AuthType),
            default: AuthType.SITE,
        },

        isVerified: { type: Boolean, default: false },
        verificationCode: { type: String },
        verificationCodeCreatedAt: { type: Date },

        passwordResetToken: { type: String },
        passwordResetExpires: { type: Date },
    },
    {
        timestamps: true,
        toJSON: {
            transform: (_doc, ret) => {
                delete ret.password;
                delete (ret as { __v?: number }).__v;
                delete ret.verificationCode;
                delete ret.verificationCodeCreatedAt;
                delete ret.passwordResetToken;
                delete ret.passwordResetExpires;
                return ret;
            },
        },
        toObject: {
            transform: (_doc, ret: Partial<IUser> & { __v?: number }) => {
                delete ret.password;
                delete (ret as { __v?: number }).__v;
                delete ret.verificationCode;
                delete ret.verificationCodeCreatedAt;
                delete ret.passwordResetToken;
                delete ret.passwordResetExpires;
                return ret;
            },
        },
    }
);

// --- Plugins ---
userSchema.plugin(mongooseBcrypt, {
    rounds: 10,
    skip: { fields: ['authType', 'googleId'] },
});

// --- Instance Methods ---
userSchema.methods.createResetPasswordToken = function (): string {
    const rawToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(rawToken)
        .digest('hex');
    this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    return rawToken;
};

export const User = mongoose.model<IUser>('User', userSchema);
