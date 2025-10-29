import { ErrorCode } from '../../../shared/constants/error-codes';

export class AuthResponseDto {
  success: boolean;
  token?: string;
  userId?: string;
  username?: string;
  message?: string;
  code?: ErrorCode;
}
