import dotenv from 'dotenv';

dotenv.config();

const getEnvVar = (key: string, required = true): string => {
    const value = process.env[key];
    if (!value && required) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value!;
};


const nodeEnv = process.env.NODE_ENV || 'development';
const isProd = nodeEnv === 'production';

export const env = {
    nodeEnv,
    isProd,
    port: parseInt(process.env.PORT || '4000', 10),
    mongoUri: getEnvVar('MONGO_URI'),
    jwtSecret: getEnvVar('JWT_ACCESS_SECRET_KEY'),
    jwtRefreshSecret: getEnvVar('JWT_REFRESH_SECRET_KEY'),
    jwtExpiration: parseInt(process.env.JWT_ACCESS_EXPIRATION || '3600', 10), // 1 hour
    jwtRefreshExpiration: parseInt(process.env.JWT_REFRESH_EXPIRATION || '604800', 10), // 7 days
    googleClientId: getEnvVar('GOOGLE_CLIENT_ID'),
    googleSecretKey: getEnvVar('GOOGLE_SECRET_KEY'),
    googleCallbackUrl: getEnvVar('GOOGLE_CALLBACK_URL'),
    smtpUser: getEnvVar('SMTP_USER'),
    smtpPass: getEnvVar('SMTP_PASS'),
    smtpHost: getEnvVar('SMTP_HOST'),
    smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
    smtpSecure: process.env.SMTP_SECURE === 'true' || false,
    verificationCodeExpiration: parseInt(process.env.VERIFICATION_CODE_EXPIRATION_MINUTES || '10', 10),
    clientSuccessRedirect: getEnvVar('CLIENT_SUCCESS_REDIRECT', false),
    clientFailureRedirect: getEnvVar('CLIENT_FAILURE_REDIRECT', false),
    clientPasswordResetUrl: getEnvVar('CLIENT_PASSWORD_RESET_URL', false),
    tokenPepper: getEnvVar('TOKEN_PEPPER', false),
};
