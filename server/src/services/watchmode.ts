import axios from 'axios';

const watchmode = axios.create({
  baseURL: 'https://api.watchmode.com/v1',
});

export interface WatchmodeSource {
  source_id: number;
  name: string;
  type: 'sub' | 'rent' | 'buy' | 'free-with-ads' | 'free';
  region: string;
  price: number | null;
  format: string;
  web_url: string;
}

async function getWatchmodeTitleId(tmdbId: number, mediaType: 'movie' | 'tv'): Promise<number | null> {
  const searchField = mediaType === 'movie' ? 'tmdb_movie_id' : 'tmdb_tv_id';
  const { data } = await watchmode.get<{ title_results: { id: number }[] }>('/search/', {
    params: {
      apiKey: process.env.WATCHMODE_API_KEY,
      search_field: searchField,
      search_value: tmdbId,
    },
  });
  return data.title_results?.[0]?.id ?? null;
}

export async function getPricedSources(
  tmdbId: number,
  mediaType: 'movie' | 'tv',
  country: string
): Promise<WatchmodeSource[]> {
  const titleId = await getWatchmodeTitleId(tmdbId, mediaType);
  if (!titleId) return [];

  const { data } = await watchmode.get<WatchmodeSource[]>(`/title/${titleId}/sources/`, {
    params: {
      apiKey: process.env.WATCHMODE_API_KEY,
      regions: country,
    },
  });

  return data.filter((s) => s.type === 'buy' || s.type === 'rent');
}
