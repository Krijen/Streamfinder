import { useState } from 'react';
import SearchBar from './components/SearchBar';
import MediaCard from './components/MediaCard';
import ProvidersModal from './components/ProvidersModal';
import { searchMedia, getProviders } from './services/api';
import { MediaItem, ProvidersData, PricedSource } from './types';

export default function App() {
  const [country, setCountry] = useState('NO');
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [providers, setProviders] = useState<ProvidersData | null>(null);
  const [pricedSources, setPricedSources] = useState<PricedSource[]>([]);
  const [providersLoading, setProvidersLoading] = useState(false);

  const handleSearch = async (query: string, searchPage = 1) => {
    setLoading(true);
    setError(null);
    setCurrentQuery(query);
    try {
      const data = await searchMedia(query, searchPage);
      setResults(data.results);
      setPage(data.page);
      setTotalPages(data.total_pages);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (loadingMore || page >= totalPages) return;
    setLoadingMore(true);
    try {
      const data = await searchMedia(currentQuery, page + 1);
      setResults((prev) => [...prev, ...data.results]);
      setPage(data.page);
    } catch {
      // silently fail on load more
    } finally {
      setLoadingMore(false);
    }
  };

  const handleCardClick = async (media: MediaItem) => {
    setSelectedMedia(media);
    setProviders(null);
    setPricedSources([]);
    setProvidersLoading(true);
    try {
      const data = await getProviders(media.media_type, media.id, country);
      setProviders(data.providers);
      setPricedSources(data.pricedSources);
    } finally {
      setProvidersLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            <span className="text-indigo-400">Stream</span>Finder
          </h1>
          <SearchBar
            onSearch={handleSearch}
            country={country}
            onCountryChange={setCountry}
            loading={loading}
          />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && results.length > 0 && (
          <>
            <p className="text-gray-400 text-sm mb-5">
              Showing results for{' '}
              <span className="text-white font-medium">"{currentQuery}"</span>
              {' '}— click any title to see where to watch it.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {results.map((media) => (
                <MediaCard key={`${media.media_type}-${media.id}`} media={media} onClick={handleCardClick} />
              ))}
            </div>

            {page < totalPages && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white px-8 py-3 rounded-lg transition-colors"
                >
                  {loadingMore ? 'Loading...' : 'Load more'}
                </button>
              </div>
            )}
          </>
        )}

        {!loading && results.length === 0 && !error && (
          <div className="text-center py-24 text-gray-600">
            <p className="text-5xl mb-4">🎬</p>
            <p className="text-lg">Search for a movie or series to get started.</p>
          </div>
        )}
      </main>

      {selectedMedia && (
        <ProvidersModal
          media={selectedMedia}
          providers={providers}
          pricedSources={pricedSources}
          loading={providersLoading}
          country={country}
          onClose={() => setSelectedMedia(null)}
        />
      )}
    </div>
  );
}
