import { AppException } from './AppException';

export class GoogleAccountLoginException extends AppException {
  constructor() {
    super('This account was registered with Google. Please log in using Google.', 403);
  }
}