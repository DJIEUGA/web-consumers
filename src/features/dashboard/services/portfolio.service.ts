/**
 * Portfolio & Services Management Service
 * API calls for Pro dashboard service offers and portfolio items
 * 
 * @pattern Returns data wrapped in ApiEnvelope shape from axios
 * @role ROLE_PRO
 */

import axios from '../../../api/axios';
import { PROFILE_ENDPOINTS } from '../../../api/profileEndpoints';
import type {
  CreateServiceDto,
  UpdateServiceDto,
  CreatePortfolioDto,
  UpdatePortfolioDto,
} from '../../../api/profileEndpoints';
import {
  compressImageForUpload,
  createMultipartDataPayload,
} from '../../../utils/imageCompression';

export interface ServiceMultipartPayload<T> {
  data: T;
  image?: File | null;
}

export interface PortfolioMultipartPayload<T = CreatePortfolioDto> {
  data: T;
  image?: File | null;
}

/* ========================================
 * SERVICE OFFERS MANAGEMENT
 * ======================================== */

/**
 * Create a new service offer
 * POST /profiles/me/services
 */
export async function createService(
  payload: ServiceMultipartPayload<CreateServiceDto>
): Promise<any> {
  const formData = createMultipartDataPayload(payload.data);

  if (payload.image) {
    const compressed = await compressImageForUpload(payload.image);
    formData.append('image', compressed, compressed.name);
  }

  const response = await axios.post(PROFILE_ENDPOINTS.SERVICES, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response;
}

/**
 * Update existing service offer
 * PUT /profiles/me/services/{id}
 */
export async function updateService(
  id: string,
  payload: ServiceMultipartPayload<UpdateServiceDto>
): Promise<any> {
  const endpoint = PROFILE_ENDPOINTS.SERVICE_BY_ID(id);
  const formData = createMultipartDataPayload(payload.data);

  if (payload.image) {
    const compressed = await compressImageForUpload(payload.image);
    formData.append('image', compressed, compressed.name);
  }

  const response = await axios.put(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response;
}

/**
 * Delete service offer
 * DELETE /profiles/me/services/{id}
 */
export async function deleteService(
  id: string
): Promise<any> {
  const endpoint = PROFILE_ENDPOINTS.SERVICE_BY_ID(id);
  const response = await axios.delete(endpoint);
  return response;
}

/* ========================================
 * PORTFOLIO MANAGEMENT
 * ======================================== */

/**
 * Add portfolio item
 * POST /profiles/me/portfolio
 */
export async function createPortfolio(
  payload: PortfolioMultipartPayload<CreatePortfolioDto>
): Promise<any> {
  const formData = createMultipartDataPayload(payload.data);

  if (payload.image) {
    const compressed = await compressImageForUpload(payload.image);
    formData.append('image', compressed, compressed.name);
  }

  const response = await axios.post(PROFILE_ENDPOINTS.PORTFOLIO, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response;
}

/**
 * Update portfolio item
 * PUT /profiles/me/portfolio/{id}
 */
export async function updatePortfolio(
  id: string,
  payload: PortfolioMultipartPayload<UpdatePortfolioDto>
): Promise<any> {
  const endpoint = PROFILE_ENDPOINTS.PORTFOLIO_BY_ID(id);
  const formData = createMultipartDataPayload(payload.data);

  if (payload.image) {
    const compressed = await compressImageForUpload(payload.image);
    formData.append('image', compressed, compressed.name);
  }

  const response = await axios.put(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response;
}

/**
 * Delete portfolio item
 * DELETE /profiles/me/portfolio/{id}
 */
export async function deletePortfolio(
  id: string
): Promise<any> {
  const endpoint = PROFILE_ENDPOINTS.PORTFOLIO_BY_ID(id);
  const response = await axios.delete(endpoint);
  return response;
}
