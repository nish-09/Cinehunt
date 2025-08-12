'use client'

import { Movie } from '@/types/movie';
import { MovieCard } from './MovieCard';
import { LoadingSkeleton } from './LoadingSkeleton';

interface MovieGridProps {
  movies: Movie[];
  loading?: boolean;
  onToggleFavorite?: (movie: Movie) => void;
  favorites?: number[];
}

export const MovieGrid = ({ 
  movies, 
  loading = false,
  onToggleFavorite, 
  favorites = [] 
}: MovieGridProps) => {
  if (loading) {
    return <LoadingSkeleton.MovieGrid count={20} />;
  }

  if (movies.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="glass-card p-8 rounded-lg max-w-md mx-auto">
          <h3 className="text-xl font-semibold mb-2">No movies found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search criteria or browse popular movies.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          onToggleFavorite={onToggleFavorite}
          isFavorite={favorites.includes(movie.id)}
        />
      ))}
    </div>
  );
};
