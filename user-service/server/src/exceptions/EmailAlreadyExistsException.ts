import { AppException } from './AppException';

export class EmailAlreadyExistsException extends AppException {
    constructor() {
        super('Email already in use', 409);
    }
}

