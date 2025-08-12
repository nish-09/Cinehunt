export const LoadingSkeleton = {
  // Text skeletons
  Text: ({ className = "h-4", width = "w-full" }: { className?: string; width?: string }) => (
    <div className={`bg-muted rounded animate-pulse ${className} ${width}`} />
  ),
  
  // Avatar skeleton
  Avatar: ({ size = "h-10 w-10" }: { size?: string }) => (
    <div className={`bg-muted rounded-full animate-pulse ${size}`} />
  ),
  
  // Button skeleton
  Button: ({ className = "h-10 w-24" }: { className?: string }) => (
    <div className={`bg-muted rounded animate-pulse ${className}`} />
  ),
  
  // Card skeleton
  Card: ({ className = "h-48" }: { className?: string }) => (
    <div className={`bg-muted rounded-lg animate-pulse ${className}`} />
  ),
  
  // Movie card skeleton
  MovieCard: () => (
    <div className="movie-card animate-pulse">
      <div className="aspect-[2/3] bg-muted rounded-t-lg" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-1/2" />
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded w-full" />
          <div className="h-3 bg-muted rounded w-2/3" />
        </div>
      </div>
    </div>
  ),
  
  // Movie grid skeleton
  MovieGrid: ({ count = 20 }: { count?: number }) => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <LoadingSkeleton.MovieCard key={index} />
      ))}
    </div>
  ),
  
  // Movie detail skeleton
  MovieDetail: () => (
    <div className="space-y-8">
      {/* Title Skeleton */}
      <div className="space-y-4">
        <div className="h-12 bg-muted rounded animate-pulse w-3/4" />
        <div className="h-8 bg-muted rounded animate-pulse w-1/3" />
      </div>
      
      {/* Info Grid Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-2">
            <div className="h-5 w-5 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse w-16" />
          </div>
        ))}
      </div>
      
      {/* Genres Skeleton */}
      <div className="space-y-3">
        <div className="h-6 bg-muted rounded animate-pulse w-20" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 bg-muted rounded-full animate-pulse w-20" />
          ))}
        </div>
      </div>
      
      {/* Overview Skeleton */}
      <div className="space-y-3">
        <div className="h-6 bg-muted rounded animate-pulse w-24" />
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded animate-pulse w-full" />
          <div className="h-4 bg-muted rounded animate-pulse w-5/6" />
          <div className="h-4 bg-muted rounded animate-pulse w-4/6" />
        </div>
      </div>
      
      {/* Cast Skeleton */}
      <div className="space-y-3">
        <div className="h-6 bg-muted rounded animate-pulse w-16" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-20 bg-muted rounded animate-pulse" />
              <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
              <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
  
  // Search bar skeleton
  SearchBar: () => (
    <div className="relative">
      <div className="h-12 bg-muted rounded-lg animate-pulse w-full" />
    </div>
  ),
  
  // Tabs skeleton
  Tabs: () => (
    <div className="flex space-x-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-10 bg-muted rounded animate-pulse w-24" />
      ))}
    </div>
  ),
  
  // Spinner
  Spinner: ({ size = "h-8 w-8" }: { size?: string }) => (
    <div className={`animate-spin rounded-full border-b-2 border-primary ${size}`} />
  ),
  
  // Page loader
  PageLoader: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <LoadingSkeleton.Spinner size="h-16 w-16" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  ),
};
