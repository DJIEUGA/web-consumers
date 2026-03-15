import axiosInstance from '@/api/axios';
import type {
  PublicApiEnvelope,
  PublicProfilesSearchRequest,
  PublicProfilesSearchResponseData,
} from '../types/search';

declare module 'axios' {
  interface AxiosRequestConfig {
    skipAuth?: boolean;
  }
}

const SEARCH_ENDPOINT = '/public/profiles/search';

export const searchPublicProfiles = async (
  payload: PublicProfilesSearchRequest,
): Promise<PublicApiEnvelope<PublicProfilesSearchResponseData>> => {
  // The Axios response interceptor already returns response.data (the envelope),
  // so `response` here IS the envelope — do not access .data again.
  const response = await axiosInstance.get<PublicApiEnvelope<PublicProfilesSearchResponseData>>(
    SEARCH_ENDPOINT,
    {
      data: payload,
      skipAuth: true,
    },
  );

  return response as unknown as PublicApiEnvelope<PublicProfilesSearchResponseData>;
};
