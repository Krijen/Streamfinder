import { MediaItem } from '../types';

const POSTER_BASE = 'https://image.tmdb.org/t/p/w342';

interface Props {
  media: MediaItem;
  onClick: (media: MediaItem) => void;
}

export default function MediaCard({ media, onClick }: Props) {
  const title = media.title ?? media.name ?? 'Unknown';
  const year = (media.release_date ?? media.first_air_date ?? '').slice(0, 4);
  const rating = media.vote_average ? media.vote_average.toFixed(1) : null;

  return (
    <button
      onClick={() => onClick(media)}
      className="group relative bg-gray-900 rounded-xl overflow-hidden text-left hover:ring-2 hover:ring-indigo-500 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      <div className="aspect-[2/3] bg-gray-800">
        {media.poster_path ? (
          <img
            src={`${POSTER_BASE}${media.poster_path}`}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm px-3 text-center">
            No poster available
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-white font-medium text-sm leading-tight truncate">{title}</h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-gray-400 text-xs">{year || '—'}</span>
          <div className="flex items-center gap-1.5">
            {rating && (
              <span className="text-yellow-400 text-xs font-medium">★ {rating}</span>
            )}
            <span className="text-gray-500 text-xs capitalize bg-gray-800 px-1.5 py-0.5 rounded">
              {media.media_type === 'tv' ? 'Series' : 'Movie'}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
