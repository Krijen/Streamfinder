import { useState, FormEvent } from 'react';
import { COUNTRIES } from '../types';

interface Props {
  onSearch: (query: string, page?: number) => void;
  country: string;
  onCountryChange: (country: string) => void;
  loading: boolean;
}

export default function SearchBar({ onSearch, country, onCountryChange, loading }: Props) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim(), 1);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-2 mt-3">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for a movie or series..."
        className="flex-1 bg-gray-800 text-white placeholder-gray-400 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 border border-gray-700"
      />
      <div className="flex gap-2">
        <div className="relative flex-1 md:flex-none flex items-center">
          <img
            src={`https://flagcdn.com/w20/${country.toLowerCase()}.png`}
            alt={country}
            className="absolute left-3 w-5 pointer-events-none"
          />
          <select
            value={country}
            onChange={(e) => onCountryChange(e.target.value)}
            className="w-full md:w-auto bg-gray-800 text-white rounded-lg pl-10 pr-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 border border-gray-700 cursor-pointer appearance-none"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="shrink-0 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 disabled:cursor-not-allowed text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
    </form>
  );
}
