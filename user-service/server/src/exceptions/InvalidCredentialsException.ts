import { AppException } from './AppException';

export class InvalidCredentialsException extends AppException {
  constructor() {
    super('Invalid email or password.', 401);
  }
}