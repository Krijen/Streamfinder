import axios from 'axios';
import {
  TMDBSearchResponse,
  TMDBProviderResult,
  TMDBWatchProvidersResponse,
} from '../types/tmdb';

const tmdb = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
});

tmdb.interceptors.request.use((config) => {
  config.params = { ...config.params, api_key: process.env.TMDB_API_KEY };
  return config;
});

export async function searchMulti(query: string, page = 1): Promise<TMDBSearchResponse> {
  const { data } = await tmdb.get<TMDBSearchResponse>('/search/multi', {
    params: { query, page, include_adult: false },
  });
  data.results = data.results.filter(
    (item) => item.media_type === 'movie' || item.media_type === 'tv'
  );
  return data;
}

export async function getProviders(
  mediaType: 'movie' | 'tv',
  id: number,
  country: string
): Promise<TMDBProviderResult | null> {
  const { data } = await tmdb.get<TMDBWatchProvidersResponse>(
    `/${mediaType}/${id}/watch/providers`
  );
  return data.results[country] ?? null;
}
