import { AppException } from './AppException';

export class UsernameAlreadyExistsException extends AppException {
  constructor() {
    super('Username already in use', 409);
  }
}
