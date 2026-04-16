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

const buildEmptySearchEnvelope = (
  payload: PublicProfilesSearchRequest,
  message = 'No data',
): PublicApiEnvelope<PublicProfilesSearchResponseData> => {
  const page = Number.isFinite(payload.page) ? payload.page : 0;
  const size = Number.isFinite(payload.size) ? payload.size : 20;

  const emptyPage = {
    content: [],
    page: {
      size,
      number: page,
      totalElements: 0,
      totalPages: 0,
    },
  };

  return {
    success: false,
    status: 0,
    message,
    data: {
      pros: emptyPage,
      enterprises: emptyPage,
    },
    timestamp: new Date().toISOString(),
  };
};

export const searchPublicProfiles = async (
  payload: PublicProfilesSearchRequest,
): Promise<PublicApiEnvelope<PublicProfilesSearchResponseData>> => {
  try {
    // The Axios response interceptor already returns response.data (the envelope),
    // so `response` here IS the envelope — do not access .data again.
    const response = await axiosInstance.get<PublicApiEnvelope<PublicProfilesSearchResponseData>>(
      SEARCH_ENDPOINT,
      {
        // GET requests should send filters as query params, not request body.
        params: payload,
        skipAuth: true,
      },
    );

    const envelope = response as unknown as PublicApiEnvelope<PublicProfilesSearchResponseData>;

    if (!envelope?.success || !envelope?.data) {
      return buildEmptySearchEnvelope(payload, envelope?.message || 'Search unavailable');
    }

    return envelope;
  } catch {
    return buildEmptySearchEnvelope(payload, 'Search unavailable');
  }
};
