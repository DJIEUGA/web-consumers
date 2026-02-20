export interface ApiEnvelope<T> {
  success: boolean;
  status: number;
  message: string;
  data: T;
  timestamp: string;
}

export interface LocationDto {
  city?: string | null;
  country?: string | null;
  addressLine?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface AuthUserDto {
  id: string;
  email: string;
  role: string;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  isVerified?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponseData {
  token: string;
  user: AuthUserDto;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

export interface RegisterResponseData {
  email?: string;
  requiresEmailConfirmation?: boolean;
}

export interface AuthConfirmResponseData {
  verified: boolean;
  token?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponseData {
  sent?: boolean;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface ResetPasswordResponseData {
  reset?: boolean;
}

export interface ServiceDto {
  id: string;
  title: string;
  description?: string | null;
  price?: number | null;
  currency?: string | null;
  deliveryTime?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PortfolioItemDto {
  id: string;
  title: string;
  description?: string | null;
  coverImageUrl?: string | null;
  mediaUrls?: string[];
  externalUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReviewDto {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt?: string;
  author?: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    avatarUrl?: string | null;
  };
}

export interface PublicProfileResponse {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  bio?: string | null;
  headline?: string | null;
  avatarUrl?: string | null;
  location?: LocationDto | null;
  hourlyRate?: number | null;
  averageRating?: number | null;
  reviewCount?: number | null;
  completedProjects?: number | null;
  responseRate?: number | null;
  services?: ServiceDto[] | null;
  portfolio?: PortfolioItemDto[] | null;
  reviews?: ReviewDto[] | null;
  stats?: {
    completedProjects?: number | null;
    ongoingProjects?: number | null;
    profileViews?: number | null;
    responseRate?: number | null;
  } | null;
}

export interface PrivateDashboardResponse {
  profile: PublicProfileResponse;
  stats?: {
    totalEarnings?: number | null;
    completedProjects?: number | null;
    ongoingProjects?: number | null;
    unreadMessages?: number | null;
  };
}

export interface ServiceRequest {
  title: string;
  description?: string;
  price?: number | null;
  currency?: string;
  deliveryTime?: string;
  isActive?: boolean;
}

export interface ServiceUpdateRequest extends Partial<ServiceRequest> {}

export interface PortfolioRequest {
  title: string;
  description?: string;
  coverImageUrl?: string;
  mediaUrls?: string[];
  externalUrl?: string;
}

export interface PortfolioUpdateRequest extends Partial<PortfolioRequest> {}
