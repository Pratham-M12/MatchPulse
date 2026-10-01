import { apiFootballClient } from '@/lib/api/client';
import type { ApiNewsResponse } from '@/lib/api/dto/newsDto';
import {
  QuotaExceededError,
  UnsupportedEndpointError,
  isQuotaError,
  isUnsupportedEndpoint,
} from '@/lib/api/errors';

export async function fetchFootballNews(): Promise<ApiNewsResponse> {
  try {
    const response = await apiFootballClient.get<ApiNewsResponse>('/news');
    return response.data;
  } catch (error) {
    if (error instanceof UnsupportedEndpointError || error instanceof QuotaExceededError) {
      throw error;
    }
    if (isUnsupportedEndpoint(error)) {
      throw new UnsupportedEndpointError('/news');
    }
    if (isQuotaError(error)) {
      throw new QuotaExceededError();
    }
    throw error;
  }
}
