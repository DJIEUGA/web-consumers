/**
 * Auth types (ambient declarations)
 */

export type User = {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  avatar?: string;
  isVerified?: boolean;
};

export type AuthResponse = {
  user: User;
  token: string;
  expiresIn?: number;
};
