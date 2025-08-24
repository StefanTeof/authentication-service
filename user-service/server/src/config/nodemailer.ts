import nodemailer from 'nodemailer';
import { env } from './env';

const transporter = nodemailer.createTransport({
  host: env.smtpHost,
  port: Number(env.smtpPort),
  auth: {
    user: env.smtpUser,
    pass: env.smtpPass,
  },
});

export const sendVerificationCodeEmail = async (email: string, code: string) => {
  const mailOptions = {
    from: `"GameX Auth" <${env.smtpUser}>`,
    to: email,
    subject: 'Your GameX Verification Code',
    html: `<p>Your verification code is:</p><h2>${code}</h2><p>It will expire in 10 minutes.</p>`,
  };

  await transporter.sendMail(mailOptions);
};


export const sendPasswordResetEmail = async (email: string, token: string, callbackUrl: string
) => {
  const resetLink = `${callbackUrl}?token=${token}&email=${encodeURIComponent(email)}`;

  const mailOptions = {
    from: `"GameX Auth" <${env.smtpUser}>`,
    to: email,
    subject: 'Reset Your GameX Password',
    text: `Reset your password by visiting: ${resetLink}`,
    html: `
    <html>
      <body>
        <p>We received a request to reset your password.</p>
        <p><a href="${resetLink}" target="_blank" rel="noopener noreferrer">Click here to reset it</a></p>
        <p>If you did not request a password reset, you can ignore this email.</p>
        <p>This link will expire in 10 minutes.</p>
      </body>
    </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};
