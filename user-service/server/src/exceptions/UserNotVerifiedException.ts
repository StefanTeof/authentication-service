import { AppException } from './AppException';

export class UserNotVerifiedException extends AppException {
  constructor() {
    super('User account is not verified.', 403);
  }
}