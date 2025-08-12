'use client'

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { movieService } from '@/lib/omdb';
import { getImageUrl } from '@/lib/omdb';
import { Button } from '@/components/ui/button';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { useFavorites } from '@/hooks/useFavorites';
import { MovieDetails } from '@/types/movie';
import { 
  ArrowLeft, 
  Star, 
  Heart, 
  Calendar, 
  Clock, 
  Globe, 
  Users, 
  Film,
  Play,
  BookOpen
} from 'lucide-react';
import Image from 'next/image';

export default function MovieDetailPage() {
  const params = useParams();
  const router = useRouter();
  const movieId = parseInt(params.id as string);
  const { favorites, toggleFavorite } = useFavorites();
  const [imageError, setImageError] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);

  const { data: movie, isLoading, error } = useQuery({
    queryKey: ['movie', movieId],
    queryFn: () => movieService.getMovieDetails(movieId),
    enabled: !!movieId,
  });

  useEffect(() => {
    if (movie?.poster_path && movie.poster_path !== 'N/A') {
      setCurrentImageUrl(movie.poster_path);
      setImageError(false);
    } else {
      setCurrentImageUrl('/placeholder.svg');
      setImageError(true);
    }
  }, [movie?.poster_path]);

  const isFavorite = favorites.some(fav => fav.id === movieId);

  const handleFavoriteClick = () => {
    if (movie) {
      toggleFavorite(movie);
    }
  };

  const handleImageError = () => {
    setImageError(true);
    setCurrentImageUrl('/placeholder.svg');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <LoadingSkeleton.Button className="h-10 w-24" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="aspect-[2/3] bg-muted rounded-lg animate-pulse" />
              </div>
            </div>
            
            <div className="lg:col-span-2">
              <LoadingSkeleton.MovieDetail />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">Movie Not Found</h1>
          <p className="text-muted-foreground">The movie you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/')}>
            <ArrowLeft size={20} className="mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const formatRating = (rating: number) => {
    if (rating === 0) return 'N/A';
    return rating.toFixed(1);
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'text-green-500';
    if (rating >= 6) return 'text-yellow-500';
    if (rating >= 4) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="flex items-center space-x-2 text-foreground hover:text-foreground hover:bg-muted/50"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </Button>
        </div>

        <div className="container mx-auto px-4 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="relative aspect-[2/3] overflow-hidden rounded-lg shadow-2xl">
                  {!imageError && currentImageUrl && currentImageUrl !== '/placeholder.svg' ? (
                    <Image
                      src={currentImageUrl}
                      alt={movie.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="object-cover"
                      priority={true}
                      quality={90}
                      unoptimized={currentImageUrl.startsWith('http')}
                      onError={handleImageError}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                      <div className="text-center">
                        <Film size={64} className="text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground font-medium">No Poster</p>
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={handleFavoriteClick}
                    className={`absolute top-4 right-4 p-3 rounded-full transition-all duration-200 ${
                      isFavorite 
                        ? 'bg-red-500 text-white shadow-lg' 
                        : 'bg-black/30 text-white hover:bg-black/50 hover:scale-110'
                    } backdrop-blur-sm`}
                  >
                    <Heart size={20} className={isFavorite ? 'fill-current' : ''} />
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                  {movie.title}
                </h1>
                
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Star size={24} className="text-yellow-500 fill-current" />
                    <span className={`text-2xl font-bold ${getRatingColor(movie.vote_average)}`}>
                      {formatRating(movie.vote_average)}
                    </span>
                    {movie.vote_count > 0 && (
                      <span className="text-muted-foreground">
                        ({movie.vote_count.toLocaleString()} votes)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {movie.release_date && (
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Calendar size={18} />
                    <span>{new Date(movie.release_date).getFullYear()}</span>
                  </div>
                )}
                
                {movie.runtime > 0 && (
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Clock size={18} />
                    <span>{movie.runtime} min</span>
                  </div>
                )}
                
                {movie.original_language && (
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Globe size={18} />
                    <span>{movie.original_language.toUpperCase()}</span>
                  </div>
                )}
                
                {movie.adult && (
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Users size={18} />
                    <span>Rated R</span>
                  </div>
                )}
              </div>

              {movie.overview && (
                <div className="space-y-3">
                  <h2 className="text-xl font-semibold text-foreground flex items-center space-x-2">
                    <BookOpen size={20} />
                    <span>Overview</span>
                  </h2>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    {movie.overview}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3"
                >
                  <Play size={20} className="mr-2" />
                  Watch Trailer
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="px-8 py-3"
                  onClick={handleFavoriteClick}
                >
                  <Heart size={20} className={`mr-2 ${isFavorite ? 'fill-current text-red-500' : ''}`} />
                  {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
