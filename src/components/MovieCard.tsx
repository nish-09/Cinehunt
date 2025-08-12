'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Movie } from '@/types/movie';
import { getImageUrl } from '@/lib/omdb';
import { Button } from '@/components/ui/button';
import { Star, Heart, Film } from 'lucide-react';

interface MovieCardProps {
  movie: Movie;
  onToggleFavorite?: (movie: Movie) => void;
  isFavorite?: boolean;
}

export const MovieCard = ({ movie, onToggleFavorite, isFavorite = false }: MovieCardProps) => {
  const router = useRouter();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleClick = () => {
    router.push(`/movie/${movie.id}`);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite?.(movie);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  const renderPoster = () => {
    if (imageError || !movie.poster_path || movie.poster_path === 'N/A') {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
          <div className="text-center">
            <Film size={48} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-xs text-muted-foreground font-medium">No Poster</p>
          </div>
        </div>
      );
    }

    // Check if the URL is valid
    const imageUrl = getImageUrl(movie.poster_path);
    if (!imageUrl || imageUrl === '/placeholder.svg') {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
          <div className="text-center">
            <Film size={48} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-xs text-muted-foreground font-medium">No Poster</p>
          </div>
        </div>
      );
    }

    return (
      <>
        {!imageLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
        <Image
          src={imageUrl}
          alt={movie.title}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
          className={`object-cover transition-all duration-300 group-hover:scale-110 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={handleImageError}
          priority={false}
          quality={85}
          unoptimized={imageUrl.startsWith('http')} // Don't optimize external images
        />
      </>
    );
  };

  const formatRating = (rating: number) => {
    if (rating === 0) return 'N/A';
    return rating.toFixed(1);
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'text-green-500 bg-green-500/20 border-green-500/30';
    if (rating >= 6) return 'text-yellow-500 bg-yellow-500/20 border-yellow-500/30';
    if (rating >= 4) return 'text-orange-500 bg-orange-500/20 border-orange-500/30';
    return 'text-red-500 bg-red-500/20 border-red-500/30';
  };

  return (
    <div 
      className="movie-card cursor-pointer group animate-fade-in hover:shadow-xl transition-all duration-300"
      onClick={handleClick}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-t-lg">
        {renderPoster()}
        
        {/* Favorite button */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 ${
            isFavorite 
              ? 'bg-red-500 text-white shadow-lg' 
              : 'bg-black/30 text-white hover:bg-black/50 hover:scale-110'
          } backdrop-blur-sm z-10`}
        >
          <Heart size={16} className={isFavorite ? 'fill-current' : ''} />
        </button>



        {/* Year badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 bg-black/50 text-white text-xs font-medium rounded backdrop-blur-sm">
            {new Date(movie.release_date).getFullYear()}
          </span>
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors text-lg leading-tight">
          {movie.title}
        </h3>
        
        {/* Rating and votes */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Star size={14} className="text-yellow-500 fill-current" />
            <span className="text-sm font-medium text-foreground">
              {formatRating(movie.vote_average)}
            </span>
            {movie.vote_count > 0 && (
              <span className="text-xs text-muted-foreground">
                ({movie.vote_count.toLocaleString()})
              </span>
            )}
          </div>
        </div>
        
        {/* Overview */}
        {movie.overview && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {movie.overview}
          </p>
        )}
      </div>
    </div>
  );
};
