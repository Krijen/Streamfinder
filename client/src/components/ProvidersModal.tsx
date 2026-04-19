import { useEffect } from 'react';
import { MediaItem, ProvidersData, PricedSource, Provider, COUNTRIES, COUNTRY_CURRENCY } from '../types';

const LOGO_BASE = 'https://image.tmdb.org/t/p/w92';
const POSTER_BASE = 'https://image.tmdb.org/t/p/w342';

interface Props {
  media: MediaItem;
  providers: ProvidersData | null;
  pricedSources: PricedSource[];
  loading: boolean;
  country: string;
  onClose: () => void;
}

export default function ProvidersModal({ media, providers, pricedSources, loading, country, onClose }: Props) {
  const title = media.title ?? media.name ?? 'Unknown';
  const year = (media.release_date ?? media.first_air_date ?? '').slice(0, 4);
  const countryName = COUNTRIES.find((c) => c.code === country)?.name ?? country;
  const currency = COUNTRY_CURRENCY[country] ?? '';

  const rentSources = pricedSources.filter((s) => s.type === 'rent');
  const buySources = pricedSources.filter((s) => s.type === 'buy');

  const hasAnyProviders =
    providers?.flatrate?.length ||
    providers?.free?.length ||
    providers?.rent?.length ||
    providers?.buy?.length;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex gap-4 p-5 border-b border-gray-800">
          <div className="w-16 shrink-0 rounded-lg overflow-hidden bg-gray-800 aspect-[2/3]">
            {media.poster_path && (
              <img src={`${POSTER_BASE}${media.poster_path}`} alt={title} className="w-full h-full object-cover" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-white text-lg font-semibold leading-tight">{title}</h2>
            <p className="text-gray-400 text-sm mt-1">
              {year} · {media.media_type === 'tv' ? 'Series' : 'Movie'}
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Streaming availability in <span className="text-gray-300">{countryName}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors self-start text-xl leading-none">
            ✕
          </button>
        </div>

        <div className="p-5 max-h-[32rem] overflow-y-auto space-y-5">
          {loading && (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loading && !hasAnyProviders && (
            <p className="text-gray-400 text-center py-8">
              Not available for streaming in {countryName}.
            </p>
          )}

          {!loading && (
            <>
              <LogoSection title="Stream" providers={providers?.flatrate} />
              <LogoSection title="Free" providers={providers?.free} />
              <MergedSection title="Rent" tmdbProviders={providers?.rent} pricedSources={rentSources} currency={currency} fallbackUrl={providers?.link} />
              <MergedSection title="Buy" tmdbProviders={providers?.buy} pricedSources={buySources} currency={currency} fallbackUrl={providers?.link} />

              {providers?.link && (
                <a
                  href={providers.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center text-indigo-400 hover:text-indigo-300 text-sm underline underline-offset-2 transition-colors"
                >
                  View all options on JustWatch →
                </a>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface LogoSectionProps {
  title: string;
  providers?: Provider[];
}

function LogoSection({ title, providers }: LogoSectionProps) {
  if (!providers?.length) return null;
  return (
    <div>
      <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">{title}</h3>
      <div className="flex flex-wrap gap-3">
        {providers.map((p) => (
          <div key={p.provider_id} className="flex flex-col items-center gap-1.5 w-16">
            <img
              src={`${LOGO_BASE}${p.logo_path}`}
              alt={p.provider_name}
              className="w-12 h-12 rounded-xl object-cover"
            />
            <span className="text-gray-400 text-xs text-center leading-tight line-clamp-2">{p.provider_name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface MergedSectionProps {
  title: string;
  tmdbProviders?: Provider[];
  pricedSources: PricedSource[];
  currency: string;
  fallbackUrl?: string;
}

function MergedSection({ title, tmdbProviders, pricedSources, currency, fallbackUrl }: MergedSectionProps) {
  if (!tmdbProviders?.length) return null;

  const findSources = (providerName: string): PricedSource[] => {
    const lower = providerName.toLowerCase();
    return pricedSources.filter(
      (s) => s.name.toLowerCase().includes(lower) || lower.includes(s.name.toLowerCase())
    );
  };

  const formatPrice = (price: number) =>
    price.toLocaleString('nb-NO', { minimumFractionDigits: 1, maximumFractionDigits: 2 });

  const formatBadgeClass = (format: string) => {
    if (format === '4K') return 'text-red-400';
    if (format === 'HD') return 'text-blue-400';
    return 'text-gray-400';
  };

  // Expand each TMDB provider into one card per format option
  const cards: { provider: Provider; source: PricedSource | null; key: string }[] = [];
  for (const p of tmdbProviders) {
    const sources = findSources(p.provider_name);
    if (sources.length > 0) {
      for (const s of sources) {
        cards.push({ provider: p, source: s, key: `${p.provider_id}-${s.source_id}-${s.format}` });
      }
    } else {
      cards.push({ provider: p, source: null, key: `${p.provider_id}-none` });
    }
  }

  return (
    <div>
      <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">{title}</h3>
      <div className="flex flex-wrap gap-3">
        {cards.map(({ provider: p, source: s, key }) => {
          const inner = (
            <>
              <img
                src={`${LOGO_BASE}${p.logo_path}`}
                alt={p.provider_name}
                className="w-12 h-12 rounded-xl object-cover"
              />
              <div className="text-center mt-1.5">
                {s?.price != null ? (
                  <p className="text-white text-xs font-medium leading-tight">
                    {formatPrice(s.price)} {currency}
                  </p>
                ) : (
                  <p className="text-gray-500 text-xs leading-tight">—</p>
                )}
                {s?.format && (
                  <p className={`text-xs font-semibold leading-tight ${formatBadgeClass(s.format)}`}>
                    {s.format}
                  </p>
                )}
              </div>
            </>
          );

          const wrapperClass = 'flex flex-col items-center w-16';

          const href = s?.web_url ?? fallbackUrl;
          return href ? (
            <a
              key={key}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={`${wrapperClass} hover:opacity-80 transition-opacity`}
              title={`${p.provider_name}${s?.price != null ? ` — ${formatPrice(s.price)} ${currency} ${s.format}` : ' — view on JustWatch'}`}
            >
              {inner}
            </a>
          ) : (
            <div key={key} className={wrapperClass}>
              {inner}
            </div>
          );
        })}
      </div>
    </div>
  );
}
