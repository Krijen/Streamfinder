import axios from 'axios';
import { SearchResponse, ProvidersData, PricedSource } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
});

export async function searchMedia(query: string, page = 1): Promise<SearchResponse> {
  const { data } = await api.get<SearchResponse>('/search', {
    params: { query, page },
  });
  return data;
}

export interface ProvidersResponse {
  providers: ProvidersData | null;
  pricedSources: PricedSource[];
  country: string;
}

export async function getProviders(
  mediaType: 'movie' | 'tv',
  id: number,
  country: string
): Promise<ProvidersResponse> {
  const { data } = await api.get<ProvidersResponse>(`/providers/${mediaType}/${id}`, {
    params: { country },
  });
  return data;
}
