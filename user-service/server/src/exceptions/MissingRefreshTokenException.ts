
import { AppException } from './AppException';

export class MissingRefreshTokenException extends AppException {
  constructor() {
    super('Missing refresh token', 401);
  }
}