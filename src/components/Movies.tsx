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

  useEffect(() => {
    setSearchQuery('');
  }, [activeTab]);

  const popularQuery = useInfiniteQuery({
    queryKey: ['movies', 'popular'],
    queryFn: ({ pageParam = 1 }) => movieService.getPopularMovies(pageParam),
    getNextPageParam: (lastPage) => lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    enabled: true,
    initialPageParam: 1,
  });

  const topRatedQuery = useInfiniteQuery({
    queryKey: ['movies', 'top-rated'],
    queryFn: ({ pageParam = 1 }) => movieService.getTopRatedMovies(pageParam),
    getNextPageParam: (lastPage) => lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    enabled: activeTab === 'top-rated' && !searchQuery,
    initialPageParam: 1,
  });

  const nowPlayingQuery = useInfiniteQuery({
    queryKey: ['movies', 'now-playing'],
    queryFn: ({ pageParam = 1 }) => movieService.getNowPlayingMovies(pageParam),
    getNextPageParam: (lastPage) => lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    enabled: activeTab === 'now-playing' && !searchQuery,
    initialPageParam: 1,
  });

  const searchQueryResult = useInfiniteQuery({
    queryKey: ['movies', 'search', searchQuery],
    queryFn: ({ pageParam = 1 }) => movieService.searchMovies(searchQuery, pageParam),
    getNextPageParam: (lastPage) => lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    enabled: !!searchQuery && searchQuery.length > 0,
    initialPageParam: 1,
  });

  const getCurrentQuery = () => {
    if (searchQuery) {
      return searchQueryResult;
    }

    switch (activeTab) {
      case 'top-rated':
        return topRatedQuery;
      case 'now-playing':
        return nowPlayingQuery;
      default:
        return popularQuery;
    }
  };

  const currentQuery = getCurrentQuery();
  const movies = currentQuery.data?.pages.flatMap(page => page.results) || [];

  const handleLoadMore = useCallback(() => {
    if (!currentQuery.isFetchingNextPage && currentQuery.hasNextPage) {
      currentQuery.fetchNextPage();
    }
  }, [currentQuery]);

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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const showInitialLoading = currentQuery.isLoading && !currentQuery.data;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Discover Movies
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore the latest movies, top-rated classics, and hidden gems from around the world.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <SearchBar onSearch={handleSearch} loading={currentQuery.isLoading} />
        </div>

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

      {currentQuery.error && (
        <div className="text-center py-12">
          <div className="glass-card p-8 rounded-lg max-w-md mx-auto">
            <h3 className="text-xl font-semibold mb-2 text-destructive">Error Loading Movies</h3>
            <p className="text-muted-foreground mb-4">
              {currentQuery.error instanceof Error ? currentQuery.error.message : 'Something went wrong while loading movies.'}
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      )}

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

        {currentQuery.hasNextPage && !searchQuery && !showInitialLoading && (
          <div className="text-center">
            <Button
              onClick={handleLoadMore}
              variant="outline"
              size="lg"
              className="glass-card"
              disabled={currentQuery.isFetchingNextPage}
            >
              {currentQuery.isFetchingNextPage ? (
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

        {searchQuery && searchQueryResult.data && !showInitialLoading && (
          <div className="text-center text-muted-foreground">
            Found {searchQueryResult.data.pages[0]?.total_results || 0} movie{searchQueryResult.data.pages[0]?.total_results !== 1 ? 's' : ''} for "{searchQuery}"
          </div>
        )}

        {currentQuery.isFetchingNextPage && (
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
