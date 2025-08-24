import { AppException } from './AppException';

export class VerificationFailedException extends AppException {
  constructor() {
    super('Invalid or expired verification code', 400);
  }
}