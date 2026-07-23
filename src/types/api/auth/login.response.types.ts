/** User object returned inside a successful login JSON payload. */
export interface LoginApiUserDto {
  _id?: unknown;
  id?: unknown;
  name?: string | null;
  email: string;
  role: string;
  emailVerified?: boolean;
  avatar?: string | null;
}

/** Successful `POST /api/auth/login` response body (after HTTP 200). */
export interface LoginApiSuccessResponse {
  success: true;
  message?: string;
  user: LoginApiUserDto;
  token: string;
  refreshToken: string;
  expiresIn?: string;
}

/** Parsed JSON before validation (may be error payload). */
export type LoginApiResponseJson = Partial<LoginApiSuccessResponse> & {
  success?: boolean;
  message?: string;
};
