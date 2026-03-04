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
} from '../../../api/profileEndpoints';
import type { ApiEnvelope } from '../../../types/api';

/* ========================================
 * SERVICE OFFERS MANAGEMENT
 * ======================================== */

/**
 * Create a new service offer
 * POST /profiles/me/services
 */
export async function createService(
  data: CreateServiceDto
): Promise<any> {
  const response = await axios.post(PROFILE_ENDPOINTS.SERVICES, data);
  return response;
}

/**
 * Update existing service offer
 * PUT /profiles/me/services/{id}
 */
export async function updateService(
  id: string,
  data: UpdateServiceDto
): Promise<any> {
  const endpoint = PROFILE_ENDPOINTS.SERVICE_BY_ID(id);
  const response = await axios.put(endpoint, data);
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
  data: CreatePortfolioDto
): Promise<any> {
  const response = await axios.post(PROFILE_ENDPOINTS.PORTFOLIO, data);
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
