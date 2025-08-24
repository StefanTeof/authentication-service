import { AppException } from './AppException';

export class UserNotFoundException extends AppException {
  constructor() {
    super('User not found', 404);
  }
}