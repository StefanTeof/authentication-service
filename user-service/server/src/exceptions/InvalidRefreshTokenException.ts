import { AppException } from "./AppException";

export class InvalidRefreshTokenException extends AppException {
  constructor() {
    super('Invalid or expired refresh token', 401); // 401 Unauthorized
  }
}