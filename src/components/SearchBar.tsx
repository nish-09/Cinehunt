'use client'

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Search, X, Loader2 } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  loading?: boolean;
}

export const SearchBar = ({ 
  onSearch, 
  placeholder = "Search movies...",
  className = "",
  loading = false
}: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const searchTerms = [
    "movies...",
    "actors...",
    "genres..."
  ];

  useEffect(() => {
    const currentSearchTerm = searchTerms[placeholderIndex];
    
    if (isDeleting) {
      if (charIndex > 0) {
        const timer = setTimeout(() => {
          setCharIndex(charIndex - 1);
        }, 100);
        return () => clearTimeout(timer);
      } else {
        setIsDeleting(false);
        setPlaceholderIndex((prev) => (prev + 1) % searchTerms.length);
      }
    } else {
      if (charIndex < currentSearchTerm.length) {
        const timer = setTimeout(() => {
          setCharIndex(charIndex + 1);
        }, 150);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => {
          setIsDeleting(true);
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [charIndex, isDeleting, placeholderIndex, searchTerms]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      onSearch(query);
    }, 300);

    return () => clearTimeout(debounce);
  }, [query, onSearch]);

  const clearSearch = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground z-10 pointer-events-none" strokeWidth={2.5} />
        <Input
          type="text"
          placeholder={`Search for ${searchTerms[placeholderIndex].substring(0, charIndex)}`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-12 h-12 text-base bg-card/80 border-border/50 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all duration-200"
          disabled={loading}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
        {query && !loading && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-muted/50 rounded-full transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>
    </div>
  );
};
