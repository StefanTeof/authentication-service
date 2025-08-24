import { AppException } from './AppException';

export class UserAlreadyVerifiedException extends AppException {
  constructor() {
    super('User is already verified', 400);
  }
}