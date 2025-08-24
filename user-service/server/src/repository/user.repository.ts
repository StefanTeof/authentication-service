import { Types } from 'mongoose';
import { IUser } from '../models/User/user.interface';
import { User } from '../models/User/user.schema';
import { hashResetToken, isVerificationCodeExpired } from '../utils/auth.utils';

// Define the repository functions
const findByEmail = async (email: string): Promise<IUser | null> => {
  return await User.findOne({ email });
};

const findByUsername = async (username: string): Promise<IUser | null> => {
  return await User.findOne({ username });
};

const findById = async (id: string): Promise<IUser | null> => {
  return await User.findById(id);
};

const createUser = async (userData: Partial<IUser>): Promise<IUser> => {
  const user = new User(userData);
  return await user.save();
};

const updateVerificationCode = async (
  userId: Types.ObjectId,
  code: string,
  createdAt: Date
): Promise<IUser | null> => {
  return await User.findByIdAndUpdate(
    userId,
    {
      verificationCode: code,
      verificationCodeCreatedAt: createdAt,
    },
    { new: true }
  );
};


const findByPasswordResetToken = async (email: string, token: string) => {
  const hashedToken = hashResetToken(token);

  const user = await User.findOne({
    email,
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  });

  return user;
};

const save = async (user: IUser): Promise<IUser> => {
  return user.save();
};


// Export as a single object
export const userRepository = {
  findByEmail,
  findByUsername,
  findById,
  createUser,
  updateVerificationCode,
  findByPasswordResetToken,
  save,
};