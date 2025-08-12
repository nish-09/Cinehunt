'use client'

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Movie, MovieDetails } from '@/types/movie';
import { movieService } from '@/lib/omdb';
import { getImageUrl } from '@/lib/omdb';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Star, ArrowLeft, Heart, Film, Calendar, Clock, Globe, Users } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';

export default function MovieDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toggleFavorite, favoriteIds } = useFavorites();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const movieId = parseInt(params.id as string);
  const isFavorite = favoriteIds.includes(movieId);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        setLoading(true);
        const movieDetails = await movieService.getMovieDetails(movieId);
        setMovie(movieDetails);
      } catch (err) {
        setError('Failed to load movie details');
        console.error('Error fetching movie details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (movieId) {
      fetchMovieDetails();
    }
  }, [movieId]);

  const handleBackClick = () => {
    router.back();
  };

  const handleFavoriteClick = () => {
    if (movie) {
      toggleFavorite(movie);
    }
  };

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

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen">
          <Header />
          <div className="container mx-auto px-4 py-8">
            {/* Back Button Skeleton */}
            <div className="mb-8">
              <LoadingSkeleton.Button className="h-10 w-24" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Poster Skeleton */}
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <div className="aspect-[2/3] bg-muted rounded-lg animate-pulse" />
                </div>
              </div>
              
              {/* Content Skeleton */}
              <div className="lg:col-span-2">
                <LoadingSkeleton.MovieDetail />
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !movie) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen">
          <Header />
          <div className="container mx-auto px-4 py-8">
            <div className="text-center space-y-6 max-w-md mx-auto">
              <div className="glass-card p-12 rounded-lg">
                <Film size={64} className="mx-auto text-muted-foreground mb-6" />
                <h1 className="text-3xl font-bold mb-4">Movie Not Found</h1>
                <p className="text-muted-foreground mb-6">
                  {error || 'The movie you are looking for could not be found.'}
                </p>
                <Button onClick={handleBackClick} size="lg">
                  Go Back
                </Button>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <Header />
        
        {/* Back Button */}
        <div className="container mx-auto px-4 py-6">
          <Button
            variant="ghost"
            onClick={handleBackClick}
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </Button>
        </div>

        <div className="container mx-auto px-4 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Poster Section */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="relative aspect-[2/3] overflow-hidden rounded-lg shadow-2xl">
                  {movie.poster_path && movie.poster_path !== 'N/A' ? (
                    (() => {
                      const imageUrl = getImageUrl(movie.poster_path);
                      if (!imageUrl || imageUrl === '/placeholder.svg') {
                        return (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                            <div className="text-center">
                              <Film size={64} className="text-muted-foreground mx-auto mb-4" />
                              <p className="text-muted-foreground font-medium">No Poster</p>
                            </div>
                          </div>
                        );
                      }
                      
                      return (
                        <Image
                          src={imageUrl}
                          alt={movie.title}
                          fill
                          sizes="(max-width: 1024px) 100vw, 33vw"
                          className="object-cover"
                          priority={true}
                          quality={90}
                          unoptimized={imageUrl.startsWith('http')}
                        />
                      );
                    })()
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                      <div className="text-center">
                        <Film size={64} className="text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground font-medium">No Poster</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Favorite Button */}
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

            {/* Content Section */}
            <div className="lg:col-span-2 space-y-8">
              {/* Title and Rating */}
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                  {movie.title}
                </h1>
                
                <div className="flex items-center space-x-6">
                  {/* Rating */}
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

              {/* Movie Info Grid */}
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
                  <div className="flex items-center space-x-2 text-red-500">
                    <Users size={18} />
                    <span>18+</span>
                  </div>
                )}
              </div>

              {/* Genres */}
              {movie.genres && movie.genres.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {movie.genres.map((genre) => (
                      <span
                        key={genre.id}
                        className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-sm font-medium"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Overview */}
              {movie.overview && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">Overview</h3>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    {movie.overview}
                  </p>
                </div>
              )}

              {/* Cast */}
              {movie.cast && movie.cast.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">Cast</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {movie.cast.slice(0, 9).map((actor) => (
                      <div key={actor.id} className="text-sm">
                        <p className="font-medium text-foreground">{actor.name}</p>
                        {actor.character && (
                          <p className="text-muted-foreground text-xs">as {actor.character}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Crew */}
              {movie.crew && movie.crew.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">Crew</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {movie.crew.slice(0, 6).map((member) => (
                      <div key={member.id} className="text-sm">
                        <p className="font-medium text-foreground">{member.name}</p>
                        <p className="text-muted-foreground text-xs">{member.job}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Info */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {movie.budget > 0 && (
                    <div>
                      <span className="text-muted-foreground">Budget: </span>
                      <span className="text-foreground">${movie.budget.toLocaleString()}</span>
                    </div>
                  )}
                  
                  {movie.revenue > 0 && (
                    <div>
                      <span className="text-muted-foreground">Revenue: </span>
                      <span className="text-foreground">${movie.revenue.toLocaleString()}</span>
                    </div>
                  )}
                  
                  {movie.status && (
                    <div>
                      <span className="text-muted-foreground">Status: </span>
                      <span className="text-foreground">{movie.status}</span>
                    </div>
                  )}
                  
                  {movie.tagline && (
                    <div className="md:col-span-2">
                      <span className="text-muted-foreground">Tagline: </span>
                      <span className="text-foreground italic">"{movie.tagline}"</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
