'use client'

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { MovieCard } from '@/components/MovieCard';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/hooks/useFavorites';
import { Movie, MovieDetails } from '@/types/movie';
import { movieService } from '@/lib/omdb';
import { Film, Heart, Loader2 } from 'lucide-react';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';

export default function FavoritesPage() {
  const { favoriteIds, toggleFavorite, isLoaded } = useFavorites();
  const [favoriteMovies, setFavoriteMovies] = useState<MovieDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Wait for favorites to be loaded from localStorage
    if (!isLoaded) return;

    const fetchFavoriteMovies = async () => {
      if (favoriteIds.length === 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const movies = await Promise.all(
          favoriteIds.map(async (id) => {
            try {
              return await movieService.getMovieDetails(id);
            } catch (err) {
              console.error(`Failed to fetch movie ${id}:`, err);
              return null;
            }
          })
        );

        const validMovies = movies.filter((movie): movie is MovieDetails => movie !== null);
        setFavoriteMovies(validMovies);
      } catch (err) {
        setError('Failed to load favorite movies');
        console.error('Error fetching favorite movies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavoriteMovies();
  }, [favoriteIds, isLoaded]);

  // Don't render anything until we're on the client side
  if (!isClient) {
    return null;
  }

  // Show loading while favorites are being loaded from localStorage
  if (!isLoaded) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center space-y-6 max-w-md mx-auto">
            <div className="glass-card p-8 rounded-lg">
              <div className="flex items-center justify-center mb-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Loading Favorites</h3>
              <p className="text-muted-foreground">
                Initializing your favorites...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleRemoveFavorite = (movie: Movie) => {
    const movieDetails = favoriteMovies.find(m => m.id === movie.id);
    if (movieDetails) {
      toggleFavorite(movieDetails);
      setFavoriteMovies(prev => prev.filter(m => m.id !== movie.id));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center space-y-6 max-w-md mx-auto">
            <div className="glass-card p-8 rounded-lg">
              <div className="flex items-center justify-center mb-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Loading Favorites</h3>
              <p className="text-muted-foreground">
                Fetching your favorite movies...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (favoriteIds.length === 0) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center space-y-6 max-w-md mx-auto">
            <div className="glass-card p-8 rounded-lg">
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">No Favorites Yet</h1>
              <p className="text-muted-foreground mb-6">
                Start building your collection by adding movies to your favorites while browsing.
              </p>
              <Button onClick={() => window.history.back()} size="lg">
                Start Browsing
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center space-y-6 max-w-md mx-auto">
            <div className="glass-card p-8 rounded-lg">
              <Film className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2 text-destructive">Error Loading Favorites</h1>
              <p className="text-muted-foreground mb-6">
                {error}
              </p>
              <Button onClick={() => window.location.reload()} size="lg" variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            My Favorites
          </h1>
          <p className="text-xl text-muted-foreground">
            Your personal collection of beloved movies
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {favoriteMovies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onToggleFavorite={handleRemoveFavorite}
              isFavorite={true}
            />
          ))}
        </div>

        {favoriteMovies.length > 0 && (
          <div className="text-center text-muted-foreground">
            {favoriteMovies.length} movie{favoriteMovies.length !== 1 ? 's' : ''} in your collection
          </div>
        )}
      </div>
    </div>
  );
}
