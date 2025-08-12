'use client'

import { useState, useEffect, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { movieService } from '@/lib/omdb';
import { SearchBar } from '@/components/SearchBar';
import { MovieGrid } from '@/components/MovieGrid';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFavorites } from '@/hooks/useFavorites';
import { Movie } from '@/types/movie';
import { Loader2 } from 'lucide-react';
import { LoadingSkeleton } from './LoadingSkeleton';

export const Movies = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('popular');
  const { favoriteIds, toggleFavorite } = useFavorites();

  // Reset search when changing tabs
  useEffect(() => {
    setSearchQuery('');
  }, [activeTab]);

  // Infinite query for popular movies
  const {
    data: popularMoviesData,
    fetchNextPage: fetchNextPopular,
    hasNextPage: hasNextPopular,
    isFetchingNextPage: isFetchingNextPopular,
    isLoading: loadingPopular,
    error: popularError
  } = useInfiniteQuery({
    queryKey: ['movies', 'popular'],
    queryFn: ({ pageParam = 1 }) => movieService.getPopularMovies(pageParam),
    getNextPageParam: (lastPage) => lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    enabled: true, // Always enable for testing
    initialPageParam: 1,
  });

  // Infinite query for top rated movies
  const {
    data: topRatedMoviesData,
    fetchNextPage: fetchNextTopRated,
    hasNextPage: hasNextTopRated,
    isFetchingNextPage: isFetchingTopRated,
    isLoading: loadingTopRated,
    error: topRatedError
  } = useInfiniteQuery({
    queryKey: ['movies', 'top-rated'],
    queryFn: ({ pageParam = 1 }) => movieService.getTopRatedMovies(pageParam),
    getNextPageParam: (lastPage) => lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    enabled: activeTab === 'top-rated' && !searchQuery,
    initialPageParam: 1,
  });

  // Infinite query for now playing movies
  const {
    data: nowPlayingMoviesData,
    fetchNextPage: fetchNextNowPlaying,
    hasNextPage: hasNextNowPlaying,
    isFetchingNextPage: isFetchingNowPlaying,
    isLoading: loadingNowPlaying,
    error: nowPlayingError
  } = useInfiniteQuery({
    queryKey: ['movies', 'now-playing'],
    queryFn: ({ pageParam = 1 }) => movieService.getNowPlayingMovies(pageParam),
    getNextPageParam: (lastPage) => lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    enabled: activeTab === 'now-playing' && !searchQuery,
    initialPageParam: 1,
  });

  // Search query
  const {
    data: searchResultsData,
    fetchNextPage: fetchNextSearch,
    hasNextPage: hasNextSearch,
    isFetchingNextPage: isFetchingNextSearch,
    isLoading: loadingSearch,
    error: searchError
  } = useInfiniteQuery({
    queryKey: ['movies', 'search', searchQuery],
    queryFn: ({ pageParam = 1 }) => movieService.searchMovies(searchQuery, pageParam),
    getNextPageParam: (lastPage) => lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    enabled: !!searchQuery && searchQuery.length > 0,
    initialPageParam: 1,
  });

  // Get current data based on active tab and search
  const getCurrentData = () => {
    if (searchQuery) {
      return {
        data: searchResultsData,
        fetchNextPage: fetchNextSearch,
        hasNextPage: hasNextSearch,
        isFetchingNextPage: isFetchingNextSearch,
        isLoading: loadingSearch,
        error: searchError
      };
    }

    switch (activeTab) {
      case 'top-rated':
        return {
          data: topRatedMoviesData,
          fetchNextPage: fetchNextTopRated,
          hasNextPage: hasNextTopRated,
          isFetchingNextPage: isFetchingTopRated,
          isLoading: loadingTopRated,
          error: topRatedError
        };
      case 'now-playing':
        return {
          data: nowPlayingMoviesData,
          fetchNextPage: fetchNextNowPlaying,
          hasNextPage: hasNextNowPlaying,
          isFetchingNextPage: isFetchingNowPlaying,
          isLoading: loadingNowPlaying,
          error: nowPlayingError
        };
      default:
        return {
          data: popularMoviesData,
          fetchNextPage: fetchNextPopular,
          hasNextPage: hasNextPopular,
          isFetchingNextPage: isFetchingNextPopular,
          isLoading: loadingPopular,
          error: popularError
        };
    }
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error
  } = getCurrentData();

  // Flatten movies from all pages
  const movies = data?.pages.flatMap(page => page.results) || [];

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Auto-load more on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000
      ) {
        handleLoadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleLoadMore]);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Show loading state for initial load
  const showInitialLoading = isLoading && !data;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Discover Movies
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore the latest movies, top-rated classics, and hidden gems from around the world.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto">
          <SearchBar onSearch={handleSearch} loading={loadingSearch} />
        </div>

        {/* Tabs */}
        {!searchQuery && (
          <div className="flex justify-center">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-2xl">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="popular" className="text-base">Popular</TabsTrigger>
                <TabsTrigger value="top-rated" className="text-base">Top Rated</TabsTrigger>
                <TabsTrigger value="now-playing" className="text-base">Now Playing</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <div className="glass-card p-8 rounded-lg max-w-md mx-auto">
            <h3 className="text-xl font-semibold mb-2 text-destructive">Error Loading Movies</h3>
            <p className="text-muted-foreground mb-4">
              {error instanceof Error ? error.message : 'Something went wrong while loading movies.'}
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Movie Grid */}
      <div className="space-y-8">
        {showInitialLoading ? (
          <LoadingSkeleton.MovieGrid count={20} />
        ) : (
          <MovieGrid
            movies={movies}
            loading={false}
            onToggleFavorite={toggleFavorite}
            favorites={favoriteIds}
          />
        )}

        {/* Load More Button */}
        {hasNextPage && !searchQuery && !showInitialLoading && (
          <div className="text-center">
            <Button
              onClick={handleLoadMore}
              variant="outline"
              size="lg"
              className="glass-card"
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading More...
                </>
              ) : (
                'Load More Movies'
              )}
            </Button>
          </div>
        )}

        {/* Search Results Info */}
        {searchQuery && searchResultsData && !showInitialLoading && (
          <div className="text-center text-muted-foreground">
            Found {searchResultsData.pages[0]?.total_results || 0} movie{searchResultsData.pages[0]?.total_results !== 1 ? 's' : ''} for "{searchQuery}"
          </div>
        )}

        {/* Loading More Indicator */}
        {isFetchingNextPage && (
          <div className="text-center py-8">
            <div className="inline-flex items-center space-x-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading more movies...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
